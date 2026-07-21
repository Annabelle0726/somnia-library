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
        description: 'Crisp, floral light mode with a touch of rose.',
        light: {
            bg: '#faf9f6',
            text: '#2a1a2e',
            primary: '#c82d5a',
            swatches: ['#faf9f6', '#f0ede9', '#e3deda', '#c82d5a', '#64328c'],
        },
        dark: {
            bg: '#161019',
            text: '#f2eaf5',
            primary: '#e84d7a',
            swatches: ['#161019', '#211826', '#302237', '#e84d7a', '#9754cc'],
        }
    },
    {
        id: 'gloaming',
        name: 'Gloaming',
        description: 'The soft, purple fade of twilight.',
        light: {
            bg: '#f4f4f8',
            text: '#1c1d2e',
            primary: '#9c4360',
            swatches: ['#f4f4f8', '#e6e6f0', '#dbdbe8', '#9c4360', '#4a3e73'],
        },
        dark: {
            bg: '#1a1b2e',
            text: '#e2e2ee',
            primary: '#b85c7a',
            swatches: ['#1a1b2e', '#212236', '#31334c', '#b85c7a', '#5c4d8c'],
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