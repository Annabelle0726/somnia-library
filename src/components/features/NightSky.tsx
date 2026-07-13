export function NightSky() {
    return (
        <div className="absolute inset-0 bg-nocturne-bg overflow-hidden z-0">
            {/* 闪烁的星星 */}
            <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 left-2/3 w-1.5 h-1.5 bg-nocturne-gold/60 rounded-full animate-ping [animation-duration:3s]"></div>
            <div className="absolute top-64 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse [animation-duration:2s]"></div>
        </div>
    )
}