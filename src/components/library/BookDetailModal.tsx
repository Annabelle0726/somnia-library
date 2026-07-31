// src/components/library/BookDetailModal.tsx
import React, {useState, useEffect} from 'react';
import type {BookWithUserData, ReadingStatus, BookReview} from '../../types/book';
import {useAuth} from '../../auth/useAuth';
import {supabase} from '../../lib/supabase';
import toast from 'react-hot-toast';
import {BookSynopsis} from './BookSynopsis';
import {BookReaderModal} from './BookReaderModal';

interface BookDetailModalProps {
    book: BookWithUserData;
    onClose: () => void;
    onUpdate?: (updatedBook: BookWithUserData) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({book, onClose, onUpdate}) => {
    const {user} = useAuth();
    const userId = user?.id;

    // 状态管理
    const [status, setStatus] = useState<ReadingStatus | 'unread'>(book.user_status || 'unread');
    const [progress, setProgress] = useState<number>(book.progress || 0);
    const [isFave, setIsFave] = useState<boolean>(!!book.is_fave);
    const [loading, setLoading] = useState<boolean>(false);
    const [favLoading, setFavLoading] = useState<boolean>(false);

    // 评论与评分
    const [userRating, setUserRating] = useState<number>(book.user_review?.rating || 0);
    const [reviewBody, setReviewBody] = useState<string>(book.user_review?.body || '');
    const [savingReview, setSavingReview] = useState<boolean>(false);
    const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');

    // Open Library 数据与阅读器状态
    const [loadingDescription, setLoadingDescription] = useState<boolean>(false);
    const [bookDescription, setBookDescription] = useState<string | null>(null);
    const [olKey, setOlKey] = useState<string | null>(null);
    const [activeReaderUrl, setActiveReaderUrl] = useState<string | null>(null);

    // ESC 关闭
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

    // 拉取 Open Library 图书简介与 Key
    useEffect(() => {
        if (!book.title) return;

        async function fetchBookDescription() {
            setLoadingDescription(true);
            try {
                const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(book.title)}&limit=1&fields=key,description`;
                const searchRes = await fetch(searchUrl);
                const searchData = await searchRes.json();

                if (searchData.docs && searchData.docs.length > 0) {
                    const firstMatch = searchData.docs[0];
                    let desc = firstMatch.description;
                    if (desc && typeof desc === 'object' && desc.value) {
                        desc = desc.value;
                    }
                    setBookDescription(desc || null);
                    setOlKey(firstMatch.key || null);
                } else {
                    setBookDescription(null);
                    setOlKey(null);
                }
            } catch (err) {
                console.error("Failed to fetch OL description:", err);
                setBookDescription(null);
            } finally {
                setLoadingDescription(false);
            }
        }

        fetchBookDescription();
    }, [book.title]);

    // 拉取用户评论
    useEffect(() => {
        if (!user || !book.id) return;

        async function fetchUserReview() {
            try {
                const {data} = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('book_id', book.id)
                    .eq('reviewer_id', userId)
                    .maybeSingle();

                if (data) {
                    setUserRating(data.rating || 0);
                    setReviewBody(data.body || '');
                }
            } catch (err) {
                console.error('Failed to fetch user review:', err);
            }
        }

        fetchUserReview();
    }, [user, book.id]);

    // 保存评论与评分
    const handleSaveReview = async (newRating = userRating, newBody = reviewBody) => {
        if (!user) return;
        if (newRating > 0 && !newBody.trim()) {
            toast.error('Please write a short review before saving your rating!', {
                duration: 3000,
                style: {background: '#1f2937', color: '#fbbf24', border: '1px solid #f59e0b'},
                icon: '✍️',
            });
            return;
        }

        if (newRating === 0 && !newBody.trim()) return;

        setSavingReview(true);
        setReviewSuccessMsg('');

        try {
            const payload = {
                book_id: book.id,
                reviewer_id: user.id,
                rating: newRating || null,
                body: newBody.trim() || null,
            };

            const {data: reviewData, error: reviewErr} = await supabase
                .from('reviews')
                .upsert(payload, {onConflict: 'book_id,reviewer_id'})
                .select()
                .single();

            if (reviewErr) throw reviewErr;

            const {data: updatedBook} = await supabase
                .from('books')
                .select('rating')
                .eq('id', book.id)
                .single();

            if (reviewData) {
                setReviewSuccessMsg('Saved!');
                toast.success('Review saved!', {
                    style: {
                        background: '#1f2937',
                        color: '#10b981',
                        border: '1px solid #10b981'
                    }
                });
                setTimeout(() => setReviewSuccessMsg(''), 2000);

                onUpdate?.({
                    ...book,
                    rating: updatedBook?.rating ?? book.rating,
                    is_fave: isFave,
                    user_status: status === 'unread' ? undefined : status,
                    progress,
                    user_review: reviewData as BookReview
                });
            }
        } catch (err: any) {
            console.error('Failed to save review:', err);
            toast.error('Failed to save review');
        } finally {
            setSavingReview(false);
        }
    };

    // 收藏/状态同步
    const handleToggleFavorite = async () => {
        if (!user || favLoading) return;
        const nextFaveState = !isFave;
        setIsFave(nextFaveState);
        setFavLoading(true);

        try {
            if (nextFaveState) {
                await supabase.from('user_favorites').insert({user_id: user.id, book_id: book.id});
            } else {
                await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('book_id', book.id);
            }
            onUpdate?.({
                ...book,
                is_fave: nextFaveState,
                user_status: status === 'unread' ? undefined : status,
                progress
            });
        } catch (err) {
            setIsFave(!nextFaveState);
        } finally {
            setFavLoading(false);
        }
    };

    const handleSaveStatus = async (newStatus: ReadingStatus | 'unread', newProgress: number) => {
        if (!user) return;
        setStatus(newStatus);
        setProgress(newProgress);
        setLoading(true);

        try {
            if (newStatus === 'unread') {
                await supabase.from('user_book_status').delete().eq('user_id', user.id).eq('book_id', book.id);
            } else {
                await supabase.from('user_book_status').upsert({
                    user_id: user.id,
                    book_id: book.id,
                    status: newStatus,
                    progress: newProgress,
                    updated_at: new Date().toISOString()
                }, {onConflict: 'user_id,book_id'});
            }
            onUpdate?.({
                ...book,
                is_fave: isFave,
                user_status: newStatus === 'unread' ? undefined : newStatus,
                progress: newProgress
            });
        } catch (err) {
            console.error('Failed to sync status:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}/>

            <div
                className="relative z-10 w-full max-w-4xl bg-card border border-line/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[88vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 左侧海报 */}
                <div
                    className="relative w-full md:w-[45%] bg-bg2 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-line/40 shrink-0 select-none">
                    <div
                        className="relative aspect-[2/3] w-4/5 max-w-[260px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        {book.cover ? (
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover"/>
                        ) : (
                            <div
                                className="w-full h-full bg-gradient-to-br from-bg2 to-card flex items-center justify-center text-6xl">📖</div>
                        )}
                        {status !== 'unread' && (
                            <div
                                className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white border border-white/20 backdrop-blur-md font-mono">
                                {status.replace(/_/g, ' ')}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-4 text-sm font-mono">
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-card/80 border border-line rounded-xl text-amber-400 font-bold">
                            <span>★</span> {book.rating ? Number(book.rating).toFixed(2) : 'N/A'}
                        </div>
                        <div
                            className="flex items-center gap-1 px-3 py-1.5 bg-card/80 border border-line rounded-xl text-rose-400 font-bold"
                            title="Spice Level">
                            <span>🌶️</span> {book.spice || 0} / 5
                        </div>
                    </div>
                </div>

                {/* 右侧交互区 */}
                <div className="flex-1 flex flex-col min-h-0 bg-card/50">
                    <div className="p-6 pb-4 border-b border-line/50 flex items-start justify-between gap-4 shrink-0">
                        <div className="space-y-1">
                            <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider font-mono">
                                {book.subgenre || 'General Fiction'} {book.series ? `✦ ${book.series} #${book.seriesposition || ''}` : ''}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink leading-tight">{book.title}</h2>
                            <p className="text-sm font-medium text-muted">
                                by <span className="text-ink font-semibold">{book.author || 'Unknown'}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleToggleFavorite}
                                disabled={favLoading}
                                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                                    isFave ? 'bg-rose-500/20 text-rose-500 border-rose-500/40 scale-105' : 'bg-bg2 text-muted border-line hover:text-ink'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill={isFave ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"
                                     className="w-4 h-4">
                                    <path
                                        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                </svg>
                            </button>
                            <button onClick={onClose}
                                    className="w-9 h-9 rounded-full bg-bg2 border border-line flex items-center justify-center text-muted hover:text-ink">
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* 可滚动区域 */}
                    <div className="p-6 flex-1 overflow-y-auto min-h-0 space-y-6 scrollbar-thin scrollbar-thumb-line">
                        {/* 拆分组件 1: Synopsis & Read More & Reading Link */}
                        <BookSynopsis
                            description={bookDescription}
                            isLoading={loadingDescription}
                            openLibraryKey={olKey}
                            onOpenReader={(url) => setActiveReaderUrl(url)}
                        />

                        {/* Tropes 墙 */}
                        {book.tropes && book.tropes.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider font-mono">Featured
                                    Tropes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {book.tropes.map((t, idx) => (
                                        <span key={idx}
                                              className="px-3 py-1 bg-tertiary/10 border border-tertiary/30 rounded-lg text-xs font-medium text-tertiary">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 阅读进度 */}
                        <div className="p-4 rounded-2xl bg-bg2/60 border border-line space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-ink uppercase tracking-wider font-mono">Your
                                    Reading Journey</label>
                                {loading && <span
                                    className="text-[10px] text-tertiary animate-pulse font-mono">Syncing...</span>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[11px] text-muted block mb-1">Status</span>
                                    <select
                                        value={status}
                                        onChange={(e) => handleSaveStatus(e.target.value as any, progress)}
                                        className="w-full px-3 py-2 bg-card border border-line rounded-xl text-xs font-bold text-ink focus:outline-none"
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
                                            className="w-full px-3 py-2 bg-card border border-line rounded-xl text-xs font-bold text-ink font-mono"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 笔记与评分 */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider font-mono">Personal
                                    Journal & Review</h4>
                                {reviewSuccessMsg && <span
                                    className="text-xs font-bold text-emerald-400 font-mono">✓ {reviewSuccessMsg}</span>}
                            </div>

                            <div
                                className="p-3 bg-bg2/40 border border-line rounded-xl flex items-center justify-between">
                                <span className="text-xs font-medium text-muted">Your Rating:</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                                const nextRating = userRating === star ? 0 : star;
                                                setUserRating(nextRating);
                                                handleSaveReview(nextRating, reviewBody);
                                            }}
                                            className={`text-lg transition-transform hover:scale-125 ${star <= userRating ? 'text-amber-400' : 'text-muted/30'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <textarea
                                    rows={3}
                                    value={reviewBody}
                                    onChange={(e) => setReviewBody(e.target.value)}
                                    placeholder="What did you think?..."
                                    className="w-full p-3 bg-bg2/40 border border-line rounded-xl text-xs text-ink focus:outline-none resize-none"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleSaveReview(userRating, reviewBody)}
                                        disabled={savingReview}
                                        className="px-4 py-1.5 bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 rounded-lg text-xs font-mono font-bold"
                                    >
                                        {savingReview ? 'Saving...' : 'Save Review'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 拆分组件 2: 嵌入式阅读器弹窗 */}
            {activeReaderUrl && (
                <BookReaderModal
                    readerUrl={activeReaderUrl}
                    title={book.title}
                    onClose={() => setActiveReaderUrl(null)}
                />
            )}
        </div>
    );
};