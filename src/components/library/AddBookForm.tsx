// src/components/library/AddBookForm.tsx
import React, { useState, useEffect, useRef } from 'react';
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

    // 1. OpenLibrary 搜索 Hooks
    const { results, searching, searchBooks, mapToFormData } = useOpenLibrarySearch();
    const [showDropdown, setShowDropdown] = useState(false);

    // 🌟 防止选择后二次触发防抖搜索
    const isManualSelection = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 2. 防抖处理
    const [debouncedTitle] = useDebounce(form.title, 500);

    // 3. 监听输入触发搜索
    useEffect(() => {
        // 如果是手动选择或者手动 Fill 数据，跳过这次防抖搜索
        if (isManualSelection.current) {
            isManualSelection.current = false;
            return;
        }

        if (debouncedTitle && debouncedTitle.trim().length > 2) {
            searchBooks(debouncedTitle);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }, [debouncedTitle, searchBooks]);

    // 4. 点击外部自动关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 5. 点击下拉项：自动填表并彻底关闭下拉
    const handleSelectResult = (olBook: any) => {
        isManualSelection.current = true; // 标记为手动选择，防止触发 useEffect
        const mappedData = mapToFormData(olBook);

        // 批量更新表单数据
        Object.entries(mappedData).forEach(([key, value]) => {
            // @ts-ignore
            updateField(key, value);
        });

        setShowDropdown(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(onSuccess);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* 6. 表单渲染 */}
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

            {/* 7. 下拉搜索建议（挂载在适当层级，增加模糊背景和精细阴影） */}
            {showDropdown && (results.length > 0 || searching) && (
                <div className="absolute left-0 right-0 top-[72px] z-50 bg-card/95 backdrop-blur-md border border-line rounded-2xl shadow-2xl max-h-64 overflow-y-auto mt-1 scrollbar-thin scrollbar-thumb-line animate-in fade-in slide-in-from-top-2 duration-200">
                    {searching ? (
                        <div className="px-4 py-3 text-xs text-tertiary font-mono animate-pulse flex items-center gap-2">
                            <span className="w-3 h-3 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
                            Searching Open Library archives...
                        </div>
                    ) : (
                        results.map((book, index) => (
                            <div
                                key={book.key || index}
                                onClick={() => handleSelectResult(book)}
                                className="px-4 py-2.5 hover:bg-tertiary/10 cursor-pointer border-b border-line/40 last:border-0 flex items-center gap-3 transition-colors group"
                            >
                                {book.cover_i ? (
                                    <img
                                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                                        alt="cover"
                                        className="w-8 h-11 object-cover rounded shadow border border-line/50 bg-bg2 shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-11 bg-bg2 flex items-center justify-center text-xs text-muted border border-line/40 rounded shrink-0">📖</div>
                                )}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-bold text-sm text-ink group-hover:text-tertiary truncate transition-colors">
                                        {book.title}
                                    </span>
                                    <span className="text-xs text-muted truncate">
                                        by <span className="text-ink/80">{book.author_name?.[0] || 'Unknown'}</span> {book.first_publish_year ? `(${book.first_publish_year})` : ''}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-tertiary/70 group-hover:text-tertiary border border-tertiary/30 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    Fill ↵
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};