// src/lib/isbn.ts
/** 清洗 ISBN：只保留数字和大写 X */
export const cleanIsbn = (raw: string): string =>
    raw.replace(/[^0-9X]/gi, '').toUpperCase();

/** 校验 ISBN-10 或 ISBN-13 合法性 */
export const isValidIsbn = (rawIsbn: string): boolean => {
    const clean = cleanIsbn(rawIsbn);

    if (clean.length === 10) {
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            if (!/^\d$/.test(clean[i])) return false;
            sum += (10 - i) * parseInt(clean[i], 10);
        }
        const last = clean[9];
        if (last !== 'X' && !/^\d$/.test(last)) return false;
        sum += last === 'X' ? 10 : parseInt(last, 10);
        return sum % 11 === 0;
    }

    if (clean.length === 13) {
        if (!/^\d{13}$/.test(clean)) return false;
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(clean[i], 10) * (i % 2 === 0 ? 1 : 3);
        }
        return (10 - (sum % 10)) % 10 === parseInt(clean[12], 10);
    }

    return false;
};