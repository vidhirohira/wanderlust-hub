import { useEffect, useState } from "react";
import { MapPin, Building2, UtensilsCrossed, Bus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [stats, setStats] = useState({ destinations: 0, hotels: 0, restaurants: 0, transport: 0 });
  const [byType, setByType] = useState<{ type: string; count: number }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("destinations").select("type"),
      supabase.from("hotels").select("id", { count: "exact", head: true }),
      supabase.from("restaurants").select("id", { count: "exact", head: true }),
      supabase.from("transport").select("id", { count: "exact", head: true }),
    ]).then(([d, h, r, t]) => {
      const dest = (d.data as { type: string }[]) ?? [];
      setStats({
        destinations: dest.length,
        hotels: h.count ?? 0,
        restaurants: r.count ?? 0,
        transport: t.count ?? 0,
      });
      const counts: Record<string, number> = {};
      dest.forEach((x) => (counts[x.type] = (counts[x.type] ?? 0) + 1));
      setByType(Object.entries(counts).map(([type, count]) => ({ type, count })));
    });
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground mt-1">A bird's-eye view of the platform.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MapPin} label="Destinations" value={stats.destinations} tone="primary" />
        <StatCard icon={Building2} label="Hotels" value={stats.hotels} tone="accent" />
        <StatCard icon={UtensilsCrossed} label="Restaurants" value={stats.restaurants} tone="nature" />
        <StatCard icon={Bus} label="Transport routes" value={stats.transport} tone="beach" />
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card p-6">
        <h2 className="font-display font-bold text-xl mb-1">Destinations by type</h2>
        <p className="text-sm text-muted-foreground mb-6">Distribution across categories</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
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

export default Dashboard;
