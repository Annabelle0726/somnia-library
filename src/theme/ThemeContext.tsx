// C:\Projects\somnia-library\src\theme\ThemeContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// 1. 导出 6 套 Skin 皮肤名称 与 3 种 Mode 明暗模式的类型声明
export type ThemeSkin = 'nocturne' | 'magnolia' | 'gloaming' | 'reverie' | 'grimoire' | 'aphelion';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeSkin;
    setTheme: (theme: ThemeSkin) => void;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// LocalStorage 的存储 Key 标识
const STORAGE_THEME_KEY = 'somnia-theme';
const STORAGE_MODE_KEY = 'somnia-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
    // 初始化 Theme：优先从 localStorage 读取，默认使用 'nocturne'
    const [theme, setTheme] = useState<ThemeSkin>(() => {
        const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ThemeSkin;
        return savedTheme || 'nocturne';
    });

    // 初始化 Mode：优先从 localStorage 读取，默认跟随系统 'system'
    const [mode, setMode] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem(STORAGE_MODE_KEY) as ThemeMode;
        return savedMode || 'system';
    });

    // 主效应：每当 theme 或 mode 变化时，同步更新 DOM 节点属性
    useEffect(() => {
        const root = document.documentElement;

        // 1. 注入 CSS 选择器需要的 data-skin (如 :root[data-skin="nocturne"])
        root.setAttribute('data-skin', theme);
        localStorage.setItem(STORAGE_THEME_KEY, theme);

        // 2. 解析系统当前真正的明暗状态 ('light' 或 'dark')
        let resolvedMode: 'light' | 'dark' = 'dark';
        if (mode === 'system') {
            resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            resolvedMode = mode;
        }

        // 3. 注入 CSS 选择器需要的 data-mode (如 [data-mode="dark"])
        root.setAttribute('data-mode', resolvedMode);

        // 4. 同时增加 class 方便兼容第三方 UI 库 (如 Tailwind 的 dark: 类)
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedMode);

        localStorage.setItem(STORAGE_MODE_KEY, mode);
    }, [theme, mode]);

    // 副效应：当用户设为 'system' 时，实时监听电脑/手机系统切换“深色/浅色”模式
    useEffect(() => {
        if (mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            const newResolvedMode = e.matches ? 'dark' : 'light';

            root.setAttribute('data-mode', newResolvedMode);
            root.classList.remove('light', 'dark');
            root.classList.add(newResolvedMode);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

// 导出 Hook 供组件消费
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}