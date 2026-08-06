// src/auth/Landing.tsx
import { LandingHeader } from '../components/landings/LandingHeader.tsx';
import { LandingActionButtons } from '../components/landings/LandingActionButtons';
import landingPreviewImg from '../assets/landing-preview.png';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-bg font-body selection:bg-tertiary/30 relative text-ink overflow-x-hidden">

            {/* --- 1. 沉浸式环境光影层 --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-bg" />
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-tertiary/15 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-plum/20 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-bg to-transparent opacity-60" />
            </div>

            {/* --- 2. 导航与头部 --- */}
            <LandingHeader />

            {/* --- 3. 首屏 Hero Section --- */}
            <main className="relative flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto w-full px-6 sm:px-12 z-10 min-h-[80vh] pt-8 pb-16">

                {/* 左侧文案 */}
                <div className="flex-1 flex flex-col items-start text-left w-full max-w-xl space-y-6">
                    {/* 增加信任感徽章 */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono tracking-widest">
                        ✦ 1,200+ Readers &nbsp;·&nbsp; Join the Sanctuary
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-decorative font-bold text-ink leading-[1.05] tracking-wide drop-shadow-sm">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary via-ink to-primary drop-shadow-[0_0_20px_color-mix(in_srgb,var(--color-tertiary)_30%,transparent)]">
                            Welcome to<br/>Sanctuary
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted font-serif-fancy font-light leading-relaxed tracking-wide max-w-md">
                        A quiet corner for the stories that shape you.
                    </p>

                    <p className="text-sm text-muted/80 font-serif-fancy italic max-w-lg leading-relaxed border-l-2 border-tertiary/50 pl-4 py-0.5">
                        "Somnia organizes everything you’ve read, everything you mean to, and dresses your whole collection in a look that fits what you love."
                    </p>

                    <div className="pt-2 w-full sm:w-auto">
                        <LandingActionButtons />
                    </div>
                </div>

                {/* 右侧悬浮图 */}
                <div className="w-full flex-1 flex justify-center md:justify-end relative mt-8 md:mt-0">
                    <div className="group relative w-full max-w-lg rounded-[32px] shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-4 hover:scale-[1.02]">
                        <div className="absolute inset-0 -z-10 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 rounded-full" />

                        <div className="relative rounded-[32px] overflow-hidden bg-card border border-line/60">
                            <img
                                src={landingPreviewImg}
                                alt="Somnia App Preview"
                                className="w-full h-auto block opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 rounded-[32px] pointer-events-none border-[0.5px] border-white/10 z-10" />
                            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-20 mix-blend-overlay group-hover:from-white/25 transition-all duration-700" />
                            <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_-40px_60px_-30px_rgba(0,0,0,0.6)] pointer-events-none z-20" />
                        </div>
                    </div>
                </div>
            </main>

            {/* --- 4. 华丽升级版 Bento Grid --- */}
            <section className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-12 py-12 space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-4xl font-decorative font-bold text-ink">Everything a reader needs.</h2>
                    <p className="text-muted font-serif-fancy text-lg">Hover over a card to reveal its power.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">

                    {/* 1. Match & Discover */}
                    <div className="md:col-span-2 relative group overflow-hidden rounded-[32px] bg-card/60 border border-line/50 hover:border-tertiary/60 transition-all duration-500 backdrop-blur-lg p-8 flex flex-col justify-end shadow-xl cursor-default">
                        <div className="absolute top-8 right-10 w-24 h-32 bg-bg border border-tertiary/20 rounded-xl transform rotate-12 group-hover:rotate-6 group-hover:translate-x-4 group-hover:-translate-y-3 transition-all duration-700 delay-100 shadow-md flex items-center justify-center z-10">
                            <span className="text-3xl text-tertiary drop-shadow-[0_0_10px_rgba(var(--color-tertiary),0.6)]">✨</span>
                        </div>
                        <div className="absolute top-12 right-14 w-24 h-32 bg-card-2/80 border border-line/30 rounded-xl transform -rotate-6 group-hover:-rotate-12 group-hover:-translate-x-8 group-hover:translate-y-2 transition-all duration-700 delay-200 shadow-xl opacity-40 group-hover:opacity-100"></div>

                        <div className="relative z-20 w-full md:w-3/4 space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🔮</div>
                                <span className="text-xs font-mono text-tertiary tracking-widest">MATCH & DISCOVER</span>
                            </div>
                            <h3 className="text-2xl font-bold font-display text-ink">Match & Discover</h3>

                            <div className="grid grid-rows-[1fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                <div className="overflow-hidden">
                                    <p className="text-muted text-sm leading-relaxed">
                                        <span className="block group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500 absolute">Uncover your next destiny through personalized vibes.</span>
                                        <span className="block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 pt-6">
                                            Swipe through tailored recommendations. Let our algorithm find your next 5-star obsession based on the hyper-specific tropes and vibes you actually love.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-tertiary/0 via-tertiary/5 to-tertiary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>

                    {/* 2. Deep Stats */}
                    <div className="md:col-span-1 relative group overflow-hidden rounded-[32px] bg-card/60 border border-line/50 hover:border-primary/60 transition-all duration-500 backdrop-blur-lg p-8 flex flex-col justify-end shadow-xl cursor-default">
                        <div className="absolute top-10 right-8 flex items-end gap-2 h-24 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="w-5 bg-primary/30 rounded-t-md h-1/4 group-hover:h-1/2 transition-all duration-700 delay-75"></div>
                            <div className="w-5 bg-primary/50 rounded-t-md h-1/2 group-hover:h-full transition-all duration-700 delay-150"></div>
                            <div className="w-5 bg-primary rounded-t-md h-1/3 group-hover:h-3/4 transition-all duration-700 delay-225"></div>
                            <div className="w-5 bg-secondary/80 rounded-t-md h-1/5 group-hover:h-5/6 transition-all duration-700 delay-300"></div>
                        </div>

                        <div className="relative z-20 space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl group-hover:-translate-y-1 transition-transform duration-500">📈</div>
                                <span className="text-xs font-mono text-primary tracking-widest">DEEP STATS</span>
                            </div>
                            <h3 className="text-xl font-bold font-display text-ink">Deep Stats</h3>

                            <div className="grid grid-rows-[1fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                <div className="overflow-hidden">
                                    <p className="text-muted text-sm leading-relaxed">
                                        <span className="block group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500 absolute">Visualize your reading journey in style.</span>
                                        <span className="block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 pt-6">
                                            Pages read, genres explored, and reading velocity—beautifully charted to track your literary habits.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tl from-primary/0 via-primary/5 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>

                    {/* 3. Themes & Tropes */}
                    <div className="md:col-span-1 relative group overflow-hidden rounded-[32px] bg-card/60 border border-line/50 hover:border-plum/60 transition-all duration-500 backdrop-blur-lg p-8 flex flex-col justify-end shadow-xl cursor-default">
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-plum/20 group-hover:bg-tertiary/30 transition-colors duration-1000"></div>
                        <div className="absolute top-8 right-6 flex flex-wrap gap-2 max-w-[140px] justify-end opacity-60 group-hover:opacity-100 transition-all duration-700">
                            <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[8px] uppercase tracking-wider rounded-full border border-tertiary/20 group-hover:scale-110 transition-transform">#EnemiesToLovers</span>
                            <span className="px-2 py-0.5 bg-plum/10 text-plum text-[8px] uppercase tracking-wider rounded-full border border-plum/20 group-hover:scale-110 delay-75 transition-transform">#SlowBurn</span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] uppercase tracking-wider rounded-full border border-primary/20 group-hover:scale-110 delay-150 transition-transform">#FaeMagic</span>
                        </div>

                        <div className="relative z-20 space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-plum/10 flex items-center justify-center text-xl group-hover:-translate-y-1 transition-transform duration-500">🎨</div>
                                <span className="text-xs font-mono text-plum tracking-widest">THEMES & TROPES</span>
                            </div>
                            <h3 className="text-xl font-bold font-display text-ink">Themes & Tropes</h3>

                            <div className="grid grid-rows-[1fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                <div className="overflow-hidden">
                                    <p className="text-muted text-sm leading-relaxed">
                                        <span className="block group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500 absolute">Curate your shelves by hyper-specific tags.</span>
                                        <span className="block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 pt-6">
                                            Organize by niche tags, and change the app's entire colorway to match your aesthetic mood.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-bl from-plum/0 via-plum/5 to-plum/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>

                    {/* 4. Planner & Shelves */}
                    <div className="md:col-span-2 relative group overflow-hidden rounded-[32px] bg-card/60 border border-line/50 hover:border-emerald-500/60 transition-all duration-500 backdrop-blur-lg p-8 flex flex-col justify-end shadow-xl cursor-default">
                        <div className="absolute top-10 right-12 grid grid-cols-3 gap-2 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className={`w-6 h-6 rounded-md border transition-all duration-500 delay-${i * 75} ${
                                    i === 4 || i === 7 || i === 2
                                        ? 'bg-emerald-500/30 border-emerald-500/50 group-hover:bg-emerald-500/50 group-hover:scale-110'
                                        : 'bg-bg/40 border-line/50 group-hover:border-line'
                                }`}></div>
                            ))}
                        </div>

                        <div className="relative z-20 w-full md:w-3/4 space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">🗓️</div>
                                <span className="text-xs font-mono text-emerald-500 tracking-widest">PLANNER & SHELVES</span>
                            </div>
                            <h3 className="text-2xl font-bold font-display text-ink">Planner & Shelves</h3>

                            <div className="grid grid-rows-[1fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                <div className="overflow-hidden">
                                    <p className="text-muted text-sm leading-relaxed">
                                        <span className="block group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500 absolute">Drag & drop your TBR onto a beautiful calendar.</span>
                                        <span className="block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 pt-6">
                                            Drag and drop your TBR pile onto a beautiful calendar. Create custom digital shelves to organize everything you've hoarded.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>

                    {/* 5. Clubs & Community */}
                    <div className="md:col-span-2 relative group overflow-hidden rounded-[32px] bg-card/60 border border-line/50 hover:border-secondary/60 transition-all duration-500 backdrop-blur-lg p-8 flex flex-col justify-end shadow-xl cursor-default">
                        <div className="absolute top-8 right-8 flex -space-x-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-700">
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-ink">👤</div>
                            <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-xs font-bold text-ink">👥</div>
                            <div className="w-10 h-10 rounded-full bg-tertiary/20 border border-tertiary/40 flex items-center justify-center text-xs font-bold text-ink">🌟</div>
                        </div>

                        <div className="relative z-20 w-full md:w-3/4 space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-xl group-hover:translate-y-1 transition-transform duration-500">💬</div>
                                <span className="text-xs font-mono text-secondary tracking-widest">CLUBS & COMMUNITY</span>
                            </div>
                            <h3 className="text-2xl font-bold font-display text-ink">Clubs & Community</h3>

                            <div className="grid grid-rows-[1fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                <div className="overflow-hidden">
                                    <p className="text-muted text-sm leading-relaxed">
                                        <span className="block group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500 absolute">Your reading community awaits.</span>
                                        <span className="block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 pt-6">
                                            Join book clubs, track your friends' reading progress, and fall in love with the same stories together.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/0 via-secondary/5 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>

                    {/* 6. Settings & Profile */}
                    <div className="md:col-span-1 relative group overflow-hidden rounded-[32px] bg-card/60 border border-line/50 hover:border-muted/80 transition-all duration-500 backdrop-blur-lg p-8 flex flex-col justify-end shadow-xl cursor-default">
                        <div className="absolute top-8 right-8 w-16 h-16 rounded-full border-2 border-muted/20 group-hover:border-muted/60 border-dashed animate-spin-slow transition-colors duration-700"></div>

                        <div className="relative z-20 space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-muted/10 flex items-center justify-center text-xl group-hover:rotate-90 transition-transform duration-700">⚙️</div>
                                <span className="text-xs font-mono text-muted tracking-widest">SETTINGS</span>
                            </div>
                            <h3 className="text-xl font-bold font-display text-ink">Settings & Profile</h3>

                            <div className="grid grid-rows-[1fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                <div className="overflow-hidden">
                                    <p className="text-muted text-sm leading-relaxed">
                                        <span className="block group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500 absolute">Manage your entire reading sanctuary.</span>
                                        <span className="block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 pt-6">
                                            From your reading profile to every minute detail of the app—tailor everything to your perfect aesthetic.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-bl from-muted/0 via-muted/5 to-muted/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>
                </div>
            </section>
            {/* --- 5. 底部注册引导 (优化布局，解决视觉过大) --- */}
            <section className="relative z-10 w-full px-6 py-16 mt-8 border-t border-line/30 bg-gradient-to-b from-transparent to-card/30 overflow-hidden group">

                {/* 📜 装饰层 1：两侧幻影古籍书脊 */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-56 h-80 border-2 border-line/10 rounded-r-3xl bg-card/20 blur-sm pointer-events-none transition-transform duration-1000 group-hover:scale-105"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-56 h-80 border-2 border-line/10 rounded-l-3xl bg-card/20 blur-sm pointer-events-none transition-transform duration-1000 group-hover:scale-105"></div>

                {/* ✨ 装饰层 2：神秘的魔法光环 (配合缩减尺寸) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-[1px] border-tertiary/10 blur-[2px] animate-[spin_30s_linear_infinite] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border-[1px] border-primary/5 blur-[2px] animate-[spin_40s_linear_infinite_reverse] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

                {/* 🪶 装饰层 3：微光聚光灯 (缩小范围，避免背景发灰) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-tertiary/10 rounded-full blur-[60px] pointer-events-none transition-all duration-1000 group-hover:scale-150 group-hover:opacity-80 opacity-40" />

                {/* 核心内容区：缩小上下间距，让层级紧凑 */}
                <div className="max-w-3xl mx-auto text-center space-y-6 relative z-20">

                    {/* 顶部仪式感引入线 */}
                    <div className="flex items-center justify-center gap-4 opacity-80 select-none">
                        <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-tertiary/60"></span>
                        <span className="text-tertiary text-[10px] font-mono tracking-[0.4em] uppercase font-bold">
                            Your Next Chapter
                        </span>
                        <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-tertiary/60"></span>
                    </div>

                    {/* 标题与副标题组合 */}
                    <div className="flex flex-col items-center justify-center space-y-3 w-full">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-decorative font-bold text-ink drop-shadow-sm">
                            Ready to build your library?
                        </h2>
                        <p className="text-muted font-serif-fancy text-lg md:text-xl w-full whitespace-nowrap leading-relaxed">
                            Join Somnia today. Your digital reading sanctuary awaits.
                        </p>
                    </div>

                    {/* 按钮保持原有位置，周边预留了合理的呼吸感 */}
                    <div className="flex justify-center pt-2 relative z-30">
                        <LandingActionButtons />
                    </div>

                    {/* 底部的特性/信任标签 */}
                    <div className="pt-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[10px] md:text-xs font-mono text-muted/50 uppercase tracking-widest select-none">
                        <span className="flex items-center gap-2">
                            <span className="text-tertiary text-sm">✦</span> Free for readers
                        </span>
                        <span className="hidden sm:inline opacity-30">|</span>
                        <span className="flex items-center gap-2">
                            <span className="text-primary text-sm">✦</span> Ad-free sanctuary
                        </span>
                        <span className="hidden sm:inline opacity-30">|</span>
                        <span className="flex items-center gap-2">
                            <span className="text-plum text-sm">✦</span> Your data, yours
                        </span>
                    </div>

                </div>
            </section>
            {/* --- 6. 页脚 --- */}
            <footer className="relative z-10 w-full text-center p-8 text-[10px] font-mono tracking-[0.2em] text-muted/50 select-none border-t border-line/50 bg-bg">
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