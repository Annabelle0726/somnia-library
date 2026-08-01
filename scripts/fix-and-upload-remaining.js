// scripts/fix-and-upload-remaining.js

// Scrapes cover images from Amazon, Goodreads, and Google Books,
// uploads them to Supabase Storage, and updates the database.
// Skips OpenLibrary since it's unreliable from some regions.
// Usage: node --env-file=.env.local fix-and-upload-remaining.js

import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'node:buffer';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const cleanIsbn = (isbn) => isbn?.replace(/[^0-9X]/gi, '');

// Utility: fetch with timeout to avoid hanging on slow responses
const fetchWithTimeout = (url, opts = {}, timeout = 15000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...opts, signal: controller.signal })
        .catch(() => null)
        .finally(() => clearTimeout(timer));
};

// Extract Amazon cover image URLs from HTML
// Matches m.media-amazon.com image URLs and strips size suffixes for full-res
const extractAmazonImage = (html) => {
    const regex = /https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9%+\-_.]+\.(?:jpg|png|webp)/gi;
    const matches = html.match(regex);
    if (matches?.length > 0) {
        // Remove size/crop suffixes like ._SX500_ or ._AC_UF1000...
        return matches[0].replace(/\._[^\.]+(?=\.(jpg|png|webp))/gi, '');
    }
    return null;
};

// ------------------------------------------------------------
// Source 1: Amazon product page (dp/ISBN)
// Most reliable — goes directly to the book's page
// ------------------------------------------------------------
const tryAmazonProduct = async (isbn) => {
    try {
        const res = await fetchWithTimeout(`https://www.amazon.com/dp/${isbn}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html'
            },
            redirect: 'follow'
        }, 15000);
        if (!res?.ok) return null;
        const html = await res.text();
        // Bail if Amazon serves a CAPTCHA
        if (html.includes('captcha') || html.includes('robot check')) return null;
        const img = extractAmazonImage(html);
        if (img) { console.log('   🟢 Amazon product page'); return img; }
    } catch (e) {}
    return null;
};

// ------------------------------------------------------------
// Source 2: Amazon search page
// Falls back to searching by ISBN if the product page doesn't work
// ------------------------------------------------------------
const tryAmazonSearch = async (isbn) => {
    try {
        const res = await fetchWithTimeout(`https://www.amazon.com/s?k=${isbn}&i=stripbooks`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html'
            }
        }, 15000);
        if (!res?.ok) return null;
        const html = await res.text();
        if (/captcha|robot check/i.test(html)) return null;
        const img = extractAmazonImage(html);
        if (img) { console.log('   🟡 Amazon search'); return img; }
    } catch (e) {}
    return null;
};

// ------------------------------------------------------------
// Source 3: Goodreads
// Great for indie/self-published books that Amazon might miss
// ------------------------------------------------------------
const tryGoodreads = async (isbn) => {
    try {
        const res = await fetchWithTimeout(`https://www.goodreads.com/search?q=${isbn}&search_type=books`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html'
            }
        }, 12000);
        if (!res?.ok) return null;
        const html = await res.text();
        // Goodreads cover images are served from i.gr-assets.com
        const match = html.match(/https:\/\/i\.gr-assets\.com\/images\/S\/compressed\.photo\.goodreads\.com\/books\/\d+[^"]+\.jpg/gi);
        if (match?.[0]) {
            console.log('   📚 Goodreads');
            // Strip query params for a clean URL
            return match[0].replace(/\?.*$/, '');
        }
    } catch (e) {}
    return null;
};

// ------------------------------------------------------------
// Source 4: Google Books API
// Clean JSON response, no HTML parsing needed
// ------------------------------------------------------------
const tryGoogleBooks = async (isbn) => {
    try {
        const res = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&fields=items/volumeInfo/imageLinks`);
        if (!res?.ok) return null;
        const data = await res.json();
        const images = data.items?.[0]?.volumeInfo?.imageLinks;
        if (images) {
            console.log('   🔵 Google Books');
            // Pick the largest available size
            return (images.extraLarge || images.large || images.medium || images.thumbnail)?.replace(/^http:/, 'https:');
        }
    } catch (e) {}
    return null;
};

// ------------------------------------------------------------
// Main scraper: tries all sources in priority order
// (OpenLibrary intentionally skipped — unreliable from some regions)
// ------------------------------------------------------------
const findCoverUrl = async (isbn) => {
    const clean = cleanIsbn(isbn);
    if (!clean) return null;
    return await tryAmazonProduct(clean)
        || await tryAmazonSearch(clean)
        || await tryGoodreads(clean)
        || await tryGoogleBooks(clean);
};

// ------------------------------------------------------------
// Download image from URL and upload to Supabase Storage
// Returns the new permanent public URL
// ------------------------------------------------------------
const uploadToStorage = async (imageUrl, title) => {
    try {
        // If already a Supabase Storage link, skip re-upload
        if (imageUrl.includes('supabase.co/storage')) return imageUrl;

        const res = await fetch(imageUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!res.ok) return null;

        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get('content-type') || '';
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('webp')) ext = 'webp';

        // Create a clean filename from the book title
        const safeTitle = (title || 'book')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
        const fileName = `${safeTitle}-${Date.now()}.${ext}`;

        // Upload to the "book-covers" bucket (must be created in Supabase first)
        const { error: uploadErr } = await supabase
            .storage
            .from('book-covers')
            .upload(fileName, buffer, {
                contentType: `image/${ext}`,
                upsert: true
            });

        if (uploadErr) {
            console.log(`   ❌ Upload failed: ${uploadErr.message}`);
            return null;
        }

        const { data } = supabase.storage.from('book-covers').getPublicUrl(fileName);
        return data.publicUrl;
    } catch (e) {
        console.log(`   ❌ Upload error: ${e.message}`);
        return null;
    }
};

// ------------------------------------------------------------
// Main: finds all books without Supabase Storage covers,
// scrapes new URLs, uploads images, and updates the database
// ------------------------------------------------------------
async function main() {
    // Find all books whose cover is NOT already in our Supabase Storage
    const { data: books, error } = await supabase
        .from('books')
        .select('id, title, isbn, cover')
        .not('cover', 'ilike', '%supabase.co/storage%');

    if (error) {
        console.error('❌ Query failed:', error.message);
        return;
    }

    console.log(`📚 Found ${books.length} books needing fixes\n`);

    let fixed = 0;
    let failedBooks = [];

    for (const book of books) {
        console.log(`📖 ${book.title || '(no title)'} (ISBN: ${book.isbn})`);

        if (!book.isbn) {
            console.log('   ⚠️ No ISBN, skipping\n');
            failedBooks.push(book);
            continue;
        }

        // 1. Scrape cover URL
        const coverUrl = await findCoverUrl(book.isbn);
        if (!coverUrl) {
            console.log('   ❌ No cover found\n');
            failedBooks.push(book);
            continue;
        }

        console.log(`   🔗 ${coverUrl}`);

        // 2. Download and upload to Supabase Storage
        const newUrl = await uploadToStorage(coverUrl, book.title);
        if (!newUrl) {
            console.log('   ❌ Upload failed\n');
            failedBooks.push(book);
            continue;
        }

        // 3. Update the database with the permanent URL
        const { error: updateErr } = await supabase
            .from('books')
            .update({ cover: newUrl })
            .eq('id', book.id);

        if (updateErr) {
            console.log(`   ❌ DB update failed: ${updateErr.message}\n`);
            failedBooks.push(book);
        } else {
            console.log(`   ✅ ${newUrl}\n`);
            fixed++;
        }

        // 5-second delay to avoid rate limiting (especially from Amazon)
        await new Promise(r => setTimeout(r, 5000));
    }

    console.log(`\n🎉 Done! Fixed: ${fixed}/${books.length}`);

    if (failedBooks.length > 0) {
        console.log(`\n❌ Failed for ${failedBooks.length} books:`);
        failedBooks.forEach(b => console.log(`   - ${b.title || 'no title'} (${b.isbn})`));
        console.log('\n💡 Look these up manually on Amazon/Goodreads, copy the image URL, and update via SQL.');
    }
}

main();