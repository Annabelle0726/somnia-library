import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function UnauthShell() {
    // 1. 解构出最新的 user 和 loading 状态
    const { user, loading } = useAuth();

    // 2. 核心保护：如果 Supabase 还在默默检查登录状态，先转个圈，防止页面乱闪
    if (loading) {
        return (
            <div className="min-h-screen bg-theme-bg0 flex items-center justify-center font-serif text-theme-ink">
                <div className="flex flex-col items-center gap-3">
                    {/* 这里放一个简单的加载动画（可以使用 Tailwind 的 animate-spin） */}
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                    <p className="text-sm opacity-60">正在载入...</p>
                </div>
            </div>
        );
    }

    // 3. 反向路由守卫：如果已经登录了（user 存在），就不该待在登录/落地页，直接去首页
    if (user) {
        return <Navigate to="/" replace />;
    }

    // 4. 未登录状态，正常渲染 Landing 或 AuthScreen
    return (
        <div className="relative min-h-screen bg-theme-bg0 font-serif text-theme-ink flex flex-col">
            {/* ✨ 主内容区
                这里的 Outlet 会根据 URL 渲染 Landing.tsx 或 AuthScreen.tsx
            */}
            <main className="flex-1 flex flex-col relative z-10 w-full">
                <Outlet />
            </main>
        </div>
    );
}