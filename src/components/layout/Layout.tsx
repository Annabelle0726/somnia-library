// src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import { Background } from './Background';
import { Footer } from './Footer';
import { Nav } from './Nav';
import { useState } from 'react';

// 🔥 改为 export default function
export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="relative bg-bg min-h-screen flex flex-row font-body text-ink">
            <Background />

            <Nav
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
                onMobileOpen={() => setIsMobileOpen(true)}
            />

            <div className="relative z-10 w-full flex-1 flex flex-col h-screen overflow-y-auto">
                <main className="flex-1 max-w-5xl mx-auto w-full py-6 px-6 sm:px-12">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}