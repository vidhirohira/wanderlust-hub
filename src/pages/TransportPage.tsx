import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bus, Train, Plane, Car, Clock, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Transport } from "@/lib/types";
import { modeColorClasses } from "@/lib/typeColor";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Bus,
  Train,
  Flight: Plane,
  Taxi: Car,
};

const NEAREST = [
  { city: "Agra", airport: "Kheria Airport (AGR)", railway: "Agra Cantt (AGC)" },
  { city: "Alleppey", airport: "Cochin International (COK) — 85km", railway: "Alappuzha (ALLP)" },
  { city: "Jaisalmer", airport: "Jaisalmer Airport (JSA)", railway: "Jaisalmer Junction (JSM)" },
  { city: "Goa", airport: "Goa Dabolim (GOI) / Mopa (GOX)", railway: "Madgaon Junction (MAO)" },
  { city: "Leh", airport: "Kushok Bakula Rimpochee (IXL)", railway: "—" },
  { city: "Hampi", airport: "Hubli Airport (HBX) — 144km", railway: "Hospet Junction (HPT)" },
  { city: "Nainital", airport: "Pantnagar (PGH) — 71km", railway: "Kathgodam (KGM)" },
  { city: "Varanasi", airport: "Lal Bahadur Shastri (VNS)", railway: "Varanasi Junction (BSB)" },
];

const TransportPage = () => {
  const [routes, setRoutes] = useState<Transport[]>([]);
  const [mode, setMode] = useState("All");
  const [city, setCity] = useState("All");

  useEffect(() => {
    supabase.from("transport").select("*").then(({ data }) => setRoutes((data as Transport[]) ?? []));
  }, []);

  const cities = useMemo(() => {
    const s = new Set<string>();
    routes.forEach((r) => {
      s.add(r.from_city);
      s.add(r.to_city);
    });
    return ["All", ...Array.from(s).sort()];
  }, [routes]);

  const filtered = useMemo(
    () =>
      routes.filter((r) => {
        if (mode !== "All" && r.mode !== mode) return false;
        if (city !== "All" && r.from_city !== city && r.to_city !== city) return false;
        return true;
      }),
    [routes, mode, city],
  );

  return (
    <div className="container py-12">
      <div className="mb-10">
        <span className="text-sm font-semibold text-accent uppercase tracking-widest">Get there</span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-2">
          Transport <span className="text-gradient-primary">routes</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
          Trains, buses and flights connecting India's most-loved destinations.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <FilterRow label="Mode" value={mode} setValue={setMode} options={["All", "Train", "Bus", "Flight", "Taxi"]} />
        <FilterRow label="City" value={city} setValue={setCity} options={cities} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-20">
        {filtered.map((r) => {
          const Icon = ICONS[r.mode] ?? Bus;
          return (
            <div
              key={r.id}
              className="rounded-2xl bg-card border border-border shadow-card hover:shadow-elegant transition-bounce hover:-translate-y-1 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold", modeColorClasses(r.mode))}>
                  <Icon className="h-3.5 w-3.5" /> {r.mode}
                </div>
                <div className="text-xs text-muted-foreground">{r.operator}</div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">From</div>
                  <div className="font-display font-bold text-xl truncate">{r.from_city}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-accent shrink-0" />
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">To</div>
                  <div className="font-display font-bold text-xl truncate">{r.to_city}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary/60 p-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" /> Duration
                  </div>
                  <div className="font-bold">{r.duration}</div>
                </div>
                <div className="rounded-xl bg-secondary/60 p-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Wallet className="h-3 w-3" /> Cost
                  </div>
                  <div className="font-bold text-primary">
                    ₹{r.cost_min}–₹{r.cost_max.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nearest Airports & Railway Stations */}
      <section>
        <h2 className="font-display font-extrabold text-3xl mb-6">
          Nearest <span className="text-gradient-primary">airports & railway stations</span>
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border shadow-card bg-card">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="text-left px-6 py-4 font-semibold text-sm">City</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Nearest Airport</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Nearest Railway Station</th>
              </tr>
            </thead>
            <tbody>
              {NEAREST.map((n, i) => (
                <tr key={n.city} className={cn("border-t border-border", i % 2 === 1 && "bg-secondary/30")}>
                  <td className="px-6 py-4 font-bold">{n.city}</td>
                  <td className="px-6 py-4 text-foreground/80">{n.airport}</td>
                  <td className="px-6 py-4 text-foreground/80">{n.railway}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const FilterRow = ({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
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

export default TransportPage;
