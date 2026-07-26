// src/components/library/AddBookModal.tsx
import React from 'react';
import { AddBookForm } from './AddBookForm';

interface AddBookModalProps {
    isOpen: boolean;
    initialTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
                                                              isOpen,
                                                              initialTitle,
                                                              onClose,
                                                              onSuccess,
                                                          }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-2xl bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 弹窗 Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-line/40">
                    <div>
                        <h3 className="text-lg font-display font-bold text-ink">
                            ✨ Quick Catalogue
                        </h3>
                        <p className="text-xs text-muted">
                            Adding <span className="text-tertiary font-bold">"{initialTitle}"</span> to your archive.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-bg2 flex items-center justify-center text-muted hover:text-ink transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* 表单渲染 */}
                <AddBookForm
                    initialTitle={initialTitle}
                    onCancel={onClose}
                    onSuccess={() => {
                        onSuccess();
                        onClose();
                    }}
                />
            </div>
        </div>
    );
};