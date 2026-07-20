import {useEffect, useState} from 'react'

export function HomeHeader() {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatChronicle = () => {
        const year = currentTime.getFullYear()
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const month = months[currentTime.getMonth()]
        const day = String(currentTime.getDate()).padStart(2, '0')
        const hour = String(currentTime.getHours()).padStart(2, '0')
        const min = String(currentTime.getMinutes()).padStart(2, '0')
        const sec = String(currentTime.getSeconds()).padStart(2, '0')
        return {year, month, day, time: `${hour}:${min}:${sec}`}
    }

    const chronicle = formatChronicle()

    return (

    <header className="sticky top-0 z-50 w-full bg-bg/70
        backdrop-blur-md transition-all duration-600 border-b border-line/50
        pb-6 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4">

                {/* Main Title */}
                <div className="relative group flex flex-col items-start">
                    {/* 移除内联 style，使用 font-display 和 text-ink */}
                    <h1 className="relative z-10 text-4xl sm:text-5xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white via-ink to-muted drop-shadow-md leading-none">
                        Reverie
                        <span className="text-primary inline-block animate-pulse ml-1 drop-shadow-md">.</span>
                    </h1>
                    <div
                        className="relative z-0 flex items-center gap-2 ml-10 -mt-0.5 opacity-90 transition-transform duration-500 group-hover:translate-x-1">
                        {/* 使用 tertiary (第三强调色，替代原本写死的 gold) */}
                        <div className="w-5 h-[1px] bg-gradient-to-r from-tertiary to-transparent"></div>
                        <span
                            className="text-[9px] text-tertiary font-bold tracking-[0.4em] font-sans uppercase whitespace-nowrap drop-shadow-sm">
                                The Chronicle Chamber
                            </span>
                    </div>
                </div>

                {/* Floating Clock */}
                {/* 背景使用 card 或 bg2 */}
                <div
                    className="flex items-center gap-3 bg-gradient-to-r from-card to-bg2/80 backdrop-blur-lg border border-line px-4 py-1.5 rounded-xl shadow-lg border-r-2 border-r-tertiary/60 border-l-2 border-l-primary/40 hover:border-tertiary transition-all duration-300">
                    <div className="text-center pr-3 border-r border-line/60">
                            <span
                                className="block text-[9px] text-tertiary/90 tracking-widest font-sans font-bold leading-none">
                                CHRONICLE
                            </span>
                        <span className="text-xs font-mono font-bold text-tertiary tracking-wider mt-0.5 block">
                                {chronicle.year}
                            </span>
                    </div>
                    <div className="text-left pl-1 min-w-[75px]">
                        {/* 字体使用 font-body 或 font-display */}
                        <span className="block text-xs font-body font-medium text-ink tracking-wide leading-tight">
                                {chronicle.month} {chronicle.day}
                            </span>
                        <span className="block text-[11px] font-mono text-primary tracking-wider font-semibold mt-0.5">
                                {chronicle.time}
                            </span>
                    </div>
                </div>
            </div>

            {/* Bottom decorative line */}
            <div
                className="relative mt-5 h-[1px] w-full bg-gradient-to-r from-transparent via-tertiary/30 to-transparent">
                <div
                    className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-bg border border-tertiary/60 rotate-45 flex items-center justify-center shadow-sm">
                    <div className="w-0.5 h-0.5 bg-primary rounded-full"></div>
                </div>
            </div>
        </div>
    </header>
)
}