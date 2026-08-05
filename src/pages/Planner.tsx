// src/pages/Planner.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { BookWithUserData, ReadingStatus } from '../types/book';
import { BookDetailModal } from '../components/library/BookDetailModal';

// 导入拆分出的组件
import { CalendarGrid } from '../components/planner/CalendarGrid';
import { PlannerSidebar } from '../components/planner/PlannerSidebar';
import { ScheduleModal } from '../components/planner/ScheduleModal';

export interface PlanEvent {
    id: string;
    user_id: string;
    book_id: string;
    plan_date: string;
    note?: string;
    book?: BookWithUserData;
}

export function Planner() {
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // 数据状态
    const [allBooks, setAllBooks] = useState<BookWithUserData[]>([]);
    const [readingBooks, setReadingBooks] = useState<BookWithUserData[]>([]);
    const [plans, setPlans] = useState<Record<string, PlanEvent[]>>({});
    const [faveBooks, setFaveBooks] = useState<BookWithUserData[]>([]);
    const [wantToReadBooks, setWantToReadBooks] = useState<BookWithUserData[]>([]);

    // 交互状态
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [selectedBookDetail, setSelectedBookDetail] = useState<BookWithUserData | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 获取图书、状态、计划以及 favorites
            const [booksRes, statusRes, plansRes, favesRes] = await Promise.all([
                supabase.from('books').select('*'),
                supabase.from('user_book_status').select('book_id, status').eq('user_id', user.id),
                supabase.from('user_book_plans').select('*').eq('user_id', user.id),
                supabase.from('user_favorites').select('book_id').eq('user_id', user.id)
            ]);

            if (booksRes.error) throw booksRes.error;

            // 构建用户图书状态映射表（去掉了 progress 关联）
            let userStatuses: Record<string, ReadingStatus> = {};
            statusRes.data?.forEach(s => {
                if (s.book_id && s.status) {
                    userStatuses[s.book_id] = s.status as ReadingStatus;
                }
            });

            let userFaves = new Set<string>();
            favesRes.data?.forEach(f => {
                userFaves.add(f.book_id);
            });

            const fullList: BookWithUserData[] = [];
            const reading: BookWithUserData[] = [];
            const wantTo: BookWithUserData[] = [];
            const faves: BookWithUserData[] = [];
            const bookMap = new Map<string, BookWithUserData>();

            booksRes.data?.forEach((rawBook: any) => {
                const status = userStatuses[rawBook.id];
                const isFave = userFaves.has(rawBook.id);

                const bookWithUser: BookWithUserData = {
                    ...rawBook,
                    user_status: status,
                    is_fave: isFave
                };

                fullList.push(bookWithUser);
                bookMap.set(bookWithUser.id, bookWithUser);

                // 根据状态分类
                if (status === 'reading') reading.push(bookWithUser);
                if (status === 'want_to_read') wantTo.push(bookWithUser);
                if (isFave) faves.push(bookWithUser);
            });

            setAllBooks(fullList);
            setReadingBooks(reading);
            setWantToReadBooks(wantTo);
            setFaveBooks(faves);

            const groupedPlans: Record<string, PlanEvent[]> = {};
            plansRes.data?.forEach((plan: any) => {
                const dateKey = plan.plan_date.split('T')[0];
                if (!groupedPlans[dateKey]) groupedPlans[dateKey] = [];
                groupedPlans[dateKey].push({
                    ...plan,
                    book: bookMap.get(plan.book_id)
                });
            });
            setPlans(groupedPlans);

        } catch (err) {
            console.error('Error fetching planner data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlan = async (dateStr: string, bookId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_book_plans')
                .insert({
                    user_id: user.id,
                    book_id: bookId,
                    plan_date: dateStr,
                    note: 'Scheduled'
                })
                .select()
                .single();

            if (error) throw error;

            const book = allBooks.find(b => b.id === bookId);
            const newEvent: PlanEvent = { ...data, book };

            setPlans(prev => ({
                ...prev,
                [dateStr]: [...(prev[dateStr] || []), newEvent]
            }));

            setSelectedDateStr(null); // 关闭弹窗
        } catch (error) {
            console.error('Failed to add plan:', error);
            alert('Failed to save plan.');
        }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-line/40 pb-6">
                <div>
                    <h1 className="font-display hero-title text-3xl font-bold text-ink flex items-center gap-2">
                        <span>🗓️</span> Reading Planner
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded-xl bg-bg2 border border-line text-xs font-mono font-bold text-ink cursor-pointer hover:border-tertiary">
                        Today
                    </button>
                    <div className="flex items-center bg-bg2 border border-line rounded-xl px-1 py-1">
                        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-2 text-xs cursor-pointer hover:text-primary">◀</button>
                        <span className="font-mono text-xs font-bold px-3 min-w-[120px] text-center">{monthNames[month]} {year}</span>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-2 text-xs cursor-pointer hover:text-primary">▶</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="w-full flex flex-col items-center justify-center py-32 gap-3 text-muted">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="animate-pulse text-xs font-mono tracking-widest">Consulting the calendar...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 使用拆分的日历网格 */}
                    <CalendarGrid
                        currentDate={currentDate}
                        plans={plans}
                        onDateClick={setSelectedDateStr}
                        onPlanClick={setSelectedBookDetail}
                    />

                    {/* 使用拆分的侧边栏 */}
                    <PlannerSidebar
                        readingBooks={readingBooks}
                        wantToReadBooks={wantToReadBooks}
                        faveBooks={faveBooks}
                        onBookClick={setSelectedBookDetail}
                    />
                </div>
            )}

            {/* 排期弹窗 */}
            {selectedDateStr && (
                <ScheduleModal
                    dateStr={selectedDateStr}
                    availableBooks={allBooks}
                    onClose={() => setSelectedDateStr(null)}
                    onSave={handleAddPlan}
                />
            )}

            {/* 图书详情弹窗 */}
            {selectedBookDetail && (
                <BookDetailModal
                    book={selectedBookDetail}
                    onClose={() => setSelectedBookDetail(null)}
                    onUpdate={() => {
                        setSelectedBookDetail(null);
                        fetchData(); // 状态改变后重新拉取
                    }}
                />
            )}
        </div>
    );
}