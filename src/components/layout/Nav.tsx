// src/components/layout/Nav.tsx
import { NavLink } from 'react-router-dom';

interface NavProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function Nav({ isCollapsed, onToggle, isMobileOpen = false, onMobileClose }: NavProps) {
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
        },
        {
            name: 'Theme',
            path: '/theme',
            icon: '◐',
            activeBorder: 'border-tertiary',
            activeText: 'text-tertiary',
            hoverBorder: 'hover:border-tertiary/50',
            hoverText: 'hover:text-tertiary',
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: '⚙',
            activeBorder: 'border-muted',
            activeText: 'text-muted',
            hoverBorder: 'hover:border-muted/60',
            hoverText: 'hover:text-ink',
        },
    ];

    const handleNavClick = () => {
        if (onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <>
            {/* 📱 移动端抽屉遮罩 (Overlay) */}
            {isMobileOpen && (
                <div
                    onClick={onMobileClose}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
                />
            )}

            {/* 侧边栏容器 */}
            <aside
                className={`fixed md:sticky top-0 h-screen shrink-0 z-50 transition-transform duration-300 ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <nav
                    className={`h-full bg-bg/95 md:bg-bg/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
                        isCollapsed
                            ? 'w-64 md:w-0 md:px-0 md:opacity-0 md:overflow-hidden md:border-none'
                            : 'w-64 px-6 border-r border-line shadow-2xl md:shadow-none'
                    }`}
                >
                    {/* 移动端抽屉顶部关闭按钮 */}
                    <div className="w-full flex items-center justify-between md:hidden mb-4 pb-2 border-b border-line/40">
                        <span className="font-display font-bold italic text-ink text-base">Menu</span>
                        <button
                            onClick={onMobileClose}
                            className="p-1 text-muted hover:text-ink rounded-lg bg-card/60 border border-line"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 💡 关键修改：允许纵向滚动 (overflow-y-auto)，但隐藏粗丑滚动条 [scrollbar-width:none] */}
                    <div className="flex flex-col gap-2.5 w-full max-h-[300px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden items-center py-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `group relative flex items-center justify-center px-2 py-1.5 transition-all 
            duration-300 whitespace-nowrap font-[family-name:var(--font-serif-fancy)] tracking-wider ${
                                        isActive ? 'text-primary font-bold' : 'text-muted hover:text-primary/90'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={`transition-opacity duration-300 font-light text-xs md:text-sm ${
                                            isActive ? 'opacity-80 text-primary' : 'opacity-30 group-hover:opacity-70'
                                        }`}>
                                            [
                                        </span>
                                        <div className="flex items-center justify-center mx-1.5 w-[100px]">
                                            <span
                                                style={{
                                                    filter: isActive
                                                        ? `drop-shadow(0 0 5px color-mix(in srgb, var(--primary) 60%, transparent))`
                                                        : undefined,
                                                }}
                                                className="shrink-0 text-xs md:text-sm mr-1.5 transition-all duration-300"
                                            >
                                                {item.icon}
                                            </span>

                                            <span
                                                style={{
                                                    filter: isActive
                                                        ? `drop-shadow(0 0 5px color-mix(in srgb, var(--primary) 60%, transparent))`
                                                        : undefined,
                                                }}
                                                className={`text-center transition-all duration-300 text-xs ${
                                                    isActive ? 'font-bold' : 'font-normal'
                                                }`}
                                            >
                                                {item.name}
                                            </span>
                                        </div>

                                        <span className={`transition-opacity duration-300 font-light text-xs md:text-sm ${
                                            isActive ? 'opacity-80 text-primary' : 'opacity-30 group-hover:opacity-70'
                                        }`}>
                                            ]
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* 下半部分功能按钮 */}
                    <div className="flex flex-col w-full transition-all duration-500 mt-3 items-center gap-3">
                        <div className="relative w-full h-[1px] min-h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent shrink-0 mb-1">
                            <div className="absolute left-1/2 -top-[3px] -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-bg border border-amber-400/50 shadow-[0_0_5px_rgba(232,163,61,0.4)]"></div>
                        </div>

                        {functionButtons.map((btn) => (
                            <NavLink
                                key={btn.name}
                                to={btn.path}
                                onClick={handleNavClick}
                                className="w-full flex justify-center text-center px-2"
                            >
                                {({ isActive }) => (
                                    <div
                                        className={`flex items-center border rounded-xl transition-all duration-300
                        text-xs font-[family-name:var(--font-serif-fancy)] tracking-wider whitespace-nowrap overflow-hidden
                        justify-center w-full max-w-[180px] px-3 py-1.5
                        ${
                                            isActive
                                                ? `${btn.activeBorder} ${btn.activeText} bg-card shadow-[inset_0_1px_rgba(255,255,255,0.1)]`
                                                : `border-line text-muted bg-card/50 ${btn.hoverBorder} ${btn.hoverText} hover:bg-card hover:shadow-md`
                                        }`}
                                    >
                                        <span className={`shrink-0 transition-all duration-300 flex items-center justify-center mr-3 ${
                                            isActive ? 'scale-110 drop-shadow-md' : ''
                                        }`}>
                                            {btn.icon}
                                        </span>

                                        <span className={`transition-all duration-300 ${
                                            isActive ? 'font-bold' : 'font-medium'
                                        }`}>
                                            {btn.name}
                                        </span>
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* 桌面端折叠切换按钮 */}
                <button
                    onClick={onToggle}
                    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    className={`hidden md:block absolute bottom-4 z-50 p-2 rounded-md transition-all duration-500 backdrop-blur-md
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
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        {!isCollapsed && <line x1="9" y1="3" x2="9" y2="21"></line>}
                    </svg>
                </button>
            </aside>
        </>
    );
}