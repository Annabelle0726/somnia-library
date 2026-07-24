// // src/components/settings/ProfileSection.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js'; // 1. 引入 User 类型

// 2. 定义组件 Props 的类型
interface ProfileSectionProps {
    user: User;
}

export function ProfileSection({ user }: ProfileSectionProps) {
    // 从 user.user_metadata 中读取默认值
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [sex, setSex] = useState(user?.user_metadata?.sex || 'unspecified');

    // UI 反馈状态
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    display_name: displayName,
                    sex: sex
                }
            });

            if (error) throw error;

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error: any) { // 3. 解决 TS 报错：指定 error 类型为 any
            console.error('Error updating profile:', error);
            setMessage({ text: error?.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    return (
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