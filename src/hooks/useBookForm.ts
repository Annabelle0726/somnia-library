//src/hooks/useBookForm.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cleanIsbn, isValidIsbn } from '../lib/isbn';
import { fetchBookByIsbn } from '../lib/openlibrary';
import type { ReadingStatus } from '../types/book';
import toast from "react-hot-toast";

// 🌶️ AI 评估 Spice
async function evaluateSpice(title: string, author?: string | null, description?: string) {
    const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
        console.warn('VITE_DEEPSEEK_API_KEY is not configured');
        return null;
    }

    const prompt = `Rate this book's explicit/romance content level on a scale of 0-5.
0: No romance, clean. 1: Kissing only. 2: Implied. 3: Moderate detail. 4: Frequent detail. 5: Erotica.
Book: "${title}"${author ? ` by ${author}` : ''}
${description ? `Description: ${description}` : ''}
Return ONLY JSON: {"spice": number, "reasoning": "brief reason"}`;

    try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'Return only valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        if (!res.ok) {
            console.error('DeepSeek API error:', res.status);
            return null;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) return null;

        const cleaned = content.replace(/```json\s*|\s*```/g, '').trim();
        const result = JSON.parse(cleaned);

        if (typeof result.spice === 'number' && result.spice >= 0 && result.spice <= 5) {
            return { spice: Math.round(result.spice), reasoning: result.reasoning || '' };
        }
        return null;
    } catch (e) {
        console.error('Spice evaluation failed:', e);
        return null;
    }
}

// 📖 获取 Open Library 描述
async function fetchDescription(title: string, author?: string | null): Promise<string> {
    try {
        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=3&fields=key,author_name`;
        const res = await fetch(searchUrl);
        const data = await res.json();
        if (!data.docs?.length) return '';

        let bestDoc = null;
        if (author) {
            const lower = author.toLowerCase();
            bestDoc = data.docs.find((d: any) =>
                d.author_name?.some((a: string) => a.toLowerCase().includes(lower))
            );
        }
        if (!bestDoc) bestDoc = data.docs[0];
        const workKey = bestDoc?.key;
        if (!workKey) return '';

        const workUrl = `https://openlibrary.org${workKey}.json`;
        const workRes = await fetch(workUrl);
        const workData = await workRes.json();
        let desc = workData.description;
        if (typeof desc === 'object' && desc?.value) desc = desc.value;
        return typeof desc === 'string' ? desc.substring(0, 600) : '';
    } catch {
        return '';
    }
}

export type BookFormData = {
    isbn: string;
    title: string;
    author: string;
    series: string;
    seriesPosition: string;
    subgenre: string;
    cover: string;
    rating: string;
    spice: string;
    tropesInput: string;
    readStatus: ReadingStatus | 'unread';
    fave: boolean;
};

export function useBookForm(initialTitle = '') {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [fetchingIsbn, setFetchingIsbn] = useState(false);

    const initialFormState: BookFormData = {
        isbn: '',
        title: initialTitle,
        author: '',
        series: '',
        seriesPosition: '',
        subgenre: 'Romantasy',
        cover: '',
        rating: '0',
        spice: '0',
        tropesInput: '',
        readStatus: 'unread',
        fave: false,
    };

    const [form, setForm] = useState<BookFormData>(initialFormState);

    const updateField = <K extends keyof BookFormData>(key: K, value: BookFormData[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const fetchByIsbn = async () => {
        const clean = cleanIsbn(form.isbn);
        if (!clean) return setErrorMsg('Please enter an ISBN first.');
        if (!isValidIsbn(clean)) return setErrorMsg('Invalid ISBN format or check digit.');

        setFetchingIsbn(true);
        setErrorMsg('');
        try {
            const book = await fetchBookByIsbn(clean);
            if (!book) {
                setErrorMsg('No metadata found for this ISBN. You can fill manually.');
                return;
            }
            setForm(prev => ({
                ...prev,
                isbn: book.isbn || clean,
                title: book.title || prev.title,
                author: book.authors || prev.author,
                cover: book.cover || prev.cover,
                series: book.series || prev.series,
                subgenre: prev.subgenre,
            }));
        } catch {
            setErrorMsg('Failed to connect. Please fill manually.');
        } finally {
            setFetchingIsbn(false);
        }
    };

    const submit = useCallback(async (
        onSuccess?: () => void,
        onSpiceEvaluated?: (spice: number, reasoning: string) => void
    ) => {
        // 1️⃣ 基础校验
        if (!form.title.trim() || !form.author.trim()) {
            return setErrorMsg('Title and Author are required.');
        }
        const clean = cleanIsbn(form.isbn);
        if (clean && !isValidIsbn(clean)) {
            return setErrorMsg('Invalid ISBN. Please check or leave blank.');
        }

        // 2️⃣ 评分 > 0 时必须写评论
        const userRating = parseFloat(form.rating);
        if (userRating > 0 && !form.tropesInput.trim()) {
            const msg = 'Please write a short review when giving a rating!';
            setErrorMsg(msg);
            toast.error(msg, {
                duration: 3000,
                style: {
                    background: 'var(--bg-card)',
                    color: 'var(--tertiary)',
                    border: '1px solid var(--tertiary)',
                },
                icon: '✍️',
            });
            return;
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in.');

            let targetBookId: string | null = null;

            // 3️⃣ ISBN 查重
            if (clean) {
                const { data: existingBook } = await supabase
                    .from('books')
                    .select('id')
                    .eq('isbn', clean)
                    .limit(1)
                    .maybeSingle();
                if (existingBook) targetBookId = existingBook.id;
            }

            // 4️⃣ 书名+作者查重
            if (!targetBookId) {
                const { data: existingTitle } = await supabase
                    .from('books')
                    .select('id')
                    .ilike('title', form.title.trim())
                    .ilike('author', form.author.trim())
                    .limit(1)
                    .maybeSingle();
                if (existingTitle) targetBookId = existingTitle.id;
            }

            // 5️⃣ 个人书房查重
            if (targetBookId) {
                const { data: userBook } = await supabase
                    .from('user_book_status')
                    .select('book_id')
                    .eq('user_id', user.id)
                    .eq('book_id', targetBookId)
                    .limit(1)
                    .maybeSingle();

                if (userBook) {
                    const msg = 'This tome is already archived in your library!';
                    setErrorMsg(msg);
                    toast.error(msg, {
                        duration: 3000,
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                        },
                        icon: '📚',
                    });
                    setLoading(false);
                    return;
                }
            }

            // 6️⃣ 创建新书（spice 默认为 null，留给 AI 后台评估）
            if (!targetBookId) {
                const tropes = form.tropesInput.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5);

                const payload = {
                    created_by: user.id,
                    isbn: clean || null,
                    title: form.title.trim(),
                    author: form.author.trim(),
                    series: form.series.trim() || null,
                    seriesposition: form.seriesPosition ? parseFloat(form.seriesPosition) : null,
                    subgenre: form.subgenre.trim() || null,
                    cover: form.cover.trim() || null,
                    spice: null,
                    tropes_0: tropes[0] || null,
                    tropes_1: tropes[1] || null,
                    tropes_2: tropes[2] || null,
                    tropes_3: tropes[3] || null,
                    tropes_4: tropes[4] || null,
                };

                const { data: newBook, error: insertError } = await supabase
                    .from('books')
                    .insert(payload)
                    .select('id, title, author')
                    .single();

                if (insertError || !newBook) throw insertError || new Error('Failed to create book');
                targetBookId = newBook.id;

                // 🎯 只有全新创建的书籍，才在后台发起 Spice 评估
                (async () => {
                    console.log('🌶️ Starting background spice evaluation for:', newBook.title);
                    const desc = await fetchDescription(newBook.title, newBook.author);
                    const result = await evaluateSpice(newBook.title, newBook.author, desc);
                    if (result) {
                        const { error: updateError } = await supabase
                            .from('books')
                            .update({ spice: result.spice, spice_reasoning: result.reasoning })
                            .eq('id', newBook.id);
                        if (updateError) {
                            console.error('Failed to update spice:', updateError.message);
                        } else {
                            console.log(`✅ Spice successfully updated for "${newBook.title}": ${result.spice}/5`);
                            // ⚡ 通知前端 Spice 更新了，可以触发刷新数据
                            onSpiceEvaluated?.(result.spice, result.reasoning);
                        }
                    } else {
                        console.log(`⚠ Spice evaluation returned null for "${newBook.title}"`);
                    }
                })();
            }

            // 7️⃣ 写入 public.reviews 表
            if (userRating > 0 && targetBookId) {
                const { error: reviewError } = await supabase
                    .from('reviews')
                    .insert({
                        book_id: targetBookId,
                        reviewer_id: user.id,
                        rating: userRating,
                        body: form.tropesInput.trim() || null,
                    });

                if (reviewError) {
                    console.error('Failed to create initial review:', reviewError);
                }
            }

            // 8️⃣ 写入个人书房
            if (form.fave) {
                await supabase
                    .from('user_favorites')
                    .upsert({ user_id: user.id, book_id: targetBookId }, { onConflict: 'user_id,book_id' });
            }

            const statusToSave = form.readStatus === 'unread' ? 'want_to_read' : form.readStatus;
            await supabase
                .from('user_book_status')
                .upsert({
                    user_id: user.id,
                    book_id: targetBookId,
                    status: statusToSave,
                    progress: 0,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,book_id' });

            toast.success('Book added to library!', {
                style: {
                    background: 'var(--bg-card)',
                    color: 'var(--secondary)',
                    border: '1px solid var(--secondary)',
                }
            });
            setForm(initialFormState);
            onSuccess?.();
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to add book.');
        } finally {
            setLoading(false);
        }
    }, [form, initialFormState]);

    return { form, updateField, loading, errorMsg, fetchingIsbn, fetchByIsbn, submit, setErrorMsg };
}