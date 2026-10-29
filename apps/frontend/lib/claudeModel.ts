import Anthropic from '@anthropic-ai/sdk';
import type { ModelInfo } from '@anthropic-ai/sdk/resources/models';

const HAIKU_ID_PREFIX = 'claude-haiku-';

// How long one model choice is trusted before the model list is read again, so a long-lived
// server instance moves to a newly released Haiku without a restart
export const HAIKU_REFRESH_MS = 60 * 60 * 1000;
// After a failed model-list call, how long the last good choice is used before listing again
export const HAIKU_RETRY_MS = 60 * 1000;

export type HaikuModel = {
  id: string;
  canUseLowEffort: boolean;
};

/**
 * Pick the Haiku most likely to be cheapest from the models the API reports as available.
 *
 * The Models API returns no prices, so this is a heuristic: the newest Haiku by release date.
 * Anthropic retires old Haikus, and the newest one has been the cheapest; a future Haiku launched
 * at a higher price would still be picked. Prices: https://www.anthropic.com/pricing
 */
export const selectCheapestHaiku = (models: ModelInfo[]): HaikuModel | null => {
  const haikus = models
    .filter((model) => model.id.startsWith(HAIKU_ID_PREFIX))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id));

  const newest = haikus[0];
  if (!newest) {
    return null;
  }

  return {
    id: newest.id,
    // Older models can report a sparser capability tree, so guard every level
    canUseLowEffort: newest.capabilities?.effort?.low?.supported ?? false,
  };
};

type CachedChoice = {
  promise: Promise<HaikuModel>;
  fetchedAt: number;
  ttlMs: number;
  // Set once the lookup resolves, so a retired model is only forgotten if it is still the cached one
  id?: string;
};

// Shared by every request in this server instance
let cachedChoice: CachedChoice | null = null;
// Used when the model list cannot be read, so a Models API outage does not fail every answer
let lastGoodHaiku: HaikuModel | null = null;

const fetchCheapestHaiku = async (client: Anthropic): Promise<HaikuModel> => {
  const models: ModelInfo[] = [];
  for await (const model of client.models.list()) {
    models.push(model);
  }

  const haiku = selectCheapestHaiku(models);
  if (!haiku) {
    throw new Error(`No available Anthropic model starts with "${HAIKU_ID_PREFIX}"`);
  }

  console.log(`Using Claude model: ${haiku.id}`);
  lastGoodHaiku = haiku;
  return haiku;
};

export const getCheapestHaiku = (client: Anthropic, now = Date.now()): Promise<HaikuModel> => {
  if (cachedChoice && now - cachedChoice.fetchedAt < cachedChoice.ttlMs) {
    return cachedChoice.promise;
  }

  const choice: CachedChoice = {
    fetchedAt: now,
    ttlMs: HAIKU_REFRESH_MS,
    promise: fetchCheapestHaiku(client).then(
      (haiku) => {
        choice.id = haiku.id;
        return haiku;
      },
      (error: unknown) => {
        const fallback = lastGoodHaiku;
        if (cachedChoice === choice) {
          // Back off briefly with the last good choice rather than re-listing on every request
          cachedChoice = fallback
            ? { promise: Promise.resolve(fallback), fetchedAt: now, ttlMs: HAIKU_RETRY_MS, id: fallback.id }
            : null;
        }
        if (fallback) {
          console.warn(`Could not list Claude models; keeping ${fallback.id}`, error);
          return fallback;
        }
        throw error;
      }
    ),
  };
  cachedChoice = choice;
  return choice.promise;
};

const forgetHaiku = (id: string) => {
  if (lastGoodHaiku?.id === id) {
    lastGoodHaiku = null;
  }
  // A choice made since (by another request that hit the same 404) is kept
  if (cachedChoice?.id === id) {
    cachedChoice = null;
  }
};

// Clears all module state; used by tests
export const resetCheapestHaiku = () => {
  cachedChoice = null;
  lastGoodHaiku = null;
};

/**
 * Run a request on the cheapest Haiku, re-selecting once if the chosen model has been retired.
 */
const withCheapestHaiku = async <T>(client: Anthropic, run: (haiku: HaikuModel) => Promise<T>): Promise<T> => {
  const haiku = await getCheapestHaiku(client);
  try {
    return await run(haiku);
  } catch (error) {
    if (!(error instanceof Anthropic.NotFoundError)) {
      throw error;
    }
    console.warn(`Claude model ${haiku.id} not found; selecting another`);
    forgetHaiku(haiku.id);
    return run(await getCheapestHaiku(client));
  }
};

// Low effort keeps Haiku's (on by default) thinking short; sent only where the model supports it
const getHaikuRequestFields = (haiku: HaikuModel) => ({
  model: haiku.id,
  ...(haiku.canUseLowEffort ? { output_config: { effort: 'low' as const } } : {}),
});

type HaikuParams<P> = Omit<P, 'model' | 'output_config'>;

export const createHaikuMessage = (client: Anthropic, params: HaikuParams<Anthropic.MessageCreateParamsNonStreaming>) =>
  withCheapestHaiku(client, (haiku) => client.messages.create({ ...params, ...getHaikuRequestFields(haiku) }));

export const streamHaikuMessage = (client: Anthropic, params: HaikuParams<Anthropic.MessageCreateParamsStreaming>) =>
  withCheapestHaiku(client, (haiku) => client.messages.create({ ...params, ...getHaikuRequestFields(haiku) }));
