import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  pill?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  pill = false,
  className = "",
  style,
  children,
  ...props
}) => {
  const variantClass =
    variant === "primary"
      ? "bl"
      : variant === "secondary"
      ? "ol"
      : variant === "danger"
      ? "dg"
      : "";

  const pillStyle = pill ? { borderRadius: "999px" } : undefined;

  return (
    <button
      className={`${variantClass} ${className}`.trim()}
      style={{ ...pillStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

