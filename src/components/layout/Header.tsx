import {useEffect, useState} from 'react'

export function Header() {
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
        <header className="top-0 z-50 w-full bg-nocturne-bg0/70
        backdrop-blur-md transition-all border-b border-nocturne-line/50
        pb-6 px-6 sm:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                    {/* Main Title */}
                    <div className="relative group flex flex-col items-start">
                        <h1 style={{fontFamily: '"Fraunces", serif', color: '#f6e9f1'}}
                            className="relative z-10 text-4xl sm:text-5xl font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white via-nocturne-ink to-nocturne-muted drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] leading-none">
                            Reverie
                            <span
                                className="text-nocturne-primary inline-block animate-pulse ml-1 drop-shadow-[0_0_12px_rgba(232,58,120,0.9)]">.</span>
                        </h1>
                        <div
                            className="relative z-0 flex items-center gap-2 ml-10 -mt-0.5 opacity-90 transition-transform duration-500 group-hover:translate-x-1">
                            <div className="w-5 h-[1px] bg-gradient-to-r from-nocturne-gold/80 to-transparent"></div>
                            <span
                                className="text-[9px] text-nocturne-gold font-bold tracking-[0.4em] font-sans uppercase whitespace-nowrap drop-shadow-md">
                                The Chronicle Chamber
                            </span>
                        </div>
                    </div>

                    {/* Floating Clock */}
                    <div
                        className="flex items-center gap-3 bg-gradient-to-r from-nocturne-panel to-nocturne-bg1/80 backdrop-blur-lg border border-nocturne-line px-4 py-1.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-r-2 border-r-nocturne-gold/60 border-l-2 border-l-nocturne-primary/40 hover:border-nocturne-gold transition-all duration-300">
                        <div className="text-center pr-3 border-r border-nocturne-line/60">
                            <span
                                className="block text-[9px] text-nocturne-gold/90 tracking-widest font-sans font-bold leading-none">CHRONICLE</span>
                            <span
                                className="text-xs font-mono font-bold text-nocturne-gold tracking-wider mt-0.5 block">{chronicle.year}</span>
                        </div>
                        <div className="text-left pl-1 min-w-[75px]">
                            <span
                                className="block text-xs font-serif font-medium text-nocturne-ink tracking-wide leading-tight">
                                {chronicle.month} {chronicle.day}
                            </span>
                            <span
                                className="block text-[11px] font-mono text-nocturne-primary tracking-wider font-semibold mt-0.5">
                                {chronicle.time}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className="relative mt-5 h-[1px] w-full bg-gradient-to-r from-transparent via-nocturne-gold/30 to-transparent">
                    <div
                        className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-nocturne-bg0 border border-nocturne-gold/60 rotate-45 flex items-center justify-center shadow-sm">
                        <div className="w-0.5 h-0.5 bg-nocturne-primary rounded-full"></div>
                    </div>
                </div>
            </div>
        </header>
    )
}