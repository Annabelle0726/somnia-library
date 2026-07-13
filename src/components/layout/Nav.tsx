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
        {name: 'Discover', icon: "🎈"},
        { name: 'Clubs', icon: '🏛️' },
    ];

    const functionButtons = [
        {
            name: 'Add',
            path: '../pages/Add',
            icon: '+',
            activeBorder: 'border-nocturne-primary',
            activeText: 'text-nocturne-primary',
            activeGlow: 'shadow-[0_0_10px_rgba(232,58,120,0.3)]',
            hoverBorder: 'hover:border-nocturne-primary/50',
            hoverText: 'hover:text-nocturne-primary',
        },
        {
            name: 'Theme',
            path: '../pages/Theme',
            icon: '◐',
            activeBorder: 'border-nocturne-gold',
            activeText: 'text-nocturne-gold',
            activeGlow: 'shadow-[0_0_10px_rgba(240,177,78,0.3)]',
            hoverBorder: 'hover:border-nocturne-gold/50',
            hoverText: 'hover:text-nocturne-gold',
        },
        {
            name: 'Settings',
            path: '../pages/Settings',
            icon: '⚙',
            activeBorder: 'border-nocturne-muted',
            activeText: 'text-nocturne-muted',
            activeGlow: 'shadow-[0_0_10px_rgba(180,180,180,0.3)]',
            hoverBorder: 'hover:border-nocturne-muted/50',
            hoverText: 'hover:text-nocturne-muted',
        },
    ];

    return (
        <nav className={`h-screen shrink-0 bg-theme-bg0/80 backdrop-blur-md z-50 sticky top-0
         flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
            // ✨ 核心改变：折叠时宽度为 0，内边距为 0，透明度 0，隐藏溢出，去掉右边框
            isCollapsed
                ? 'w-0 px-0 opacity-0 overflow-hidden border-none'
                : 'w-64 px-8 border-r border-theme-line/30'
        }`}>
            {/* 上半部分：可滚动的导航链接 */}
            <div
                className={`flex flex-col gap-3 w-full overflow-y-auto max-h-[55vh] no-scrollbar ${
                    isCollapsed ? 'items-center' : 'items-center'
                }`}
            >
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`}
                        className={({ isActive }) =>
                            `group relative flex items-center justify-center px-2 py-1.5 transition-all 
                            duration-300 whitespace-nowrap font-mono ${
                                isActive
                                    ? 'text-nocturne-primary'
                                    : 'text-nocturne-muted hover:text-nocturne-primary/90'
                            } ${isCollapsed ? 'justify-center' : ''}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={`transition-opacity duration-300 font-light 
                                    text-xs md:text-sm ${
                                        isActive
                                            ? 'opacity-80 text-nocturne-primary'
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
                                            isActive ? 'drop-shadow-[0_0_6px_rgba(232,58,120,0.6)]' : ''
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
                                                ? 'font-bold drop-shadow-[0_0_6px_rgba(232,58,120,0.6)]'
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
                                            ? 'opacity-80 text-nocturne-primary'
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
                <div className="relative w-full h-[1px] min-h-[1px] bg-gradient-to-r from-transparent via-nocturne-gold/30 to-transparent shrink-0 mb-1">
                    <div className="absolute left-1/2 -top-[3px] -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-nocturne-bg0 border border-nocturne-gold/50 shadow-[0_0_5px_rgba(240,177,78,0.4)]"></div>
                </div>
                {functionButtons.map((btn) => (
                    <NavLink
                        key={btn.name}
                        to={btn.path}
                        // 【第 1 层：外层定位容器】控制按钮在导航栏中的占位
                        className={`w-full flex justify-center ${isCollapsed ? '' : 'px-2'}`}
                    >
                        {/* 【第 2 层：状态拦截器】获取当前页面是否处于激活状态 (isActive) */}
                        {({ isActive }) => (
                            <div
                                // 【第 3 层：实体按钮样式】实心背景、居左对齐、圆角发光全在这里
                                className={`flex items-center border rounded-xl transition-all duration-300
                    text-xs font-mono tracking-wider whitespace-nowrap overflow-hidden
                    ${
                                    isCollapsed
                                        ? 'justify-center w-10 h-10 p-0 rounded-full' // 折叠时：变成正圆居中
                                        : 'justify-start w-full max-w-[180px] px-4 py-2.5' // 展开时：w-full铺满、居左对齐(justify-start)、增加内边距
                                }
                    ${
                                    isActive
                                        // 激活状态：高亮的实心背景、发光边框、带一点内阴影增加立体感
                                        ? `${btn.activeBorder} ${btn.activeText} ${btn.activeGlow} bg-nocturne-bg2/80 shadow-[inset_0_1px_rgba(255,255,255,0.1)]`
                                        // 默认状态：基础实心背景 (bg-nocturne-bg1/60)，悬浮时背景提亮
                                        : `border-nocturne-line/20 text-nocturne-muted/80 bg-nocturne-bg1/60 
                               ${btn.hoverBorder} ${btn.hoverText} hover:bg-nocturne-bg2/90 hover:shadow-md`
                                }
                `}
                            >
                                {/* 【第 4 层：图标区】 */}
                                <span
                                    className={`shrink-0 transition-all duration-300 flex items-center justify-center ${
                                        isActive ? 'scale-110 drop-shadow-md' : ''
                                    } ${isCollapsed ? 'text-lg' : 'text-base mr-3'}`} // 展开时图标右侧留出 12px (mr-3) 的间距
                                >
                    {btn.icon}
                </span>

                                {/* 【第 4 层：文字区】 */}
                                <span
                                    className={`transition-all duration-300 ${
                                        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100' // 折叠时文字被挤压隐藏
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