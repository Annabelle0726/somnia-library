// src/hooks/useBookForm.ts
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { cleanIsbn, isValidIsbn } from '../lib/isbn';
import { fetchBookByIsbn } from '../lib/openlibrary';
import type { ReadingStatus } from '../types/book';
import toast from "react-hot-toast";

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

    const submit = async (onSuccess?: () => void) => {
        if (!form.title.trim() || !form.author.trim()) {
            return setErrorMsg('Title and Author are required.');
        }
        const clean = cleanIsbn(form.isbn);
        if (clean && !isValidIsbn(clean)) {
            return setErrorMsg('Invalid ISBN. Please check or leave blank.');
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in.');

            let targetBookId: string | null = null;

            // 1. 优先在公共 books 表中查重：按 ISBN 查询
            if (clean) {
                const { data: existingBook } = await supabase
                    .from('books')
                    .select('id')
                    .eq('isbn', clean)
                    .limit(1)
                    .maybeSingle();
                if (existingBook) targetBookId = existingBook.id;
            }

            // 2. 次选在公共 books 表中查重：按书名 + 作者查询
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

            // ⚡ 3. 关键新增：如果这本书在公共库中已经存在，检查当前用户的个人 Library 中是否已经有了！
            if (targetBookId) {
                const { data: userBook } = await supabase
                    .from('user_book_status')
                    .select('book_id')
                    .eq('user_id', user.id)
                    .eq('book_id', targetBookId)
                    .limit(1)
                    .maybeSingle();

                if (userBook) {
                    // 如果个人书房里已经有了，拦截提交并提示用户
                    const msg = 'This tome is already archived in your library!';
                    setErrorMsg(msg);
                    // 👈 2. 弹出超醒目的 Toast 提示！
                    toast.error(msg, {
                        duration: 3000,
                        style: {
                            background: '#1f2937',
                            color: '#f87171',
                            border: '1px solid #ef4444',
                        },
                        icon: '📚',
                    });

                    setLoading(false);
                    return;
                }
            }

            // 4. 全站公共库完全没有这本书时，才在 books 表中创建新记录
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
                    rating: parseFloat(form.rating) || 0,
                    spice: parseInt(form.spice, 10) || 0,
                    tropes_0: tropes[0] || null,
                    tropes_1: tropes[1] || null,
                    tropes_2: tropes[2] || null,
                    tropes_3: tropes[3] || null,
                    tropes_4: tropes[4] || null,
                };

                const { data: newBook, error: insertError } = await supabase
                    .from('books')
                    .insert(payload)
                    .select('id')
                    .single();

                if (insertError || !newBook) throw insertError || new Error('Failed to create book');
                targetBookId = newBook.id;
            }

            // 5. 插入该书到当前用户的个人书房状态 (user_favorites & user_book_status)
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

            setForm(initialFormState);
            onSuccess?.();
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to add book.');
        } finally {
            setLoading(false);
        }
    };

    return { form, updateField, loading, errorMsg, fetchingIsbn, fetchByIsbn, submit, setErrorMsg };
}