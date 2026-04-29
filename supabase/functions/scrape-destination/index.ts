// Wikipedia-based destination scraper — India tourism only
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const guessType = (text: string): string => {
  const t = text.toLowerCase();
  if (/(temple|shrine|ashram|ghat|spiritual|pilgrim|monastery|gurudwara)/.test(t)) return "Spiritual";
  if (/(beach|coast|shore|island)/.test(t)) return "Beach";
  if (/(wildlife|sanctuary|national park|tiger|reserve|safari)/.test(t)) return "Wildlife";
  if (/(trek|mountain|adventure|river rafting|paragliding|ski|climbing)/.test(t)) return "Adventure";
  if (/(lake|forest|hill station|valley|backwater|nature|garden|waterfall)/.test(t)) return "Nature";
  return "Heritage";
};

// Allow-list keywords — title or extract must contain at least one
const RELEVANT = [
  "tourism", "travel", "visit", "destination", "attraction", "india", "indian",
  "national park", "beach", "fort", "temple", "monument", "palace", "hill station",
  "waterfall", "lake", "wildlife", "trekking", "resort", "heritage", "sanctuary",
  "mountain", "valley", "backwater", "shrine", "monastery", "tourist",
];
// Block-list — discard if title clearly matches these (broad topics)
const BLOCKED_TITLE = [
  /^flag of/i,
  /^cuisine of/i,
  /^history of /i,
  /^religion in/i,
  /^politics of/i,
  /^economy of/i,
  /^demographics of/i,
  /^geography of/i,
  /^outline of/i,
];

const isRelevant = (title: string, extract: string): boolean => {
  if (BLOCKED_TITLE.some((re) => re.test(title))) return false;
  const blob = `${title} ${extract}`.toLowerCase();
  return RELEVANT.some((k) => blob.includes(k));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let query = "";
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      query = (body?.query ?? "").toString().trim();
    } else {
      query = (new URL(req.url).searchParams.get("query") ?? "").trim();
    }
    if (!query) return json({ error: "Missing query" }, 400);

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query + " India tourism travel destination",
    )}&format=json&origin=*&srlimit=8`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error("wiki search failed");
    const searchData = await searchRes.json();
    const hits: { title: string }[] = searchData?.query?.search ?? [];
    if (!hits.length) return json({ results: [] });

    // Fetch summaries for top 6, then filter for relevance
    const top = hits.slice(0, 6);
    const summaries = await Promise.all(
      top.map(async (hit) => {
        try {
          const sumRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
          );
          if (!sumRes.ok) return null;
          const sum = await sumRes.json();
          if (sum?.type === "disambiguation") return null;

          const description: string = sum?.extract ?? "";
          const name: string = sum?.title ?? hit.title;
          if (!isRelevant(name, description)) return null;

          const image_url: string | null =
            sum?.thumbnail?.source ?? sum?.originalimage?.source ?? null;
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

    const results = summaries.filter(Boolean).slice(0, 3);
    return json({ results, query });
  } catch (e) {
    console.error("scrape error", e);
    return json({ error: (e as Error).message ?? "scrape failed" }, 500);
  }
});
