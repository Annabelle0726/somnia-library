import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'nocturne' | 'magnolia' | 'gloaming';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // 从 localStorage 读取偏好，默认使用 nocturne
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('reverie-theme') as Theme) || 'nocturne';
    });

    useEffect(() => {
        // 核心：将 data-theme 注入到最外层 HTML 标签
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('reverie-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
    {children}
    </ThemeContext.Provider>
);
}

// 提供一个 Hook 供其他组件快速调用
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}