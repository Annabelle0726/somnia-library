//  src/components/settings/SecuritySection.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js'; // 1. 引入 User 类型

// 2. 定义组件 Props 的类型
interface SecuritySectionProps {
    onLogout: () => void;
    user: User;
}

export function SecuritySection({ onLogout, user }: SecuritySectionProps) {
    const [isResetting, setIsResetting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState('');

    const handleResetPassword = async () => {
        if (!user?.email) return;

        setIsResetting(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: window.location.origin + '/settings',
            });

            if (error) throw error;
            setMessage('Password reset email sent! Please check your inbox.');
        } catch (error: any) { // 3. 将 error 指定为 any 以读取 message
            console.error('Reset error:', error);
            setMessage(error?.message || 'An error occurred during password reset.');
        } finally {
            setIsResetting(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action is permanent and cannot be undone.'
        );
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            // 调用 Supabase RPC 函数注销账号
            const {error} = await supabase.rpc('delete_user_account');
            if (error) throw error;

            alert('Your account has been deleted.');
            onLogout(); // 自动登出并返回登录页
        } catch (error: any) {
            console.error('Delete account error:', error);
            alert(error?.message || 'Failed to delete account. Please contact support.');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <section className="bg-[var(--color-card)] border border-[var(--color-line)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-[var(--color-ink)] border-b border-[var(--color-line)] pb-4">
                Account Security
            </h2>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[var(--color-ink)]">
                            Password
                        </label>
                        <span className="text-lg tracking-widest text-[var(--color-muted)]">
                            ••••••••
                        </span>
                        {message && (
                            <span className="text-sm text-[var(--color-primary)] mt-1">
                                {message}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleResetPassword}
                        disabled={isResetting}
                        className="px-4 py-2 border border-[var(--color-line)] text-[var(--color-ink)] rounded-lg text-sm font-medium hover:bg-[var(--color-bg2)] transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {isResetting ? 'Sending...' : 'Reset Password'}
                    </button>
                </div>

                <div className="h-px w-full bg-[var(--color-line)] my-2"></div>

                {/* Logout & Danger Zone */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <button
                        onClick={onLogout}
                        className="px-5 py-2.5 border border-[var(--color-line)] text-[var(--color-ink)] rounded-lg font-medium hover:bg-[var(--color-bg2)] transition-colors"
                    >
                        Logout
                    </button>

                    {/* Delete Account 按钮 */}
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="px-5 py-2.5 bg-red-600/10 border border-red-500/30 text-red-500 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>

            </div>
        </section>
    );
}