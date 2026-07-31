// src/components/library/AddBookForm.tsx
import React, { useState, useEffect } from 'react';
import { useBookForm } from '../../hooks/useBookForm';
import { BookFormFields } from './BookFormFields';
import { useOpenLibrarySearch } from '../../hooks/useOpenLibrarySearch';
import { useDebounce } from 'use-debounce';

interface AddBookFormProps {
    initialTitle?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const AddBookForm: React.FC<AddBookFormProps> = ({ initialTitle, onSuccess, onCancel }) => {
    const { form, updateField, loading, errorMsg, fetchingIsbn, fetchByIsbn, submit } = useBookForm(initialTitle);

    // 1. 引入 OpenLibrary 搜索功能
    const { results, searching, searchBooks, mapToFormData } = useOpenLibrarySearch();
    const [showDropdown, setShowDropdown] = useState(false);

    // 2. 防抖处理：避免每打一个字就发一次请求
    const [debouncedTitle] = useDebounce(form.title, 500);

    // 3. 监听输入变化触发搜索
    useEffect(() => {
        if (debouncedTitle && debouncedTitle.length > 1) {
            searchBooks(debouncedTitle);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }, [debouncedTitle, searchBooks]);

    // 4. 点击下拉列表项：自动填表并关闭下拉
    const handleSelectResult = (olBook: any) => {
        const mappedData = mapToFormData(olBook);
        // 批量更新字段
        Object.entries(mappedData).forEach(([key, value]) => {
            // @ts-ignore (因为 mapToFormData 返回的 key 必然符合 form 的 key)
            updateField(key, value);
        });
        setShowDropdown(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(onSuccess);
    };

    return (
        <div className="relative w-full">
            {/* 4. 渲染下拉建议列表 (在 BookFormFields 上方) */}
            {showDropdown && results.length > 0 && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-card border border-line rounded-lg shadow-2xl max-h-60 overflow-y-auto mt-10 transform -translate-y-2">
                    {results.map((book, index) => (
                        <div
                            key={book.key || index}
                            onClick={() => handleSelectResult(book)}
                            className="px-4 py-3 hover:bg-primary/10 cursor-pointer border-b border-line/50 last:border-0 flex items-center gap-3 transition-colors"
                        >
                            {book.cover_i ? (
                                <img
                                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                                    alt="cover"
                                    className="w-8 h-12 object-cover rounded shadow-sm bg-bg2"
                                />
                            ) : (
                                <div className="w-8 h-12 bg-bg2 flex items-center justify-center text-xs text-muted border border-line/30 rounded">📖</div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-sm text-ink truncate">{book.title}</span>
                                <span className="text-xs text-muted truncate">{book.author_name?.[0] || 'Unknown'} {book.first_publish_year ? `(${book.first_publish_year})` : ''}</span>
                            </div>
                        </div>
                    ))}
                    {searching && (
                        <div className="px-4 py-3 text-xs text-muted animate-pulse">Searching OpenLibrary...</div>
                    )}
                </div>
            )}

            {/* 5. 渲染你原本的表单 */}
            <BookFormFields
                form={form}
                updateField={updateField}
                loading={loading}
                errorMsg={errorMsg}
                fetchingIsbn={fetchingIsbn}
                fetchByIsbn={fetchByIsbn}
                onSubmit={handleSubmit}
                onCancel={onCancel}
            />
        </div>
    );
};