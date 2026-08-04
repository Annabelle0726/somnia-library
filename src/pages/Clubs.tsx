// src/pages/Clubs.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from "../auth/useAuth.ts";
import { ClubFilters } from '../components/clubs/ClubFilters';
import { ClubCard } from '../components/clubs/ClubCard';
import { CreateClubModal } from '../components/clubs/CreateClubModal';
import { ClubDetailPanel } from '../components/clubs/ClubDetailPanel';
import type { ClubWithMembership } from "../types/club.ts";

export function Clubs() {
    const [clubs, setClubs] = useState<ClubWithMembership[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'my'>('all');

    // 💡 核心状态：选中的俱乐部（用于弹出详情面板）
    const [selectedClub, setSelectedClub] = useState<ClubWithMembership | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { user } = useAuth();
    const userId = user?.id;

    const fetchClubs = useCallback(async () => {
        setLoading(true);
        try {
            // 1. 获取所有俱乐部（包含已加入的成员用户ID）
            let query = supabase.from('clubs').select('*, club_members!left(user_id)');

            // 2. 搜索过滤
            if (searchQuery.trim()) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            const { data: allClubs, error: clubsError } = await query.order('created_at', { ascending: false });

            if (clubsError) throw clubsError;
            if (!allClubs) {
                setClubs([]);
                return;
            }

            // 3. 获取当前用户的加入状态
            let userClubIds = new Set();
            if (userId) {
                const { data: memberData } = await supabase
                    .from('club_members')
                    .select('club_id')
                    .eq('user_id', userId);
                userClubIds = new Set(memberData?.map(m => m.club_id) || []);
            }

            // 4. 组装数据
            const formattedClubs: ClubWithMembership[] = allClubs.map((club: any) => ({
                ...club,
                is_member: userClubIds.has(club.id),
                is_admin: club.created_by === userId,
                member_count: club.club_members?.length || 0
            }));

            // 5. 根据 "My Guilds" 选项卡过滤
            if (filterType === 'my') {
                setClubs(formattedClubs.filter(c => c.is_member));
            } else {
                setClubs(formattedClubs);
            }
        } catch (err) {
            console.error('Error fetching clubs:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, searchQuery, filterType]);

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    // 处理加入/退出逻辑 (提取出来供卡片和详情面板复用)
    const handleMembershipToggle = async (clubId: string, isMember: boolean) => {
        if (!userId) return alert('Please sign in to join a guild.');

        if (isMember) {
            // 退出俱乐部
            await supabase.from('club_members').delete().match({ club_id: clubId, user_id: userId });
        } else {
            // 加入俱乐部
            await supabase.from('club_members').insert({ club_id: clubId, user_id: userId });
        }
        fetchClubs(); // 刷新数据
    };

    return (
        <div className="flex flex-col h-full w-full p-4 md:p-6 bg-bg gap-4">
            {/* 头部 Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-line/30 pb-4 mb-1 shrink-0">
                <div>
                    <h1 className="font-display font-bold text-2xl text-ink hero-title">
                        Literary Guilds
                    </h1>
                    <p className="text-xs font-mono text-muted mt-0.5">
                        Connect with fellow bookworms and discuss your next obsession
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-3 sm:mt-0 px-5 py-2 bg-primary text-on-primary text-xs font-mono font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    ✦ Found a Guild
                </button>
            </div>

            {/* 过滤器与搜索栏 (Control Panel) */}
            <ClubFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterType={filterType}
                setFilterType={setFilterType}
            />

            {/* 主内容区 (Grid 列表，限制内部滚动) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full gap-3 text-muted">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-mono animate-pulse">Summoning Guilds...</span>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50%] bg-card/30 border border-line/40 rounded-2xl p-12 text-center gap-2">
                        <span className="text-4xl">📜</span>
                        <h3 className="font-display text-base text-ink font-bold">No guilds found</h3>
                        <p className="text-[11px] font-mono text-muted max-w-sm">
                            {filterType === 'my'
                                ? "You haven't joined any guilds yet. Explore the 'All Guilds' tab to find your circle."
                                : "Create the first guild to gather your literary companions."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {clubs.map((club) => (
                            <ClubCard
                                key={club.id}
                                club={club}
                                onToggleMembership={handleMembershipToggle}
                                // 💡 核心交互：点击卡片时，打开详情面板
                                onViewDetail={() => setSelectedClub(club)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 创建俱乐部模态框 */}
            {isCreateModalOpen && (
                <CreateClubModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchClubs}
                />
            )}

            {/* 💡 核心新增：弹出的俱乐部详情面板 (Drawer) */}
            {selectedClub && (
                <ClubDetailPanel
                    club={selectedClub}
                    onClose={() => setSelectedClub(null)}
                    onToggleMembership={handleMembershipToggle}
                />
            )}
        </div>
    );
}