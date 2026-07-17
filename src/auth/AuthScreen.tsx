// src/auth/AuthScreen.tsx
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import {LandingHeader} from "../components/landings/LandingHeader.tsx";

export default function AuthScreen() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(); // 更新全局状态为已登录
        navigate('/'); // 登录成功后跳转到主页面（内部 Layout）
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-theme-bg0 font-serif text-theme-ink relative">

<LandingHeader />
            <div className="z-10 w-full max-w-md p-8 bg-theme-bg0/80 backdrop-blur-xl border border-theme-line/30 rounded-xl shadow-2xl">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 tracking-wide text-theme-primary">
                        Somnia Library
                    </h1>
                    <p className="text-theme-ink/70 italic">
                        A reading life, beautifully kept.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm mb-1 text-theme-ink/80">Email</label>
                        <input
                            type="email"
                            className="w-full p-3 bg-transparent border border-theme-line/50 rounded focus:outline-none focus:border-amber-500/70 transition-colors"
                            placeholder="reader@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-theme-ink/80">Password</label>
                        <input
                            type="password"
                            className="w-full p-3 bg-transparent border border-theme-line/50 rounded focus:outline-none focus:border-amber-500/70 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-4 w-full p-3 bg-amber-600/90 hover:bg-amber-500 text-white font-sans font-medium rounded transition-all duration-300 shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)]"
                    >
                        Enter Library
                    </button>
                </form>
            </div>
        </div>
    );
}