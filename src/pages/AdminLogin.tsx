import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && user && isAdmin) {
    navigate("/admin/dashboard", { replace: true });
  }

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    // Check admin role
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return toast.error("Sign-in failed");
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      toast.error("This account isn't an admin.");
      await supabase.auth.signOut();
      return;
    }
    toast.success("Welcome back, admin");
    navigate("/admin/dashboard");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    if (!data.user) {
      setLoading(false);
      return toast.error("Sign-up failed");
    }
    // Grant admin role
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: data.user.id, role: "admin" });
    setLoading(false);
    if (roleErr) {
      // RLS on user_roles only allows admins to insert; first admin can't self-grant via RLS.
      // Try via signed-in session anyway — if it fails, instruct manually.
      return toast.error("Account created but could not assign admin role. Please contact support.");
    }
    toast.success("Admin account ready! Sign in now.");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-secondary/40 via-background to-accent-soft">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-extrabold text-3xl">Admin Access</h1>
          <p className="text-muted-foreground mt-2">Manage destinations, hotels & more</p>
        </div>

        <div className="bg-card rounded-3xl shadow-elegant border border-border p-8 animate-scale-in">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create admin</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={setEmail}
                  required
                />
                <Field
                  id="password"
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={setPassword}
                  required
                />
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4">
                <Field id="email2" label="Email" type="email" icon={Mail} value={email} onChange={setEmail} required />
                <Field id="password2" label="Password (min 6 chars)" type="password" icon={Lock} value={password} onChange={setPassword} required />
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create admin account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Use this once to bootstrap your first admin account.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  id,
  label,
  type,
  icon: Icon,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  type: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => (
  <div>
    <Label htmlFor={id} className="text-sm font-semibold">
      {label}
    </Label>
    <div className="mt-1.5 flex items-center gap-2 px-4 py-2 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border-0 shadow-none focus-visible:ring-0 px-0 h-9"
      />
    </div>
  </div>
);

export default AdminLogin;
