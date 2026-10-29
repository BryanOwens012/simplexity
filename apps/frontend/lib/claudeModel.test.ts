import Anthropic from '@anthropic-ai/sdk';
import type { ModelInfo } from '@anthropic-ai/sdk/resources/models';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createHaikuMessage,
  getCheapestHaiku,
  HAIKU_REFRESH_MS,
  resetCheapestHaiku,
  selectCheapestHaiku,
  streamHaikuMessage,
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
const WITHOUT_NEWEST_HAIKU = AVAILABLE_MODELS.filter((model) => model.id !== 'claude-haiku-5-5');

const MESSAGE_PARAMS = { max_tokens: 10, messages: [{ role: 'user' as const, content: 'hi' }] };

const makeNotFoundError = () => new Anthropic.NotFoundError(404, { type: 'error' }, 'model not found', new Headers());

type ListOutcome = ModelInfo[] | Error;

// Stands in for the SDK client: each models.list() call consumes the next outcome (the last one repeats),
// and messages.create() records its params and runs the given behavior
const makeClient = (listOutcomes: ListOutcome[], create: (params: { model: string }) => Promise<unknown> = async () => 'ok') => {
  const outcomes = [...listOutcomes];
  const list = vi.fn(() => {
    const outcome = outcomes.length > 1 ? outcomes.shift()! : outcomes[0];
    return (async function* () {
      if (outcome instanceof Error) {
        throw outcome;
      }
      yield* outcome;
    })();
  });
  const createMessage = vi.fn(create);
  const client = { models: { list }, messages: { create: createMessage } } as unknown as Anthropic;
  return { client, list, createMessage };
};

afterEach(() => {
  resetCheapestHaiku();
  vi.restoreAllMocks();
});

describe('selectCheapestHaiku', () => {
  it('picks the newest Haiku and ignores other tiers', () => {
    expect(selectCheapestHaiku(AVAILABLE_MODELS)).toEqual({ id: 'claude-haiku-5-5', canUseLowEffort: true });
  });

  it('falls back to an older Haiku when the newest is retired', () => {
    expect(selectCheapestHaiku(WITHOUT_NEWEST_HAIKU)).toEqual({ id: 'claude-haiku-4-5-20251001', canUseLowEffort: false });
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

  it('treats missing or sparse capabilities as no low-effort support', () => {
    const base = makeModel('claude-haiku-5-5', '2026-08-01T00:00:00Z');
    for (const capabilities of [null, {}, { effort: {} }]) {
      expect(selectCheapestHaiku([{ ...base, capabilities } as unknown as ModelInfo])).toEqual({
        id: 'claude-haiku-5-5',
        canUseLowEffort: false,
      });
    }
  });

  it('returns null when no Haiku is available', () => {
    expect(selectCheapestHaiku([makeModel('claude-sonnet-5-5', '2026-09-01T00:00:00Z')])).toBeNull();
    expect(selectCheapestHaiku([])).toBeNull();
  });
});

describe('getCheapestHaiku', () => {
  it('lists models once and shares the result across concurrent callers', async () => {
    const { client, list } = makeClient([AVAILABLE_MODELS]);
    const [first, second] = await Promise.all([getCheapestHaiku(client), getCheapestHaiku(client)]);
    expect(first.id).toBe('claude-haiku-5-5');
    expect(second).toBe(first);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('lists models again once the choice is older than the refresh interval', async () => {
    const releasedLater = [...AVAILABLE_MODELS, makeModel('claude-haiku-6', '2027-03-01T00:00:00Z')];
    const { client, list } = makeClient([AVAILABLE_MODELS, releasedLater]);

    await expect(getCheapestHaiku(client, 0)).resolves.toMatchObject({ id: 'claude-haiku-5-5' });
    await expect(getCheapestHaiku(client, HAIKU_REFRESH_MS - 1)).resolves.toMatchObject({ id: 'claude-haiku-5-5' });
    expect(list).toHaveBeenCalledTimes(1);

    await expect(getCheapestHaiku(client, HAIKU_REFRESH_MS)).resolves.toMatchObject({ id: 'claude-haiku-6' });
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('keeps the last good choice when the model list cannot be read', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { client, list } = makeClient([AVAILABLE_MODELS, new Error('overloaded'), AVAILABLE_MODELS]);

    await getCheapestHaiku(client, 0);
    await expect(getCheapestHaiku(client, HAIKU_REFRESH_MS)).resolves.toMatchObject({ id: 'claude-haiku-5-5' });
    // The failed refresh is not cached, so the next request lists again
    await getCheapestHaiku(client, HAIKU_REFRESH_MS);
    expect(list).toHaveBeenCalledTimes(3);
  });

  it('rejects when the list fails and there is no earlier choice, and does not cache the failure', async () => {
    const { client, list } = makeClient([new Error('overloaded'), AVAILABLE_MODELS]);
    await expect(getCheapestHaiku(client)).rejects.toThrow('overloaded');
    await expect(getCheapestHaiku(client)).resolves.toMatchObject({ id: 'claude-haiku-5-5' });
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('rejects when no Haiku is listed', async () => {
    const { client } = makeClient([[makeModel('claude-sonnet-5-5', '2026-09-01T00:00:00Z')]]);
    await expect(getCheapestHaiku(client)).rejects.toThrow('claude-haiku-');
  });
});

describe('createHaikuMessage', () => {
  it('sends the chosen Haiku with low effort when the model supports it', async () => {
    const { client, createMessage } = makeClient([AVAILABLE_MODELS]);
    await createHaikuMessage(client, MESSAGE_PARAMS);
    expect(createMessage).toHaveBeenCalledWith({ ...MESSAGE_PARAMS, model: 'claude-haiku-5-5', output_config: { effort: 'low' } });
  });

  it('omits effort when the model does not support it', async () => {
    const { client, createMessage } = makeClient([WITHOUT_NEWEST_HAIKU]);
    await createHaikuMessage(client, MESSAGE_PARAMS);
    expect(createMessage).toHaveBeenCalledWith({ ...MESSAGE_PARAMS, model: 'claude-haiku-4-5-20251001' });
  });

  it('re-selects once and retries when the chosen model is retired', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { client, createMessage } = makeClient([AVAILABLE_MODELS, WITHOUT_NEWEST_HAIKU], async ({ model }) => {
      if (model === 'claude-haiku-5-5') {
        throw makeNotFoundError();
      }
      return `ok:${model}`;
    });

    await expect(createHaikuMessage(client, MESSAGE_PARAMS)).resolves.toBe('ok:claude-haiku-4-5-20251001');
    expect(createMessage.mock.calls.map(([params]) => params.model)).toEqual(['claude-haiku-5-5', 'claude-haiku-4-5-20251001']);
  });

  it('does not fall back to the retired model when the re-selection list fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { client, createMessage } = makeClient([AVAILABLE_MODELS, new Error('overloaded')], async () => {
      throw makeNotFoundError();
    });

    await expect(createHaikuMessage(client, MESSAGE_PARAMS)).rejects.toThrow('overloaded');
    expect(createMessage).toHaveBeenCalledTimes(1);
  });

  it('keeps a newer choice made by a concurrent request that hit the same retirement', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { client, list } = makeClient([AVAILABLE_MODELS, WITHOUT_NEWEST_HAIKU], async ({ model }) => {
      if (model === 'claude-haiku-5-5') {
        throw makeNotFoundError();
      }
      return 'ok';
    });

    await Promise.all([createHaikuMessage(client, MESSAGE_PARAMS), createHaikuMessage(client, MESSAGE_PARAMS)]);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('retries only once', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { client, createMessage } = makeClient([AVAILABLE_MODELS], async () => {
      throw makeNotFoundError();
    });

    await expect(createHaikuMessage(client, MESSAGE_PARAMS)).rejects.toBeInstanceOf(Anthropic.NotFoundError);
    expect(createMessage).toHaveBeenCalledTimes(2);
  });

  it('does not retry other errors', async () => {
    const { client, createMessage } = makeClient([AVAILABLE_MODELS], async () => {
      throw new Error('boom');
    });

    await expect(createHaikuMessage(client, MESSAGE_PARAMS)).rejects.toThrow('boom');
    expect(createMessage).toHaveBeenCalledTimes(1);
  });
});

describe('streamHaikuMessage', () => {
  it('sends the chosen Haiku and keeps the stream flag', async () => {
    const { client, createMessage } = makeClient([AVAILABLE_MODELS]);
    await streamHaikuMessage(client, { ...MESSAGE_PARAMS, stream: true });
    expect(createMessage).toHaveBeenCalledWith({
      ...MESSAGE_PARAMS,
      stream: true,
      model: 'claude-haiku-5-5',
      output_config: { effort: 'low' },
    });
  });
});
