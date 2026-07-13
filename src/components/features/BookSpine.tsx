interface BookSpineProps {
    title: string
    spiceLevel: number
}

export function BookSpine({ title, spiceLevel }: BookSpineProps) {
    // 根据辣度（Spice Level）动态调节书脊的暗红/金色边缘
    const borderColor = spiceLevel >= 4 ? 'border-red-800' : 'border-nocturne-gold/40'

    return (
        <div className={`w-12 h-48 bg-nocturne-surface border-t-4 ${borderColor} rounded-t shadow-lg flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform duration-300`}>
            {/* 竖排文字效果 */}
            <p className="text-nocturne-text font-serif text-sm tracking-widest [writing-mode:vertical-rl] select-none text-center truncate max-h-40">
                {title}
            </p>
        </div>
    )
}