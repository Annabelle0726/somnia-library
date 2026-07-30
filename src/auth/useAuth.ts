// src/auth/useAuth.ts
import { useContext } from 'react';
import { AuthContext, type AuthContextType } from './AuthProvider';

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth 必须在 AuthProvider 内部使用！');
    }
    return context;
};