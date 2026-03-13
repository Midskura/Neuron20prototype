// SalesReport — Report 1: Per-booking revenue breakdown.
// "How much money did we actually make from the things we did?"
//
// Grain: Per booking (one row per booking — the work unit).
// Source: Billing items grouped by booking_id.
//
// Smart Ledger Phase 1: Dense, information-rich financial document.
// "Quiet containers, loud data." — matches DataTable DNA.
// All data logic completely preserved.
//
// Smart Ledger Phase 2: Grouped inline subtotals + conditional row accents.
// All data logic completely preserved.

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  DollarSign,
  Download,
  ChevronDown,
  Check,
  LayoutGrid,
  Printer,
} from "lucide-react";
import type { ReportsData } from "../../../hooks/useReportsData";
import {
  type DateScope,
  isInScope,
  formatCurrencyFull,
  formatCurrencyCompact,
} from "../aggregate/types";

// ── Types ──

interface BookingRevenueRow {
  id: string;
  bookingId: string;
  serviceType: string;
  projectNumber: string;
  customerName: string;
  totalBilled: number;
  totalUnbilled: number;
  totalRevenue: number;
  chargeCount: number;
  billingDate: string;
}

type GroupByOption = "none" | "customer" | "service_type";

interface SalesReportProps {
  data: ReportsData;
  scope: DateScope;
  onScopeChange: (scope: DateScope) => void;
}

// ── Helpers ──

const formatDate = (dateStr: string) => {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatScopeLabel = (scope: DateScope): string => {
  const presetLabels: Record<string, string> = {
    "this-week": "This Week",
    "this-month": "This Month",
    "this-quarter": "This Quarter",
    ytd: "Year to Date",
    all: "All Time",
  };
  if (scope.preset !== "custom") return presetLabels[scope.preset] || scope.preset;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(scope.from)} \u2013 ${fmt(scope.to)}`;
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  forwarding: "Forwarding",
  brokerage: "Brokerage",
  trucking: "Trucking",
  marine_insurance: "Marine Insurance",
  others: "Others",
};

const normalizeServiceType = (st: string | undefined): string => {
  if (!st) return "Others";
  const lower = st.toLowerCase().replace(/[\s-]+/g, "_");
  return SERVICE_TYPE_LABELS[lower] || st;
};

// ── Component ──

export function SalesReport({ data, scope, onScopeChange }: SalesReportProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<GroupByOption>("none");
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setGroupDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Compute rows from billing items (UNCHANGED) ──
  const rows = useMemo(() => {
    const { billingItems } = data;
    const scopedItems = billingItems.filter((item) =>
      isInScope(item.created_at, scope)
    );
    const byBooking = new Map<string, any[]>();
    for (const item of scopedItems) {
      const bid = item.booking_id || "UNLINKED";
      if (!byBooking.has(bid)) byBooking.set(bid, []);
      byBooking.get(bid)!.push(item);
    }
    const result: BookingRevenueRow[] = [];
    byBooking.forEach((items, bookingId) => {
      let totalBilled = 0;
      let totalUnbilled = 0;
      let earliestDate = "";
      for (const item of items) {
        const amount = Number(item.amount) || 0;
        const status = (item.status || "").toLowerCase();
        if (status === "unbilled") {
          totalUnbilled += amount;
        } else {
          totalBilled += amount;
        }
        const d = item.created_at || "";
        if (d && (!earliestDate || d < earliestDate)) {
          earliestDate = d;
        }
      }
      result.push({
        id: bookingId,
        bookingId,
        serviceType: normalizeServiceType(items[0]?.service_type),
        projectNumber: items[0]?.project_number || "\u2014",
        customerName: items[0]?.customer_name || "\u2014",
        totalBilled,
        totalUnbilled,
        totalRevenue: totalBilled + totalUnbilled,
        chargeCount: items.length,
        billingDate: earliestDate,
      });
    });
    result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return result;
  }, [data.billingItems, scope]);

  // ── Search filter (UNCHANGED) ──
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.bookingId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.projectNumber.toLowerCase().includes(q) ||
        r.serviceType.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // ── Grouping (UNCHANGED) ──
  const groupedData = useMemo(() => {
    if (groupBy === "none") return null;
    const groups = new Map<string, BookingRevenueRow[]>();
    for (const row of filteredRows) {
      const key = groupBy === "customer" ? row.customerName : row.serviceType;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }
    return Array.from(groups.entries())
      .map(([label, items]) => ({
        label,
        items,
        subtotal: items.reduce((s, r) => s + r.totalRevenue, 0),
      }))
      .sort((a, b) => b.subtotal - a.subtotal);
  }, [filteredRows, groupBy]);

  // ── Summary KPIs (UNCHANGED) ──
  const kpis = useMemo(() => {
    const totalRevenue = filteredRows.reduce((s, r) => s + r.totalRevenue, 0);
    const totalBilled = filteredRows.reduce((s, r) => s + r.totalBilled, 0);
    const totalUnbilled = filteredRows.reduce((s, r) => s + r.totalUnbilled, 0);
    const avgPerBooking =
      filteredRows.length > 0 ? totalRevenue / filteredRows.length : 0;
    return { totalRevenue, totalBilled, totalUnbilled, avgPerBooking };
  }, [filteredRows]);

  // ── CSV export (UNCHANGED) ──
  const handleExport = () => {
    const headers = [
      "Booking ID", "Service Type", "Project #", "Customer",
      "Total Billed", "Total Unbilled", "Total Revenue", "# Charges", "Billing Date",
    ];
    const csvRows = filteredRows.map((r) => [
      r.bookingId, r.serviceType, r.projectNumber, r.customerName,
      r.totalBilled.toFixed(2), r.totalUnbilled.toFixed(2), r.totalRevenue.toFixed(2),
      String(r.chargeCount),
      r.billingDate ? new Date(r.billingDate).toISOString().split("T")[0] : "",
    ]);
    csvRows.push([
      "TOTALS", "", "", "",
      kpis.totalBilled.toFixed(2), kpis.totalUnbilled.toFixed(2), kpis.totalRevenue.toFixed(2),
      String(filteredRows.reduce((s, r) => s + r.chargeCount, 0)), "",
    ]);
    const csv = [
      headers.join(","),
      ...csvRows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const scopeLabel =
      scope.preset === "all"
        ? "all-time"
        : `${scope.from.toISOString().split("T")[0]}_${scope.to.toISOString().split("T")[0]}`;
    a.download = `sales-report-${scopeLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Group by options ──
  const GROUP_OPTIONS: { value: GroupByOption; label: string }[] = [
    { value: "none", label: "No Grouping" },
    { value: "customer", label: "By Customer" },
    { value: "service_type", label: "By Service Type" },
  ];
  const activeGroupLabel =
    GROUP_OPTIONS.find((o) => o.value === groupBy)?.label || "No Grouping";

  // ── Derived labels ──
  const periodLabel = formatScopeLabel(scope);
  const totalCharges = filteredRows.reduce((s, r) => s + r.chargeCount, 0);
  const billedPct = kpis.totalRevenue > 0 ? Math.round((kpis.totalBilled / kpis.totalRevenue) * 100) : 0;
  const unbilledPct = kpis.totalRevenue > 0 ? Math.round((kpis.totalUnbilled / kpis.totalRevenue) * 100) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Identity Strip + Controls ── */}
      <div
        className="px-10 pt-4 pb-3"
        style={{ borderBottom: "1px solid var(--neuron-ui-divider)" }}
      >
        <div className="flex items-center gap-3">
          {/* Report identity */}
          <div className="flex items-center gap-2.5">
            <span
              className="text-[11px] font-semibold uppercase"
              style={{
                color: "var(--neuron-ink-muted)",
                letterSpacing: "0.04em",
              }}
            >
              Sales Report
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--neuron-ui-border)" }}
            >
              \u2502
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--neuron-ink-muted)" }}
            >
              {periodLabel}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--neuron-ui-border)" }}
            >
              \u00B7
            </span>
            <span
              className="text-[11px]"
              style={{ color: "var(--neuron-ink-muted)" }}
            >
              {filteredRows.length} booking{filteredRows.length !== 1 ? "s" : ""}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--neuron-ui-border)" }}
            >
              \u00B7
            </span>
            <span
              className="text-[11px]"
              style={{ color: "var(--neuron-ink-muted)" }}
            >
              {totalCharges} charge{totalCharges !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative" style={{ width: 220 }}>
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "var(--neuron-ink-muted)" }}
            />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md focus:outline-none focus:ring-1 text-[11px]"
              style={{
                border: "1px solid var(--neuron-ui-border)",
                backgroundColor: "var(--neuron-bg-elevated)",
                color: "var(--neuron-ink-primary)",
                focusRingColor: "var(--neuron-brand-green)",
              }}
            />
          </div>

          {/* Group By */}
          <div className="relative" ref={groupRef}>
            <button
              onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors hover:bg-[var(--neuron-state-hover)]"
              style={{
                border: "1px solid var(--neuron-ui-border)",
                color: "var(--neuron-ink-secondary)",
              }}
            >
              <LayoutGrid size={12} style={{ color: "var(--neuron-ink-muted)" }} />
              {activeGroupLabel}
              <ChevronDown
                size={11}
                className={`transition-transform ${groupDropdownOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--neuron-ink-muted)" }}
              />
            </button>
            {groupDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 z-50 rounded-lg py-1 min-w-[160px]"
                style={{
                  border: "1px solid var(--neuron-ui-border)",
                  backgroundColor: "var(--neuron-bg-elevated)",
                  boxShadow: "var(--elevation-2)",
                }}
              >
                {GROUP_OPTIONS.map((opt) => {
                  const isActive = groupBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setGroupBy(opt.value);
                        setGroupDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors hover:bg-[var(--neuron-state-hover)]"
                      style={{
                        color: isActive ? "var(--neuron-brand-green)" : "var(--neuron-ink-primary)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {isActive ? (
                        <Check size={11} style={{ color: "var(--neuron-brand-green)" }} />
                      ) : (
                        <span className="w-[11px]" />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors hover:bg-[var(--neuron-state-hover)]"
            style={{
              border: "1px solid var(--neuron-ui-border)",
              color: "var(--neuron-ink-secondary)",
            }}
          >
            <Printer size={12} />
            Print
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            disabled={filteredRows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--neuron-brand-green)",
              color: "#FFFFFF",
            }}
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Ledger Table ── */}
      <div className="flex-1 overflow-auto px-10 pt-4 pb-8">
        {data.isLoading ? (
          <LedgerSkeleton />
        ) : filteredRows.length === 0 ? (
          <div
            className="rounded-[10px] overflow-hidden"
            style={{
              border: "1px solid var(--neuron-ui-border)",
              backgroundColor: "var(--neuron-bg-elevated)",
            }}
          >
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: "var(--neuron-state-hover)" }}
              >
                <DollarSign size={20} style={{ color: "var(--neuron-ink-muted)" }} />
              </div>
              <p className="text-[13px] font-medium" style={{ color: "var(--neuron-ink-primary)" }}>
                No booking revenue found
              </p>
              <p className="text-[12px] mt-1" style={{ color: "var(--neuron-ink-muted)" }}>
                {searchQuery
                  ? "Try adjusting your search or date range."
                  : "Create billing items against bookings to see revenue data here."}
              </p>
            </div>
          </div>
        ) : groupBy === "none" || !groupedData ? (
          <>
            <LedgerTable rows={filteredRows} kpis={kpis} totalCharges={totalCharges} />
            <SummaryStrip kpis={kpis} bookingCount={filteredRows.length} billedPct={billedPct} unbilledPct={unbilledPct} />
          </>
        ) : (
          <>
            <GroupedLedgerTable groups={groupedData} kpis={kpis} totalCharges={totalCharges} />
            <SummaryStrip kpis={kpis} bookingCount={filteredRows.length} billedPct={billedPct} unbilledPct={unbilledPct} />
          </>
        )}
      </div>
    </div>
  );
}

// ── Ledger Table ──
// Matches DataTable DNA: same header bg, borders, font sizes.
// Dense rows (py-2), sticky header, column group accents, vertical divider.

function LedgerTable({
  rows,
  kpis,
  totalCharges,
}: {
  rows: BookingRevenueRow[];
  kpis: { totalRevenue: number; totalBilled: number; totalUnbilled: number; avgPerBooking: number };
  totalCharges: number;
}) {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        border: "1px solid #E5E9F0",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          {/* ── Header ── */}
          <thead>
            <tr
              style={{
                backgroundColor: "#F7FAF8",
                borderBottom: "1px solid #E5E9F0",
              }}
            >
              {/* Identifier columns — green top accent */}
              <th
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid var(--neuron-brand-green)",
                  width: "130px",
                }}
              >
                Booking ID
              </th>
              <th
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid var(--neuron-brand-green)",
                  width: "110px",
                }}
              >
                Service Type
              </th>
              <th
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid var(--neuron-brand-green)",
                  width: "100px",
                }}
              >
                Project #
              </th>
              <th
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid var(--neuron-brand-green)",
                  width: "160px",
                  borderRight: "2px solid #E5E9F0",
                }}
              >
                Customer
              </th>

              {/* Financial columns — teal top accent */}
              <th
                className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid #0F766E",
                  width: "120px",
                }}
              >
                Total Billed
              </th>
              <th
                className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid #0F766E",
                  width: "120px",
                }}
              >
                Total Unbilled
              </th>
              <th
                className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid #0F766E",
                  width: "130px",
                }}
              >
                Total Revenue
              </th>
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid #0F766E",
                  width: "80px",
                }}
              >
                # Charges
              </th>
              <th
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase"
                style={{
                  color: "#667085",
                  letterSpacing: "0.002em",
                  borderTop: "2px solid #0F766E",
                  width: "100px",
                }}
              >
                Billing Date
              </th>
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-[#F1F6F4]"
                style={{
                  borderBottom: "1px solid #E5E9F0",
                  borderLeft: row.totalUnbilled > row.totalBilled
                    ? "2px solid #D97706"
                    : "2px solid transparent",
                }}
              >
                <td
                  className="px-4 py-2 text-[12px] font-medium"
                  style={{ color: "#101828" }}
                >
                  {row.bookingId}
                </td>
                <td
                  className="px-4 py-2 text-[11px] font-medium"
                  style={{ color: "#667085" }}
                >
                  {row.serviceType}
                </td>
                <td
                  className="px-4 py-2 text-[11px]"
                  style={{ color: "#667085" }}
                >
                  {row.projectNumber}
                </td>
                <td
                  className="px-4 py-2 text-[12px] font-medium truncate"
                  style={{
                    color: "#101828",
                    maxWidth: "160px",
                    borderRight: "2px solid #E5E9F0",
                  }}
                >
                  {row.customerName}
                </td>
                <td
                  className="px-4 py-2 text-right text-[12px] font-medium tabular-nums"
                  style={{ color: "#0F766E" }}
                >
                  {formatCurrencyFull(row.totalBilled)}
                </td>
                <td
                  className="px-4 py-2 text-right text-[12px] font-medium tabular-nums"
                  style={{ color: row.totalUnbilled > 0 ? "#D97706" : "#667085" }}
                >
                  {formatCurrencyFull(row.totalUnbilled)}
                </td>
                <td
                  className="px-4 py-2 text-right text-[12px] font-semibold tabular-nums"
                  style={{ color: "#101828" }}
                >
                  {formatCurrencyFull(row.totalRevenue)}
                </td>
                <td
                  className="px-4 py-2 text-center text-[11px] tabular-nums"
                  style={{ color: "#667085" }}
                >
                  {row.chargeCount}
                </td>
                <td
                  className="px-4 py-2 text-[11px]"
                  style={{ color: "#667085" }}
                >
                  {formatDate(row.billingDate)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* ── Totals Row ── */}
          <tfoot>
            <tr
              style={{
                backgroundColor: "#F7FAF8",
                borderTop: "2px solid var(--neuron-brand-green)",
              }}
            >
              <td
                className="px-4 py-2.5 text-[11px] font-bold"
                colSpan={4}
                style={{
                  color: "var(--neuron-ink-secondary)",
                  borderRight: "2px solid #E5E9F0",
                }}
              >
                Totals
              </td>
              <td
                className="px-4 py-2.5 text-right text-[12px] font-bold tabular-nums"
                style={{ color: "#0F766E" }}
              >
                {formatCurrencyFull(kpis.totalBilled)}
              </td>
              <td
                className="px-4 py-2.5 text-right text-[12px] font-bold tabular-nums"
                style={{ color: kpis.totalUnbilled > 0 ? "#D97706" : "#667085" }}
              >
                {formatCurrencyFull(kpis.totalUnbilled)}
              </td>
              <td
                className="px-4 py-2.5 text-right text-[12px] font-bold tabular-nums"
                style={{ color: "#101828" }}
              >
                {formatCurrencyFull(kpis.totalRevenue)}
              </td>
              <td
                className="px-4 py-2.5 text-center text-[11px] font-bold tabular-nums"
                style={{ color: "#667085" }}
              >
                {totalCharges}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Grouped Ledger Table ──

function GroupedLedgerTable({
  groups,
  kpis,
  totalCharges,
}: {
  groups: { label: string; items: BookingRevenueRow[]; subtotal: number }[];
  kpis: { totalRevenue: number; totalBilled: number; totalUnbilled: number; avgPerBooking: number };
  totalCharges: number;
}) {
  const COL_COUNT = 9;

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        border: "1px solid #E5E9F0",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          {/* ── Header (same as LedgerTable) ── */}
          <thead>
            <tr
              style={{
                backgroundColor: "#F7FAF8",
                borderBottom: "1px solid #E5E9F0",
              }}
            >
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid var(--neuron-brand-green)", width: "130px" }}>Booking ID</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid var(--neuron-brand-green)", width: "110px" }}>Service Type</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid var(--neuron-brand-green)", width: "100px" }}>Project #</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid var(--neuron-brand-green)", width: "160px", borderRight: "2px solid #E5E9F0" }}>Customer</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid #0F766E", width: "120px" }}>Total Billed</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid #0F766E", width: "120px" }}>Total Unbilled</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid #0F766E", width: "130px" }}>Total Revenue</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid #0F766E", width: "80px" }}># Charges</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase" style={{ color: "#667085", letterSpacing: "0.002em", borderTop: "2px solid #0F766E", width: "100px" }}>Billing Date</th>
            </tr>
          </thead>

          {/* ── Grouped Body ── */}
          <tbody>
            {groups.map((group, groupIdx) => {
              const groupBilled = group.items.reduce((s, r) => s + r.totalBilled, 0);
              const groupUnbilled = group.items.reduce((s, r) => s + r.totalUnbilled, 0);
              const groupCharges = group.items.reduce((s, r) => s + r.chargeCount, 0);

              return (
                <React.Fragment key={group.label}>
                  {/* Group header row */}
                  <tr
                    style={{
                      backgroundColor: "var(--neuron-state-selected)",
                      borderBottom: "1px solid #E5E9F0",
                      borderTop: groupIdx > 0 ? "2px solid #E5E9F0" : undefined,
                    }}
                  >
                    <td colSpan={4} className="px-4 py-2" style={{ borderRight: "2px solid #E5E9F0" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold" style={{ color: "var(--neuron-ink-primary)" }}>
                          {group.label}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "var(--neuron-ui-divider)", color: "var(--neuron-ink-muted)" }}
                        >
                          {group.items.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-[11px] font-semibold tabular-nums" style={{ color: "#0F766E" }}>
                      {formatCurrencyFull(groupBilled)}
                    </td>
                    <td className="px-4 py-2 text-right text-[11px] font-semibold tabular-nums" style={{ color: groupUnbilled > 0 ? "#D97706" : "#667085" }}>
                      {formatCurrencyFull(groupUnbilled)}
                    </td>
                    <td className="px-4 py-2 text-right text-[12px] font-bold tabular-nums" style={{ color: "var(--neuron-brand-green)" }}>
                      {formatCurrencyFull(group.subtotal)}
                    </td>
                    <td className="px-4 py-2 text-center text-[11px] font-semibold tabular-nums" style={{ color: "#667085" }}>
                      {groupCharges}
                    </td>
                    <td className="px-4 py-2" />
                  </tr>

                  {/* Data rows */}
                  {group.items.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-[#F1F6F4]"
                      style={{
                        borderBottom: "1px solid #E5E9F0",
                        borderLeft: row.totalUnbilled > row.totalBilled
                          ? "2px solid #D97706"
                          : "2px solid transparent",
                      }}
                    >
                      <td className="px-4 py-2 text-[12px] font-medium" style={{ color: "#101828" }}>{row.bookingId}</td>
                      <td className="px-4 py-2 text-[11px] font-medium" style={{ color: "#667085" }}>{row.serviceType}</td>
                      <td className="px-4 py-2 text-[11px]" style={{ color: "#667085" }}>{row.projectNumber}</td>
                      <td className="px-4 py-2 text-[12px] font-medium truncate" style={{ color: "#101828", maxWidth: "160px", borderRight: "2px solid #E5E9F0" }}>{row.customerName}</td>
                      <td className="px-4 py-2 text-right text-[12px] font-medium tabular-nums" style={{ color: "#0F766E" }}>{formatCurrencyFull(row.totalBilled)}</td>
                      <td className="px-4 py-2 text-right text-[12px] font-medium tabular-nums" style={{ color: row.totalUnbilled > 0 ? "#D97706" : "#667085" }}>{formatCurrencyFull(row.totalUnbilled)}</td>
                      <td className="px-4 py-2 text-right text-[12px] font-semibold tabular-nums" style={{ color: "#101828" }}>{formatCurrencyFull(row.totalRevenue)}</td>
                      <td className="px-4 py-2 text-center text-[11px] tabular-nums" style={{ color: "#667085" }}>{row.chargeCount}</td>
                      <td className="px-4 py-2 text-[11px]" style={{ color: "#667085" }}>{formatDate(row.billingDate)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* ── Grand Totals Row ── */}
          <tfoot>
            <tr
              style={{
                backgroundColor: "#F7FAF8",
                borderTop: "2px solid var(--neuron-brand-green)",
              }}
            >
              <td className="px-4 py-2.5 text-[11px] font-bold" colSpan={4} style={{ color: "var(--neuron-ink-secondary)", borderRight: "2px solid #E5E9F0" }}>
                Grand Totals
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-bold tabular-nums" style={{ color: "#0F766E" }}>{formatCurrencyFull(kpis.totalBilled)}</td>
              <td className="px-4 py-2.5 text-right text-[12px] font-bold tabular-nums" style={{ color: kpis.totalUnbilled > 0 ? "#D97706" : "#667085" }}>{formatCurrencyFull(kpis.totalUnbilled)}</td>
              <td className="px-4 py-2.5 text-right text-[12px] font-bold tabular-nums" style={{ color: "#101828" }}>{formatCurrencyFull(kpis.totalRevenue)}</td>
              <td className="px-4 py-2.5 text-center text-[11px] font-bold tabular-nums" style={{ color: "#667085" }}>{totalCharges}</td>
              <td className="px-4 py-2.5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Inline Summary Strip ──

function SummaryStrip({
  kpis,
  bookingCount,
  billedPct,
  unbilledPct,
}: {
  kpis: { totalRevenue: number; totalBilled: number; totalUnbilled: number; avgPerBooking: number };
  bookingCount: number;
  billedPct: number;
  unbilledPct: number;
}) {
  return (
    <div
      className="flex items-center justify-end gap-6 px-4 py-2.5 mt-3 rounded-md"
      style={{
        backgroundColor: "var(--neuron-bg-page)",
        border: "1px solid var(--neuron-ui-divider)",
      }}
    >
      <SummaryItem label="Total Revenue" value={formatCurrencyFull(kpis.totalRevenue)} color="var(--neuron-ink-primary)" />
      <span style={{ color: "var(--neuron-ui-border)" }}>\u00B7</span>
      <SummaryItem label="Billed" value={`${formatCurrencyFull(kpis.totalBilled)} (${billedPct}%)`} color="#0F766E" />
      <span style={{ color: "var(--neuron-ui-border)" }}>\u00B7</span>
      <SummaryItem label="Unbilled" value={`${formatCurrencyFull(kpis.totalUnbilled)} (${unbilledPct}%)`} color={kpis.totalUnbilled > 0 ? "#D97706" : "#667085"} />
      <span style={{ color: "var(--neuron-ui-border)" }}>\u00B7</span>
      <SummaryItem label="Avg/Booking" value={formatCurrencyFull(kpis.avgPerBooking)} color="var(--neuron-ink-secondary)" />
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-[10px] font-semibold uppercase"
        style={{ color: "var(--neuron-ink-muted)", letterSpacing: "0.03em" }}
      >
        {label}
      </span>
      <span
        className="text-[11px] font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Loading Skeleton ──

function LedgerSkeleton() {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{ border: "1px solid #E5E9F0", backgroundColor: "#FFFFFF" }}
    >
      {/* Header skeleton */}
      <div
        className="h-[38px]"
        style={{
          backgroundColor: "#F7FAF8",
          borderBottom: "1px solid #E5E9F0",
          borderTop: "2px solid var(--neuron-brand-green)",
        }}
      />
      {/* Row skeletons */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="h-[34px] animate-pulse"
          style={{
            backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFCFB",
            borderBottom: "1px solid #E5E9F0",
          }}
        />
      ))}
      {/* Totals skeleton */}
      <div
        className="h-[38px] animate-pulse"
        style={{
          backgroundColor: "#F7FAF8",
          borderTop: "2px solid var(--neuron-brand-green)",
        }}
      />
    </div>
  );
}