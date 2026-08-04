// src/components/clubs/ClubDetailPanel.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/useAuth';
import type { ClubWithMembership } from '../../types/club';

interface ClubDetailPanelProps {
    club: ClubWithMembership;
    onClose: () => void;
    onToggleMembership: (clubId: string, isMember: boolean) => void;
}

export const ClubDetailPanel: React.FC<ClubDetailPanelProps> = ({ club, onClose, onToggleMembership }) => {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const { user } = useAuth();

    // 获取这个俱乐部的评论
    useEffect(() => {
        const fetchComments = async () => {
            setLoadingComments(true);
            const { data } = await supabase
                .from('club_comments')
                .select('*, profiles(username)') // 假设你有个 profiles 表存用户名
                .eq('club_id', club.id)
                .order('created_at', { ascending: false });
            setComments(data || []);
            setLoadingComments(false);
        };
        fetchComments();
    }, [club.id]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;
        await supabase.from('club_comments').insert({
            club_id: club.id,
            user_id: user.id,
            content: newComment.trim()
        });
        setNewComment('');
        // 重新刷新评论
        const { data } = await supabase.from('club_comments').select('*, profiles(username)').eq('club_id', club.id).order('created_at', { ascending: false });
        setComments(data || []);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end animate-in slide-in-from-right duration-300">
            {/* 遮罩层 */}
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

            {/* 面板内容 */}
            <div className="relative w-full max-w-xl bg-card border-l border-line h-full shadow-2xl flex flex-col p-6 overflow-hidden">
                <div className="flex justify-between items-center border-b border-line/30 pb-4 shrink-0">
                    <div>
                        <h2 className="font-display font-bold text-xl text-ink">{club.name}</h2>
                        <p className="text-[11px] font-mono text-muted">{club.is_admin ? 'You are the Admin' : (club.is_member ? 'Member' : 'Not Joined')}</p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-ink text-2xl transition-colors">✕</button>
                </div>

                {/* 详情与讨论区 (滚动) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-6">
                    <div className="bg-bg2/50 border border-line/30 rounded-xl p-4">
                        <h4 className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">Guild Description</h4>
                        <p className="text-sm text-ink font-body mt-1 leading-relaxed">{club.description || 'The guild awaits its story...'}</p>
                        <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono text-muted">
                            <span>👥 {club.member_count} Members</span>
                            <span>•</span>
                            <span>📅 {club.meeting_schedule || 'No set schedule'}</span>
                        </div>

                        {/* 加入/退出按钮 (操作分离) */}
                        <div className="mt-4 pt-3 border-t border-line/20 flex justify-end">
                            <button
                                onClick={() => onToggleMembership(club.id, club.is_member)}
                                className={`px-4 py-2 text-[11px] font-mono font-bold rounded-xl transition-all border ${
                                    club.is_member
                                        ? 'bg-bg2 border-line/60 text-muted hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400'
                                        : 'bg-primary border-primary text-on-primary hover:opacity-80 shadow-md shadow-primary/20'
                                }`}
                            >
                                {club.is_member ? '🚪 Leave Guild' : '✚ Join Guild'}
                            </button>
                        </div>
                    </div>

                    {/* 评论/讨论墙 */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider">Discussion Board</h4>

                        {loadingComments ? (
                            <div className="text-center text-xs text-muted py-4 animate-pulse">Loading conversations...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-xs text-muted py-6 border border-line/20 border-dashed rounded-xl">No posts yet. Start the discussion!</div>
                        ) : (
                            comments.map((c) => (
                                <div key={c.id} className="bg-bg2/30 border border-line/20 rounded-xl p-3.5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-mono font-bold text-primary">
                                            {c.profiles?.username || 'Anonymous Reader'}
                                        </span>
                                        <span className="text-[9px] font-mono text-muted/60">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-ink leading-relaxed font-body">{c.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 底部输入框 (只对加入的成员开放) */}
                <div className="shrink-0 pt-4 border-t border-line/30">
                    {club.is_member ? (
                        <form onSubmit={handlePostComment} className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts on the book..."
                                className="flex-1 bg-bg2 border border-line/60 rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-all"
                            />
                            <button type="submit" disabled={!newComment.trim()} className="px-4 py-2.5 bg-primary text-on-primary text-xs font-mono font-bold rounded-xl hover:opacity-80 disabled:opacity-40 transition-all">Post</button>
                        </form>
                    ) : (
                        <div className="text-center text-[10px] font-mono text-muted bg-bg2/50 border border-line/30 rounded-xl py-3">
                            ✦ Join this guild to participate in the discussion.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};