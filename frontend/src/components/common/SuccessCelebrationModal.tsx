import React from "react";
import { Check, X, ArrowRight } from "lucide-react";

interface SuccessCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scheduleCron?: string;
  onViewDashboard: () => void;
}

export const SuccessCelebrationModal: React.FC<SuccessCelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  scheduleCron = "0 8 * * *",
  onViewDashboard,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(28px) saturate(170%)",
        WebkitBackdropFilter: "blur(28px) saturate(170%)",
      }}
    >
      <div
        className="c apple-spring-modal relative text-center"
        style={{
          width: "100%",
          maxWidth: "440px",
          boxSizing: "border-box",
          background: "rgba(255,255,255,.07)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          backdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(48,209,88,.4)",
          borderRadius: "28px",
          padding: "36px 28px",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.3), 0 0 40px rgba(48,209,88,.2), 0 20px 60px rgba(0,0,0,.6)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "transparent",
            border: 0,
            color: "#A1A1A6",
            minHeight: "auto",
            padding: "6px",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <X style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Animated Glowing Success Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            background: "rgba(48,209,88,.16)",
            border: "1.5px solid rgba(48,209,88,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(48,209,88,.35)",
          }}
        >
          <Check style={{ width: "32px", height: "32px", color: "#30D158", strokeWidth: 3 }} />
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-.02em", color: "#F5F5F7" }}>
          Automation Activated!
        </h2>
        <p className="s" style={{ fontSize: "14px", marginTop: "8px", lineHeight: 1.5 }}>
          Your pipeline <b style={{ color: "#F5F5F7" }}>"{title}"</b> is now compiled, scheduled, and active.
        </p>

        {/* Info Card */}
        <div
          style={{
            margin: "24px 0",
            padding: "14px 18px",
            borderRadius: "16px",
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span className="t" style={{ fontSize: "11px", fontWeight: 500, display: "block" }}>
              SCHEDULE
            </span>
            <span className="m" style={{ fontSize: "13px", color: "#F5F5F7" }}>
              ◷ {scheduleCron}
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className="t" style={{ fontSize: "11px", fontWeight: 500, display: "block" }}>
              STATUS
            </span>
            <span className="p on" style={{ fontSize: "11px" }}>
              ● Running in Daemon
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button"
            className="bl"
            onClick={onViewDashboard}
            style={{
              width: "100%",
              borderRadius: "14px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <span>View in Dashboard</span>
            <ArrowRight style={{ width: "16px", height: "16px" }} />
          </button>

          <button
            type="button"
            className="ol"
            onClick={onClose}
            style={{
              width: "100%",
              borderRadius: "14px",
              padding: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#A1A1A6",
            }}
          >
            Stay in Studio
          </button>
        </div>
      </div>
    </div>
  );
};

