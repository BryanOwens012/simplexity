import type Anthropic from '@anthropic-ai/sdk';
import type { Citation } from './types';

export const REFUSAL_MESSAGE = "I can't help with that request.";
export const INCOMPLETE_ANSWER_MESSAGE = "I couldn't finish this answer. Please try asking again.";

export type AnswerChunk =
  | { type: 'text'; data: string }
  | { type: 'citations'; data: Citation[] }
  | { type: 'done' };

// Stops that would otherwise leave the user with an empty or silently cut-off answer
const STOP_NOTICES: Partial<Record<Anthropic.StopReason, string>> = {
  refusal: REFUSAL_MESSAGE,
  max_tokens: INCOMPLETE_ANSWER_MESSAGE,
};

export const extractCitations = (text: string, sourceCount: number): Citation[] => {
  const citations = [...text.matchAll(/\[(\d+)\]/g)].map((match) => {
    const number = parseInt(match[1], 10);
    const sourceIndex = number - 1;
    return {
      number,
      sourceIndex: sourceIndex >= 0 && sourceIndex < sourceCount ? sourceIndex : 0,
      text: match[0],
    };
  });

  return citations.filter((citation, index) => index === citations.findIndex((c) => c.number === citation.number));
};

/**
 * Turn Claude's stream events into the chunks the answer UI reads: text as it arrives (thinking is
 * skipped), a notice if Claude refused, ran out of tokens or the stream ended early, then citations and done.
 */
export const toAnswerChunks = async function* (
  events: AsyncIterable<Anthropic.RawMessageStreamEvent>,
  sourceCount: number
): AsyncGenerator<AnswerChunk> {
  let fullText = '';
  const toNotice = (notice: string): AnswerChunk => ({ type: 'text', data: fullText.length === 0 ? notice : `\n\n${notice}` });

  for await (const event of events) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullText += event.delta.text;
      yield { type: 'text', data: event.delta.text };
    } else if (event.type === 'message_delta' && event.delta.stop_reason) {
      const notice = STOP_NOTICES[event.delta.stop_reason];
      if (notice) {
        console.warn(`Claude stopped with ${event.delta.stop_reason} after ${fullText.length} characters of answer`);
        yield toNotice(notice);
      }
    } else if (event.type === 'message_stop') {
      yield { type: 'citations', data: extractCitations(fullText, sourceCount) };
      yield { type: 'done' };
      return;
    }
  }

  // The stream ended without message_stop, so the answer may be cut off
  console.warn(`Claude's stream ended early after ${fullText.length} characters of answer`);
  yield toNotice(INCOMPLETE_ANSWER_MESSAGE);
  yield { type: 'citations', data: extractCitations(fullText, sourceCount) };
  yield { type: 'done' };
};
