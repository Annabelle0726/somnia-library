// src/theme/themes.ts
export interface ThemeItem {
    id: 'nocturne' | 'magnolia' | 'gloaming' | 'reverie' | 'grimoire' | 'aphelion';
    category: string;
    name: string;
    description: string;
    previewBg: string;
    previewText: string;
    primaryColor: string;
    swatches: string[];
}

export const THEMES: ThemeItem[] = [
    {
        id: 'nocturne',
        category: 'DARK',
        name: 'Nocturne',
        description: 'A deep, neon-laced night mode.',
        previewBg: 'bg-[#0b0612]',
        previewText: 'text-[#f6e9f1]',
        primaryColor: '#e83a78',
        swatches: ['#0b0612', '#15091f', '#21102f', '#e83a78', '#7b3fa0'],
    },
    {
        id: 'magnolia',
        category: 'LIGHT',
        name: 'Magnolia',
        description: 'Crisp, floral light mode with a touch of rose.',
        previewBg: 'bg-[#faf9f6]',
        previewText: 'text-[#2a1a2e]',
        primaryColor: '#c82d5a',
        swatches: ['#faf9f6', '#f0ede9', '#e3deda', '#c82d5a', '#64328c'],
    },
    {
        id: 'gloaming',
        category: 'DARK',
        name: 'Gloaming',
        description: 'The soft, purple fade of twilight.',
        previewBg: 'bg-[#1a1b2e]',
        previewText: 'text-[#e2e2ee]',
        primaryColor: '#b85c7a',
        swatches: ['#1a1b2e', '#212236', '#31334c', '#b85c7a', '#d4a373'],
    },
    {
        id: 'reverie',
        category: 'LIGHT',
        name: 'Reverie',
        description: 'A warm, vintage blush of daybreak.',
        previewBg: 'bg-[#fbeee9]',
        previewText: 'text-[#2a1320]',
        primaryColor: '#c52e5f',
        swatches: ['#fbeee9', '#f5e0e4', '#fdf2ee', '#c52e5f', '#c9842f'],
    },
    {
        id: 'grimoire',
        category: 'DARK',
        name: 'Grimoire',
        description: 'Vellum, oak-gall ink, and gold leaf.',
        previewBg: 'bg-[#0c0f0b]',
        previewText: 'text-[#ece7d6]',
        primaryColor: '#3aa97e',
        swatches: ['#0c0f0b', '#12160f', '#1d2417', '#3aa97e', '#b08828'],
    },
    {
        id: 'aphelion',
        category: 'DARK',
        name: 'Aphelion',
        description: 'The cold far point of the orbit.',
        previewBg: 'bg-[#05070d]',
        previewText: 'text-[#e6edf7]',
        primaryColor: '#4fd1e0',
        swatches: ['#05070d', '#0a0f1c', '#121a2b', '#4fd1e0', '#6b8cff'],
    },
];