import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ProfileSection } from '../components/settings/ProfileSection';
import { SecuritySection } from '../components/settings/SecuritySection';

export function Settings() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/Welcome');
    };

    if (!user) return null; // 或者返回一个加载动
    return (
        <div className="flex flex-col gap-8 w-full">
            <header className="mb-4">
                <h1 className="text-3xl font-display font-bold">Settings</h1>
                <p className="text-[var(--color-muted)] mt-2">
                    Manage your account settings and personal information.
                </p>
            </header>

            <ProfileSection user={user} />
            {/* 把 user 传给 Security 用于发重置邮件 */}
            <SecuritySection onLogout={handleLogout} user={user} />
        </div>
    );
}