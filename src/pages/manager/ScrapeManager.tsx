import { useEffect, useState } from "react";
import { Globe, Loader2, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { ScrapeQueue, ScrapedDestination } from "@/lib/types";
import { toast } from "sonner";

const ScrapeManager = () => {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<ScrapeQueue[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("scrape_queue")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data as ScrapeQueue[]) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const runScrape = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-destination", {
        body: { query: query.trim() },
      });
      if (error) throw error;
      const results = (data?.results ?? []) as ScrapedDestination[];
      if (!results.length) {
        toast.error("Nothing found on the web.");
      } else {
        for (const r of results) {
          await supabase.from("scrape_queue").insert({
            query: query.trim(),
            status: "pending",
            triggered_by: "manual",
            scraped_data: r as never,
          });
        }
        toast.success(`Queued ${results.length} result(s)`);
        setQuery("");
        await load();
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(false);
  };

  const approve = async (item: ScrapeQueue) => {
    const d = item.scraped_data;
    if (!d) return;
    const { error } = await supabase.from("destinations").insert({
      name: d.name,
      city: d.city,
      state: d.state,
      type: d.type,
      description: d.description,
      image_url: d.image_url,
      entry_fee_indian: d.entry_fee_indian,
      entry_fee_foreigner: d.entry_fee_foreigner,
      timings: d.timings,
      best_time: d.best_time,
      tags: d.tags,
      rating: d.rating,
    });
    if (error) return toast.error(error.message);
    await supabase
      .from("scrape_queue")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", item.id);
    toast.success("Added to destinations");
    await load();
  };

  const reject = async (id: string) => {
    await supabase
      .from("scrape_queue")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    toast.success("Rejected");
    await load();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl flex items-center gap-2">
          <Globe className="h-7 w-7 text-primary" /> Scrape Manager
        </h1>
        <p className="text-muted-foreground mt-1">Pull new destinations from the web (Wikipedia).</p>
      </header>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 rounded-xl border border-border bg-background">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "Mysore Palace" or "Andaman Islands"'
              className="border-0 shadow-none focus-visible:ring-0 px-0"
              onKeyDown={(e) => e.key === "Enter" && runScrape()}
            />
          </div>
          <Button onClick={runScrape} disabled={busy} variant="hero">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scrape"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground p-6 bg-secondary/30 rounded-2xl text-center">
            No scrapes yet. Try one above.
          </p>
        )}
        {items.map((it) => {
          const d = it.scraped_data;
          return (
            <div key={it.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
              {d?.image_url && (
                <img src={d.image_url} alt={d.name} className="h-24 w-32 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold">{d?.name ?? it.query}</h3>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      it.status === "pending"
                        ? "bg-accent/20 text-accent-foreground"
                        : it.status === "approved"
                        ? "bg-primary/20 text-primary"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {it.status}
                  </span>
                  <span className="text-[10px] uppercase text-muted-foreground">{it.triggered_by}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  query: "{it.query}" · {new Date(it.created_at).toLocaleString()}
                </p>
                {d?.description && <p className="text-xs mt-2 line-clamp-2">{d.description}</p>}
              </div>
              {it.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="hero" onClick={() => approve(it)}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reject(it.id)} className="text-destructive">
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrapeManager;
