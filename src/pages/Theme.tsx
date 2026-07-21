// src/pages/Theme.tsx
import { useState, useEffect } from 'react';
import { useTheme, type ThemeSkin, type ThemeMode } from '../theme/ThemeContext';
import { THEMES } from '../theme/themes';
import { ThemeCard } from '../components/Theme/ThemeCard';

export default function ThemePage() {
    const { theme: activeTheme, setTheme, mode: colorMode, setMode: setColorMode } = useTheme();

    // 跟踪系统本身的级联明暗状态，以便在选了 'system' 时提供准确的卡片预览色
    const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // 核心：推断出的真实卡片模式（如果是system，就根据系统判定；如果是固定的，就直接用固定的）
    const resolvedMode: 'light' | 'dark' =
        colorMode === 'system'
            ? (systemIsDark ? 'dark' : 'light')
            : colorMode;

    const modeOptions: { id: ThemeMode; label: string; icon: string }[] = [
        { id: 'light', label: 'Light', icon: '☀️' },
        { id: 'dark', label: 'Dark', icon: '☾' },
        { id: 'system', label: 'System', icon: '◑' },
    ];

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-serif-fancy italic font-bold mb-4 tracking-wide text-ink">
                    Skins & Themes
                </h1>
                <p className="text-muted text-sm md:text-base leading-relaxed font-light">
                    A skin restyles the whole app — palette, type, and ambiance.
                </p>
            </div>

            {/* 顶部的 Light / Dark / System 切换 */}
            <div className="flex items-center gap-4 text-sm">
                <span className="font-bold tracking-[0.15em] text-muted text-xs uppercase">
                    Preview In
                </span>
                <div className="flex bg-card-2 border border-line rounded-full p-1 shadow-inner backdrop-blur-sm">
                    {modeOptions.map((option) => {
                        const isActive = colorMode === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setColorMode(option.id)}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full 
                                capitalize transition-all duration-300 ${
                                    isActive
                                        ? 'bg-ink text-bg shadow-md font-medium scale-105'
                                        : 'text-muted hover:text-ink hover:bg-card'
                                }`}
                            >
                                <span className="text-xs">{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 固定的 6 张主题卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {THEMES.map((themeObj) => (
                    <ThemeCard
                        key={themeObj.id}
                        theme={themeObj}
                        isActive={activeTheme === themeObj.id}
                        currentMode={resolvedMode} // 关键参数：将真实模式传给卡片
                        onSelect={(id) => setTheme(id as ThemeSkin)}
                    />
                ))}
            </div>
        </div>
    );
}