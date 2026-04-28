import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export const WishlistButton = ({
  destinationId,
  variant = "card",
}: {
  destinationId: string;
  variant?: "card" | "detail";
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("destination_id", destinationId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, destinationId]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast("Login to save destinations", {
        action: { label: "Login", onClick: () => navigate("/auth") },
      });
      return;
    }
    setBusy(true);
    if (saved) {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("destination_id", destinationId);
      setSaved(false);
      toast.success("Removed from wishlist");
    } else {
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, destination_id: destinationId });
      if (error) toast.error(error.message);
      else {
        setSaved(true);
        toast.success("Saved to wishlist ❤");
      }
    }
    setBusy(false);
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
