// src/components/library/BookFormFields.tsx
import React from 'react';
import type { BookFormData } from '../../hooks/useBookForm';
import type { ReadingStatus } from '../../types/book';

interface BookFormFieldsProps {
    form: BookFormData;
    updateField: <K extends keyof BookFormData>(key: K, value: BookFormData[K]) => void;
    loading: boolean;
    errorMsg: string;
    fetchingIsbn: boolean;
    fetchByIsbn: () => Promise<void>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel?: () => void;
}

export const BookFormFields: React.FC<BookFormFieldsProps> = ({
                                                                  form,
                                                                  updateField,
                                                                  loading,
                                                                  errorMsg,
                                                                  fetchingIsbn,
                                                                  fetchByIsbn,
                                                                  onSubmit,
                                                                  onCancel,
                                                              }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6 text-left max-w-2xl mx-auto p-1 font-sans">
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
                        value={form.isbn}
                        onChange={(e) => updateField('isbn', e.target.value)}
                        placeholder="e.g. 9781649374042"
                        className="flex-1 px-3.5 py-2 bg-card border border-line rounded-xl text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary transition-colors shadow-inner font-[family-name:var(--font-mono)]"
                    />
                    <button
                        type="button"
                        onClick={fetchByIsbn}
                        disabled={fetchingIsbn || !form.isbn.trim()}
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
                        value={form.title}
                        onChange={(e) => updateField('title', e.target.value)}
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
                        value={form.author}
                        onChange={(e) => updateField('author', e.target.value)}
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
                        value={form.series}
                        onChange={(e) => updateField('series', e.target.value)}
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
                        value={form.seriesPosition}
                        onChange={(e) => updateField('seriesPosition', e.target.value)}
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
                        value={form.cover}
                        onChange={(e) => updateField('cover', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-bg2/90 border border-line rounded-xl text-xs text-ink placeholder:text-muted/50 focus:outline-none focus:border-tertiary transition-colors shadow-inner font-[family-name:var(--font-mono)]"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        Subgenre
                    </label>
                    <select
                        value={form.subgenre}
                        onChange={(e) => updateField('subgenre', e.target.value)}
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
                        value={form.rating}
                        onChange={(e) => updateField('rating', e.target.value)}
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
                        value={form.spice}
                        onChange={(e) => updateField('spice', e.target.value)}
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
                    value={form.tropesInput}
                    onChange={(e) => updateField('tropesInput', e.target.value)}
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
                                value={form.readStatus}
                                onChange={(e) => updateField('readStatus', e.target.value as ReadingStatus | 'unread')}
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
                                    checked={form.fave}
                                    onChange={(e) => updateField('fave', e.target.checked)}
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