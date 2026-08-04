import  { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import toast from 'react-hot-toast';
import type { BookRow } from '../types/book';
import { TropeSelector } from '../components/tropes/TropeSelector';
// import { TropeButton } from '../components/tropes/TropeButton';

type DropdownBook = Pick<BookRow, 'id' | 'title' | 'author'>;

interface Trope {
    id: string;
    name: string;
    description: string;
}

export function Tropes() {
    const { user } = useAuth();
    const [books, setBooks] = useState<DropdownBook[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [allTropes, setAllTropes] = useState<Trope[]>([]);
    const [appliedTropeIds, setAppliedTropeIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // 1. 初始化数据
    useEffect(() => {
        if (!user) return;

        const initData = async () => {
            setLoading(true);
            try {
                const [{ data: booksData, error: booksErr }, { data: tropesData, error: tropesErr }] = await Promise.all([
                    supabase.from('books').select('id, title, author').order('created_at', { ascending: false }),
                    supabase.from('tropes').select('*').order('name', { ascending: true })
                ]);

                if (booksErr) throw booksErr;
                if (tropesErr) throw tropesErr;

                setBooks(booksData || []);
                setAllTropes(tropesData || []);
            } catch (err) {
                console.error('Initialization error:', err);
                toast.error('Failed to load library data.');
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [user]);

    // 2. 监听所选图书，获取已绑定的 Tropes
    useEffect(() => {
        if (!user || !selectedBookId) {
            setAppliedTropeIds(new Set());
            return;
        }

        const fetchAppliedTropes = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_book_tropes')
                    .select('trope_id')
                    .eq('user_id', user.id)
                    .eq('book_id', selectedBookId);

                if (error) throw error;
                setAppliedTropeIds(new Set(data.map(row => row.trope_id)));
            } catch (err) {
                console.error('Failed to fetch applied tropes:', err);
            }
        };

        fetchAppliedTropes();
    }, [user, selectedBookId]);

    // 3. 点击切换绑定状态 (带 Toast 强约束)
    const handleToggleTrope = async (tropeId: string) => {
        if (!user) return;
        if (!selectedBookId) {
            toast.error('Please select a book first to tag tropes.', {
                icon: '📖',
                style: { borderRadius: '12px', background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)' },
            });
            return;
        }

        const isApplied = appliedTropeIds.has(tropeId);

        // 乐观 UI 更新
        setAppliedTropeIds(prev => {
            const next = new Set(prev);
            isApplied ? next.delete(tropeId) : next.add(tropeId);
            return next;
        });

        try {
            if (isApplied) {
                await supabase.from('user_book_tropes').delete()
                    .eq('user_id', user.id).eq('book_id', selectedBookId).eq('trope_id', tropeId);
            } else {
                await supabase.from('user_book_tropes').insert({ user_id: user.id, book_id: selectedBookId, trope_id: tropeId });
            }
        } catch (err) {
            console.error('Failed to toggle trope:', err);
            toast.error('Failed to update trope.');
            // 回滚 UI
            setAppliedTropeIds(prev => {
                const next = new Set(prev);
                isApplied ? next.add(tropeId) : next.delete(tropeId);
                return next;
            });
        }
    };

    // 4. 按 description 分组
    const categorizedTropes = useMemo(() => {
        return allTropes.reduce((acc, t) => {
            const groupKey = t.description || 'General';
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(t);
            return acc;
        }, {} as Record<string, Trope[]>);
    }, [allTropes]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono animate-pulse tracking-widest">Summoning The Lexicon...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full min-h-[calc(100vh-80px)] bg-bg gap-6 overflow-hidden">
            {/* 头部 */}
            <div className="shrink-0 border-b border-line/30 pb-4 pt-2">
                <h1 className="text-3xl font-display font-bold italic tracking-tight hero-title text-ink flex items-center gap-3">
                    The Lexicon <span className="text-xs text-muted font-normal not-italic font-mono border border-line/50 px-3 py-1 rounded-full bg-card/30">✦ Tag Engine</span>
                </h1>
                <p className="text-muted text-sm mt-1 font-body">
                    Select a book from your library to map its DNA. Curate your collection by assigning tropes and themes.
                </p>
            </div>

            {/* 核心双栏布局 (绝对无外部滚动条) */}
            <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden pb-4">

                {/* 左侧画布 (Sticky 悬浮) */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <TropeSelector
                        books={books}
                        selectedBookId={selectedBookId}
                        setSelectedBookId={setSelectedBookId}
                        appliedTropeIds={appliedTropeIds}
                        allTropes={allTropes}
                        onToggleTrope={handleToggleTrope}
                    />
                </div>

                {/* 右侧词典瀑布流 (独立内部滚动，完全展示所有 Tropes) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
                    <div className="space-y-10">
                        {Object.entries(categorizedTropes).length > 0 ? (
                            Object.entries(categorizedTropes).map(([groupName, tropes]) => (
                                <section key={groupName} className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                                    <div className="flex items-center gap-4 mb-4">
                                        <h3 className="text-lg font-display italic text-ink font-medium tracking-tight">{groupName}</h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-line/60 to-transparent"></div>
                                        <span className="text-[10px] font-mono text-muted/50">{tropes.length} tags</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2.5">
                                        {tropes.map((trope) => {
                                            const isApplied = appliedTropeIds.has(trope.id);
                                            const isDisabled = !selectedBookId; // 核心逻辑：未选书则禁用

                                            return (
                                                <button
                                                    key={trope.id}
                                                    onClick={() => handleToggleTrope(trope.id)}
                                                    disabled={isDisabled}
                                                    className={`
                                                        relative px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border
                                                        ${isDisabled
                                                        ? 'cursor-not-allowed opacity-40 border-line/40 text-muted/40'
                                                        : isApplied
                                                            ? 'bg-tertiary border-tertiary text-bg shadow-md shadow-tertiary/20 scale-95 hover:scale-100 hover:bg-tertiary/90'
                                                            : 'bg-transparent border-line/60 text-ink/70 hover:border-tertiary/60 hover:text-ink hover:bg-card hover:shadow-md hover:-translate-y-0.5'
                                                    }
                                                    `}
                                                >
                                                    {trope.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted/50 italic font-body text-sm">
                                No tropes found in the Lexicon. Please run the SQL insert script.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}