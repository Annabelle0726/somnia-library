// src/components/home/HomeHeader.tsx
import {useEffect, useState} from 'react'
import {UserGreeting} from "./UserGreeting.tsx";
import {UserAvatar} from "./UserAvatar.tsx"; // 1. 引入刚刚写的头像组件

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
        <header className="sticky top-3 z-50 w-full mx-auto transition-all duration-600">
            <div
                className="bg-card/70 backdrop-blur-md border border-line/50 rounded-[24px] shadow-xl shadow-black/5 pb-5 pt-5 px-6 sm:px-10 transition-all duration-500 hover:border-tertiary/30 hover:shadow-2xl">
                <div className="relative group flex flex-col items-start gap-1 w-full">
                    {/* Row 1: 左侧（头像 + 问候语） | 右侧（Floating Clock） */}
                    <div className="flex items-center justify-between w-full gap-2">
                        {/* 左侧：头像 + 问候语 */}
                        <div className="flex items-center gap-2">
                            <UserAvatar />
                            <UserGreeting />
                        </div>

                        {/* 右侧：Floating Clock (已移至第一行最右侧) */}
                        <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-card to-bg2/80 backdrop-blur-lg border border-line px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl shadow-lg border-r-2 border-r-tertiary/60 border-l-2 border-l-primary/40 hover:border-tertiary transition-all duration-300 shrink-0">
                            {/* 年月日：小屏隐藏，大屏显示 */}
                            <div className="hidden sm:block text-center pr-3 border-r border-line/60">
                <span className="text-[11px] font-[family-name:var(--font-body)] font-bold text-tertiary tracking-wider mt-0.5 block">
                    {chronicle.year}
                </span>
                            </div>

                            <div className="text-left sm:pl-1 min-w-max sm:min-w-[75px]">
                                {/* 月日：小屏隐藏，大屏显示 */}
                                <span className="hidden sm:block text-[11px] font-medium text-ink font-[family-name:var(--font-body)] tracking-wide leading-tight">
                    {chronicle.month} {chronicle.day}
                </span>
                                {/* 时间：始终显示 */}
                                <span className="block text-[10px] sm:text-[11px] font-[family-name:var(--font-body)] text-primary tracking-wider font-semibold sm:mt-0.5">
                    {chronicle.time}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: 大标题 */}
                    <h1 className="relative z-10 text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white via-ink to-muted drop-shadow-md leading-tight mt-1">
                        Somnia Library
                        <span className="text-primary inline-block animate-pulse ml-1 drop-shadow-md">.</span>
                    </h1>

                    {/* Row 3: 副标题 */}
                    <div className="relative z-0 flex items-center gap-2 ml-4 sm:ml-10 -mt-0.5 opacity-90 transition-transform duration-500 group-hover:translate-x-1">
                        <div className="w-3 sm:w-5 h-[1px] bg-gradient-to-r from-tertiary to-transparent"></div>
                        <span className="text-[10px] sm:text-[13px] text-tertiary font-bold tracking-[0.25em] sm:tracking-[0.4em] font-[family-name:var(--font-decorative)] uppercase whitespace-nowrap drop-shadow-sm">
            The Chronicle Chamber
        </span>
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