// src/components/stats/StatsOverview.tsx
import React from 'react';

interface StatsOverviewProps {
    totalBooks: number;
    completedBooks: number;
    avgSpice: number;
    avgRating: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
                                                                totalBooks,
                                                                completedBooks,
                                                                avgSpice,
                                                                avgRating,
                                                            }) => {
    // 动态判断读者称号
    const getPersona = () => {
        if (avgSpice >= 3.8) return { title: 'High-Spice Archmage 🌶️', desc: 'Seeking intense romance & high tension' };
        if (avgRating >= 4.5) return { title: 'Critical Scholar 🕯️', desc: 'Only standard-setting masterpieces enter the vault' };
        if (completedBooks >= 20) return { title: 'Devout Archivist 📜', desc: 'Voracious reader who devours entire shelves' };
        return { title: 'Vault Explorer ✦', desc: 'Curating personal literary gems' };
    };

    const persona = getPersona();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

            {/* ================= 左侧：融合标题与速览指标的大卡片 (占 2 列) ================= */}
            <div className="md:col-span-2 bg-gradient-to-br from-card via-card-2/60 to-card border border-line/60 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
                {/* 氛围光晕 */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />

                {/* 1. 顶部 Header */}
                <div className="flex justify-between items-center border-b border-line/30 pb-3 relative z-10">
                    <div className="flex flex-col">
                        <h1 className="font-display font-bold text-xl text-ink hero-title leading-tight">
                            Reading Intelligence
                        </h1>
                        <span className="text-[10px] font-mono text-muted/70 mt-0.5">
                            Deep analytical insights from your archives
                        </span>
                    </div>
                    <span className="font-mono text-[9px] text-primary font-bold border border-primary/20 px-2.5 py-1 rounded-full bg-primary/5 whitespace-nowrap">
                        ✦ Vault Metrics
                    </span>
                </div>

                {/* 2. 中部：左右双栏网格 (彻底解决右侧大面积黑框空白问题) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto py-2 relative z-10">

                    {/* 左侧 (占 7 列)：Reader Persona 人设 */}
                    <div className="sm:col-span-7 border-b sm:border-b-0 sm:border-r border-line/30 pb-3 sm:pb-0 sm:pr-4">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-tertiary font-bold">
                            Reader Persona
                        </span>
                        <h2 className="text-xl font-display font-bold text-ink mt-0.5">
                            {persona.title}
                        </h2>
                        <p className="text-xs font-mono text-muted mt-1 leading-relaxed">
                            {persona.desc}
                        </p>
                    </div>

                    {/* 右侧 (占 5 列)：填补空白的 Quick Signals 小模块 */}
                    <div className="sm:col-span-5 grid grid-cols-2 gap-2 pl-0 sm:pl-2">
                        <div className="bg-bg2/60 border border-line/40 rounded-xl p-2.5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-muted uppercase">Archived</span>
                            <span className="text-sm font-display font-bold text-ink mt-1">
                                {totalBooks} <span className="text-[9px] font-mono text-muted font-normal">Books</span>
                            </span>
                        </div>
                        <div className="bg-bg2/60 border border-line/40 rounded-xl p-2.5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-muted uppercase">Efficiency</span>
                            <span className="text-sm font-display font-bold text-primary mt-1">
                                {totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0}% <span className="text-[9px] font-mono text-muted font-normal">Done</span>
                            </span>
                        </div>
                        <div className="col-span-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-tertiary">
                            <span>✦ Vault Activity Level</span>
                            <span className="font-bold text-primary">HIGH</span>
                        </div>
                    </div>

                </div>

                {/* 3. 底部微弱装饰线/标语 */}
                <div className="pt-2 border-t border-line/20 flex items-center justify-between text-[9px] font-mono text-muted/60 relative z-10">
                    <span>Curated via Somnia Engine</span>
                    <span>Updated Live</span>
                </div>
            </div>

            {/* ================= 右侧：上下结构的 2 张小卡片 (占 1 列) ================= */}
            <div className="flex flex-col gap-3.5 h-full">

                {/* 右上卡片：Vault Stats */}
                <div className="flex-1 bg-card/50 border border-line/60 rounded-2xl p-4 flex flex-col justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Vault Stats</span>
                    <div>
                        <div className="text-lg sm:text-xl font-display font-bold text-ink leading-tight">
                            {completedBooks} <span className="text-xs font-mono text-muted font-normal">/ {totalBooks} Read</span>
                        </div>
                        <p className="text-[10px] font-mono text-muted/70 mt-0.5">
                            {totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0}% completion rate
                        </p>
                    </div>
                    <div className="w-full bg-bg2 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* 右下卡片：Average Ratings */}
                <div className="flex-1 bg-card/50 border border-line/60 rounded-2xl p-4 flex flex-col justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Average Ratings</span>

                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="text-lg sm:text-xl font-display font-bold text-ink leading-tight">★ {avgRating.toFixed(1)}</span>
                            <p className="text-[10px] font-mono text-muted/70 mt-0.5">Overall Taste Score</p>
                        </div>
                        <div className="text-right">
                            <span className="text-base sm:text-lg font-display font-bold text-ink leading-tight">🌶️ {avgSpice.toFixed(1)}</span>
                            <p className="text-[10px] font-mono text-muted/70 mt-0.5">Avg Spice</p>
                        </div>
                    </div>

                    <div className="text-[9px] font-mono text-tertiary">
                        ✦ High alignment with personal preferences
                    </div>
                </div>

            </div>
        </div>
    );
};