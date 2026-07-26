// src/pages/AddBook.tsx
import { useNavigate } from 'react-router-dom';
import { AddBookForm } from '../components/library/AddBookForm';

export function AddBook() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-8 w-full">
        {/* Header */}
            <div className="bg-card/40 border border-line/60 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🖋️</span>
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl hero-title
                        font-display font-bold text-ink">
                            Record a New Tome
                        </h1>
                        <p className="text-xs text-muted mt-1">
                            Manually catalogue a new book into your personal database and track your reading journey.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-card/80 border border-line rounded-2xl p-6 sm:p-8 shadow-sm backdrop-blur-md">
                <AddBookForm
                    onSuccess={() => {
                        // 录入成功后自动跳回图鉴
                        navigate('/library');
                    }}
                />
            </div>
        </div>
    );
}