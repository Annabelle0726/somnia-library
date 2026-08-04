import React from 'react';
import type { BookRow } from '../../types/book';
import { AppliedTropeList } from './AppliedTropeList';

type DropdownBook = Pick<BookRow, 'id' | 'title' | 'author'>;

interface TropeSelectorProps {
    books: DropdownBook[];
    selectedBookId: string;
    setSelectedBookId: (id: string) => void;
    appliedTropeIds: Set<string>;
    allTropes: { id: string; name: string; description: string }[];
    onToggleTrope: (tropeId: string) => void;
}

export const TropeSelector: React.FC<TropeSelectorProps> = ({
                                                                books, selectedBookId, setSelectedBookId, appliedTropeIds, allTropes, onToggleTrope
                                                            }) => {
    const selectedBook = books.find(b => b.id === selectedBookId);

    return (
        <div className="sticky top-4 bg-card/60 backdrop-blur-xl border border-line/60 rounded-2xl p-6 shadow-2xl">
            <div className="space-y-5">
                {/* 下拉选择框 */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Current Canvas
                    </label>
                    <div className="relative group">
                        <select
                            value={selectedBookId}
                            onChange={(e) => setSelectedBookId(e.target.value)}
                            className="w-full appearance-none bg-bg2/80 border border-line/80 hover:border-primary/60 rounded-xl px-4 py-3.5 text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="" disabled>✦ Select a book to activate tags...</option>
                            {books.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.title.length > 30 ? b.title.slice(0, 30) + '...' : b.title} {b.author ? `— ${b.author}` : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">
                            ▼
                        </div>
                    </div>
                </div>

                {/* 已绑定标签展示区 */}
                <div className="pt-4 border-t border-line/30 min-h-[120px]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider">
                            Applied Elements ({appliedTropeIds.size})
                        </span>
                        {selectedBook && (
                            <span className="text-[9px] font-mono text-primary italic truncate max-w-[150px] border border-primary/20 px-2 py-0.5 rounded-full bg-primary/5">
                                #{selectedBook.title}
                            </span>
                        )}
                    </div>
                    <AppliedTropeList
                        appliedTropeIds={appliedTropeIds}
                        allTropes={allTropes}
                        onToggleTrope={onToggleTrope}
                        selectedBookId={selectedBookId}
                    />
                </div>
            </div>
        </div>
    );
};