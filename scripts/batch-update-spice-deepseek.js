// scripts/batch-update-spice-ds.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Environment variable checks
console.log('🔧 Checking Environment Variables:');
console.log('  SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓' : '✗');
console.log('  SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
console.log('  DEEPSEEK_KEY:', process.env.VITE_DEEPSEEK_API_KEY ? '✓' : '✗');
console.log('');

const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DEEPSEEK_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CONFIG = {
    LIMIT: 10,
    DELAY_BETWEEN_BOOKS: 1000,
    MAX_RETRIES: 2,
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🔧 Test DeepSeek API Connection
async function testDeepSeek() {
    console.log('🔍 Testing DeepSeek API...');
    try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Say "OK" in one word' }],
                max_tokens: 10
            })
        });

        if (!res.ok) {
            const err = await res.json();
            console.error('  ✗ Failed:', JSON.stringify(err));
            return false;
        }

        const data = await res.json();
        console.log('  ✓ Success:', data.choices?.[0]?.message?.content);
        return true;
    } catch (e) {
        console.error('  ✗ Network error:', e.message);
        return false;
    }
}

// Fetch book description
async function getBookDescription(title, author) {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=3&fields=key,title,author_name,description`;
        const res = await fetch(url);

        // Check HTTP status
        if (!res.ok) {
            console.error(`  ⚠ Open Library returned status ${res.status}`);
            return '';
        }

        const data = await res.json();

        if (data.docs && data.docs.length > 0) {
            let bestDoc = null;

            if (author) {
                const authorLower = author.toLowerCase();
                bestDoc = data.docs.find(doc =>
                    doc.description &&
                    doc.author_name?.some(a => a.toLowerCase().includes(authorLower))
                );
            }

            if (!bestDoc) bestDoc = data.docs.find(doc => doc.description);
            if (!bestDoc) bestDoc = data.docs[0];

            if (bestDoc?.description) {
                let desc = bestDoc.description;
                if (typeof desc === 'object' && desc.value) desc = desc.value;
                if (typeof desc === 'string' && desc.length > 0) {
                    return desc.substring(0, 500);
                }
            }
        } else {
            console.error(`  ⚠ Open Library returned 0 results`);
        }
    } catch (error) {
        console.error(`  ⚠ Open Library failed: ${error.message}`);
    }
    return '';
}

// 🔧 DeepSeek evaluation function (formatted for API)
async function evaluateSpice(title, author, description, retryCount = 0) {
    const prompt = `Rate this book's explicit/romance content level (spice level) on a scale of 0-5.

Scale:
0: No romance at all, completely clean
1: Mild romance only, kissing at most, fade-to-black
2: Some romantic scenes, implied intimacy
3: Moderate explicit content, a few detailed scenes
4: Frequent explicit content, detailed descriptions
5: Erotica, extremely explicit, graphic

Book: "${title}"${author ? ` by ${author}` : ''}
${description ? `\nDescription: ${description}` : ''}

Return ONLY a JSON object: {"spice": number, "reasoning": "brief explanation"}`;

    try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a book rating assistant. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`DeepSeek Error (${res.status}): ${JSON.stringify(err)}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('DeepSeek returned empty content');
        }

        const result = JSON.parse(content);

        if (typeof result.spice === 'number' && result.spice >= 0 && result.spice <= 5) {
            return {
                spice: Math.round(result.spice),
                reasoning: result.reasoning || 'No reasoning'
            };
        }

        throw new Error(`Invalid spice value: ${result.spice}`);

    } catch (error) {
        console.error(`  ✗ Evaluation failed: ${error.message}`);

        if (retryCount < CONFIG.MAX_RETRIES) {
            console.log(`  🔄 Retrying (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`);
            await sleep(1000);
            return evaluateSpice(title, author, description, retryCount + 1);
        }

        return null;
    }
}

// Update database records
async function updateBookSpice(bookId, spice, reasoning) {
    const { error } = await supabase
        .from('books')
        .update({
            spice: spice,
            spice_reasoning: reasoning,
        })
        .eq('id', bookId);

    if (error) {
        console.error(`  ✗ Update failed: ${error.message}`);
        return false;
    }

    console.log(`  💾 Saved: spice=${spice}`);
    return true;
}

// Main execution loop
async function main() {
    console.log('🌶️  Batch Spice Evaluation (DeepSeek)\n');

    const apiOk = await testDeepSeek();
    if (!apiOk) {
        console.error('\n❌ DeepSeek API unavailable. Check API key and account balance.');
        process.exit(1);
    }

    console.log('\n📚 Fetching un-evaluated books...\n');

    const { data: books } = await supabase
        .from('books')
        .select('id, title, author')
        .or('spice.is.null,spice.eq.0')
        .order('created_at', { ascending: false })
        .limit(CONFIG.LIMIT);

    if (!books || books.length === 0) {
        console.log('✅ No books require evaluation');
        process.exit(0);
    }

    console.log(`📊 Processing ${books.length} books\n`);

    let success = 0, failed = 0;

    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        console.log(`[${i + 1}/${books.length}] "${book.title}"`);
        console.log(`  Author: ${book.author || 'Unknown'}`);

        const desc = await getBookDescription(book.title, book.author);
        console.log(`  ${desc ? `✓ Description fetched (${desc.length} chars)` : '⚠ No description'}`);

        const eval_ = await evaluateSpice(book.title, book.author, desc);

        if (eval_) {
            console.log(`  🌶️  ${eval_.spice}/5 - ${eval_.reasoning}`);
            if (await updateBookSpice(book.id, eval_.spice, eval_.reasoning)) {
                success++;
            } else {
                failed++;
            }
        } else {
            failed++;
        }

        if (i < books.length - 1) {
            await sleep(CONFIG.DELAY_BETWEEN_BOOKS);
        }
        console.log('');
    }

    console.log('='.repeat(50));
    console.log(`✅ Successful: ${success}  |  ❌ Failed: ${failed}`);
    console.log('='.repeat(50));
}

main().catch(console.error);