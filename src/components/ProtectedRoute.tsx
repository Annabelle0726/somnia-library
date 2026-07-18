// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth'; // 确保路径正确

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    // 1. 拿到最新的 user 和 loading
    const { user, loading } = useAuth();

    // 2. 关键防护：如果 Supabase 还在检查登录状态（加载中），先原地转圈/展示空白，不要乱跳转
    if (loading) {
        return (
            <div className="min-h-screen bg-theme-bg0 flex items-center justify-center font-serif text-theme-ink">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                </div>
            </div>
        );
    }

    // 3. 正向路由守卫：如果加载完了，发现没有 user（未登录），重定向到落地页
    if (!user) {
        return <Navigate to="/welcome" replace />;
    }

    // 4. 如果已登录，放行，渲染子组件
    return <>{children}</>;
}