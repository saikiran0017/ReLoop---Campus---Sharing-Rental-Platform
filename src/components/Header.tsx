import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'browse' | 'wanted' | 'post' | 'mystuff';
  setActiveTab: (tab: 'browse' | 'wanted' | 'post' | 'mystuff') => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenMessages: () => void;
  unreadChatCount: number;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  incomingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenProfile,
  onOpenMessages,
  unreadChatCount,
  onLogout,
  darkMode,
  onToggleDarkMode,
  incomingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 overflow-hidden">
        
        {/* Zone 1: Wordmark & Home Link */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('browse')}
            title="Go to Home (Browse)"
            className="flex items-center gap-1.5 text-left cursor-pointer group"
          >
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              ReLoop
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline font-mono">
              Campus Sharing
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Tabs (Horizontal scroll on mobile without overflow) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1 min-w-0">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'browse'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Browse
          </button>

          <button
            onClick={() => setActiveTab('wanted')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'wanted'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Wanted Board
          </button>

          <button
            onClick={() => setActiveTab('post')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'post'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            + Post Item
          </button>

          <button
            onClick={() => setActiveTab('mystuff')}
            className={`relative px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'mystuff'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            My Stuff
            {incomingCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-600 rounded-full tabular-nums">
                {incomingCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions - Only message symbol (no text), Theme, Profile & Log Out */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Messages Button: ONLY Message Symbol (💬), no text "Messages" */}
          <button
            onClick={onOpenMessages}
            title="In-App Campus Messages"
            aria-label="Messages"
            className="relative p-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <span className="text-base leading-none">💬</span>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-blue-600 rounded-full tabular-nums shadow-xs">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-medium cursor-pointer shrink-0"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* User Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shrink-0 max-w-[110px] sm:max-w-none"
            title="View Student Account Profile"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="hidden sm:inline font-medium truncate">{user.name.split(' ')[0]}</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0">
              {user.trustScore}pts
            </span>
          </button>

          {/* Log Out Option */}
          <button
            onClick={onLogout}
            title="Log out of ReLoop account"
            aria-label="Log Out"
            className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 rounded-md border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <span className="text-sm leading-none">🚪</span>
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
