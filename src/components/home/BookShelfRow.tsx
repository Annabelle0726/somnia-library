// src/components/home/BookShelfRow.tsx
import { useState } from 'react';
import type { BookWithUserData } from '../../types/book';
import { BookSpine3D } from './3DBookSpine';
import { BookGridItem } from './BookGridItem';

interface BookShelfRowProps {
    title: string;
    icon: string;
    colorTheme: 'primary' | 'secondary' | 'tertiary' | 'muted';
    books: BookWithUserData[];
    onBookClick?: (book: BookWithUserData) => void;
    /** 是否默认展开 */
    defaultExpanded?: boolean;
}

export function BookShelfRow({
                                 title,
                                 icon,
                                 colorTheme,
                                 books,
                                 onBookClick,
                                 defaultExpanded = true,
                             }: BookShelfRowProps) {
    const [viewMode, setViewMode] = useState<'realistic' | 'grid'>('realistic');
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // 1. 文字颜色映射
    const textColorMap = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        tertiary: 'text-tertiary',
        muted: 'text-muted',
    };
    //
    // // 2. 主题色边框映射 (加深与高亮结合)
    // const borderColorMap = {
    //     primary: 'border-primary/60 ring-primary/30',
    //     secondary: 'border-secondary/60 ring-secondary/30',
    //     tertiary: 'border-tertiary/60 ring-tertiary/30',
    //     muted: 'border-muted/60 ring-muted/30',
    // };

    // 🔥 3. 新增：逼真 3D 书架的颜色映射表
    const shelfGradientMap = {
        primary: 'from-primary/20 via-primary/30 to-primary/50',
        secondary: 'from-secondary/20 via-secondary/30 to-secondary/50',
        tertiary: 'from-tertiary/20 via-tertiary/30 to-tertiary/50',
        muted: 'from-muted/20 via-muted/30 to-muted/50',
    };
    const shelfHighlightMap = {
        primary: 'bg-primary/80',
        secondary: 'bg-secondary/80',
        tertiary: 'bg-tertiary/80',
        muted: 'bg-muted/80',
    };

    return (
        <div className="flex flex-col gap-3 w-full border-b border-line/30 pb-8 last:border-b-0">
            {/* Header 区域：标题 + 数量 + 视图切换 */}
            <div className="flex items-center justify-between px-1">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <span className={`text-sm ${textColorMap[colorTheme]}`}>{icon}</span>
                    <h3 className="font-display font-bold text-sm text-ink tracking-wide group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-card border border-line text-muted">
                        {books.length}
                    </span>
                    <span className="text-xs text-muted group-hover:text-ink transition-transform duration-200">
                        {isExpanded ? '▼' : '▶'}
                    </span>
                </button>

                {/* 视图模式切换 */}
                {isExpanded && books.length > 0 && (
                    <div className="flex items-center bg-bg2 border border-line rounded-lg p-0.5 text-xs">
                        <button
                            onClick={() => setViewMode('realistic')}
                            className={`px-2 py-0.5 rounded transition-all ${
                                viewMode === 'realistic'
                                    ? 'bg-card text-ink font-bold shadow-sm'
                                    : 'text-muted hover:text-ink'
                            }`}
                            title="3D Shelf View"
                        >
                            📚 3D Shelf
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-2 py-0.5 rounded transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-card text-ink font-bold shadow-sm'
                                    : 'text-muted hover:text-ink'
                            }`}
                            title="Grid Covers"
                        >
                            🖼️ Grid
                        </button>
                    </div>
                )}
            </div>

            {/* 展开内容区 */}
            {isExpanded && (
                <>
                    {books.length === 0 ? (
                        <div className="w-full text-center py-6 select-none border border-line/30 rounded-xl bg-card/20">
                            <p className="font-[family-name:var(--font-decorative)] text-xs text-muted/70 tracking-widest">
                                "No books recorded in this shelf yet."
                            </p>
                        </div>
                    ) : viewMode === 'realistic' ? (
                        /* ============================================================ */
                        /* 3D 实体书架模式 (包含升级后的3D搁板) */
                        /* ============================================================ */
                        <div className="relative pt-8 pb-4 px-4 w-full overflow-x-auto no-scrollbar">
                            <div
                                className="flex items-end gap-3 min-w-max pb-2 px-2"
                                style={{ perspective: '1200px' }}
                            >
                                {books.map((book) => (
                                    <BookSpine3D
                                        key={book.id}
                                        book={book}
                                        colorTheme={colorTheme}
                                        onClick={onBookClick}
                                    />
                                ))}
                            </div>

                            {/* 🔥 升级后的 3D 书架搁板 (与 colorTheme 动态绑定) */}
                            <div className="w-full h-4 mt-2 mb-2 relative rounded-t-md overflow-hidden shadow-inner group-hover:shadow-lg transition-shadow">
                                {/* 1. 搁板主题材质层（上浅下深，模拟真实物理厚度） */}
                                <div className={`w-full h-full absolute inset-0 bg-gradient-to-b ${shelfGradientMap[colorTheme]} rounded-t-md`}></div>

                                {/* 2. 顶部物理反光边缘（真实物体边缘的反光感） */}
                                <div className={`w-full h-[1px] absolute top-0 left-0 ${shelfHighlightMap[colorTheme]} opacity-70`}></div>

                                {/* 3. 底部收口厚度暗影（让架子看起来有体积） */}
                                <div className={`w-full h-1.5 absolute bottom-0 left-0 bg-black/30 rounded-b-md shadow-md`}></div>
                            </div>

                            {/* 4. 物理落地投影（让书架悬浮并产生扎地感） */}
                            <div className="w-full h-3 relative -top-1 left-0">
                                <div className="w-full h-full bg-black/40 blur-[6px] rounded-full pointer-events-none" />
                            </div>
                        </div>
                    ) : (
                        /* 网格封面模式 */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
                            {books.map((book) => (
                                <BookGridItem
                                    key={book.id}
                                    book={book}
                                    colorTheme={colorTheme}
                                    onClick={onBookClick}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}