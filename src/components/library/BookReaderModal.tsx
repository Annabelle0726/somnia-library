// src/components/library/BookReaderModal.tsx

import React from 'react';

interface BookReaderModalProps {
    readerUrl: string;
    title: string;
    onClose: () => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({ readerUrl, title, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl h-[92vh] bg-card border border-line rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                {/* 顶部 Header */}
                <div className="px-4 py-3 bg-bg2 border-b border-line flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📖</span>
                        <h3 className="text-sm font-bold text-ink truncate max-w-md">{title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-tertiary/20 text-tertiary rounded border border-tertiary/30">
                            Open Library Reader
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink transition-all text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* 网页嵌入视图 */}
                <div className="flex-1 w-full bg-black relative">
                    <iframe
                        src={readerUrl}
                        title={`Reading ${title}`}
                        className="w-full h-full border-none"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};