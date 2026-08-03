// src/components/match/useQuizMatch.ts

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/useAuth';
import type { BookWithUserData } from '../../types/book';
import { QUIZ_QUESTIONS } from './quizData';

export function useQuizMatch() {
    const { user } = useAuth();
    const [step, setStep] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [recommendations, setRecommendations] = useState<Array<{ book: BookWithUserData; matchScore: number }>>([]);

    const resetQuiz = () => {
        setStep(0);
        setAnswers({});
        setRecommendations([]);
    };

    const handleSelectOption = (questionId: string, value: any) => {
        const nextAnswers = { ...answers, [questionId]: value };
        setAnswers(nextAnswers);

        if (step < QUIZ_QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            runSmartMatchingEngine(nextAnswers);
        }
    };

    const runSmartMatchingEngine = async (finalAnswers: Record<string, any>) => {
        setStep(QUIZ_QUESTIONS.length);
        setLoading(true);

        try {
            const { data: allBooks, error } = await supabase.from('books').select('*');
            if (error) throw error;
            if (!allBooks || allBooks.length === 0) {
                setRecommendations([]);
                return;
            }

            let readBookIds = new Set<string>();
            if (user) {
                const { data: statuses } = await supabase
                    .from('user_book_status')
                    .select('book_id, status')
                    .eq('user_id', user.id)
                    .in('status', ['read', 'abandoned']);
                statuses?.forEach(s => readBookIds.add(s.book_id));
            }

            const candidates = allBooks.filter(book => !readBookIds.has(book.id));
            const pool = candidates.length > 0 ? candidates : allBooks;

            const scoredBooks = pool.map(book => {
                let score = 50;

                if (finalAnswers.genre !== 'ANY') {
                    const genreStr = `${book.subgenre || ''} ${book.title} ${book.tropes?.join(' ') || ''}`.toLowerCase();
                    if (genreStr.includes(finalAnswers.genre.toLowerCase())) score += 20;
                    else if (finalAnswers.genre === 'Romance' && (book.spice || 0) >= 2) score += 15;
                } else {
                    score += 10;
                }

                if (finalAnswers.spice > 0) {
                    const diff = Math.abs((book.spice || 0) - finalAnswers.spice);
                    if (diff === 0) score += 15;
                    else if (diff === 1) score += 10;
                    else score -= 5;
                } else {
                    score += 10;
                }

                if (finalAnswers.trope && book.tropes && Array.isArray(book.tropes)) {
                    const hasTrope = book.tropes.some((t: string) =>
                        t.toLowerCase().includes(finalAnswers.trope.toLowerCase()) ||
                        finalAnswers.trope.toLowerCase().includes(t.toLowerCase())
                    );
                    if (hasTrope) score += 15;
                }

                const pages = book.pages || 350;
                if (finalAnswers.length === 'short' && pages < 300) score += 10;
                else if (finalAnswers.length === 'medium' && pages >= 300 && pages <= 450) score += 10;
                else if (finalAnswers.length === 'long' && pages > 450) score += 10;
                else if (finalAnswers.length === 'ANY') score += 5;

                const rating = Number(book.rating) || 4.0;
                if (finalAnswers.vibe === 'top_rated' || rating >= 4.3) {
                    score += Math.min(10, (rating - 3.5) * 10);
                }

                const finalScore = Math.min(99, Math.max(65, Math.round(score)));
                return { book: book as BookWithUserData, matchScore: finalScore };
            });

            scoredBooks.sort((a, b) => b.matchScore - a.matchScore);
            setRecommendations(scoredBooks.slice(0, 3));
        } catch (err) {
            console.error("Matching engine failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        loading,
        recommendations,
        currentQ: QUIZ_QUESTIONS[step],
        handleSelectOption,
        runSmartMatchingEngine,
        resetQuiz,
        totalQuestions: QUIZ_QUESTIONS.length
    };
}