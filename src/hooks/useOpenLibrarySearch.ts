// src/hooks/useOpenLibrarySearch.ts
import { useState, useCallback } from 'react';
// import { useDebounce } from 'use-debounce';

// 定义 OpenLibrary 返回的数据结构
interface OLSearchResult {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    isbn?: string[];
    publisher?: string[];
}

export function useOpenLibrarySearch() {
    const [results, setResults] = useState<OLSearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    // 执行搜索的核心函数
    const searchBooks = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        setSearching(true);
        try {
            // 增加 fields 参数只获取必要数据，减小体积
            const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5&fields=key,title,author_name,first_publish_year,cover_i,isbn,publisher`;
            const res = await fetch(url);
            const data = await res.json();
            setResults(data.docs || []);
        } catch (err) {
            console.error("OL Search Error:", err);
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    // 工具函数：将 OpenLibrary 书转换为你表单需要的 Partial 字段
    const mapToFormData = (olBook: OLSearchResult) => {
        return {
            title: olBook.title || '',
            author: olBook.author_name?.[0] || '',
            // 使用最小的 ISBN 或默认空
            isbn: olBook.isbn?.[0] || '',
            cover: olBook.cover_i ? `https://covers.openlibrary.org/b/id/${olBook.cover_i}-L.jpg` : '',
            published_year: olBook.first_publish_year || new Date().getFullYear(),
            publisher: olBook.publisher?.[0] || '',
        };
    };

    return { results, searching, searchBooks, mapToFormData };
}