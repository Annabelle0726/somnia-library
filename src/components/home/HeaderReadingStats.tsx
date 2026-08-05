// src/components/home/BookShelfHeader.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { supabase } from '../../lib/supabase';

interface CurrentReadData {
    titles: string[];
    count: number;
}

export function HeaderReadingStats() {
    const { user } = useAuth();
    const [streakDays, setStreakDays] = useState<number>(0);
    const [currentRead, setCurrentRead] = useState<CurrentReadData>({
        titles: [],
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
                    .select('books(title), updated_at')
                    .eq('user_id', user.id)
                    .eq('status', 'reading')
                    .order('updated_at', { ascending: false });

                if (statusError) {
                    console.error('Error fetching current read status:', statusError);
                } else if (statusData && statusData.length > 0) {
                    // 提取所有的书名
                    const bookTitles = statusData
                        .map(item => {
                            const bookInfo = Array.isArray(item.books) ? item.books[0] : item.books;
                            return bookInfo?.title;
                        })
                        .filter(Boolean) as string[];

                    setCurrentRead({
                        titles: bookTitles,
                        count: statusData.length,
                    });

                    // 2. 基于 updated_at 在客户端动态计算 Streak (滑动窗口 7 天)
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const uniqueDays = new Set<string>();

                    statusData.forEach(item => {
                        if (item.updated_at) {
                            const date = new Date(item.updated_at);
                            if (date >= sevenDaysAgo) {
                                const dateStr = date.toISOString().split('T')[0];
                                uniqueDays.add(dateStr);
                            }
                        }
                    });

                    setStreakDays(uniqueDays.size);
                } else {
                    setCurrentRead({ titles: [], count: 0 });
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
            {/* 1. Reading Streak (保持不变) */}
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
            <div className="relative group">
                <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 h-[38px] sm:h-[42px] bg-card/80 border border-line rounded-xl shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-tertiary/40 hover:shadow-lg hover:bg-card/90 max-w-[160px] sm:max-w-[220px] cursor-default">
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
                            title={currentRead.titles[0] || 'Dormant Pages'}
                        >
                            {loading ? '...' : (currentRead.titles[0] || 'Dormant Pages')}
                        </span>
                    </div>
                </div>

                {/* 下拉书架列表 (悬停展示) */}
                {currentRead.count > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform translate-y-[-10px] group-hover:translate-y-0 z-[9999]">
                        <div className="bg-card/95 backdrop-blur-xl border border-tertiary/30 rounded-xl shadow-2xl p-3 overflow-hidden min-w-[180px] max-w-[220px] group-hover:shadow-tertiary/10">
                            {/* 浮层头部 */}
                            <div className="text-[9px] font-mono font-bold text-tertiary uppercase tracking-wider pb-2 border-b border-line/20 mb-2 px-1 flex justify-between">
                                <span>Currently Reading</span>
                                <span className="text-muted/60 text-[8px]">{currentRead.count} books</span>
                            </div>

                            {/* 书籍滚动列表 */}
                            <div className="max-h-[160px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                {currentRead.titles.map((title, index) => (
                                    <div
                                        key={index}
                                        className="px-2 py-1.5 rounded-lg hover:bg-bg2/80 hover:border transition-all duration-200 text-xs text-ink truncate font-body flex items-center gap-2"
                                        title={title}
                                    >
                                        <span className="truncate">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}