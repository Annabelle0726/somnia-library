// src/components/discover/BookCard.tsx
import React from 'react';
import type {BookWithUserData} from '../../types/book';

interface BookCardProps {
    book: BookWithUserData;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
    // 提取前 3 个 tropes 展示
    const displayTropes = [book.tropes_0, book.tropes_1, book.tropes_2].filter(Boolean).slice(0, 2);

    return (
        <div className="group relative flex flex-col bg-card border border-line/60 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-tertiary/40">
            <div className="relative w-full aspect-[2/3] bg-bg2 flex items-center justify-center overflow-hidden">
                {/* 封面图占位符，有真实数据时替换 */}
                {book.cover ? (
                    <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <span className="text-5xl opacity-30">📖</span>
                )}

                {/* 状态标签 (根据 user_status 显示) */}
                {book.user_status && book.user_status !== 'abandoned' && (
                    <div className="absolute top-2 right-2 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/80 backdrop-blur-sm text-on-primary border border-primary/60">
                        {book.user_status === 'want_to_read' ? 'Want' : book.user_status === 'reading' ? 'Reading' : 'Read'}
                    </div>
                )}

                {/* 顶部隐藏动作栏：匹配 Match 页面的心形和状态交互 */}
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-card border border-line hover:bg-primary/20 hover:border-primary/40 text-ink hover:text-primary transition-all flex items-center justify-center">
                        {book.is_fave ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>

            <div className="p-3.5 flex flex-col flex-1 gap-1.5 border-t border-line/20">
                {/* 标题与作者 */}
                <div>
                    <h4 className="font-display font-bold text-sm text-ink truncate leading-tight group-hover:text-primary transition-colors">
                        {book.title}
                    </h4>
                    <p className="text-[11px] text-muted truncate font-medium">
                        {book.author || 'Anonymous'}
                    </p>
                </div>

                {/* 评分与辣度 */}
                <div className="flex items-center justify-between text-[10px] font-mono mt-auto pt-1.5 border-t border-line/10">
                    <div className="flex items-center gap-1.5">
                        <span className="text-amber-500">★</span>
                        <span className="text-ink font-bold">{book.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-muted">
                        <span>🌶️</span>
                        <span className="text-ink font-bold">{book.spice || 0}/5</span>
                    </div>
                </div>

                {/* 小标签 Tag (利用 tropes_0, tropes_1... 展示) */}
                {displayTropes.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {displayTropes.map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-bg2 border border-line/30 rounded text-[8px] font-mono text-muted tracking-tight">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};