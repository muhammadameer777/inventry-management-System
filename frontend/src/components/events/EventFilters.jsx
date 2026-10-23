import React from 'react';
import { Search, X } from 'lucide-react';

export const EventFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  date,
  setDate,
  categories = [],
  onReset,
}) => {
  const hasActiveFilters = search || (category && category !== 'all') || date || sort !== 'date-asc';

  return (
    <div className="space-y-4">
      {/* Primary Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title, topic, speaker or location..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 px-3.5 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
          />
        </div>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 px-3.5 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
          >
            <option value="date-asc">Date: Soonest First</option>
            <option value="date-desc">Date: Latest First</option>
            <option value="popularity">Most Popular</option>
            <option value="capacity-desc">Highest Capacity</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="h-11 px-3.5 rounded-2xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-none no-scrollbar">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            category === 'all'
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white dark:bg-[#151722] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => {
          const isSelected = category.toLowerCase() === cat.name.toLowerCase() || category === cat.id || category === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-xs'
                  : 'bg-white dark:bg-[#151722] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
