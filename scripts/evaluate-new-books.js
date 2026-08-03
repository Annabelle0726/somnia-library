// scripts/evaluate-new-books.js
<<<<<<< HEAD
// Only evaluates new books (where spice is null), can be run repeatedly to process CONFIG.LIMIT books at a time
=======
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
<<<<<<< HEAD
import fetch from 'node-fetch';
=======
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

<<<<<<< HEAD
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
=======
// ============== CONFIGURATION ==============
// Remove VITE_ prefix – Node scripts have no reason to use Vite’s prefix.
// Add DEEPSEEK_API_KEY to your .env.local (not VITE_DEEPSEEK_API_KEY).
const API_KEY = process.env.DEEPSEEK_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CONFIG = {
    LIMIT: 5,
    INITIAL_DELAY: 2000,
    MAX_RETRIES: 3,
};

// Provider adapter – easy to swap in Groq/Gemini/DeepSeek with correct shapes.
// (Gemini native is included for completeness; uses OpenAI-compat when possible.)
const PROVIDER = {
    name: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    headers: () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
    }),
    buildBody: (prompt) => ({
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: 'Return only valid JSON. No markdown.' },
            { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.3,
        response_format: { type: 'json_object' },      // DeepSeek requires “json” in prompt
    }),
    parseContent: (data) => data.choices?.[0]?.message?.content,
};
// =========================================

if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing env vars. Ensure .env.local contains DEEPSEEK_API_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

<<<<<<< HEAD
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
=======
// ---------- error handling helpers ----------
async function safeApiCall(url, options) {
    const res = await fetch(url, options);
    const rawBody = await res.text();               // <-- always read text first
    let parsedBody;
    try {
        parsedBody = JSON.parse(rawBody);
    } catch {
        // body is not JSON (HTML, plain text, etc.)
    }
    return { res, status: res.status, rawBody, parsedBody, ok: res.ok };
}

function isRetryable(status) {
    return status === 429 || status >= 500;
}

function extractRetryAfter(res) {
    const header = res.headers.get('Retry-After');
    if (header) {
        const seconds = parseInt(header, 10);
        if (!isNaN(seconds)) return seconds * 1000;
        const date = Date.parse(header);
        if (!isNaN(date)) return date - Date.now();
    }
    return null;
}

// ---------- test connection ----------
async function testProvider() {
    console.log(`🔍 Testing ${PROVIDER.name}...`);
    const { status, rawBody, ok, parsedBody } = await safeApiCall(PROVIDER.baseUrl, {
        method: 'POST',
        headers: PROVIDER.headers(),
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: 'Say "OK" in one word' }],
            max_tokens: 10,
        }),
    });

    if (ok) {
        console.log('  ✓', PROVIDER.parseContent({ choices: [{ message: { content: rawBody } }] })?.substring(0, 50) || rawBody.substring(0, 50));
        return true;
    }

    console.error(`  ✗ Status ${status}`);
    if (status === 402) {
        console.error('  → DeepSeek balance is empty. Top up at https://platform.deepseek.com');
    } else if (status === 401 || status === 403) {
        console.error('  → API key invalid or revoked.');
    } else {
        console.error('  Raw response:', rawBody.substring(0, 300));
    }
    return false;
}

// ---------- Open Library description ----------
async function fetchDescription(title, author) {
    try {
        // Step 1: search for work key
        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=3&fields=key,title,author_name`;
        const { ok, parsedBody } = await safeApiCall(searchUrl);
        if (!ok || !parsedBody?.docs?.length) return { desc: '', hit: false };

        const docs = parsedBody.docs;
        // Author match heuristic
        let bestDoc = null;
        if (author) {
            const authorLower = author.toLowerCase();
            bestDoc = docs.find(doc => doc.author_name?.some(a => a.toLowerCase().includes(authorLower)));
        }
        if (!bestDoc) bestDoc = docs[0];

        const workKey = bestDoc?.key;
        if (!workKey) return { desc: '', hit: false };

        // Step 2: fetch work details (description lives on /works/OLID.json)
        const workUrl = `https://openlibrary.org${workKey}.json`;
        const { ok: workOk, parsedBody: workData } = await safeApiCall(workUrl);
        if (!workOk || !workData) return { desc: '', hit: false };

        let desc = workData.description;
        if (typeof desc === 'object' && desc?.value) desc = desc.value;
        if (typeof desc === 'string' && desc.trim().length > 0) {
            return { desc: desc.substring(0, 600), hit: true };
        }
        return { desc: '', hit: false };
    } catch (err) {
        console.error('  ⚠ Open Library fetch error:', err.message);
        return { desc: '', hit: false };
    }
}

// ---------- evaluate spice ----------
async function evaluateSpice(title, author, description, attempt = 0) {
    const prompt = `Rate the sexual explicitness (spice level) of this book on a scale of 0-5.

0: No romance, completely clean.
1: Mild romance, kissing only, fade-to-black.
2: Some romantic scenes, implied intimacy.
3: Moderate explicit content, a few detailed scenes.
4: Frequent explicit content, detailed descriptions.
5: Erotica, extremely explicit, graphic.

Book: "${title}"${author ? ` by ${author}` : ''}
${description ? `Description: ${description}` : ''}

Return strictly JSON: {"spice": number, "reasoning": "brief reason"}`;   // “json” appears

    const { res, status, rawBody, ok, parsedBody } = await safeApiCall(PROVIDER.baseUrl, {
        method: 'POST',
        headers: PROVIDER.headers(),
        body: JSON.stringify(PROVIDER.buildBody(prompt)),
    });

    if (!ok) {
        console.error(`  ✗ API status ${status}`);
        if (status === 402) console.error('  → Insufficient balance.');
        if (status === 401 || status === 403) console.error('  → Key issue.');

        if (isRetryable(status) && attempt < CONFIG.MAX_RETRIES) {
            const retryAfter = extractRetryAfter(res) || CONFIG.INITIAL_DELAY * Math.pow(2, attempt);
            console.log(`  🔄 Retrying in ${Math.round(retryAfter/1000)}s (attempt ${attempt+1}/${CONFIG.MAX_RETRIES})…`);
            await sleep(retryAfter);
            return evaluateSpice(title, author, description, attempt + 1);
        }
        return null;
    }

    const content = PROVIDER.parseContent(parsedBody);
    if (!content) {
        console.error('  ✗ Empty response content');
        return null;
    }

    // Robust JSON extraction: strip code fences and whitespace
    let jsonStr = content.replace(/```json\s*|\s*```/g, '').trim();
    try {
        const result = JSON.parse(jsonStr);
        if (typeof result.spice === 'number' && result.spice >= 0 && result.spice <= 5) {
            return {
                spice: Math.round(result.spice),
                reasoning: result.reasoning || 'No reasoning',
            };
        }
        console.error('  ✗ Invalid spice value:', result.spice);
        return null;
    } catch (e) {
        console.error('  ✗ JSON parse error:', e.message, 'Raw:', content.substring(0, 200));
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)
        return null;
    }
}

<<<<<<< HEAD
// ============== Update Database ==============
async function updateBookSpice(bookId, spice, reasoning) {
=======
// ---------- update Supabase ----------
async function updateBook(bookId, spice, reasoning) {
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)
    const { error } = await supabase
        .from('books')
        .update({ spice, spice_reasoning: reasoning })
        .eq('id', bookId);

    if (error) {
<<<<<<< HEAD
        console.error(`  ✗ Update failed: ${error.message}`);
=======
        console.error(`  ✗ DB update error: ${error.message}`);
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)
        return false;
    }
    console.log(`  💾 Saved: spice=${spice}`);
    return true;
}

<<<<<<< HEAD
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
=======
// ---------- main ----------
async function main() {
    console.log(`🌶️  New‑book spice evaluator (${PROVIDER.name})`);
    console.log('='.repeat(50));

    const apiOk = await testProvider();
    if (!apiOk) {
        console.error('\n❌ Provider check failed. See above for details.');
        process.exit(1);
    }

    console.log('\n📚 Querying books where spice IS NULL…\n');

    const { data: books, error: queryError, count } = await supabase
        .from('books')
        .select('id, title, author', { count: 'exact' })
        .is('spice', null)
        .order('created_at', { ascending: false })
        .limit(CONFIG.LIMIT);

    if (queryError) {
        console.error('❌ Supabase query error:', queryError.message);
        process.exit(1);
    }

    if (!books || books.length === 0) {
        console.log('✅ No new books to evaluate.');
        process.exit(0);
    }

    console.log(`📊 ${count ?? '?'} books remain, processing ${books.length} now.\n`);

    let success = 0, failed = 0, descHit = 0;

    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        console.log(`[${i+1}/${books.length}] "${book.title}"`);
        console.log(`   Author: ${book.author || 'Unknown'}`);

        const { desc, hit } = await fetchDescription(book.title, book.author);
        if (hit) descHit++;
        console.log(`  ${hit ? '✓' : '⚠'} Description ${hit ? `(${desc.length} chars)` : 'not found'}`);

        const result = await evaluateSpice(book.title, book.author, desc);
        if (result) {
            console.log(`  🌶️  ${result.spice}/5 – ${result.reasoning}`);
            if (await updateBook(book.id, result.spice, result.reasoning)) success++;
            else failed++;
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)
        } else {
            failed++;
        }

        console.log('');
<<<<<<< HEAD
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
=======
        if (i < books.length - 1) await sleep(CONFIG.INITIAL_DELAY);
    }

    console.log('='.repeat(50));
    console.log(`✅ Success: ${success}  |  ❌ Failed: ${failed}  |  📖 Description hit rate: ${descHit}/${books.length}`);
    console.log('='.repeat(50));

    const remaining = (count ?? 0) - books.length;
    if (remaining > 0) console.log(`\n💡 ${remaining} book(s) left. Run the script again to continue.`);
    else console.log('\n🎉 All new books processed!');
>>>>>>> c0caf34 (fix(library): support real-time spice update & add onSpiceEvaluated callback)
}

main().catch(console.error);