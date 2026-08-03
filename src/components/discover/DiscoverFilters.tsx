// src/components/discove/DiscoverFilters.tsx
import React from 'react';

interface DiscoverFiltersProps {
    selectedGenre: string;
    setSelectedGenre: (val: string) => void;
    spiceLevel: number;
    setSpiceLevel: (val: number) => void;
    sortBy: string;
    setSortBy: (val: string) => void;
}

const GENRES = ['All', 'Fantasy', 'Romance', 'Thriller', 'Sci-Fi', 'Historical', 'Cozy', 'Horror'];

export const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({
                                                                    selectedGenre, setSelectedGenre, spiceLevel, setSpiceLevel, sortBy, setSortBy
                                                                }) => {
    return (
        <div className="space-y-5">
            {/* 体裁标签组 */}
            <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">Genre</div>
                <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((g) => (
                        <button
                            key={g}
                            onClick={() => setSelectedGenre(g)}
                            className={`px-2.5 py-1 text-[10px] font-mono font-medium rounded-full border transition-all cursor-pointer ${
                                selectedGenre === g
                                    ? 'bg-primary border-primary text-on-primary shadow-sm'
                                    : 'bg-bg2/50 border-line/40 text-muted hover:border-tertiary/50 hover:text-ink'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {/* 辣度滑块 (Spice Level) */}
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-muted">
                    <span>🌶️ Spice</span>
                    <span className="text-ink font-bold">{spiceLevel} +</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={spiceLevel}
                    onChange={(e) => setSpiceLevel(Number(e.target.value))}
                    className="w-full h-1 bg-bg2 rounded-lg appearance-none cursor-pointer range-thumb:bg-primary range-track:bg-line"
                />
                <div className="flex justify-between text-[8px] text-muted/50 font-mono">
                    <span>Clean</span>
                    <span>Explicit</span>
                </div>
            </div>

            {/* 排序选择 (Sort) */}
            <div className="space-y-2 pt-2 border-t border-line/30">
                <div className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">Arrange</div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-bg2/80 border border-line rounded-lg py-1.5 px-2 text-[11px] font-mono text-ink outline-none focus:border-primary transition-colors cursor-pointer"
                >
                    <option value="default">Default Discovery</option>
                    <option value="rating">Top Rated ★</option>
                    <option value="spice">Spiciest 🌶️</option>
                    <option value="title">Alphabetical A-Z</option>
                </select>
            </div>
        </div>
    );
};