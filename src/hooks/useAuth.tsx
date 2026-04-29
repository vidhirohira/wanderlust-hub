import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Role } from "@/lib/types";

const MANAGER_FLAG_KEY = "tims_manager_session";
const MANAGER_EMAIL = "manager@tims.com";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  isManager: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  loginManager: (email: string, password: string) => boolean;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [managerLocal, setManagerLocal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();
    setProfile((prof as Profile) ?? null);
    setRole("user");
  };

  useEffect(() => {
    setManagerLocal(localStorage.getItem(MANAGER_FLAG_KEY) === "1");

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => void loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) await loadProfile(sess.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user,
      profile,
      role,
      isManager: managerLocal,
      loading,
      signOut: async () => {
        if (managerLocal) {
          localStorage.removeItem(MANAGER_FLAG_KEY);
          setManagerLocal(false);
        }
        await supabase.auth.signOut();
      },
      refresh: async () => {
        if (user) await loadProfile(user.id);
      },
      loginManager: (email, password) => {
        if (email.trim().toLowerCase() === MANAGER_EMAIL && password === "Manager@2024") {
          localStorage.setItem(MANAGER_FLAG_KEY, "1");
          setManagerLocal(true);
          return true;
        }
        return false;
      },
    }),
    [session, user, profile, role, loading, managerLocal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
