// src/components/clubs/ClubFilters.tsx
import React from 'react';

interface ClubFiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filterType: 'all' | 'my';
    setFilterType: (val: 'all' | 'my') => void;
}

export const ClubFilters: React.FC<ClubFiltersProps> = ({
                                                            searchQuery, setSearchQuery, filterType, setFilterType
                                                        }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 bg-card/30 border border-line/40 rounded-2xl p-3 shrink-0">
            {/* 搜索框 */}
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-muted pointer-events-none text-xs">
                    🔍
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by guild name or theme..."
                    className="w-full pl-9 pr-4 py-2 bg-bg2/60 border border-line/40 rounded-xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary/50 transition-all"
                />
            </div>

            {/* 筛选 Tabs */}
            <div className="flex gap-2 bg-bg2/60 border border-line/40 rounded-xl p-1.5">
                {[
                    { key: 'all', label: 'All Guilds' },
                    { key: 'my', label: 'My Guilds' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilterType(tab.key as 'all' | 'my')}
                        className={`px-4 py-1.5 text-[11px] font-mono font-bold rounded-lg transition-all ${
                            filterType === tab.key
                                ? 'bg-card border border-line/60 text-ink shadow-sm'
                                : 'text-muted hover:text-ink'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};