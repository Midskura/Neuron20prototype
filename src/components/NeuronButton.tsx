import { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface NeuronButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function NeuronButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: NeuronButtonProps) {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "var(--neuron-radius-l)",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    transition: "all 120ms ease-out",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    outline: "none",
    border: "1px solid transparent",
  };

  const sizeStyles = {
    sm: { height: "32px", padding: "0 12px" },
    md: { height: "40px", padding: "0 16px" },
    lg: { height: "48px", padding: "0 20px" },
  };

  const variantStyles = {
    primary: {
      background: "var(--neuron-brand-green)",
      color: "#FFFFFF",
      border: "1px solid var(--neuron-brand-green)",
    },
    secondary: {
      background: "var(--neuron-bg-elevated)",
      color: "var(--neuron-ink-secondary)",
      border: "1px solid var(--neuron-ui-border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--neuron-ink-secondary)",
      border: "1px solid transparent",
    },
  };

  const hoverStyles = {
    primary: "var(--neuron-brand-green-600)",
    secondary: "var(--neuron-state-hover)",
    ghost: "var(--neuron-state-hover)",
  };

  const focusStyles = {
    outline: "2px solid var(--neuron-brand-green-600)",
    outlineOffset: "2px",
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      className={className}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === "primary") {
            e.currentTarget.style.background = hoverStyles.primary;
          } else {
            e.currentTarget.style.background = hoverStyles[variant];
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = variantStyles[variant].background;
        }
      }}
      onFocus={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, focusStyles);
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : icon ? (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
