// src/components/home/3DBookSpine.tsx
import type { BookWithUserData } from '../../types/book';

interface Props {
    book: BookWithUserData;
    colorTheme: 'primary' | 'secondary' | 'tertiary' | 'muted';
    onClick?: (book: BookWithUserData) => void;
}

// 厚度计算函数
const getDynamicThickness = (book: BookWithUserData): number => {
    const unsafeBook = book as unknown as { pageCount?: number };
    if (typeof unsafeBook.pageCount === 'number' && unsafeBook.pageCount > 0) {
        return Math.max(12, Math.min(32, 14 + Math.floor(unsafeBook.pageCount / 40)));
    }
    const keyString = String(book.id || book.title || 'default');
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
        hash = keyString.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 14 + (Math.abs(hash) % 15);
};

export function BookSpine3D({ book, colorTheme, onClick }: Props) {
    const thickness = getDynamicThickness(book);

    // 映射表完全使用你原代码的定义
    const borderColorMap = {
        primary: 'border-primary/60 ring-primary/30',
        secondary: 'border-secondary/60 ring-secondary/30',
        tertiary: 'border-tertiary/60 ring-tertiary/30',
        muted: 'border-muted/60 ring-muted/30',
    };
    const themeAccentBgMap = {
        primary: 'bg-primary/20',
        secondary: 'bg-secondary/20',
        tertiary: 'bg-tertiary/20',
        muted: 'bg-muted/20',
    };
    const textColorMap = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        tertiary: 'text-tertiary',
        muted: 'text-muted',
    };
    // 修正备用封面边框
    const solidBorderMap = {
        primary: 'border-primary',
        secondary: 'border-secondary',
        tertiary: 'border-tertiary',
        muted: 'border-muted',
    };

    return (
        <div
            onClick={() => onClick?.(book)}
            className="group relative h-44 w-28 cursor-pointer origin-bottom"
            style={{ transformStyle: 'preserve-3d' }}
        >
            <div
                className="relative w-full h-full transition-all duration-700 ease-out shadow-md group-hover:shadow-2xl"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(-28deg) rotateX(0deg) translateZ(0px)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `rotateY(0deg) rotateX(2deg) translateZ(40px) translateY(-8px)`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotateY(-28deg) rotateX(0deg) translateZ(0px) translateY(0px)`;
                }}
            >
                {/* 书脊 */}
                <div
                    className={`absolute inset-y-0 h-full border-y border-l ${borderColorMap[colorTheme]} bg-bg2 flex flex-col justify-between overflow-hidden`}
                    style={{
                        width: `${thickness}px`,
                        left: `-${thickness - 0.5}px`,
                        transform: 'rotateY(-90deg)',
                        transformOrigin: 'right center',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    <div className={`w-full h-1.5 ${themeAccentBgMap[colorTheme]} border-b border-black/20`} />
                    <div className="w-full flex-1 flex flex-col justify-between items-center py-2 px-0.5 text-ink-muted">
                        <p
                            className={`font-mono text-center leading-none ${textColorMap[colorTheme]} font-bold line-clamp-1`}
                            style={{
                                fontSize: `${Math.max(8, Math.min(10, thickness / 2.2))}px`,
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                            }}
                        >
                            {book.title}
                        </p>
                        <p className="text-muted text-[8px] tracking-tight line-clamp-1">
                            {book.author || '...'}
                        </p>
                    </div>
                    <div className={`w-full h-1.5 ${themeAccentBgMap[colorTheme]} border-t border-black/20`} />
                    <div className="absolute inset-y-0 right-0 w-[2px] bg-black/30 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 pointer-events-none" />
                </div>

                {/* 书页 */}
                <div
                    className="absolute inset-y-0 h-full border-y border-r border-line/80 bg-card shadow-inner"
                    style={{
                        width: `${thickness - 2}px`,
                        right: `-${thickness - 2}px`,
                        transform: 'rotateY(90deg)',
                        transformOrigin: 'left center',
                        backfaceVisibility: 'hidden',
                        backgroundImage:
                            'repeating-linear-gradient(90deg, rgba(0,0,0,0.03), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 2px)',
                    }}
                />

                {/* 封面 */}
                <div
                    className={`absolute inset-0 w-full h-full rounded-r-sm overflow-hidden z-10 border ${borderColorMap[colorTheme]} ring-1`}
                    style={{
                        transform: 'translateZ(0.5px)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {book.cover ? (
                        <img
                            src={book.cover}
                            alt={book.title}
                            className="w-full h-full object-cover rounded-r-xs group-hover:brightness-105"
                        />
                    ) : (
                        // ✅ 在这里应用了 solidBorderMap，解决了硬编码的问题
                        <div className={`w-full h-full bg-bg2 flex flex-col items-center justify-center p-3 text-center border-l-4 ${solidBorderMap[colorTheme]}`}>
                            <span className="text-xl mb-1">📖</span>
                            <span className="text-xs font-bold line-clamp-3 text-ink">
                                {book.title}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-black/15 to-transparent pointer-events-none border-r border-black/20" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/20 pointer-events-none rounded-r-sm" />
                </div>

                {/* Hover 浮出标题 */}
                <div className="absolute -inset-x-2 -bottom-6 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20">
                    <p className="text-[11px] font-bold text-white line-clamp-1 bg-black/80 px-2 py-0.5 rounded-sm shadow">
                        {book.title}
                    </p>
                </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[90%] h-3 rounded-[50%] bg-black/25 blur-sm transition-all duration-700 ease-out group-hover:bg-black/35 group-hover:blur-md group-hover:scale-125" />
        </div>
    );
}