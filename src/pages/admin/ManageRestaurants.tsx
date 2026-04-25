import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PRICE_RANGES, type Restaurant } from "@/lib/types";
import { Field, SelectField } from "./ManageDestinations";

const empty: Partial<Restaurant> = { name: "", city: "", cuisine: "", price_range: "₹₹", rating: 4.3, specialty: "", contact: "" };

const ManageRestaurants = () => {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Restaurant>>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false });
    setItems((data as Restaurant[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    setSaving(true);
    const { id, created_at, ...data } = { ...editing, rating: Number(editing.rating) || 0 } as any;
    const res = id ? await supabase.from("restaurants").update(data).eq("id", id) : await supabase.from("restaurants").insert(data as any);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(id ? "Updated" : "Created");
    setOpen(false); load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Restaurants</h1>
          <p className="text-muted-foreground mt-1">{items.length} total</p>
        </div>
        <Button variant="hero" onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add restaurant
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">City</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Cuisine</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Price</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-secondary/40">
                <td className="px-4 py-3 font-semibold">{r.name}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{r.city}</td>
                <td className="px-4 py-3 hidden md:table-cell">{r.cuisine}</td>
                <td className="px-4 py-3 hidden lg:table-cell">{r.price_range}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} restaurant</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="City" value={editing.city ?? ""} onChange={(v) => setEditing({ ...editing, city: v })} />
            <Field label="Cuisine" value={editing.cuisine ?? ""} onChange={(v) => setEditing({ ...editing, cuisine: v })} />
            <SelectField label="Price range" value={editing.price_range ?? "₹₹"} onChange={(v) => setEditing({ ...editing, price_range: v })} options={[...PRICE_RANGES]} />
            <Field label="Rating" type="number" value={String(editing.rating ?? "")} onChange={(v) => setEditing({ ...editing, rating: Number(v) })} />
            <Field label="Contact" value={editing.contact ?? ""} onChange={(v) => setEditing({ ...editing, contact: v })} />
            <Field className="md:col-span-2" label="Specialty" value={editing.specialty ?? ""} onChange={(v) => setEditing({ ...editing, specialty: v })} />
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

export default ManageRestaurants;
