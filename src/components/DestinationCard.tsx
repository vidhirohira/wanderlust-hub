import { Star, MapPin, Clock } from "lucide-react";
import type { Destination } from "@/lib/types";
import { resolveImage } from "@/lib/images";
import { typeColorClasses } from "@/lib/typeColor";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";

type Props = {
  destination: Destination;
  onClick?: () => void;
};

export const DestinationCard = ({ destination: d, onClick }: Props) => (
  <button
    onClick={onClick}
    className="group text-left bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-bounce hover:-translate-y-1 border border-border/60 w-full"
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      <img
        src={resolveImage(d.image_url)}
        alt={d.name}
        loading="lazy"
        className="h-full w-full object-cover transition-bounce group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span
        className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md bg-background/90",
          typeColorClasses(d.type),
        )}
      >
        {d.type}
      </span>
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-xs font-bold shadow-soft">
          <Star className="h-3 w-3 fill-accent text-accent" />
          {Number(d.rating).toFixed(1)}
        </div>
        <WishlistButton destinationId={d.id} />
      </div>
    </div>
    <div className="p-5 space-y-3">
      <div>
        <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-smooth">
          {d.name}
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" />
          {d.city}, {d.state}
        </p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="text-xs">
          <span className="text-muted-foreground">Entry: </span>
          <span className="font-semibold">{d.entry_fee_indian || "Free"}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {d.best_time}
        </div>
      </div>
    </div>
  </button>
);
