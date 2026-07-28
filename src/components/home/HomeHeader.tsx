// src/components/home/HomeHeader.tsx
import FloatingClock from "./FloatingClock";
import { UserGreeting } from "./UserGreeting.tsx";
import { UserAvatar } from "./UserAvatar.tsx";
import { HeaderReadingStats } from "./HeaderReadingStats.tsx";

export function HomeHeader() {

    return (
        <header className="w-full mx-auto transition-all duration-600">
            <div className="bg-card/70 backdrop-blur-md border border-line/50 rounded-[20px] sm:rounded-[24px] shadow-xl shadow-black/5 py-3.5 sm:py-4 px-4 sm:px-8 transition-all duration-500 hover:border-tertiary/30 hover:shadow-2xl">
                <div className="relative group flex flex-col items-start w-full">
                    {/* Row 1: 左侧（头像 + 问候语） | 右侧（Clock） */}
                    <div className="flex items-center justify-between w-full gap-2">
                        {/* 左侧：头像 + 问候语 */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <UserAvatar />
                            <UserGreeting />
                        </div>

                        {/* 右侧：Floating Clock */}
                        <FloatingClock />
                    </div>

                    {/* Row 2: 左侧（大标题 + 嵌入式印章副标题） | 右侧（Reading Stats） */}
                    <div className="flex flex-wrap items-center justify-between w-full gap-3 mt-0.5">
                        {/* 左侧：主标题 + 附带的诗意副标题 */}
                        <div className="flex flex-col items-start">
                            <h1 className="relative z-10 text-xl sm:text-3xl md:text-4xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-white via-ink to-muted drop-shadow-md leading-none">
                                Somnia Library
                                <span className="text-primary inline-block animate-pulse ml-0.5 drop-shadow-md">.</span>
                            </h1>

                            {/* 把 Chronicle Chamber 做成精致的附注标记，不单独占一行 */}
                            <div className="flex items-center gap-1.5 mt-1.5 opacity-80 transition-transform duration-500 group-hover:translate-x-1">
                                <div className="w-2.5 sm:w-4 h-[1px] bg-secondary/60"></div>
                                <span className="text-[8px] sm:text-[10px] text-secondary font-bold tracking-[0.25em] font-[family-name:var(--font-decorative)] uppercase whitespace-nowrap">
                                    The Chronicle Chamber
                                </span>
                            </div>
                        </div>

                        {/* 右侧：Reading Stats 数据组件 */}
                        <div className="shrink-0 self-center">
                            <HeaderReadingStats />
                        </div>
                    </div>

                </div>

                {/* Bottom decorative line */}
                <div className="absolute bottom-0 mt-3.5 sm:mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-tertiary/30 to-transparent">
                    <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-bg border border-tertiary/60 rotate-45 flex items-center justify-center shadow-sm">
                        <div className="w-0.5 h-0.5 bg-primary rounded-full"></div>
                    </div>
                </div>
            </div>
        </header>
    );
}