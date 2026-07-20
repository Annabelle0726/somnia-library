import { NavLink } from 'react-router-dom';

interface NavProps {
    isCollapsed: boolean;
}

export function Nav({ isCollapsed }: NavProps) {

    const navItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Library', icon: '📚' },
        { name: 'Shelves', icon: '📖' },
        { name: 'Planner', icon: '📅' },
        { name: 'Stats', icon: '📊' },
        { name: 'Match', icon: '🎯' },
        { name: 'Discover', icon: "🎈" },
        { name: 'Clubs', icon: '🏛️' },
    ];

    /* ✨ 1. 更新了功能按钮的高亮与悬浮类名，匹配新 Theme Token */
    const functionButtons = [
        {
            name: 'AddBook',
            path: '/addBook',
            icon: '+',
            activeBorder: 'border-primary',
            activeText: 'text-primary',
            activeGlow: 'shadow-[0_0_10px_rgba(232,52,95,0.3)]',
            hoverBorder: 'hover:border-primary/50',
            hoverText: 'hover:text-primary',
        },
        {
            name: 'Theme',
            path: '/theme',
            icon: '◐',
            activeBorder: 'border-amber-400',
            activeText: 'text-amber-400',
            activeGlow: 'shadow-[0_0_10px_rgba(232,163,61,0.3)]',
            hoverBorder: 'hover:border-amber-400/50',
            hoverText: 'hover:text-amber-400',
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: '⚙',
            activeBorder: 'border-ink-muted',
            activeText: 'text-ink-muted',
            activeGlow: 'shadow-[0_0_10px_rgba(154,107,122,0.3)]',
            hoverBorder: 'hover:border-ink-muted/50',
            hoverText: 'hover:text-ink-muted',
        },
    ];

    return (
        /* ✨ 2. 背景与边框：bg-theme-bg0/80 -> bg-bg/80, border-theme-line/30 -> border-line */
        <nav className={`h-screen shrink-0 bg-bg/80 backdrop-blur-md z-50 sticky top-0
         flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
            isCollapsed
                ? 'w-0 px-0 opacity-0 overflow-hidden border-none'
                : 'w-64 px-8 border-r border-line'
        }`}>
            {/* 上半部分：可滚动的导航链接 */}
            <div className="flex flex-col gap-3 w-full overflow-y-auto max-h-[55vh] no-scrollbar items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`}
                        className={({ isActive }) =>
                            `group relative flex items-center justify-center px-2 py-1.5 transition-all 
                            duration-300 whitespace-nowrap font-mono ${
                                isActive
                                    ? 'text-primary'
                                    : 'text-ink-muted hover:text-primary/90'
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
                                        className={`hidden md:inline-block shrink-0 text-xs md:text-sm 
                                        transition-all duration-300 ${
                                            isActive ? 'drop-shadow-[0_0_6px_rgba(232,52,95,0.6)]' : ''
                                        }`}
                                    >
                                        {item.icon}
                                    </span>

                                    <span
                                        className={`text-center transition-all duration-300 
                                        text-[10px] md:text-xs ${
                                            isCollapsed
                                                ? 'w-0 opacity-0 overflow-hidden'
                                                : 'flex-1'
                                        } ${
                                            isActive
                                                ? 'font-bold drop-shadow-[0_0_6px_rgba(232,52,95,0.6)]'
                                                : 'font-normal'
                                        }`}
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

            {/* 下半部分：功能区（3个精致居中按钮） */}
            <div
                className={`flex flex-col w-full transition-all duration-500 mt-4 ${
                    isCollapsed ? 'items-center gap-4' : 'items-center gap-3'
                }`}
            >
                {/* 装饰横线 */}
                <div className="relative w-full h-[1px] min-h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent shrink-0 mb-1">
                    <div className="absolute left-1/2 -top-[3px] -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-bg border border-amber-400/50 shadow-[0_0_5px_rgba(232,163,61,0.4)]"></div>
                </div>

                {functionButtons.map((btn) => (
                    <NavLink
                        key={btn.name}
                        to={btn.path}
                        className={`w-full flex justify-center ${isCollapsed ? '' : 'px-2'}`}
                    >
                        {({ isActive }) => (
                            <div
                                className={`flex items-center border rounded-xl transition-all duration-300
                    text-xs font-mono tracking-wider whitespace-nowrap overflow-hidden
                    ${
                                    isCollapsed
                                        ? 'justify-center w-10 h-10 p-0 rounded-full'
                                        : 'justify-start w-full max-w-[180px] px-4 py-2.5'
                                }
                    ${
                                    isActive
                                        /* ✨ 3. 激活状态背景使用 bg-card，添加边缘微光 */
                                        ? `${btn.activeBorder} ${btn.activeText} ${btn.activeGlow} bg-card shadow-[inset_0_1px_rgba(255,255,255,0.1)]`
                                        /* ✨ 4. 默认状态：border-line, text-ink-muted, bg-card/50 */
                                        : `border-line text-ink-muted/80 bg-card/50 
                               ${btn.hoverBorder} ${btn.hoverText} hover:bg-card hover:shadow-md`
                                }`}
                            >
                                {/* 图标区 */}
                                <span
                                    className={`shrink-0 transition-all duration-300 flex items-center justify-center ${
                                        isActive ? 'scale-110 drop-shadow-md' : ''
                                    } ${isCollapsed ? 'text-lg' : 'text-base mr-3'}`}
                                >
                                    {btn.icon}
                                </span>

                                {/* 文字区 */}
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
    );
}