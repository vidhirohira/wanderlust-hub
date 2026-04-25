import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/lib/types";
import { DESTINATION_TYPES } from "@/lib/types";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDetail } from "@/components/DestinationDetail";
import { cn } from "@/lib/utils";

type Budget = "all" | "free" | "low" | "mid" | "high";

const parseFee = (s: string | null) => {
  if (!s || /free/i.test(s)) return 0;
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

const Destinations = () => {
  const [params] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState<Budget>("all");
  const [selected, setSelected] = useState<Destination | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase
      .from("destinations")
      .select("*")
      .order("rating", { ascending: false })
      .then(({ data }) => setDestinations((data as Destination[]) ?? []));
  }, []);

  const allStates = useMemo(
    () => Array.from(new Set(destinations.map((d) => d.state))).sort(),
    [destinations],
  );

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.city.toLowerCase().includes(q)) return false;
      }
      if (types.size && !types.has(d.type)) return false;
      if (states.size && !states.has(d.state)) return false;
      const fee = parseFee(d.entry_fee_indian);
      if (budget === "free" && fee > 0) return false;
      if (budget === "low" && (fee === 0 || fee > 100)) return false;
      if (budget === "mid" && (fee <= 100 || fee > 500)) return false;
      if (budget === "high" && fee <= 500) return false;
      return true;
    });
  }, [destinations, search, types, states, budget]);

  const toggle = (set: Set<string>, val: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  return (
    <div className="container py-12">
      <div className="mb-10">
        <span className="text-sm font-semibold text-accent uppercase tracking-widest">Explore</span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-2">
          Every <span className="text-gradient-primary">destination</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
          Heritage, nature, beach, adventure, wildlife & spiritual journeys curated across India.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className={cn("lg:w-72 lg:shrink-0", showFilters ? "block" : "hidden lg:block")}>
          <div className="sticky top-24 space-y-6 p-5 rounded-2xl bg-card border border-border shadow-soft">
            <FilterGroup title="Type">
              {DESTINATION_TYPES.map((t) => (
                <Chip key={t} active={types.has(t)} onClick={() => toggle(types, t, setTypes)}>
                  {t}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup title="State">
              {allStates.map((s) => (
                <Chip key={s} active={states.has(s)} onClick={() => toggle(states, s, setStates)}>
                  {s}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup title="Budget (Entry Fee)">
              {([
                ["all", "Any"],
                ["free", "Free"],
                ["low", "≤ ₹100"],
                ["mid", "₹100 – ₹500"],
                ["high", "₹500+"],
              ] as [Budget, string][]).map(([k, label]) => (
                <Chip key={k} active={budget === k} onClick={() => setBudget(k)}>
                  {label}
                </Chip>
              ))}
            </FilterGroup>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setTypes(new Set());
                setStates(new Set());
                setBudget("all");
                setSearch("");
              }}
            >
              Reset filters
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-6">
            <div className="flex items-center gap-2 flex-1 px-4 py-2 rounded-full bg-card border border-border shadow-soft">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or city..."
                className="border-0 shadow-none focus-visible:ring-0 px-0"
              />
            </div>
            <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> destination
            {filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((d) => (
              <DestinationCard key={d.id} destination={d} onClick={() => setSelected(d)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 rounded-2xl bg-secondary/40">
              <p className="text-muted-foreground">No destinations match your filters.</p>
            </div>
          )}
        </div>
      </div>

      <DestinationDetail destination={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
};

const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{title}</h3>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const Chip = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-smooth",
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background hover:bg-secondary border-border text-foreground/70",
    )}
  >
    {children}
  </button>
);

export default Destinations;
