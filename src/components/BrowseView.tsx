import React, { useState, useEffect } from 'react';
import { Item, Category, Mode } from '../types';
import { formatCurrency, loadFromLocalStorage, saveToLocalStorage } from '../utils';

interface BrowseViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onOpenChat?: (item: Item) => void;
  onOpenPostWithPrefill?: (cat?: Category) => void;
}

const DEFAULT_RECENT_SEARCHES = ['Mini drafter', 'fx-991', 'Lab coat', 'Arduino', 'Badminton'];

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Stationery',
  'Books',
  'Electronics',
  'Sports',
  'Hostel',
  'Lab',
];

const MODES: { label: string; value: 'All' | Mode }[] = [
  { label: 'All Modes', value: 'All' },
  { label: 'Free to Borrow', value: 'borrow' },
  { label: 'Paid Rent', value: 'rent' },
  { label: 'Giveaways', value: 'giveaway' },
];

export const BrowseView: React.FC<BrowseViewProps> = ({
  items,
  onSelectItem,
  onOpenChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [selectedMode, setSelectedMode] = useState<'All' | Mode>('All');

  // Recent Searches state persisted in localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return loadFromLocalStorage<string[]>('reloop_recent_searches', DEFAULT_RECENT_SEARCHES);
  });

  const saveSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      saveToLocalStorage('reloop_recent_searches', updated);
      return updated;
    });
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    saveSearch(term);
  };

  const handleRemoveRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term);
      saveToLocalStorage('reloop_recent_searches', updated);
      return updated;
    });
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
    saveToLocalStorage('reloop_recent_searches', []);
  };

  const filteredItems = items.filter(item => {
    // Search
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pickupSpot.toLowerCase().includes(searchQuery.toLowerCase());

    // Category
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    // Mode
    const matchesMode = selectedMode === 'All' || item.mode === selectedMode;

    return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Section */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                saveSearch(searchQuery);
              }
            }}
            onBlur={() => {
              if (searchQuery.trim().length >= 2) {
                saveSearch(searchQuery);
              }
            }}
            placeholder="Search items by name, course gear, or campus spot (e.g. mini drafter, lab coat, fx-991, SAC)..."
            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-zinc-900 dark:focus:outline-zinc-100 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Recent Searches List */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1 mr-0.5">
              <span>🕒</span>
              <span>Recent searches:</span>
            </span>
            {recentSearches.map(term => {
              const isActive = searchQuery.toLowerCase() === term.toLowerCase();
              return (
                <div
                  key={term}
                  onClick={() => handleRecentClick(term)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRecentClick(term);
                    }
                  }}
                  className={`group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium'
                      : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80'
                  }`}
                  title={`Search for "${term}"`}
                >
                  <span>{term}</span>
                  <button
                    type="button"
                    onClick={e => handleRemoveRecent(term, e)}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 font-mono text-[10px] leading-none ml-0.5 p-0.5 cursor-pointer rounded"
                    title={`Remove "${term}" from history`}
                    aria-label={`Remove "${term}" from recent searches`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleClearAllRecent}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ml-1.5 hover:underline cursor-pointer"
              title="Clear all recent searches"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter Bar: Categories + Modes */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
            {MODES.map(mode => (
              <button
                key={mode.value}
                onClick={() => setSelectedMode(mode.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedMode === mode.value
                    ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                    : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Item Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
        <span>
          Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">{filteredItems.length}</span> campus items
        </span>
        {(selectedCategory !== 'All' || selectedMode !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedMode('All');
              setSearchQuery('');
            }}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16 px-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            No items found matching your filters.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
            Try adjusting your search terms, switching categories, or check the Wanted Board to request this item from fellow campus peers.
          </p>
        </div>
      )}

      {/* Grid of Item Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredItems.map(item => {
          return (
            <article
              key={item.id}
              onClick={() => onSelectItem(item)}
              tabIndex={0}
              role="button"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectItem(item);
                }
              }}
              className="group relative flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div>
                {/* Header: Emoji & Price Tag */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="text-3xl p-2 bg-zinc-50 dark:bg-zinc-800/80 rounded-md border border-zinc-100 dark:border-zinc-800 shrink-0">
                    {item.emoji}
                  </div>

                  {/* Price Tag & Lent Status */}
                  <div className="text-right">
                    {item.isLent ? (
                      <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Currently lent
                      </div>
                    ) : item.mode === 'giveaway' ? (
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
                        Free Giveaway
                      </div>
                    ) : item.mode === 'borrow' ? (
                      <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        Free to borrow
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {formatCurrency(item.rentPerDay)}
                        <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">/day</span>
                      </div>
                    )}

                    {item.mode === 'rent' && !item.isLent && (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                        Deposit: {formatCurrency(item.deposit)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors line-clamp-2 mb-1.5">
                  {item.title}
                </h3>

                {/* Details snippet */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2.5">
                  {item.details}
                </p>

                {/* Dual Approach Options: Contact Phone & In-App Message */}
                <div 
                  className="space-y-1.5 p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200/80 dark:border-zinc-800 mb-2.5"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <span>📞</span>
                      <span>Call:</span>
                    </span>
                    <a
                      href={`tel:${item.contactPhone || item.ownerPhone}`}
                      className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Click to call owner"
                    >
                      {item.contactPhone || item.ownerPhone}
                    </a>
                  </div>

                  <div className="pt-1.5 border-t border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Or chat on ReLoop:
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenChat && onOpenChat(item)}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      title="Send in-app message to owner (no phone number required)"
                    >
                      <span>💬</span>
                      <span>Message Owner</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer Metadata (Zero-Pill Discipline) */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="truncate max-w-[140px] text-zinc-700 dark:text-zinc-300 font-medium">
                    {item.ownerName}
                  </span>
                  <span className="text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{item.ownerTrustTier} ({item.ownerTrustScore})</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.condition}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{item.pickupSpot}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
