import { Link } from 'react-router-dom';

export function LandingActionButtons() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12 w-full max-w-xl mx-auto z-20">
            {/* 🔹 按钮一：Log In (古典隐形书签) */}
            <Link
                to="/auth?mode=signin"
                className="group relative w-48 h-12 flex items-center justify-center
                           border border-nocturne-line/40 bg-nocturne-bg1/60 backdrop-blur-md
                           rounded-xl text-nocturne-ink/70 font-mono text-xs tracking-[0.2em] uppercase
                           transition-all duration-500 ease-out
                           hover:border-nocturne-gold/60 hover:text-nocturne-gold hover:bg-nocturne-bg1/80"
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
                           border border-nocturne-primary/50 bg-nocturne-primary/10
                           text-nocturne-primary backdrop-blur-sm
                           transition-all duration-500 ease-out
                           hover:border-nocturne-primary hover:text-nocturne-bg0
                           overflow-hidden"
            >
                {/* 填充动画层 */}
                <span className="absolute inset-0 bg-gradient-to-r from-nocturne-primary/90 via-nocturne-gold/80 to-nocturne-primary/90
                                 scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                 group-hover:scale-x-100" />

                {/* 文字与图标 */}
                <span className="relative inline-flex items-center gap-2 font-medium">
                    Get Started
                    <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
            </Link>
        </div>
    );
}