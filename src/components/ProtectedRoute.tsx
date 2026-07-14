// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();

    // 如果未登录，重定向到 landing page（替换掉当前历史记录，防止按返回键又跳回来）
    if (!isAuthenticated) {
        return <Navigate to="/welcome" replace />;
    }

    // 如果已登录，放行，渲染子组件
    return <>{children}</>;
}