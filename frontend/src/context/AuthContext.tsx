import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types/pipeline";

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  demoMode: boolean;
  activeCount: number;
  setActiveCount: React.Dispatch<React.SetStateAction<number>>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; isProviderDisabled?: boolean }>;
  signInDemoGoogleUser: () => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchToDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock guest for demo mode
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_DEMO_PROFILE: UserProfile = {
  id: DEMO_USER_ID,
  email: "guest@promptflow.demo",
  full_name: "Guest Explorer",
  telegram_chat_id: "6312393356",
  discord_webhook_url: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_DEMO_PROFILE);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(1);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    // Attempt Supabase session retrieval & PKCE OAuth code exchange
    async function initAuth() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        const oauthError = searchParams.get("error_description") || searchParams.get("error");

        if (oauthError) {
          console.error("Google OAuth Callback Error:", oauthError);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          window.history.replaceState({}, document.title, window.location.pathname);
          if (data?.session?.user && !error) {
            setUser(data.session.user);
            setDemoMode(false);
            await fetchAndSyncProfile(data.session.user.id, data.session.user.email || "", data.session.user.user_metadata);
            setLoading(false);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setDemoMode(false);
          await fetchAndSyncProfile(session.user.id, session.user.email || "", session.user.user_metadata);
        } else {
          setDemoMode(true);
          setProfile(DEFAULT_DEMO_PROFILE);
        }
      } catch (err) {
        console.warn("Supabase auth not configured or session retrieval failed. Falling back to demo mode.", err);
        setDemoMode(true);
        setProfile(DEFAULT_DEMO_PROFILE);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes (e.g. login, logout, OAuth callback)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setDemoMode(false);
          await fetchAndSyncProfile(session.user.id, session.user.email || "", session.user.user_metadata);
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

  async function fetchAndSyncProfile(userId: string, email: string, userMeta?: any) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data && !error) {
        const oauthName = userMeta?.full_name || userMeta?.name;
        // If profile exists but full_name is missing and OAuth or metadata provided one, update it
        if (!data.full_name && oauthName) {
          await supabase.from("profiles").update({ full_name: oauthName }).eq("id", userId);
          data.full_name = oauthName;
        }
        setProfile(data);
      } else {
        // Create initial profile record if it doesn't exist yet
        const initialProfile: UserProfile = {
          id: userId,
          email,
          full_name: userMeta?.full_name || userMeta?.name || "User",
          telegram_chat_id: userMeta?.telegram_chat_id || null,
          discord_webhook_url: userMeta?.discord_webhook_url || null,
        };
        await supabase.from("profiles").upsert(initialProfile);
        setProfile(initialProfile);
      }
    } catch (err) {
      console.warn("Profile fetch error:", err);
      setProfile({
        id: userId,
        email,
        full_name: userMeta?.full_name || userMeta?.name || "User",
        telegram_chat_id: null,
        discord_webhook_url: null,
      });
    }
  }

  async function signUp(params: SignUpParams) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            telegram_chat_id: params.telegramChatId?.trim() || null,
            discord_webhook_url: params.discordWebhookUrl?.trim() || null,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Upsert user profile directly to ensure immediate availability
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: params.email.trim(),
            full_name: params.fullName.trim(),
            telegram_chat_id: params.telegramChatId?.trim() || null,
            discord_webhook_url: params.discordWebhookUrl?.trim() || null,
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn("Direct profile upsert after signup note:", dbErr);
        }

        // Check if session was created immediately (confirm email disabled) or if verification required
        const requiresEmailVerification = !data.session;
        if (data.session) {
          setUser(data.user);
          setDemoMode(false);
          await fetchAndSyncProfile(data.user.id, data.user.email || params.email, {
            full_name: params.fullName,
            telegram_chat_id: params.telegramChatId,
            discord_webhook_url: params.discordWebhookUrl,
          });
        }

        return {
          success: true,
          requiresEmailVerification,
        };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred during registration." };
    }
  }

  async function signIn(params: SignInParams) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email.trim(),
        password: params.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setDemoMode(false);
        await fetchAndSyncProfile(data.user.id, data.user.email || params.email, data.user.user_metadata);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign in failed." };
    }
  }

  async function signInWithGoogle(): Promise<{ success: boolean; error?: string; isProviderDisabled?: boolean }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes("not enabled")) {
          return {
            success: false,
            isProviderDisabled: true,
            error: "Google Sign-In is not enabled in your Supabase project yet. In your Supabase Dashboard, go to Authentication > Providers > Google to enable it.",
          };
        }
        return { success: false, error: error.message };
      }

      if (data?.url) {
        // Pre-check if Supabase returns 400 "provider is not enabled" before redirecting browser
        try {
          const res = await fetch(data.url);
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            if (body?.msg?.toLowerCase().includes("not enabled") || body?.error_code === "validation_failed") {
              return {
                success: false,
                isProviderDisabled: true,
                error: "Google OAuth is not enabled in your Supabase project yet. Please enable Google under Authentication > Providers in your Supabase Dashboard, or continue with the Demo Google Account below.",
              };
            }
          }
        } catch {
          // Cross-origin redirect when valid Google OAuth is configured
        }

        window.location.href = data.url;
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Google OAuth initialization failed." };
    }
  }

  function signInDemoGoogleUser() {
    const demoGoogleUser: User = {
      id: "google-demo-user-1",
      app_metadata: { provider: "google" },
      user_metadata: {
        full_name: "Himanshu Lokhande",
        name: "Himanshu Lokhande",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Himanshu",
        email: "himanshulokhande46@gmail.com",
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: "himanshulokhande46@gmail.com",
    } as any;

    setUser(demoGoogleUser);
    setProfile({
      id: "google-demo-user-1",
      email: "himanshulokhande46@gmail.com",
      full_name: "Himanshu Lokhande",
      telegram_chat_id: "6312393356",
      discord_webhook_url: null,
    });
    setDemoMode(false);
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (demoMode || !user) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Supabase profile update error:", error.message);
      }

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err: any) {
      console.error("Failed to update profile:", err.message);
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out note:", err);
    }
    setUser(null);
    setDemoMode(true);
    setProfile(DEFAULT_DEMO_PROFILE);
  }

  function switchToDemoMode() {
    setDemoMode(true);
    setProfile(DEFAULT_DEMO_PROFILE);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        demoMode,
        activeCount,
        setActiveCount,
        signUp,
        signIn,
        signInWithGoogle,
        signInDemoGoogleUser,
        signOut,
        updateProfile,
        switchToDemoMode,
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
