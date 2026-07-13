import { Header } from '../components/layout/Header'
import { Bookshelf } from '../components/features/BookShelf'

export default function Home() {
    return (
        <div className="flex flex-col gap-12">
            {/* 这里的 Header 就是你截图里那个 "Good evening" 的大横幅对吧？ */}
            <Header />

            <main className="my-auto">
                {/* 以后如果你想加 "Recent Stats" 组件，直接在这里往下加即可 */}
                <Bookshelf />
            </main>
        </div>
    )
}