import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HOTEL_TYPES, type Hotel } from "@/lib/types";
import { Field, SelectField } from "./ManageDestinations";

const empty: Partial<Hotel> = { name: "", city: "", type: "Luxury", price_per_night: 5000, rating: 4.5, amenities: [], contact: "", near: "" };

const ManageHotels = () => {
  const [items, setItems] = useState<Hotel[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Hotel>>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("hotels").select("*").order("created_at", { ascending: false });
    setItems((data as Hotel[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    setSaving(true);
    const payload = {
      ...editing,
      price_per_night: Number(editing.price_per_night) || 0,
      rating: Number(editing.rating) || 0,
      amenities: typeof editing.amenities === "string" ? (editing.amenities as unknown as string).split(",").map(s => s.trim()).filter(Boolean) : (editing.amenities ?? []),
    };
    const { id, created_at, ...data } = payload as any;
    const res = id ? await supabase.from("hotels").update(data).eq("id", id) : await supabase.from("hotels").insert(data as any);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(id ? "Updated" : "Created");
    setOpen(false); load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this hotel?")) return;
    const { error } = await supabase.from("hotels").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Hotels</h1>
          <p className="text-muted-foreground mt-1">{items.length} total</p>
        </div>
        <Button variant="hero" onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add hotel
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">City</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">₹/night</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((h) => (
              <tr key={h.id} className="border-t border-border hover:bg-secondary/40">
                <td className="px-4 py-3 font-semibold">{h.name}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{h.city}</td>
                <td className="px-4 py-3 hidden md:table-cell">{h.type}</td>
                <td className="px-4 py-3 hidden lg:table-cell">₹{h.price_per_night.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...h, amenities: (h.amenities ?? []).join(", ") as any }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} hotel</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="City" value={editing.city ?? ""} onChange={(v) => setEditing({ ...editing, city: v })} />
            <SelectField label="Type" value={editing.type ?? "Luxury"} onChange={(v) => setEditing({ ...editing, type: v })} options={[...HOTEL_TYPES]} />
            <Field label="Price/night (₹)" type="number" value={String(editing.price_per_night ?? "")} onChange={(v) => setEditing({ ...editing, price_per_night: Number(v) })} />
            <Field label="Rating" type="number" value={String(editing.rating ?? "")} onChange={(v) => setEditing({ ...editing, rating: Number(v) })} />
            <Field label="Contact" value={editing.contact ?? ""} onChange={(v) => setEditing({ ...editing, contact: v })} />
            <Field label="Near" value={editing.near ?? ""} onChange={(v) => setEditing({ ...editing, near: v })} />
            <Field className="md:col-span-2" label="Amenities (comma separated)" value={(editing.amenities as any) ?? ""} onChange={(v) => setEditing({ ...editing, amenities: v as any })} />
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

export default ManageHotels;
