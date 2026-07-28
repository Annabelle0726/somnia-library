// src/components/home/BookShelfHeader.tsx
import type { BookWithUserData } from '../../types/book';
import { BookSpine } from './BookSpine';

interface BookShelfRowProps {
    title: string;
    icon: string;
    colorTheme: 'primary' | 'secondary' | 'tertiary' | 'muted';
    books: BookWithUserData[];
    /** 点击图书时的回调 */
    onBookClick?: (book: BookWithUserData) => void;
}

export function BookShelfRow({ title, icon, colorTheme, books, onBookClick }: BookShelfRowProps) {
    const textColorMap = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        tertiary: 'text-tertiary',
        muted: 'text-muted',
    };

    return (
        <div className="flex flex-col gap-3 w-full border-b border-line/30 pb-6 last:border-b-0">
            <div className="flex items-center gap-2 px-1">
                <span className={`text-sm ${textColorMap[colorTheme]}`}>{icon}</span>
                <h3 className="font-display font-bold text-sm text-ink tracking-wide">
                    {title}
                </h3>
            </div>

            {books.length === 0 ? (
                <div className="w-full text-center py-4 select-none border border-line/30 rounded-lg bg-card/20">
                    <p className="font-[family-name:var(--font-decorative)] text-xs text-muted/70 tracking-widest">
                        "No books recorded in this shelf yet."
                    </p>
                </div>
            ) : (
                <div className="flex items-end gap-3 px-2 overflow-x-auto max-w-full no-scrollbar pb-2">
                    {books.map((book) => (
                        <BookSpine
                            key={book.id}
                            title={book.title}
                            colorTheme={colorTheme}
                            onClick={() => onBookClick?.(book)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}