import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TRANSPORT_MODES, type Transport } from "@/lib/types";
import { Field, SelectField } from "./ManageDestinations";

const empty: Partial<Transport> = { from_city: "", to_city: "", mode: "Train", operator: "", duration: "", cost_min: 0, cost_max: 0 };

const ManageTransport = () => {
  const [items, setItems] = useState<Transport[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Transport>>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("transport").select("*").order("created_at", { ascending: false });
    setItems((data as Transport[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    setSaving(true);
    const { id, created_at, ...data } = { ...editing, cost_min: Number(editing.cost_min) || 0, cost_max: Number(editing.cost_max) || 0 } as any;
    const res = id ? await supabase.from("transport").update(data).eq("id", id) : await supabase.from("transport").insert(data as any);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(id ? "Updated" : "Created");
    setOpen(false); load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("transport").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Transport</h1>
          <p className="text-muted-foreground mt-1">{items.length} routes</p>
        </div>
        <Button variant="hero" onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add route
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Route</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Mode</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Duration</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Cost</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t border-border hover:bg-secondary/40">
                <td className="px-4 py-3 font-semibold">{t.from_city} → {t.to_city}</td>
                <td className="px-4 py-3 hidden md:table-cell">{t.mode}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{t.duration}</td>
                <td className="px-4 py-3 hidden lg:table-cell">₹{t.cost_min}–₹{t.cost_max}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} route</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="From city" value={editing.from_city ?? ""} onChange={(v) => setEditing({ ...editing, from_city: v })} />
            <Field label="To city" value={editing.to_city ?? ""} onChange={(v) => setEditing({ ...editing, to_city: v })} />
            <SelectField label="Mode" value={editing.mode ?? "Train"} onChange={(v) => setEditing({ ...editing, mode: v })} options={[...TRANSPORT_MODES]} />
            <Field label="Operator" value={editing.operator ?? ""} onChange={(v) => setEditing({ ...editing, operator: v })} />
            <Field label="Duration" value={editing.duration ?? ""} onChange={(v) => setEditing({ ...editing, duration: v })} />
            <Field label="Cost min (₹)" type="number" value={String(editing.cost_min ?? "")} onChange={(v) => setEditing({ ...editing, cost_min: Number(v) })} />
            <Field label="Cost max (₹)" type="number" value={String(editing.cost_max ?? "")} onChange={(v) => setEditing({ ...editing, cost_max: Number(v) })} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={onSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTransport;
