// src/components/Theme/ThemeCard.tsx
import React from 'react';
import type { ThemeItem } from '../../theme/themes';

interface ThemeCardProps {
    theme: ThemeItem;
    isActive: boolean;
    currentMode: 'light' | 'dark'; // 接收当前的明暗状态
    onSelect: (id: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isActive, currentMode, onSelect }) => {
    // 动态提取当前模式对应的配色
    const colors = theme[currentMode];

    return (
        <div
            className={`relative overflow-hidden rounded-[24px] border transition-all duration-500 ease-out group 
            ${isActive
                ? 'border-tertiary shadow-lg scale-[1.02] ring-2 ring-tertiary/20'
                : 'border-line shadow-sm hover:shadow-md hover:scale-[1.01]'
            }`}
        >
            {/* 使用 style 动态应用背景色和文本色，并添加 transition 产生丝滑过渡 */}
            <div
                className="p-8 h-full flex flex-col transition-colors duration-500 ease-in-out"
                style={{ backgroundColor: colors.bg, color: colors.text }}
            >
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 mb-3">
                    {currentMode}
                </div>

                <h2 className="text-3xl font-serif-fancy font-bold mb-2">{theme.name}</h2>
                <p className="opacity-80 text-sm mb-6 font-light h-10">{theme.description}</p>

                <div className="flex gap-2 mb-8">
                    {colors.swatches.map((color, idx) => (
                        <div
                            key={idx}
                            className="w-6 h-6 rounded-full border border-black/10 shadow-inner transition-colors duration-500"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-4 mb-8 text-sm">
                    <span className="px-3 py-1.5 rounded-full border border-black/10 bg-black/5 opacity-80 shadow-sm">
                        Tag
                    </span>
                    <span
                        className="px-4 py-1.5 rounded-full text-white font-medium shadow-md transition-colors duration-500"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Primary
                    </span>
                    <span
                        className="font-serif-fancy italic hover:underline cursor-pointer opacity-90 transition-colors duration-500"
                        style={{ color: colors.primary }}
                    >
                        Link text
                    </span>
                </div>

                <div className="flex items-center justify-center opacity-30 my-4">
                    <div className="h-[1px] w-12 bg-current" />
                    <div className="mx-2 rotate-45 w-2 h-2 border border-current" />
                    <div className="h-[1px] w-12 bg-current" />
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between">
                    <span className="text-sm opacity-60 italic font-serif-fancy">
                        {isActive ? 'Currently applied' : 'Try this out'}
                    </span>
                    <button
                        onClick={() => onSelect(theme.id)}
                        disabled={isActive}
                        style={isActive ? {} : { backgroundColor: colors.primary, color: '#fff' }}
                        className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 
                            ${isActive
                            ? 'border-2 border-current bg-transparent opacity-60 cursor-default'
                            : 'shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110 active:scale-95'
                        }`}
                    >
                        {isActive ? 'Active' : 'Apply Skin'}
                    </button>
                </div>
            </div>
        </div>
    );
};