import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth 必须在 AuthProvider 内部使用！');
    }
    return context;
};