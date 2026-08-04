// src/types/club.ts
export interface Club {
    id: string;
    name: string;
    description: string;
    avatar_url?: string | null;
    current_book_id?: string | null;
    meeting_schedule?: string | null;
    created_by: string;
    is_public: boolean;
    created_at: string;
    member_count?: number;
    club_members?: { user_id: string }[];
}

export interface ClubWithMembership extends Club {
    is_member: boolean;
    is_admin: boolean;
}