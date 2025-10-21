'use client';

import { Search, Plus, Trash2, MessageSquare } from 'lucide-react';
import type { Conversation } from '@/lib/types';

interface SidebarProps {
  onNewChat: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const Sidebar = ({
  onNewChat,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation
}: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col py-4">
      {/* Logo and New Chat */}
      <div className="px-4 pb-4 border-b border-zinc-800">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-7 h-7 text-cyan-400"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="text-lg font-light text-zinc-300">simplexity</span>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer text-sm text-zinc-300"
          aria-label="New chat"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-3">
          Recent
        </h3>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`
                group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                ${conv.id === currentConversationId
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }
              `}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm flex-1 truncate">
                {conv.title || 'New conversation'}
              </span>
              {/* Delete button - show on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-opacity"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-4 pt-4 border-t border-zinc-800">
        <button
          className="flex items-center gap-3 text-cyan-400 text-sm cursor-pointer"
          aria-label="Home"
        >
          <Search className="w-5 h-5" />
          <span>Home</span>
        </button>
      </div>
    </aside>
  );
};
