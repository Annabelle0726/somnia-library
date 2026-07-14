// src/auth/Landing.tsx
import { LandingHeader } from '../components/landings/LandingHeader.tsx';
import { LandingActionButtons } from '../components/landings/LandingActionButtons';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-theme-bg0 font-serif text-theme-ink relative overflow-hidden selection:bg-theme-primary/20">

            {/* 🌟 沉浸式环境背景光晕 */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-theme-primary/5 rounded-full blur-[140px] opacity-70"></div>
            </div>

            {/* 🌟 1. 顶部动态装饰栏组件 */}
            <LandingHeader />

            {/* 🌟 2. 具有开阔呼吸感的主体内容 */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 text-center max-w-4xl mx-auto my-auto">

                {/* 顶置文学小字 */}
                <div className="text-[10px] font-mono tracking-[0.4em] uppercase text-theme-primary/50 mb-8 drop-shadow-[0_0_8px_rgba(var(--theme-primary-rgb),0.15)] select-none">
                    Welcome to the Sanctuary
                </div>

                {/* 大标题：优雅衬线字 */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-4 leading-[1.2] text-theme-ink max-w-3xl">
                    A reading life, <span className="italic font-normal font-serif text-theme-primary/90">beautifully kept.</span>
                </h1>

                {/* 古典印刷风格的分割线 */}
                <div className="flex items-center justify-center gap-5 my-10 w-full max-w-xs opacity-40 select-none">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-theme-line/40 to-theme-primary/20"></div>
                    <span className="text-theme-primary/70 text-xs tracking-widest transform rotate-45 scale-75">♦</span>
                    <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-theme-line/40 to-theme-primary/20"></div>
                </div>

                {/* 诗意主叙述（字色调弱，突出中轴线的空灵感） */}
                <p className="text-base md:text-lg italic text-theme-ink/50 max-w-2xl mb-12 leading-relaxed px-4 font-normal">
                    "Somnia organizes everything you’ve read, everything you mean to, and dresses your whole collection in a look that fits what you love."
                </p>

                {/* 🌟 3. 双功能按钮组件 */}
                <LandingActionButtons />
            </main>

            {/* 🌟 4. 极简页脚 */}
            <footer className="w-full text-center p-6 text-[10px] font-mono tracking-[0.20em] text-theme-ink/30 z-10 select-none">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
                    <span>© 2026 SOMNIA. ALL RIGHTS RESERVED.</span>
                    <span className="hidden sm:inline opacity-30">|</span>
                    <span className="hover:text-theme-primary/60 transition-colors duration-300 cursor-help">MADE FOR READERS.</span>
                </div>
            </footer>
        </div>
    );
}