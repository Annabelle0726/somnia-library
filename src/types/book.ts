// src/types/book.ts

/**
 * 1. 公共图书实体类型（对应 Supabase public.books 表）
 * 只保留客观、不随用户改变的书籍元数据
 */
export interface Book {
    id: string;
    title: string;
    author: string | null;
    series: string | null;
    seriesposition: number | null; // 注意：对应数据库列名 seriesposition
    subgenre: string | null;
    spice: number | null;          // 客观辣度/尺度评分
    rating: number | null;         // 客观综合评分（如 4.25）
    cover: string | null;
    created_at?: string;

    // 数据库拆分存放的 5 个桥段字段
    tropes_0?: string | null;
    tropes_1?: string | null;
    tropes_2?: string | null;
    tropes_3?: string | null;
    tropes_4?: string | null;

    // 前端处理后聚合的桥段数组（UI 渲染用）
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
    progress: number;              // 阅读进度 (0 - 100 或 页码)
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
 * 当页面/卡片需要同时展示图书基本信息和“当前登录用户的个性化状态”时使用
 */
export interface BookWithUserData extends Book {
    is_fave?: boolean;            // 来自 user_favorites
    user_status?: ReadingStatus;  // 来自 user_book_status.status
    progress?: number;            // 来自 user_book_status.progress
}