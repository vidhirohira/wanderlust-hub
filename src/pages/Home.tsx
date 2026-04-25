import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Building2, Bus, Globe2, Sparkles, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/lib/types";
import { DESTINATION_TYPES } from "@/lib/types";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDetail } from "@/components/DestinationDetail";
import { typeColorClasses } from "@/lib/typeColor";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Destination | null>(null);

  useEffect(() => {
    supabase
      .from("destinations")
      .select("*")
      .order("rating", { ascending: false })
      .then(({ data }) => setDestinations((data as Destination[]) ?? []));
  }, []);

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      const matchType = filter === "All" || d.type === filter;
      return matchType;
    });
  }, [destinations, filter]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/destinations?q=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt="Taj Mahal at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="container relative z-10 py-20 md:py-28">
          <div className="max-w-3xl text-white animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/30 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Tourist Information Management System
            </span>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] mb-6">
              Discover the soul of <span className="text-accent">India</span>.
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              From the marble glow of the Taj to the turquoise of Pangong — plan iconic journeys across heritage,
              nature, beach, adventure, wildlife and spirit.
            </p>

            <form
              onSubmit={onSearch}
              className="flex flex-col sm:flex-row gap-3 p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-elegant max-w-2xl"
            >
              <div className="flex items-center gap-2 flex-1 px-4">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by city or attraction..."
                  className="border-0 shadow-none focus-visible:ring-0 px-0 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" variant="hero" size="lg">
                Explore
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 rounded-2xl bg-white/95 backdrop-blur-lg shadow-elegant">
              <Stat icon={MapPin} value="8+" label="Destinations" />
              <Stat icon={Building2} value="20+" label="Hotels & Stays" />
              <Stat icon={Bus} value="15+" label="Transport Routes" />
              <Stat icon={Globe2} value="6" label="Cities" />
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS + FEATURED */}
      <section className="container py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <span className="text-sm font-semibold text-accent uppercase tracking-widest">Featured</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-2">
              Where will you go <span className="text-gradient-primary">next?</span>
            </h2>
          </div>
          <Link to="/destinations">
            <Button variant="outline">View all destinations <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {(["All", ...DESTINATION_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold border transition-smooth",
                filter === t
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-background hover:bg-secondary border-border",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.slice(0, 8).map((d) => (
            <DestinationCard key={d.id} destination={d} onClick={() => setSelected(d)} />
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-glow p-10 md:p-16 text-primary-foreground">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <Star className="h-10 w-10 text-accent mb-4" />
            <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4">
              Plan smarter. Travel deeper.
            </h2>
            <p className="text-primary-foreground/85 text-lg mb-8">
              Find stays, transport routes and the best time to visit — all curated in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/stays">Browse Hotels</Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link to="/transport">Plan Transport</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DestinationDetail destination={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
};

const Stat = ({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <div className="font-display font-extrabold text-2xl leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  </div>
);

export default Home;
