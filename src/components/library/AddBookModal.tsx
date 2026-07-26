// src/components/library/AddBookModal.tsx
import React, { useEffect } from 'react';
import { AddBookForm } from './AddBookForm';

interface AddBookModalProps {
    isOpen: boolean;
    initialTitle?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
                                                              isOpen,
                                                              initialTitle = '',
                                                              onClose,
                                                              onSuccess,
                                                          }) => {
    // 监听 Esc 键关闭弹窗 & 打开时禁止底层页面滚动
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* 1. 点击黑色遮罩背景关闭弹窗 */}
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* 2. 弹窗主体 (限制宽度与最大高度，内部优雅滚动，防止与 Sidebar / Outlet 发生空间挤压) */}
            <div
                className="relative z-10 w-full max-w-xl bg-card border border-line/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col transition-all transform animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 弹窗 Header (固定顶部，不参与滚动) */}
                <div className="flex items-center justify-between pb-4 border-b border-line/50 shrink-0">
                    <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-tertiary uppercase tracking-wider font-[family-name:var(--font-mono)]">
                            ✦ Catalogue Entry
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-display text-ink">
                            Summon New Tome
                        </h2>
                    </div>

                    {/* 关闭按钮 */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-bg2 border border-line flex items-center justify-center text-muted hover:text-ink hover:border-tertiary transition-all"
                        title="Close Modal"
                    >
                        ✕
                    </button>
                </div>

                {/* 弹窗 Body (内部支持平滑滚动，并隐藏粗糙滚动条) */}
                <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-line">
                    <AddBookForm
                        initialTitle={initialTitle}
                        onSuccess={() => {
                            onSuccess?.();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
};