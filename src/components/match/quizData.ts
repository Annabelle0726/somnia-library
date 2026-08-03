// src/components/match/quizData.ts

export interface QuizOption {
    label: string;
    value: any;
    icon: string;
}

export interface QuizQuestion {
    id: string;
    title: string;
    subtitle: string;
    options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
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