'use client';

import { useMemo } from 'react';
import type { SearchResult } from '@/lib/types';

interface AnswerDisplayProps {
  answer: string;
  sources?: SearchResult[];
}

export const AnswerDisplay = ({ answer, sources = [] }: AnswerDisplayProps) => {
  // Parse the answer to identify citations and create clickable links
  const formattedAnswer = useMemo(() => {
    // Split by citation pattern [1], [2], etc.
    const parts = answer.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
      // Check if this part is a citation
      const citationMatch = part.match(/\[(\d+)\]/);

      if (citationMatch) {
        const citationNumber = parseInt(citationMatch[1], 10);
        const sourceIndex = citationNumber - 1;
        const source = sources[sourceIndex];

        if (source) {
          return (
            <a
              key={index}
              href={source.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center align-super text-xs text-cyan-400 hover:text-cyan-300 transition-colors mx-0.5"
              title={source.title}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                {citationNumber}
              </span>
            </a>
          );
        }

        // If source not found, just render the citation number
        return (
          <span
            key={index}
            className="inline-flex items-center align-super text-xs text-zinc-500 mx-0.5"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-zinc-800">
              {citationNumber}
            </span>
          </span>
        );
      }

      // Regular text - preserve line breaks
      return (
        <span key={index}>
          {part.split('\n').map((line, lineIndex, array) => (
            <span key={lineIndex}>
              {line}
              {lineIndex < array.length - 1 && <br />}
            </span>
          ))}
        </span>
      );
    });
  }, [answer, sources]);

  return (
    <div className="prose prose-invert max-w-none">
      <div className="text-base text-zinc-200 leading-relaxed whitespace-pre-wrap">
        {formattedAnswer}
      </div>
    </div>
  );
};
