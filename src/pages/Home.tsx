import { HomeHeader } from '../components/home/HomeHeader.tsx'
import { Bookshelf } from '../components/home/BookShelf.tsx'

export default function Home() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <HomeHeader />

            <main className="my-auto">
                <Bookshelf />
            </main>
        </div>
    )
}