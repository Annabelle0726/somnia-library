// src/pages/Theme.tsx
// ✅ 从 ThemeContext 中一次性导入 Hook 和 TypeScript 类型
import { useTheme, type ThemeSkin, type ThemeMode } from '../theme/ThemeContext';
import { THEMES } from '../theme/themes';
import { ThemeCard } from '../components/Theme/ThemeCard';

export default function ThemePage() {
    // ✅ 正确调用 Hook，绝不要加 new
    const { theme: activeTheme, setTheme, mode: colorMode, setMode: setColorMode } = useTheme();

    const modeOptions: { id: ThemeMode; label: string; icon: string }[] = [
        { id: 'light', label: 'Light', icon: '☀️' },
        { id: 'dark', label: 'Dark', icon: '☾' },
        { id: 'system', label: 'System', icon: '◑' },
    ];

    return (
        <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto p-4 md:p-8">
            <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-serif-fancy italic font-bold mb-4 tracking-wide text-ink">
                    Skins & Themes
                </h1>
                <p className="text-muted text-sm md:text-base leading-relaxed font-light">
                    A skin restyles the whole app — palette, type, and ambiance.
                </p>
            </div>

            {/* Light / Dark / System 切换按钮 */}
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
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full capitalize transition-all duration-300 ${
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

            {/* 6个卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {THEMES.map((themeObj) => (
                    <ThemeCard
                        key={themeObj.id}
                        theme={themeObj}
                        isActive={activeTheme === themeObj.id}
                        onSelect={(id) => setTheme(id as ThemeSkin)}
                    />
                ))}
            </div>
        </div>
    );
}