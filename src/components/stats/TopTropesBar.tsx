// src/components/stats/TopTropesBar.tsx
import React from 'react';

interface TropeStat {
    name: string;
    count: number;
}

interface TopTropesBarProps {
    tropes: TropeStat[];
}

export const TopTropesBar: React.FC<TopTropesBarProps> = ({ tropes }) => {
    const maxCount = tropes[0]?.count || 1;

    return (
        <div className="bg-card/40 border border-line/60 rounded-2xl p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h3 className="font-display font-bold text-sm text-ink">Top Tropes & Narrative Devices</h3>
                    <p className="text-[10px] font-mono text-muted">Most frequent tropes in your personal vault</p>
                </div>
                <span className="text-xs">✨</span>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center overflow-hidden">
                {tropes.length === 0 ? (
                    <div className="text-center text-xs font-mono text-muted py-6">
                        No tropes recorded yet
                    </div>
                ) : (
                    tropes.slice(0, 5).map((trope, idx) => {
                        const percentage = Math.round((trope.count / maxCount) * 100);
                        return (
                            <div key={`${trope.name}-${idx}`} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                    <span className="text-ink font-medium">
                                        <span className="text-tertiary mr-1.5">#{idx + 1}</span>
                                        {trope.name}
                                    </span>
                                    <span className="text-muted">{trope.count} books</span>
                                </div>
                                <div className="w-full bg-bg2 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-tertiary h-full transition-all duration-500 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};