import { HomeHeader } from '../components/home/HomeHeader.tsx'
import { Bookshelf } from '../components/home/BookShelf.tsx'

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