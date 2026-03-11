/**
 * AttentionPanel — Promoted to Zone 2 of the Financial Dashboard
 *
 * Compact actionable alert strip showing items needing attention.
 * Collapsible: auto-expands if danger/warning items exist,
 * collapsed by default if all items are success/info.
 */

import { useState, useMemo } from "react";
import { AlertTriangle, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AttentionItem {
  severity: "danger" | "warning" | "success" | "info";
  icon: LucideIcon;
  label: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AttentionPanelProps {
  items: AttentionItem[];
}

const SEVERITY_COLORS: Record<string, { dot: string; bg: string; border: string }> = {
  danger:  { dot: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
  warning: { dot: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  success: { dot: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  info:    { dot: "#6B7A76", bg: "#F8FAFC", border: "#E2E8F0" },
};

const SEVERITY_PRIORITY: Record<string, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
};

export function AttentionPanel({ items }: AttentionPanelProps) {
  if (items.length === 0) return null;

  // Determine if there are actionable (danger/warning) items
  const hasActionable = useMemo(
    () => items.some((i) => i.severity === "danger" || i.severity === "warning"),
    [items]
  );

  const [isExpanded, setIsExpanded] = useState(hasActionable);

  // Count by severity for collapsed summary
  const dangerCount = items.filter((i) => i.severity === "danger").length;
  const warningCount = items.filter((i) => i.severity === "warning").length;
  const successCount = items.filter((i) => i.severity === "success").length;

  // Sort items: danger first, then warning, info, success
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (SEVERITY_PRIORITY[a.severity] ?? 9) - (SEVERITY_PRIORITY[b.severity] ?? 9)),
    [items]
  );

  // Build collapsed summary text
  const summaryParts: string[] = [];
  if (dangerCount > 0) summaryParts.push(`${dangerCount} critical`);
  if (warningCount > 0) summaryParts.push(`${warningCount} warning${warningCount > 1 ? "s" : ""}`);
  if (summaryParts.length === 0 && successCount > 0) summaryParts.push("All clear");
  const summaryText = summaryParts.length > 0
    ? summaryParts.join(", ") + " — click to expand"
    : `${items.length} item${items.length > 1 ? "s" : ""}`;

  // Header accent color based on worst severity
  const worstSeverity = sortedItems[0]?.severity || "info";
  const accentColor = SEVERITY_COLORS[worstSeverity]?.dot || "#6B7A76";
  const accentBg = SEVERITY_COLORS[worstSeverity]?.bg || "#F8FAFC";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ border: "1px solid #E5E9F0", background: "white" }}
    >
      {/* Header — always visible, clickable to toggle */}
      <button
        className="w-full px-5 py-3 flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-gray-50/50"
        style={{
          borderBottom: isExpanded ? "1px solid #E5E9F0" : "none",
          background: isExpanded ? "#F8F9FB" : "white",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Severity accent dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        />

        <AlertTriangle size={14} style={{ color: "#667085" }} />
        <span
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: "#667085" }}
        >
          Attention Required
        </span>

        {/* Collapsed summary badges */}
        {!isExpanded && (
          <div className="flex items-center gap-1.5 ml-2">
            {dangerCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}
              >
                {dangerCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}
              >
                {warningCount} warning{warningCount > 1 ? "s" : ""}
              </span>
            )}
            {dangerCount === 0 && warningCount === 0 && successCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}
              >
                All clear
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Expand/collapse icon */}
        {isExpanded ? (
          <ChevronUp size={14} style={{ color: "#9CA3AF" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
        )}
      </button>

      {/* Alert rows — visible when expanded */}
      {isExpanded && (
        <div>
          {sortedItems.map((item, idx) => {
            const Icon = item.icon;
            const colors = SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.info;

            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50/30"
                style={{
                  borderBottom: idx < sortedItems.length - 1 ? "1px solid #F3F4F6" : "none",
                  cursor: item.onAction ? "pointer" : "default",
                }}
                onClick={item.onAction}
                role={item.onAction ? "button" : undefined}
                tabIndex={item.onAction ? 0 : undefined}
                onKeyDown={item.onAction ? (e) => e.key === "Enter" && item.onAction?.() : undefined}
              >
                {/* Severity dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors.dot }}
                />

                {/* Icon */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.bg }}
                >
                  <Icon size={14} style={{ color: colors.dot }} />
                </div>

                {/* Label */}
                <span
                  className="text-[13px] font-medium flex-1"
                  style={{ color: "#12332B" }}
                >
                  {item.label}
                </span>

                {/* Detail (amount/count) */}
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: colors.dot }}
                >
                  {item.detail}
                </span>

                {/* Action arrow */}
                {item.onAction && (
                  <ChevronRight size={14} style={{ color: "#9CA3AF" }} className="flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
