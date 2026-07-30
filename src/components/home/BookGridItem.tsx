// src/components/home/BookGridItem.tsx
import type { BookWithUserData } from '../../types/book';

interface Props {
    book: BookWithUserData;
    colorTheme: 'primary' | 'secondary' | 'tertiary' | 'muted';
    onClick?: (book: BookWithUserData) => void;
}

export function BookGridItem({ book, colorTheme, onClick }: Props) {
    const borderColorMap = {
        primary: 'border-primary/60 ring-primary/30',
        secondary: 'border-secondary/60 ring-secondary/30',
        tertiary: 'border-tertiary/60 ring-tertiary/30',
        muted: 'border-muted/60 ring-muted/30',
    };

    return (
        <div
            onClick={() => onClick?.(book)}
            className={`group relative aspect-[2/3] rounded-xl overflow-hidden border ${borderColorMap[colorTheme]} bg-bg2 cursor-pointer shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300`}
        >
            {book.cover ? (
                <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:brightness-110"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-2xl mb-1">📖</span>
                    <span className="text-xs font-bold line-clamp-2 text-ink">
                        {book.title}
                    </span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                <p className="text-xs font-bold text-white line-clamp-1">
                    {book.title}
                </p>
                <p className="text-[10px] text-tertiary">
                    by {book.author || 'Unknown'}
                </p>
            </div>
        </div>
    );
}