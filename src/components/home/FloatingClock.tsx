"use client";

import { type JSX, useEffect, useState } from "react";

export default function FloatingClock(): JSX.Element {

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const year = currentTime.getFullYear();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[currentTime.getMonth()];
    const day = String(currentTime.getDate()).padStart(2, '0');
    const hour = String(currentTime.getHours()).padStart(2, '0');
    const min = String(currentTime.getMinutes()).padStart(2, '0');
    const sec = String(currentTime.getSeconds()).padStart(2, '0');
    const timeStr = `${hour}:${min}:${sec}`;

    return (
        <div className="flex items-center gap-1.5 sm:gap-3 bg-gradient-to-r from-card to-bg2/80 backdrop-blur-lg border border-line px-2.5 sm:px-3.5 py-1 rounded-xl shadow-md border-r-2 border-r-tertiary/60 border-l-2 border-l-primary/40 hover:border-tertiary transition-all duration-300 shrink-0">
            <div className="hidden sm:block text-center pr-2.5 border-r border-line/60">
        <span className="text-[10px] font-[family-name:var(--font-body)] font-bold text-tertiary tracking-wider block">
          {year}
        </span>
            </div>

            <div className="text-left sm:pl-0.5 min-w-max sm:min-w-[70px]">
        <span className="hidden sm:block text-[10px] font-medium text-ink font-[family-name:var(--font-body)] tracking-wide leading-none">
          {month} {day}
        </span>
                <span className="block text-[10px] font-[family-name:var(--font-body)] text-primary tracking-wider font-semibold sm:mt-0.5">
          {timeStr}
        </span>
            </div>
        </div>
    );
}