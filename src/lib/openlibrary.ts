// src/lib/openlibrary.ts
import { cleanIsbn } from './isbn';

interface OpenLibraryBook {
    title: string;
    authors: string;
    isbn?: string; // 增加单一的标准 ISBN 字段返回
    cover?: string;
    series?: string;
    subjects?: string[];
}

export async function fetchBookByIsbn(isbnInput: string): Promise<OpenLibraryBook | null> {
    const cleaned = cleanIsbn(isbnInput);
    if (!cleaned) return null;

    const res = await fetch(`https://openlibrary.org/isbn/${cleaned}.json`);
    if (!res.ok) return null;
    const info = await res.json();

    // 1. 优先提取标准 ISBN-13，若无则提取 ISBN-10
    let primaryIsbn = cleaned;
    if (Array.isArray(info.isbn_13) && info.isbn_13.length > 0) {
        primaryIsbn = cleanIsbn(info.isbn_13[0]);
    } else if (Array.isArray(info.isbn_10) && info.isbn_10.length > 0) {
        primaryIsbn = cleanIsbn(info.isbn_10[0]);
    }

    // 2. 解析作者
    let authors = '';
    if (info.authors?.length) {
        const names = await Promise.all(
            info.authors.slice(0, 5).map(async (a: any) => {
                if (typeof a === 'string') return a;
                try {
                    const ar = await fetch(`https://openlibrary.org${a.key}.json`);
                    const ad = await ar.json();
                    return ad.name || ad.personal_name || 'Unknown';
                } catch {
                    return a.key || 'Unknown';
                }
            })
        );
        authors = names.join(', ');
    }

    return {
        title: info.title ?? '',
        authors,
        isbn: primaryIsbn,
        cover: info.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${info.covers[0]}-L.jpg`
            : undefined,
        series: info.series?.[0],
        subjects: info.subjects,
    };
}