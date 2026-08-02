// scripts/evaluate-new-books.js
// Only evaluates new books (where spice is null), can be run repeatedly to process CONFIG.LIMIT books at a time
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ============== Configuration Area ==============
// 🔧 Choose an available API: uncomment the one you want to use, keep the others commented out

// DeepSeek (requires a $1 account balance)
const API_PROVIDER = 'deepseek';
const API_KEY = process.env.VITE_DEEPSEEK_API_KEY;

// Groq + Llama 3.3 (Free, but if blocked/rate-limited, you can register a new key)
// const API_PROVIDER = 'groq';
// const API_KEY = 'YOUR_NEW_GROQ_KEY';

// Gemini (Free, get one at https://aistudio.google.com/apikey)
// const API_PROVIDER = 'gemini';
// const API_KEY = process.env.VITE_GEMINI_API_KEY;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const CONFIG = {
    LIMIT: 5,            // Number of books to process per run
    DELAY_BETWEEN: 2000, // Delay between books in milliseconds
    MAX_RETRIES: 2,
};
// ==================================

console.log('🔧 Environment Check:');
console.log('  API Provider:', API_PROVIDER);
console.log('  API_KEY:', API_KEY ? `✓ (${API_KEY.substring(0, 8)}...)` : '✗');
console.log('  SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
console.log('  SUPABASE_KEY:', SUPABASE_KEY ? '✓' : '✗');
console.log('');

if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============== Test API Connection ==============
async function testApi() {
    console.log(`🔍 Testing ${API_PROVIDER} API...`);

    const tests = {
        deepseek: {
            url: 'https://api.deepseek.com/v1/chat/completions',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: {
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Say "OK"' }],
                max_tokens: 10
            }
        },
        groq: {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say "OK"' }],
                max_tokens: 10
            }
        },
        gemini: {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            headers: { 'Content-Type': 'application/json' },
            body: {
                contents: [{ parts: [{ text: 'Say "OK"' }] }]
            }
        }
    };

    const config = tests[API_PROVIDER];
    try {
        const res = await fetch(config.url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(config.body)
        });

        if (!res.ok) {
            const err = await res.json();
            console.error('  ✗ Failed:', JSON.stringify(err).substring(0, 200));
            return false;
        }

        let text;
        const data = await res.json();
        if (API_PROVIDER === 'gemini') {
            text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        } else {
            text = data.choices?.[0]?.message?.content;
        }
        console.log('  ✓', text);
        return true;
    } catch (e) {
        console.error('  ✗ Network error:', e.message);
        return false;
    }
}

// ============== Fetch Book Description from Open Library ==============
async function getBookDescription(title, author) {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=3&fields=key,title,author_name,description`;
        const res = await fetch(url);
        if (!res.ok) return '';

        const data = await res.json();
        if (!data.docs?.length) return '';

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
            if (typeof desc === 'string' && desc.length > 0) return desc.substring(0, 500);
        }
    } catch (e) {
        console.error(`  ⚠ Open Library error: ${e.message}`);
    }
    return '';
}

// ============== Evaluate Spice Level ==============
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

    const apiConfigs = {
        deepseek: {
            url: 'https://api.deepseek.com/v1/chat/completions',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a book rating assistant. Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.3,
                response_format: { type: 'json_object' }
            },
            parseResponse: (data) => data.choices?.[0]?.message?.content
        },
        groq: {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.3,
                response_format: { type: 'json_object' }
            },
            parseResponse: (data) => data.choices?.[0]?.message?.content
        },
        gemini: {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            headers: { 'Content-Type': 'application/json' },
            body: {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 150,
                    temperature: 0.3,
                }
            },
            parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text
        }
    };

    const config = apiConfigs[API_PROVIDER];

    try {
        const res = await fetch(config.url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(config.body)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`${API_PROVIDER} error (${res.status}): ${JSON.stringify(err).substring(0, 200)}`);
        }

        const data = await res.json();
        const content = config.parseResponse(data);

        if (!content) throw new Error('Returned empty content');

        const result = JSON.parse(content);

        if (typeof result.spice === 'number' && result.spice >= 0 && result.spice <= 5) {
            return {
                spice: Math.round(result.spice),
                reasoning: result.reasoning || 'No reasoning'
            };
        }
        throw new Error(`Invalid spice value: ${result.spice}`);

    } catch (error) {
        console.error(`  ✗ ${error.message}`);
        if (retryCount < CONFIG.MAX_RETRIES) {
            console.log(`  🔄 Retrying (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`);
            await sleep(1000);
            return evaluateSpice(title, author, description, retryCount + 1);
        }
        return null;
    }
}

// ============== Update Database ==============
async function updateBookSpice(bookId, spice, reasoning) {
    const { error } = await supabase
        .from('books')
        .update({ spice, spice_reasoning: reasoning })
        .eq('id', bookId);

    if (error) {
        console.error(`  ✗ Update failed: ${error.message}`);
        return false;
    }
    console.log(`  💾 Saved: spice=${spice}`);
    return true;
}

// ============== Main Function ==============
async function main() {
    console.log(`🌶️  New Book Spice Evaluation (${API_PROVIDER})`);
    console.log('='.repeat(50));
    console.log(`📊 Processing limit per run: ${CONFIG.LIMIT}`);
    console.log(`⏱  Delay between books: ${CONFIG.DELAY_BETWEEN/1000}s`);
    console.log('='.repeat(50) + '\n');

    // Test API connection first
    const apiOk = await testApi();
    if (!apiOk) {
        console.error(`\n❌ ${API_PROVIDER} API is unavailable`);
        console.error('   Please check your API key or switch API_PROVIDER');
        process.exit(1);
    }

    // 🔧 Query only new books with missing/null spice values (does not check spice_eq_0)
    console.log('\n📚 Querying new books (spice is null)...\n');

    const { data: books, count } = await supabase
        .from('books')
        .select('id, title, author', { count: 'exact' })
        .is('spice', null)                    // Only target books where spice is null
        .order('created_at', { ascending: false })
        .limit(CONFIG.LIMIT);

    if (!books || books.length === 0) {
        console.log('✅ No new books require evaluation!');
        process.exit(0);
    }

    console.log(`📊 Total pending new books: ${count || '?'}, processing ${books.length} in this batch\n`);

    let success = 0, failed = 0;

    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        console.log(`[${i + 1}/${books.length}] "${book.title}"`);
        console.log(`  Author: ${book.author || 'Unknown'}`);

        const desc = await getBookDescription(book.title, book.author);
        console.log(`  ${desc ? `✓ Description fetched (${desc.length} chars)` : '⚠ No description found'}`);

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

        console.log('');
        if (i < books.length - 1) await sleep(CONFIG.DELAY_BETWEEN);
    }

    console.log('='.repeat(50));
    console.log(`✅ Successful: ${success}  |  ❌ Failed: ${failed}`);
    console.log('='.repeat(50));

    const remaining = (count || 0) - books.length;
    if (remaining > 0) {
        console.log(`\n💡 There are still ${remaining} new books left to evaluate. Run this script again to continue.`);
    } else {
        console.log('\n🎉 All new books have been successfully evaluated!');
    }
}

main().catch(console.error);