import { Session, User } from "@supabase/supabase-js";
import { PropsWithChildren, createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../services/supabaseClient";

type AuthResult = {
  error: string | null;
  needsEmailConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error && process.env.NODE_ENV !== "production") {
        console.error("[QueueCast] Failed to restore Supabase session:", error);
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signIn: async (email, password) => {
        if (!supabase) {
          return { error: "Supabase is not configured." };
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUp: async (email, password) => {
        if (!supabase) {
          return { error: "Supabase is not configured." };
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        return {
          error: error?.message ?? null,
          needsEmailConfirmation: !error && !data.session,
        };
      },
      signOut: async () => {
        if (!supabase) {
          return { error: "Supabase is not configured." };
        }

        const { error } = await supabase.auth.signOut();
        return { error: error?.message ?? null };
      },
    }),
    [isLoading, session],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
