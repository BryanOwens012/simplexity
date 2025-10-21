'use client';

import { useState, KeyboardEvent } from 'react';
import { Search, ArrowUp } from 'lucide-react';

interface SearchInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchInput = ({
  onSubmit,
  isLoading = false,
  placeholder = 'Ask anything...'
}: SearchInputProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg hover:border-zinc-600 transition-colors">
        {/* Input Field */}
        <div className="flex items-center gap-3 px-5 py-4">
          {/* Left Icons */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 resize-none min-h-[24px] max-h-[200px] overflow-y-auto"
            rows={1}
            style={{
              height: 'auto',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="p-2.5 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit query"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
