import { useMemo, useState } from "react";
import { Wallet, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Tier = "backpacker" | "mid" | "luxury";
const TIERS: Record<Tier, { label: string; min: number; max: number; emoji: string }> = {
  backpacker: { label: "Backpacker", min: 500, max: 1000, emoji: "🎒" },
  mid: { label: "Mid-range", min: 2000, max: 5000, emoji: "🏨" },
  luxury: { label: "Luxury", min: 10000, max: 20000, emoji: "✨" },
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
    return {
      min: t.min * people * days,
      max: t.max * people * days,
    };
  }, [tier, people, days]);

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
        {(Object.keys(TIERS) as Tier[]).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={cn(
              "flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-smooth",
              tier === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-secondary",
            )}
          >
            <div className="text-base mb-0.5">{TIERS[t].emoji}</div>
            {TIERS[t].label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
        <div className="text-xs text-muted-foreground mb-1">Estimated total</div>
        <div className="font-display font-extrabold text-3xl text-primary">
          ₹{range.min.toLocaleString()}–{range.max.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          ₹{TIERS[tier].min.toLocaleString()}–{TIERS[tier].max.toLocaleString()} per person/day
        </div>
      </div>
    </div>
  );
};
