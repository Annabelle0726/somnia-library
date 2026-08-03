// C:\Projects\somnia-library\src\components\match\QuixOptionCard.tsx
import React from 'react';
import type { QuizOption } from './quizData';

interface QuizOptionCardProps {
    option: QuizOption;
    onSelect: (value: any) => void;
}

export const QuizOptionCard: React.FC<QuizOptionCardProps> = ({ option, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(option.value)}
            className="group relative w-full p-3 sm:p-3.5 rounded-xl bg-card/60 hover:bg-card border border-line/70 hover:border-primary/60 transition-all duration-300 flex items-center justify-between text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
        >
            {/* 左侧悬停微光视觉 */}
            <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center rounded-r-full" />

            <div className="flex items-center gap-3.5 min-w-0 pl-1">
                <span className="text-xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    {option.icon}
                </span>
                <span className="font-display font-medium text-xs sm:text-sm text-ink group-hover:text-primary transition-colors">
                    {option.label}
                </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all text-xs font-bold">
                    →
                </span>
            </div>
        </button>
    );
};