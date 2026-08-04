// src/components/layout/Nav.tsx
import { NavLink } from 'react-router-dom';

interface NavProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Nav({ isCollapsed, onToggle }: NavProps) {
    const navItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Library', icon: '📚' },
        { name: 'Shelves', icon: '📖' },
        { name: 'Planner', icon: '📅' },
        { name: 'Tropes', icon: '🎭' },
        { name: 'Stats', icon: '📊' },
        { name: 'Match', icon: '🎯' },
        { name: 'Discover', icon: "🎈" },
        { name: 'Clubs', icon: '🏛️' }
    ];

    const functionButtons = [
        {
            name: 'AddBook',
            path: '/addBook',
            icon: '+',
            activeBorder: 'border-primary',
            activeText: 'text-primary',
            hoverBorder: 'hover:border-primary/50',
            hoverText: 'hover:text-primary',
            glowColor: 'var(--primary)',
        },
        {
            name: 'Theme',
            path: '/theme',
            icon: '◐',
            activeBorder: 'border-tertiary',
            activeText: 'text-tertiary',
            hoverBorder: 'hover:border-tertiary/50',
            hoverText: 'hover:text-tertiary',
            glowColor: 'var(--tertiary)',
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: '⚙',
            activeBorder: 'border-muted',
            activeText: 'text-muted',
            hoverBorder: 'hover:border-muted/60',
            hoverText: 'hover:text-ink',
            glowColor: 'var(--muted)',
        },
    ];

    return (
        /* 💡 改造 1：外层使用 aside 作为定位容器（不加 overflow-hidden），防止按钮在折叠时被裁剪或透明 */
        <aside className="sticky top-0 h-screen shrink-0 z-50">
            {/* 💡 侧边栏主体：继续保留 w-0, opacity-0 与 overflow-hidden 来优雅隐藏菜单项 */}
            <nav
                className={`h-full bg-bg/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
                    isCollapsed
                        ? 'w-0 px-0 opacity-0 overflow-hidden border-none'
                        : 'w-64 px-8 border-r border-line'
                }`}
            >
                {/* 上半部分：可滚动的导航链接 */}
                <div className="flex flex-col gap-3 w-full overflow-y-auto max-h-[50vh] no-scrollbar items-center">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`}
                            className={({ isActive }) =>
                                `group relative flex items-center justify-center px-2 py-1.5 transition-all 
        duration-300 whitespace-nowrap font-[family-name:var(--font-serif-fancy)] tracking-wider ${
                                    isActive ? 'text-primary font-bold' : 'text-muted hover:text-primary/90'
                                } ${isCollapsed ? 'justify-center' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`transition-opacity duration-300 font-light 
                        text-xs md:text-sm ${
                                            isActive
                                                ? 'opacity-80 text-primary'
                                                : 'opacity-30 group-hover:opacity-70'
                                        }`}
                                    >
                                        [
                                    </span>
                                    <div
                                        className={`flex items-center justify-center mx-1 md:mx-1.5 
                        transition-all duration-300 ${
                                            isCollapsed
                                                ? 'w-0 opacity-0 overflow-hidden'
                                                : 'w-[90px] md:w-[100px]'
                                        }`}
                                    >
                                        <span
                                            style={{
                                                filter: isActive
                                                    ? `drop-shadow(0 0 5px color-mix(in srgb, var(--primary) 60%, transparent))`
                                                    : undefined,
                                            }}
                                            className="hidden md:inline-block shrink-0 text-xs md:text-sm transition-all duration-300"
                                        >
                                            {item.icon}
                                        </span>

                                        <span
                                            style={{
                                                filter: isActive
                                                    ? `drop-shadow(0 0 5px color-mix(in srgb, var(--primary) 60%, transparent))`
                                                    : undefined,
                                            }}
                                            className={`text-center transition-all duration-300 text-[10px] md:text-xs ${
                                                isCollapsed
                                                    ? 'w-0 opacity-0 overflow-hidden'
                                                    : 'flex-1'
                                            } ${isActive ? 'font-bold' : 'font-normal'}`}
                                        >
                                            {item.name}
                                        </span>
                                    </div>

                                    <span
                                        className={`transition-opacity duration-300 font-light 
                        text-xs md:text-sm ${
                                            isActive
                                                ? 'opacity-80 text-primary'
                                                : 'opacity-30 group-hover:opacity-70'
                                        }`}
                                    >
                                        ]
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* 下半部分：功能区 */}
                <div
                    className={`flex flex-col w-full transition-all duration-500 mt-3 ${
                        isCollapsed ? 'items-center gap-4' : 'items-center gap-3'
                    }`}
                >
                    <div className="relative w-full h-[1px] min-h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent shrink-0 mb-3">
                        <div className="absolute left-1/2 -top-[3px] -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-bg border border-amber-400/50 shadow-[0_0_5px_rgba(232,163,61,0.4)]"></div>
                    </div>

                    {functionButtons.map((btn) => (
                        <NavLink
                            key={btn.name}
                            to={btn.path}
                            className={`w-full flex justify-center text-center ${isCollapsed ? '' : 'px-3'}`}
                        >
                            {({ isActive }) => (
                                <div
                                    className={`flex items-center border rounded-xl transition-all duration-300
                    text-xs font-[family-name:var(--font-serif-fancy)] tracking-wider whitespace-nowrap overflow-hidden
                    justify-center
                    ${isCollapsed
                                        ? 'w-10 h-10 p-0 rounded-full'
                                        : ' w-full max-w-[180px] px-3 py-2'
                                    }
                    ${
                                        isActive
                                            ? `${btn.activeBorder} ${btn.activeText} bg-card shadow-[inset_0_1px_rgba(255,255,255,0.1)]`
                                            : `border-line text-muted bg-card/50 ${btn.hoverBorder} ${btn.hoverText} hover:bg-card hover:shadow-md`
                                    }`}
                                >
                                    <span
                                        className={`shrink-0 transition-all duration-300 flex items-center justify-center ${
                                            isActive ? 'scale-110 drop-shadow-md' : ''
                                        } ${isCollapsed ? 'text-lg' : 'text-base mr-3'}`}
                                    >
                                        {btn.icon}
                                    </span>

                                    <span
                                        className={`transition-all duration-300 ${
                                            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                        } ${isActive ? 'font-bold' : 'font-medium'}`}
                                    >
                                        {btn.name}
                                    </span>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* 💡 改造 2：折叠按钮作为 nav 的兄弟元素放在 aside 内部。
                 通过动态 left 属性（展开时 left-52 即底部右侧，折叠时 left-4 即屏幕左下角），
                 能够和侧边栏 duration-500 展开动画实现 100% 同步的完美丝滑平移！ */}
            <button
                onClick={onToggle}
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className={`absolute bottom-4 z-50 p-2 rounded-md transition-all duration-500 backdrop-blur-md
                    ${isCollapsed ? 'left-4' : 'left-52'}
                    opacity-30 bg-transparent border border-transparent text-ink
                    hover:opacity-100 hover:bg-card/80 hover:border-line hover:text-primary hover:shadow-md`}
            >
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    {!isCollapsed && <line x1="9" y1="3" x2="9" y2="21"></line>}
                </svg>
            </button>
        </aside>
    );
}