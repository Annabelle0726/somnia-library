// src/pages/Shelves.tsx (或组件形式)
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BookWithUserData } from '../types/book';
import { BookShelfRow } from '../components/home/BookShelfRow';
import { BookDetailModal } from '../components/library/BookDetailModal';

export function Shelves() {
    const [loading, setLoading] = useState(true);

    const [readingBooks, setReadingBooks] = useState<BookWithUserData[]>([]);
    const [wantToReadBooks, setWantToReadBooks] = useState<BookWithUserData[]>([]);
    const [readBooks, setReadBooks] = useState<BookWithUserData[]>([]);
    const [faveBooks, setFaveBooks] = useState<BookWithUserData[]>([]);
    // const [abandonedBooks, setAbandonedBooks] = useState<BookWithUserData[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState<BookWithUserData | null>(null);

    useEffect(() => {
        async function fetchShelvesData() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();

                const { data: allBooks, error: booksErr } = await supabase
                    .from('books')
                    .select('*');

                if (booksErr) throw booksErr;
                if (!allBooks) return;

                let userStatuses: Record<string, { status: any; progress: number }> = {};
                let userFaves = new Set<string>();

                if (user) {
                    const [statusRes, favesRes] = await Promise.all([
                        supabase
                            .from('user_book_status')
                            .select('book_id, status, progress')
                            .eq('user_id', user.id),
                        supabase
                            .from('user_favorites')
                            .select('book_id')
                            .eq('user_id', user.id),
                    ]);

                    if (statusRes.data) {
                        statusRes.data.forEach((s) => {
                            if (s.status) {
                                userStatuses[s.book_id] = {
                                    status: s.status,
                                    progress: s.progress || 0,
                                };
                            }
                        });
                    }
                    if (favesRes.data) {
                        favesRes.data.forEach((f) => userFaves.add(f.book_id));
                    }
                }

                // 分类解析
                const reading: BookWithUserData[] = [];
                const wantToRead: BookWithUserData[] = [];
                const read: BookWithUserData[] = [];
                const faves: BookWithUserData[] = [];
                // const abandoned: BookWithUserData[] = [];

                allBooks.forEach((rawBook: any) => {
                    const statusInfo = userStatuses[rawBook.id];
                    const isFavorite = userFaves.has(rawBook.id);

                    const bookWithUser: BookWithUserData = {
                        ...rawBook,
                        is_fave: isFavorite,
                        user_status: statusInfo?.status,
                        progress: statusInfo?.progress ?? 0,
                    };

                    const status = bookWithUser.user_status;

                    if (status === 'reading') reading.push(bookWithUser);
                    else if (status === 'want_to_read') wantToRead.push(bookWithUser);
                    else if (status === 'read') read.push(bookWithUser);
                    // else if (status === 'abandoned') abandoned.push(bookWithUser);

                    if (bookWithUser.is_fave) faves.push(bookWithUser);
                });

                setReadingBooks(reading);
                setWantToReadBooks(wantToRead);
                setReadBooks(read);
                setFaveBooks(faves);
                // setAbandonedBooks(abandoned);
            } catch (err) {
                console.error('Error loading shelves:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchShelvesData();
    }, []);

    // 搜索过滤函数
    const filterBooks = (list: BookWithUserData[]) => {
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            (b) =>
                b.title.toLowerCase().includes(q) ||
                (b.author && b.author.toLowerCase().includes(q))
        );
    };

    // 同步更新回调
    const handleBookUpdate = (updatedBook: BookWithUserData) => {
        setSelectedBook(updatedBook);

        const updateList = (prev: BookWithUserData[], targetStatus?: string) => {
            const isMatch = targetStatus ? updatedBook.user_status === targetStatus : true;
            const exists = prev.some((b) => b.id === updatedBook.id);

            if (isMatch) {
                return exists
                    ? prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
                    : [...prev, updatedBook];
            } else {
                return prev.filter((b) => b.id !== updatedBook.id);
            }
        };

        setReadingBooks((prev) => updateList(prev, 'reading'));
        setWantToReadBooks((prev) => updateList(prev, 'want_to_read'));
        setReadBooks((prev) => updateList(prev, 'read'));
        // setAbandonedBooks((prev) => updateList(prev, 'abandoned'));

        setFaveBooks((prev) => {
            if (updatedBook.is_fave) {
                const exists = prev.some((b) => b.id === updatedBook.id);
                return exists
                    ? prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
                    : [...prev, updatedBook];
            } else {
                return prev.filter((b) => b.id !== updatedBook.id);
            }
        });
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* 页头 */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-line/40 pb-6">
                <div>
                    <h1 className="font-display text-3xl font-bold text-ink
                    flex items-center gap-2 hero-title">
                        <span>📚</span> The Vault Shelves
                    </h1>
                    <p className="text-xs text-muted font-mono tracking-wider mt-1">
                        Organized archives of your active reads, wishlists, and finished collections.
                    </p>
                </div>

                {/* 过滤搜索框 */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search shelf titles..."
                        className="w-full pl-9 pr-4 py-2 bg-bg2 border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-tertiary transition-all"
                    />
                    <span className="absolute left-3 top-2.5 text-muted text-xs">🔍</span>
                </div>
            </div>

            {/* 5 行书架 */}
            {loading ? (
                <div className="w-full flex flex-col items-center justify-center py-20 gap-3 text-muted">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="animate-pulse text-xs font-mono tracking-widest">
                        Aligning the bookshelves...
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <BookShelfRow
                        title="Currently Reading"
                        icon="⏳"
                        colorTheme="primary"
                        books={filterBooks(readingBooks)}
                        onBookClick={(book) => setSelectedBook(book)}
                    />

                    <BookShelfRow
                        title="Want to Read"
                        icon="📌"
                        colorTheme="tertiary"
                        books={filterBooks(wantToReadBooks)}
                        onBookClick={(book) => setSelectedBook(book)}
                    />

                    <BookShelfRow
                        title="Finished Archives"
                        icon="✓"
                        colorTheme="secondary"
                        books={filterBooks(readBooks)}
                        onBookClick={(book) => setSelectedBook(book)}
                    />

                    <BookShelfRow
                        title="Hall of Favorites"
                        icon="♥"
                        colorTheme="muted"
                        books={filterBooks(faveBooks)}
                        onBookClick={(book) => setSelectedBook(book)}
                    />

                    {/*<BookShelfRow*/}
                    {/*    title="Did Not Finish (DNF)"*/}
                    {/*    icon="💀"*/}
                    {/*    colorTheme="muted"*/}
                    {/*    books={filterBooks(abandonedBooks)}*/}
                    {/*    onBookClick={(book) => setSelectedBook(book)}*/}
                    {/*    defaultExpanded={false} // 默认不展开 DNF 卷轴*/}
                    {/*/>*/}
                </div>
            )}

            {/* 图书详情模态框 */}
            {selectedBook && (
                <BookDetailModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onUpdate={handleBookUpdate}
                />
            )}
        </div>
    );
}