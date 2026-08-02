// scripts/batch-update-spice-ds.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// 环境变量检查
console.log('🔧 环境变量检查:');
console.log('  SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓' : '✗');
console.log('  SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
console.log('  DEEPSEEK_KEY:', process.env.VITE_DEEPSEEK_API_KEY ? '✓' : '✗');
console.log('');

const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DEEPSEEK_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ 缺少必要的环境变量');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CONFIG = {
    LIMIT: 10,
    DELAY_BETWEEN_BOOKS: 1000,
    MAX_RETRIES: 2,
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🔧 测试 DeepSeek API 连接
async function testDeepSeek() {
    console.log('🔍 测试 DeepSeek API...');
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
            console.error('  ✗ 失败:', JSON.stringify(err));
            return false;
        }

        const data = await res.json();
        console.log('  ✓ 成功:', data.choices?.[0]?.message?.content);
        return true;
    } catch (e) {
        console.error('  ✗ 网络错误:', e.message);
        return false;
    }
}

// 获取书籍简介
async function getBookDescription(title, author) {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=3&fields=key,title,author_name,description`;
        const res = await fetch(url);

        // 🔧 检查 HTTP 状态
        if (!res.ok) {
            console.error(`  ⚠ Open Library 返回 ${res.status}`);
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
            console.error(`  ⚠ Open Library 返回 0 个结果`);
        }
    } catch (error) {
        console.error(`  ⚠ Open Library 失败: ${error.message}`);
    }
    return '';
}

// 🔧 DeepSeek 版本的评估函数（正确的请求格式）
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
        // 🔧 DeepSeek 正确的请求格式
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
            throw new Error(`DeepSeek 错误 (${res.status}): ${JSON.stringify(err)}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('DeepSeek 返回空内容');
        }

        // 解析 JSON
        const result = JSON.parse(content);

        if (typeof result.spice === 'number' && result.spice >= 0 && result.spice <= 5) {
            return {
                spice: Math.round(result.spice),
                reasoning: result.reasoning || 'No reasoning'
            };
        }

        throw new Error(`无效的 spice 值: ${result.spice}`);

    } catch (error) {
        console.error(`  ✗ 评估失败: ${error.message}`);

        if (retryCount < CONFIG.MAX_RETRIES) {
            console.log(`  🔄 重试 (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`);
            await sleep(1000);
            return evaluateSpice(title, author, description, retryCount + 1);
        }

        return null;
    }
}

// 更新数据库
async function updateBookSpice(bookId, spice, reasoning) {
    const { error } = await supabase
        .from('books')
        .update({
            spice: spice,
            spice_reasoning: reasoning,
        })
        .eq('id', bookId);

    if (error) {
        console.error(`  ✗ 更新失败: ${error.message}`);
        return false;
    }

    console.log(`  💾 已保存: spice=${spice}`);
    return true;
}

// 主函数
async function main() {
    console.log('🌶️  Spice 批量评估 (DeepSeek)\n');

    // 先测试 API
    const apiOk = await testDeepSeek();
    if (!apiOk) {
        console.error('\n❌ DeepSeek API 不可用，请检查 API Key 和余额');
        console.error('   免费版需要充值（最低 $1）: https://platform.deepseek.com/');
        process.exit(1);
    }

    console.log('\n📚 查询未评估的书籍...\n');

    const { data: books } = await supabase
        .from('books')
        .select('id, title, author')
        .or('spice.is.null,spice.eq.0')
        .order('created_at', { ascending: false })
        .limit(CONFIG.LIMIT);

    if (!books || books.length === 0) {
        console.log('✅ 没有需要评估的书籍');
        process.exit(0);
    }

    console.log(`📊 处理 ${books.length} 本\n`);

    let success = 0, failed = 0;

    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        console.log(`[${i + 1}/${books.length}] "${book.title}"`);
        console.log(`  作者: ${book.author || 'Unknown'}`);

        const desc = await getBookDescription(book.title, book.author);
        console.log(`  ${desc ? `✓ 简介 (${desc.length}字)` : '⚠ 无简介'}`);

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
    console.log(`✅ 成功: ${success}  |  ❌ 失败: ${failed}`);
    console.log('='.repeat(50));
}

main().catch(console.error);