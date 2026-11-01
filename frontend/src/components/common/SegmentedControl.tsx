import React, { useId } from "react";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string = string> {
  name?: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SegmentedControl<T extends string = string>({
  name,
  options,
  value,
  onChange,
  className = "",
  style,
}: SegmentedControlProps<T>) {
  const generatedId = useId();
  const groupName = name || `seg-${generatedId}`;
  const nClass = options.length === 2 ? "n2" : options.length === 3 ? "n3" : "";
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div
      className={`sg ${nClass} ${className}`}
      style={{
        position: "relative",
        display: "inline-flex",
        boxSizing: "border-box",
        padding: "3px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        ...style,
      }}
      role="radiogroup"
    >
      {options.map((opt, idx) => {
        const inputId = `${groupName}-opt-${idx}`;
        const isChecked = opt.value === value;

        return (
          <React.Fragment key={opt.value}>
            <input
              type="radio"
              name={groupName}
              id={inputId}
              checked={isChecked}
              onChange={() => onChange(opt.value)}
              value={opt.value}
            />
            <label
              htmlFor={inputId}
              style={{
                flex: 1,
                position: "relative",
                zIndex: 2,
                textAlign: "center",
                padding: "8px 14px",
                font: "600 13px -apple-system, system-ui, sans-serif",
                color: isChecked ? "#F5F5F7" : "#A1A1A6",
                cursor: "pointer",
                transition: "color .3s",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {opt.label}
            </label>
          </React.Fragment>
        );
      })}

      {/* Sliding Glass Pill */}
      <i
        className="pl"
        style={{
          position: "absolute",
          top: "3px",
          bottom: "3px",
          left: "3px",
          zIndex: 1,
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 0.16)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 2px 8px rgba(0, 0, 0, 0.25)",
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(${Math.max(0, selectedIndex) * 100}%)`,
          transition: "transform .45s cubic-bezier(.16, 1, .3, 1)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
