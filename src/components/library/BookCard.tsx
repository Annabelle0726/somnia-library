// src/components/library/BookCard.tsx
import React, { useState, useEffect } from 'react';
import type { BookWithUserData, UserFavorite } from '../../types/book';
import { useAuth } from '../../auth/useAuth';
import { supabase } from '../../lib/supabase';

interface BookCardProps {
    book: BookWithUserData;
    onEdit?: (book: BookWithUserData) => void;
    onFavoriteToggle?: (bookId: string, isFave: boolean) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onFavoriteToggle }) => {
    const { user } = useAuth();
    const [isFave, setIsFave] = useState<boolean>(!!book.is_fave);
    const [favLoading, setFavLoading] = useState<boolean>(false);

    // 当父组件传入的 book 发生彻底改变（如刷新、导航返回）时，强制刷新本地 state
    useEffect(() => {
        setIsFave(!!book.is_fave);
    }, [book.id, book.is_fave]); // 加入 book.id 是保证换了一本书后彻底刷新状态

    // 处理小心心收藏切换 (同步更新 user_favorites 表)
    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止触发卡片本身的点击/编辑事件
        if (!user || favLoading) return;

        const nextFaveState = !isFave;
        setIsFave(nextFaveState); // 立刻进行乐观更新（UI瞬间变化）
        setFavLoading(true);

        try {
            if (nextFaveState) {
                // 收藏
                const favRecord: Pick<UserFavorite, 'user_id' | 'book_id'> = {
                    user_id: user.id,
                    book_id: book.id,
                };
                const { error } = await supabase.from('user_favorites').insert(favRecord);
                if (error) throw error;
            } else {
                // 取消收藏
                const { error } = await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('book_id', book.id);

                if (error) throw error;
            }

            // 操作成功，通知父组件更新全局状态
            onFavoriteToggle?.(book.id, nextFaveState);
        } catch (err) {
            console.error('Failed to update favorite status:', err);
            // 如果数据库报错，不仅本地回滚，还要触发父组件回滚以防万一
            setIsFave(!nextFaveState);
            onFavoriteToggle?.(book.id, !nextFaveState);
        } finally {
            setFavLoading(false);
        }
    };

    return (
        <div
            onClick={() => onEdit?.(book)}
            className="group flex flex-col cursor-pointer transition-transform duration-300"
        >
            {/* 1. 封面大框 (2:3 标准大屏比例) */}
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-bg2 border border-line/40 shadow-sm group-hover:shadow-2xl transition-all duration-300">
                {book.cover ? (
                    <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-bg2 to-card">
                        <span className="text-5xl mb-3 opacity-60">📖</span>
                        <span className="text-sm font-display font-bold text-ink/80 line-clamp-3">
                            {book.title}
                        </span>
                    </div>
                )}

                {/* 右上角：透明玻璃质感“小心心”收藏按钮 */}
                <button
                    onClick={handleToggleFavorite}
                    disabled={favLoading}
                    title={isFave ? "Remove from Favorites" : "Add to Favorites"}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                        isFave
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 scale-110 shadow-lg'
                            : 'bg-black/30 text-white/80 border border-white/20 hover:bg-black/50 hover:scale-110'
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isFave ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 transition-all"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                </button>

                {/* 左上角：阅读状态小药丸（显式关联 user_status） */}
                {book.user_status && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 text-white/90 border border-white/20 backdrop-blur-md font-[family-name:var(--font-mono)]">
                        {book.user_status.replace(/_/g, ' ')}
                    </span>
                )}

                {/* 封面底部气泡：客观评分与辣度 */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {book.rating ? (
                        <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[11px] font-bold text-amber-300 font-[family-name:var(--font-mono)]">
                            ★ {Number(book.rating).toFixed(1)}
                        </span>
                    ) : <div />}

                    {book.spice && book.spice > 0 ? (
                        <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[11px] text-rose-300">
                            {'🌶️'.repeat(Math.min(book.spice, 3))}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* 2. 信息区域 */}
            <div className="mt-3 px-1 space-y-1">
                <h4
                    className="text-base font-bold text-ink line-clamp-1 group-hover:text-primary transition-colors font-display tracking-tight"
                    title={book.title}
                >
                    {book.title}
                </h4>

                <p className="text-xs text-muted/80 font-medium truncate">
                    {book.author || 'Unknown Author'}
                </p>

                {/* ✨ 修复点：适配新类型，只从 book.tropes 数组中获取第一个标签作为展示 */}
                <div className="pt-0.5 flex items-center gap-2 text-[11px] text-tertiary/90 font-[family-name:var(--font-mono)] truncate">
                    {book.series ? (
                        <span className="truncate">
                            {book.series} #{book.seriesposition || ''}
                        </span>
                    ) : book.tropes && book.tropes.length > 0 ? (
                        <span className="truncate">#{book.tropes[0]}</span>
                    ) : (
                        <span className="text-muted/50">{book.subgenre || 'Standalone'}</span>
                    )}
                </div>
            </div>
        </div>
    );
};