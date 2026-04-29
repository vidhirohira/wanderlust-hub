import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Building2, MapPin, Lock, Mail, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { loginManager } = useAuth();
  const [mode, setMode] = useState<"choose" | "manager">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submitManager = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      const ok = loginManager(email, password);
      setBusy(false);
      if (ok) {
        toast.success("Welcome, Manager 🛠");
        navigate("/manager", { replace: true });
      } else {
        toast.error("Invalid manager credentials");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-secondary/40 via-background to-accent-soft">
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-15 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/90" />

      <div className="relative w-full max-w-5xl">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant mb-4">
            <MapPin className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-accent/15 text-accent uppercase tracking-widest mb-3">
            <Sparkles className="h-3 w-3" /> Discover India
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl">
            Welcome to <span className="text-gradient-primary">TIMS</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Tourist Information Management System</p>
        </div>

        {mode === "choose" && (
          <div className="grid md:grid-cols-2 gap-6 animate-scale-in">
            {/* Tourist card */}
            <button
              onClick={() => navigate("/auth")}
              className="group text-left bg-card border border-border rounded-3xl p-8 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-bounce"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-soft mb-5">
                <Briefcase className="h-7 w-7" />
              </div>
              <div className="text-3xl mb-1">🧳</div>
              <h2 className="font-display font-extrabold text-2xl mb-2">I'm a Tourist</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Explore destinations, save favourites, plan tours and get AI-powered travel help.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                Continue <ArrowRight className="h-4 w-4 transition-bounce group-hover:translate-x-1" />
              </div>
            </button>

            {/* Manager card */}
            <button
              onClick={() => setMode("manager")}
              className="group text-left bg-card border border-border rounded-3xl p-8 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-bounce"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent text-accent-foreground shadow-soft mb-5">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="text-3xl mb-1">🏢</div>
              <h2 className="font-display font-extrabold text-2xl mb-2">I'm a Manager</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Manage destinations, approve scrapes, view analytics and oversee user activity.
              </p>
              <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                Manager login <ArrowRight className="h-4 w-4 transition-bounce group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        )}

        {mode === "manager" && (
          <div className="max-w-md mx-auto bg-card rounded-3xl border border-border shadow-elegant p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">Manager Access</h2>
                <p className="text-xs text-muted-foreground">Authorized personnel only</p>
              </div>
            </div>
            <form onSubmit={submitManager} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">Email</Label>
                <div className="mt-1.5 flex items-center gap-2 px-4 py-2 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@tims.com"
                    required
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold">Password</Label>
                <div className="mt-1.5 flex items-center gap-2 px-4 py-2 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-9"
                  />
                </div>
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in as manager"}
              </Button>
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="block w-full text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
            </form>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/home" className="text-sm text-muted-foreground hover:text-foreground">
            Or browse as guest →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
