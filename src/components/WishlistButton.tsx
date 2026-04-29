import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { ScrapedDestination } from "@/lib/types";

type Props = {
  destinationId?: string;
  /** When provided, will save the scraped destination to DB on first wishlist */
  scraped?: ScrapedDestination;
  variant?: "card" | "detail";
};

export const WishlistButton = ({ destinationId, scraped, variant = "card" }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resolvedId, setResolvedId] = useState<string | undefined>(destinationId);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setResolvedId(destinationId);
  }, [destinationId]);

  useEffect(() => {
    if (!user || !resolvedId) {
      setSaved(false);
      return;
    }
    supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("destination_id", resolvedId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, resolvedId]);

  const ensureScrapedSaved = async (): Promise<string | null> => {
    if (resolvedId) return resolvedId;
    if (!scraped) return null;

    // Check if a destination with same name + city already exists
    const { data: existing } = await supabase
      .from("destinations")
      .select("id")
      .eq("name", scraped.name)
      .eq("city", scraped.city)
      .maybeSingle();

    if (existing?.id) return (existing as { id: string }).id;

    const { data: inserted, error } = await supabase
      .from("destinations")
      .insert({
        name: scraped.name,
        city: scraped.city,
        state: scraped.state,
        type: scraped.type,
        description: scraped.description,
        image_url: scraped.image_url,
        entry_fee_indian: scraped.entry_fee_indian,
        entry_fee_foreigner: scraped.entry_fee_foreigner,
        timings: scraped.timings,
        best_time: scraped.best_time,
        tags: scraped.tags ?? [],
        rating: scraped.rating ?? 4,
        source: "web",
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return null;
    }
    return (inserted as { id: string }).id;
  };

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast("Please login to save favourites", {
        action: { label: "Login", onClick: () => navigate("/auth") },
      });
      return;
    }
    setBusy(true);
    try {
      let id = resolvedId;
      if (!id) {
        const newId = await ensureScrapedSaved();
        if (!newId) {
          setBusy(false);
          return;
        }
        id = newId;
        setResolvedId(newId);
      }

      if (saved) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("destination_id", id);
        setSaved(false);
        toast.success("Removed from wishlist");
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id, destination_id: id });
        if (error) {
          toast.error(error.message);
        } else {
          setSaved(true);
          toast.success("Saved to your wishlist! ❤");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-bounce hover:scale-110 active:scale-95 backdrop-blur-md shadow-soft",
        variant === "card"
          ? "h-9 w-9 bg-background/90"
          : "h-10 px-4 gap-2 bg-background/90 border border-border text-sm font-semibold",
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-smooth",
          saved ? "fill-destructive text-destructive" : "text-foreground/70",
        )}
      />
      {variant === "detail" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
};
