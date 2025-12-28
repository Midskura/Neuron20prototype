import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface SimpleDropdownProps {
  value: string;
  options: DropdownOption[] | string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SimpleDropdown({ value, options, onChange, placeholder }: SimpleDropdownProps) {
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

  // Normalize options to always be DropdownOption[]
  const normalizedOptions: DropdownOption[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || "Select...";

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 rounded-lg text-[14px] transition-all flex items-center justify-between"
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
        <span style={{ color: "#12332B" }}>
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
          className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-50 w-full"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)",
            boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)"
          }}
        >
          {normalizedOptions.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-[14px] transition-colors"
              style={{
                backgroundColor: value === option.value ? "#E8F5F3" : "#FFFFFF",
                color: value === option.value ? "#0F766E" : "#12332B",
                borderBottom: index < normalizedOptions.length - 1 ? "1px solid #F3F4F6" : "none"
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
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}