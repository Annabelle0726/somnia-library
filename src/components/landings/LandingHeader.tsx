import { useState, useEffect } from 'react';

export function LandingHeader() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    return (
        // 核心改动：使用 fixed 固定在顶部，padding-top 保证距离
        <div className="sticky
         top-0 left-0 right-0 z-50

         w-full flex justify-center pointer-events-none">
            <div className="w-full max-w-6xl mx-auto px-6
            pt-4 pb-3
             flex flex-col gap-4 select-none pointer-events-auto">

                {/* 顶部行：导航与时钟 */}
                <div className="w-full flex justify-between items-center">
                    {/* 左侧：精密铭牌风格区域标识 */}
                    {/* ✨ 替换：border-white/10 -> border-line, bg-white/[0.02] -> bg-card/40, hover:border-[#D4AF37]/30 -> hover:border-tertiary/40 */}
                    <div className="flex items-center gap-4 border-[0.5px] border-line rounded-full px-5 py-2.5 bg-card/40 backdrop-blur-sm hover:border-tertiary/40 hover:bg-card/60 transition-all duration-500 ease-in-out">
                        <span className="relative flex h-2 w-2">
                            {/* ✨ 替换：bg-[#D4AF37] -> bg-tertiary */}
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                        </span>
                        {/* ✨ 替换：text-[#A69B8D] -> text-muted, hover:text-white -> hover:text-ink, hover:text-[#D4AF37] -> hover:text-tertiary */}
                        <div className="flex items-center gap-4 font-light tracking-[0.3em] text-[11px] text-muted">
                            <span className="uppercase hover:text-ink transition-colors duration-300 cursor-default">Chronicle</span>
                            <span className="w-[1px] h-3 bg-line"></span>
                            <span className="uppercase hover:text-tertiary transition-colors duration-300 cursor-default">Chamber</span>
                        </div>
                    </div>

                    {/* 右侧：精密仪器风格古典时钟 */}
                    {/* ✨ 替换：border-white/5 -> border-line/50, bg-white/[0.02] -> bg-card/40, hover:border-[#D4AF37]/20 -> hover:border-tertiary/30 */}
                    <div className="flex items-center gap-2 border-[0.5px] border-line/50 rounded-full px-4 py-2.5 bg-card/40 hover:border-tertiary/30 transition-all duration-500">
                        {/* ✨ 替换：text-[#A69B8D]/60 -> text-muted/80, hover:text-[#D4AF37]/60 -> hover:text-tertiary */}
                        <span className="text-[10px] tracking-[0.4em] text-muted/80 hover:text-tertiary transition-colors duration-300 font-mono font-light">
                            {formatTime(time)}
                        </span>
                    </div>
                </div>

                <div className="absolute top-2 left-5 w-full p-6 sm:p-8 z-20 flex justify-between items-center pointer-events-none">

                    {/* ✨ 替换：text-amber-500/80 -> text-tertiary */}
                    <div className="text-xl font-bold tracking-widest text-tertiary drop-shadow-sm">

                        SOMNIA

                    </div>

                </div>
                {/* ✨ 精美而克制的分割线 (HR) */}
                <div className="relative w-full h-[1px]">
                    {/* ✨ 替换：bg-[#D4AF37]/40 -> bg-tertiary/40 */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-20 h-[2px] bg-tertiary/40 blur-[2px] rounded-full"></div>
                    {/* ✨ 替换：via-white/5 -> via-line */}
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-line to-transparent"></div>
                </div>
            </div>
        </div>
    );
}