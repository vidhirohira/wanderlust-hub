// Wikipedia-based destination scraper
// Public endpoint — anyone can call. Uses Wikipedia REST API (no key required).
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const fallbackCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const headers = (corsHeaders as Record<string, string>) ?? fallbackCors;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });

const guessType = (text: string): string => {
  const t = text.toLowerCase();
  if (/(temple|shrine|ashram|ghat|spiritual|pilgrim)/.test(t)) return "Spiritual";
  if (/(beach|coast|shore)/.test(t)) return "Beach";
  if (/(wildlife|sanctuary|national park|tiger|reserve)/.test(t)) return "Wildlife";
  if (/(trek|mountain|adventure|river rafting|paragliding|ski)/.test(t)) return "Adventure";
  if (/(lake|forest|hill|valley|backwater|nature|garden)/.test(t)) return "Nature";
  return "Heritage";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    let query = "";
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      query = (body?.query ?? "").toString().trim();
    } else {
      query = (new URL(req.url).searchParams.get("query") ?? "").trim();
    }
    if (!query) return json({ error: "Missing query" }, 400);

    // 1. Search Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query + " India tourism",
    )}&format=json&origin=*&srlimit=5`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error("wiki search failed");
    const searchData = await searchRes.json();
    const hits = searchData?.query?.search ?? [];
    if (!hits.length) return json({ results: [] });

    // 2. For top 3 hits, fetch summary
    const top = hits.slice(0, 3);
    const summaries = await Promise.all(
      top.map(async (hit: { title: string }) => {
        try {
          const sumRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
          );
          if (!sumRes.ok) return null;
          const sum = await sumRes.json();
          if (sum?.type === "disambiguation") return null;

          const description: string = sum?.extract ?? "";
          const name: string = sum?.title ?? hit.title;
          const image_url: string | null = sum?.thumbnail?.source ?? sum?.originalimage?.source ?? null;
          // Try to extract location from description
          const loc = description.match(/in\s+([A-Z][a-zA-Z\s]+?)(?:,|\.| state| district)/);
          const city = loc?.[1]?.trim() ?? "—";
          const type = guessType(`${name} ${description}`);

          return {
            name,
            city,
            state: "India",
            type,
            description: description.slice(0, 600),
            image_url,
            entry_fee_indian: null,
            entry_fee_foreigner: null,
            timings: null,
            best_time: null,
            tags: [type, "Wikipedia"],
            rating: 4.0,
            source: "wikipedia",
            source_url: sum?.content_urls?.desktop?.page ?? null,
          };
        } catch {
          return null;
        }
      }),
    );

    const results = summaries.filter(Boolean);
    return json({ results, query });
  } catch (e) {
    console.error("scrape error", e);
    return json({ error: (e as Error).message ?? "scrape failed" }, 500);
  }
});
