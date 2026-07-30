// src/components/planner/ScheduleModal.tsx
import { useState } from 'react';
import type { BookWithUserData } from '../../types/book';

interface ScheduleModalProps {
    dateStr: string;
    availableBooks: BookWithUserData[];
    onClose: () => void;
    onSave: (dateStr: string, bookId: string) => void;
}

export function ScheduleModal({ dateStr, availableBooks, onClose, onSave }: ScheduleModalProps) {
    const [selectedBookId, setSelectedBookId] = useState<string>('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-line rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-line/40 pb-3">
                    <h3 className="font-display font-bold text-base text-ink">
                        📅 Schedule: {dateStr}
                    </h3>
                    <button onClick={onClose} className="text-muted hover:text-ink text-sm transition-colors">
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-muted">Select a book to schedule:</label>
                    <select
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="w-full bg-bg2 border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-tertiary"
                    >
                        <option value="">-- Choose a book --</option>
                        {availableBooks.map((book) => (
                            <option key={book.id} value={book.id}>
                                {book.title} ({book.user_status || 'Uncategorized'})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-mono text-muted hover:text-ink">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(dateStr, selectedBookId)}
                        disabled={!selectedBookId}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-mono font-bold disabled:opacity-50 cursor-pointer"
                    >
                        Save Plan
                    </button>
                </div>
            </div>
        </div>
    );
}