import { Outlet } from 'react-router-dom';
import { Background } from './Background';
import { Footer } from './Footer';
import { Nav } from './Nav';
import { useState } from 'react';

export function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="relative bg-theme-bg0 min-h-screen flex flex-row font-serif text-theme-ink">
            <Background />

            {/* 侧边栏，继续由 isCollapsed 控制 */}
            <Nav isCollapsed={isCollapsed} />

            {/* 右侧内容区 */}
            <div className="relative z-10 w-full flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar">

                {/* ✨ 极简折叠按钮，固定在左下方 */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    // 将样式拆分为“默认状态”和“悬浮状态”，使其对比更明显
                    className="absolute bottom-4 left-4 z-20 p-2 rounded-md transition-all duration-300 backdrop-blur-md
        /* 🌑 默认（不活跃）状态：极低透明度，隐藏背景和边框，融入环境 */
        opacity-30 bg-transparent border border-transparent text-theme-ink
        /* 🌟 悬浮（活跃）状态：恢复 100% 透明度，显示磨砂背景、边框和阴影，图标变主题色 */
        hover:opacity-100 hover:bg-theme-bg0/80 hover:border-theme-line/30 hover:text-theme-primary hover:shadow-md"
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