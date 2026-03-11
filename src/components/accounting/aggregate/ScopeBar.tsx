/**
 * ScopeBar — Compact date scope dropdown for aggregate financial views.
 *
 * Renders as a single button showing the current preset label + date range.
 * Clicking opens a popover with preset list + custom date range inputs.
 *
 * Supports two modes:
 *   - `embedded` (default): borderless, transparent — designed to sit inside the unified toolbar
 *   - `standalone`: has its own border — used on Dashboard tab
 */

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import type { DateScope, ScopePreset } from "./types";
import { createDateScope } from "./types";

interface ScopeBarProps {
  scope: DateScope;
  onScopeChange: (scope: DateScope) => void;
  /** When true, renders with its own border (for standalone use outside toolbar) */
  standalone?: boolean;
}

const PRESETS: { value: ScopePreset; label: string; shortLabel: string }[] = [
  { value: "this-week", label: "This Week", shortLabel: "This Week" },
  { value: "this-month", label: "This Month", shortLabel: "This Month" },
  { value: "this-quarter", label: "This Quarter", shortLabel: "This Quarter" },
  { value: "ytd", label: "Year to Date", shortLabel: "YTD" },
  { value: "all", label: "All Time", shortLabel: "All Time" },
];

const formatScopeRange = (scope: DateScope): string => {
  if (scope.preset === "all") return "All records";
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(scope.from)} – ${fmt(scope.to)}`;
};

const getPresetLabel = (preset: ScopePreset): string => {
  if (preset === "custom") return "Custom";
  return PRESETS.find((p) => p.value === preset)?.shortLabel || preset;
};

const toInputValue = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function ScopeBar({ scope, onScopeChange, standalone }: ScopeBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handlePresetClick = (preset: ScopePreset) => {
    onScopeChange(createDateScope(preset));
    if (preset !== "custom") setOpen(false);
  };

  const handleCustomDateChange = (field: "from" | "to", value: string) => {
    const date = new Date(value + "T00:00:00");
    if (isNaN(date.getTime())) return;
    onScopeChange({
      preset: "custom",
      from: field === "from" ? date : scope.from,
      to: field === "to" ? date : scope.to,
    });
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-50"
        style={{
          border: standalone ? "1px solid #E5E7EB" : "none",
          color: "#12332B",
          backgroundColor: open ? "#F0FDFA" : standalone ? "#FFFFFF" : "transparent",
        }}
      >
        <Calendar size={14} style={{ color: open ? "#0F766E" : "#667085" }} />
        <span>{getPresetLabel(scope.preset)}</span>
        <span
          className="text-[12px] font-normal"
          style={{ color: "#667085" }}
        >
          · {formatScopeRange(scope)}
        </span>
        <ChevronDown
          size={12}
          style={{ color: "#667085" }}
          className={`ml-0.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown popover */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 rounded-lg shadow-lg py-1 min-w-[220px]"
          style={{
            border: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
          }}
        >
          {PRESETS.map((p) => {
            const isActive = scope.preset === p.value;
            return (
              <button
                key={p.value}
                onClick={() => handlePresetClick(p.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors hover:bg-gray-50"
                style={{
                  color: isActive ? "#0F766E" : "var(--neuron-ink-primary)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {isActive ? (
                  <Check size={12} style={{ color: "#0F766E" }} />
                ) : (
                  <span className="w-3" />
                )}
                {p.label}
              </button>
            );
          })}

          <div
            className="my-1 mx-3"
            style={{ borderTop: "1px solid var(--neuron-ui-border)" }}
          />

          <button
            onClick={() => handlePresetClick("custom")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors hover:bg-gray-50"
            style={{
              color: scope.preset === "custom" ? "#0F766E" : "var(--neuron-ink-primary)",
              fontWeight: scope.preset === "custom" ? 600 : 400,
            }}
          >
            {scope.preset === "custom" ? (
              <Check size={12} style={{ color: "#0F766E" }} />
            ) : (
              <span className="w-3" />
            )}
            Custom Range
          </button>

          {scope.preset === "custom" && (
            <div className="px-3 pb-2.5 pt-1 flex items-center gap-2">
              <input
                type="date"
                value={toInputValue(scope.from)}
                onChange={(e) => handleCustomDateChange("from", e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-md text-[11px]"
                style={{
                  border: "1px solid var(--neuron-ui-border)",
                  color: "var(--neuron-ink-primary)",
                }}
              />
              <span className="text-[10px]" style={{ color: "var(--neuron-ink-muted)" }}>to</span>
              <input
                type="date"
                value={toInputValue(scope.to)}
                onChange={(e) => handleCustomDateChange("to", e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-md text-[11px]"
                style={{
                  border: "1px solid var(--neuron-ui-border)",
                  color: "var(--neuron-ink-primary)",
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}