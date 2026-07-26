// src/pages/Library.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {Book, BookWithUserData} from '../types/book';
import { BookCard } from '../components/library/BookCard';
import { AddBookModal } from '../components/library/AddBookModal';
import {useAuth} from "../auth/useAuth.ts";

export function Library() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // 分页配置 (从默认 12 改为 15，在 5 列布局下刚好 3 行)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(15);

    // 弹窗状态
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

    // 提取为独立的 fetch 函数，方便在新增书籍后调用刷新
    const { user } = useAuth();

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            // 1. 查询所有图书
            const { data: booksData, error: booksError } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (booksError) {
                console.error('Failed to fetch books:', booksError);
                return;
            }

            // 2. 如果用户已登录，查询该用户的全部收藏 IDs
            let faveBookIds = new Set<string>();
            if (user) {
                const { data: faveData, error: faveError } = await supabase
                    .from('user_favorites')
                    .select('book_id')
                    .eq('user_id', user.id);

                if (!faveError && faveData) {
                    faveBookIds = new Set(faveData.map((f) => f.book_id));
                }
            }

            // 3. 组合数据：判断每本书的 id 是否在用户的收藏 Set 中
            if (booksData) {
                const formattedBooks = booksData.map((item: any) => ({
                    ...item,
                    is_fave: faveBookIds.has(item.id), // 👈 这一步将数据库存入的收藏持久化还原到页面 UI
                    tropes: [
                        item.tropes_0,
                        item.tropes_1,
                        item.tropes_2,
                        item.tropes_3,
                        item.tropes_4,
                    ].filter(Boolean),
                }));
                setBooks(formattedBooks as BookWithUserData[]);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

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
                b.subgenre?.toLowerCase().includes(q)
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
                        <span>•</span>
                        <span>{books.length} Titles</span>
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
                            placeholder="Title, author, tropes..."
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
                                    // TODO: 后面可以做书籍详情点击查看/修改
                                    console.log('Selected book:', b);
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