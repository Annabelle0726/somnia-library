import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    // 定义我们所有的主题配置
    const themes = [
        { id: 'nocturne', name: 'Nocturne', icon: '🌙' },
        { id: 'magnolia', name: 'Magnolia', icon: '☀️' },
        { id: 'gloaming', name: 'Gloaming', icon: '🌆' }
    ] as const

    // 找到当前正在使用的主题信息
    const currentThemeInfo = themes.find(t => t.id === theme) || themes[0]

    return (
        <div className="relative">
            {/* 1. 触发器：保留了你原先的动效，点击时展开/收起菜单 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-theme-ink/60 hover:text-theme-gold transition-all duration-300 hover:scale-110 focus:outline-none drop-shadow-sm cursor-pointer select-none"
                title="Change Theme"
            >
                <span className="text-base">{currentThemeInfo.icon}</span>
            </button>

            {/* 2. 透明遮罩层：只要下拉框开着，点击屏幕任何地方就会将其关闭 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* 3. 毛玻璃下拉菜单 */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-40 py-2 rounded-xl bg-theme-panel/90 backdrop-blur-md border border-theme-gold/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* 菜单小标题 */}
                    <div className="px-4 py-1.5 border-b border-theme-ink/10 mb-1">
                        <span className="text-[9px] text-theme-gold/90 font-bold tracking-[0.2em] uppercase font-sans">
                            Atmosphere
                        </span>
                    </div>

                    {/* 遍历渲染选项 */}
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id) // 真正触发切换主题的魔法
                                setIsOpen(false) // 选完后关掉菜单
                            }}
                            className={`flex items-center gap-3 px-4 py-2 text-xs font-sans tracking-wider uppercase transition-colors text-left w-full cursor-pointer ${
                                theme === t.id
                                    ? 'text-theme-primary font-bold bg-theme-ink/5' // 当前选中的高亮样式
                                    : 'text-theme-ink/70 hover:text-theme-ink hover:bg-theme-ink/10' // 未选中的悬浮样式
                            }`}
                        >
                            <span className="text-sm">{t.icon}</span>
                            {t.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}