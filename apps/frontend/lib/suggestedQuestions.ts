import type Anthropic from '@anthropic-ai/sdk';

export const MAX_SUGGESTED_QUESTIONS = 5;

/**
 * Read the follow-up questions out of Claude's reply. Thinking blocks can precede the text,
 * so text is read by block type, never by position.
 */
export const parseSuggestedQuestions = (message: Pick<Anthropic.Message, 'content' | 'stop_reason'>): string[] => {
  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  if (text.length === 0 && message.stop_reason === 'max_tokens') {
    console.warn('Claude ran out of tokens before suggesting any questions');
  }

  return text
    .split('\n')
    .map((question) => question.trim())
    .filter((question) => question.length > 0 && question.endsWith('?'))
    .slice(0, MAX_SUGGESTED_QUESTIONS);
};
