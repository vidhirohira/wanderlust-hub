import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--type-heritage))", "hsl(var(--type-nature))", "hsl(var(--type-beach))", "hsl(var(--type-spiritual))"];
const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" };

const Analytics = () => {
  const [topSearches, setTopSearches] = useState<{ name: string; n: number }[]>([]);
  const [topWish, setTopWish] = useState<{ name: string; n: number }[]>([]);
  const [topReviewed, setTopReviewed] = useState<{ name: string; n: number }[]>([]);
  const [byType, setByType] = useState<{ name: string; value: number }[]>([]);
  const [byCity, setByCity] = useState<{ name: string; n: number }[]>([]);
  const [hourly, setHourly] = useState<{ hour: string; n: number }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("search_logs").select("search_query, created_at").limit(1000),
      supabase.from("wishlists").select("destination_id, destinations(name)").limit(1000),
      supabase.from("reviews").select("destination_id, destinations(name)").limit(1000),
      supabase.from("destinations").select("type, city"),
    ]).then(([s, w, r, d]) => {
      // searches
      const sCounts: Record<string, number> = {};
      const hourCounts: Record<number, number> = {};
      for (const x of (s.data ?? []) as { search_query: string; created_at: string }[]) {
        const k = x.search_query.toLowerCase().trim();
        sCounts[k] = (sCounts[k] ?? 0) + 1;
        const h = new Date(x.created_at).getHours();
        hourCounts[h] = (hourCounts[h] ?? 0) + 1;
      }
      setTopSearches(
        Object.entries(sCounts).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n).slice(0, 10),
      );
      setHourly(
        Array.from({ length: 24 }, (_, h) => ({ hour: `${h}h`, n: hourCounts[h] ?? 0 })),
      );

      const tally = (rows: { destinations: { name: string } | null }[] | null) => {
        const m: Record<string, number> = {};
        for (const x of rows ?? []) {
          const n = x.destinations?.name;
          if (!n) continue;
          m[n] = (m[n] ?? 0) + 1;
        }
        return Object.entries(m).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n).slice(0, 10);
      };
      setTopWish(tally(w.data as { destinations: { name: string } | null }[] | null));
      setTopReviewed(tally(r.data as { destinations: { name: string } | null }[] | null));

      const tCounts: Record<string, number> = {};
      const cCounts: Record<string, number> = {};
      for (const x of (d.data ?? []) as { type: string; city: string }[]) {
        tCounts[x.type] = (tCounts[x.type] ?? 0) + 1;
        cCounts[x.city] = (cCounts[x.city] ?? 0) + 1;
      }
      setByType(Object.entries(tCounts).map(([name, value]) => ({ name, value })));
      setByCity(Object.entries(cCounts).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n).slice(0, 10));
    });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl">Analytics</h1>
        <p className="text-muted-foreground mt-1">User behavior & content insights.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Top searches">
          <BarHList data={topSearches} color="hsl(var(--primary))" />
        </ChartCard>
        <ChartCard title="Most wishlisted">
          <BarHList data={topWish} color="hsl(var(--destructive))" />
        </ChartCard>
        <ChartCard title="Most reviewed">
          <BarHList data={topReviewed} color="hsl(var(--accent))" />
        </ChartCard>
        <ChartCard title="Destinations by type">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Popular cities">
          <BarHList data={byCity} color="hsl(var(--type-beach))" />
        </ChartCard>
        <ChartCard title="Search hour heatmap">
          <div className="grid grid-cols-12 gap-1.5">
            {hourly.map((h) => {
              const max = Math.max(1, ...hourly.map((x) => x.n));
              const intensity = h.n / max;
              return (
                <div key={h.hour} className="text-center">
                  <div
                    className={cn("h-10 rounded-md")}
                    style={{ background: `hsl(var(--primary) / ${0.1 + intensity * 0.9})` }}
                    title={`${h.hour}: ${h.n}`}
                  />
                  <div className="text-[9px] text-muted-foreground mt-1">{h.hour}</div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

const BarHList = ({ data, color }: { data: { name: string; n: number }[]; color: string }) =>
  data.length === 0 ? (
    <p className="text-sm text-muted-foreground py-6 text-center">No data yet.</p>
  ) : (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
        <YAxis dataKey="name" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="n" fill={color} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-2xl shadow-card p-6">
    <h2 className="font-display font-bold text-lg mb-4">{title}</h2>
    {children}
  </div>
);

export default Analytics;
