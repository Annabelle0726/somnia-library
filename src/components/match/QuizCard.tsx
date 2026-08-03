// src/components/match/QuizCard.tsx


import React from 'react';
import type { BookWithUserData } from '../../types/book';
import { useQuizMatch } from './useQuizMatch';

interface QuizCardProps {
    onSelectBook?: (book: BookWithUserData) => void;
    onClose?: () => void; // 如果在 Modal 里传 onClose，页面里可以不传
}

export const QuizCard: React.FC<QuizCardProps> = ({ onSelectBook, onClose }) => {
    const {
        step,
        loading,
        recommendations,
        currentQ,
        handleSelectOption,
        runSmartMatchingEngine,
        resetQuiz,
        totalQuestions
    } = useQuizMatch();

    return (
        <div className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-card via-bg2 to-card border border-line/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[480px]">
            {/* 顶部标题 */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-line/40 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-primary text-lg animate-pulse">💘</span>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                        Matchmaker
                    </span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink hover:border-tertiary transition-all"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* 内容区域 */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center overflow-y-auto">
                {step < totalQuestions && currentQ && (
                    <div className="space-y-6 max-w-xl mx-auto w-full animate-in fade-in duration-300">
                        <div className="space-y-2 text-center sm:text-left">
                            <span className="text-[11px] font-mono font-bold text-tertiary uppercase tracking-widest">
                                {currentQ.subtitle}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-display
                             font-bold text-ink leading-snug">
                                {currentQ.title}
                            </h3>
                        </div>

                        <div className="space-y-3 pt-2">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(currentQ.id, opt.value)}
                                    className="group w-full p-4 rounded-2xl bg-card/80 hover:bg-bg2 border border-line/80 hover:border-primary/80 transition-all duration-300 flex items-center justify-between text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl group-hover:scale-125 transition-transform duration-300">
                                            {opt.icon}
                                        </span>
                                        <span className="font-display font-medium text-sm sm:text-base text-ink group-hover:text-primary transition-colors">
                                            {opt.label}
                                        </span>
                                    </div>
                                    <span className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all text-sm font-bold">
                                        →
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 text-center">
                            <button
                                onClick={() => runSmartMatchingEngine({ genre: 'ANY', spice: 0, length: 'ANY' })}
                                className="text-xs font-mono text-muted hover:text-tertiary underline decoration-line hover:decoration-tertiary transition-all"
                            >
                                Skip the quiz — match my standing taste →
                            </button>
                        </div>
                    </div>
                )}

                {step >= totalQuestions && loading && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            <span className="absolute text-xl">🔮</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-display font-bold text-lg text-ink">Consulting the Library Vault...</h4>
                            <p className="text-xs font-mono text-muted animate-pulse tracking-widest">
                                ANALYZING TROPES & SPICE COMPATIBILITY
                            </p>
                        </div>
                    </div>
                )}

                {step >= totalQuestions && !loading && (
                    <div className="space-y-6 max-w-xl mx-auto w-full animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-1">
                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono font-bold uppercase tracking-widest">
                                Match Found
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-display font-bold text-ink">
                                Your Next Obsession Awaits
                            </h3>
                            <p className="text-xs text-muted">
                                Based on your current mood and craving analysis
                            </p>
                        </div>

                        <div className="space-y-4 pt-2">
                            {recommendations.map((item, idx) => (
                                <div
                                    key={item.book.id}
                                    onClick={() => {
                                        if (onClose) onClose();
                                        if (onSelectBook) onSelectBook(item.book);
                                    }}
                                    className={`group relative p-4 rounded-2xl bg-card border transition-all duration-300 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
                                        idx === 0
                                            ? 'border-primary shadow-md bg-gradient-to-r from-card via-primary/5 to-card'
                                            : 'border-line/80 hover:border-tertiary'
                                    }`}
                                >
                                    <div className="w-14 h-20 bg-bg2 rounded-lg overflow-hidden border border-line shrink-0 shadow-sm flex items-center justify-center text-2xl">
                                        {item.book.cover ? (
                                            <img src={item.book.cover} alt={item.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            '📖'
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            {idx === 0 && <span className="text-xs" title="Top Recommendation">👑</span>}
                                            <h4 className="font-display font-bold text-base text-ink truncate group-hover:text-primary transition-colors">
                                                {item.book.title}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-muted truncate">
                                            by <span className="text-ink font-medium">{item.book.author || 'Unknown'}</span>
                                        </p>
                                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-muted">
                                            <span>★ {item.book.rating || '4.0'}</span>
                                            <span>•</span>
                                            <span>🌶️ {item.book.spice || 0}/5</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="text-lg font-mono font-bold text-primary">
                                            {item.matchScore}%
                                        </span>
                                        <span className="text-[9px] font-mono text-muted uppercase">Match</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 flex justify-center gap-4">
                            <button
                                onClick={resetQuiz}
                                className="px-6 py-2 rounded-xl bg-bg2 border border-line text-xs font-mono font-bold text-ink hover:border-tertiary transition-all"
                            >
                                ↻ Retake Quiz
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};