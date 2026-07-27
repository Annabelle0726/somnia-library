// src/lib/openlibrary.ts
interface OpenLibraryBook {
    title: string;
    authors: string;
    cover?: string;
    series?: string;
    subjects?: string[];
}

export async function fetchBookByIsbn(isbn: string): Promise<OpenLibraryBook | null> {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!res.ok) return null;
    const info = await res.json();

    // 解析作者
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
        cover: info.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${info.covers[0]}-L.jpg`
            : undefined,
        series: info.series?.[0],
        subjects: info.subjects,
    };
}