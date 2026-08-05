// src/components/home/HeaderReadingStats.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { supabase } from '../../lib/supabase';

interface CurrentReadData {
    title: string;
    count: number;
}

export function HeaderReadingStats() {
    const { user } = useAuth();
    const [streakDays, setStreakDays] = useState<number>(0);
    const [currentRead, setCurrentRead] = useState<CurrentReadData>({
        title: 'Dormant Pages',
        count: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchReadingStats() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 1. 查询当前在读的书籍
                const { data: statusData, error: statusError } = await supabase
                    .from('user_book_status')
                    .select('books(title), updated_at') // 加上 updated_at 用来算 Streak
                    .eq('user_id', user.id)
                    .eq('status', 'reading')
                    .order('updated_at', { ascending: false });

                if (statusError) {
                    console.error('Error fetching current read status:', statusError);
                } else if (statusData && statusData.length > 0) {
                    // 获取最近更新的第一本书的信息
                    const latestBookInfo = Array.isArray(statusData[0].books)
                        ? statusData[0].books[0]
                        : statusData[0].books;

                    setCurrentRead({
                        title: latestBookInfo?.title || 'Unknown Book',
                        count: statusData.length,
                    });

                    // 🔥 核心修复：基于 updated_at 在客户端动态计算 Streak (滑动窗口 7 天逻辑)
                    // 只要你哪天点了一下已读/在读，就算这天打卡了。
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                    let activeDays = 0;
                    const uniqueDays = new Set<string>();

                    statusData.forEach(item => {
                        if (item.updated_at) {
                            const date = new Date(item.updated_at);
                            if (date >= sevenDaysAgo) {
                                // 格式化到日期字符串 (YYYY-MM-DD)，只算自然日
                                const dateStr = date.toISOString().split('T')[0];
                                uniqueDays.add(dateStr);
                            }
                        }
                    });

                    activeDays = uniqueDays.size;
                    setStreakDays(activeDays);

                } else {
                    setCurrentRead({
                        title: 'Dormant Pages',
                        count: 0,
                    });
                    setStreakDays(0);
                }

            } catch (err) {
                console.error('Failed to load reading stats:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchReadingStats();
    }, [user]);

    // 根据 Streak 天数动态渲染火焰
    const renderFlame = () => {
        if (streakDays === 0) {
            return <span className="text-xs sm:text-sm opacity-50 select-none">🔥</span>;
        } else if (streakDays >= 7) {
            return (
                <span className="text-xs sm:text-sm animate-bounce tracking-tighter drop-shadow-[0_0_8px_var(--tertiary)] select-none">
                    🔥🔥🔥
                </span>
            );
        } else {
            return <span className="text-xs sm:text-sm animate-bounce select-none">🔥</span>;
        }
    };

    return (
        <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 1. Reading Streak */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 h-[38px] sm:h-[42px] bg-card/80 border border-line rounded-xl shadow-sm backdrop-blur-sm transition-transform duration-300 hover:border-tertiary/40">
                {renderFlame()}
                <div className="flex flex-col justify-center">
                    <span className="text-[8px] sm:text-[9px] font-bold text-tertiary leading-none tracking-wider uppercase font-[family-name:var(--font-mono)]">
                        Streak
                    </span>
                    <span className="text-[11px] sm:text-[12px] font-bold text-ink leading-tight font-[family-name:var(--font-body)] mt-0.5">
                        {loading ? '...' : `${streakDays} Days`}
                    </span>
                </div>
            </div>

            {/* 2. Current Reading */}
            <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 h-[38px] sm:h-[42px] bg-card/80 border border-line rounded-xl shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-tertiary/40 max-w-[160px] sm:max-w-[220px]">
                {/* 状态指示灯 */}
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${currentRead.count > 0 ? 'bg-primary animate-pulse shadow-[0_0_5px_var(--primary)]' : 'bg-muted/40'}`}></div>

                <div className="flex flex-col justify-center min-w-[70px] sm:min-w-[100px] max-w-[100px] sm:max-w-[150px]">
                    <span className="text-[8px] sm:text-[9px] font-semibold text-muted leading-none tracking-wider uppercase font-[family-name:var(--font-mono)] truncate">
                        {currentRead.count > 1 ? `Reading (${currentRead.count})` : 'Reading'}
                    </span>
                    <span
                        className={`text-[11px] sm:text-[12px] font-bold leading-tight truncate mt-0.5 font-[family-name:var(--font-body)] ${
                            currentRead.count === 0 ? 'text-muted/80 italic font-normal' : 'text-ink'
                        }`}
                        title={currentRead.title}
                    >
                        {loading ? '...' : currentRead.title}
                    </span>
                </div>
            </div>
        </div>
    );
}