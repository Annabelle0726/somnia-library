// src/components/library/BookSynopsis.tsx

import React, { useState } from 'react';

interface BookSynopsisProps {
    description: string | null;
    isLoading: boolean;
    openLibraryKey?: string | null;
    onOpenReader?: (readerUrl: string) => void;
}

// 过滤 Markdown 特殊符号（* # _ ~ [ ] 等）
const cleanMarkdown = (text: string) => {
    return text
        .replace(/[*_~`#]/g, '') // 替换常见的 markdown 标记
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 将链接 [text](url) 转为普通 text
        .replace(/\n{3,}/g, '\n\n') // 压缩过多换行
        .trim();
};

export const BookSynopsis: React.FC<BookSynopsisProps> = ({
                                                              description,
                                                              isLoading,
                                                              openLibraryKey,
                                                              onOpenReader
                                                          }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-2 p-4 bg-bg2/40 border border-line/60 rounded-2xl animate-pulse">
                <div className="h-4 w-32 bg-line/60 rounded" />
                <div className="h-12 bg-line/30 rounded" />
            </div>
        );
    }

    const cleanedText = description ? cleanMarkdown(description) : null;
    const isLongText = cleanedText && cleanedText.length > 240;
    const displayText = isLongText && !isExpanded ? `${cleanedText.slice(0, 240)}...` : cleanedText;

    const olReadUrl = openLibraryKey ? `https://openlibrary.org${openLibraryKey}` : null;

    return (
        <div className="space-y-3 p-4 bg-bg2/40 border border-line/60 rounded-2xl relative">
            <div className="flex items-center justify-between border-b border-line/30 pb-2">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider font-[family-name:var(--font-mono)]">
                    Synopsis / About the Book
                </h4>

                {/* 阅读链接/按钮 */}
                {openLibraryKey && (
                    <div className="flex items-center gap-2">
                        {onOpenReader && (
                            <button
                                onClick={() => onOpenReader(`https://openlibrary.org${openLibraryKey}?mode=embed`)}
                                className="text-[11px] font-mono font-bold text-tertiary hover:underline flex items-center gap-1 bg-tertiary/10 px-2.5 py-1 rounded-lg border border-tertiary/30"
                            >
                                📖 Read Here
                            </button>
                        )}
                        {olReadUrl && (
                            <a
                                href={olReadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono text-muted hover:text-ink flex items-center gap-0.5"
                                title="View on Open Library"
                            >
                                OL ↗
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">
                {cleanedText ? (
                    <>
                        <p>{displayText}</p>
                        {isLongText && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-2 text-xs font-mono font-bold text-tertiary hover:underline inline-block focus:outline-none"
                            >
                                {isExpanded ? 'Show Less ▲' : 'Read More ▼'}
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-muted/50 italic text-xs">
                        Story details not available from the public archive.
                        <br />Feel free to write your own thoughts below!
                    </p>
                )}
            </div>
        </div>
    );
};