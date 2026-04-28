import { useEffect, useState } from "react";
import { Star, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { Link } from "react-router-dom";

type ReviewWithProfile = Review & { profiles?: { full_name: string | null } | null };

export const Reviews = ({ destinationId }: { destinationId: string }) => {
  const { user } = useAuth();
  const [list, setList] = useState<ReviewWithProfile[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles:profiles!reviews_user_id_fkey(full_name)")
      .eq("destination_id", destinationId)
      .order("created_at", { ascending: false });
    // Manual join via separate query because FK to auth.users isn't directly visible. Fall back below.
    if (data && data.length) {
      setList(data as unknown as ReviewWithProfile[]);
      return;
    }
    const { data: rs } = await supabase
      .from("reviews")
      .select("*")
      .eq("destination_id", destinationId)
      .order("created_at", { ascending: false });
    const userIds = Array.from(new Set((rs ?? []).map((r) => r.user_id)));
    let profilesById: Record<string, { full_name: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      profilesById = Object.fromEntries(
        (profs ?? []).map((p) => [p.user_id, { full_name: p.full_name }]),
      );
    }
    setList(((rs ?? []) as Review[]).map((r) => ({ ...r, profiles: profilesById[r.user_id] ?? null })));
  };

  useEffect(() => {
    void load();
  }, [destinationId]);

  const own = user ? list.find((r) => r.user_id === user.id) : null;

  useEffect(() => {
    if (own) {
      setRating(own.rating);
      setComment(own.comment ?? "");
      setEditingId(own.id);
    } else {
      setEditingId(null);
      setRating(5);
      setComment("");
    }
  }, [own?.id]);

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    if (editingId) {
      const { error } = await supabase
        .from("reviews")
        .update({ rating, comment })
        .eq("id", editingId);
      if (error) toast.error(error.message);
      else toast.success("Review updated");
    } else {
      const { error } = await supabase
        .from("reviews")
        .insert({ user_id: user.id, destination_id: destinationId, rating, comment });
      if (error) toast.error(error.message);
      else toast.success("Review submitted");
    }
    setBusy(false);
    void load();
  };

  const remove = async () => {
    if (!editingId) return;
    setBusy(true);
    await supabase.from("reviews").delete().eq("id", editingId);
    setBusy(false);
    setEditingId(null);
    setRating(5);
    setComment("");
    toast.success("Review deleted");
    void load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Reviews <span className="text-muted-foreground font-normal">({list.length})</span>
        </h3>
      </div>

      {user ? (
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-0.5"
                aria-label={`${n} stars`}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-smooth",
                    n <= rating ? "fill-accent text-accent" : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={submit} disabled={busy} variant="hero" size="sm">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update review" : "Post review"}
            </Button>
            {editingId && (
              <Button onClick={remove} variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary font-semibold">
            Login
          </Link>{" "}
          to write a review.
        </div>
      )}

      <div className="space-y-3">
        {list.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet — be the first!</p>}
        {list.map((r) => (
          <div key={r.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm">
                {r.profiles?.full_name ?? "Traveller"}
              </span>
              <div className="flex items-center gap-1 text-xs">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-3.5 w-3.5",
                      n <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
            </div>
            {r.comment && <p className="text-sm text-foreground/80">{r.comment}</p>}
            <div className="text-[10px] text-muted-foreground mt-2">
              {new Date(r.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
