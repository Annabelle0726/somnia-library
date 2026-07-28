// src/components/home/BookShelf.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { BookWithUserData } from '../../types/book';
import { BookShelfHeader } from './BookShelfHeader';
import { BookShelfRow } from './BookShelfRow';
import { BookDetailModal } from '../library/BookDetailModal'; // 👈 引入现有 Modal

export function Bookshelf() {
    const [loading, setLoading] = useState(true);

    // 状态分类数组
    const [readingBooks, setReadingBooks] = useState<BookWithUserData[]>([]);
    const [wantToReadBooks, setWantToReadBooks] = useState<BookWithUserData[]>([]);
    const [readBooks, setReadBooks] = useState<BookWithUserData[]>([]);
    const [faveBooks, setFaveBooks] = useState<BookWithUserData[]>([]);

    // 👈 正在弹窗查看/编辑的图书
    const [selectedBook, setSelectedBook] = useState<BookWithUserData | null>(null);

    useEffect(() => {
        async function fetchBookshelfData() {
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

                categorizeBooks(allBooks, userStatuses, userFaves);
            } catch (err) {
                console.error('Error loading bookshelf data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchBookshelfData();
    }, []);

    // 辅助归类逻辑：提取出来供初始化与更新时使用
    const categorizeBooks = (
        rawBooksList: any[],
        userStatuses: Record<string, { status: any; progress: number }>,
        userFaves: Set<string>
    ) => {
        const reading: BookWithUserData[] = [];
        const wantToRead: BookWithUserData[] = [];
        const read: BookWithUserData[] = [];
        const faves: BookWithUserData[] = [];

        rawBooksList.forEach((rawBook: any) => {
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

            if (bookWithUser.is_fave) faves.push(bookWithUser);
        });

        setReadingBooks(reading);
        setWantToReadBooks(wantToRead);
        setReadBooks(read);
        setFaveBooks(faves);
    };

    // ⚡ 当用户在 Modal 里改了阅读状态或收藏状态时的无刷新同步机制
    const handleBookUpdate = (updatedBook: BookWithUserData) => {
        // 更新正在查看的图书对象
        setSelectedBook(updatedBook);

        // 更新各列表中的相应数据
        const updateList = (prev: BookWithUserData[]) => {
            // 如果书在当前列表中，更新它；如果状态改变不在当前列表中了，过滤掉
            return prev
                .map((b) => (b.id === updatedBook.id ? updatedBook : b))
                .filter((b) => {
                    if (b.id !== updatedBook.id) return true;
                    return b.user_status === updatedBook.user_status;
                });
        };

        setReadingBooks((prev) => {
            const isReading = updatedBook.user_status === 'reading';
            const exists = prev.some((b) => b.id === updatedBook.id);
            if (isReading && !exists) return [...prev, updatedBook];
            return updateList(prev);
        });

        setWantToReadBooks((prev) => {
            const isWant = updatedBook.user_status === 'want_to_read';
            const exists = prev.some((b) => b.id === updatedBook.id);
            if (isWant && !exists) return [...prev, updatedBook];
            return updateList(prev);
        });

        setReadBooks((prev) => {
            const isRead = updatedBook.user_status === 'read';
            const exists = prev.some((b) => b.id === updatedBook.id);
            if (isRead && !exists) return [...prev, updatedBook];
            return updateList(prev);
        });

        setFaveBooks((prev) => {
            if (updatedBook.is_fave) {
                const exists = prev.some((b) => b.id === updatedBook.id);
                if (!exists) return [...prev, updatedBook];
                return prev.map((b) => (b.id === updatedBook.id ? updatedBook : b));
            } else {
                return prev.filter((b) => b.id !== updatedBook.id);
            }
        });
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* 顶部控制面板 */}
            <BookShelfHeader
                loading={loading}
                readingCount={readingBooks.length}
                wantToReadCount={wantToReadBooks.length}
                readCount={readBooks.length}
                faveCount={faveBooks.length}
            />

            {/* 下方 4 行书架 */}
            <div className="flex flex-col gap-6 w-full">
                {loading ? (
                    <div className="w-full flex flex-col items-center justify-center py-12 gap-2 text-muted">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="animate-pulse text-xs font-mono tracking-widest">
                            Whispering to the vault...
                        </p>
                    </div>
                ) : (
                    <>
                        <BookShelfRow
                            title="Currently Reading"
                            icon="⏳"
                            colorTheme="primary"
                            books={readingBooks}
                            onBookClick={(book) => setSelectedBook(book)}
                        />
                        <BookShelfRow
                            title="Want to Read"
                            icon="📌"
                            colorTheme="tertiary"
                            books={wantToReadBooks}
                            onBookClick={(book) => setSelectedBook(book)}
                        />
                        <BookShelfRow
                            title="Finished Archives"
                            icon="✓"
                            colorTheme="secondary"
                            books={readBooks}
                            onBookClick={(book) => setSelectedBook(book)}
                        />
                        <BookShelfRow
                            title="Hall of Favorites"
                            icon="♥"
                            colorTheme="primary"
                            books={faveBooks}
                            onBookClick={(book) => setSelectedBook(book)}
                        />
                    </>
                )}
            </div>

            {/* ⚡ 挂载完整的 BookDetailModal 弹窗 */}
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