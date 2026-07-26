// src/components/home/HeaderReadingStats.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { supabase } from '../../lib/supabase';

interface CurrentReadData {
    title: string;
    progress: number;
}

export function HeaderReadingStats() {
    const { user } = useAuth();
    const [streakDays, setStreakDays] = useState<number>(0);
    const [currentBook, setCurrentBook] = useState<CurrentReadData>({
        title: 'Dormant Pages',
        progress: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchReadingStats() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 1. 查询当前在读的书籍：连表查询 public.books 获取 title
                const { data: statusData, error: statusError } = await supabase
                    .from('user_book_status')
                    .select('progress, books(title)')
                    .eq('user_id', user.id)
                    .eq('status', 'reading') // 对应建表时的 'reading' 小写约束
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (statusError) {
                    console.error('Error fetching current read status:', statusError);
                } else if (statusData) {
                    // Supabase 返回的连表对象解构：books 是一个对象 (或者单项数组)
                    const bookInfo = Array.isArray(statusData.books)
                        ? statusData.books[0]
                        : statusData.books;

                    setCurrentBook({
                        title: bookInfo?.title || 'Dormant Pages',
                        progress: statusData.progress ?? 0,
                    });
                } else {
                    setCurrentBook({
                        title: 'Dormant Pages',
                        progress: 0,
                    });
                }

                // 2. 查询 Reading Streak
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('streak_days')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profileData && typeof profileData.streak_days === 'number') {
                    setStreakDays(profileData.streak_days);
                } else {
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
        } else if (streakDays >= 30) {
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
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 h-[38px] sm:h-[42px] bg-card/80 border border-line rounded-xl shadow-sm backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:border-tertiary/40">
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
            <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 h-[38px] sm:h-[42px] bg-card/80 border border-line rounded-xl shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-tertiary/40 max-w-[150px] sm:max-w-[200px]">
                {/* 状态指示灯 */}
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${currentBook.progress > 0 ? 'bg-primary animate-pulse' : 'bg-muted/40'}`}></div>

                <div className="flex flex-col justify-center min-w-[65px] sm:min-w-[90px] max-w-[85px] sm:max-w-[120px]">
                    <span className="text-[8px] sm:text-[9px] font-semibold text-muted leading-none tracking-wider uppercase font-[family-name:var(--font-mono)] truncate">
                        Reading
                    </span>
                    <span
                        className={`text-[11px] sm:text-[12px] font-bold leading-tight truncate mt-0.5 font-[family-name:var(--font-body)] ${
                            currentBook.progress === 0 ? 'text-muted/80 italic font-normal' : 'text-ink'
                        }`}
                        title={currentBook.title}
                    >
                        {loading ? '...' : currentBook.title}
                    </span>

                    {/* 仅在进度 > 0 时，渲染进度条 */}
                    {currentBook.progress > 0 && (
                        <div className="w-full bg-bg2 rounded-full h-1 mt-1 overflow-hidden border border-line/40">
                            <div
                                className="bg-gradient-to-r from-tertiary to-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${loading ? 0 : currentBook.progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* 进度百分比 */}
                <span className="text-[10px] sm:text-[11px] font-bold text-primary font-[family-name:var(--font-mono)] ml-0.5 shrink-0">
                    {loading ? '0%' : `${currentBook.progress}%`}
                </span>
            </div>
        </div>
    );
}