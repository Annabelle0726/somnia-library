// src/pages/Library.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { BookWithUserData } from '../types/book';
import { BookCard } from '../components/library/BookCard';
import { AddBookModal } from '../components/library/AddBookModal';
import { useAuth } from "../auth/useAuth.ts";
import { BookDetailModal } from "../components/library/BookDetailModal.tsx";

// 定义排序类型
type SortOption = 'default' | 'rating_desc' | 'spice_desc' | 'spice_asc' | 'title_asc';
// 定义辣度筛选类型
type SpiceFilterOption = 'all' | '0' | '1-2' | '3-4' | '5';
// 定义评分筛选类型
type RatingFilterOption = 'all' | '4plus' | '3plus';

export function Library() {
    const [books, setBooks] = useState<BookWithUserData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // 🎛️ 新增：排序与筛选状态
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [spiceFilter, setSpiceFilter] = useState<SpiceFilterOption>('all');
    const [ratingFilter, setRatingFilter] = useState<RatingFilterOption>('all');

    // 分页配置 (在 5 列布局下刚好 3 行)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(15);

    // 弹窗状态
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [selectedBook, setSelectedBook] = useState<BookWithUserData | null>(null);

    const { user } = useAuth();
    const userId = user?.id;

    // 基础默认排序逻辑（Favorites > Reading Status > Created Time）
    const sortBooksDefault = (bookList: BookWithUserData[]) => {
        return [...bookList].sort((a, b) => {
            if (a.is_fave !== b.is_fave) {
                return a.is_fave ? -1 : 1;
            }

            const statusPriority: Record<string, number> = {
                reading: 1,
                want_to_read: 2,
                read: 3,
                abandoned: 4,
            };

            const priorityA = statusPriority[a.user_status || ''] || 99;
            const priorityB = statusPriority[b.user_status || ''] || 99;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            return 0;
        });
    };

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            // 1. 获取所有书籍
            const { data: allBooks, error: booksError } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (booksError) {
                console.error('Failed to fetch books:', booksError);
                return;
            }

            if (!allBooks || allBooks.length === 0) {
                setBooks([]);
                return;
            }

            const bookIds = allBooks.map((b) => b.id);

            let statusMap = new Map();
            let faveSet = new Set();
            let tropesMap = new Map<string, string[]>(); // 新增：用于存标签的Map

            if (userId) {
                // 获取状态和收藏
                const [{ data: statusData }, { data: faveData }] = await Promise.all([
                    supabase
                        .from('user_book_status')
                        .select('book_id, status, progress')
                        .eq('user_id', userId)
                        .in('book_id', bookIds),
                    supabase
                        .from('user_favorites')
                        .select('book_id')
                        .eq('user_id', userId)
                        .in('book_id', bookIds)
                ]);

                statusMap = new Map(statusData?.map((s) => [s.book_id, s]) || []);
                faveSet = new Set(faveData?.map((f) => f.book_id) || []);

                // ================= 核心修复：获取并拼接 Tropes =================
                // 从中间表查出书ID 和 对应的标签名
                const { data: tropesData } = await supabase
                    .from('user_book_tropes')
                    .select('book_id, tropes!inner(name)')
                    .eq('user_id', userId)
                    .in('book_id', bookIds);

                // 将数据整理成 Map: { bookId: ['TropeA', 'TropeB'] }
                if (tropesData) {
                    tropesData.forEach(item => {
                        const existing = tropesMap.get(item.book_id) || [];
                        // 注意：tropes!inner 联表会返回一个对象 { name: 'xxx' }
                        const tropeName = (item.tropes as any)?.name;
                        if (tropeName) {
                            tropesMap.set(item.book_id, [...existing, tropeName]);
                        }
                    });
                }
                // ============================================================
            }

            const formattedBooks: BookWithUserData[] = allBooks.map((book) => {
                const userStatusObj = statusMap.get(book.id);
                return {
                    ...book,
                    user_status: userStatusObj?.status,
                    is_fave: faveSet.has(book.id),
                    tropes: tropesMap.get(book.id) || [],
                };
            });

            setBooks(sortBooksDefault(formattedBooks));
        } catch (err) {
            console.error('Error fetching library:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const handleFavoriteToggle = useCallback((bookId: string, isFave: boolean) => {
        setBooks((prevBooks) => {
            const updated = prevBooks.map((b) =>
                b.id === bookId ? { ...b, is_fave: isFave } : b
            );
            return sortBooksDefault(updated);
        });
    }, []);

    // 🔍 核心逻辑：结合搜索 + 筛选 (Spice/Rating) + 动态排序 (SortBy)
    const processedBooks = useMemo(() => {
        let result = [...books];

        // 1. 文本搜索过滤
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(
                (b) =>
                    b.title?.toLowerCase().includes(q) ||
                    b.isbn?.toLowerCase().includes(q) ||
                    b.author?.toLowerCase().includes(q) ||
                    b.series?.toLowerCase().includes(q) ||
                    b.subgenre?.toLowerCase().includes(q)
            );
        }

        // 2. 🌶️ Spice Level 筛选
        if (spiceFilter !== 'all') {
            result = result.filter((b) => {
                const s = b.spice ?? 0;
                if (spiceFilter === '0') return s === 0;
                if (spiceFilter === '1-2') return s >= 1 && s <= 2;
                if (spiceFilter === '3-4') return s >= 3 && s <= 4;
                if (spiceFilter === '5') return s === 5;
                return true;
            });
        }

        // 3. ★ Rating 筛选
        if (ratingFilter !== 'all') {
            result = result.filter((b) => {
                const r = Number(b.rating) || 0;
                if (ratingFilter === '4plus') return r >= 4.0;
                if (ratingFilter === '3plus') return r >= 3.0;
                return true;
            });
        }

        // 4. 🔀 动态排序
        result.sort((a, b) => {
            if (sortBy === 'rating_desc') {
                return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            }
            if (sortBy === 'spice_desc') {
                return (b.spice ?? 0) - (a.spice ?? 0);
            }
            if (sortBy === 'spice_asc') {
                return (a.spice ?? 0) - (b.spice ?? 0);
            }
            if (sortBy === 'title_asc') {
                return a.title.localeCompare(b.title);
            }

            // 'default': Favorites 优先 -> Status 优先
            if (a.is_fave !== b.is_fave) return a.is_fave ? -1 : 1;
            const statusPriority: Record<string, number> = { reading: 1, want_to_read: 2, read: 3, abandoned: 4 };
            const priorityA = statusPriority[a.user_status || ''] || 99;
            const priorityB = statusPriority[b.user_status || ''] || 99;
            return priorityA - priorityB;
        });

        return result;
    }, [books, searchQuery, spiceFilter, ratingFilter, sortBy]);

    // 搜索或筛选变化时，重置到第 1 页
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, spiceFilter, ratingFilter, sortBy]);

    // 分页计算
    const totalPages = Math.ceil(processedBooks.length / itemsPerPage) || 1;
    const currentBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedBooks.slice(start, start + itemsPerPage);
    }, [processedBooks, currentPage, itemsPerPage]);

    // 重置所有筛选
    const resetFilters = () => {
        setSearchQuery('');
        setSortBy('default');
        setSpiceFilter('all');
        setRatingFilter('all');
    };

    const hasActiveFilters = searchQuery || sortBy !== 'default' || spiceFilter !== 'all' || ratingFilter !== 'all';

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* 顶部 Header & 搜索栏 */}
            <div className="flex flex-col gap-6 bg-card/60 border border-line/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider font-mono">
                            <span>✦ Database Archive</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl hero-title font-display font-bold text-ink tracking-tight">
                            Sanctuary Library
                        </h1>
                    </div>

                    {/* 搜索框与 Add 按钮 */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <span className="absolute inset-y-0 left-3.5 flex items-center text-muted pointer-events-none text-sm">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Title, Author, ISBN..."
                                className="w-full pl-10 pr-8 py-2.5 bg-bg2/90 border border-line rounded-2xl text-xs sm:text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-tertiary transition-all shadow-inner"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-3.5 flex items-center text-muted hover:text-ink text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2.5 bg-tertiary text-on-primary font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                            <span>+ Add</span>
                        </button>
                    </div>
                </div>

                {/* 🎛️ 筛选与排序控制条 (Filter & Sort Bar) */}
                <div className="border-line/40 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* 🌶️ Spice Filter */}
                        <div className="flex items-center gap-1.5 bg-bg2/80 border border-line/60 rounded-xl px-3 py-1.5">
                            <span className="text-muted font-medium">🌶️ Spice:</span>
                            <select
                                value={spiceFilter}
                                onChange={(e) => setSpiceFilter(e.target.value as SpiceFilterOption)}
                                className="bg-transparent text-ink font-bold focus:outline-none cursor-pointer"
                            >
                                <option value="all" className="bg-card text-ink">All Levels</option>
                                <option value="0" className="bg-card text-ink">0 (Clean)</option>
                                <option value="1-2" className="bg-card text-ink">1 - 2 (Mild)</option>
                                <option value="3-4" className="bg-card text-ink">3 - 4 (Medium)</option>
                                <option value="5" className="bg-card text-ink">5 (Explicit)</option>
                            </select>
                        </div>

                        {/* ★ Rating Filter */}
                        <div className="flex items-center gap-1.5 bg-bg2/80 border border-line/60 rounded-xl px-3 py-1.5">
                            <span className="text-muted font-medium">★ Rating:</span>
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value as RatingFilterOption)}
                                className="bg-transparent text-ink font-bold focus:outline-none cursor-pointer"
                            >
                                <option value="all" className="bg-card text-ink">All Ratings</option>
                                <option value="4plus" className="bg-card text-ink">4.0+ Stars</option>
                                <option value="3plus" className="bg-card text-ink">3.0+ Stars</option>
                            </select>
                        </div>

                        {/* 重置过滤器 */}
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="px-2.5 py-1.5 text-[11px] text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-all cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* 🔀 Sort By Dropdown */}
                    <div className="flex items-center gap-2 bg-bg2/80 border border-line/60 rounded-xl px-3 py-1.5">
                        <span className="text-muted font-medium">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-transparent text-tertiary font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="default" className="bg-card text-ink">Default (Faves & Status)</option>
                            <option value="spice_desc" className="bg-card text-ink">Spice (High → Low) 🌶️</option>
                            <option value="spice_asc" className="bg-card text-ink">Spice (Low → High) 🌶️</option>
                            <option value="rating_desc" className="bg-card text-ink">Rating (High → Low) ★</option>
                            <option value="title_asc" className="bg-card text-ink">Title (A - Z)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 主内容展示区 */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted gap-5">
                    <div className="w-10 h-10 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs tracking-widest uppercase font-mono">
                        Unfolding Archives...
                    </span>
                </div>
            ) : processedBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-card/40 border border-line/50 rounded-3xl text-center space-y-5 backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-3xl shadow-inner border border-line/40">
                        📜
                    </div>
                    <div className="space-y-1.5 max-w-md">
                        <h3 className="text-xl font-bold text-ink font-display">
                            No matching titles found
                        </h3>
                        <p className="text-xs text-muted leading-relaxed">
                            No books match your current search queries or filters. Try adjusting your Spice Level, Rating filter, or search term.
                        </p>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
                        {currentBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onEdit={(b) => setSelectedBook(b)}
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        ))}
                    </div>

                    {/* 翻页栏 */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-line/60 text-xs text-muted font-mono">
                        <div>
                            Showing <span className="font-bold text-ink">{processedBooks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-ink">{Math.min(currentPage * itemsPerPage, processedBooks.length)}</span> of <span className="font-bold text-ink">{processedBooks.length}</span> titles
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* 第一页 */}
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="px-2.5 py-1.5 bg-card border border-line rounded-xl hover:border-tertiary hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted transition-all cursor-pointer"
                                title="First Page"
                            >
                                « First
                            </button>

                            {/* 上一页 */}
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-3 py-1.5 bg-card border border-line rounded-xl hover:border-tertiary hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted transition-all cursor-pointer"
                            >
                                ← Prev
                            </button>

                            {/* 页码指示 */}
                            <span className="px-3 py-1.5 bg-bg2/80 rounded-xl text-ink font-bold border border-line/40">
            {currentPage} / {totalPages}
        </span>

                            {/* 下一页 */}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-3 py-1.5 bg-card border border-line rounded-xl hover:border-tertiary hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted transition-all cursor-pointer"
                            >
                                Next →
                            </button>

                            {/* 最后一页 */}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                className="px-2.5 py-1.5 bg-card border border-line rounded-xl hover:border-tertiary hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted transition-all cursor-pointer"
                                title="Last Page"
                            >
                                Last »
                            </button>
                        </div>
                    </div>                </>
            )}

            {selectedBook && (
                <BookDetailModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onUpdate={(updatedBook) => {
                        setBooks((prevBooks) =>
                            sortBooksDefault(prevBooks.map((b) => (b.id === updatedBook.id ? updatedBook : b)))
                        );
                        setSelectedBook(updatedBook);
                    }}
                />
            )}

            <AddBookModal
                isOpen={isAddModalOpen}
                initialTitle={searchQuery}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchBooks();
                }}
            />
        </div>
    );
}