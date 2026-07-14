import { useState, useEffect } from 'react';

export function LandingHeader() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    return (
        <header className="w-full max-w-6xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center z-20 font-mono text-[11px] tracking-[0.2em] uppercase select-none">
            {/* 左侧：带动态呼吸感的精美区域标识 */}
            <div className="flex items-center gap-3 opacity-40 hover:opacity-80 transition-opacity duration-300">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse"></span>
                <span>[ Chronicle Chamber ]</span>
            </div>

            {/* 右侧：古典数字时钟 */}
            <div className="opacity-30 hover:opacity-70 transition-opacity duration-300 italic font-light tracking-widest lowercase">
                {formatTime(time)}
            </div>
        </header>
    );
}