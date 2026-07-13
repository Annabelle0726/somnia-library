import { NightSky } from '../features/NightSky'

export function Background() {
    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <NightSky />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-nocturne-primary/10 rounded-full blur-[120px] animate-pulse [animation-duration:8s]"></div>
            <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-nocturne-violet/15 rounded-full blur-[150px] animate-pulse [animation-duration:12s]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#050209_90%)] opacity-60"></div>
        </div>
    )
}