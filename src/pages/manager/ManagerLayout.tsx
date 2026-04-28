import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, BarChart3, Globe, Users, Database, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const links = [
  { to: "/manager/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/manager/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/manager/scrape", label: "Scrape Manager", icon: Globe },
  { to: "/manager/users", label: "Users", icon: Users },
  { to: "/manager/crud", label: "CRUD", icon: Database },
];

const ManagerLayout = () => {
  const { user, isManager, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (!user) return <Navigate to="/auth" replace />;
  if (!isManager) return <Navigate to="/" replace />;

  const onSignOut = async () => {
    await signOut();
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
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Manager</div>
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
              <Button onClick={onSignOut} variant="outline" className="w-full mt-4">
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

export default ManagerLayout;
