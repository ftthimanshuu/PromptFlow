import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Send,
  Disc as Discord,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
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

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");

  // UI state
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
    setTelegramChatId("");
    setDiscordWebhookUrl("");
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
          telegramChatId: telegramChatId.trim() || undefined,
          discordWebhookUrl: discordWebhookUrl.trim() || undefined,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Failed to create account.");
        } else if (res.requiresEmailVerification) {
          setVerificationNotice(
            `A confirmation link has been sent to ${email}. Please check your inbox to complete registration!`
          );
        } else {
          resetForm();
          onClose();
        }
      } else {
        const res = await signIn({ email, password });
        if (!res.success) {
          setErrorMessage(res.error || "Invalid email or password.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-white/[0.12] rounded-[28px] w-full max-w-md shadow-2xl relative overflow-hidden my-8 text-[#F5F5F7]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-7 sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-white/80 border border-white/[0.08] text-xs font-medium mb-3">
              <Sparkles className="h-3 w-3 text-[#007AFF]" />
              <span>PromptFlow Account</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-xs text-[#A1A1A6] mt-1.5 max-w-xs mx-auto">
              {mode === "signin"
                ? "Sign in to access your active monitors and execution history."
                : "Register to get 5 active automations included free forever."}
            </p>
          </div>

          {/* Cupertino Segmented Control */}
          <div className="flex bg-[#1C1C1E] p-1 rounded-full border border-white/[0.08] mb-6">
            <button
              type="button"
              onClick={() => handleSwitchMode("signin")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
                mode === "signin"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("signup")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
                mode === "signup"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[12px] bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white text-xs font-medium transition-all shadow-sm disabled:opacity-50"
          >
            {oauthLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#007AFF]" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Hairline Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#6E6E73] font-semibold">
              <span className="bg-[#141416] px-3">or continue with email</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Verification Notice */}
          {verificationNotice && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] text-xs leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Check your email</p>
                <p className="text-white/80 mt-0.5">{verificationNotice}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Steve Jobs"
                    className="w-full apple-input pl-10 pr-3.5 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@apple.com"
                  className="w-full apple-input pl-10 pr-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  className="w-full apple-input pl-10 pr-3.5 py-2 text-xs"
                />
              </div>
            </div>

            {/* Optional Alert Channels on Signup */}
            {mode === "signup" && (
              <div className="pt-2 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">
                    Push Alert Channels (Optional)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="text-[11px] text-[#007AFF] hover:underline flex items-center gap-1 font-medium"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Setup Guide
                  </button>
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] text-[#A1A1A6] mb-1">
                    <Send className="h-3 w-3 text-[#007AFF]" />
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="e.g. 6312393356"
                    className="w-full apple-input px-3 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] text-[#A1A1A6] mb-1">
                    <Discord className="h-3 w-3 text-[#5856D6]" />
                    Discord Webhook URL
                  </label>
                  <input
                    type="url"
                    value={discordWebhookUrl}
                    onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full apple-input px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Primary Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 apple-btn-primary py-2.5 px-4 text-xs font-medium gap-1.5 disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create Account & Continue"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Footnote */}
          <div className="mt-5 text-center text-xs text-[#A1A1A6]">
            {mode === "signin" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode("signup")}
                  className="text-[#007AFF] hover:underline font-medium ml-1"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode("signin")}
                  className="text-[#007AFF] hover:underline font-medium ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <IntegrationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
