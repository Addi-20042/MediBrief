import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  adminLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  const syncAccessState = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    setAdminLoading(true);

    try {
      const [{ data: accountStatus }, { data: adminRow }] = await Promise.all([
        supabase.rpc("get_my_account_status"),
        supabase
          .from("admin_users")
          .select("role, is_active")
          .eq("user_id", currentUser.id)
          .maybeSingle(),
      ]);

      const status = Array.isArray(accountStatus) ? accountStatus[0] : accountStatus;
      if (status && !status.is_account_active) {
        sessionStorage.setItem(
          "medibrief-account-disabled",
          status.status_reason || "Your account is currently inactive. Please contact support.",
        );
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setAdminLoading(false);
        setLoading(false);
        return;
      }

      setIsAdmin(Boolean(adminRow?.is_active));
    } catch (error) {
      console.error("Access state sync error:", error);
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    // Track whether the listener has already fired before getSession resolves.
    // This prevents the race where getSession returns stale data after
    // onAuthStateChange has already delivered the real session.
    let listenerFired = false;

    // 1. Set up auth state listener FIRST — this is the source of truth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        listenerFired = true;
        // Use functional updates to avoid closure-stale state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        void syncAccessState(currentSession?.user ?? null);

        // Send welcome email on first sign up (fire-and-forget, no await in sync callback)
        if (event === "SIGNED_IN" && currentSession?.user) {
          const createdAt = new Date(currentSession.user.created_at).getTime();
          if (Date.now() - createdAt < 30000) {
            supabase.functions.invoke("send-welcome-email", {
              body: {
                email: currentSession.user.email,
                name: currentSession.user.user_metadata?.full_name || "",
              },
            }).catch((e) => console.error("Welcome email error:", e));
          }

          supabase.functions
            .invoke("send-medication-reminders", {
              body: {
                trigger: "login_digest",
                user_id: currentSession.user.id,
              },
            })
            .catch((e) => console.error("Medication login SMS error:", e));
        }
      }
    );

    // 2. Check for existing session as fallback — only apply if listener hasn't fired yet.
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!listenerFired) {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setLoading(false);
        void syncAccessState(existingSession?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAdminLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        adminLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
