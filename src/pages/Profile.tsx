import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Calendar, Mail, MapPin, Trash2, Edit, Search as SearchIcon, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Destination, Review, TourPlan, SearchLog } from "@/lib/types";
import { resolveImage } from "@/lib/images";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const [tours, setTours] = useState<TourPlan[]>([]);
  const [wishlist, setWishlist] = useState<Destination[]>([]);
  const [history, setHistory] = useState<SearchLog[]>([]);
  const [reviews, setReviews] = useState<(Review & { destination?: Destination | null })[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadAll = async () => {
    if (!user) return;
    setDataLoading(true);
    const [t, w, h, r] = await Promise.all([
      supabase.from("tour_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("wishlists").select("destination_id, destinations(*)").eq("user_id", user.id),
      supabase
        .from("search_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("reviews")
        .select("*, destinations(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setTours((t.data as TourPlan[]) ?? []);
    setWishlist(
      ((w.data as { destinations: Destination | null }[]) ?? [])
        .map((x) => x.destinations)
        .filter(Boolean) as Destination[],
    );
    setHistory((h.data as SearchLog[]) ?? []);
    setReviews(
      ((r.data as (Review & { destinations: Destination | null })[]) ?? []).map((x) => ({
        ...x,
        destination: x.destinations,
      })),
    );
    setDataLoading(false);
  };

  useEffect(() => {
    void loadAll();
  }, [user?.id]);

  if (loading) return <div className="container py-20"><Skeleton className="h-40 w-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const initials = (profile?.full_name ?? user.email ?? "U")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const removeWish = async (id: string) => {
    await supabase.from("wishlists").delete().eq("user_id", user.id).eq("destination_id", id);
    toast.success("Removed");
    void loadAll();
  };

  const deleteTour = async (id: string) => {
    await supabase.from("tour_plans").delete().eq("id", id);
    toast.success("Tour deleted");
    void loadAll();
  };

  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("Review deleted");
    void loadAll();
  };

  return (
    <div className="container py-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 animate-fade-up">
        <Avatar className="h-24 w-24 ring-4 ring-primary/10">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl">
            {profile?.full_name ?? user.email?.split("@")[0]}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Member since{" "}
              {new Date(profile?.created_at ?? user.created_at).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tours">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-fit mb-8">
          <TabsTrigger value="tours">My Tours ({tours.length})</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist ({wishlist.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tours">
          {dataLoading ? (
            <Skeleton className="h-32" />
          ) : tours.length === 0 ? (
            <Empty
              title="No tours planned yet"
              cta={{ label: "Plan your first tour", to: "/plan-tour" }}
              icon="🗺"
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {tours.map((t) => (
                <div key={t.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-lg">{t.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.start_date && t.end_date
                          ? `${new Date(t.start_date).toLocaleDateString()} → ${new Date(t.end_date).toLocaleDateString()}`
                          : "Dates not set"}{" "}
                        · {t.num_people} {t.num_people === 1 ? "person" : "people"}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteTour(t.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{t.destinations.length} stops</span>
                    <span className="font-bold text-primary">₹{t.estimated_budget.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          {dataLoading ? (
            <Skeleton className="h-32" />
          ) : wishlist.length === 0 ? (
            <Empty title="Your wishlist is empty" cta={{ label: "Browse destinations", to: "/destinations" }} icon="❤" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((d) => (
                <div key={d.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                  <div className="aspect-video">
                    <img src={resolveImage(d.image_url)} alt={d.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{d.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {d.city}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-destructive"
                      onClick={() => removeWish(d.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {dataLoading ? (
            <Skeleton className="h-32" />
          ) : history.length === 0 ? (
            <Empty title="No searches yet" icon="🔍" />
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <Link
                  key={h.id}
                  to={`/search?q=${encodeURIComponent(h.search_query)}`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-smooth"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{h.search_query}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.results_count} result{h.results_count !== 1 ? "s" : ""} ·{" "}
                        {new Date(h.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {dataLoading ? (
            <Skeleton className="h-32" />
          ) : reviews.length === 0 ? (
            <Empty title="No reviews yet" icon="⭐" />
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{r.destination?.name ?? "—"}</h3>
                      <div className="flex items-center gap-1 mt-1">
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
                      {r.comment && <p className="text-sm mt-2 text-foreground/80">{r.comment}</p>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteReview(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Empty = ({
  title,
  cta,
  icon,
}: {
  title: string;
  cta?: { label: string; to: string };
  icon?: string;
}) => (
  <div className="text-center py-16 px-6 rounded-3xl bg-secondary/30 border border-dashed border-border">
    <div className="text-5xl mb-3">{icon ?? "✨"}</div>
    <p className="text-muted-foreground mb-4">{title}</p>
    {cta && (
      <Button asChild variant="hero">
        <Link to={cta.to}>{cta.label}</Link>
      </Button>
    )}
  </div>
);

export default Profile;
