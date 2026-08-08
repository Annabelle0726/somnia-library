// src/components/layout/Nav.tsx
import { NavLink } from 'react-router-dom';

interface NavProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
    onMobileOpen?: () => void; // 🔥 新增：用于底部 Tab 触发打开
}

export function Nav({ isCollapsed, onToggle, isMobileOpen = false, onMobileClose, onMobileOpen }: NavProps) {
    const navItems = [
        { name: 'Home', path: '/', icon: '🏡' },
        { name: 'Library', path: '/library', icon: '📚' },
        { name: 'Shelves', path: '/shelves', icon: '📖' },
        { name: 'Planner', path: '/planner', icon: '📅' },
        { name: 'Tropes', path: '/tropes', icon: '🧬' },
        { name: 'Stats', path: '/stats', icon: '📊' },
        { name: 'Match', path: '/match', icon: '🎯' },
        { name: 'Discover', path: '/discover', icon: "🎈" },
        { name: 'Clubs', path: '/clubs', icon: '🏛️' }
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
            {/* ========================================== */}
            {/* 📱 1. 移动端：底部功能导航栏 (5格布局) */}
            {/* ========================================== */}
            <nav
                className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-lg lg:hidden"
                style={{
                    borderColor: 'var(--line)',
                    background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
                    paddingBottom: 'env(safe-area-inset-bottom)'
                }}
            >
                <div className="grid grid-cols-5">
                    {/* 1. Home */}
                    <NavLink to="/" className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${isActive ? 'text-primary' : 'text-muted'}`
                    }>
                        {({ isActive }) => (
                            <>
                                <span className="text-[20px] leading-none" aria-hidden="true" style={{color: isActive ? 'var(--primary)' : 'var(--muted)'}}>⌂</span>
                                <span className="skin-label">Home</span>
                            </>
                        )}
                    </NavLink>

                    {/* 2. Library */}
                    <NavLink to="/library" className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${isActive ? 'text-primary' : 'text-muted'}`
                    }>
                        {({ isActive }) => (
                            <>
                                <span className="text-[20px] leading-none" aria-hidden="true" style={{color: isActive ? 'var(--primary)' : 'var(--muted)'}}>▦</span>
                                <span className="skin-label">Library</span>
                            </>
                        )}
                    </NavLink>

                    {/* 3. Add Book (突出显示) */}
                    <div className="flex items-start justify-center">
                        <NavLink
                            to="/addBook"
                            className="grid h-11 w-11 -translate-y-3 place-items-center rounded-full text-[24px] shadow-lg transition-transform active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
                                color: 'var(--on-primary)'
                            }}
                        >
                            <span aria-hidden="true">＋</span>
                        </NavLink>
                    </div>

                    {/* 4. Tropes */}
                    <NavLink to="/tropes" className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${isActive ? 'text-primary' : 'text-muted'}`
                    }>
                        {({ isActive }) => (
                            <>
                                <span className="text-[20px] leading-none" aria-hidden="true" style={{color: isActive ? 'var(--primary)' : 'var(--muted)'}}>❦</span>
                                <span className="skin-label">Tropes</span>
                            </>
                        )}
                    </NavLink>

                    {/* 5. More (触发打开侧边栏) */}
                    <button
                        type="button"
                        // 🔥 修复：调用父组件传入的 onMobileOpen 来展开侧边栏
                        onClick={() => onMobileOpen?.()}
                        className="flex flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors text-muted hover:text-primary"
                    >
                        <span className="text-[20px] leading-none" aria-hidden="true">⋯</span>
                        <span className="skin-label">More</span>
                    </button>
                </div>
            </nav>

            {/* ========================================== */}
            {/* 📱 2. 移动端：More 按钮弹出的侧边栏 (这里是修复的核心) */}
            {/* ========================================== */}
            {/* 遮罩层提升到 z-[60]，确保盖过底部导航栏的 z-40 */}
            {isMobileOpen && (
                <div
                    onClick={onMobileClose}
                    className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
                />
            )}

            {/* 侧边栏提升到 z-[70]，确保能和遮罩层一起盖住底部 */}
            <aside
                className={`fixed md:sticky top-0 h-screen shrink-0 z-[70] transition-transform duration-300 ease-in-out ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } lg:z-50 lg:translate-x-0`} // 桌面端自然回退到 z-50
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

                    {/* 导航列表 */}
                    <div className="flex flex-col gap-2.5 w-full max-h-[300px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden items-center py-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `group relative flex items-center justify-center px-2 py-1.5 transition-all duration-300 whitespace-nowrap font-[family-name:var(--font-serif-fancy)] tracking-wider ${
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
                                        className={`flex items-center border rounded-xl transition-all duration-300 text-xs font-[family-name:var(--font-serif-fancy)] tracking-wider whitespace-nowrap overflow-hidden justify-center w-full max-w-[180px] px-3 py-1.5
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

                {/* 💻 桌面端折叠切换按钮 */}
                <button
                    onClick={onToggle}
                    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    className={`hidden md:block absolute bottom-4 z-50 p-2 rounded-md transition-all duration-500 backdrop-blur-md
                        ${isCollapsed ? 'left-8' : 'left-[11.5rem]'}
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