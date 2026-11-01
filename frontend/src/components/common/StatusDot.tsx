import React from "react";

interface StatusDotProps {
  label?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  label = "Operational",
  className = "",
}) => {
  return (
    <span className={`m ${className}`} style={{ color: "#30D158" }}>
      <i className="dot" />
      {label}
    </span>
  );
};

