// src/components/library/AddBookForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

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

    // 表单基础状态
    const [title, setTitle] = useState(initialTitle);
    const [author, setAuthor] = useState('');
    const [series, setSeries] = useState('');
    const [seriesPosition, setSeriesPosition] = useState('');
    const [subgenre, setSubgenre] = useState('Romantasy');
    const [cover, setCover] = useState('');
    const [rating, setRating] = useState('0');
    const [spice, setSpice] = useState('0');
    const [readStatus, setReadStatus] = useState('Unread');
    const [fave, setFave] = useState(false);

    // 标签状态 (以逗号分隔输入)
    const [tropesInput, setTropesInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !author.trim()) {
            setErrorMsg('Title and Author are required.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 解析 Tropes 标签（最多前5个，写入对应的 database 字段）
            const tropeArray = tropesInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const payload = {
                owner_id: user?.id || null,
                title: title.trim(),
                author: author.trim(),
                series: series.trim() || null,
                series_position: seriesPosition ? parseInt(seriesPosition, 10) : null,
                subgenre: subgenre.trim() || null,
                cover: cover.trim() || null,
                rating: parseFloat(rating) || 0,
                spice: parseInt(spice, 10) || 0,
                read_status: readStatus,
                fave: fave,
                // 对齐你现有的数据库字段
                tropes_0: tropeArray[0] || null,
                tropes_1: tropeArray[1] || null,
                tropes_2: tropeArray[2] || null,
                tropes_3: tropeArray[3] || null,
                tropes_4: tropeArray[4] || null,
            };

            const { error } = await supabase.from('books').insert([payload]);

            if (error) throw error;

            // 成功回调
            if (onSuccess) onSuccess();
            else {
                alert('✨ Book added successfully!');
                // 重置表单
                setTitle('');
                setAuthor('');
                setCover('');
                setTropesInput('');
            }
        } catch (err: any) {
            console.error('Add book error:', err);
            setErrorMsg(err.message || 'Failed to add book to archives.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* 核心必填区域 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-ink">Book Title *</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. A Court of Thorns and Roses"
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-ink">Author *</label>
                    <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. Sarah J. Maas"
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary"
                    />
                </div>
            </div>

            {/* 封面与系列 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-ink">Cover Image URL</label>
                    <input
                        type="url"
                        value={cover}
                        onChange={(e) => setCover(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary font-[family-name:var(--font-mono)] text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-ink">Subgenre</label>
                    <select
                        value={subgenre}
                        onChange={(e) => setSubgenre(e.target.value)}
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary"
                    >
                        <option value="Romantasy">Romantasy</option>
                        <option value="Fantasy">High Fantasy</option>
                        <option value="Dark Romance">Dark Romance</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Contemporary">Contemporary</option>
                    </select>
                </div>
            </div>

            {/* 系列信息 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-ink">Series Name (Optional)</label>
                    <input
                        type="text"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        placeholder="e.g. ACOTAR"
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-ink">Book #</label>
                    <input
                        type="number"
                        value={seriesPosition}
                        onChange={(e) => setSeriesPosition(e.target.value)}
                        placeholder="1"
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-sm text-ink focus:outline-none focus:border-tertiary"
                    />
                </div>
            </div>

            {/* 状态与评分 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-line/40">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-ink">Status</label>
                    <select
                        value={readStatus}
                        onChange={(e) => setReadStatus(e.target.value)}
                        className="w-full px-2.5 py-2 bg-bg2 border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-tertiary"
                    >
                        <option value="Unread">Unread</option>
                        <option value="Reading">Reading</option>
                        <option value="Finished">Finished</option>
                        <option value="DNF">DNF</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-ink">Rating (0-5)</label>
                    <input
                        type="number"
                        step="0.5"
                        max="5"
                        min="0"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-tertiary"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-ink">Spice 🌶️ (0-5)</label>
                    <input
                        type="number"
                        max="5"
                        min="0"
                        value={spice}
                        onChange={(e) => setSpice(e.target.value)}
                        className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-tertiary"
                    />
                </div>

                <div className="flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer bg-bg2/60 border border-line px-3 py-2 rounded-xl hover:bg-bg2 transition-colors">
                        <input
                            type="checkbox"
                            checked={fave}
                            onChange={(e) => setFave(e.target.checked)}
                            className="rounded text-primary focus:ring-0"
                        />
                        <span className="text-xs font-bold text-amber-300">⭐ Favorite</span>
                    </label>
                </div>
            </div>

            {/* 标签 Tropes */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-ink flex justify-between">
                    <span>Tropes / Tags</span>
                    <span className="text-[10px] text-muted font-normal">Separate with commas (max 5)</span>
                </label>
                <input
                    type="text"
                    value={tropesInput}
                    onChange={(e) => setTropesInput(e.target.value)}
                    placeholder="Enemies to Lovers, Fae, Slow Burn..."
                    className="w-full px-3 py-2 bg-bg2 border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-tertiary font-[family-name:var(--font-mono)]"
                />
            </div>

            {/* 按钮控制组 */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/40">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-line text-xs font-bold text-muted hover:text-ink hover:bg-card transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{loading ? 'Archiving...' : '+ Add to Library'}</span>
                </button>
            </div>
        </form>
    );
};