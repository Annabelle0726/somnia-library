// src/components/auth/GoogleAuthButton.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function EmailAuthForm() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

    // 控制两步走注册的步骤编号 (1 或 2)
    const [step, setStep] = useState<number>(1);

    // 1. Email, Password, Display Name (必填)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    // 2. Sex, Phone (选填)
    const [sex, setSex] = useState('unspecified');
    const [phone, setPhone] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    // 每次在登录/注册模式之间切换时，重置步骤为 1 并清空报错
    useEffect(() => {
        setStep(1);
        setErrorMsg('');
    }, [mode]);

    // 第一步点击“下一步”时的校验（邮箱 + 密码）
    const handleNextStep = () => {
        setErrorMsg('');
        if (!email.trim() || !password.trim()) {
            setErrorMsg('Please enter both email and password.');
            return;
        }
        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }
        setStep(2); // 进入第二步
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error('Incorrect email or password.');
                    }
                    throw error;
                }
            } else {
                // ==========================================
                // 注册终极提交
                // ==========================================

                // 校验必填项：Display Name 不能为空
                if (!displayName.trim()) {
                    throw new Error('Display Name is required.');
                }

                // 1. 预校验：检查邮箱是否存在
                const { data: existingUser, error: checkError } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .eq('email', email.trim().toLowerCase())
                    .maybeSingle();

                if (checkError) {
                    console.warn('Pre-check profiles error:', checkError);
                }
                if (existingUser) {
                    throw new Error('This email is already registered. Please switch to Log In.');
                }

                // 动态构建当前环境的重定向 URL（自动兼容 localhost 和 GitHub Pages）
                const redirectUrl = `${window.location.origin}${window.location.pathname}`;

                // 2. 提交注册信息给 Supabase
                const { error: authError } = await supabase.auth.signUp({
                    email: email.trim().toLowerCase(),
                    password,
                    options: {
                        emailRedirectTo: redirectUrl,
                        data: {
                            display_name: displayName.trim(),
                            sex: sex,
                            phone: phone.trim()
                        }
                    }
                });

                if (authError) {
                    if (
                        authError.message.includes('User already registered') ||
                        authError.message.includes('already exists')
                    ) {
                        throw new Error('This email is already associated with an account.');
                    }
                    throw authError;
                }

                alert('Account created! Please check your email to verify your account, or log in directly.');
                setSearchParams({ mode: 'login' });
            }
        } catch (err: any) {
            console.error('Auth error detail:', err);
            let msg = 'An unexpected error occurred. Please try again.';

            if (typeof err === 'string' && err !== '{}' && err.trim() !== '') {
                msg = err;
            } else if (err?.message && typeof err.message === 'string' && err.message !== '{}' && err.message.trim() !== '') {
                msg = err.message;
            } else if (err?.status === 429 || err?.code === 429 || err?.message === '{}') {
                msg = 'Rate limit exceeded. Please wait a moment and try again with a different email.';
            } else if (err?.error_description) {
                msg = err.error_description;
            }

            setErrorMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg && (
                <div className="p-3 bg-red-900/20 border border-red-500/40 text-red-400 text-sm rounded font-[family-name:var(--font-mono)] animate-fade-in">
                    {errorMsg}
                </div>
            )}

            {/* ========================================== */}
            {/* 场景 A：登录模式 OR 注册第一步 (邮箱+密码，均为必填) */}
            {/* ========================================== */}
            {(mode === 'login' || (mode === 'signup' && step === 1)) && (
                <>
                    <div>
                        <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                            Email <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2.5 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                            placeholder="reader@example.com"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                            Password <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2.5 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                            placeholder="••••••••"
                        />
                    </div>
                </>
            )}

            {/* ========================================== */}
            {/* 场景 B：注册第二步 (Display Name 必填，Sex/Phone 选填) */}
            {/* ========================================== */}
            {mode === 'signup' && step === 2 && (
                <>
                    <div className="text-xs font-[family-name:var(--font-mono)] text-[var(--tertiary)] mb-1">
                        Step 2 of 2: Almost there! Tell us a bit about yourself.
                    </div>

                    <div>
                        <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                            Display Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-2.5 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                            placeholder="e.g. Dreamer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                                Sex <span className="text-xs text-[var(--ink)]/40 lowercase">(optional)</span>
                            </label>
                            <select
                                value={sex}
                                onChange={(e) => setSex(e.target.value)}
                                className="w-full p-2.5 bg-[var(--card)] border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                            >
                                <option value="unspecified">Prefer not to say</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                                Phone <span className="text-xs text-[var(--ink)]/40 lowercase">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-2.5 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                                placeholder="+1 234..."
                            />
                        </div>
                    </div>
                </>
            )}

            {/* ========================================== */}
            {/* 按钮区域 */}
            {/* ========================================== */}
            {mode === 'signup' && step === 1 ? (
                <button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-2 w-full p-3 bg-[var(--primary)] font-[family-name:var(--font-mono)] hover:opacity-90 text-white font-medium rounded transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                    <span>Next: Profile Details</span>
                    <span>➔</span>
                </button>
            ) : mode === 'signup' && step === 2 ? (
                <div className="mt-2 flex gap-3">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={isSubmitting}
                        className="w-1/3 p-3 border border-[var(--line)] font-[family-name:var(--font-mono)] hover:bg-[var(--line)]/20 disabled:opacity-50 text-[var(--ink)] font-medium rounded transition-all duration-200"
                    >
                        ⬅ Back
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-2/3 p-3 bg-[var(--primary)] font-[family-name:var(--font-mono)] hover:opacity-90 disabled:opacity-50 text-white font-medium rounded transition-all duration-300 shadow-lg"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Account'}
                    </button>
                </div>
            ) : (
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full p-3 bg-[var(--primary)] font-[family-name:var(--font-mono)] hover:opacity-90 disabled:opacity-50 text-white font-medium rounded transition-all duration-300 shadow-lg"
                >
                    {isSubmitting ? 'Processing...' : 'Enter Library'}
                </button>
            )}
        </form>
    );
}