import { Check } from "lucide-react";
import { useState } from "react";

interface FormCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function FormCheckbox({ checked, onChange, label }: FormCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Compute styles based on state
  let borderColor = "var(--neuron-ui-border)";
  let backgroundColor = "white";
  
  if (checked) {
    borderColor = "#0F766E";
    backgroundColor = "#0F766E";
  } else if (isHovered) {
    borderColor = "#0F766E";
    backgroundColor = "#F8FBFB";
  }
  
  return (
    <label 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        cursor: "pointer",
        userSelect: "none"
      }}
    >
      <div
        onClick={() => onChange(!checked)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "4px",
          border: `2px solid ${borderColor}`,
          backgroundColor: backgroundColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
          flexShrink: 0
        }}
      >
        {checked && (
          <Check 
            size={12} 
            style={{ 
              color: "white",
              strokeWidth: 3
            }} 
          />
        )}
      </div>
      <span style={{ 
        fontSize: "13px",
        color: "var(--neuron-ink-base)",
        fontWeight: 500
      }}>
        {label}
      </span>
    </label>
  );
}