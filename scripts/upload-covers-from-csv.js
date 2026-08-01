// scripts/upload-covers-from-csv.js
// Batch upload: reads a CSV file, downloads every cover URL it finds,
// uploads to Supabase Storage, and updates the database.
// Handy for migrating an existing library from external URLs to your own storage.
// Usage: node --env-file=.env.local upload-covers-from-csv.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { Buffer } from 'node:buffer';
import path from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read CSV file — change the path to match your export
const csvContent = readFileSync('data/books.csv', 'utf-8');
const books = parse(csvContent, {
    columns: true,         // First row is headers
    skip_empty_lines: true,
    trim: true
});

console.log(`📚 ${books.length} books found in CSV\n`);

// Filter to only books that have a cover URL
const booksWithCover = books.filter(b => b.cover && b.cover.startsWith('http'));

console.log(`🖼️  ${booksWithCover.length} have cover URLs\n`);

let success = 0;
let failed = 0;
let skipped = 0;

for (const book of booksWithCover) {
    const title = book.title || 'Unknown';
    const originalUrl = book.cover;

    // Skip if already uploaded to Supabase Storage
    if (originalUrl.includes('supabase.co/storage')) {
        console.log(`⏭️  ${title} - already local, skipping`);
        skipped++;
        continue;
    }

    console.log(`📥 ${title}`);
    console.log(`   Original: ${originalUrl}`);

    try {
        // Download the cover image
        const res = await fetch(originalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        if (!res.ok) {
            console.log(`   ❌ Download failed (HTTP ${res.status})`);
            failed++;
            continue;
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine file extension from content type or URL
        const contentType = res.headers.get('content-type') || '';
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('webp')) ext = 'webp';
        else {
            // Infer from URL
            const urlExt = originalUrl.split('.').pop()?.split('?')[0];
            if (['jpg', 'jpeg', 'png', 'webp'].includes(urlExt)) {
                ext = urlExt === 'jpeg' ? 'jpg' : urlExt;
            }
        }

        // Create a clean filename from the book title
        const safeTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
        const fileName = `${safeTitle}.${ext}`;

        // Upload to Supabase Storage
        const { error: uploadErr } = await supabase
            .storage
            .from('book-covers')
            .upload(fileName, buffer, {
                contentType: `image/${ext}`,
                upsert: true
            });

        if (uploadErr) {
            console.log(`   ❌ Upload failed: ${uploadErr.message}`);
            failed++;
            continue;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase
            .storage
            .from('book-covers')
            .getPublicUrl(fileName);

        const newUrl = publicUrlData.publicUrl;

        console.log(`   ✅ New URL: ${newUrl}`);
        success++;

        // Optionally sync to the database
        if (book.id) {
            const { error: updateErr } = await supabase
                .from('books')
                .update({ cover: newUrl })
                .eq('id', book.id);

            if (updateErr) {
                console.log(`   ⚠️ DB update failed: ${updateErr.message}`);
            } else {
                console.log(`   💾 Database synced`);
            }
        }

    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        failed++;
    }

    // Small delay to be polite to source servers
    await new Promise(r => setTimeout(r, 1500));
}

console.log(`\n🎉 Done!`);
console.log(`   Succeeded: ${success}`);
console.log(`   Failed: ${failed}`);
console.log(`   Skipped: ${skipped}`);
console.log(`\n💡 You can now export a new CSV or use your database directly.`);