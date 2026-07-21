// src/components/Theme/ThemeCard.tsx
import React from 'react';
// ✅ 路径修正：从 components/Theme 往上退两层引入 theme/themes
import type { ThemeItem } from '../../theme/themes';

interface ThemeCardProps {
    theme: ThemeItem;
    isActive: boolean;
    onSelect: (id: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isActive, onSelect }) => {
    return (
        <div
            className={`relative overflow-hidden rounded-[24px] border transition-all duration-500 ease-out group 
            ${isActive
                ? 'border-tertiary shadow-lg scale-[1.02] ring-2 ring-tertiary/20'
                : 'border-line shadow-sm hover:shadow-md hover:scale-[1.01]'
            }`}
        >
            <div className={`p-8 h-full flex flex-col transition-colors duration-300 ${theme.previewBg} ${theme.previewText}`}>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 mb-3">
                    {theme.category}
                </div>

                <h2 className="text-3xl font-serif-fancy font-bold mb-2">{theme.name}</h2>
                <p className="opacity-80 text-sm mb-6 font-light h-10">{theme.description}</p>

                <div className="flex gap-2 mb-8">
                    {theme.swatches.map((color, idx) => (
                        <div
                            key={idx}
                            className="w-6 h-6 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-4 mb-8 text-sm">
                    <span className="px-3 py-1.5 rounded-full border border-black/10 bg-black/5 opacity-80 shadow-sm">
                        Tag
                    </span>
                    <span
                        className="px-4 py-1.5 rounded-full text-white font-medium shadow-md"
                        style={{ backgroundColor: theme.primaryColor }}
                    >
                        Primary
                    </span>
                    <span
                        className="font-serif-fancy italic hover:underline cursor-pointer opacity-90"
                        style={{ color: theme.primaryColor }}
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
                        style={isActive ? {} : { backgroundColor: theme.primaryColor, color: '#fff' }}
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

// ❌ 注意：底部不需要写任何 class！全部删掉！