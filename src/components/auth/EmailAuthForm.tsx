import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function EmailAuthForm() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [sex, setSex] = useState('unspecified');
    const [phone, setPhone] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                // 💡 核心亮点：直接把表单字段传进 options.data
                // 这样它们就会变成 sql 里的 new.raw_user_meta_data，被 Trigger 自动抓取写入 profiles！
                const { error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name: displayName.trim(),
                            sex: sex,
                            phone: phone.trim()
                        }
                    }
                });

                if (authError) throw authError;

                // 删掉了原本多余的 supabase.from('profiles').insert(...)
                // 因为 SQL Trigger 已经在数据库底层瞬间帮我们完成了！

                alert('注册成功！请检查邮箱进行验证，或直接登录。');
                setSearchParams({ mode: 'login' });
            }
        } catch (err: any) {
            setErrorMsg(err.message || '操作失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg && (
                <div className="p-3 bg-red-900/20 border border-red-500/40 text-red-400 text-sm rounded font-[family-name:var(--font-mono)]">
                    {errorMsg}
                </div>
            )}

            {mode === 'signup' && (
                <>
                    <div>
                        <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            // required
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-2.5 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                            placeholder="e.g. Dreamer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                                Sex
                            </label>
                            <select
                                value={sex}
                                // required
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
                                Phone
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

            <div>
                <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                    Email
                </label>
                <input
                    type="email"
                    // required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                    placeholder="reader@example.com"
                />
            </div>

            <div>
                <label className="block mb-1 text-[var(--ink)]/80 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider">
                    Password
                </label>
                <input
                    type="password"
                    // required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 bg-transparent border border-[var(--line)] rounded focus:outline-none focus:border-[var(--primary)] transition-colors font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full p-3 bg-[var(--primary)] font-[family-name:var(--font-mono)] hover:opacity-90 disabled:opacity-50 text-white font-medium rounded transition-all duration-300 shadow-lg"
            >
                {isSubmitting ? 'Processing...' : mode === 'login' ? 'Enter Library' : 'Create Account'}
            </button>
        </form>
    );
}