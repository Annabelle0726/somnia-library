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

    spice_reasoning: string | null;
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
 * ⚡ 4. 用户图书评价/笔记（对应 public.reviews 表）
 */
export interface BookReview {
    id: string;
    book_id: string;
    reviewer_id: string;
    rating: number | null;
    body: string | null;
    created_at: string;
    // 如果查询时连表带出了 profiles 个人资料
    profiles?: {
        username?: string;
        avatar_url?: string;
    } | null;
}

/**
 * 5. 前端视图/组件组合类型 (UI Display Model)
 */
export interface BookWithUserData extends Book {
    is_fave?: boolean;                           // 标记是否有对应的 UserFavorite 记录
    user_status?: UserBookStatus['status'];      // 关联引用 UserBookStatus.status
    progress?: UserBookStatus['progress'];       // 关联引用 UserBookStatus.progress
    user_review?: BookReview;                    // ⚡ 新增：当前登录用户对该书的评论与评分
}