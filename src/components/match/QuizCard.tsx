// src/components/match/QuizCard.tsx

import React, {useState} from 'react';
import type {BookWithUserData} from '../../types/book';
import {useQuizMatch} from './useQuizMatch';
import {QuizOptionCard} from "./QuixOptionCard";
import {BookDetailModal} from '../library/BookDetailModal'; // 引入 BookDetailModal

interface QuizCardProps {
    onSelectBook?: (book: BookWithUserData) => void;
    onClose?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({onSelectBook, onClose}) => {
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

    // 1. 本地状态：追踪用户选择的偏好标签（左侧面板同步用）
    const [traits, setTraits] = useState({
        Genre: '—',
        Spice: '—',
        Length: '—'
    });

    // 2. 本地状态：追踪鼠标 Hover 的图书 ID（右侧面板同步用）
    const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

    // 3. 本地状态：控制图书详情弹窗
    const [selectedDetailBook, setSelectedDetailBook] = useState<BookWithUserData | null>(null);

    // 计算进度百分比
    const progress = ((step) / totalQuestions) * 100;

    // 包装选择选项的操作，同步更新左侧 Traits
    const onOptionClick = (opt: any) => {
        // 根据当前的 step (0, 1, 2) 来判断是哪个维度的选项
        let traitKey: 'Genre' | 'Spice' | 'Length' = 'Genre';
        if (step === 0) traitKey = 'Genre';
        else if (step === 1) traitKey = 'Spice';
        else if (step === 2) traitKey = 'Length';

        setTraits(prev => ({...prev, [traitKey]: opt.label}));
        handleSelectOption(currentQ!.id, opt.value);
    };

    // 包装重置操作
    const handleReset = () => {
        setTraits({Genre: '—', Spice: '—', Length: '—'});
        setHoveredBookId(null);
        resetQuiz();
    };

    // 获取右侧面板当前要展示的匹配结果（Hover 优先，否则默认第一本）
    const displayMatch = hoveredBookId
        ? recommendations.find(r => r.book.id === hoveredBookId)
        : recommendations[0];

    return (
        <>
            {/* 外层改为 max-w-6xl，内部使用 Grid 分为三块 */}
            <div
                className="relative z-10 w-full max-w-6xl h-[85vh] max-h-[850px] bg-gradient-to-b from-card via-bg2 to-card border border-line/80 rounded-2xl shadow-2xl overflow-hidden flex flex-row">

                {/* ================= 左侧面板：Taste Profile ================= */}
                <div className="hidden md:flex flex-col w-[260px] flex-shrink-0 border-r border-line/40 p-6 bg-card/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-lg animate-pulse">
                            🧠
                        </div>
                        <div>
                            <div
                                className="font-mono font-bold text-[11px] uppercase tracking-widest text-muted">Reader
                            </div>
                            <div className="font-display font-bold text-sm text-ink">Your Taste Profile</div>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">Current
                            Vibe
                        </div>
                        <div className="flex flex-col gap-2">
                            {step < totalQuestions && currentQ ? (
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className="px-3 py-1.5 bg-bg2 border border-line/60 rounded-lg text-xs text-ink font-medium animate-pulse">
                                        In Progress...
                                    </span>
                                </div>
                            ) : (
                                <div className="text-primary text-xs font-mono font-bold">
                                    {loading ? 'Analyzing...' : 'Profile Locked 🔒'}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-line/40">
                            <div
                                className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">Selected
                                traits
                            </div>
                            <div className="mt-3 space-y-2.5 text-[11px] text-muted">
                                <div className="flex justify-between items-center">
                                    <span>Genre</span>
                                    <span
                                        className={`font-bold truncate max-w-[110px] text-right ${traits.Genre !== '—' ? 'text-ink' : 'text-muted/40'}`}>
                                        {traits.Genre}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Spice Level</span>
                                    <span
                                        className={`font-bold truncate max-w-[110px] text-right ${traits.Spice !== '—' ? 'text-ink' : 'text-muted/40'}`}>
                                        {traits.Spice}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Length</span>
                                    <span
                                        className={`font-bold truncate max-w-[110px] text-right ${traits.Length !== '—' ? 'text-ink' : 'text-muted/40'}`}>
                                        {traits.Length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-line/40 text-[10px] font-mono text-center text-muted/50">
                        📖 Somnia Library Vault
                    </div>
                </div>


                {/* ================= 中间面板：Main Quiz Area ================= */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* 标题栏 */}
                    <div
                        className="px-6 py-4 flex items-center justify-between border-b border-line/40 shrink-0 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-primary text-base animate-pulse">💘</span>
                            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
                                Matchmaker
                            </span>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-full bg-card border border-line flex items-center justify-center text-xs text-muted hover:text-ink hover:border-tertiary transition-all"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* 内容区域 */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-center scrollbar-hide">
                        {step < totalQuestions && currentQ && (
                            <div className="space-y-5 max-w-xl mx-auto w-full animate-in fade-in duration-300">
                                {/* 题目说明 */}
                                <div className="space-y-1 text-center sm:text-left">
                                    <span
                                        className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-widest">
                                        {currentQ.subtitle}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-display font-bold text-ink leading-snug">
                                        {currentQ.title}
                                    </h3>
                                </div>

                                {/* 选项卡片列表 */}
                                <div className="space-y-2.5 pt-1">
                                    {currentQ.options.map((opt, idx) => (
                                        <QuizOptionCard
                                            key={idx}
                                            option={opt}
                                            onSelect={() => onOptionClick(opt)} // 修改这里，接管点击事件
                                        />
                                    ))}
                                </div>

                                {/* 跳过选项 */}
                                <div className="pt-2 text-center">
                                    <button
                                        onClick={() => runSmartMatchingEngine({genre: 'ANY', spice: 0, length: 'ANY'})}
                                        className="text-[11px] font-mono text-muted hover:text-tertiary underline decoration-line hover:decoration-tertiary transition-all"
                                    >
                                        Skip the quiz — match my standing taste →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 阶段 2：智能计算中 */}
                        {step >= totalQuestions && loading && (
                            <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
                                <div className="relative w-14 h-14 flex items-center justify-center">
                                    <div
                                        className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"/>
                                    <div
                                        className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"/>
                                    <span className="absolute text-xl">🔮</span>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-display font-bold text-base text-ink">Consulting the Library
                                        Vault...</h4>
                                    <p className="text-[10px] font-mono text-muted animate-pulse tracking-widest">
                                        ANALYZING TROPES & SPICE COMPATIBILITY
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 阶段 3：推荐结果 */}
                        {step >= totalQuestions && !loading && (
                            <div className="space-y-4 max-w-xl mx-auto w-full animate-in zoom-in-95 duration-300">
                                <div className="text-center space-y-0.5 m-2">
                                    <span
                                        className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-mono font-bold uppercase tracking-widest">
                                        Match Found
                                    </span>
                                    <h3 className="text-xl font-display font-bold text-ink">
                                        Your Next Obsession Awaits
                                    </h3>
                                    <p className="text-[11px] text-muted">
                                        Based on your current mood and craving analysis
                                    </p>
                                </div>

                                <div className="space-y-2.5 pt-1">
                                    {recommendations.map((item, idx) => (
                                        <div
                                            key={item.book.id}
                                            onClick={() => {
                                                // 点击展示图书详情 Modal
                                                setSelectedDetailBook(item.book);
                                                if (onSelectBook) onSelectBook(item.book);
                                            }}
                                            onMouseEnter={() => setHoveredBookId(item.book.id)} // 悬停同步给右侧
                                            onMouseLeave={() => setHoveredBookId(null)}
                                            className={`group relative p-3.5 rounded-xl bg-card border transition-all duration-200 flex items-center gap-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                                                idx === 0
                                                    ? 'border-primary shadow-sm bg-gradient-to-r from-card via-primary/5 to-card'
                                                    : 'border-line/80 hover:border-tertiary'
                                            }`}
                                        >
                                            <div
                                                className="w-11 h-16 bg-bg2 rounded overflow-hidden border border-line shrink-0 shadow-sm flex items-center justify-center text-xl">
                                                {item.book.cover ? (
                                                    <img src={item.book.cover} alt={item.book.title}
                                                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"/>
                                                ) : (
                                                    '📖'
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    {idx === 0 &&
                                                        <span className="text-xs" title="Top Recommendation">👑</span>}
                                                    <h4 className="font-display font-bold text-sm text-ink truncate group-hover:text-primary transition-colors">
                                                        {item.book.title}
                                                    </h4>
                                                </div>

                                                <div className="flex items-center justify-between w-full pt-0.5 text-[10px] font-mono text-muted">
                                                    <p className="text-[11px] text-muted truncate">
                                                        by <span className="text-ink font-medium">{item.book.author || 'Unknown'}</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-0.5">
                                                        <span>★ {item.book.rating || '4.0'}</span>
                                                        <span>🌶️ {item.book.spice || 0}/5</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end shrink-0">
                                                <span className="text-base font-mono font-bold text-primary">
                                                    {item.matchScore}%
                                                </span>
                                                <span className="text-[8px] font-mono text-muted uppercase">Match</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleReset} // 修改为重置全部状态的方法
                                        className="px-6 py-2 rounded-lg bg-bg2 border border-line text-[11px] font-mono font-bold text-ink hover:border-tertiary transition-all"
                                    >
                                        ↻ Retake Quiz
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= 右侧面板：Match Progress & Score ================= */}
                <div className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-l border-line/40 p-6 bg-card/30">
                    <div className="flex justify-between items-center mb-4">
                        <div className="font-mono font-bold text-[11px] uppercase tracking-widest text-muted">Progress
                        </div>
                        <div className="text-xs font-mono text-primary font-bold">
                            {Math.min(step + 1, totalQuestions)}/{totalQuestions}
                        </div>
                    </div>

                    {/* 进度条 */}
                    <div className="w-full h-1.5 bg-bg2 rounded-full overflow-hidden mb-8">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500 ease-out"
                            style={{width: `${Math.min(progress, 100)}%`}}
                        ></div>
                    </div>

                    {/* 匹配分/状态 */}
                    <div className="flex flex-col flex-1 justify-center items-center text-center gap-2">
                        {step < totalQuestions && !loading && (
                            <div className="space-y-2">
                                <div className="text-5xl font-display font-bold text-muted/20 transition-all">?</div>
                                <div
                                    className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider">Compatibility
                                </div>
                                <div className="text-[10px] text-muted/60 mt-1">Select your craving<br/>to reveal score
                                </div>
                            </div>
                        )}
                        {loading && (
                            <div className="animate-pulse space-y-3">
                                <div className="text-3xl font-display font-bold text-primary/70">...</div>
                                <div
                                    className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">Calculating
                                </div>
                            </div>
                        )}
                        {step >= totalQuestions && !loading && displayMatch && (
                            <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                                {/* 动态展示当前 Hover 的分数 */}
                                <div
                                    className="text-5xl font-display font-bold text-primary drop-shadow-md transition-all">
                                    {displayMatch.matchScore}%
                                </div>
                                <div className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">
                                    {hoveredBookId && hoveredBookId !== recommendations[0].book.id ? 'Match Score' : 'Top Match'}
                                </div>
                                {/* 显示当前 Hover 的书名，增强右侧联动感 */}
                                <div className="text-xs font-display text-ink font-medium px-2 truncate max-w-[170px]">
                                    {displayMatch.book.title}
                                </div>

                                <div
                                    className="mt-4 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full inline-block">
                                    <span className="text-[10px] text-primary/80 font-mono font-bold">
                                        {recommendations.length} books found
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="mt-auto pt-4 border-t border-line/40 text-[10px] font-mono text-center text-muted/50">
                        🔒 Vault locked & ready
                    </div>
                </div>
            </div>

            {/* ================= 图书详情 Modal ================= */}
            {selectedDetailBook && (
                <BookDetailModal
                    book={selectedDetailBook}
                    onClose={() => setSelectedDetailBook(null)}
                />
            )}
        </>
    );
};