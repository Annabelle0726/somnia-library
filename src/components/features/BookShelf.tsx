import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { BookSpine } from './BookSpine'

interface Book {
    id: string
    title: string
    spice_level: number
    fave: boolean
}

export function Bookshelf() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBooks() {
            const { data } = await supabase.from("books").select('id, title, spice_level, fave')
            if (data) setBooks(data as Book[])
            setLoading(false)
        }
        fetchBooks()
    }, [])

    const totalBooks = books.length
    const faveBooks = books.filter(book => book.fave).length

    return (
        <div className="flex flex-col gap-8 w-full">

            {/* ====== ✨ 图书馆控制面板（优化后） ====== */}
            <div>
                {/*
                  1. 面板背景改用渐变 + 更深磨砂，增加立体感
                  2. 边框变细但保留金色半透明，并加上微光阴影
                */}
                <div className="relative w-full
                    bg-gradient-to-br from-theme-bg2/40 via-theme-bg0/30 to-theme-bg1/20
                    backdrop-blur-lg
                    border border-theme-gold/20
                    rounded-sm
                    p-6
                    shadow-[0_8px_30px_rgba(0,0,0,0.25),0_0_20px_rgba(240,177,78,0.08)]
                    flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    {/* 四角装饰：稍微加大，加发光 */}
                    <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-theme-gold/60 rotate-45 shadow-[0_0_6px_rgba(240,177,78,0.6)]" />
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-theme-gold/60 rotate-45 shadow-[0_0_6px_rgba(240,177,78,0.6)]" />
                    <div className="absolute bottom-1.5 left-1.5 w-2 h-2 bg-theme-gold/60 rotate-45 shadow-[0_0_6px_rgba(240,177,78,0.6)]" />
                    <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-theme-gold/60 rotate-45 shadow-[0_0_6px_rgba(240,177,78,0.6)]" />

                    {/* 中间细金线装饰（左右各一条） */}
                    <div className="hidden sm:block absolute top-1/2 left-4 right-4 h-px bg-gradient-to-r from-transparent via-theme-gold/30 to-transparent -translate-y-1/2 pointer-events-none" />

                    {/* 左侧：数据统计 */}
                    <div className="flex items-center gap-3 z-10">
                        {/* Books 徽章 */}
                        <div className="group flex items-center gap-2 px-3 py-1.5
                            border border-theme-gold/40
                            bg-theme-bg0/60 backdrop-blur-sm
                            text-xs font-serif text-theme-ink tracking-wide
                            transition-all duration-300
                            hover:bg-theme-gold/10 hover:border-theme-gold/60
                            hover:shadow-[0_0_10px_rgba(240,177,78,0.2)]"
                        >
                            <span className="text-theme-gold text-[10px] group-hover:scale-110 transition-transform">♦</span>
                            <span className="font-bold text-sm font-mono text-theme-ink/90">{loading ? '-' : totalBooks}</span>
                            <span className="text-theme-ink/70">books</span>
                        </div>

                        {/* Faves 徽章 */}
                        <div className="group flex items-center gap-2 px-3 py-1.5
                            border border-theme-primary/30
                            bg-theme-bg0/60 backdrop-blur-sm
                            text-xs font-serif text-theme-ink tracking-wide
                            transition-all duration-300
                            hover:bg-theme-primary/10 hover:border-theme-primary/50
                            hover:shadow-[0_0_10px_rgba(232,58,120,0.2)]"
                        >
                            <span className="text-theme-primary text-[10px] group-hover:scale-110 transition-transform">♥</span>
                            <span className="font-bold text-sm font-mono text-theme-ink/90">{loading ? '-' : faveBooks}</span>
                            <span className="text-theme-ink/70">faves</span>
                        </div>
                    </div>

                    {/* 右侧：功能按钮 */}
                    <div className="flex flex-col items-center sm:items-end gap-3 z-10">
                        {/* Find my next read */}
                        <button className="group flex items-center gap-2 px-6 py-2
                            bg-theme-primary/90 hover:bg-theme-primary
                            border border-theme-primary/60
                            text-white text-sm font-serif tracking-wider
                            shadow-[0_0_15px_rgba(232,58,120,0.25)]
                            hover:shadow-[0_0_25px_rgba(232,58,120,0.5)]
                            transition-all duration-300
                            rounded-sm"
                        >
                            <span className="group-hover:scale-110 transition-transform">💘</span>
                            Find my next read
                        </button>

                        {/* Surprise me */}
                        <button className="group flex items-center gap-2 px-4 py-1
                            text-xs font-serif
                            text-theme-ink/60 hover:text-theme-primary/90
                            transition-all duration-300
                            border-b border-theme-ink/20 hover:border-theme-primary/60
                            pb-1"
                        >
                            <span className="group-hover:rotate-12 transition-transform opacity-70">🎲</span>
                            Surprise me
                        </button>
                    </div>
                </div>
            </div>

            {/* ====== 书籍展示区（保持原样，仅微调间距） ====== */}
            <div className="flex justify-center mt-2 items-center">
                {loading ? (
                    <div className="w-full flex flex-col items-center justify-center py-4 gap-2">
                        <div className="w-6 h-6 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
                        <p className="animate-pulse text-xs italic font-[family-name:var(--font-mono)] tracking-widest">
                            Whispering to the vault...
                        </p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="w-full text-center py-3 select-none">
                        <p className="font-[family-name:var(--font-decorative)] text-sm md:text-base text-ink/80 text-center tracking-widest">
                            "Mark a book{" "}
                            <span className="font-[family-name:var(--font-italic-fancy)] text-[var(--primary)]">
        'Reading'
      </span>{" "}
                            and your home comes alive."
                        </p>
                    </div>
                ) : (
                    <div className="flex items-end gap-3 px-2 overflow-x-auto max-w-full no-scrollbar pb-2">
                        {books.map((book) => (
                            <BookSpine key={book.id} title={book.title} spiceLevel={book.spice_level} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}