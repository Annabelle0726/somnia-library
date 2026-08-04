// src/pages/Stats.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth.ts';
import type { BookWithUserData } from '../types/book';

import { StatsOverview } from '../components/stats/StatsOverview';
import { SpiceDistributionChart } from '../components/stats/SpiceDistributionChart';
import { StatusPieChart } from '../components/stats/StatusPieChart';
import { TopTropesBar } from '../components/stats/TopTropesBar';

export function Stats() {
    const [books, setBooks] = useState<BookWithUserData[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const userId = user?.id;

    const fetchStatsData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: allBooks, error: booksError } = await supabase
                .from('books')
                .select('*');

            if (booksError) throw booksError;
            if (!allBooks || allBooks.length === 0) {
                setBooks([]);
                return;
            }

            const bookIds = allBooks.map((b) => b.id);
            let statusMap = new Map();

            if (userId) {
                const { data: statusData } = await supabase
                    .from('user_book_status')
                    .select('book_id, status, progress')
                    .eq('user_id', userId)
                    .in('book_id', bookIds);

                statusMap = new Map(statusData?.map((s) => [s.book_id, s]) || []);
            }

            const formattedBooks: BookWithUserData[] = allBooks.map((book) => {
                const userStatusObj = statusMap.get(book.id);
                return {
                    ...book,
                    user_status: userStatusObj?.status,
                    progress: userStatusObj?.progress || 0,
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
            console.error('Error fetching stats data:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchStatsData();
    }, [fetchStatsData]);

    // 📊 数据衍生指标计算
    const statsSummary = useMemo(() => {
        const total = books.length;
        const completed = books.filter(b => b.user_status === 'read').length;

        // 算平均 Spice
        const spiceSum = books.reduce((acc, b) => acc + (b.spice || 0), 0);
        const avgSpice = total > 0 ? spiceSum / total : 0;

        // 算平均 Rating
        const ratingBooks = books.filter(b => b.rating && b.rating > 0);
        const ratingSum = ratingBooks.reduce((acc, b) => acc + (b.rating || 0), 0);
        const avgRating = ratingBooks.length > 0 ? ratingSum / ratingBooks.length : 0;

        // Spice 分布 (0~5)
        const spiceCounts = [0, 1, 2, 3, 4, 5].map(level => ({
            spice: `${level} 🌶️`,
            count: books.filter(b => (b.spice || 0) === level).length
        }));

        // 阅读状态分布
        const statusCounts = [
            { name: 'Read', value: books.filter(b => b.user_status === 'read').length },
            { name: 'Reading', value: books.filter(b => b.user_status === 'reading').length },
            { name: 'Want to Read', value: books.filter(b => b.user_status === 'want_to_read').length },
            { name: 'Uncategorized', value: books.filter(b => !b.user_status).length }
        ].filter(item => item.value > 0);

        // Tropes 频率计算
        const tropeMap: Record<string, number> = {};
        books.forEach(b => {
            b.tropes?.forEach(t => {
                if (t) tropeMap[t] = (tropeMap[t] || 0) + 1;
            });
        });

        const topTropes = Object.entries(tropeMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return {
            total,
            completed,
            avgSpice,
            avgRating,
            spiceCounts,
            statusCounts,
            topTropes
        };
    }, [books]);

    return (
        <div className="w-full max-h-[calc(100vh-5rem)]">

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] font-mono text-muted animate-pulse">Calculating Vault Analytics...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 1. 顶部 Overview 指标 */}
                    <StatsOverview
                        totalBooks={statsSummary.total}
                        completedBooks={statsSummary.completed}
                        avgSpice={statsSummary.avgSpice}
                        avgRating={statsSummary.avgRating}
                    />

                    {/* 2. Bento 图表网格 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[280px]">
                        <SpiceDistributionChart data={statsSummary.spiceCounts} />
                        <StatusPieChart data={statsSummary.statusCounts} />
                        <TopTropesBar tropes={statsSummary.topTropes} />
                    </div>
                </div>
            )}
        </div>
    );
}
