import React from 'react';

interface ImpactBarProps {
  totalItemsShared: number;
  totalLoansCompleted: number;
  totalRupeesSaved?: number;
}

export const ImpactBar: React.FC<ImpactBarProps> = ({
  totalItemsShared,
  totalLoansCompleted,
}) => {
  return (
    <section 
      aria-label="Campus Impact Metrics"
      className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 py-3 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-sm">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Campus Impact</span>
          <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">·</span>
          <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">Shared student circular economy</span>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums text-base">
              {totalItemsShared}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">items listed</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums text-base">
              {totalLoansCompleted}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">loans completed</span>
          </div>
        </div>
      </div>
    </section>
  );
};
