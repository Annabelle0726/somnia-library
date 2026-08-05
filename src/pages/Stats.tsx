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
            // 1. 获取所有图书
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
            let bookTropesMap = new Map<string, string[]>();

            if (userId) {
                // 2. 并行获取用户的阅读状态与新表中的 Tropes 数据
                const [statusRes, tropesRes] = await Promise.all([
                    supabase
                        .from('user_book_status')
                        .select('book_id, status, progress')
                        .eq('user_id', userId)
                        .in('book_id', bookIds),
                    supabase
                        .from('user_book_tropes')
                        .select('book_id, tropes(name)')
                        .eq('user_id', userId)
                        .in('book_id', bookIds)
                ]);

                if (statusRes.data) {
                    statusMap = new Map(statusRes.data.map((s) => [s.book_id, s]));
                }

                // 聚合每一本书的 Trope 名称列表
                if (tropesRes.data) {
                    tropesRes.data.forEach((item: any) => {
                        const bId = item.book_id;
                        const tropeName = item.tropes?.name;
                        if (tropeName) {
                            const existing = bookTropesMap.get(bId) || [];
                            bookTropesMap.set(bId, [...existing, tropeName]);
                        }
                    });
                }
            }

            // 3. 格式化组装 BookWithUserData
            const formattedBooks: BookWithUserData[] = allBooks.map((book) => {
                const userStatusObj = statusMap.get(book.id);
                const assignedTropes = bookTropesMap.get(book.id) || [];

                return {
                    ...book,
                    user_status: userStatusObj?.status,
                    progress: userStatusObj?.progress || 0,
                    tropes: assignedTropes, // 使用从 user_book_tropes 表查出的新数据
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

    // 📊 数据衍生指标计算 (保持不变，能自动读取最新的 b.tropes)
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