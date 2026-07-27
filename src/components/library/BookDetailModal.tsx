// src/components/library/BookDetailModal.tsx
import React, { useState, useEffect } from 'react';
import type { BookWithUserData, ReadingStatus, UserBookStatus, UserFavorite } from '../../types/book';
import { useAuth } from '../../auth/useAuth';
import { supabase } from '../../lib/supabase';

interface BookDetailModalProps {
    book: BookWithUserData;
    onClose: () => void;
    onUpdate?: (updatedBook: BookWithUserData) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onUpdate }) => {
    const { user } = useAuth();

    // 维护本地编辑状态
    const [status, setStatus] = useState<ReadingStatus | 'unread'>(book.user_status || 'unread');
    const [progress, setProgress] = useState<number>(book.progress || 0);
    const [isFave, setIsFave] = useState<boolean>(!!book.is_fave);
    const [loading, setLoading] = useState<boolean>(false);
    const [favLoading, setFavLoading] = useState<boolean>(false); // ⚡ 新增：防重复点击锁

    // 监听 Esc 键关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // ⚡ 新增：处理爱心收藏/取消收藏
    const handleToggleFavorite = async () => {
        if (!user || favLoading) return;
        const nextFaveState = !isFave;
        setIsFave(nextFaveState);
        setFavLoading(true);

        try {
            if (nextFaveState) {
                const favRecord: Pick<UserFavorite, 'user_id' | 'book_id'> = {
                    user_id: user.id,
                    book_id: book.id,
                };
                await supabase.from('user_favorites').insert(favRecord);
            } else {
                await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('book_id', book.id);
            }
            // 通知外层列表实时更新收藏状态
            onUpdate?.({ ...book, is_fave: nextFaveState, user_status: status === 'unread' ? undefined : status, progress });
        } catch (err) {
            console.error('Failed to update favorite status in modal:', err);
            setIsFave(!nextFaveState); // 失败时回滚
        } finally {
            setFavLoading(false);
        }
    };

    // 保存用户的阅读状态与进度更新
    const handleSaveStatus = async (newStatus: ReadingStatus | 'unread', newProgress: number) => {
        if (!user) return;
        setStatus(newStatus);
        setProgress(newProgress);
        setLoading(true);

        try {
            if (newStatus === 'unread') {
                await supabase.from('user_book_status').delete().eq('user_id', user.id).eq('book_id', book.id);
            } else {
                const statusPayload: Partial<UserBookStatus> = {
                    user_id: user.id,
                    book_id: book.id,
                    status: newStatus,
                    progress: newProgress,
                    updated_at: new Date().toISOString()
                };
                await supabase.from('user_book_status').upsert(statusPayload, { onConflict: 'user_id,book_id' });
            }
            onUpdate?.({ ...book, is_fave: isFave, user_status: newStatus === 'unread' ? undefined : newStatus, progress: newProgress });
        } catch (err) {
            console.error('Failed to sync reading status:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
            {/* 背景点击遮罩 */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Instagram 风格大卡片 */}
            <div
                className="relative z-10 w-full max-w-4xl bg-card border border-line/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[88vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 👈 左侧：视觉海报区 */}
                <div className="relative w-full md:w-[45%] bg-bg2 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-line/40 shrink-0 select-none">
                    <div className="relative aspect-[2/3] w-4/5 max-w-[260px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        {book.cover ? (
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-bg2 to-card flex items-center justify-center text-6xl">
                                📖
                            </div>
                        )}
                        {status !== 'unread' && (
                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white border border-white/20 backdrop-blur-md font-[family-name:var(--font-mono)]">
                                {status.replace(/_/g, ' ')}
                            </div>
                        )}
                    </div>

                    {/* 底部评分客观指示器 */}
                    <div className="mt-6 flex items-center gap-4 text-sm font-[family-name:var(--font-mono)]">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card/80 border border-line rounded-xl text-amber-400 font-bold shadow-inner">
                            <span>★</span> {book.rating ? Number(book.rating).toFixed(2) : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-card/80 border border-line rounded-xl text-rose-400 font-bold shadow-inner" title="Spice Level">
                            <span>🌶️</span> {book.spice || 0} / 5
                        </div>
                    </div>
                </div>

                {/* 👉 右侧：数据详情与交互面板 */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-card/50">
                    {/* 右侧 Header */}
                    <div className="p-6 pb-4 border-b border-line/50 flex items-start justify-between gap-4 shrink-0">
                        <div className="space-y-1">
                            <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider font-[family-name:var(--font-mono)]">
                                {book.subgenre || 'General Fiction'} {book.series ? `✦ ${book.series} #${book.seriesposition || ''}` : ''}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink leading-tight">
                                {book.title}
                            </h2>
                            <p className="text-sm font-medium text-muted">
                                by <span className="text-ink font-semibold">{book.author || 'Unknown'}</span>
                            </p>
                        </div>

                        {/* ⚡ 新增：爱心按钮与关闭按钮组 */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleToggleFavorite}
                                disabled={favLoading}
                                title={isFave ? "Remove from Favorites" : "Add to Favorites"}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                                    isFave
                                        ? 'bg-rose-500/20 text-rose-500 border-rose-500/40 shadow-md scale-105'
                                        : 'bg-bg2 text-muted border-line hover:text-ink hover:border-tertiary'
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

                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-bg2 border border-line flex items-center justify-center text-muted hover:text-ink hover:border-tertiary transition-all"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* 右侧可滚动 Body区 */}
                    <div className="p-6 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-line">
                        {/* Tropes / Keywords 墙 */}
                        {book.tropes && book.tropes.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider font-[family-name:var(--font-mono)]">
                                    Featured Tropes
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {book.tropes.map((t, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-tertiary/10 border border-tertiary/30 rounded-lg text-xs font-medium text-tertiary">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 进度与状态修改控制台 */}
                        <div className="p-4 rounded-2xl bg-bg2/60 border border-line space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                                    Your Reading Journey
                                </label>
                                {loading && <span className="text-[10px] text-tertiary animate-pulse font-mono">Syncing...</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[11px] text-muted block mb-1">Status</span>
                                    <select
                                        value={status}
                                        onChange={(e) => handleSaveStatus(e.target.value as any, progress)}
                                        className="w-full px-3 py-2 bg-card border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-tertiary"
                                    >
                                        <option value="unread">Not Started</option>
                                        <option value="want_to_read">Want to Read (TBR)</option>
                                        <option value="reading">Currently Reading</option>
                                        <option value="read">Finished</option>
                                        <option value="abandoned">DNF (Abandoned)</option>
                                    </select>
                                </div>

                                {status === 'reading' && (
                                    <div>
                                        <span className="text-[11px] text-muted block mb-1">Progress (%)</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={progress}
                                            onChange={(e) => handleSaveStatus(status, Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-card border border-line rounded-xl text-xs font-bold text-ink font-[family-name:var(--font-mono)]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 读书笔记区 */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wider font-[family-name:var(--font-mono)]">
                                Personal Journal & Quotes
                            </h4>
                            <textarea
                                rows={3}
                                placeholder="Add your thoughts, favorite quotes, or review for this book..."
                                className="w-full p-3 bg-bg2/40 border border-line rounded-xl text-xs text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary resize-none"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};