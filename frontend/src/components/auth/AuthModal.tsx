import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { IntegrationGuideModal } from "../layout/IntegrationGuideModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
}) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (!isOpen) return null;

  function resetForm() {
    setFullName("");
    setEmail("");
    setPassword("");
    setErrorMessage(null);
    setVerificationNotice(null);
  }

  function handleSwitchMode(newMode: "signin" | "signup") {
    setMode(newMode);
    setErrorMessage(null);
    setVerificationNotice(null);
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setOauthLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Could not initialize Google OAuth");
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setVerificationNotice(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMessage("Please enter your name.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }

        const res = await signUp({
          fullName,
          email,
          password,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Failed to create account.");
        } else if (res.requiresEmailVerification) {
          setVerificationNotice(
            `A confirmation link has been sent to ${email}. Check your inbox to complete registration.`
          );
        } else {
          resetForm();
          onClose();
        }
      } else {
        const res = await signIn({ email, password });
        if (!res.success) {
          setErrorMessage(res.error || "Incorrect email or password. Please try again.");
        } else {
          resetForm();
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        background: "rgba(0,0,0,.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div
        className="c relative text-left"
        style={{
          width: "100%",
          maxWidth: "460px",
          boxSizing: "border-box",
          background: "#141416",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: "28px",
          padding: "28px",
          boxShadow: "0 4px 24px rgba(0,0,0,.4)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: 0,
            color: "#A1A1A6",
            minHeight: "auto",
            padding: "6px",
          }}
          aria-label="Close"
        >
          <X style={{ width: "18px", height: "18px" }} />
        </button>

        <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-.02em", color: "#F5F5F7" }}>
          Welcome to PromptFlow
        </h1>
        <p className="s" style={{ margin: "4px 0 20px" }}>
          {mode === "signin"
            ? "Sign in to manage your automations."
            : "Create your account to start automating."}
        </p>

        {/* Segmented Switcher */}
        <div style={{ display: "flex", background: "#1C1C1E", borderRadius: "12px", padding: "3px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => handleSwitchMode("signin")}
            style={{
              flex: 1,
              border: 0,
              borderRadius: "10px",
              background: mode === "signin" ? "#2C2C2E" : "transparent",
              color: mode === "signin" ? "#F5F5F7" : "#A1A1A6",
              minHeight: "36px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("signup")}
            style={{
              flex: 1,
              border: 0,
              borderRadius: "10px",
              background: mode === "signup" ? "#2C2C2E" : "transparent",
              color: mode === "signup" ? "#F5F5F7" : "#A1A1A6",
              minHeight: "36px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Create Account
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={oauthLoading || loading}
          style={{
            width: "100%",
            borderRadius: "12px",
            background: "#000",
            color: "#F5F5F7",
            border: "1px solid rgba(255,255,255,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            minHeight: "44px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {oauthLoading ? (
            <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
              <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <p className="s" style={{ textAlign: "center", fontSize: "12px", margin: "16px 0" }}>
          or use email
        </p>

        {/* Error Banner */}
        {errorMessage && (
          <p
            style={{
              marginBottom: "12px",
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(255,69,58,.12)",
              color: "#FF453A",
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </p>
        )}

        {/* Verification Notice */}
        {verificationNotice && (
          <p
            style={{
              marginBottom: "12px",
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(48,209,88,.14)",
              color: "#30D158",
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {verificationNotice}
          </p>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div style={{ marginBottom: "14px" }}>
              <label htmlFor="fullname">Full Name</label>
              <input
                id="fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Steve Jobs"
              />
            </div>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div style={{ marginTop: "14px" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bl"
            style={{
              width: "100%",
              marginTop: "16px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : null}
            <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
          </button>
        </form>

        <p
          className="s"
          style={{
            marginTop: "16px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#1C1C1E",
            fontSize: "13px",
          }}
        >
          Need alerts?{" "}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            style={{
              background: "transparent",
              border: 0,
              padding: 0,
              color: "#0A84FF",
              fontSize: "13px",
              fontWeight: 500,
              minHeight: "auto",
              cursor: "pointer",
            }}
          >
            Open the Channel Setup Guide →
          </button>
        </p>
      </div>

      <IntegrationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
