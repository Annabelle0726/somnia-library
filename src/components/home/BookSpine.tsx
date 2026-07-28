// src/components/home/BookSpine.tsx
// import React from 'react';

interface BookSpineProps {
    title: string;
    /** 与 BookShelfHeader & BookShelfRow 保持统一的主题配色 */
    colorTheme?: 'primary' | 'secondary' | 'tertiary';
    /** 👈 新增点击回调 */
    onClick?: () => void;
}

export function BookSpine({ title, colorTheme = 'primary', onClick }: BookSpineProps) {
    const themeStyles = {
        primary: 'hover:border-primary hover:bg-primary/10 group-hover:text-primary',
        secondary: 'hover:border-secondary hover:bg-secondary/10 group-hover:text-secondary',
        tertiary: 'hover:border-tertiary hover:bg-tertiary/10 group-hover:text-tertiary',
    };

    const currentThemeStyle = themeStyles[colorTheme] || themeStyles.primary;

    return (
        <div
            onClick={onClick}
            className={`w-12 h-48 bg-card border border-line/80 rounded-t-md shadow-md flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-all duration-300 group ${currentThemeStyle.split(' ').slice(0, 2).join(' ')}`}
            title={title}
        >
            <p className={`text-ink font-display text-xs tracking-widest [writing-mode:vertical-rl] select-none text-center truncate max-h-40 transition-colors ${currentThemeStyle.split(' ')[2]}`}>
                {title}
            </p>
        </div>
    );
}