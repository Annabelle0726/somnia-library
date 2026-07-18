// src/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from "../lib/supabase"; // 1. 去掉 .ts 后缀，防止编译报错
import type { User } from '@supabase/supabase-js';

// 定义 Context 的类型
interface AuthContextType {
    user: User | null;
    loading: boolean; // 2. 用 loading 代替之前混乱的 login 状态
    logout: () => Promise<void>;
}

// 加上 export 关键字
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // 初始状态设为加载中

    useEffect(() => {
        // 1. 异步获取初始的 Session 状态
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("初始化获取登录状态失败:", error);
            } finally {
                setLoading(false); // 无论成功失败，都结束加载状态
            }
        };

        initializeAuth();

        // 2. 监听登录状态的实时变化（登入、登出、Token 过期）
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 3. 在 useEffect 的返回中进行清理
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 登出函数
    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        // 4. 正确返回 Context Provider，并注入状态
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
