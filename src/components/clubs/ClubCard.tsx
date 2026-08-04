// src/components/clubs/ClubCard.tsx
import React from 'react';
import type {ClubWithMembership} from '../../types/club';

interface ClubCardProps {
    club: ClubWithMembership;
    onToggleMembership: (clubId: string, isMember: boolean) => void;
    onViewDetail: () => void; // 新增 Props
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onToggleMembership, onViewDetail }) => {
    return (
        <div
            onClick={onViewDetail} // 💡 点击整个卡片，触发查看详情
            className="group flex flex-col bg-card border border-line/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 cursor-pointer"
        >
            {/* ... Banner 和 内容 保持不变 ... */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-bg2 to-secondary/20 flex items-center px-5 relative overflow-hidden">
                {/* ... */}
                <span className="text-xl">📖</span>
                <span className="font-display font-bold text-sm text-ink truncate max-w-[200px]">{club.name}</span>
                {club.is_admin && <span className="absolute right-4 top-3 text-[8px] font-mono bg-primary/20 border border-primary/30 text-primary px-2 py-0.5 rounded-full">Admin</span>}
            </div>

            <div className="p-5 flex flex-col flex-1 gap-2 border-t border-line/10">
                <p className="text-[11px] font-mono text-muted leading-relaxed line-clamp-2 h-8">{club.description || 'A quiet chapter in the Somnia Library'}</p>

                <div className="mt-auto pt-3 border-t border-line/20 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted">
                        <span>👥 {club.member_count || 0} Members</span>
                    </div>
                    {/* Join/Leave 按钮阻止冒泡，避免点击它时触发 ViewDetail */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleMembership(club.id, club.is_member); }}
                        className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-all border ${club.is_member ? 'bg-bg2 border-line/60 text-muted hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400' : 'bg-primary border-primary text-on-primary hover:opacity-80 shadow-sm shadow-primary/20'}`}
                    >
                        {club.is_member ? 'Leave Guild' : 'Join Guild'}
                    </button>
                </div>
            </div>
        </div>
    );
};