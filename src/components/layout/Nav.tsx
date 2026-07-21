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

    /* ✨ 1. 更新了功能按钮的高亮与悬浮类名，匹配新 theme Token */
    const functionButtons = [
        {
            name: 'AddBook',
            path: '/addBook',
            icon: '+',
            // 绑定主题主色 Primary (洋红/亮色)
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
            // 绑定主题强调色 Tertiary (金色/点缀色)
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
            // 绑定主题柔和色 Muted (修复 Settings 不变色的问题)
            activeBorder: 'border-muted',
            activeText: 'text-muted',
            hoverBorder: 'hover:border-muted/60',
            hoverText: 'hover:text-ink',
            glowColor: 'var(--muted)',
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
                                    {/* ✨ 2. 图标区：采用动态 filter 响应当前主题 Primary 色的光晕 */}
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

                                    {/* ✨ 3. 文字区：同样采用动态主题光晕 */}
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

            {/* 下半部分：功能区（3个精致居中按钮） */}
            <div
                className={`flex flex-col w-full transition-all duration-500 mt-3 ${
                    isCollapsed ? 'items-center gap-4' : 'items-center gap-3'
                }`}
            >
                {/* 装饰横线 */}
                <div className="relative w-full h-[1px] min-h-[1px] bg-gradient-to-r from-transparent
                 via-amber-400/30 to-transparent shrink-0 mb-3">
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
                                        : '' +
                                        ' w-full max-w-[180px] px-3 py-2'
                                }
                    ${
                                    isActive
                                        /* 激活状态 */
                                        ? `${btn.activeBorder} ${btn.activeText} bg-card shadow-[inset_0_1px_rgba(255,255,255,0.1)]`
                                        /* 默认状态：修复 Settings 不变色 */
                                        : `border-line text-muted bg-card/50 
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
                                    } ${isActive ? 'font-bold' : 'font-medium'}`}>
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