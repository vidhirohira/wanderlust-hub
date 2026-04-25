import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, MapPin, Building2, UtensilsCrossed, Bus, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/destinations", label: "Destinations", icon: MapPin },
  { to: "/admin/hotels", label: "Hotels", icon: Building2 },
  { to: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { to: "/admin/transport", label: "Transport", icon: Bus },
];

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 bg-card rounded-2xl border border-border shadow-card p-4">
              <div className="px-3 py-2 mb-2">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Signed in</div>
                <div className="text-sm font-semibold truncate">{user.email}</div>
              </div>
              <nav className="space-y-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-foreground/70 hover:bg-secondary",
                      )
                    }
                  >
                    <l.icon className="h-4 w-4" />
                    {l.label}
                  </NavLink>
                ))}
              </nav>
              <Button onClick={signOut} variant="outline" className="w-full mt-4">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
