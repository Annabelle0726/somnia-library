import { Outlet } from 'react-router-dom';
import { Background } from './Background';
import { Footer } from './Footer';
import { Nav } from './Nav';
import { useState } from 'react';

export function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        /* 1. 修改：bg-theme-bg0 -> bg-bg, text-theme-ink -> text-ink, font-serif -> font-body */
        <div className="relative bg-bg min-h-screen flex flex-row font-body text-ink">
            <Background />

            {/* 侧边栏 */}
            <Nav isCollapsed={isCollapsed} />

            {/* 右侧内容区 */}
            {/* 💡 关键修改：删除了 no-scrollbar，以便展示我们刚才配置的魔法渐变滚动条 */}
            <div className="relative z-10 w-full flex-1 flex flex-col h-screen overflow-y-auto">

                {/* ✨ 极简折叠按钮，固定在左下方 */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    /* 2. 修改：更新了按钮悬浮态的色值类名 (text-ink, hover:bg-card/80, hover:border-line, hover:text-primary) */
                    className="absolute bottom-4 left-4 z-20 p-2 rounded-md transition-all duration-300 backdrop-blur-md
        /* 🌑 默认（不活跃）状态 */
        opacity-30 bg-transparent border border-transparent text-ink
        /* 🌟 悬浮（活跃）状态 */
        hover:opacity-100 hover:bg-card/80 hover:border-line hover:text-primary hover:shadow-md"
                >
                    {/* 绝美的极简 SVG 侧边栏图标 */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-300"
                    >
                        {/* 外边框 */}
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        {/* 如果没有折叠，显示侧边栏的分割线；如果折叠了，就变成一个空心方块 */}
                        {!isCollapsed && <line x1="9" y1="3" x2="9" y2="21"></line>}
                    </svg>
                </button>

                <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6 sm:px-12">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}