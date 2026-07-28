// src/components/home/BookShelf.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { BookWithUserData } from '../../types/book';
import { BookShelfHeader } from './BookShelfHeader';
import { BookShelfRow } from './BookShelfRow';

export function Bookshelf() {
    const [loading, setLoading] = useState(true);

    const [readingBooks, setReadingBooks] = useState<BookWithUserData[]>([]);
    const [wantToReadBooks, setWantToReadBooks] = useState<BookWithUserData[]>([]);
    const [readBooks, setReadBooks] = useState<BookWithUserData[]>([]);
    const [faveBooks, setFaveBooks] = useState<BookWithUserData[]>([]);

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

                const reading: BookWithUserData[] = [];
                const wantToRead: BookWithUserData[] = [];
                const read: BookWithUserData[] = [];
                const faves: BookWithUserData[] = [];

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

                    if (bookWithUser.is_fave) faves.push(bookWithUser);
                });

                setReadingBooks(reading);
                setWantToReadBooks(wantToRead);
                setReadBooks(read);
                setFaveBooks(faves);
            } catch (err) {
                console.error('Error loading bookshelf data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchBookshelfData();
    }, []);

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* 顶部面板 */}
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
                        />
                        <BookShelfRow
                            title="Want to Read"
                            icon="📌"
                            colorTheme="tertiary"
                            books={wantToReadBooks}
                        />
                        <BookShelfRow
                            title="Finished Archives"
                            icon="✓"
                            colorTheme="secondary"
                            books={readBooks}
                        />
                        <BookShelfRow
                            title="Hall of Favorites"
                            icon="♥"
                            colorTheme="primary"
                            books={faveBooks}
                        />
                    </>
                )}
            </div>
        </div>
    );
}