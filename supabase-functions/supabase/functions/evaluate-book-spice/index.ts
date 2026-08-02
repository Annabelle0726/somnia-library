// supabase/functions/evaluate-book-spice/index.ts
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 从 Supabase 环境变量读取
// @ts-ignore
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS 头
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 获取书籍描述
async function getBookDescription(title: string, author?: string | null): Promise<string> {
    try {
        const query = author ? `${title} ${author}` : title;
        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=description`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.docs?.[0]?.description) {
            let desc = data.docs[0].description;
            if (typeof desc === 'object' && desc.value) {
                desc = desc.value;
            }
            return typeof desc === 'string' ? desc : '';
        }
    } catch (error) {
        console.error("Failed to fetch book description:", error);
    }
    return '';
}

// 调用 Gemini 评估辣度
async function evaluateSpiceLevel(
    title: string,
    author?: string | null,
    synopsis?: string
): Promise<{ spice: number; reasoning: string } | null> {
    const prompt = `
    You are a book expert. Evaluate the "Spice Level" (sexual explicitness) of the following book on a scale of 0 to 5.
    - 0: No romantic or sexual content.
    - 1: Mild romance, kissing, fade-to-black.
    - 2-3: Moderate, some on-page explicit scenes.
    - 4-5: High frequency and very detailed explicit smut/erotica.
    
    Book Title: ${title}
    Author: ${author || 'Unknown'}
    Synopsis: ${synopsis || 'Not provided'}
    
    Return strictly in JSON format: {"spice": <number>, "reasoning": "<short 1-sentence explanation of why it gets this level>"}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API error:", errorData);

            // 如果是速率限制，抛出特定错误
            if (response.status === 429) {
                throw new Error('RATE_LIMITED');
            }
            return null;
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResponse) {
            const parsed = JSON.parse(textResponse);
            return {
                spice: parsed.spice,
                reasoning: parsed.reasoning
            };
        }
    } catch (error) {
        console.error("Error evaluating spice:", error);
        throw error;
    }

    return null;
}

// 更新单本书
async function updateBookSpice(
    bookId: string,
    spice: number,
    reasoning: string
): Promise<boolean> {
    const { error } = await supabase
        .from('books')
        .update({
            spice: spice,
            spice_reasoning: reasoning
        })
        .eq('id', bookId);

    if (error) {
        console.error("Failed to update book spice:", error);
        return false;
    }
    return true;
}

// 主服务处理
serve(async (req: Request) => {
    // 处理 CORS 预检请求
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const path = url.pathname.split('/').pop();

        // 批量评估
        if (req.method === 'POST' && path === 'batch-evaluate') {
            console.log("Starting batch evaluation...");

            // 获取需要评估的书籍（spice 为 null 或 0 的）
            const { data: books, error } = await supabase
                .from('books')
                .select('id, title, author, isbn')
                .or('spice.is.null,spice.eq.0')
                .limit(50);  // 每次处理50本

            if (error) {
                throw new Error(`Failed to fetch books: ${error.message}`);
            }

            if (!books || books.length === 0) {
                return new Response(
                    JSON.stringify({
                        message: "All books already have spice levels!",
                        count: 0
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            console.log(`Found ${books.length} books to evaluate`);

            const results = [];
            let successCount = 0;
            let failCount = 0;

            for (const book of books) {
                console.log(`Processing: "${book.title}"`);

                try {
                    // 获取描述
                    const description = await getBookDescription(book.title, book.author);

                    // 评估辣度
                    const evaluation = await evaluateSpiceLevel(book.title, book.author, description);

                    if (evaluation) {
                        // 更新数据库
                        const updated = await updateBookSpice(book.id, evaluation.spice, evaluation.reasoning);

                        if (updated) {
                            results.push({
                                id: book.id,
                                title: book.title,
                                spice: evaluation.spice,
                                reasoning: evaluation.reasoning,
                                success: true
                            });
                            successCount++;
                            console.log(`  ✓ ${book.title} → ${evaluation.spice}/5`);
                        } else {
                            throw new Error('Database update failed');
                        }
                    } else {
                        throw new Error('Evaluation returned null');
                    }
                } catch (error: any) {
                    results.push({
                        id: book.id,
                        title: book.title,
                        success: false,
                        error: error.message
                    });
                    failCount++;
                    console.log(`  ✗ ${book.title} → ${error.message}`);

                    // 如果遇到速率限制，等待更长时间
                    if (error.message === 'RATE_LIMITED') {
                        console.log('Rate limited, waiting 10 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                }

                // 每本书之间延迟1秒，避免 API 限制
                if (books.indexOf(book) < books.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            return new Response(
                JSON.stringify({
                    message: `Processed ${results.length} books`,
                    success: successCount,
                    failed: failCount,
                    results
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 单本评估（用于新书添加时）
        if (req.method === 'POST' && path === 'evaluate-single') {
            const body = await req.json();
            const { bookId, title, author } = body;

            if (!bookId || !title) {
                return new Response(
                    JSON.stringify({ error: 'bookId and title are required' }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                );
            }

            console.log(`Evaluating single book: "${title}"`);

            const description = await getBookDescription(title, author);
            const evaluation = await evaluateSpiceLevel(title, author, description);

            if (evaluation) {
                await updateBookSpice(bookId, evaluation.spice, evaluation.reasoning);

                return new Response(
                    JSON.stringify({
                        success: true,
                        spice: evaluation.spice,
                        reasoning: evaluation.reasoning
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            return new Response(
                JSON.stringify({ success: false, error: 'Failed to evaluate' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // 默认响应 - 显示可用端点
        return new Response(
            JSON.stringify({
                name: "Book Spice Evaluator",
                version: "1.0.0",
                endpoints: {
                    "POST /batch-evaluate": "Batch evaluate up to 50 books with missing spice levels",
                    "POST /evaluate-single": "Evaluate a single book (requires {bookId, title, author} in body)"
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("Server error:", error);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                message: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});