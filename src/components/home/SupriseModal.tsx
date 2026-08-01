// src/components/home/SupriseModal.tsx
import React, { useState, useEffect } from 'react';
import type { BookWithUserData } from '../../types/book';

interface SurpriseModalProps {
    isOpen: boolean;
    pool: BookWithUserData[];
    initialBook: BookWithUserData | null;
    onClose: () => void;
    onSelectBook: (book: BookWithUserData) => void;
}

export const SurpriseModal: React.FC<SurpriseModalProps> = ({
                                                                isOpen,
                                                                pool,
                                                                initialBook,
                                                                onClose,
                                                                onSelectBook,
                                                            }) => {
    const [currentBook, setCurrentBook] = useState<BookWithUserData | null>(initialBook);
    const [isRolling, setIsRolling] = useState<boolean>(false);

    // Filter out abandoned books as a fallback
    const activePool = pool.filter((b) => b.user_status !== 'abandoned');

    useEffect(() => {
        if (isOpen) {
            setCurrentBook(initialBook);
            setIsRolling(false);
        }
    }, [initialBook, isOpen]);

    if (!isOpen || !currentBook) return null;

    // Reroll selection logic
    const handleRollAgain = () => {
        if (isRolling || activePool.length === 0) return;
        setIsRolling(true);

        // Exclude current book if pool size allows
        const availablePool = (activePool.length > 1 && currentBook)
            ? activePool.filter((b) => b.id !== currentBook.id)
            : activePool;

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * availablePool.length);
            setCurrentBook(availablePool[randomIndex] || currentBook);
            setIsRolling(false);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal card container */}
            <div
                className="relative z-10 w-full max-w-md bg-gradient-to-b from-card via-bg2 to-card border border-line/80 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header and close button */}
                <div className="w-full flex items-center justify-between border-b border-line/40 pb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🎲</span>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-tertiary">
                            Blind Book Reveal
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink hover:border-tertiary transition-all cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Book display area / Rolling state */}
                <div className="w-full py-4 flex flex-col items-center justify-center min-h-[260px]">
                    {isRolling ? (
                        <div className="flex flex-col items-center space-y-3 py-10">
                            <div className="text-5xl animate-bounce">🎲</div>
                            <p className="font-mono text-xs text-tertiary animate-pulse tracking-widest">
                                Rolling the fate dice...
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4 animate-in zoom-in-90 duration-300">
                            {/* Book cover */}
                            <div className="relative aspect-[2/3] w-32 rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                                {currentBook.cover ? (
                                    <img
                                        src={currentBook.cover}
                                        alt={currentBook.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-bg2 flex items-center justify-center text-4xl">
                                        📖
                                    </div>
                                )}
                            </div>

                            {/* Title and author */}
                            <div className="space-y-1 max-w-xs">
                                <h3 className="font-display font-bold text-xl text-ink line-clamp-1">
                                    {currentBook.title}
                                </h3>
                                <p className="text-xs text-muted truncate">
                                    by <span className="text-ink font-medium">{currentBook.author || 'Unknown'}</span>
                                </p>
                            </div>

                            {/* Metrics and badges */}
                            <div className="flex items-center gap-3 text-xs font-mono text-muted bg-card/60 px-3 py-1.5 rounded-full border border-line">
                                <span>★ {currentBook.rating ? Number(currentBook.rating).toFixed(1) : 'N/A'}</span>
                                <span>•</span>
                                <span>🌶️ {currentBook.spice || 0}/5</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom action buttons */}
                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                    {/* Roll again button */}
                    <button
                        onClick={handleRollAgain}
                        disabled={isRolling}
                        className="w-full py-2.5 px-4 rounded-xl bg-bg2 border border-line text-xs font-mono font-bold text-ink hover:border-tertiary hover:text-tertiary transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <span className={isRolling ? 'animate-spin' : ''}>🎲</span>
                        Roll Again
                    </button>

                    {/* View details button */}
                    <button
                        onClick={() => {
                            onClose();
                            onSelectBook(currentBook);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary border border-primary/60 text-xs font-display font-bold tracking-wide shadow-md hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                        <span>📖</span> View Book
                    </button>
                </div>
            </div>
        </div>
    );
};