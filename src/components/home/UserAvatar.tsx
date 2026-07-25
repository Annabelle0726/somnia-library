// src/components/home/UserAvatar.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { supabase } from '../../lib/supabase';

export function UserAvatar() {
    const { user } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAvatar = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();

                if (!error && data && isMounted) {
                    setAvatarUrl(data.avatar_url || '');
                }
            } catch (err) {
                console.error('Error fetching avatar:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAvatar();
        return () => { isMounted = false; };
    }, [user?.id]);

    // 如果没有头像，取邮箱或首字母作为默认展示
    const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

    return (
        <div
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-gradient-to-br from-tertiary/20 to-primary/20 border border-line/80 shadow-md flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
            style={{ opacity: isLoading ? 0.6 : 1 }}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="font-display font-bold text-sm sm:text-base text-ink drop-shadow-sm">
                    {initial}
                </span>
            )}

            {/* 右下角极小在线绿点装饰，增强互动感 */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full"></span>
        </div>
    );
}