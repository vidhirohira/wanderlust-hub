import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DESTINATION_TYPES, type Destination } from "@/lib/types";
import { DESTINATION_IMAGE_OPTIONS, resolveImage } from "@/lib/images";

const empty: Partial<Destination> = {
  name: "", city: "", state: "", type: "Heritage", rating: 4.5,
  entry_fee_indian: "", entry_fee_foreigner: "", timings: "", best_time: "",
  description: "", image_url: DESTINATION_IMAGE_OPTIONS[0], tags: [],
};

const ManageDestinations = () => {
  const [items, setItems] = useState<Destination[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Destination>>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("destinations").select("*").order("created_at", { ascending: false });
    setItems((data as Destination[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    setSaving(true);
    const payload = {
      ...editing,
      rating: Number(editing.rating) || 0,
      tags: typeof editing.tags === "string" ? (editing.tags as unknown as string).split(",").map(s => s.trim()).filter(Boolean) : (editing.tags ?? []),
    };
    const { id, created_at, ...data } = payload as any;
    const res = id
      ? await supabase.from("destinations").update(data).eq("id", id)
      : await supabase.from("destinations").insert(data as any);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(id ? "Updated" : "Created");
    setOpen(false);
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    const { error } = await supabase.from("destinations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Destinations</h1>
          <p className="text-muted-foreground mt-1">{items.length} total</p>
        </div>
        <Button variant="hero" onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add destination
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">City</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Rating</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t border-border hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={resolveImage(d.image_url)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-semibold">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{d.city}</td>
                <td className="px-4 py-3 hidden md:table-cell">{d.type}</td>
                <td className="px-4 py-3 hidden lg:table-cell">{d.rating}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...d, tags: (d.tags ?? []).join(", ") as any }); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} destination</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="City" value={editing.city ?? ""} onChange={(v) => setEditing({ ...editing, city: v })} />
            <Field label="State" value={editing.state ?? ""} onChange={(v) => setEditing({ ...editing, state: v })} />
            <SelectField label="Type" value={editing.type ?? "Heritage"} onChange={(v) => setEditing({ ...editing, type: v })} options={[...DESTINATION_TYPES]} />
            <Field label="Rating" type="number" value={String(editing.rating ?? "")} onChange={(v) => setEditing({ ...editing, rating: Number(v) })} />
            <SelectField label="Image" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} options={DESTINATION_IMAGE_OPTIONS} />
            <Field label="Entry Fee (Indian)" value={editing.entry_fee_indian ?? ""} onChange={(v) => setEditing({ ...editing, entry_fee_indian: v })} />
            <Field label="Entry Fee (Foreigner)" value={editing.entry_fee_foreigner ?? ""} onChange={(v) => setEditing({ ...editing, entry_fee_foreigner: v })} />
            <Field label="Timings" value={editing.timings ?? ""} onChange={(v) => setEditing({ ...editing, timings: v })} />
            <Field label="Best Time" value={editing.best_time ?? ""} onChange={(v) => setEditing({ ...editing, best_time: v })} />
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea className="mt-1.5" rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <Field className="md:col-span-2" label="Tags (comma separated)" value={(editing.tags as any) ?? ""} onChange={(v) => setEditing({ ...editing, tags: v as any })} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={onSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Field = ({ label, value, onChange, type = "text", className }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) => (
  <div className={className}>
    <Label className="text-sm font-semibold">{label}</Label>
    <Input className="mt-1.5" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
  <div>
    <Label className="text-sm font-semibold">{label}</Label>
    <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default ManageDestinations;
