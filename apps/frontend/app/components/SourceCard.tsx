'use client';

import { ExternalLink } from 'lucide-react';
import type { SearchResult } from '@/lib/types';

interface SourceCardProps {
  source: SearchResult;
  index: number;
}

export const SourceCard = ({ source, index }: SourceCardProps) => {
  // Extract domain from URL
  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <a
      href={source.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-64 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* Favicon or placeholder */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 overflow-hidden">
          {source.favicon ? (
            <img
              src={source.favicon}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.nextSibling) {
                  (target.nextSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
          ) : (
            <span>{index + 1}</span>
          )}
          <span className="hidden w-full h-full items-center justify-center">
            {index + 1}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm text-zinc-400 truncate">{getDomain(source.link)}</p>
            <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
          </div>
          <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
            {source.title}
          </h3>
          <p className="text-xs text-zinc-500 line-clamp-2">{source.snippet}</p>
        </div>
      </div>
    </a>
  );
};
