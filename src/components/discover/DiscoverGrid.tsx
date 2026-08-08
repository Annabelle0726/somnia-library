import React from 'react';
import type { BookWithUserData } from '../../types/book';
import { DiscoverCard } from './DiscoverCard';

interface DiscoverGridProps {
    books: BookWithUserData[];
    onBookClick: (book: BookWithUserData) => void;
}

export const DiscoverGrid: React.FC<DiscoverGridProps> = ({ books, onBookClick }) => {
    return (
        // 🌟 采用 grid-cols-2 和 min-h-0 强制填满屏幕
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full h-full min-h-0">
            {books.map((book) => (
                <DiscoverCard
                    key={book.id}
                    book={book}
                    onClick={() => onBookClick(book)}
                />
            ))}
        </div>
    );
};