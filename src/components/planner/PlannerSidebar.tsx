// src/components/planner/PlannerSidebar.tsx
import type { BookWithUserData } from '../../types/book';

interface PlannerSidebarProps {
    readingBooks: BookWithUserData[];
    wantToReadBooks: BookWithUserData[];
    faveBooks: BookWithUserData[];
    onBookClick: (book: BookWithUserData) => void;
}

export function PlannerSidebar({ readingBooks, wantToReadBooks, faveBooks, onBookClick }: PlannerSidebarProps) {
    return (
        <div className="flex flex-col gap-6">

            {/* 1. ⏳ Currently Reading */}
            <div className="bg-card border border-line/60 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="font-display font-bold text-sm text-ink flex items-center justify-between">
                    <span>⏳ Currently Reading</span>
                    <span className="font-mono text-xs text-primary font-bold">{readingBooks.length}</span>
                </h3>

                {readingBooks.length === 0 ? (
                    <p className="text-xs text-muted font-mono py-2 text-center">No active reads</p>
                ) : (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto no-scrollbar">
                        {readingBooks.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => onBookClick(book)}
                                className="flex items-center gap-3 p-2 rounded-xl bg-bg2 border border-line/40 hover:border-primary transition-all cursor-pointer group"
                            >
                                <div className="w-8 h-11 bg-card rounded overflow-hidden flex-shrink-0 border border-line">
                                    {book.cover ? (
                                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs">📖</div>
                                    )}
                                </div>
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="font-bold text-xs text-ink line-clamp-1 group-hover:text-primary transition-colors">
                                        {book.title}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. 📌 Want to Read Queue */}
            <div className="bg-card border border-line/60 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="font-display font-bold text-sm text-ink flex items-center justify-between">
                    <span>📌 Want to Read</span>
                    <span className="font-mono text-xs text-tertiary font-bold">{wantToReadBooks.length}</span>
                </h3>

                {wantToReadBooks.length === 0 ? (
                    <p className="text-xs text-muted font-mono py-2 text-center">TBR is empty</p>
                ) : (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto no-scrollbar">
                        {wantToReadBooks.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => onBookClick(book)}
                                className="flex items-center gap-3 p-2 rounded-xl bg-bg2 border border-line/40 hover:border-tertiary transition-all cursor-pointer group"
                            >
                                <span className="text-sm">📖</span>
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="font-bold text-xs text-ink line-clamp-1 group-hover:text-tertiary transition-colors">
                                        {book.title}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. ♥ Favorites */}
            <div className="bg-card border border-line/60 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="font-display font-bold text-sm text-ink flex items-center justify-between">
                    <span>♥ Favorites</span>
                    <span className="font-mono text-xs text-secondary font-bold">{faveBooks.length}</span>
                </h3>

                {faveBooks.length === 0 ? (
                    <p className="text-xs text-muted font-mono py-2 text-center">No favorites yet</p>
                ) : (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto no-scrollbar">
                        {faveBooks.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => onBookClick(book)}
                                className="flex items-center gap-3 p-2 rounded-xl bg-bg2 border border-line/40 hover:border-secondary transition-all cursor-pointer group"
                            >
                                <div className="w-6 h-8 bg-card rounded overflow-hidden flex-shrink-0 border border-line">
                                    {book.cover ? (
                                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px]">📖</div>
                                    )}
                                </div>
                                <span className="font-bold text-xs text-ink line-clamp-1 group-hover:text-secondary transition-colors">
                                    {book.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}