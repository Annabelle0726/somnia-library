// src/auth/AuthScreen.tsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // 1. 用于获取 URL 中的 ?mode=
import { supabase } from '../lib/supabase'; // 2. 引入 supabase 实例
import { LandingHeader } from "../components/landings/LandingHeader.tsx";
// import { useAuth } from './useAuth'

export default function AuthScreen() {
    // 3. 用 useSearchParams 拿到 URL 里的 ?mode=signup 或 ?mode=login
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

    // 4. 定义输入框的状态和错误、加载提示
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            if (mode === 'login') {
                // 执行登录
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                // 执行注册
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('注册成功！请检查邮箱进行验证（如果开启了邮箱验证），或直接登录。');
                setSearchParams({ mode: 'login' }); // 注册完切换回登录模式
            }
        } catch (err: any) {
            setErrorMsg(err.message || '操作失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-theme-bg0 font-serif text-theme-ink relative">
            <LandingHeader />
            <div className="z-10 w-full max-w-md p-8 bg-theme-bg0/80 backdrop-blur-xl border border-theme-line/30 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 tracking-wide text-theme-primary">
                        <p className="text-theme-ink/70 italic">Somnia Library</p>
                    </h2>
                    <p className="text-xs font-mono tracking-widest text-amber-600/80 uppercase mt-2">
                        {mode === 'login' ? '[ Login ]' : '[ Registry ]'}
                    </p>
                </div>

                {/* 错误信息提示 */}
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/40 text-red-400 text-sm rounded font-mono">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm mb-1 text-theme-ink/80 font-mono text-xs uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // 绑定状态
                            className="w-full p-3 bg-transparent border border-theme-line/50 rounded focus:outline-none focus:border-amber-500/70 transition-colors font-mono text-sm"
                            placeholder="reader@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-theme-ink/80 font-mono text-xs uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // 绑定状态
                            className="w-full p-3 bg-transparent border border-theme-line/50 rounded focus:outline-none focus:border-amber-500/70 transition-colors font-mono text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 w-full p-3 bg-amber-600/90 hover:bg-amber-500 disabled:bg-amber-800 disabled:opacity-50 text-white font-sans font-medium rounded transition-all duration-300 shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)]"
                    >
                        {isSubmitting ? 'Processing...' : mode === 'login' ? 'Enter Library' : 'Create Account'}
                    </button>
                </form>

                {/* 动态切换 登录/注册 的底层小字链接 */}
                <div className="mt-6 text-center text-xs font-mono text-theme-ink/50">
                    {mode === 'login' ? (
                        <p>
                            First time here?{' '}
                            <button onClick={() => setSearchParams({ mode: 'signup' })} className="text-amber-600/80 hover:text-amber-500 underline transition-colors">
                                Sign Up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already a member?{' '}
                            <button onClick={() => setSearchParams({ mode: 'login' })} className="text-amber-600/80 hover:text-amber-500 underline transition-colors">
                                Log In
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}