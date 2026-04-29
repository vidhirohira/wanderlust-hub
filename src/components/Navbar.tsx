import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, MapPin, User as UserIcon, LogOut, Heart, Map, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { GlobalSearch } from "./GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const links = [
  { to: "/home", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/stays", label: "Stays" },
  { to: "/transport", label: "Transport" },
  { to: "/plan-tour", label: "Plan Tour" },
  { to: "/weather", label: "Weather" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, isManager, signOut } = useAuth();

  const initials = (profile?.full_name ?? user?.email ?? "U")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  // Manager logged in via hardcoded form
  if (isManager && !user) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/home" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-card">
              <MapPin className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-lg">TIMS</span>
          </Link>
          <div className="flex-1" />
          <Button asChild variant="hero" size="sm">
            <Link to="/manager"><LayoutDashboard className="h-4 w-4" /> Manager Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-card transition-bounce group-hover:scale-110">
            <MapPin className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-lg tracking-tight">TIMS</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
              Discover India
            </span>
          </div>
        </Link>

        <div className="flex-1 max-w-xl hidden md:block">
          <GlobalSearch />
        </div>

        <nav className="hidden xl:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/auth?mode=signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-secondary transition-smooth">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline max-w-[120px] truncate">
                  {profile?.full_name ?? user.email?.split("@")[0]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="h-4 w-4 mr-2" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                  <Heart className="h-4 w-4 mr-2" /> Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/plan-tour")}>
                  <Map className="h-4 w-4 mr-2" /> Plan a Tour
                </DropdownMenuItem>
                {isManager && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/manager")}>
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Manager Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <button
          className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-smooth ml-auto"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile search */}
      <div className="md:hidden px-4 pb-3">
        <GlobalSearch />
      </div>

      {open && (
        <div className="xl:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-smooth",
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-secondary",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            {!user ? (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="px-4 py-3 mt-2 rounded-xl text-sm font-semibold bg-accent text-accent-foreground text-center"
              >
                Login / Sign up
              </Link>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary"
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary"
                >
                  Wishlist
                </NavLink>
                {isManager && (
                  <NavLink
                    to="/manager"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium bg-primary/10 text-primary"
                  >
                    Manager Dashboard
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                >
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
