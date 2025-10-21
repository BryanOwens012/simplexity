'use client';

import { Circle } from 'lucide-react';

export type Tab = 'simplexity' | 'sources';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  sourcesCount?: number;
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
  sourcesCount = 0,
}: TabNavigationProps) => {
  return (
    <div className="flex items-center gap-6 border-b border-zinc-800">
      <button
        onClick={() => onTabChange('simplexity')}
        className={`relative pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${
          activeTab === 'simplexity'
            ? 'text-white'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4" />
          <span>Simplexity</span>
        </div>
        {activeTab === 'simplexity' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
        )}
      </button>

      <button
        onClick={() => onTabChange('sources')}
        className={`relative pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${
          activeTab === 'sources'
            ? 'text-white'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="8" opacity="0.4" />
          </svg>
          <span>Sources</span>
          {sourcesCount > 0 && (
            <span className="ml-1 text-xs text-zinc-500">{sourcesCount}</span>
          )}
        </div>
        {activeTab === 'sources' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
        )}
      </button>
    </div>
  );
};
