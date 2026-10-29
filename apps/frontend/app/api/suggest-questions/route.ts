import Anthropic from '@anthropic-ai/sdk';
import type { Message } from '@/lib/types';
import { createHaikuMessage } from '@/lib/claudeModel';
import { parseSuggestedQuestions } from '@/lib/suggestedQuestions';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const POST = async (req: Request) => {
  try {
    const { currentQuery, currentAnswer, conversationHistory } = await req.json() as {
      currentQuery: string;
      currentAnswer: string;
      conversationHistory: Message[];
    };

    // Build prompt for question generation
    const conversationContext = conversationHistory
      .slice(-4) // Last 2 Q&A pairs
      .map((msg) => `${msg.type === 'query' ? 'Q' : 'A'}: ${msg.content}`)
      .join('\n\n');

    const prompt = `Based on this conversation, suggest 3-5 natural follow-up questions a curious user might ask next.

Conversation history:
${conversationContext}

Current question: ${currentQuery}
Current answer: ${currentAnswer}

Generate questions that:
- Go deeper into interesting aspects mentioned in the answer
- Explore related angles not yet covered
- Are specific and actionable (not vague like "tell me more")
- Feel natural as follow-ups to this conversation
- Are phrased as complete questions (not fragments)

Return ONLY the questions, one per line, without numbering, bullets, or any other formatting.`;

    // Generate questions using Claude
    const response = await createHaikuMessage(anthropic, {
      // Thinking counts toward this cap, so leave room beyond the questions themselves
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const questions = parseSuggestedQuestions(response);

    return Response.json({ questions });
  } catch (error) {
    console.error('Error generating suggested questions:', error);
    return Response.json({ questions: [] }, { status: 500 });
  }
};
