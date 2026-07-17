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
        <header className="w-full max-w-6xl mx-auto px-6
        flex justify-between items-center z-20 select-none
        pt-3
        ">

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
        </header>
    );
}