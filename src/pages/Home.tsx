import { HomeHeader } from '../components/layout/HomeHeader.tsx'
import { Bookshelf } from '../components/BookShelf.tsx'

export default function Home() {
    return (
        <div className="flex flex-col gap-12">
            <HomeHeader />

            <main className="my-auto">
                <Bookshelf />
            </main>
        </div>
    )
}