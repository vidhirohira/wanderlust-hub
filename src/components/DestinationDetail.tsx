import { Star, MapPin, Clock, Calendar, Ticket, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Destination } from "@/lib/types";
import { resolveImage } from "@/lib/images";
import { typeColorClasses } from "@/lib/typeColor";
import { cn } from "@/lib/utils";

type Props = {
  destination: Destination | null;
  onOpenChange: (open: boolean) => void;
};

export const DestinationDetail = ({ destination: d, onOpenChange }: Props) => (
  <Dialog open={!!d} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl p-0 overflow-hidden border-0">
      {d && (
        <div>
          <DialogTitle className="sr-only">{d.name}</DialogTitle>
          <div className="relative aspect-[16/9] bg-muted overflow-hidden">
            <img src={resolveImage(d.image_url)} alt={d.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <span
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-md bg-white/20 border border-white/30",
                )}
              >
                {d.type}
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl">{d.name}</h2>
              <p className="flex items-center gap-1.5 text-white/90 mt-1.5">
                <MapPin className="h-4 w-4" /> {d.city}, {d.state}
              </p>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-sm font-bold shadow-card">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {d.rating}
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <p className="text-foreground/80 leading-relaxed">{d.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InfoTile icon={Ticket} label="Indian" value={d.entry_fee_indian || "Free"} />
              <InfoTile icon={Globe} label="Foreigner" value={d.entry_fee_foreigner || "Free"} />
              <InfoTile icon={Clock} label="Timings" value={d.timings || "—"} />
              <InfoTile icon={Calendar} label="Best Time" value={d.best_time || "—"} />
            </div>

            {d.tags && d.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {d.tags.map((t) => (
                    <span
                      key={t}
                      className={cn("px-3 py-1 rounded-full text-xs font-medium border", typeColorClasses(d.type))}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

const InfoTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl bg-secondary/60 p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="font-semibold text-sm">{value}</div>
  </div>
);
