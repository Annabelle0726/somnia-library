// src/pages/Discover.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from "../auth/useAuth.ts";
import type { BookWithUserData } from '../types/book';
import { DiscoverFilters } from '../components/discover/DiscoverFilters';
import { DiscoverGrid } from '../components/discover/DiscoverGrid';
import { BookDetailModal } from '../components/library/BookDetailModal';

// 强制每页 4 本书
const ITEMS_PER_PAGE = 4;

export function Discover() {
    const [books, setBooks] = useState<BookWithUserData[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const userId = user?.id;

    const [shuffleSeed, setShuffleSeed] = useState(Date.now());

    // 🎛️ 默认加载：Spice 4+, Arrange by Rating
    const [selectedGenre, setSelectedGenre] = useState<string>('All');
    const [spiceLevel, setSpiceLevel] = useState<number>(4);
    const [sortBy, setSortBy] = useState<string>('rating');

    // 📄 翻页与详情状态
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedBook, setSelectedBook] = useState<BookWithUserData | null>(null);

    // 数据获取 (不变)
    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const { data: allBooks, error: booksError } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (booksError) throw booksError;
            if (!allBooks || allBooks.length === 0) {
                setBooks([]);
                return;
            }

            const bookIds = allBooks.map((b) => b.id);
            let statusMap = new Map();
            let faveSet = new Set();

            if (userId) {
                const { data: statusData } = await supabase
                    .from('user_book_status')
                    .select('book_id, status, progress')
                    .eq('user_id', userId)
                    .in('book_id', bookIds);

                const { data: faveData } = await supabase
                    .from('user_favorites')
                    .select('book_id')
                    .eq('user_id', userId)
                    .in('book_id', bookIds);

                statusMap = new Map(statusData?.map((s) => [s.book_id, s]) || []);
                faveSet = new Set(faveData?.map((f) => f.book_id) || []);
            }

            const formattedBooks: BookWithUserData[] = allBooks.map((book) => {
                const userStatusObj = statusMap.get(book.id);
                return {
                    ...book,
                    user_status: userStatusObj?.status,
                    progress: userStatusObj?.progress || 0,
                    is_fave: faveSet.has(book.id),
                    tropes: [
                        book.tropes_0,
                        book.tropes_1,
                        book.tropes_2,
                        book.tropes_3,
                        book.tropes_4,
                    ].filter(Boolean) as string[],
                };
            });

            setBooks(formattedBooks);
        } catch (err) {
            console.error('Error fetching discover data:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // 过滤与打乱逻辑
    const processedBooks = useMemo(() => {
        let result = [...books];

        if (selectedGenre !== 'All') {
            result = result.filter(b => b.subgenre === selectedGenre);
        }
        if (spiceLevel > 0) {
            result = result.filter(b => (b.spice || 0) >= spiceLevel);
        }

        if (sortBy === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'spice') {
            result.sort((a, b) => (b.spice || 0) - (a.spice || 0));
        } else if (sortBy === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        const shuffled = [...result];
        const seed = shuffleSeed;
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = (seed + i) % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }, [books, selectedGenre, spiceLevel, sortBy, shuffleSeed]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGenre, spiceLevel, sortBy, shuffleSeed]);

    const handleShuffle = () => {
        setShuffleSeed(Date.now());
    };

    const totalPages = Math.ceil(processedBooks.length / ITEMS_PER_PAGE) || 1;
    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedBooks.slice(start, start + ITEMS_PER_PAGE);
    }, [processedBooks, currentPage]);

    return (
        <div className="w-full h-[calc(100vh-6rem)] overflow-hidden flex  justify-between items-center">
            <div className="flex gap-6 h-full w-full overflow-hidden">
                {/* 左侧：探索控制面板 (固定高度) */}
                <div className="w-64 shrink-0 h-full bg-card/50 backdrop-blur-sm border border-line/60 rounded-2xl p-5 flex flex-col gap-6 overflow-hidden">
                    <div className="flex justify-between items-center border-b border-line/30 pb-3 shrink-0">
                        <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-muted">Explore</span>
                        <span className="text-xs text-primary font-bold">✦ Vault</span>
                    </div>

                    {/* 过滤器 */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        <DiscoverFilters
                            selectedGenre={selectedGenre}
                            setSelectedGenre={setSelectedGenre}
                            spiceLevel={spiceLevel}
                            setSpiceLevel={setSpiceLevel}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />
                    </div>

                    <div className="mt-auto pt-4 border-t border-line/30 flex flex-col items-center gap-2 shrink-0">
                        <button
                            onClick={handleShuffle}
                            className="w-full py-2.5 bg-primary/10 border border-primary/30 rounded-xl text-primary text-[11px] font-mono font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            🎲 Shuffle the Shelf
                        </button>
                        <span className="text-[9px] font-mono text-muted/60">Surprise me with new vibes</span>
                    </div>
                </div>

                {/* 右侧：列表区 + 分页导航 (全屏填满，无滚动条) */}
                <div className="flex-1 flex flex-col bg-card/30 border border-line/50 rounded-2xl overflow-hidden relative h-full">
                    {/* 顶部页眉 */}
                    <div className="px-6 py-2 border-b border-line/30 flex justify-between items-center bg-bg/50 shrink-0">
                        <h1 className="font-display font-bold text-lg text-ink hero-title">
                            Discover
                        </h1>
                        <span className="font-mono text-[11px] font-bold text-tertiary uppercase tracking-widest hidden sm:block">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>

                    {/* 🌟 主展示区：使用 flex-1 填满剩余高度，隐藏溢出 */}
                    <div className="flex-1 overflow-hidden p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-[11px] font-mono text-muted animate-pulse">Summoning Archives...</span>
                            </div>
                        ) : processedBooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 bg-bg2/50 rounded-2xl border border-line/40 p-10">
                                <span className="text-3xl">🔮</span>
                                <h3 className="font-display text-base text-ink font-bold">No books match your vibe</h3>
                                <p className="text-xs font-mono text-muted max-w-sm">Try adjusting your genre filter or spice level, or shake the shelf to uncover hidden gems.</p>
                            </div>
                        ) : (
                            <DiscoverGrid
                                books={paginatedBooks}
                                onBookClick={(book) => setSelectedBook(book)}
                            />
                        )}
                    </div>

                    {/* 底部 Pagination 控制栏 */}
                    {!loading && processedBooks.length > 0 && (
                        <div className="shrink-0 px-6 py-3 border-t border-line/20 bg-bg/40 flex items-center justify-between">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="px-5 py-2 rounded-lg border border-line/60 bg-bg2 text-xs font-mono font-medium text-ink hover:border-tertiary disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                            >
                                ← Previous
                            </button>

                            <div className="flex items-center gap-1 text-[11px] font-mono text-muted">
                                <span>Page</span>
                                <span className="text-ink font-bold px-2 py-0.5 rounded bg-bg2 border border-line/40">{currentPage}</span>
                                <span>/ {totalPages}</span>
                            </div>

                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className="px-5 py-2 rounded-lg border border-line/60 bg-bg2 text-xs font-mono font-medium text-ink hover:border-tertiary disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {selectedBook && (
                <BookDetailModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                />
            )}
        </div>
    );
}