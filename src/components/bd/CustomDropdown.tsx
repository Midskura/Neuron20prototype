import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomDropdown({ label, value, options, onChange, placeholder }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || "Select...";
  const displayIcon = selectedOption?.icon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 rounded-lg text-[13px] transition-all flex items-center gap-2 min-w-[160px]"
        style={{
          border: "1px solid var(--neuron-ui-border)",
          backgroundColor: "#FFFFFF",
          color: "#12332B"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#F9FAFB";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#FFFFFF";
        }}
      >
        <span style={{ fontSize: "11px", color: "#667085", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}:
        </span>
        <span style={{ color: "#12332B", flex: 1, textAlign: "left", display: "flex", alignItems: "center", gap: "6px" }}>
          {displayIcon && <span style={{ display: "flex", alignItems: "center" }}>{displayIcon}</span>}
          {displayValue}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            color: "#667085",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-50 min-w-full"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)",
            boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)"
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-[13px] transition-colors flex items-center gap-2"
              style={{
                backgroundColor: value === option.value ? "#E8F5F3" : "#FFFFFF",
                color: value === option.value ? "#0F766E" : "#12332B",
                borderBottom: "1px solid #F3F4F6"
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = value === option.value ? "#E8F5F3" : "#FFFFFF";
              }}
            >
              {option.icon && <span style={{ display: "flex", alignItems: "center" }}>{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}