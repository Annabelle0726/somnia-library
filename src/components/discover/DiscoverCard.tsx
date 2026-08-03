// src/components/discover/DiscoverCard.tsx
import React from 'react';
import type { BookWithUserData } from '../../types/book';

interface DiscoverCardProps {
    book: BookWithUserData;
    onClick?: () => void;
}

export const DiscoverCard: React.FC<DiscoverCardProps> = ({ book, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative bg-card border border-line/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-tertiary/50 flex flex-col w-full h-full cursor-pointer"
        >
            <div className="relative flex-1 bg-bg2 flex items-center justify-center overflow-hidden min-h-0">
                {book.cover ? (
                    <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted/20">
                        <span className="text-5xl font-mono">📖</span>
                        <span className="text-[8px] font-mono mt-1">No Cover</span>
                    </div>
                )}

                {/* 悬浮遮罩 */}
                <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {/* 信息区：高度固定由内容决定 */}
            <div className="shrink-0 flex flex-col p-3 gap-1.5 border-t border-line/10 bg-card group-hover:bg-card-2/50 transition-colors h-[110px]">
                <h4 className="font-display font-bold text-sm text-ink truncate group-hover:text-primary transition-colors leading-tight">
                    {book.title}
                </h4>
                <p className="text-[11px] font-mono text-muted/70 truncate">
                    {book.author || 'Unknown Author'}
                </p>

                <div className="flex flex-col gap-1 pt-2 border-t border-line/10 text-[10px] font-mono">
                    {/* 第一行：评分 和 辣度 */}
                    <div className="flex items-center gap-3 text-muted">
                        <div className="flex items-center gap-1.5">
                            <span className="text-primary font-bold">★</span> {book.rating?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>🌶️</span> {book.spice || 0}
                        </div>
                    </div>

                    {/* 第二行：体裁 (自动左对齐) */}
                    <div className="bg-bg2 py-0.5 rounded text-[9px] text-muted truncate max-w-[70px] w-fit">
                        {book.subgenre || 'Fiction'}
                    </div>
                </div>
            </div>
        </div>
    );
};