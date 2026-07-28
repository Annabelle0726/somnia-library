// src/components/home/NextReadQuizModal.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/useAuth';
import type { BookWithUserData } from '../../types/book';

interface NextReadQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBook: (book: BookWithUserData) => void;
}

// 5 道精心设计的测试题
const QUIZ_QUESTIONS = [
    {
        id: 'genre',
        title: "What kind of story are you craving right now?",
        subtitle: "Question 1 of 5",
        options: [
            { label: "Romance & Deep Emotional Connections", value: "Romance", icon: "💘" },
            { label: "Sweeping Fantasy, Magic & Adventure", value: "Fantasy", icon: "✨" },
            { label: "Dark, Eerie & Unsettling Suspense", value: "Dark/Thriller", icon: "🕯️" },
            { label: "Cozy, Heartwarming & Small-Town Vibe", value: "Cozy", icon: "☕" },
            { label: "Surprise me — open to anything!", value: "ANY", icon: "🎲" },
        ]
    },
    {
        id: 'spice',
        title: "What is your preferred heat & spice level?",
        subtitle: "Question 2 of 5",
        options: [
            { label: "Innocent & Sweet (Low to no heat)", value: 1, icon: "🌸" },
            { label: "Slow Burn with moderate sizzle", value: 3, icon: "🔥" },
            { label: "Spicy, Unapologetic & High Heat", value: 5, icon: "🌶️" },
            { label: "No preference / Any heat level", value: 0, icon: "🤷‍♀️" },
        ]
    },
    {
        id: 'trope',
        title: "Which dynamic or trope makes your heart beat faster?",
        subtitle: "Question 3 of 5",
        options: [
            { label: "Enemies to Lovers / Rivalry", value: "Enemies to Lovers", icon: "⚔️" },
            { label: "Forced Proximity / Only One Bed", value: "Forced Proximity", icon: "🌧️" },
            { label: "Fake Dating / Marriage of Convenience", value: "Fake Dating", icon: "💍" },
            { label: "Grumpy x Sunshine / Opposites Attract", value: "Grumpy Sunshine", icon: "☀️" },
            { label: "Second Chance / Destined to be", value: "Second Chance", icon: "⏳" },
        ]
    },
    {
        id: 'length',
        title: "How much time are you ready to invest?",
        subtitle: "Question 4 of 5",
        options: [
            { label: "Quick & Breezy (< 300 pages)", value: "short", icon: "⚡" },
            { label: "Substantial & Immersive (300 - 450 pages)", value: "medium", icon: "📖" },
            { label: "An Epic Tome (450+ pages)", value: "long", icon: "🏰" },
            { label: "Page count doesn't matter to me", value: "ANY", icon: "📑" },
        ]
    },
    {
        id: 'vibe',
        title: "Finally, what's the ultimate goal for tonight?",
        subtitle: "Question 5 of 5",
        options: [
            { label: "Guaranteed Happily Ever After (HEA)", value: "hea", icon: "💖" },
            { label: "An emotional rollercoaster / Tearjerker", value: "emotional", icon: "🥺" },
            { label: "Mind-bending plot twists & tension", value: "twist", icon: "🤯" },
            { label: "Just give me the highest-rated masterpiece", value: "top_rated", icon: "👑" },
        ]
    }
];

export const NextReadQuizModal: React.FC<NextReadQuizModalProps> = ({ isOpen, onClose, onSelectBook }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [recommendations, setRecommendations] = useState<Array<{ book: BookWithUserData; matchScore: number }>>([]);

    // 每次打开弹窗重置状态
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setAnswers({});
            setRecommendations([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 选择某个选项
    const handleSelectOption = (questionId: string, value: any) => {
        const nextAnswers = { ...answers, [questionId]: value };
        setAnswers(nextAnswers);

        if (step < QUIZ_QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            // 答题结束，执行数据库智能匹配
            runSmartMatchingEngine(nextAnswers);
        }
    };

    // ⚡ 核心算法：SQL 查询 + 多维度加权相似度评分
    const runSmartMatchingEngine = async (finalAnswers: Record<string, any>) => {
        setStep(QUIZ_QUESTIONS.length); // 进入 Loading 屏
        setLoading(true);

        try {
            // 1. 获取用户所有书籍
            const { data: allBooks, error } = await supabase.from('books').select('*');
            if (error) throw error;
            if (!allBooks || allBooks.length === 0) {
                setRecommendations([]);
                setLoading(false);
                return;
            }

            // 2. 获取用户已读/废弃的状态，过滤掉已经读完的书
            let readBookIds = new Set<string>();
            if (user) {
                const { data: statuses } = await supabase
                    .from('user_book_status')
                    .select('book_id, status')
                    .eq('user_id', user.id)
                    .in('status', ['read', 'abandoned']);
                statuses?.forEach(s => readBookIds.add(s.book_id));
            }

            // 候选书单（未读或正在读、想读的）
            const candidates = allBooks.filter(book => !readBookIds.has(book.id));
            const pool = candidates.length > 0 ? candidates : allBooks; // 如果全都读完了，就从全库里选

            // 3. 逐书进行多维加权评分 (满分 100 分)
            const scoredBooks = pool.map(book => {
                let score = 50; // 基础分 50

                // 维度 A: 题材/风格契合度 (最高 +20 分)
                if (finalAnswers.genre !== 'ANY') {
                    const genreStr = `${book.subgenre || ''} ${book.title} ${book.tropes?.join(' ') || ''}`.toLowerCase();
                    if (genreStr.includes(finalAnswers.genre.toLowerCase())) {
                        score += 20;
                    } else if (finalAnswers.genre === 'Romance' && (book.spice || 0) >= 2) {
                        score += 15; // 辣度高通常关联爱情
                    }
                } else {
                    score += 10;
                }

                // 维度 B: 辣度精准适配 (最高 +15 分)
                if (finalAnswers.spice > 0) {
                    const bookSpice = book.spice || 0;
                    const diff = Math.abs(bookSpice - finalAnswers.spice);
                    if (diff === 0) score += 15;
                    else if (diff === 1) score += 10;
                    else score -= 5;
                } else {
                    score += 10;
                }

                // 维度 C: Trope 标签命中 (最高 +15 分)
                if (finalAnswers.trope && book.tropes && Array.isArray(book.tropes)) {
                    const hasTrope = book.tropes.some((t: string) =>
                        t.toLowerCase().includes(finalAnswers.trope.toLowerCase()) ||
                        finalAnswers.trope.toLowerCase().includes(t.toLowerCase())
                    );
                    if (hasTrope) score += 15;
                }

                // 维度 D: 篇幅偏好 (最高 +10 分)
                const pages = book.pages || 350;
                if (finalAnswers.length === 'short' && pages < 300) score += 10;
                else if (finalAnswers.length === 'medium' && pages >= 300 && pages <= 450) score += 10;
                else if (finalAnswers.length === 'long' && pages > 450) score += 10;
                else if (finalAnswers.length === 'ANY') score += 5;

                // 维度 E: 客观高分加成 (最高 +10 分)
                const rating = Number(book.rating) || 4.0;
                if (finalAnswers.vibe === 'top_rated' || rating >= 4.3) {
                    score += Math.min(10, (rating - 3.5) * 10);
                }

                // 限制在 60% ~ 99% 之间，显得真实且匹配高
                const finalScore = Math.min(99, Math.max(65, Math.round(score)));
                return { book: book as BookWithUserData, matchScore: finalScore };
            });

            // 4. 按评分降序排序，取前 3 名
            scoredBooks.sort((a, b) => b.matchScore - a.matchScore);
            setRecommendations(scoredBooks.slice(0, 3));
        } catch (err) {
            console.error("Matching engine failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const currentQ = QUIZ_QUESTIONS[step];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-300">
            {/* 背景遮罩 */}
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

            {/* 卡片主容器 */}
            <div
                className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-card via-bg2 to-card border border-line/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[480px] max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* 顶部导航与关闭按钮 */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-line/40 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-primary text-lg animate-pulse">💘</span>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                            Reverie Matchmaker
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink hover:border-tertiary transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* 主体内容区 */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center overflow-y-auto">
                    {/* 阶段 1：答题流程 */}
                    {step < QUIZ_QUESTIONS.length && currentQ && (
                        <div className="space-y-6 max-w-xl mx-auto w-full animate-in fade-in duration-300">
                            {/* 进度提示 */}
                            <div className="space-y-2 text-center sm:text-left">
                                <span className="text-[11px] font-mono font-bold text-tertiary uppercase tracking-widest">
                                    {currentQ.subtitle}
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-snug">
                                    {currentQ.title}
                                </h3>
                            </div>

                            {/* 选项卡片列表 */}
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

                            {/* 快速跳过测试 */}
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

                    {/* 阶段 2：智能计算中 */}
                    {step >= QUIZ_QUESTIONS.length && loading && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                <span className="absolute text-xl">🔮</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-display font-bold text-lg text-ink">
                                    Consulting the Library Vault...
                                </h4>
                                <p className="text-xs font-mono text-muted animate-pulse tracking-widest">
                                    ANALYZING TROPES & SPICE COMPATIBILITY
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 阶段 3：推荐结果揭晓 */}
                    {step >= QUIZ_QUESTIONS.length && !loading && (
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

                            {/* Top 推荐书列表 */}
                            <div className="space-y-4 pt-2">
                                {recommendations.map((item, idx) => (
                                    <div
                                        key={item.book.id}
                                        onClick={() => {
                                            onClose();
                                            onSelectBook(item.book); // 触发打开详情页面
                                        }}
                                        className={`group relative p-4 rounded-2xl bg-card border transition-all duration-300 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
                                            idx === 0
                                                ? 'border-primary shadow-md bg-gradient-to-r from-card via-primary/5 to-card'
                                                : 'border-line/80 hover:border-tertiary'
                                        }`}
                                    >
                                        {/* 封面缩略图 */}
                                        <div className="w-14 h-20 bg-bg2 rounded-lg overflow-hidden border border-line shrink-0 shadow-sm flex items-center justify-center text-2xl">
                                            {item.book.cover ? (
                                                <img src={item.book.cover} alt={item.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                '📖'
                                            )}
                                        </div>

                                        {/* 书名与作者 */}
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

                                        {/* 匹配度百分比徽章 */}
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-lg font-mono font-bold text-primary">
                                                {item.matchScore}%
                                            </span>
                                            <span className="text-[9px] font-mono text-muted uppercase">
                                                Match
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 底部重试按钮 */}
                            <div className="pt-2 flex justify-center gap-4">
                                <button
                                    onClick={() => setStep(0)}
                                    className="px-6 py-2 rounded-xl bg-bg2 border border-line text-xs font-mono font-bold text-ink hover:border-tertiary transition-all"
                                >
                                    ↻ Retake Quiz
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};