// src/auth/Landing.tsx
import { LandingHeader } from '../components/landings/LandingHeader.tsx';
import { LandingActionButtons } from '../components/landings/LandingActionButtons';
import landingPreviewImg from '../assets/landing-preview.png';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0e0a14] selection:bg-[#D4AF37]/30 relative overflow-hidden">
            {/* 注入全新字体：Cinzel（魔法感衬线体）和 Inter（现代无衬线体，增加干净舒适感） */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');
                .font-magic-serif { font-family: 'Cinzel', serif; }
                .font-clean-sans { font-family: 'Inter', sans-serif; }
            `}</style>

            {/* 🌟 1. 干净深邃的底色 */}
            <div className="absolute inset-0 bg-[#0e0a14] z-0"></div>

            {/* 🌟 2. 左上方的暖色光源（模拟屏幕外打进来的灯光） */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#C49B53]/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0"></div>

            {/* 🌟 3. 右上方的冷色/紫蓝暗角（增加深邃感，对比出高级） */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-[#2C1A4D]/30 rounded-full blur-[100px] mix-blend-multiply pointer-events-none z-0"></div>

            {/* 🌟 4. 底部极深的阴影（让文字和图片完全扎根） */}
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0"></div>

            {/* 🌟 1. 顶部动态装饰栏组件（保留你的原本组件） */}
            <div className="relative z-10">
                <LandingHeader />
            </div>

            {/* 🌟 2. 调整后的双列布局 */}
            <main className="flex-1 flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto w-full px-6 sm:px-12 z-10 pb-12 pt-8">

                {/* 左侧：文本与按钮区域 (缩小字号, 收紧密距) */}
                <div className="flex-1 flex flex-col items-start text-left w-full max-w-xl space-y-4">

                    {/* 魔法感衬线体标题 (调亮、加粗) */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-magic-serif font-bold text-[#F8F5F0] leading-[1.1] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E8DE] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                            Welcome to Sanctuary
                        </span>
                    </h1>

                    {/* 小副标题 (调整为衬线体) */}
                    <p className="text-base md:text-lg text-gray-300/90 font-serif font-light leading-relaxed tracking-wide max-w-md pb-1">
                        A quiet corner for the stories that shape you.
                    </p>

                    {/* 引语 (调整为衬线体，字距收紧) */}
                    <p className="text-sm md:text-base text-gray-400/80 font-serif font-light max-w-lg leading-relaxed border-l border-[#D4AF37]/50 pl-3">
                        "Somnia organizes everything you’ve read, everything you mean to, and dresses your whole collection in a look that fits what you love."
                    </p>

                    {/* 🌟 4. 双功能按钮组件（原样保留） */}
                    <div className="pt-2">
                        <LandingActionButtons />
                    </div>

                </div>


                {/* 🔥 参考图风格：右侧 3D 玻璃质感图片展示区 */}
                <div className="w-full flex justify-center md:justify-end relative mt-8 md:mt-0">

                    {/* 外层容器：提供深邃悬浮阴影及 Hover 浮动效果 */}
                    <div className="relative w-[95%] rounded-[24px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,1)] group-hover:translate-y-[-4px] group-hover:scale-[1.02]">

                        {/* 图片和卡片主容器 */}
                        <div className="relative rounded-[24px] overflow-hidden bg-[#160f24]">

                            <img
                                src={landingPreviewImg}
                                alt="Somnia Match Preview"
                                className="w-full h-auto block border border-white/5"
                            />

                            {/* 🌟 1. 极窄边缘高光线（产生 3D 轮廓切割感） */}
                            <div className="absolute inset-0 rounded-[24px] pointer-events-none border-[0.5px] border-white/10 z-10"></div>

                            {/* 🌟 2. 左上角方向光源的玻璃高光层（核心 3D 质感） */}
                            {/* 类似 Mac 屏幕玻璃的反光，左上角亮，右下角淡出 */}
                            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none z-20 mix-blend-overlay group-hover:from-white/25 transition-all duration-700"></div>

                            {/* 🌟 3. 底部轻微内阴影（让卡片看起来有厚度） */}
                            <div className="absolute inset-0 rounded-[24px] shadow-[inset_0_-40px_60px_-30px_rgba(0,0,0,0.5)] pointer-events-none z-20"></div>

                        </div>
                    </div>
                </div>

            </main>
            {/* 🌟 5. 极简统一页脚 */}
            <footer className="relative z-10 w-full text-center p-8 text-[10px] font-clean-sans tracking-[0.2em] text-gray-500/40 select-none border-t border-white/5">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                    <span className="hover:text-[#D4AF37]/60 transition-colors duration-500">© 2026 SOMNIA. ALL RIGHTS RESERVED.</span>
                    <span className="hidden sm:inline opacity-20">|</span>
                    <span className="hover:text-[#D4AF37]/60 transition-colors duration-500 cursor-help">MADE FOR READERS.</span>
                </div>
            </footer>
        </div>
    );
}