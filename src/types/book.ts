// src/types/book.ts

/**
 * 1. 公共图书实体类型（对应 Supabase public.books 表）
 */
export interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string | null;
    series: string | null;
    seriesposition: number | null;
    subgenre: string | null;
    spice: number | null;
    rating: number | null;
    cover: string | null;
    created_at?: string;

    tropes_0?: string | null;
    tropes_1?: string | null;
    tropes_2?: string | null;
    tropes_3?: string | null;
    tropes_4?: string | null;

    tropes?: string[];
}

/**
 * 2. 用户个性化图书状态（对应 public.user_book_status 表）
 */
export type ReadingStatus = 'want_to_read' | 'reading' | 'read' | 'abandoned';

export interface UserBookStatus {
    id: string;
    user_id: string;
    book_id: string;
    status: ReadingStatus | null;
    progress: number;
    updated_at: string;
}

/**
 * 3. 用户收藏关联（对应 public.user_favorites 表）
 */
export interface UserFavorite {
    id: string;
    user_id: string;
    book_id: string;
    created_at: string;
}

/**
 * 4. 前端视图/组件组合类型 (UI Display Model)
 * 显式复用 UserBookStatus 和 UserFavorite 的类型定义，做到真正的类型追溯与安全！
 */
export interface BookWithUserData extends Book {
    is_fave?: boolean;                           // 标记是否有对应的 UserFavorite 记录
    user_status?: UserBookStatus['status'];      // 👈 直接关联引用 UserBookStatus.status
    progress?: UserBookStatus['progress'];       // 👈 直接关联引用 UserBookStatus.progress
}