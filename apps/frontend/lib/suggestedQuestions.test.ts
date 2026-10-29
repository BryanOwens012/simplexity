import type Anthropic from '@anthropic-ai/sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_SUGGESTED_QUESTIONS, parseSuggestedQuestions } from './suggestedQuestions';

const thinkingBlock = { type: 'thinking', thinking: '', signature: 'sig' };
const textBlock = (text: string) => ({ type: 'text', text, citations: null });

const makeReply = (content: object[], stopReason: Anthropic.StopReason = 'end_turn') =>
  ({ content, stop_reason: stopReason }) as unknown as Anthropic.Message;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseSuggestedQuestions', () => {
  it('reads the questions after a leading thinking block', () => {
    const reply = makeReply([thinkingBlock, textBlock('What is X?\nWhy does Y happen?')]);
    expect(parseSuggestedQuestions(reply)).toEqual(['What is X?', 'Why does Y happen?']);
  });

  it('drops blank lines and lines that are not questions', () => {
    const reply = makeReply([textBlock('  Here are some:\n\n  How does Z work?  \n- not a question')]);
    expect(parseSuggestedQuestions(reply)).toEqual(['How does Z work?']);
  });

  it('keeps at most the maximum number of questions', () => {
    const lines = Array.from({ length: MAX_SUGGESTED_QUESTIONS + 3 }, (_, i) => `Question ${i}?`);
    expect(parseSuggestedQuestions(makeReply([textBlock(lines.join('\n'))]))).toHaveLength(MAX_SUGGESTED_QUESTIONS);
  });

  it('returns no questions and warns when thinking used the whole budget', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parseSuggestedQuestions(makeReply([thinkingBlock], 'max_tokens'))).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('returns no questions for a reply with no text, such as a refusal', () => {
    expect(parseSuggestedQuestions(makeReply([], 'refusal'))).toEqual([]);
  });
});
