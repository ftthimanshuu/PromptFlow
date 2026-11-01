import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = "",
  style,
  ...props
}) => {
  return (
    <div style={{ width: "100%" }}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={className}
        style={style}
        {...props}
      />
      {error && (
        <p
          style={{
            marginTop: "6px",
            color: "#FF453A",
            fontSize: "12px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

