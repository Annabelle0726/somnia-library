// src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import { Background } from './Background';
import { Footer } from './Footer';
import { Nav } from './Nav';
import { useState } from 'react';

export function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="relative bg-bg min-h-screen flex flex-row font-body text-ink">
            <Background />

            {/* 💡 关键修改 1：将 onToggle 传递给 Nav 组件 */}
            <Nav isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

            {/* 右侧内容区 */}
            <div className="relative z-10 w-full flex-1 flex flex-col h-screen overflow-y-auto">
                {/* 💡 关键修改 2：删除了原本在 Layout 里的 <button>，由 Nav 内部统筹渲染折叠按钮 */}
                <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6 sm:px-12">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}