import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  tours: number;
  searches: number;
};

const ManagerUsers = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: tours }, { data: searches }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, email, created_at"),
        supabase.from("tour_plans").select("user_id"),
        supabase.from("search_logs").select("user_id"),
      ]);
      const tourCount: Record<string, number> = {};
      for (const t of (tours ?? []) as { user_id: string }[])
        tourCount[t.user_id] = (tourCount[t.user_id] ?? 0) + 1;
      const searchCount: Record<string, number> = {};
      for (const s of (searches ?? []) as { user_id: string | null }[])
        if (s.user_id) searchCount[s.user_id] = (searchCount[s.user_id] ?? 0) + 1;
      setRows(
        ((profiles ?? []) as { user_id: string; full_name: string | null; email: string | null; created_at: string }[])
          .map((p) => ({
            ...p,
            tours: tourCount[p.user_id] ?? 0,
            searches: searchCount[p.user_id] ?? 0,
          }))
          .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
      );
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl">Users</h1>
        <p className="text-muted-foreground mt-1">{rows.length} registered.</p>
      </header>
      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-right p-3">Tours</th>
              <th className="text-right p-3">Searches</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3 font-medium">{r.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{r.email ?? "—"}</td>
                <td className="p-3 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right font-semibold">{r.tours}</td>
                <td className="p-3 text-right font-semibold">{r.searches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerUsers;
