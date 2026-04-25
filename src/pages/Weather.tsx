import { useState } from "react";
import { Sun, CloudRain, Snowflake, Thermometer, Calendar, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

type Season = {
  months: string;
  temp: string;
  condition: "Sunny" | "Pleasant" | "Hot" | "Rainy" | "Cold" | "Frozen";
  recommended: boolean;
};

type CityWeather = {
  city: string;
  bestTime: string;
  pack: string[];
  seasons: Season[];
  monthRatings: Record<string, "good" | "ok" | "avoid">;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const m = (good: number[], avoid: number[]): Record<string, "good" | "ok" | "avoid"> =>
  Object.fromEntries(
    MONTHS.map((mo, i) => [
      mo,
      good.includes(i) ? "good" : avoid.includes(i) ? "avoid" : "ok",
    ]),
  );

const DATA: CityWeather[] = [
  {
    city: "Agra",
    bestTime: "October to March",
    pack: ["Light jacket", "Comfortable shoes", "Sunglasses", "Camera"],
    seasons: [
      { months: "Oct – Mar", temp: "15–25°C", condition: "Pleasant", recommended: true },
      { months: "Apr – Jun", temp: "35–45°C", condition: "Hot", recommended: false },
      { months: "Jul – Sep", temp: "25–35°C", condition: "Rainy", recommended: false },
    ],
    monthRatings: m([0, 1, 2, 9, 10, 11], [3, 4, 5]),
  },
  {
    city: "Kerala (Alleppey)",
    bestTime: "November to February",
    pack: ["Cottons", "Light raincoat", "Insect repellent", "Sandals"],
    seasons: [
      { months: "Nov – Feb", temp: "20–30°C", condition: "Pleasant", recommended: true },
      { months: "Mar – May", temp: "28–35°C", condition: "Hot", recommended: false },
      { months: "Jun – Oct", temp: "23–30°C", condition: "Rainy", recommended: false },
    ],
    monthRatings: m([0, 1, 10, 11], [5, 6, 7, 8]),
  },
  {
    city: "Ladakh",
    bestTime: "June to September",
    pack: ["Heavy jackets", "Thermals", "Sunscreen SPF50+", "Diamox"],
    seasons: [
      { months: "Jun – Sep", temp: "10–25°C", condition: "Pleasant", recommended: true },
      { months: "Oct – May", temp: "-20–10°C", condition: "Frozen", recommended: false },
    ],
    monthRatings: m([5, 6, 7, 8], [0, 1, 2, 10, 11]),
  },
  {
    city: "Goa",
    bestTime: "November to February",
    pack: ["Beachwear", "Sunscreen", "Flip-flops", "Sunhat"],
    seasons: [
      { months: "Nov – Feb", temp: "25–32°C", condition: "Pleasant", recommended: true },
      { months: "Mar – May", temp: "30–35°C", condition: "Hot", recommended: false },
      { months: "Jun – Sep", temp: "25–30°C", condition: "Rainy", recommended: false },
    ],
    monthRatings: m([0, 1, 10, 11], [5, 6, 7, 8]),
  },
  {
    city: "Rajasthan (Jaisalmer)",
    bestTime: "October to February",
    pack: ["Layers (cold nights)", "Scarves", "Sunscreen", "Trekking shoes"],
    seasons: [
      { months: "Oct – Feb", temp: "10–25°C", condition: "Cold", recommended: true },
      { months: "May – Jun", temp: "35–48°C", condition: "Hot", recommended: false },
    ],
    monthRatings: m([0, 1, 9, 10, 11], [3, 4, 5]),
  },
  {
    city: "Varanasi",
    bestTime: "October to March",
    pack: ["Light woollens", "Modest clothing", "Comfortable shoes"],
    seasons: [
      { months: "Oct – Mar", temp: "12–25°C", condition: "Pleasant", recommended: true },
      { months: "Apr – Jun", temp: "35–42°C", condition: "Hot", recommended: false },
    ],
    monthRatings: m([0, 1, 2, 9, 10, 11], [3, 4, 5]),
  },
];

const CONDITION_ICONS: Record<string, React.ElementType> = {
  Sunny: Sun,
  Pleasant: Sun,
  Hot: Sun,
  Rainy: CloudRain,
  Cold: Snowflake,
  Frozen: Snowflake,
};

const Weather = () => {
  const [city, setCity] = useState(DATA[0].city);
  const data = DATA.find((d) => d.city === city)!;

  return (
    <div className="container py-12">
      <div className="mb-10">
        <span className="text-sm font-semibold text-accent uppercase tracking-widest">When to go</span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-2">
          Weather & best <span className="text-gradient-primary">time to visit</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
          Pick your city and find the perfect window for your trip.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {DATA.map((d) => (
          <button
            key={d.city}
            onClick={() => setCity(d.city)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold border transition-smooth",
              city === d.city
                ? "bg-primary text-primary-foreground border-primary shadow-soft"
                : "bg-background hover:bg-secondary border-border",
            )}
          >
            {d.city}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-primary to-primary-glow p-8 text-primary-foreground shadow-elegant relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <div className="text-sm uppercase tracking-widest opacity-80 mb-2">Best time to visit</div>
            <div className="font-display font-extrabold text-4xl md:text-5xl mb-6">{data.bestTime}</div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4" />
              <span className="opacity-80">What to pack:</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {data.pack.map((p) => (
                <span key={p} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur border border-white/30">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-card p-6 space-y-3">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-accent" /> Seasons
          </h3>
          {data.seasons.map((s, i) => {
            const Icon = CONDITION_ICONS[s.condition] ?? Sun;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl p-3 border-l-4",
                  s.recommended ? "bg-type-nature/10 border-type-nature" : "bg-destructive/10 border-destructive",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{s.months}</div>
                  <Icon className={cn("h-4 w-4", s.recommended ? "text-type-nature" : "text-destructive")} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.temp} · {s.condition} {s.recommended ? "✅" : "❌"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seasonal calendar */}
      <div className="rounded-3xl bg-card border border-border shadow-card p-6 md:p-8">
        <h3 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> 12-month calendar — {data.city}
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {MONTHS.map((mo) => {
            const r = data.monthRatings[mo];
            return (
              <div
                key={mo}
                className={cn(
                  "rounded-xl p-3 text-center border-2 font-semibold text-sm",
                  r === "good" && "bg-type-nature/15 border-type-nature/40 text-type-nature",
                  r === "avoid" && "bg-destructive/10 border-destructive/40 text-destructive",
                  r === "ok" && "bg-secondary border-border text-foreground/70",
                )}
              >
                {mo}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-type-nature" /> Best months
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive" /> Avoid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-muted" /> OK
          </span>
        </div>
      </div>
    </div>
  );
};

export default Weather;
