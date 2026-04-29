import { useMemo, useState } from "react";
import { Wallet, Users, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Tier = "backpacker" | "mid" | "luxury";

type Item = { icon: string; label: string; range: string };

const TIERS: Record<
  Tier,
  { label: string; min: number; max: number; emoji: string; items: Item[] }
> = {
  backpacker: {
    label: "Backpacker",
    min: 500,
    max: 1000,
    emoji: "🎒",
    items: [
      { icon: "🏨", label: "Accommodation", range: "₹300–500/night (hostels, dorms)" },
      { icon: "🍽️", label: "Food", range: "₹150–300/day (street food, dhabas)" },
      { icon: "🚌", label: "Transport", range: "₹50–200/day (buses, shared autos)" },
      { icon: "🎟️", label: "Entry & Activities", range: "₹50–100/day" },
    ],
  },
  mid: {
    label: "Mid-range",
    min: 2000,
    max: 5000,
    emoji: "🏨",
    items: [
      { icon: "🏨", label: "Accommodation", range: "₹1,200–2,500/night (3-star hotels)" },
      { icon: "🍽️", label: "Food", range: "₹500–1,000/day (restaurants, cafes)" },
      { icon: "🚗", label: "Transport", range: "₹300–800/day (trains, taxis)" },
      { icon: "🎟️", label: "Entry & Activities", range: "₹200–500/day" },
    ],
  },
  luxury: {
    label: "Luxury",
    min: 10000,
    max: 20000,
    emoji: "✨",
    items: [
      { icon: "🏨", label: "Accommodation", range: "₹6,000–12,000/night (5-star, heritage)" },
      { icon: "🍽️", label: "Food", range: "₹2,000–4,000/day (fine dining, room service)" },
      { icon: "✈️", label: "Transport", range: "₹2,000–5,000/day (flights, private cabs)" },
      { icon: "🎟️", label: "Entry & Activities", range: "₹1,000–2,500/day (guided tours)" },
      { icon: "🛍️", label: "Shopping & Misc", range: "₹1,000–3,000 buffer" },
    ],
  },
};

export const BudgetWidget = ({
  defaultPeople = 2,
  defaultDays = 3,
}: {
  defaultPeople?: number;
  defaultDays?: number;
}) => {
  const [people, setPeople] = useState(defaultPeople);
  const [days, setDays] = useState(defaultDays);
  const [tier, setTier] = useState<Tier>("mid");

  const range = useMemo(() => {
    const t = TIERS[tier];
    return { min: t.min * people * days, max: t.max * people * days };
  }, [tier, people, days]);

  const t = TIERS[tier];

  return (
    <div className="bg-gradient-to-br from-card to-secondary/20 border border-border rounded-3xl p-6 shadow-soft">
      <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-accent" />
        Quick budget estimate
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-xs flex items-center gap-1">
            <Users className="h-3 w-3" /> People
          </Label>
          <Input
            type="number"
            min={1}
            value={people}
            onChange={(e) => setPeople(Math.max(1, +e.target.value || 1))}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Days
          </Label>
          <Input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Math.max(1, +e.target.value || 1))}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-5">
        {(Object.keys(TIERS) as Tier[]).map((k) => (
          <button
            key={k}
            onClick={() => setTier(k)}
            className={cn(
              "flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-smooth",
              tier === k
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-secondary",
            )}
          >
            <div className="text-base mb-0.5">{TIERS[k].emoji}</div>
            {TIERS[k].label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center mb-4">
        <div className="text-xs text-muted-foreground mb-1">Estimated total</div>
        <div className="font-display font-extrabold text-3xl text-primary">
          ₹{range.min.toLocaleString()}–{range.max.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          ₹{t.min.toLocaleString()}–{t.max.toLocaleString()} per person/day
        </div>
      </div>

      {/* Itemized breakdown */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          {t.label} breakdown
        </div>
        {t.items.map((it) => (
          <div
            key={it.label}
            className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60"
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{it.label}</div>
              <div className="text-xs text-muted-foreground">{it.range}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        💡 Estimates based on average Indian tourism costs. Actual costs may vary by season and availability.
      </p>
    </div>
  );
};
