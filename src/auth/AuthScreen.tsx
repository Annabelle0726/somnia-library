// src/auth/AuthScreen.tsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // 1. 用于获取 URL 中的 ?mode=
import { supabase } from '../lib/supabase'; // 2. 引入 supabase 实例
import { LandingHeader } from "../components/landings/LandingHeader.tsx";

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

        <div className="min-h-screen flex flex-col
        items-center bg-[var(--bg)]
        font-[family-name:var(--font-body)] text-[var(--ink)] relative">

            <LandingHeader />
            <div className="flex-1 flex items-center justify-center
             w-full px-4 ">
                <div className="z-10 w-full max-w-md p-8 bg-[var(--card)] backdrop-blur-xl border
                border-[var(--line)] rounded-xl shadow-2xl">
                    <div className="text-center mb-8">
                        {/* 修复：去掉了 h2 内部嵌套的 p 标签 */}
                        <h2 className="text-3xl font-bold mb-2 tracking-wide text-[var(--primary)] font-[family-name:var(--font-serif-fancy)] italic">
                            Somnia Library
                        </h2>
                        <p className="text-xs font-[family-name:var(--font-mono)] tracking-widest text-[var(--muted)] uppercase mt-2">
                            {mode === 'login' ? '[ Login ]' : '[ Registry ]'}
                        </p>
                    </div>

                    {/* 错误信息提示 */}
                    {errorMsg && (
                        <div
                            className="mb-4 p-3 bg-red-900/20 border border-red-500/40 text-red-400 text-sm rounded font-[family-name:var(--font-mono)]">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label
                                className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm"
                                placeholder="reader@example.com"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-[var(--ink)]/80
                        font-[family-name:var(--font-mono)] text-xs uppercase
                        tracking-wider">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-4 w-full p-3 bg-[var(--primary)]
                         font-[family-name:var(--font-mono)]
                        hover:opacity-90 disabled:opacity-50 text-white
                         font-medium rounded transition-all duration-300 shadow-lg"
                        >
                            {isSubmitting ? 'Processing...' : mode === 'login' ?
                                'Enter Library' : 'Create Account'}
                        </button>
                    </form>

                    {/* 切换 登录/注册 */}
                    <div className="mt-6 text-center text-xs font-[family-name:var(--font-mono)] text-[var(--muted)]">
                        {mode === 'login' ? (
                            <p>
                                First time here?{' '}
                                {/* 修复：显式加上 type="button" 避免误触发 form 提交 */}
                                <button
                                    type="button"
                                    onClick={() => setSearchParams({mode: 'signup'})}
                                    className="text-[var(--primary)] hover:underline transition-colors ml-1"
                                >
                                    Sign Up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already a member?{' '}
                                <button
                                    type="button"
                                    onClick={() => setSearchParams({mode: 'login'})}
                                    className="text-[var(--primary)] hover:underline transition-colors ml-1"
                                >
                                    Log In
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}