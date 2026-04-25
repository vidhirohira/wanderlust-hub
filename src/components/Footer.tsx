import { MapPin } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-secondary/40 mt-20">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <MapPin className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold">TIMS</span>
        <span className="text-sm text-muted-foreground">— Tourist Information Management System</span>
      </div>
      <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TIMS. Discover the soul of India.</p>
    </div>
  </footer>
);
