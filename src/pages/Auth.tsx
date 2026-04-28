import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Mail, MapPin, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, isManager, loading: authLoading } = useAuth();
  const [tab, setTab] = useState(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(isManager ? "/manager" : "/", { replace: true });
    }
  }, [user, isManager, authLoading, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName || email.split("@")[0] },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-secondary/40 via-background to-accent-soft">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant mb-4">
            <MapPin className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-extrabold text-3xl">Welcome to TIMS</h1>
          <p className="text-muted-foreground mt-2">Plan your next Indian adventure.</p>
        </div>

        <div className="bg-card rounded-3xl shadow-elegant border border-border p-8 animate-scale-in">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <Field id="email" label="Email" type="email" icon={Mail} value={email} onChange={setEmail} required />
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
                <Field id="name" label="Full name" type="text" icon={User} value={fullName} onChange={setFullName} />
                <Field
                  id="email2"
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={setEmail}
                  required
                />
                <Field
                  id="password2"
                  label="Password (min 6 chars)"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={setPassword}
                  required
                />
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Continue as guest →
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
          <p>Demo accounts:</p>
          <p>👤 tourist@tims.com / Tourist@2024</p>
          <p>🛠 manager@tims.com / Manager@2024</p>
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

export default Auth;
