// src/pages/Library.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {Book, BookWithUserData} from '../types/book';
import { BookCard } from '../components/library/BookCard';
import { AddBookModal } from '../components/library/AddBookModal';
import {useAuth} from "../auth/useAuth.ts";
import {BookDetailModal} from "../components/library/BookDetailModal.tsx";

export function Library() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // 分页配置 (从默认 12 改为 15，在 5 列布局下刚好 3 行)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(15);

    // 弹窗状态
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [selectedBook, setSelectedBook] = useState<BookWithUserData | null>(null);

    // 提取为独立的 fetch 函数，方便在新增书籍后调用刷新
    const { user } = useAuth();
    const userId = user?.id;
    const fetchBooks = useCallback(async () => {
        // ⚡ 防护：如果用户尚未登录或 userId 还没加载出来，直接退出
        if (!userId) {
            setBooks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // 1. 级联联表查询：查 user_book_status 连带对应的 books 主表数据
            const { data: statusData, error: statusError } = await supabase
                .from('user_book_status')
                .select(`
                status,
                progress,
                books (
                    id,
                    isbn,
                    title,
                    author,
                    series,
                    seriesposition,
                    subgenre,
                    spice,
                    rating,
                    cover,
                    created_at,
                    tropes_0,
                    tropes_1,
                    tropes_2,
                    tropes_3,
                    tropes_4
                )
            `)
                .eq('user_id', userId);

            if (statusError) {
                console.error('Failed to fetch user books:', statusError);
                return;
            }

            // 2. 查询当前用户的收藏列表
            let faveBookIds = new Set<string>();
            const { data: faveData } = await supabase
                .from('user_favorites')
                .select('book_id')
                .eq('user_id', userId);

            if (faveData) {
                faveBookIds = new Set(faveData.map((f) => f.book_id));
            }

            // 3. 展开并组装成 BookWithUserData
            if (statusData) {
                const formattedBooks: BookWithUserData[] = statusData
                    .filter((item) => item.books) // 过滤掉防空记录
                    .map((item: any) => {
                        const book = item.books; // 联表拉出来的公共图书对象
                        return {
                            ...book,
                            user_status: item.status, // 来自 user_book_status 的状态
                            progress: item.progress,   // 来自 user_book_status 的进度
                            is_fave: faveBookIds.has(book.id), // 关联收藏状态
                            tropes: [
                                book.tropes_0,
                                book.tropes_1,
                                book.tropes_2,
                                book.tropes_3,
                                book.tropes_4,
                            ].filter(Boolean),
                        };
                    });

                setBooks(formattedBooks);
            }
        } catch (err) {
            console.error('Error fetching library:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);
    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // 搜索过滤
    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) return books;
        const q = searchQuery.toLowerCase().trim();
        return books.filter(
            (b) =>
                b.title?.toLowerCase().includes(q) ||
                b.author?.toLowerCase().includes(q) ||
                b.series?.toLowerCase().includes(q) ||
                b.subgenre?.toLowerCase().includes(q) ||
                b.isbn?.toLowerCase().includes(q)
        );
    }, [books, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // 分页计算
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
    const currentBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredBooks.slice(start, start + itemsPerPage);
    }, [filteredBooks, currentPage, itemsPerPage]);

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* 顶部：双层高质感 Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/60 border border-line/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        <span>✦ Database Archive</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl hero-title font-display font-bold text-ink tracking-tight">
                        Sanctuary Library
                    </h1>
                </div>

                {/* 搜索框与新进录入按钮 */}
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
                        className="px-4 py-2.5 bg-tertiary text-on-primary font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 whitespace-nowrap"
                    >
                        <span>+ Add</span>
                    </button>
                </div>
            </div>

            {/* 主内容展示区 */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted gap-5">
                    <div className="w-10 h-10 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs tracking-widest uppercase font-[family-name:var(--font-mono)]">
                        Unfolding Archives...
                    </span>
                </div>
            ) : filteredBooks.length === 0 ? (
                /* 搜索无结果：触发一键录入弹窗 */
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-card/40 border border-line/50 rounded-3xl text-center space-y-5 backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-3xl shadow-inner border border-line/40">
                        📜
                    </div>
                    <div className="space-y-1.5 max-w-md">
                        <h3 className="text-xl font-bold text-ink font-display">
                            Cannot find {searchQuery}?
                        </h3>
                        <p className="text-xs text-muted leading-relaxed">
                            This title has not yet been catalogued into your sanctuary. Would you like to summon it into your archives right now?
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all transform hover:-translate-y-0.5"
                    >
                        <span>+ Catalogue "{searchQuery || 'New Tome'}"</span>
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
                        {currentBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onEdit={(b) => {
                                    setSelectedBook(b);
                                }}
                            />
                        ))}
                    </div>

                    {/* 翻页栏 */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-line/60 text-xs text-muted font-[family-name:var(--font-mono)]">
                        <div>
                            Showing <span className="font-bold text-ink">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-ink">{Math.min(currentPage * itemsPerPage, filteredBooks.length)}</span> of <span className="font-bold text-ink">{filteredBooks.length}</span> titles
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-3.5 py-1.5 bg-card border border-line rounded-xl hover:border-tertiary hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted transition-all"
                            >
                                ← Prev
                            </button>

                            <span className="px-3 py-1.5 bg-bg2/80 rounded-xl text-ink font-bold border border-line/40">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-3.5 py-1.5 bg-card border border-line rounded-xl hover:border-tertiary hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted transition-all"
                            >
                                Next →
                            </button>
                        </div>
                    </div>

                </>
            )}
            {selectedBook && (
                <BookDetailModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onUpdate={(updatedBook) => {
                        // 1. 瞬间同步更新外层卡片墙上的该本书（无刷新点亮爱心/改变进度）
                        setBooks((prevBooks) =>
                            prevBooks.map((b) => (b.id === updatedBook.id ? updatedBook : b))
                        );
                        // 2. 同时更新当前打开的 Modal 内部书籍状态
                        setSelectedBook(updatedBook);
                    }}
                />
            )}

            {/* 新增书籍快捷弹窗 */}
            <AddBookModal
                isOpen={isAddModalOpen}
                initialTitle={searchQuery}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    // 录入成功后触发静默刷新，把新加的书立刻呈现出来！
                    fetchBooks();
                }}
            />
        </div>
    );
}