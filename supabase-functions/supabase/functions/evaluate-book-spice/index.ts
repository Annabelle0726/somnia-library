// supabase/functions/bright-responder/index.ts
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-ignore
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY")!;
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookPayload {
    id: string;
    title: string;
    author: string | null;
}

// ========== Open Library ==========
async function fetchDescription(title: string, author: string | null): Promise<string> {
    try {
        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=3&fields=key,author_name`;
        const res = await fetch(searchUrl);
        const data = await res.json();
        if (!data.docs?.length) return "";

        let bestDoc = null;
        if (author) {
            const lower = author.toLowerCase();
            bestDoc = data.docs.find((d: any) =>
                d.author_name?.some((a: string) => a.toLowerCase().includes(lower))
            );
        }
        if (!bestDoc) bestDoc = data.docs[0];
        const workKey = bestDoc?.key;
        if (!workKey) return "";

        const workUrl = `https://openlibrary.org${workKey}.json`;
        const workRes = await fetch(workUrl);
        const workData = await workRes.json();
        let desc = workData.description;
        if (typeof desc === "object" && desc?.value) desc = desc.value;
        return typeof desc === "string" ? desc.substring(0, 600) : "";
    } catch {
        return "";
    }
}

// ========== DeepSeek ==========
async function evaluateSpice(
    title: string,
    author: string | null,
    description: string
): Promise<{ spice: number; reasoning: string } | null> {
    const prompt = `Rate this book's explicit/romance content level on a scale of 0-5.
0: No romance, clean. 1: Kissing only. 2: Implied. 3: Moderate detail. 4: Frequent detail. 5: Erotica.
Book: "${title}"${author ? ` by ${author}` : ""}
${description ? `Description: ${description}` : ""}
Return ONLY JSON: {"spice": number, "reasoning": "brief reason"}`;

    try {
        const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Return only valid JSON." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 150,
                temperature: 0.3,
                response_format: { type: "json_object" },
            }),
        });

        if (!res.ok) {
            console.error(`DeepSeek error ${res.status}`);
            return null;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) return null;

        const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
        const result = JSON.parse(cleaned);
        if (typeof result.spice === "number" && result.spice >= 0 && result.spice <= 5) {
            return { spice: Math.round(result.spice), reasoning: result.reasoning || "" };
        }
        return null;
    } catch (e) {
        console.error("Evaluate error:", e);
        return null;
    }
}

// ========== Main handler ==========
serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const rawPayload = await req.json();

        // 💡 关键修改：如果是 Webhook 触发，数据在 rawPayload.record 里；如果是手动调，数据在 rawPayload 里
        const payload: BookPayload = rawPayload.record ? rawPayload.record : rawPayload;
        const { id, title, author } = payload;

        if (!id || !title) {
            return new Response(JSON.stringify({ error: "Missing id or title" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log(`Evaluating: "${title}"`);

        // 1. Get description
        const description = await fetchDescription(title, author);
        console.log(`  Description: ${description ? "found" : "not found"}`);

        // 2. Evaluate
        const result = await evaluateSpice(title, author, description);
        if (!result) {
            return new Response(JSON.stringify({ error: "Evaluation failed" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log(`  Spice: ${result.spice}/5`);

        // 3. Update database
        const { error: updateError } = await supabase
            .from("books")
            .update({ spice: result.spice, spice_reasoning: result.reasoning })
            .eq("id", id);

        if (updateError) {
            console.error("DB update error:", updateError);
            return new Response(JSON.stringify({ error: "DB update failed" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(
            JSON.stringify({ success: true, spice: result.spice, reasoning: result.reasoning }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});