// src/components/settings/ProfileSection.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface ProfileSectionProps {
    user: User;
}

export function ProfileSection({ user }: ProfileSectionProps) {
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [sex, setSex] = useState(user?.user_metadata?.sex || 'unspecified');

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // 1. 页面加载时：直接去 profiles 表抓取当前数据库里真正的显示名字
    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            if (!user?.id) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('*') // 把整行都取出来
                .eq('id', user.id)
                .single();

            if (!error && data && isMounted) {
                // 如果数据库里有值，优先用数据库 profiles 表的值！
                if (data.display_name) setDisplayName(data.display_name);
                if (data.sex) setSex(data.sex);
            }
        };
        fetchProfile();
        return () => { isMounted = false; };
    }, [user?.id]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            // 2. 第一步：先写进真正的 profiles 表！
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id, // 使用 upsert：如果有就修改，没这条记录就新建，更稳定！
                    email: user.email,
                    display_name: displayName,
                    sex: sex
                });

            if (profileError) {
                console.error('保存到 profiles 表失败:', profileError);
                throw new Error(`数据库错误: ${profileError.message}`);
            }

            // 3. 第二步：同步写进 auth.users 的 metadata（保证两边绝对一致！）
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    display_name: displayName,
                    sex: sex
                }
            });

            if (authError) throw authError;

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMessage({ text: error?.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    return (
        // ... UI 结构完全不用变，保留你原有的 JSX ...
        <section className="bg-[var(--color-card)] border border-[var(--color-line)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-[var(--color-ink)] border-b border-[var(--color-line)] pb-4">
                Personal Information
            </h2>

            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--color-muted)]">
                        Email Address
                    </label>
                    <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="p-2.5 rounded-lg bg-[var(--color-bg2)] border border-[var(--color-line)] text-[var(--color-muted)] cursor-not-allowed outline-none"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--color-ink)]">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-primary)] outline-none transition-colors"
                        placeholder="Enter your display name"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--color-ink)]">
                        Sex
                    </label>
                    <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-primary)] outline-none transition-colors"
                    >
                        <option value="unspecified">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className={`text-sm ${message.type === 'error' ? 'text-[#ef4444]' : 'text-[var(--color-primary)]'}`}>
                        {message.text}
                    </span>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-[var(--color-primary-solid)] text-[var(--color-on-primary)] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </section>
    );
}