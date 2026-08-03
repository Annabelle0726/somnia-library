// src/pages/Match.tsx

import React from 'react';
import { QuizCard } from '../components/match/QuizCard';
import type { BookWithUserData } from '../types/book';

interface MatchPageProps {
    onSelectBook?: (book: BookWithUserData) => void;
}

export const Match: React.FC<MatchPageProps> = ({ onSelectBook }) => {
    return (
        <div className="flex flex-col gap-6 w-full">
        <QuizCard onSelectBook={onSelectBook} />
        </div>
    );
};