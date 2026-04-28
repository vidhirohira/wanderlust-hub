import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Destination, Hotel, Transport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Users, Calendar, Wallet, Save, Check, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveImage } from "@/lib/images";
import { BudgetWidget } from "@/components/BudgetWidget";

const parseFee = (s: string | null) => {
  if (!s || /free/i.test(s)) return 0;
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

const PlanTour = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [transport, setTransport] = useState<Transport[]>([]);
  const [picked, setPicked] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [people, setPeople] = useState(2);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("destinations").select("*").order("name"),
      supabase.from("hotels").select("*"),
      supabase.from("transport").select("*"),
    ]).then(([d, h, t]) => {
      setDestinations((d.data as Destination[]) ?? []);
      setHotels((h.data as Hotel[]) ?? []);
      setTransport((t.data as Transport[]) ?? []);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return destinations;
    const q = search.toLowerCase();
    return destinations.filter(
      (d) => d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q),
    );
  }, [destinations, search]);

  const toggle = (d: Destination) => {
    setPicked((p) =>
      p.find((x) => x.id === d.id) ? p.filter((x) => x.id !== d.id) : [...p, d],
    );
  };

  const days = useMemo(() => {
    if (!start || !end) return Math.max(1, picked.length);
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(ms / 86400000));
  }, [start, end, picked.length]);

  const breakdown = useMemo(() => {
    const entryFees = picked.reduce((s, d) => s + parseFee(d.entry_fee_indian), 0) * people;

    const accommodation = picked.reduce((s, d) => {
      const h = hotels.filter((x) => x.city.toLowerCase() === d.city.toLowerCase());
      const avg = h.length ? h.reduce((a, b) => a + b.price_per_night, 0) / h.length : 2500;
      return s + avg;
    }, 0) * Math.max(1, days) / Math.max(1, picked.length);

    let transportCost = 0;
    for (let i = 0; i < picked.length - 1; i++) {
      const a = picked[i].city.toLowerCase();
      const b = picked[i + 1].city.toLowerCase();
      const route = transport.find(
        (t) =>
          (t.from_city.toLowerCase() === a && t.to_city.toLowerCase() === b) ||
          (t.from_city.toLowerCase() === b && t.to_city.toLowerCase() === a),
      );
      transportCost += route ? (route.cost_min + route.cost_max) / 2 : 1500;
    }
    transportCost *= people;

    return {
      entryFees: Math.round(entryFees),
      accommodation: Math.round(accommodation),
      transport: Math.round(transportCost),
      total: Math.round(entryFees + accommodation + transportCost),
    };
  }, [picked, hotels, transport, people, days]);

  const save = async () => {
    if (!user) {
      toast.error("Please log in to save");
      return navigate("/auth");
    }
    if (!title.trim() || picked.length === 0) {
      return toast.error("Add a title and pick destinations");
    }
    setSaving(true);
    const { error } = await supabase.from("tour_plans").insert({
      user_id: user.id,
      title: title.trim(),
      destinations: picked.map((p) => p.id),
      start_date: start || null,
      end_date: end || null,
      num_people: people,
      estimated_budget: breakdown.total,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Tour saved! 🎉");
    navigate("/profile");
  };

  return (
    <div className="container py-12 max-w-6xl">
      <div className="mb-10">
        <span className="text-sm font-semibold text-accent uppercase tracking-widest">Plan</span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-2">
          Build your <span className="text-gradient-primary">tour</span>
        </h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { n: 1, label: "Destinations" },
          { n: 2, label: "Dates & people" },
          { n: 3, label: "Budget" },
          { n: 4, label: "Review & save" },
        ].map((s, i) => (
          <button
            key={s.n}
            onClick={() => setStep(s.n)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-smooth shrink-0 text-sm",
              step === s.n
                ? "bg-primary text-primary-foreground border-primary"
                : step > s.n
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-card border-border text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-6 w-6 rounded-full grid place-items-center text-xs font-bold",
                step >= s.n ? "bg-primary-foreground/20" : "bg-muted",
              )}
            >
              {step > s.n ? <Check className="h-3 w-3" /> : s.n}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
                className="border-0 shadow-none focus-visible:ring-0 px-0"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {filtered.map((d) => {
                const on = !!picked.find((x) => x.id === d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggle(d)}
                    className={cn(
                      "text-left flex gap-3 p-3 rounded-2xl border transition-smooth",
                      on ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <img
                      src={resolveImage(d.image_url)}
                      alt={d.name}
                      className="h-16 w-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{d.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {d.city}
                      </div>
                      <div className="text-xs mt-1">{d.entry_fee_indian || "Free"}</div>
                    </div>
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full grid place-items-center shrink-0 self-center",
                        on ? "bg-primary text-primary-foreground" : "border border-border",
                      )}
                    >
                      {on && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <aside className="space-y-3">
            <div className="rounded-2xl bg-secondary/40 p-5 sticky top-24">
              <h3 className="font-bold mb-3">Selected ({picked.length})</h3>
              {picked.length === 0 && (
                <p className="text-sm text-muted-foreground">Tap a destination to add it.</p>
              )}
              <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
                {picked.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span className="h-6 w-6 grid place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <button onClick={() => toggle(p)} className="text-xs text-destructive">
                      remove
                    </button>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(2)} disabled={picked.length === 0} variant="hero" className="w-full">
                Next →
              </Button>
            </div>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl space-y-5 bg-card border border-border rounded-3xl p-8 shadow-soft">
          <div>
            <Label>Tour title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Golden Triangle 2026"
              className="mt-1.5"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Start date</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>End date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1.5" min={start} />
            </div>
          </div>
          <div>
            <Label>Number of people</Label>
            <div className="mt-1.5 flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setPeople((p) => Math.max(1, p - 1))}>
                −
              </Button>
              <span className="font-bold text-lg w-10 text-center">{people}</span>
              <Button variant="outline" size="sm" onClick={() => setPeople((p) => p + 1)}>
                +
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button variant="hero" onClick={() => setStep(3)} className="flex-1">
              Next →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
            <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" /> Estimated cost
            </h3>
            <div className="space-y-3">
              <Row label="Entry fees" value={breakdown.entryFees} sub={`${picked.length} sites × ${people} people`} />
              <Row label="Accommodation" value={breakdown.accommodation} sub={`~${days} night${days > 1 ? "s" : ""}`} />
              <Row label="Transport" value={breakdown.transport} sub={`${Math.max(0, picked.length - 1)} legs × ${people} people`} />
              <div className="flex items-center justify-between pt-4 border-t-2 border-border">
                <span className="font-display font-bold text-lg">Total</span>
                <span className="font-display font-extrabold text-2xl text-primary">
                  ₹{breakdown.total.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button variant="hero" onClick={() => setStep(4)} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
          <BudgetWidget defaultPeople={people} defaultDays={days} />
        </div>
      )}

      {step === 4 && (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft max-w-2xl">
          <h3 className="font-display font-bold text-xl mb-4">Review & save</h3>
          <dl className="space-y-2 text-sm mb-5">
            <Item label="Title" value={title || "—"} />
            <Item label="Stops" value={picked.map((p) => p.name).join(" → ") || "—"} />
            <Item
              label="Dates"
              value={start && end ? `${start} → ${end} (${days} day${days > 1 ? "s" : ""})` : "Not set"}
            />
            <Item label="Travellers" value={`${people}`} />
            <Item label="Estimated budget" value={`₹${breakdown.total.toLocaleString()}`} />
          </dl>
          <Label>Personal notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Anything to remember..."
            className="mt-1.5 mb-5"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>
              ← Back
            </Button>
            <Button variant="hero" onClick={save} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save tour
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value, sub }: { label: string; value: number; sub?: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="font-medium">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
    <div className="font-bold">₹{value.toLocaleString()}</div>
  </div>
);

const Item = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-semibold text-right">{value}</dd>
  </div>
);

export default PlanTour;
