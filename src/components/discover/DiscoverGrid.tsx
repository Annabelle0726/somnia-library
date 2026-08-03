// src/components/discover/DiscoverGrid.tsx
import React from 'react';
import type { BookWithUserData } from '../../types/book';
import { DiscoverCard } from './DiscoverCard';

interface DiscoverGridProps {
    books: BookWithUserData[];
    onBookClick: (book: BookWithUserData) => void;
}

export const DiscoverGrid: React.FC<DiscoverGridProps> = ({ books, onBookClick }) => {
    return (
        // 🌟 强行 5 列，1 行，撑满整个展示区域高度
        <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-1 gap-3 sm:gap-6 w-full h-full">
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