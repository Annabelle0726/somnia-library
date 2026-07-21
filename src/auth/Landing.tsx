// src/auth/Landing.tsx
import { LandingHeader } from '../components/landings/LandingHeader.tsx';
import { LandingActionButtons } from '../components/landings/LandingActionButtons';
import landingPreviewImg from '../assets/landing-preview.png';

export default function Landing() {
    return (
        /* 1. 主容器：使用主题定义的 bg-bg 与 font-body，移除内联 style 注入 */
        <div className="min-h-screen flex flex-col bg-bg font-body
         selection:bg-tertiary/30
         relative overflow-hidden text-ink">

            {/* 🌟 1. 干净深邃的底色背景 */ }
            <div className="absolute inset-0 bg-bg z-0" />

            {/* 🌟 2. 左上方的暖色光源（动态绑定主题强调色 Tertiary/Gold） */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-tertiary/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0" />

            {/* 🌟 3. 右上方的冷色/紫蓝暗角（绑定主题 Plum/Primary 色调） */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-plum/20 rounded-full blur-[100px] mix-blend-multiply pointer-events-none z-0" />

            {/* 🌟 4. 底部极深的渐变遮罩 */}
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-bg to-transparent pointer-events-none z-0" />

            {/* 🌟 1. 顶部动态装饰栏组件 */}
            <LandingHeader />


            {/* 🌟 3. 双列主体布局：改成 flex-row 并由它自己 flex-wrap 自动换行 */}
            <main className="flex-1 flex md:flex-row items-center justify-between
            gap-12 max-w-6xl mx-auto w-full px-6 sm:px-12 z-10 pb-12">
            {/* 左侧：文本与按钮区域 (必须用 flex-1 占据左侧) */}
                <div className="flex-1 flex flex-col items-start text-left w-full max-w-xl space-y-6 mt-4 md:mt-0">
                    {/* 魔法感衬线体标题：换用 font-decorative，渐变绑定 Tertiary 色彩 */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-decorative font-bold text-ink leading-[1.15] tracking-wide drop-shadow-sm">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary via-ink to-primary drop-shadow-[0_0_20px_color-mix(in_srgb,var(--color-tertiary)_30%,transparent)]">
                            Welcome to Sanctuary
                        </span>
                    </h1>

                    {/* 小副标题：换用 font-serif-fancy，柔和优雅 */}
                    <p className="text-base md:text-lg text-muted font-serif-fancy font-light leading-relaxed tracking-wide max-w-md">
                        A quiet corner for the stories that shape you.
                    </p>

                    {/* 引语：使用主题 border-tertiary/50 搭配柔和内边框 */}
                    <p className="text-sm md:text-base text-muted/80 font-serif-fancy italic max-w-lg leading-relaxed border-l-2 border-tertiary/50 pl-4 py-0.5">
                        "Somnia organizes everything you’ve read, everything you mean to, and dresses your whole collection in a look that fits what you love."
                    </p>

                    {/* 🌟 双功能按钮组件 */}
                    <div className="pt-2 w-full sm:w-auto">
                        <LandingActionButtons />
                    </div>

                </div>

                {/* 🔥 右侧：3D 玻璃质感图片展示区 */}
                <div className="w-full flex justify-center md:justify-end relative mt-8 md:mt-0">

                    {/* 外层容器：悬浮阴影 */}
                    <div className="group relative w-[95%] rounded-[24px] shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:scale-[1.02]">

                        {/* 图片和卡片主容器 */}
                        <div className="relative rounded-[24px] overflow-hidden bg-card border border-line">

                            <img
                                src={landingPreviewImg}
                                alt="Somnia Match Preview"
                                className="w-full h-auto block opacity-95 group-hover:opacity-100 transition-opacity duration-500"
                            />

                            {/* 🌟 1. 极窄边缘高光线 */}
                            <div className="absolute inset-0 rounded-[24px] pointer-events-none border-[0.5px] border-ink/10 z-10" />

                            {/* 🌟 2. 玻璃高光反光层 */}
                            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-ink/10 via-transparent to-transparent pointer-events-none z-20 mix-blend-overlay group-hover:from-ink/20 transition-all duration-700" />

                            {/* 🌟 3. 底部内阴影 */}
                            <div className="absolute inset-0 rounded-[24px] shadow-[inset_0_-40px_60px_-30px_rgba(0,0,0,0.4)] pointer-events-none z-20" />

                        </div>
                    </div>
                </div>

            </main>

            {/* 🌟 5. 极简统一页脚 */}
            <footer className="relative z-10 w-full text-center p-8 text-[10px] font-mono tracking-[0.2em] text-muted/50 select-none border-t border-line/50">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                    <span className="hover:text-tertiary transition-colors duration-500">
                        © 2026 SOMNIA. ALL RIGHTS RESERVED.
                    </span>
                    <span className="hidden sm:inline opacity-30">|</span>
                    <span className="hover:text-tertiary transition-colors duration-500 cursor-help">
                        MADE FOR READERS.
                    </span>
                </div>
            </footer>
        </div>
    );
}