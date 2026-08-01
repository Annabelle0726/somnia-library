// scripts/fix-covers.js
// Quick patch for specific stubborn books using AbeBooks CDN fallback.
// Uses a DIRECT_OVERRIDES map for books you already have manual URLs for.
// Usage: node --env-file=.env.local fix-covers.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing env variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// List the specific book IDs you want to fix
const TARGET_BOOK_IDS = [
    '97c139ba-03fc-413c-98c7-6c9c1f781db8',
    '7c08af77-ec37-4912-bbf6-c9c7c5132378',
    '3c032aef-873a-400c-beed-e24eea7f55b8',
    '5f2f843b-13ba-42d4-8704-54b63cdaa092',
    '42175f6c-2a84-4fce-810b-e94495e7dc28',
    '633b7bc1-9a3b-421d-abff-6d68be1d40cb',
    'b4adcda0-e195-4174-91c0-ba1f537c2bd7'
];

// ------------------------------------------------------------
// 🚨 THE FAILSAFE: Direct Overrides
// Paste direct image URLs here for books that can't be scraped.
// (Right-click cover on Amazon/Goodreads → Copy Image Address)
// ------------------------------------------------------------
const DIRECT_OVERRIDES = {
    '9798218204259': '', // The Sacrifice
    '9781952457470': '', // A Kingdom of Flesh and Fire
    '9798985421293': '', // Their Vicious Darling
    '9781638932475': '', // Hunting Adeline
    '9781638932659': '', // Scyth and Sparrow
    '9780593978641': '', // Wild and Wrangled
    '9798637109357': ''  // Master of Salt & Bones
};

const cleanIsbn = (isbn) => isbn.replace(/[^0-9X]/gi, '');

// Utility: fetch with timeout to avoid hanging
const fetchWithTimeout = (url, opts = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...opts, signal: controller.signal })
        .catch(() => null) // Suppress abort errors
        .finally(() => clearTimeout(timer));
};

// --- AbeBooks Direct CDN ---
// AbeBooks is owned by Amazon but their image servers often lack bot protection.
// This just checks if an image exists for the ISBN—no HTML parsing needed.
const tryAbeBooksCDN = async (isbn) => {
    const url = `https://pictures.abebooks.com/isbn/${isbn}-us.jpg`;
    try {
        const res = await fetchWithTimeout(url, { method: 'HEAD' }, 5000);
        // Ensure the file exists and isn't a tiny 1x1 placeholder
        if (res && res.ok && parseInt(res.headers.get('content-length') || '0', 10) > 1000) {
            console.log('   📕 Found via AbeBooks CDN');
            return url;
        }
    } catch (e) { /* fall through */ }
    return null;
};

// Main orchestrator: checks overrides first, then tries AbeBooks
const fetchCoverByIsbn = async (isbn) => {
    if (!isbn) return null;
    const clean = cleanIsbn(isbn);
    console.log(`   🔍 ISBN: ${clean}`);

    // 1. Check manual overrides first
    if (DIRECT_OVERRIDES[clean]) {
        console.log('   🛡️ Found via Direct Override Map');
        return DIRECT_OVERRIDES[clean];
    }

    // 2. Try AbeBooks CDN
    const cover = await tryAbeBooksCDN(clean);
    if (cover) return cover;

    console.log(`   ❌ Automated methods failed. Add URL to DIRECT_OVERRIDES for ${clean}`);
    return null;
};

async function main() {
    const { data: books, error } = await supabase
        .from('books')
        .select('id, title, isbn, cover')
        .in('id', TARGET_BOOK_IDS);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`🚀 Processing the final ${books.length} books...\n`);
    let updated = 0;

    for (const book of books) {
        if (!book.isbn) {
            console.log(`⚠️ ${book.title} has no ISBN, skipping.`);
            continue;
        }

        console.log(`📖 ${book.title}`);
        const newCover = await fetchCoverByIsbn(book.isbn);

        if (newCover) {
            const { error: updateErr } = await supabase
                .from('books')
                .update({ cover: newCover })
                .eq('id', book.id);

            if (updateErr) {
                console.error(`   ❌ Update failed: ${updateErr.message}`);
            } else {
                console.log(`   ✅ Successfully Updated!\n`);
                updated++;
            }
        } else {
            console.log(`   🚫 No cover found.\n`);
        }
    }

    console.log(`🎉 Done. Updated ${updated}/${books.length}.`);
}

main();