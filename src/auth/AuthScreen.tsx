// src/auth/AuthScreen.tsx
// import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingHeader } from "../components/landings/LandingHeader";
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { EmailAuthForm } from '../components/auth/EmailAuthForm';

export default function AuthScreen() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

    return (
        <div className="min-h-screen flex flex-col items-center bg-[var(--bg)] font-[family-name:var(--font-body)] text-[var(--ink)] relative">
            <LandingHeader />
            <div className="flex-1 flex items-center justify-center w-full px-4 my-8">
                <div className="z-10 w-full max-w-md p-8 bg-[var(--card)] backdrop-blur-xl border border-[var(--line)] rounded-xl shadow-2xl">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2 tracking-wide text-[var(--primary)] font-[family-name:var(--font-serif-fancy)] italic">
                            Somnia Library
                        </h2>
                        <p className="text-xs font-[family-name:var(--font-mono)] tracking-widest text-[var(--muted)] uppercase mt-2">
                            {mode === 'login' ? '[ Login ]' : '[ Registry ]'}
                        </p>
                    </div>
                    {/* 邮箱密码表单组件 */}
                    <EmailAuthForm />

                    {/* 分割线 OR */}
                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--line)]"></div>
                        </div>
                        <span className="relative px-3 bg-[var(--card)] text-xs font-[family-name:var(--font-mono)] text-[var(--muted)] uppercase">
                            Or with Google
                        </span>
                    </div>

                    {/* Google OAuth 登录按钮 */}
                    <GoogleAuthButton />


                    {/* Mode 切换 Footer */}
                    <div className="mt-6 text-center text-xs font-[family-name:var(--font-mono)] text-[var(--muted)]">
                        {mode === 'login' ? (
                            <p>
                                First time here?{' '}
                                <button
                                    type="button"
                                    onClick={() => setSearchParams({ mode: 'signup' })}
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
                                    onClick={() => setSearchParams({ mode: 'login' })}
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