import { useState, useEffect } from 'react';

export function LandingHeader() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 优化时间显示：只保留 时:分:秒，看起来更符合精密仪器的刻度感
    const formatTime = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto px-6 pt-2 pb-4 flex
        flex-col gap-4 z-20 select-none">

            {/* 顶部行：导航与时钟 */}
            <div className="w-full flex justify-between items-center">

                {/* 左侧：精密铭牌风格区域标识 */}
                <div className="flex items-center gap-4 border-[0.5px] border-white/10 rounded-full px-5 py-2.5 bg-white/[0.02] backdrop-blur-sm hover:border-[#D4AF37]/30 hover:bg-white/[0.04] transition-all duration-500 ease-in-out">

                    {/* 微弱的黄铜指示灯 */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                    </span>

                    {/* 文字与精密分隔线 */}
                    <div className="flex items-center gap-4 font-light tracking-[0.3em] text-[11px] text-[#A69B8D]">
                        <span className="uppercase hover:text-white transition-colors duration-300 cursor-default">Chronicle</span>

                        {/* 垂直细分隔线 */}
                        <span className="w-[1px] h-3 bg-white/10"></span>

                        <span className="uppercase hover:text-[#D4AF37] transition-colors duration-300 cursor-default">Chamber</span>
                    </div>
                </div>

                {/* 右侧：精密仪器风格古典时钟 */}
                <div className="flex items-center gap-2 border-[0.5px] border-white/5 rounded-full px-4 py-2.5 bg-white/[0.02] hover:border-[#D4AF37]/20 transition-all duration-500">
                    <span className="text-[10px] tracking-[0.4em] text-[#A69B8D]/60 hover:text-[#D4AF37]/60 transition-colors duration-300 font-mono font-light">
                        {formatTime(time)}
                    </span>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-full p-6 sm:p-8 z-20 flex justify-between items-center pointer-events-none">
                <div className="text-xl font-bold tracking-widest text-amber-500/80 drop-shadow-sm">
                    SOMNIA
                </div>
            </div>

            {/* ✨ 精美而克制的分割线 (HR) */}
            <div className="relative w-full h-[1px]">
                {/* 1. 中央微弱的琥珀色发光点 */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-20 h-[2px] bg-[#D4AF37]/40 blur-[2px] rounded-full"></div>

                {/* 2. 微微渐变过渡的边缘拉丝线 */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            </div>
        </div>

    );
}