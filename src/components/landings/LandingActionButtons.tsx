import { Link } from 'react-router-dom';

export function LandingActionButtons() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12 w-full max-w-xl mx-auto z-20">
            {/* 🔹 按钮一：Log In (古典隐形书签) */}
            <Link
                to="/auth?mode=login"
                className="group relative w-48 h-12 flex items-center justify-center
                           border border-line bg-card/60 backdrop-blur-md
                           rounded-xl text-ink/70 font-mono text-xs tracking-[0.2em] uppercase
                           transition-all duration-500 ease-out
                           hover:border-tertiary/60 hover:text-tertiary hover:bg-card/90"
            >
                {/* 括号动画 */}
                <span className="inline-flex items-center gap-0 transition-all duration-300">
                    <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-60 group-hover:translate-x-0">
                        [
                    </span>
                    <span className="mx-1">Log In</span>
                    <span className="opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-60 group-hover:translate-x-0">
                        ]
                    </span>
                </span>
            </Link>

            {/* 🔸 按钮二：Get Started (黄金圣杯) */}
            <Link
                to="/auth?mode=signup"
                className="group relative w-48 h-12 flex items-center justify-center
                           rounded-xl font-mono text-xs tracking-[0.2em] uppercase
                           border border-primary/50 bg-primary/10
                           text-primary backdrop-blur-sm
                           transition-all duration-500 ease-out
                           hover:border-primary hover:text-on-primary
                           overflow-hidden"
            >
                {/* 填充动画层：从 Tertiary (金色) 到 Primary (主色) 的渐变填充 */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-tertiary to-primary
                                 scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                 group-hover:scale-x-100" />

                {/* 文字与图标 */}
                <span className="relative z-10 inline-flex items-center gap-2 font-medium">
                    Get Started
                    <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
            </Link>
        </div>
    );
}