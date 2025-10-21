'use client';

import { Search, Plus } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar = ({ onNewChat }: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-6">
      {/* Logo */}
      <div className="w-10 h-10 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-8 h-8 text-cyan-400"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
        aria-label="New chat"
      >
        <Plus className="w-5 h-5 text-zinc-400" />
      </button>

      {/* Navigation */}
      <nav className="flex flex-col items-center gap-6 mt-4">
        <button
          className="flex flex-col items-center gap-1 text-cyan-400 cursor-pointer"
          aria-label="Home"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>
      </nav>
    </aside>
  );
};
