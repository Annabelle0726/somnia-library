// src/auth/UnauthShell.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function UnauthShell() {
    const { isAuthenticated } = useAuth();

    // 反向路由守卫：如果已经登录了，就不该待在登录/落地页，直接去首页
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="relative min-h-screen bg-theme-bg0 font-serif text-theme-ink flex flex-col">

            {/* ✨ 极简的顶部 Logo (可选)
                在 Auth 或 Landing 页面，通常左上角会有一个低调的 Logo，点击也没效果，仅作品牌展示
            */}
            <header className="absolute top-0 left-0 w-full p-6 sm:p-8 z-20 flex justify-between items-center pointer-events-none">
                <div className="text-xl font-bold tracking-widest text-amber-500/80 drop-shadow-sm">
                    SOMNIA
                </div>
            </header>

            {/* ✨ 主内容区
                这里的 Outlet 会根据 URL 渲染 Landing.tsx 或 AuthScreen.tsx
            */}
            <main className="flex-1 flex flex-col relative z-10 w-full">
                <Outlet />
            </main>

            {/* 如果你希望 Auth 页面和 Landing 页面有一个共用的极简 Footer，可以写在这里 */}
        </div>
    );
}