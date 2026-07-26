// src/components/library/AddBookForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ReadingStatus } from '../../types/book';

interface AddBookFormProps {
    initialTitle?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const AddBookForm: React.FC<AddBookFormProps> = ({
                                                            initialTitle = '',
                                                            onSuccess,
                                                            onCancel
                                                        }) => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // --- 图书公共元数据 (存入 books 表) ---
    const [title, setTitle] = useState(initialTitle);
    const [author, setAuthor] = useState('');
    const [series, setSeries] = useState('');
    const [seriesPosition, setSeriesPosition] = useState('');
    const [subgenre, setSubgenre] = useState('Romantasy');
    const [cover, setCover] = useState('');
    const [rating, setRating] = useState('0');
    const [spice, setSpice] = useState('0');
    const [tropesInput, setTropesInput] = useState('');

    // --- 用户个人交互数据 (分别存入 user_books & user_favorites 表) ---
    const [readStatus, setReadStatus] = useState<ReadingStatus | 'unread'>('unread');
    const [fave, setFave] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !author.trim()) {
            setErrorMsg('Title and Author are required.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            // 获取当前操作的用户
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error('You must be logged in to add a book.');
            }

            // 解析 Tropes (最多保留 5 个)
            const tropeArray = tropesInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 5);

            // 1️⃣ 构建 books 表的数据载荷 (纯粹的书籍信息)
            const bookPayload = {
                title: title.trim(),
                author: author.trim(),
                series: series.trim() || null,
                series_position: seriesPosition ? parseFloat(seriesPosition) : null,
                subgenre: subgenre.trim() || null,
                cover: cover.trim() || null,
                rating: parseFloat(rating) || null,
                spice: parseInt(spice, 10) || null,
                // 对齐现有的 5 列 trope 字段
                tropes_0: tropeArray[0] || null,
                tropes_1: tropeArray[1] || null,
                tropes_2: tropeArray[2] || null,
                tropes_3: tropeArray[3] || null,
                tropes_4: tropeArray[4] || null,
            };

            // 插入 books 并直接返回新添加书籍的 ID !
            const { data: newBook, error: bookError } = await supabase
                .from('books')
                .insert([bookPayload])
                .select('id')
                .single();

            if (bookError || !newBook) {
                throw bookError
                // || new BookError('Failed to retrieve newly added book ID.');
            }

            const newBookId = newBook.id;

            // 2️⃣ 如果勾选了 Favorite，异步向 user_favorites 表存入关系
            if (fave) {
                const { error: faveError } = await supabase
                    .from('user_favorites')
                    .insert({
                        user_id: user.id,
                        book_id: newBookId,
                    });
                if (faveError) {
                    console.error('Warning: Failed to add to favorites:', faveError);
                }
            }

            // 3️⃣ 如果选择了具体的阅读状态 (非 unread)，异步向 user_books 表更新状态
            if (readStatus && readStatus !== 'unread') {
                const { error: statusError } = await supabase
                    .from('user_books')
                    .insert({
                        user_id: user.id,
                        book_id: newBookId,
                        status: readStatus,
                    });
                if (statusError) {
                    console.error('Warning: Failed to update read status:', statusError);
                }
            }

            // --- 成功回调与清理 ---
            if (onSuccess) {
                onSuccess();
            } else {
                setTitle('');
                setAuthor('');
                setCover('');
                setTropesInput('');
            }
        } catch (err: any) {
            console.error('Add book error:', err);
            setErrorMsg(err.message || 'Failed to archive this tome.');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* 考虑到 Sidebar 占据了屏幕左侧，整个表单采用轻量级两列布局，增加元素内边距 */
        <form onSubmit={handleSubmit} className="
        flex flex-col gap-8 w-full">
            {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-medium">
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* Title & Author (核心高频区域：在手机为单列，电脑为两列) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Book Title *
                    </label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Fourth Wing"
                        className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary transition-colors shadow-inner"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Author *
                    </label>
                    <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. Rebecca Yarros"
                        className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary transition-colors shadow-inner"
                    />
                </div>
            </div>

            {/* 系列信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Series Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        placeholder="e.g. The Empyrean"
                        className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary transition-colors shadow-inner"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Book #
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={seriesPosition}
                        onChange={(e) => setSeriesPosition(e.target.value)}
                        placeholder="1"
                        className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary transition-colors shadow-inner font-[family-name:var(--font-mono)]"
                    />
                </div>
            </div>

            {/* 封面链接与类型 Subgenre */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Cover Image URL
                    </label>
                    <input
                        type="url"
                        value={cover}
                        onChange={(e) => setCover(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-xs text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary transition-colors shadow-inner font-[family-name:var(--font-mono)]"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Subgenre
                    </label>
                    <select
                        value={subgenre}
                        onChange={(e) => setSubgenre(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary transition-colors shadow-inner"
                    >
                        <option value="Romantasy">Romantasy</option>
                        <option value="High Fantasy">High Fantasy</option>
                        <option value="Dark Romance">Dark Romance</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Contemporary">Contemporary</option>
                    </select>
                </div>
            </div>

            {/* 评分 & 辣度 (客观属性) */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 p-4 bg-card/40 border border-line/40 rounded-2xl">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1 font-[family-name:var(--font-mono)]">
                        <span>★</span> Rating (0 - 5)
                    </label>
                    <input
                        type="number"
                        step="0.5"
                        max="5"
                        min="0"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full px-3.5 py-2 bg-bg2 border border-line rounded-xl text-sm font-bold text-ink focus:outline-none focus:border-amber-400/50"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-400 flex items-center gap-1 font-[family-name:var(--font-mono)]">
                        <span>🌶️</span> Spice Level (0 - 5)
                    </label>
                    <input
                        type="number"
                        max="5"
                        min="0"
                        value={spice}
                        onChange={(e) => setSpice(e.target.value)}
                        className="w-full px-3.5 py-2 bg-bg2 border border-line rounded-xl text-sm font-bold text-ink focus:outline-none focus:border-rose-400/50"
                    />
                </div>
            </div>

            {/* Tropes 标签 */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Tropes / Keywords
                    </label>
                    <span className="text-[11px] text-muted font-normal font-[family-name:var(--font-mono)]">
                        Max 5, comma separated
                    </span>
                </div>
                <input
                    type="text"
                    value={tropesInput}
                    onChange={(e) => setTropesInput(e.target.value)}
                    placeholder="Enemies to Lovers, Slow Burn, Fae, Shadow Daddy..."
                    className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-xs text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary font-[family-name:var(--font-mono)] shadow-inner"
                />
            </div>

            {/* --- 个人归档设定区 (区分从公共库数据中抽离，高亮显眼) --- */}
            <div className="pt-2">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-tertiary/10 via-card to-card border border-tertiary/30 space-y-4">
                    <div className="text-xs font-bold text-tertiary uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        ✦ Personal Archive Settings
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* 阅读进度 */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted">Reading Status</label>
                            <select
                                value={readStatus}
                                onChange={(e) => setReadStatus(e.target.value as any)}
                                className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-tertiary"
                            >
                                <option value="unread">Not Started (Unread)</option>
                                <option value="want_to_read">Want to Read (TBR)</option>
                                <option value="reading">Currently Reading</option>
                                <option value="read">Finished Reading</option>
                                <option value="abandoned">Did Not Finish (DNF)</option>
                            </select>
                        </div>

                        {/* 是否点红心 */}
                        <div className="flex items-center sm:justify-end pt-2 sm:pt-4">
                            <label className="flex items-center gap-2.5 cursor-pointer bg-bg2/80 border border-line hover:border-rose-500/50 px-4 py-2 rounded-xl transition-all select-none group">
                                <input
                                    type="checkbox"
                                    checked={fave}
                                    onChange={(e) => setFave(e.target.checked)}
                                    className="rounded w-4 h-4 text-rose-500 focus:ring-0 border-line bg-card cursor-pointer"
                                />
                                <span className="text-xs font-bold text-ink group-hover:text-rose-400 transition-colors">
                                    ❤️ Mark as Favorite
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 提交与取消按钮 (留出足够的底部外边距防止被手机下方安全区遮挡) */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/60">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl border border-line text-xs font-bold text-muted hover:text-ink hover:bg-card transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-tertiary text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-tertiary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {loading && (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{loading ? 'Summoning Tome...' : '+ Add to Library'}</span>
                </button>
            </div>
        </form>
    );
};