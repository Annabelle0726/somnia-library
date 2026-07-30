// src/components/home/BookShelfRow.tsx
import { useState } from 'react';
import type { BookWithUserData } from '../../types/book';
import { BookSpine } from './BookSpine';

interface BookShelfRowProps {
    title: string;
    icon: string;
    colorTheme: 'primary' | 'secondary' | 'tertiary' | 'muted';
    books: BookWithUserData[];
    onBookClick?: (book: BookWithUserData) => void;
    /** 是否默认展开 */
    defaultExpanded?: boolean;
}

export function BookShelfRow({
                                 title,
                                 icon,
                                 colorTheme,
                                 books,
                                 onBookClick,
                                 defaultExpanded = true
                             }: BookShelfRowProps) {
    const [viewMode, setViewMode] = useState<'spine' | 'grid'>('spine');
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const textColorMap = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        tertiary: 'text-tertiary',
        muted: 'text-muted',
    };

    const borderColorMap = {
        primary: 'border-primary/40',
        secondary: 'border-secondary/40',
        tertiary: 'border-tertiary/40',
        muted: 'border-muted/40',
    };

    return (
        <div className="flex flex-col gap-3 w-full border-b border-line/30 pb-6 last:border-b-0">
            {/* Header 区域：标题 + 数量 + 视图切换 */}
            <div className="flex items-center justify-between px-1">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <span className={`text-sm ${textColorMap[colorTheme]}`}>{icon}</span>
                    <h3 className="font-display font-bold text-sm text-ink tracking-wide group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-card border border-line text-muted">
                        {books.length}
                    </span>
                    <span className="text-xs text-muted group-hover:text-ink transition-transform duration-200">
                        {isExpanded ? '▼' : '▶'}
                    </span>
                </button>

                {/* 视图模式切换按钮 (仅在展开且有书时显示) */}
                {isExpanded && books.length > 0 && (
                    <div className="flex items-center bg-bg2 border border-line rounded-lg p-0.5 text-xs">
                        <button
                            onClick={() => setViewMode('spine')}
                            className={`px-2 py-0.5 rounded ${viewMode === 'spine' ? 'bg-card text-ink font-bold shadow-sm' : 'text-muted hover:text-ink'}`}
                            title="Spine View"
                        >
                            📚 Spine
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-2 py-0.5 rounded ${viewMode === 'grid' ? 'bg-card text-ink font-bold shadow-sm' : 'text-muted hover:text-ink'}`}
                            title="Grid Covers"
                        >
                            🖼️ Grid
                        </button>
                    </div>
                )}
            </div>

            {/* 展开内容区 */}
            {isExpanded && (
                <>
                    {books.length === 0 ? (
                        <div className="w-full text-center py-6 select-none border border-line/30 rounded-xl bg-card/20">
                            <p className="font-[family-name:var(--font-decorative)] text-xs text-muted/70 tracking-widest">
                                "No books recorded in this shelf yet."
                            </p>
                        </div>
                    ) : viewMode === 'spine' ? (
                        /* 书脊横向排布模式 */
                        <div className="flex items-end gap-3 px-2 overflow-x-auto max-w-full no-scrollbar pb-2 pt-2">
                            {books.map((book) => (
                                <BookSpine
                                    key={book.id}
                                    title={book.title}
                                    colorTheme={colorTheme}
                                    onClick={() => onBookClick?.(book)}
                                />
                            ))}
                        </div>
                    ) : (
                        /* 网格封面模式 */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
                            {books.map((book) => (
                                <div
                                    key={book.id}
                                    onClick={() => onBookClick?.(book)}
                                    className={`group relative aspect-[2/3] rounded-xl overflow-hidden border ${borderColorMap[colorTheme]} bg-bg2 cursor-pointer shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300`}
                                >
                                    {book.cover ? (
                                        <img
                                            src={book.cover}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:brightness-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                            <span className="text-2xl mb-1">📖</span>
                                            <span className="text-xs font-bold line-clamp-2 text-ink">{book.title}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                        <p className="text-xs font-bold text-white line-clamp-1">{book.title}</p>
                                        <p className="text-[10px] text-tertiary">by {book.author || 'Unknown'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}