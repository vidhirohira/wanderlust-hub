import { useEffect, useState } from "react";
import { MapPin, Building2, UtensilsCrossed, Users, Map, Star } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Overview = () => {
  const [stats, setStats] = useState({ users: 0, destinations: 0, hotels: 0, tours: 0, reviews: 0 });
  const [signups, setSignups] = useState<{ day: string; n: number }[]>([]);
  const [searches, setSearches] = useState<{ day: string; n: number }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("destinations").select("id", { count: "exact", head: true }),
      supabase.from("hotels").select("id", { count: "exact", head: true }),
      supabase.from("tour_plans").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("created_at").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
      supabase.from("search_logs").select("created_at").gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString()),
    ]).then(([u, d, h, t, r, signupRows, searchRows]) => {
      setStats({
        users: u.count ?? 0,
        destinations: d.count ?? 0,
        hotels: h.count ?? 0,
        tours: t.count ?? 0,
        reviews: r.count ?? 0,
      });

      const bucket = (rows: { created_at: string }[] | null, days: number) => {
        const map = new Map<string, number>();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          map.set(d.toISOString().slice(5, 10), 0);
        }
        for (const r of rows ?? []) {
          const k = new Date(r.created_at).toISOString().slice(5, 10);
          if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
        }
        return Array.from(map, ([day, n]) => ({ day, n }));
      };
      setSignups(bucket(signupRows.data as { created_at: string }[], 30));
      setSearches(bucket(searchRows.data as { created_at: string }[], 14));
    });
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl">Overview</h1>
        <p className="text-muted-foreground mt-1">Bird's-eye view of TIMS.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat icon={Users} label="Users" value={stats.users} tone="primary" />
        <Stat icon={MapPin} label="Destinations" value={stats.destinations} tone="accent" />
        <Stat icon={Building2} label="Hotels" value={stats.hotels} tone="nature" />
        <Stat icon={Map} label="Tours" value={stats.tours} tone="beach" />
        <Stat icon={Star} label="Reviews" value={stats.reviews} tone="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="New signups (30d)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={signups}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="n" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Searches per day (14d)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={searches}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="n" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-2xl shadow-card p-6">
    <h2 className="font-display font-bold text-lg mb-4">{title}</h2>
    {children}
  </div>
);

const Stat = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: "primary" | "accent" | "nature" | "beach";
}) => (
  <div className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-elegant transition-bounce hover:-translate-y-1">
    <div
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-xl mb-3",
        tone === "primary" && "bg-primary/10 text-primary",
        tone === "accent" && "bg-accent/15 text-accent",
        tone === "nature" && "bg-type-nature/15 text-type-nature",
        tone === "beach" && "bg-type-beach/15 text-type-beach",
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div className="font-display font-extrabold text-3xl">{value}</div>
    <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
  </div>
);

export default Overview;
