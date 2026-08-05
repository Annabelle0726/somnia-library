// src/components/home/BookShelfHeader.tsx
interface BookShelfHeaderProps {
    loading: boolean;
    readingCount: number;
    wantToReadCount: number;
    readCount: number;
    faveCount: number;
    onOpenQuiz?: () => void;
    onSurpriseMe?: () => void;
    isSurprising?: boolean;
}

export function BookShelfHeader({
                                    loading,
                                    readingCount,
                                    wantToReadCount,
                                    readCount,
                                    faveCount,
                                    onOpenQuiz,
                                    onSurpriseMe,
                                    isSurprising = false,
                                }: BookShelfHeaderProps) {
    return (
        <div className="relative w-full
            bg-gradient-to-br from-bg2/40 via-card/30 to-bg/20
            backdrop-blur-lg
            border border-line
            rounded-sm
            p-6
            pb-8
            shadow-md
            flex flex-col sm:flex-row items-center justify-between gap-6"
             style={{ overflow: 'visible' }} // 强制保障不被截断
        >
            {/* 四角装饰 */}
            <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-tertiary/60 rotate-45 shadow-sm" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-tertiary/60 rotate-45 shadow-sm" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 bg-tertiary/60 rotate-45 shadow-sm" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-tertiary/60 rotate-45 shadow-sm" />

            {/* 左侧：4 项状态数据徽章 */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5 z-10">
                {/* 1. Reading */}
                <div className="group flex items-center gap-2 px-3 py-1.5 border border-line bg-card/60 backdrop-blur-sm text-xs font-display text-ink tracking-wide transition-all duration-300 hover:bg-bg2/80 hover:border-primary">
                    <span className="text-primary text-[10px] group-hover:scale-110 transition-transform animate-pulse">⏳</span>
                    <span className="font-bold text-sm font-mono text-ink">{loading ? '-' : readingCount}</span>
                    <span className="text-muted">reading</span>
                </div>

                {/* 2. Want to Read */}
                <div className="group flex items-center gap-2 px-3 py-1.5 border border-line bg-card/60 backdrop-blur-sm text-xs font-display text-ink tracking-wide transition-all duration-300 hover:bg-bg2/80 hover:border-tertiary">
                    <span className="text-tertiary text-[10px] group-hover:scale-110 transition-transform">📌</span>
                    <span className="font-bold text-sm font-mono text-ink">{loading ? '-' : wantToReadCount}</span>
                    <span className="text-muted">want to read</span>
                </div>

                {/* 3. Read */}
                <div className="group flex items-center gap-2 px-3 py-1.5 border border-line bg-card/60 backdrop-blur-sm text-xs font-display text-ink tracking-wide transition-all duration-300 hover:bg-bg2/80 hover:border-secondary">
                    <span className="text-secondary text-[10px] group-hover:scale-110 transition-transform">✓</span>
                    <span className="font-bold text-sm font-mono text-ink">{loading ? '-' : readCount}</span>
                    <span className="text-muted">read</span>
                </div>

                {/* 4. Faves */}
                <div className="group flex items-center gap-2 px-3 py-1.5 border border-line bg-card/60 backdrop-blur-sm text-xs font-display text-ink tracking-wide transition-all duration-300 hover:bg-bg2/80 hover:border-muted">
                    <span className="text-muted text-[10px] group-hover:scale-110 transition-transform">♥</span>
                    <span className="font-bold text-sm font-mono text-ink">{loading ? '-' : faveCount}</span>
                    <span className="text-muted">faves</span>
                </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex flex-col items-center sm:items-end gap-3 z-10">
                <button
                    onClick={onOpenQuiz}
                    className="group flex items-center gap-2 px-6 py-2 bg-primary text-on-primary border border-primary/60 text-sm font-display tracking-wider shadow-md hover:opacity-90 transition-all duration-300 rounded-sm cursor-pointer"
                >
                    <span className="group-hover:scale-110 transition-transform">💘</span>
                    Find my next read
                </button>

                <button
                    onClick={onSurpriseMe}
                    disabled={loading || isSurprising}
                    className="group flex items-center gap-2 px-4 py-1 text-xs font-display text-muted hover:text-primary transition-all duration-300 border-b border-line hover:border-primary pb-1 cursor-pointer disabled:opacity-50"
                >
                    <span className={`transition-transform duration-500 opacity-70 ${isSurprising ? 'animate-spin' : 'group-hover:rotate-180'}`}>
                        🎲
                    </span>
                    {isSurprising ? 'Rolling the dice...' : 'Surprise me'}
                </button>
            </div>
        </div>
    );
}