import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Building2, UtensilsCrossed, Bus, Globe, Clock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type SearchResult =
  | { kind: "destination"; id: string; name: string; sub: string }
  | { kind: "hotel"; id: string; name: string; sub: string }
  | { kind: "restaurant"; id: string; name: string; sub: string }
  | { kind: "transport"; id: string; name: string; sub: string };

const ICONS = {
  destination: MapPin,
  hotel: Building2,
  restaurant: UtensilsCrossed,
  transport: Bus,
};

export const GlobalSearch = ({ compact = false }: { compact?: boolean }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // load recent searches when focused / user changes
  useEffect(() => {
    if (!user) {
      setRecent([]);
      return;
    }
    supabase
      .from("search_logs")
      .select("search_query")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const r of (data ?? []) as { search_query: string }[]) {
          if (!seen.has(r.search_query)) {
            seen.add(r.search_query);
            out.push(r.search_query);
          }
        }
        setRecent(out);
      });
  }, [user]);

  // debounced live suggestions
  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const term = `%${q.trim()}%`;
      const [d, h, r, tr] = await Promise.all([
        supabase
          .from("destinations")
          .select("id,name,city,state")
          .or(`name.ilike.${term},city.ilike.${term},state.ilike.${term}`)
          .limit(3),
        supabase
          .from("hotels")
          .select("id,name,city")
          .or(`name.ilike.${term},city.ilike.${term}`)
          .limit(2),
        supabase
          .from("restaurants")
          .select("id,name,city,cuisine")
          .or(`name.ilike.${term},city.ilike.${term},cuisine.ilike.${term}`)
          .limit(2),
        supabase
          .from("transport")
          .select("id,from_city,to_city,mode")
          .or(`from_city.ilike.${term},to_city.ilike.${term}`)
          .limit(2),
      ]);

      const out: SearchResult[] = [];
      for (const x of (d.data ?? []) as { id: string; name: string; city: string; state: string }[])
        out.push({ kind: "destination", id: x.id, name: x.name, sub: `${x.city}, ${x.state}` });
      for (const x of (h.data ?? []) as { id: string; name: string; city: string }[])
        out.push({ kind: "hotel", id: x.id, name: x.name, sub: x.city });
      for (const x of (r.data ?? []) as { id: string; name: string; city: string; cuisine: string }[])
        out.push({ kind: "restaurant", id: x.id, name: x.name, sub: `${x.cuisine} • ${x.city}` });
      for (const x of (tr.data ?? []) as { id: string; from_city: string; to_city: string; mode: string }[])
        out.push({ kind: "transport", id: x.id, name: `${x.from_city} → ${x.to_city}`, sub: x.mode });

      setResults(out);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const submit = (term?: string) => {
    const v = (term ?? q).trim();
    if (!v) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(v)}`);
  };

  const showRecent = open && !q.trim() && recent.length > 0;
  const showResults = open && q.trim().length > 0;

  return (
    <div ref={wrap} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          "flex items-center gap-2 px-4 rounded-full border border-border bg-card shadow-soft transition-smooth",
          open && "ring-2 ring-primary/30",
          compact ? "py-1.5" : "py-2",
        )}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search destinations, hotels, restaurants…"
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-8"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </form>

      {(showResults || showRecent) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-elegant overflow-hidden z-50 animate-fade-in">
          {showRecent && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Recent
              </div>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => submit(r)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm flex items-center gap-2"
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  {r}
                </button>
              ))}
            </div>
          )}

          {showResults && (
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {results.length === 0 && !loading && (
                <button
                  type="button"
                  onClick={() => submit()}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-secondary text-sm flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-accent" />
                  <span>
                    No matches in catalog. <span className="font-semibold">Search the web</span> for "{q}"
                  </span>
                </button>
              )}
              {results.map((r) => {
                const Icon = ICONS[r.kind];
                return (
                  <button
                    key={`${r.kind}-${r.id}`}
                    type="button"
                    onClick={() => submit(r.name)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary flex items-center gap-3"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.sub}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {r.kind}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => submit()}
                className="w-full text-left px-3 py-2 mt-1 rounded-lg bg-primary/5 hover:bg-primary/10 text-sm font-semibold text-primary"
              >
                See all results for "{q}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
