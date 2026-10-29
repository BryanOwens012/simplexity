import type Anthropic from '@anthropic-ai/sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractCitations, INCOMPLETE_ANSWER_MESSAGE, REFUSAL_MESSAGE, toAnswerChunks, type AnswerChunk } from './answerStream';

type StreamEvent = Anthropic.RawMessageStreamEvent;

const textDelta = (text: string) =>
  ({ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text } }) as unknown as StreamEvent;
const thinkingDelta = (thinking: string) =>
  ({ type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking } }) as unknown as StreamEvent;
const stopWith = (stopReason: Anthropic.StopReason) =>
  ({ type: 'message_delta', delta: { stop_reason: stopReason, stop_sequence: null }, usage: {} }) as unknown as StreamEvent;
const MESSAGE_STOP = { type: 'message_stop' } as StreamEvent;

const collectChunks = async (events: StreamEvent[], sourceCount = 3): Promise<AnswerChunk[]> => {
  const chunks: AnswerChunk[] = [];
  for await (const chunk of toAnswerChunks((async function* () { yield* events; })(), sourceCount)) {
    chunks.push(chunk);
  }
  return chunks;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('toAnswerChunks', () => {
  it('streams text, skips thinking, then sends citations and done', async () => {
    const chunks = await collectChunks([thinkingDelta('hmm'), textDelta('Paris [1]'), textDelta(' is big [2].'), stopWith('end_turn'), MESSAGE_STOP]);
    expect(chunks).toEqual([
      { type: 'text', data: 'Paris [1]' },
      { type: 'text', data: ' is big [2].' },
      {
        type: 'citations',
        data: [
          { number: 1, sourceIndex: 0, text: '[1]' },
          { number: 2, sourceIndex: 1, text: '[2]' },
        ],
      },
      { type: 'done' },
    ]);
  });

  it('sends the refusal message when Claude refuses before writing anything', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chunks = await collectChunks([stopWith('refusal'), MESSAGE_STOP]);
    expect(chunks).toEqual([{ type: 'text', data: REFUSAL_MESSAGE }, { type: 'citations', data: [] }, { type: 'done' }]);
  });

  it('appends the refusal message after partial text', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chunks = await collectChunks([textDelta('Partial'), stopWith('refusal'), MESSAGE_STOP]);
    expect(chunks.slice(0, 2)).toEqual([
      { type: 'text', data: 'Partial' },
      { type: 'text', data: `\n\n${REFUSAL_MESSAGE}` },
    ]);
  });

  it('tells the user when thinking used the whole token budget', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chunks = await collectChunks([thinkingDelta('long thought'), stopWith('max_tokens'), MESSAGE_STOP]);
    expect(chunks[0]).toEqual({ type: 'text', data: INCOMPLETE_ANSWER_MESSAGE });
  });

  it('adds nothing for a normal stop', async () => {
    const chunks = await collectChunks([textDelta('Done.'), stopWith('end_turn'), MESSAGE_STOP]);
    expect(chunks.filter((chunk) => chunk.type === 'text')).toEqual([{ type: 'text', data: 'Done.' }]);
  });

  it('ends without citations when the stream stops early', async () => {
    const chunks = await collectChunks([textDelta('Cut')]);
    expect(chunks).toEqual([{ type: 'text', data: 'Cut' }]);
  });
});

describe('extractCitations', () => {
  it('dedupes by number and maps out-of-range numbers to the first source', () => {
    expect(extractCitations('[2] then [9] then [2] and [0]', 3)).toEqual([
      { number: 2, sourceIndex: 1, text: '[2]' },
      { number: 9, sourceIndex: 0, text: '[9]' },
      { number: 0, sourceIndex: 0, text: '[0]' },
    ]);
  });

  it('returns nothing when there are no citations', () => {
    expect(extractCitations('no sources here', 3)).toEqual([]);
  });
});
