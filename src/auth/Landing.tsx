// src/auth/Landing.tsx
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-theme-bg0
        font-serif text-theme-ink relative overflow-hidden">

            {/* 🌟 沉浸式全屏背景 texture / gradient
                这里可以使用你在 Layout 中用的 <Background /> 组件，或者一个专门的沉浸式纹理
            */}
            {/*<div className="absolute inset-0 z-0 opacity-10">*/}
            {/*    <img src="/path/to/your/landing-background-texture.jpg"*/}
            {/*         alt="" className="w-full h-full object-cover" />*/}
            {/*</div>*/}

            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 text-center">

                {/* 🌟 大、优美的 serif 字体口号 */}
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
                    A reading life, beautifully kept.
                </h1>

                {/* 🌟 金色 / 主题色的品牌标识 */}
                <div className="text-2xl font-bold tracking-widest text-theme-primary mb-8 drop-shadow-sm">
                    SOMNIA LIBRARY
                </div>

                {/* 🌟 简洁的功能介绍 */}
                <p className="text-xl italic text-theme-ink/80 max-w-2xl mb-12 leading-relaxed">
                    Organize your collection, track your journey, and dress your whole library in a look that fits what you love.
                </p>

                {/* 🌟 突出的“进入图书馆”/“开始使用”按钮
                    这个按钮链接到 /auth (登录页)
                */}
                <Link
                    to="/auth"
                    className="p-5 px-10 text-xl bg-amber-600/90 hover:bg-amber-500 text-white font-sans font-medium rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] transform hover:-translate-y-0.5"
                >
                    Enter the Library
                </Link>
            </main>

            {/* 可选：一个极简的页脚 */}
            <footer className="w-full text-center p-6 text-sm text-theme-ink/60 z-10">
                © 2026 Somnia . Made for readers.
            </footer>
        </div>


    );
}