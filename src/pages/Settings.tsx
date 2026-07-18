import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function Settings() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/Welcome');
    };

    return (
        <div className="max-w-3xl mx-auto p-8">

            {/* Account */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">
                    Account
                </h2>

                <button
                    onClick={handleLogout}
                    className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                    Logout
                </button>
            </section>

        </div>
    );
}