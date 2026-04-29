import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, MapPin, Building2, UtensilsCrossed, Bus, Globe, Loader2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Destination, Hotel, Restaurant, Transport, ScrapedDestination } from "@/lib/types";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDetail } from "@/components/DestinationDetail";
import { WishlistButton } from "@/components/WishlistButton";
import { resolveImage } from "@/lib/images";
import { cn } from "@/lib/utils";

const WebWishlistBtn = ({ scraped }: { scraped: ScrapedDestination }) => (
  <WishlistButton scraped={scraped} />
);

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [transport, setTransport] = useState<Transport[]>([]);
  const [scraped, setScraped] = useState<ScrapedDestination[] | null>(null);
  const [scraping, setScraping] = useState(false);
  const [selected, setSelected] = useState<Destination | null>(null);

  useEffect(() => setInput(q), [q]);

  useEffect(() => {
    if (!q.trim()) return;
    const run = async () => {
      setLoading(true);
      setScraped(null);
      const term = `%${q.trim()}%`;
      const [d, h, r, t] = await Promise.all([
        supabase
          .from("destinations")
          .select("*")
          .or(`name.ilike.${term},city.ilike.${term},state.ilike.${term},description.ilike.${term}`),
        supabase
          .from("hotels")
          .select("*")
          .or(`name.ilike.${term},city.ilike.${term}`),
        supabase
          .from("restaurants")
          .select("*")
          .or(`name.ilike.${term},city.ilike.${term},cuisine.ilike.${term},specialty.ilike.${term}`),
        supabase
          .from("transport")
          .select("*")
          .or(`from_city.ilike.${term},to_city.ilike.${term},mode.ilike.${term}`),
      ]);
      const dArr = (d.data as Destination[]) ?? [];
      const hArr = (h.data as Hotel[]) ?? [];
      const rArr = (r.data as Restaurant[]) ?? [];
      const tArr = (t.data as Transport[]) ?? [];
      setDestinations(dArr);
      setHotels(hArr);
      setRestaurants(rArr);
      setTransport(tArr);

      const totalCount = dArr.length + hArr.length + rArr.length + tArr.length;

      // Log search
      await supabase.from("search_logs").insert({
        user_id: user?.id ?? null,
        search_query: q.trim(),
        results_count: totalCount,
      });

      // Auto-trigger scrape if no DB results
      if (totalCount === 0) {
        setScraping(true);
        try {
          const { data: scrapeData, error } = await supabase.functions.invoke("scrape-destination", {
            body: { query: q.trim() },
          });
          if (!error && scrapeData?.results) {
            setScraped(scrapeData.results as ScrapedDestination[]);
            // Queue for manager review
            for (const item of scrapeData.results as ScrapedDestination[]) {
              await supabase.from("scrape_queue").insert({
                query: q.trim(),
                status: "pending",
                triggered_by: "auto",
                scraped_data: item as never,
              });
            }
          }
        } catch (e) {
          console.error(e);
        }
        setScraping(false);
      }
      setLoading(false);
    };
    void run();
  }, [q, user?.id]);

  const totalDb = destinations.length + hotels.length + restaurants.length + transport.length;

  return (
    <div className="container py-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ q: input });
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft max-w-2xl mb-8"
      >
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search the entire catalog…"
          className="border-0 shadow-none focus-visible:ring-0 px-0"
        />
        <Button type="submit" variant="hero" size="sm">
          Search
        </Button>
      </form>

      {q && (
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl">
            Results for <span className="text-gradient-primary">"{q}"</span>
          </h1>
          {!loading && (
            <p className="text-muted-foreground mt-1">
              {totalDb} match{totalDb !== 1 ? "es" : ""} in catalog
              {scraped && ` · ${scraped.length} from the web`}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      )}

      {!loading && q && (
        <div className="space-y-12">
          {destinations.length > 0 && (
            <Section icon={MapPin} title="Destinations" count={destinations.length}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((d) => (
                  <DestinationCard key={d.id} destination={d} onClick={() => setSelected(d)} />
                ))}
              </div>
            </Section>
          )}

          {hotels.length > 0 && (
            <Section icon={Building2} title="Hotels" count={hotels.length}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotels.map((h) => (
                  <div key={h.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                    <h3 className="font-bold">{h.name}</h3>
                    <p className="text-xs text-muted-foreground">{h.city} · {h.type}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-bold text-primary">₹{h.price_per_night.toLocaleString()}/night</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent text-accent" />{h.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {restaurants.length > 0 && (
            <Section icon={UtensilsCrossed} title="Restaurants" count={restaurants.length}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((r) => (
                  <div key={r.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                    <h3 className="font-bold">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.cuisine} · {r.city}</p>
                    {r.specialty && <p className="text-xs mt-2">⭐ {r.specialty}</p>}
                    <div className="mt-3 text-sm font-bold text-primary">{r.price_range}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {transport.length > 0 && (
            <Section icon={Bus} title="Transport routes" count={transport.length}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {transport.map((t) => (
                  <div key={t.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                    <div className="text-xs uppercase font-bold text-accent">{t.mode}</div>
                    <h3 className="font-bold mt-1">{t.from_city} → {t.to_city}</h3>
                    <div className="mt-2 text-xs text-muted-foreground">{t.duration} · {t.operator ?? "—"}</div>
                    <div className="mt-3 font-bold text-primary text-sm">
                      ₹{t.cost_min}–{t.cost_max}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* From the web */}
          {(scraping || scraped) && (
            <Section icon={Globe} title="🌐 From the web (Wikipedia)" count={scraped?.length ?? 0}>
              {scraping && (
                <div className="flex items-center gap-3 p-6 bg-secondary/40 rounded-2xl">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm">Searching the web…</span>
                </div>
              )}
              {!scraping && scraped && scraped.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scraped.map((s, i) => (
                    <div key={i} className="relative bg-card border-2 border-dashed border-accent/40 rounded-2xl overflow-hidden shadow-soft">
                      {s.image_url && (
                        <div className="aspect-video bg-muted overflow-hidden relative">
                          <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
                          <div className="absolute top-3 right-3">
                            <WebWishlistBtn scraped={s} />
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-accent/20 text-accent-foreground border border-accent/30 mb-2">
                          From the web
                        </span>
                        <h3 className="font-bold">{s.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.city}</p>
                        <p className="text-xs mt-2 line-clamp-3">{s.description}</p>
                        {s.source_url && (
                          <a
                            href={s.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary font-semibold mt-3 inline-block"
                          >
                            Read on Wikipedia →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!scraping && scraped && scraped.length === 0 && (
                <p className="text-sm text-muted-foreground p-4 bg-secondary/40 rounded-2xl">
                  No results found. Try searching for a specific Indian destination like "Manali" or "Coorg".
                </p>
              )}
            </Section>
          )}

          {totalDb === 0 && !scraping && !scraped && (
            <div className="text-center py-20 rounded-3xl bg-secondary/30">
              <p className="text-muted-foreground">
                No results found. Try searching for a specific Indian destination like "Manali" or "Coorg".
              </p>
            </div>
          )}
        </div>
      )}

      <DestinationDetail destination={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
};

const Section = ({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  children: React.ReactNode;
}) => (
  <section>
    <div className="flex items-center gap-2 mb-5">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="font-display font-bold text-xl">{title}</h2>
      <span className="text-sm text-muted-foreground">({count})</span>
    </div>
    {children}
  </section>
);

export default SearchPage;
