"use client";

import { ThemeProvider } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

type User = any;

interface AuthContextValue {
  user: User | null;
  session: any | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        if (!mounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      } catch (e) {
        console.error("Error getting initial session", e);
        setIsLoading(false);
      }
    })();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        const s = session ?? null;
        setSession(s);
        setUser((s as any)?.user ?? null);
        setIsLoading(false);
      },
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut, isLoading } as any}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

export default Providers;
