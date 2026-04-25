import { useEffect, useMemo, useState } from "react";
import { Search, Star, Phone, MapPin, Wifi, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Hotel, Restaurant } from "@/lib/types";
import { cn } from "@/lib/utils";

const Stays = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");
  const [price, setPrice] = useState("All");

  useEffect(() => {
    supabase.from("hotels").select("*").order("rating", { ascending: false }).then(({ data }) =>
      setHotels((data as Hotel[]) ?? []),
    );
    supabase.from("restaurants").select("*").order("rating", { ascending: false }).then(({ data }) =>
      setRestaurants((data as Restaurant[]) ?? []),
    );
  }, []);

  const cities = useMemo(() => {
    const s = new Set<string>();
    hotels.forEach((h) => s.add(h.city));
    restaurants.forEach((r) => s.add(r.city));
    return ["All", ...Array.from(s).sort()];
  }, [hotels, restaurants]);

  const filteredHotels = useMemo(
    () =>
      hotels.filter((h) => {
        if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (city !== "All" && h.city !== city) return false;
        if (price !== "All" && h.type !== price) return false;
        return true;
      }),
    [hotels, search, city, price],
  );

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((r) => {
        if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (city !== "All" && r.city !== city) return false;
        if (price !== "All" && r.price_range !== price) return false;
        return true;
      }),
    [restaurants, search, city, price],
  );

  return (
    <div className="container py-12">
      <div className="mb-10">
        <span className="text-sm font-semibold text-accent uppercase tracking-widest">Where to stay & eat</span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-2">
          Stays & <span className="text-gradient-primary">flavours</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
          Hand-picked hotels and restaurants — from luxury palaces to legendary street food.
        </p>
      </div>

      <Tabs defaultValue="hotels">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <TabsList className="rounded-full p-1 bg-secondary h-12">
            <TabsTrigger value="hotels" className="rounded-full px-6 h-10">
              Hotels
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="rounded-full px-6 h-10">
              Restaurants
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="border-0 shadow-none focus-visible:ring-0 px-0 h-7"
              />
            </div>
            <SelectChip value={city} setValue={setCity} options={cities} label="City" />
          </div>
        </div>

        <TabsContent value="hotels" className="mt-0">
          <div className="flex gap-2 mb-6 flex-wrap">
            {["All", "Luxury", "Mid-range", "Budget"].map((t) => (
              <button
                key={t}
                onClick={() => setPrice(t)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold border transition-smooth",
                  price === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-secondary border-border",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHotels.map((h) => (
              <HotelCard key={h.id} hotel={h} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-0">
          <div className="flex gap-2 mb-6 flex-wrap">
            {["All", "₹", "₹₹", "₹₹₹"].map((t) => (
              <button
                key={t}
                onClick={() => setPrice(t)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold border transition-smooth",
                  price === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-secondary border-border",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SelectChip = ({
  value,
  setValue,
  options,
  label,
}: {
  value: string;
  setValue: (v: string) => void;
  options: string[];
  label: string;
}) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft">
    <span className="text-xs text-muted-foreground">{label}:</span>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const HotelCard = ({ hotel: h }: { hotel: Hotel }) => {
  const tone =
    h.type === "Luxury"
      ? "bg-accent/15 text-accent border-accent/30"
      : h.type === "Mid-range"
        ? "bg-type-nature/15 text-type-nature border-type-nature/30"
        : "bg-type-beach/15 text-type-beach border-type-beach/30";
  return (
    <div className="rounded-2xl bg-card border border-border shadow-card hover:shadow-elegant transition-bounce hover:-translate-y-1 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={cn("inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border", tone)}>
            {h.type.toUpperCase()}
          </span>
          <h3 className="font-display font-bold text-xl mt-2 leading-tight">{h.name}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" /> {h.city} {h.near && `· near ${h.near}`}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs font-bold">
          <Star className="h-3 w-3 fill-accent text-accent" /> {h.rating}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {h.amenities?.slice(0, 5).map((a) => (
          <span key={a} className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-medium">
            {a}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <div className="font-display font-extrabold text-2xl text-primary">
            ₹{h.price_per_night.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-muted-foreground">per night</div>
        </div>
        {h.contact && (
          <a
            href={`tel:${h.contact}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-glow transition-smooth"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        )}
      </div>
    </div>
  );
};

const RestaurantCard = ({ restaurant: r }: { restaurant: Restaurant }) => (
  <div className="rounded-2xl bg-card border border-border shadow-card hover:shadow-elegant transition-bounce hover:-translate-y-1 p-6 flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/30">
          {r.cuisine}
        </span>
        <h3 className="font-display font-bold text-xl mt-2 leading-tight">{r.name}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" /> {r.city}
        </p>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs font-bold">
        <Star className="h-3 w-3 fill-accent text-accent" /> {r.rating}
      </div>
    </div>
    <div className="rounded-xl bg-accent-soft p-3">
      <div className="flex items-center gap-1.5 text-xs text-accent-foreground/70 font-semibold uppercase tracking-wider mb-1">
        <UtensilsCrossed className="h-3 w-3" /> Specialty
      </div>
      <div className="font-semibold">{r.specialty}</div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <div className="font-display font-extrabold text-xl text-primary">{r.price_range}</div>
      {r.contact && (
        <a
          href={`tel:${r.contact}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-glow transition-smooth"
        >
          <Phone className="h-3.5 w-3.5" /> {r.contact}
        </a>
      )}
    </div>
  </div>
);

export default Stays;
