// src/components/home/BookSpine.tsx

interface BookSpineProps {
    title: string;
    /** 与 BookShelfHeader & BookShelfRow 保持统一的主题配色 */
    colorTheme?: 'primary' | 'secondary' | 'tertiary' | 'muted';
    /** 点击回调 */
    onClick?: () => void;
}

export function BookSpine({ title, colorTheme = 'primary', onClick }: BookSpineProps) {
    const themeStyles = {
        primary: {
            border: 'border-line/80 hover:border-primary',
            bg: 'bg-card hover:bg-primary/10',
            text: 'text-ink group-hover:text-primary',
        },
        secondary: {
            border: 'border-line/80 hover:border-secondary',
            bg: 'bg-card hover:bg-secondary/10',
            text: 'text-ink group-hover:text-secondary',
        },
        tertiary: {
            border: 'border-line/80 hover:border-tertiary',
            bg: 'bg-card hover:bg-tertiary/10',
            text: 'text-ink group-hover:text-tertiary',
        },
        muted: {
            border: 'border-muted/60 hover:border-muted',
            bg: 'bg-card hover:bg-muted/10',
            text: 'text-muted group-hover:text-muted',
        },
    };

    // 保底处理，防止 undefined 导致崩溃
    const style = themeStyles[colorTheme] || themeStyles.primary;

    return (
        <div
            onClick={onClick}
            className={`w-12 h-48 border rounded-t-md shadow-md flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-all duration-300 group ${style.border} ${style.bg}`}
            title={title}
        >
            <p className={`font-display text-xs tracking-widest [writing-mode:vertical-rl] select-none text-center truncate max-h-40 transition-colors ${style.text}`}>
                {title}
            </p>
        </div>
    );
}