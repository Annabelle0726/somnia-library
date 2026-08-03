// src/components/home/NextReadQuizModal.tsx
import React from 'react';
import { QuizCard } from '../match/QuizCard';
import type { BookWithUserData } from '../../types/book';

interface NextReadQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBook: (book: BookWithUserData) => void;
}

export const NextReadQuizModal: React.FC<NextReadQuizModalProps> = ({ isOpen, onClose, onSelectBook }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-300">
            {/* 背景遮罩 */}
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

            {/* 复用核心测试卡片 */}
            <QuizCard onClose={onClose} onSelectBook={onSelectBook} />
        </div>
    );
};