/**
 * ReceivablesAgingBar — Zone 4 of the Financial Dashboard
 *
 * Horizontal row-based aging chart: each bucket gets its own row with a
 * proportional bar, amount, count, and percentage. Replaces the old stacked
 * bar + 5 legend cards, which were unreadable when one bucket dominated.
 *
 * Features:
 *  - "As of today" date chip (scope-independence clarity)
 *  - Prominent total outstanding callout
 *  - DSO severity coloring (teal/amber/red)
 *  - Click any row → inline drill-down expands below it (accordion)
 *  - Trend arrows from previous-period comparison
 */

import { useState, useMemo } from "react";
import { ChevronRight, Calendar } from "lucide-react";
import { formatCurrencyCompact } from "../aggregate/types";

interface AgingSegment {
  label: string;
  days: string;
  amount: number;
  count: number;
  color: string;
  bgLight: string;
  invoices: any[];
}

interface ReceivablesAgingBarProps {
  invoices: any[];
  dso: number;
  onBucketClick: (bucketLabel: string | null) => void;
  /** Optional "View →" navigation */
  onNavigate?: () => void;
  /** Previous-period invoices for trend indicators */
  previousInvoices?: any[];
}

const AGING_CONFIG: { label: string; days: string; min: number; max: number; color: string; bgLight: string }[] = [
  { label: "Current",  days: "Not yet due",   min: -Infinity, max: 0,   color: "#0F766E", bgLight: "#F0FDFA" },
  { label: "1–30d",    days: "1–30 days",      min: 1,         max: 30,  color: "#D97706", bgLight: "#FFFBEB" },
  { label: "31–60d",   days: "31–60 days",     min: 31,        max: 60,  color: "#EA580C", bgLight: "#FFF7ED" },
  { label: "61–90d",   days: "61–90 days",     min: 61,        max: 90,  color: "#DC2626", bgLight: "#FEF2F2" },
  { label: "90d+",     days: "Over 90 days",   min: 91,        max: Infinity, color: "#991B1B", bgLight: "#FEF2F2" },
];

function getAgingDaysForInvoice(inv: any): number {
  const dueDate = inv.due_date ? new Date(inv.due_date) : null;
  if (!dueDate) return 0;
  return Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getBalance(inv: any): number {
  return Number(inv.remaining_balance ?? inv.total_amount ?? inv.amount ?? 0);
}

/** DSO severity: teal ≤30, amber 31–60, red 61+ */
function getDsoStyle(dso: number): { bg: string; color: string } {
  if (dso <= 30) return { bg: "#F0FDFA", color: "#0F766E" };
  if (dso <= 60) return { bg: "#FFFBEB", color: "#D97706" };
  return { bg: "#FEF2F2", color: "#DC2626" };
}

/** Format date as "Mar 8, 2026" */
function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Format PHP currency for drill-down rows */
const fmtPHP = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount);

// ── Inline Drill-Down Panel ──

function InvoiceDrillDown({
  segment,
  onViewAll,
}: {
  segment: AgingSegment;
  onViewAll: () => void;
}) {
  const MAX_ROWS = 5;
  const sorted = useMemo(
    () => [...segment.invoices].sort((a, b) => getBalance(b) - getBalance(a)),
    [segment.invoices]
  );
  const displayed = sorted.slice(0, MAX_ROWS);
  const remaining = sorted.length - MAX_ROWS;

  return (
    <div
      className="rounded-lg overflow-hidden ml-[88px]"
      style={{ border: `1px solid ${segment.color}25`, background: segment.bgLight }}
    >
      {/* Invoice rows */}
      <div className="divide-y" style={{ borderColor: `${segment.color}15` }}>
        {displayed.map((inv, idx) => {
          const balance = getBalance(inv);
          const agingDays = getAgingDaysForInvoice(inv);
          const invNumber = inv.invoice_number || inv.id || `INV-${idx + 1}`;
          const customer = (inv.customer_name || inv.customerName || "").trim() || "Unknown Customer";
          const dueDate = inv.due_date ? new Date(inv.due_date) : null;

          return (
            <div
              key={inv.id || idx}
              className="px-4 py-2 flex items-center justify-between hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span
                  className="text-[11px] font-semibold tabular-nums flex-shrink-0"
                  style={{ color: "#12332B", minWidth: "90px" }}
                >
                  {invNumber}
                </span>
                <span
                  className="text-[11px] font-medium truncate"
                  style={{ color: "#667085", maxWidth: "200px" }}
                >
                  {customer}
                </span>
                {dueDate && (
                  <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: "#9CA3AF" }}>
                    Due: {formatShortDate(dueDate)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {agingDays > 0 && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded tabular-nums"
                    style={{ backgroundColor: `${segment.color}15`, color: segment.color }}
                  >
                    {agingDays}d overdue
                  </span>
                )}
                <span
                  className="text-[12px] font-bold tabular-nums"
                  style={{ color: "#12332B" }}
                >
                  {fmtPHP(balance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* "More" footer */}
      {remaining > 0 && (
        <div className="px-4 py-1.5 text-center" style={{ borderTop: `1px solid ${segment.color}15` }}>
          <button
            className="text-[10px] font-medium cursor-pointer hover:underline"
            style={{ color: segment.color }}
            onClick={onViewAll}
          >
            +{remaining} more — View all in Invoices →
          </button>
        </div>
      )}

      {/* Always show "View all" if only a few */}
      {remaining <= 0 && segment.count > 0 && (
        <div className="px-4 py-1.5 text-right" style={{ borderTop: `1px solid ${segment.color}15` }}>
          <button
            className="text-[10px] font-medium cursor-pointer hover:underline"
            style={{ color: segment.color }}
            onClick={onViewAll}
          >
            View all in Invoices →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export function ReceivablesAgingBar({ invoices, dso, onBucketClick, onNavigate, previousInvoices }: ReceivablesAgingBarProps) {
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null);

  // Filter to unpaid invoices only
  const openInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        const s = (inv.status || "").toLowerCase();
        const ps = (inv.payment_status || "").toLowerCase();
        return s !== "paid" && ps !== "paid" && getBalance(inv) > 0.01;
      }),
    [invoices]
  );

  // Build segments WITH matched invoices for drill-down
  const segments: AgingSegment[] = useMemo(() => {
    return AGING_CONFIG.map((cfg) => {
      const matched = openInvoices.filter((inv) => {
        const days = getAgingDaysForInvoice(inv);
        return days >= cfg.min && days <= cfg.max;
      });
      return {
        label: cfg.label,
        days: cfg.days,
        amount: matched.reduce((s, inv) => s + getBalance(inv), 0),
        count: matched.length,
        color: cfg.color,
        bgLight: cfg.bgLight,
        invoices: matched,
      };
    });
  }, [openInvoices]);

  const totalAmount = segments.reduce((s, seg) => s + seg.amount, 0);
  const totalCount = segments.reduce((s, seg) => s + seg.count, 0);
  const maxBucketAmount = Math.max(...segments.map((s) => s.amount), 1);

  // Previous-period aging for trend indicators
  const prevSegmentAmounts: Record<string, number> = useMemo(() => {
    if (!previousInvoices || previousInvoices.length === 0) return {};
    const prevOpen = previousInvoices.filter((inv: any) => {
      const s = (inv.status || "").toLowerCase();
      const ps = (inv.payment_status || "").toLowerCase();
      return s !== "paid" && ps !== "paid" && getBalance(inv) > 0.01;
    });
    const result: Record<string, number> = {};
    for (const cfg of AGING_CONFIG) {
      const matched = prevOpen.filter((inv: any) => {
        const days = getAgingDaysForInvoice(inv);
        return days >= cfg.min && days <= cfg.max;
      });
      result[cfg.label] = matched.reduce((s: number, inv: any) => s + getBalance(inv), 0);
    }
    return result;
  }, [previousInvoices]);

  // DSO styling
  const dsoStyle = getDsoStyle(dso);

  // Toggle bucket expansion (accordion)
  const handleRowClick = (label: string, count: number) => {
    if (count === 0) return;
    setExpandedBucket((prev) => (prev === label ? null : label));
  };

  // Today's date for "As of" chip
  const todayStr = formatShortDate(new Date());

  // ── Empty state ──
  if (totalAmount === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ border: "1px solid #E5E9F0", background: "white" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3
              className="text-[13px] font-semibold uppercase tracking-wider"
              style={{ color: "#667085" }}
            >
              Receivables Aging
            </h3>
            <span
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md"
              style={{ background: "#F3F4F6", color: "#9CA3AF" }}
            >
              <Calendar size={10} />
              As of {todayStr}
            </span>
          </div>
        </div>
        <p className="text-[13px]" style={{ color: "#9CA3AF" }}>
          No outstanding receivables
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ border: "1px solid #E5E9F0", background: "white" }}
    >
      {/* ── Header Row ── */}
      <div className="flex items-center justify-between mb-5">
        {/* Left: title + "As of" chip */}
        <div className="flex items-center gap-3">
          <h3
            className="text-[13px] font-semibold uppercase tracking-wider"
            style={{ color: "#667085" }}
          >
            Receivables Aging
          </h3>
          <span
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md"
            style={{ background: "#F3F4F6", color: "#9CA3AF" }}
          >
            <Calendar size={10} />
            As of {todayStr}
          </span>
        </div>

        {/* Right: total outstanding + DSO + View */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium" style={{ color: "#9CA3AF" }}>
              Total:
            </span>
            <span className="text-[18px] font-bold tabular-nums" style={{ color: "#12332B" }}>
              {formatCurrencyCompact(totalAmount)}
            </span>
            <span className="text-[11px] font-medium ml-0.5 tabular-nums" style={{ color: "#9CA3AF" }}>
              ({totalCount})
            </span>
          </div>
          <span
            className="text-[12px] font-semibold px-2 py-0.5 rounded-md tabular-nums"
            style={{ background: dsoStyle.bg, color: dsoStyle.color }}
          >
            DSO: {dso}d
          </span>
          {onNavigate && (
            <button
              className="text-[12px] font-medium cursor-pointer hover:underline"
              style={{ color: "#0F766E" }}
              onClick={onNavigate}
            >
              View →
            </button>
          )}
        </div>
      </div>

      {/* ── Horizontal Row Chart ── */}
      <div className="flex flex-col gap-1">
        {segments.map((seg) => {
          const barPct = maxBucketAmount > 0 ? (seg.amount / maxBucketAmount) * 100 : 0;
          const sharePct = totalAmount > 0 ? (seg.amount / totalAmount) * 100 : 0;
          const isEmpty = seg.count === 0;
          const isExpanded = expandedBucket === seg.label;

          // Trend calculation
          const prevAmt = prevSegmentAmounts[seg.label];
          const hasPrevData = prevAmt !== undefined && prevAmt > 0;
          const isCurrentBucket = seg.label === "Current";
          let trendArrow: string | null = null;
          let trendColor: string | null = null;

          if (hasPrevData && seg.amount > 0) {
            const pctChange = ((seg.amount - prevAmt) / prevAmt) * 100;
            if (Math.abs(pctChange) >= 5) {
              const isUp = pctChange > 0;
              trendArrow = isUp ? "↑" : "↓";
              const isGood = isCurrentBucket ? isUp : !isUp;
              trendColor = isGood ? "#16A34A" : "#EF4444";
            }
          }

          return (
            <div key={seg.label}>
              {/* Row */}
              <button
                className="w-full flex items-center gap-3 py-2 px-2 rounded-lg transition-colors group"
                style={{
                  cursor: isEmpty ? "default" : "pointer",
                  background: isExpanded ? seg.bgLight : "transparent",
                }}
                onClick={() => handleRowClick(seg.label, seg.count)}
                disabled={isEmpty}
              >
                {/* Bucket label — fixed width for alignment */}
                <div className="flex items-center gap-2 flex-shrink-0" style={{ width: "76px" }}>
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: isEmpty ? "#E5E9F0" : seg.color }}
                  />
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: isEmpty ? "#D1D5DB" : seg.color }}
                  >
                    {seg.label}
                  </span>
                </div>

                {/* Bar area */}
                <div className="flex-1 h-6 rounded-md overflow-hidden relative" style={{ background: "#F3F4F6" }}>
                  {isEmpty ? (
                    // Empty bucket: thin dashed placeholder
                    <div
                      className="absolute inset-y-0 left-0 w-full flex items-center px-3"
                    >
                      <span className="text-[10px] italic" style={{ color: "#D1D5DB" }}>
                        —
                      </span>
                    </div>
                  ) : (
                    <div
                      className="h-full rounded-md transition-all duration-300 flex items-center px-2.5 min-w-[32px]"
                      style={{
                        width: `${Math.max(barPct, 3)}%`,
                        backgroundColor: seg.color,
                        opacity: isExpanded ? 1 : 0.85,
                      }}
                    >
                      {barPct > 15 && (
                        <span className="text-white text-[11px] font-semibold truncate">
                          {formatCurrencyCompact(seg.amount)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount — fixed width for alignment */}
                <div className="flex-shrink-0 text-right" style={{ width: "72px" }}>
                  <span
                    className="text-[13px] font-bold tabular-nums"
                    style={{ color: isEmpty ? "#D1D5DB" : "#12332B" }}
                  >
                    {isEmpty ? "—" : formatCurrencyCompact(seg.amount)}
                  </span>
                </div>

                {/* Count */}
                <div className="flex-shrink-0 text-right" style={{ width: "44px" }}>
                  <span
                    className="text-[11px] tabular-nums"
                    style={{ color: isEmpty ? "#D1D5DB" : "#9CA3AF" }}
                  >
                    {isEmpty ? "—" : `${seg.count} inv`}
                  </span>
                </div>

                {/* Share % */}
                <div className="flex-shrink-0 text-right" style={{ width: "40px" }}>
                  <span
                    className="text-[11px] font-medium tabular-nums"
                    style={{ color: isEmpty ? "#D1D5DB" : "#667085" }}
                  >
                    {isEmpty ? "" : `${sharePct.toFixed(sharePct < 1 && sharePct > 0 ? 1 : 0)}%`}
                  </span>
                </div>

                {/* Trend arrow */}
                <div className="flex-shrink-0" style={{ width: "16px" }}>
                  {trendArrow && trendColor ? (
                    <span className="text-[11px] font-bold" style={{ color: trendColor }}>
                      {trendArrow}
                    </span>
                  ) : null}
                </div>

                {/* Expand chevron */}
                <div className="flex-shrink-0" style={{ width: "16px" }}>
                  {!isEmpty && (
                    <ChevronRight
                      size={13}
                      className="transition-transform duration-200"
                      style={{
                        color: isExpanded ? seg.color : "#D1D5DB",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                  )}
                </div>
              </button>

              {/* Drill-down panel — appears directly below the clicked row */}
              {isExpanded && seg.count > 0 && (
                <div className="py-1">
                  <InvoiceDrillDown
                    segment={seg}
                    onViewAll={() => onBucketClick(seg.label)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
