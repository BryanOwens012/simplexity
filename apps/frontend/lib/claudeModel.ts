import Anthropic from '@anthropic-ai/sdk';
import type { ModelInfo } from '@anthropic-ai/sdk/resources/models';

const HAIKU_ID_PREFIX = 'claude-haiku-';

export type HaikuModel = {
  id: string;
  canUseLowEffort: boolean;
};

/**
 * Pick the Haiku most likely to be cheapest from the models the API reports as available.
 *
 * The Models API returns no prices, so this is a heuristic: the newest Haiku by release
 * date. Anthropic retires old Haikus, and the newest one (Haiku 5.5, $0.10/$0.50 per MTok)
 * is a tenth of the price of the one before it.
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
    canUseLowEffort: newest.capabilities?.effort.low.supported ?? false,
  };
};

// Shared by every request in this server instance; cleared when a lookup fails or the model is retired
let haikuModelPromise: Promise<HaikuModel> | null = null;

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
  return haiku;
};

export const getCheapestHaiku = (client: Anthropic): Promise<HaikuModel> => {
  if (!haikuModelPromise) {
    haikuModelPromise = fetchCheapestHaiku(client).catch((error: unknown) => {
      haikuModelPromise = null;
      throw error;
    });
  }
  return haikuModelPromise;
};

export const resetCheapestHaiku = () => {
  haikuModelPromise = null;
};

type HaikuMessageParams = Omit<Anthropic.MessageCreateParams, 'model' | 'output_config'>;

/**
 * Build the request for the given Haiku, asking for low effort only where the model supports it.
 */
export const buildHaikuParams = <P extends HaikuMessageParams>(haiku: HaikuModel, params: P) => ({
  ...params,
  model: haiku.id,
  ...(haiku.canUseLowEffort ? { output_config: { effort: 'low' as const } } : {}),
});

/**
 * Run a request on the cheapest Haiku, re-selecting once if the chosen model has been retired.
 */
export const withCheapestHaiku = async <T>(
  client: Anthropic,
  run: (haiku: HaikuModel) => Promise<T>
): Promise<T> => {
  const haiku = await getCheapestHaiku(client);
  try {
    return await run(haiku);
  } catch (error) {
    if (!(error instanceof Anthropic.NotFoundError)) {
      throw error;
    }
    console.warn(`Claude model ${haiku.id} not found; selecting another`);
    resetCheapestHaiku();
    return run(await getCheapestHaiku(client));
  }
};
