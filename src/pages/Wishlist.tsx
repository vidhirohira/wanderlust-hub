import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/lib/types";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDetail } from "@/components/DestinationDetail";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const { user, loading } = useAuth();
  const [list, setList] = useState<Destination[]>([]);
  const [selected, setSelected] = useState<Destination | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("wishlists")
      .select("destinations(*)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setList(
          ((data as { destinations: Destination | null }[]) ?? [])
            .map((x) => x.destinations)
            .filter(Boolean) as Destination[],
        );
      });
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="container py-12">
      <div className="mb-10">
        <span className="text-sm font-semibold text-accent uppercase tracking-widest">Saved</span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-2 flex items-center gap-3">
          My <span className="text-gradient-primary">Wishlist</span>
          <Heart className="h-10 w-10 fill-destructive text-destructive" />
        </h1>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-secondary/30 border border-dashed">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-muted-foreground mb-6">No destinations saved yet.</p>
          <Button asChild variant="hero">
            <Link to="/destinations">Discover destinations</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {list.map((d) => (
            <DestinationCard key={d.id} destination={d} onClick={() => setSelected(d)} />
          ))}
        </div>
      )}

      <DestinationDetail destination={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
};

export default Wishlist;
