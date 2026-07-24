// src/components/home/UserGreeting.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { supabase } from '../../lib/supabase';

export function UserGreeting() {
    const { user } = useAuth();
    // 状态：存储从数据库获取的 displayName
    const [displayName, setDisplayName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 1. 获取问候语的逻辑
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 18) return 'Good afternoon';
        if (hour >= 18 && hour < 22) return 'Good evening';
        return 'Good night';
    };

    // 2. 从 Supabase Profiles 表中抓取名字
    useEffect(() => {
        let isMounted = true;

        const fetchProfileName = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', user.id)
                    .single(); // 我们只需要这一行数据

                if (error) {
                    console.error('Error fetching profile:', error);
                } else if (data && isMounted) {
                    setDisplayName(data.display_name);
                }
            } catch (err) {
                console.error('Unexpected error fetching profile:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchProfileName();

        return () => {
            isMounted = false;
        };
    }, [user?.id]); // 当 user.id 改变时重新运行

    // 3. 回退逻辑：如果数据库没名字，用邮箱前缀，如果连邮箱都没有，叫 Reader
    const finalName = displayName
        || (user?.email ? user.email.split('@')[0] : 'Reader');

    return (
        <div className="flex items-center gap-2 text-xs sm:text-sm font-[family-name:var(--font-body)] text-muted mb-1 transition-opacity duration-300" style={{ opacity: isLoading ? 0.5 : 1 }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>
                {getGreeting()},{' '}
                <strong className="text-ink font-semibold tracking-wide capitalize">
                    {finalName}
                </strong>
            </span>
        </div>
    );
}