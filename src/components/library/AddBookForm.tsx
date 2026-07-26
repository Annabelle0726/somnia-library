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

    // --- 图书公共元数据 ---
    const [isbn, setIsbn] = useState('');
    const [fetchingIsbn, setFetchingIsbn] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [author, setAuthor] = useState('');
    const [series, setSeries] = useState('');
    const [seriesPosition, setSeriesPosition] = useState('');
    const [subgenre, setSubgenre] = useState('Romantasy');
    const [cover, setCover] = useState('');
    const [rating, setRating] = useState('0');
    const [spice, setSpice] = useState('0');
    const [tropesInput, setTropesInput] = useState('');

    // --- 用户个人交互数据 ---
    const [readStatus, setReadStatus] = useState<ReadingStatus | 'unread'>('unread');
    const [fave, setFave] = useState(false);

    // ⚡ 1. 前端纯数学校验 ISBN 合法性 (支持 ISBN-10 和 ISBN-13)
    const isValidIsbn = (rawIsbn: string): boolean => {
        // 只保留数字和字母 X（忽略大小写，最后统一大写）
        const clean = rawIsbn.replace(/[^0-9X]/gi, '').toUpperCase();

        if (clean.length === 10) {
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                // 前 9 位必须全是数字
                if (!/^\d$/.test(clean[i])) return false;
                sum += (10 - i) * parseInt(clean[i], 10);
            }
            const lastChar = clean[9];
            // 最后一位可以是数字或 X
            if (lastChar !== 'X' && !/^\d$/.test(lastChar)) return false;
            sum += lastChar === 'X' ? 10 : parseInt(lastChar, 10);
            return sum % 11 === 0;
        } else if (clean.length === 13) {
            if (!/^\d{13}$/.test(clean)) return false;
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(clean[i], 10) * (i % 2 === 0 ? 1 : 3);
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            return checkDigit === parseInt(clean[12], 10);
        }
        return false;
    };

    // ⚡ 2. 调用 Open Library API 一键获取书籍详情并自动填充
    const handleFetchByIsbn = async () => {
        // 清洗用户输入，只保留数字和 X
        const cleanIsbn = isbn.replace(/[^0-9X]/gi, '').toUpperCase();

        if (!cleanIsbn) {
            setErrorMsg('Please enter an ISBN first.');
            return;
        }
        if (!isValidIsbn(cleanIsbn)) {
            setErrorMsg('Invalid ISBN format or check digit.');
            return;
        }

        setFetchingIsbn(true);
        setErrorMsg('');

        try {
            // 使用 Open Library API（免费、无限制、无需 API Key）
            const response = await fetch(`https://openlibrary.org/isbn/${cleanIsbn}.json`);

            if (!response.ok) {
                setErrorMsg('No book metadata found for this ISBN online, but you can still enter details manually.');
                setFetchingIsbn(false);
                return;
            }

            const info = await response.json();

            // 填充书名
            if (info.title) {
                setTitle(info.title);
            }

            // 填充作者（Open Library 返回的是 author key 数组，需要逐个获取姓名）
            if (info.authors && info.authors.length > 0) {
                try {
                    const authorNames = await Promise.all(
                        info.authors.slice(0, 5).map(async (authorObj: any) => {
                            // 如果作者信息已经是字符串，直接返回
                            if (typeof authorObj === 'string') return authorObj;
                            // 通过 author key 获取作者详情
                            const authorKey = authorObj.key;
                            const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
                            if (!authorRes.ok) return 'Unknown Author';
                            const authorData = await authorRes.json();
                            return authorData.name || authorData.personal_name || 'Unknown Author';
                        })
                    );
                    setAuthor(authorNames.join(', '));
                } catch (authorErr) {
                    console.error('Failed to fetch author details:', authorErr);
                    // 如果获取作者失败，至少尝试从 author key 中提取
                    const fallbackNames = info.authors.map((a: any) =>
                        typeof a === 'string' ? a : (a.key || 'Unknown Author')
                    );
                    setAuthor(fallbackNames.join(', '));
                }
            }

            // 填充封面图（Open Library 提供多种尺寸的封面）
            if (info.covers && info.covers.length > 0) {
                // -L 是大图，-M 是中图，-S 是小图
                const coverUrl = `https://covers.openlibrary.org/b/id/${info.covers[0]}-L.jpg`;
                setCover(coverUrl);
            }

            // 可选：填充其他信息
            if (info.series && info.series.length > 0) {
                // Open Library 有时会返回丛书信息
                setSeries(info.series[0] || '');
            }

            if (info.subjects && info.subjects.length > 0) {
                // 可以根据主题自动判断流派
                const subjects = info.subjects.map((s: string) => s.toLowerCase());
                if (subjects.some((s: string | string[]) => s.includes('fantasy'))) {
                    setSubgenre('High Fantasy');
                } else if (subjects.some((s: string | string[]) => s.includes('romance'))) {
                    setSubgenre('Dark Romance');
                } else if (subjects.some((s: string | string[]) => s.includes('science fiction'))) {
                    setSubgenre('Sci-Fi');
                }
            }

        } catch (err) {
            console.error('Failed to fetch ISBN data:', err);
            setErrorMsg('Failed to connect to book database. Please fill manually.');
        } finally {
            setFetchingIsbn(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !author.trim()) {
            setErrorMsg('Title and Author are required.');
            return;
        }

        // 提交前可选：校验用户随意输入的 ISBN 是否属于乱填
        const cleanIsbn = isbn.replace(/[^0-9X]/gi, '').toUpperCase();
        if (cleanIsbn && !isValidIsbn(cleanIsbn)) {
            setErrorMsg('The ISBN entered appears to be invalid. Please check or leave it blank.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error('You must be logged in to add a book.');
            }

            const tropeArray = tropesInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 5);

            // 1️⃣ 构建 books 表的数据载荷
            const bookPayload = {
                isbn: cleanIsbn || null,
                title: title.trim(),
                author: author.trim(),
                series: series.trim() || null,
                series_position: seriesPosition ? parseFloat(seriesPosition) : null,
                subgenre: subgenre.trim() || null,
                cover: cover.trim() || null,
                rating: parseFloat(rating) || null,
                spice: parseInt(spice, 10) || null,
                tropes_0: tropeArray[0] || null,
                tropes_1: tropeArray[1] || null,
                tropes_2: tropeArray[2] || null,
                tropes_3: tropeArray[3] || null,
                tropes_4: tropeArray[4] || null,
            };

            const { data: newBook, error: bookError } = await supabase
                .from('books')
                .insert([bookPayload])
                .select('id')
                .single();

            if (bookError || !newBook) {
                throw bookError || new Error('Failed to retrieve newly added book ID.');
            }

            const newBookId = newBook.id;

            // 2️⃣ 存储红心与阅读状态
            if (fave) {
                await supabase.from('user_favorites').insert({ user_id: user.id, book_id: newBookId });
            }
            if (readStatus && readStatus !== 'unread') {
                await supabase.from('user_books').insert({ user_id: user.id, book_id: newBookId, status: readStatus });
            }

            if (onSuccess) {
                onSuccess();
            } else {
                setIsbn('');
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
        <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-2xl mx-auto p-1 font-sans">
            {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-medium">
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* ISBN 与一键联网填充区域 */}
            <div className="p-4 bg-bg2/60 border border-line rounded-2xl space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center justify-between font-[family-name:var(--font-mono)]">
                    <span>ISBN-10 / ISBN-13 (Optional)</span>
                    <span className="text-[10px] text-tertiary font-normal">Auto-fill book details!</span>
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="e.g. 9781649374042"
                        className="flex-1 px-3.5 py-2 bg-card border border-line rounded-xl text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary transition-colors shadow-inner font-[family-name:var(--font-mono)]"
                    />
                    <button
                        type="button"
                        onClick={handleFetchByIsbn}
                        disabled={fetchingIsbn || !isbn.trim()}
                        className="px-4 py-2 bg-tertiary/20 text-tertiary border border-tertiary/40 font-bold text-xs rounded-xl hover:bg-tertiary hover:text-on-primary disabled:opacity-40 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        title="Fetch Title, Author, and Cover by ISBN"
                    >
                        {fetchingIsbn ? (
                            <div className="w-3.5 h-3.5 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>⚡ Fetch Info</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Title & Author */}
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

            {/* 评分 & 辣度 */}
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

            {/* 个人归档设定区 */}
            <div className="pt-2">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-tertiary/10 via-card to-card border border-tertiary/30 space-y-4">
                    <div className="text-xs font-bold text-tertiary uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        ✦ Personal Archive Settings
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
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

            {/* 按钮控制组 */}
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