// src/theme/themes.ts

export interface ThemeModeColors {
    bg: string;
    text: string;
    primary: string;
    swatches: string[];
}

export interface ThemeItem {
    id: 'nocturne' | 'magnolia' | 'gloaming' | 'reverie' | 'grimoire' | 'aphelion';
    name: string;
    description: string;
    light: ThemeModeColors;
    dark: ThemeModeColors;
}

export const THEMES: ThemeItem[] = [
    {
        id: 'nocturne',
        name: 'Nocturne',
        description: 'A deep, neon-laced night mode.',
        light: {
            bg: '#f8f5fa',
            text: '#1b1026',
            primary: '#d82b68',
            swatches: ['#f8f5fa', '#efe9f3', '#e5dceb', '#d82b68', '#692c8e'],
        },
        dark: {
            bg: '#0b0612',
            text: '#f6e9f1',
            primary: '#e83a78',
            swatches: ['#0b0612', '#15091f', '#21102f', '#e83a78', '#7b3fa0'],
        }
    },
    {
        id: 'magnolia',
        name: 'Magnolia',
        description: 'Fresh matcha green and botanical ivory.',
        light: {
            bg: '#f7f9f5',
            text: '#19261a',
            primary: '#2e7d32',
            swatches: ['#f7f9f5', '#eaf0e6', '#dce5d6', '#2e7d32', '#00796b'],
        },
        dark: {
            bg: '#0f1712',
            text: '#e8f5e9',
            primary: '#4ade80',
            swatches: ['#0f1712', '#16241b', '#223a2a', '#4ade80', '#2dd4bf'],
        }
    },
    {
        id: 'gloaming',
        name: 'Gloaming',
        description: 'Midnight navy with a warm amber twilight.',
        light: {
            bg: '#f0f4f8',
            text: '#0f172a',
            primary: '#1d4ed8',
            swatches: ['#f0f4f8', '#e1e9f2', '#cee0f2', '#1d4ed8', '#0284c7'],
        },
        dark: {
            bg: '#0b1329',
            text: '#e0f2fe',
            primary: '#f59e0b',
            swatches: ['#0b1329', '#121e3d', '#20335e', '#f59e0b', '#38bdf8'],
        }
    },
    {
        id: 'reverie',
        name: 'Reverie',
        description: 'A warm, vintage blush of daybreak.',
        light: {
            bg: '#fbeee9',
            text: '#2a1320',
            primary: '#c52e5f',
            swatches: ['#fbeee9', '#f5e0e4', '#fdf2ee', '#c52e5f', '#7b3fa0'],
        },
        dark: {
            bg: '#1a0b14',
            text: '#fcecf4',
            primary: '#e23f72',
            swatches: ['#1a0b14', '#26111e', '#3d1b30', '#e23f72', '#a057cb'],
        }
    },
    {
        id: 'grimoire',
        name: 'Grimoire',
        description: 'Vellum, oak-gall ink, and gold leaf.',
        light: {
            bg: '#f4efe2',
            text: '#1c2419',
            primary: '#1f6b4e',
            swatches: ['#f4efe2', '#e8e1cf', '#ded5bf', '#1f6b4e', '#8c6a1d'],
        },
        dark: {
            bg: '#0c0f0b',
            text: '#ece7d6',
            primary: '#3aa97e',
            swatches: ['#0c0f0b', '#12160f', '#1d2417', '#3aa97e', '#b08828'],
        }
    },
    {
        id: 'aphelion',
        name: 'Aphelion',
        description: 'The cold far point of the orbit.',
        light: {
            bg: '#eff6ff',
            text: '#0f172a',
            primary: '#0e7490',
            swatches: ['#eff6ff', '#e0f0fe', '#cce5fd', '#0e7490', '#2563eb'],
        },
        dark: {
            bg: '#05070d',
            text: '#e6edf7',
            primary: '#4fd1e0',
            swatches: ['#05070d', '#0a0f1c', '#121a2b', '#4fd1e0', '#6b8cff'],
        }
    },
];