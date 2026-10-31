import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types/pipeline";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  activeCount: number;
  setActiveCount: React.Dispatch<React.SetStateAction<number>>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  demoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock guest for demo mode
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_DEMO_PROFILE: UserProfile = {
  id: DEMO_USER_ID,
  email: "student@promptflow.demo",
  telegram_chat_id: "123456789",
  discord_webhook_url: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_DEMO_PROFILE);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(1);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    // Attempt Supabase session retrieval
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setDemoMode(false);
          await fetchProfile(session.user.id, session.user.email || "");
        } else {
          // If no active Supabase session or placeholder key, use demo profile
          setDemoMode(true);
          setProfile(DEFAULT_DEMO_PROFILE);
        }
      } catch (err) {
        console.warn("Supabase auth not configured. Falling back to demo mode.");
        setDemoMode(true);
        setProfile(DEFAULT_DEMO_PROFILE);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setDemoMode(false);
          await fetchProfile(session.user.id, session.user.email || "");
        } else {
          setUser(null);
          setDemoMode(true);
          setProfile(DEFAULT_DEMO_PROFILE);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string, email: string) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
      } else {
        setProfile({ id: userId, email, telegram_chat_id: null, discord_webhook_url: null });
      }
    } catch {
      setProfile({ id: userId, email, telegram_chat_id: null, discord_webhook_url: null });
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (demoMode || !user) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return;
    }

    try {
      await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err: any) {
      console.error("Failed to update profile:", err.message);
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setDemoMode(true);
    setProfile(DEFAULT_DEMO_PROFILE);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        activeCount,
        setActiveCount,
        updateProfile,
        signOut,
        demoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
