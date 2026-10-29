import Anthropic from '@anthropic-ai/sdk';
import type { ModelInfo } from '@anthropic-ai/sdk/resources/models';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildHaikuParams,
  getCheapestHaiku,
  resetCheapestHaiku,
  selectCheapestHaiku,
  withCheapestHaiku,
} from './claudeModel';

const makeModel = (id: string, createdAt: string, canUseLowEffort = true): ModelInfo =>
  ({
    id,
    created_at: createdAt,
    display_name: id,
    capabilities: { effort: { low: { supported: canUseLowEffort } } },
  }) as unknown as ModelInfo;

const AVAILABLE_MODELS = [
  makeModel('claude-opus-5-5', '2026-09-01T00:00:00Z'),
  makeModel('claude-sonnet-5-5', '2026-09-01T00:00:00Z'),
  makeModel('claude-haiku-4-5-20251001', '2025-10-01T00:00:00Z', false),
  makeModel('claude-haiku-5-5', '2026-08-01T00:00:00Z'),
];

const makeNotFoundError = () =>
  new Anthropic.NotFoundError(404, { type: 'error' }, 'model not found', new Headers());

// Stands in for the SDK client: models.list() is an async iterable of ModelInfo
const makeClient = (...modelLists: ModelInfo[][]) => {
  const list = vi.fn(() => {
    const models = modelLists.length > 1 ? modelLists.shift()! : modelLists[0];
    return (async function* () {
      yield* models;
    })();
  });
  return { client: { models: { list } } as unknown as Anthropic, list };
};

afterEach(() => {
  resetCheapestHaiku();
});

describe('selectCheapestHaiku', () => {
  it('picks the newest Haiku and ignores other tiers', () => {
    expect(selectCheapestHaiku(AVAILABLE_MODELS)).toEqual({ id: 'claude-haiku-5-5', canUseLowEffort: true });
  });

  it('falls back to an older Haiku when the newest is retired', () => {
    const remaining = AVAILABLE_MODELS.filter((model) => model.id !== 'claude-haiku-5-5');
    expect(selectCheapestHaiku(remaining)).toEqual({ id: 'claude-haiku-4-5-20251001', canUseLowEffort: false });
  });

  it('moves to a newly released Haiku', () => {
    const models = [...AVAILABLE_MODELS, makeModel('claude-haiku-6', '2027-03-01T00:00:00Z')];
    expect(selectCheapestHaiku(models)?.id).toBe('claude-haiku-6');
  });

  it('breaks release-date ties deterministically by id', () => {
    const models = [makeModel('claude-haiku-5-5', '2026-08-01T00:00:00Z'), makeModel('claude-haiku-5-5-x', '2026-08-01T00:00:00Z')];
    expect(selectCheapestHaiku(models)?.id).toBe('claude-haiku-5-5');
    expect(selectCheapestHaiku([...models].reverse())?.id).toBe('claude-haiku-5-5');
  });

  it('treats missing capabilities as no low-effort support', () => {
    const model = { ...makeModel('claude-haiku-5-5', '2026-08-01T00:00:00Z'), capabilities: null } as ModelInfo;
    expect(selectCheapestHaiku([model])).toEqual({ id: 'claude-haiku-5-5', canUseLowEffort: false });
  });

  it('returns null when no Haiku is available', () => {
    expect(selectCheapestHaiku([makeModel('claude-sonnet-5-5', '2026-09-01T00:00:00Z')])).toBeNull();
    expect(selectCheapestHaiku([])).toBeNull();
  });
});

describe('buildHaikuParams', () => {
  const params = { max_tokens: 10, messages: [{ role: 'user' as const, content: 'hi' }] };

  it('asks for low effort when the model supports it', () => {
    expect(buildHaikuParams({ id: 'claude-haiku-5-5', canUseLowEffort: true }, params)).toEqual({
      ...params,
      model: 'claude-haiku-5-5',
      output_config: { effort: 'low' },
    });
  });

  it('omits effort when the model does not support it', () => {
    expect(buildHaikuParams({ id: 'claude-haiku-4-5', canUseLowEffort: false }, params)).toEqual({
      ...params,
      model: 'claude-haiku-4-5',
    });
  });
});

describe('getCheapestHaiku', () => {
  it('lists models once and shares the result across concurrent callers', async () => {
    const { client, list } = makeClient(AVAILABLE_MODELS);
    const [first, second] = await Promise.all([getCheapestHaiku(client), getCheapestHaiku(client)]);
    expect(first.id).toBe('claude-haiku-5-5');
    expect(second).toBe(first);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failed lookup', async () => {
    const { client, list } = makeClient([makeModel('claude-sonnet-5-5', '2026-09-01T00:00:00Z')], AVAILABLE_MODELS);
    await expect(getCheapestHaiku(client)).rejects.toThrow('claude-haiku-');
    await expect(getCheapestHaiku(client)).resolves.toMatchObject({ id: 'claude-haiku-5-5' });
    expect(list).toHaveBeenCalledTimes(2);
  });
});

describe('withCheapestHaiku', () => {
  it('re-selects once and retries when the chosen model is retired', async () => {
    const remaining = AVAILABLE_MODELS.filter((model) => model.id !== 'claude-haiku-5-5');
    const { client } = makeClient(AVAILABLE_MODELS, remaining);
    const run = vi.fn(async ({ id }: { id: string }) => {
      if (id === 'claude-haiku-5-5') {
        throw makeNotFoundError();
      }
      return `ok:${id}`;
    });

    await expect(withCheapestHaiku(client, run)).resolves.toBe('ok:claude-haiku-4-5-20251001');
    expect(run.mock.calls.map(([haiku]) => haiku.id)).toEqual(['claude-haiku-5-5', 'claude-haiku-4-5-20251001']);
  });

  it('retries only once', async () => {
    const { client } = makeClient(AVAILABLE_MODELS);
    const run = vi.fn(async () => {
      throw makeNotFoundError();
    });

    await expect(withCheapestHaiku(client, run)).rejects.toBeInstanceOf(Anthropic.NotFoundError);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not retry other errors', async () => {
    const { client } = makeClient(AVAILABLE_MODELS);
    const run = vi.fn(async () => {
      throw new Error('boom');
    });

    await expect(withCheapestHaiku(client, run)).rejects.toThrow('boom');
    expect(run).toHaveBeenCalledTimes(1);
  });
});
