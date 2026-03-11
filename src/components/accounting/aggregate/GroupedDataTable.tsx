/**
 * GroupedDataTable — Collapsible grouped table for aggregate financial views.
 * 
 * Renders groups with expandable headers (label, count badge, subtotal),
 * and paginated detail rows within each group.
 */

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { GroupedItems } from "./types";
import { formatCurrencyFull } from "./types";

// ── Column Definition (mirrors DataTable's ColumnDef but simplified) ──

export interface AggColumnDef<T> {
  header: string;
  accessorKey?: string;
  width?: string;
  align?: "left" | "right" | "center";
  cell?: (item: T) => React.ReactNode;
}

// ── Props ──

interface GroupedDataTableProps<T> {
  /** Grouped data */
  groups: GroupedItems<T>[];
  /** Column definitions for detail rows */
  columns: AggColumnDef<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Rows per page within each group */
  pageSize?: number;
  /** Empty message when no groups */
  emptyMessage?: string;
  /** Callback when a detail row is clicked */
  onRowClick?: (item: T) => void;
}

const ROWS_PER_PAGE = 25;

export function GroupedDataTable<T extends { id?: string | number }>({
  groups,
  columns,
  isLoading,
  pageSize = ROWS_PER_PAGE,
  emptyMessage = "No records found for the current scope and filters.",
  onRowClick,
}: GroupedDataTableProps<T>) {
  // Track collapsed state per group (default: first 5 expanded, rest collapsed)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    const collapsed = new Set<string>();
    groups.forEach((g, i) => {
      if (i >= 5) collapsed.add(g.key);
    });
    return collapsed;
  });

  // Track current page per group
  const [groupPages, setGroupPages] = useState<Record<string, number>>({});

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const allCollapsed = groups.every((g) => collapsedGroups.has(g.key));
    if (allCollapsed) {
      setCollapsedGroups(new Set());
    } else {
      setCollapsedGroups(new Set(groups.map((g) => g.key)));
    }
  };

  const getPage = (key: string) => groupPages[key] || 0;

  const setPage = (key: string, page: number) => {
    setGroupPages((prev) => ({ ...prev, [key]: page }));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--neuron-ui-border)" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "var(--neuron-state-hover)" }}>
              <div className="h-3 w-3 bg-gray-200 rounded" />
              <div className="h-3.5 w-40 bg-gray-200 rounded" />
              <div className="ml-auto h-3 w-24 bg-gray-200 rounded" />
            </div>
            {i === 0 && [0, 1, 2].map((j) => (
              <div key={j} className="px-4 py-2.5 flex items-center gap-4 border-t" style={{ borderColor: "var(--neuron-ui-divider)" }}>
                {columns.map((_, k) => (
                  <div key={k} className="h-3 bg-gray-100 rounded" style={{ width: `${60 + Math.random() * 60}px` }} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <div
        className="rounded-lg py-16 flex flex-col items-center justify-center gap-2"
        style={{ border: "1px solid var(--neuron-ui-border)", backgroundColor: "var(--neuron-bg-elevated)" }}
      >
        <ChevronsUpDown size={28} style={{ color: "var(--neuron-ink-muted)", opacity: 0.4 }} />
        <p className="text-[13px]" style={{ color: "var(--neuron-ink-muted)" }}>{emptyMessage}</p>
      </div>
    );
  }

  const allCollapsed = groups.every((g) => collapsedGroups.has(g.key));

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--neuron-ui-border)" }}>
      {/* Table header with expand/collapse all */}
      <div
        className="flex items-center px-4 py-2"
        style={{ backgroundColor: "var(--neuron-bg-page)", borderBottom: "1px solid var(--neuron-ui-border)" }}
      >
        <button
          onClick={toggleAll}
          className="flex items-center justify-center shrink-0 rounded hover:bg-black/5 transition-colors"
          style={{ color: "var(--neuron-ink-muted)", width: "20px", height: "20px" }}
          title={allCollapsed ? "Expand all" : "Collapse all"}
        >
          {allCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Column headers (aligned with detail rows) */}
        <div className="flex items-center flex-1 ml-1.5 min-w-0">
          {columns.map((col, i) => (
            <div
              key={i}
              className="text-[10px] font-semibold uppercase tracking-wider px-2 truncate min-w-0"
              style={{
                color: "var(--neuron-ink-muted)",
                width: col.width || "auto",
                flex: col.width ? "none" : 1,
                textAlign: col.align || "left",
              }}
            >
              {col.header}
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.key);
        const page = getPage(group.key);
        const totalPages = Math.ceil(group.items.length / pageSize);
        const pagedItems = group.items.slice(page * pageSize, (page + 1) * pageSize);

        return (
          <div key={group.key}>
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.key)}
              className="w-full flex items-center px-4 py-2.5 transition-colors hover:brightness-[0.98] cursor-pointer"
              style={{
                backgroundColor: isCollapsed ? "var(--neuron-bg-elevated)" : "var(--neuron-state-hover)",
                borderBottom: "1px solid var(--neuron-ui-divider)",
              }}
            >
              {/* Chevron */}
              <span className="transition-transform duration-150" style={{ color: "var(--neuron-ink-muted)" }}>
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </span>

              {/* Group Label */}
              <span
                className="ml-2 text-[13px] font-semibold truncate"
                style={{ color: "var(--neuron-ink-primary)" }}
              >
                {group.label}
              </span>

              {/* Count badge */}
              <span
                className="ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: "var(--neuron-brand-green-100)",
                  color: "var(--neuron-brand-green)",
                }}
              >
                {group.count}
              </span>

              {/* Subtotal */}
              <span
                className="ml-auto text-[13px] font-semibold tabular-nums"
                style={{ color: "var(--neuron-ink-primary)" }}
              >
                {formatCurrencyFull(group.subtotal)}
              </span>
            </button>

            {/* Detail Rows (only if expanded) */}
            {!isCollapsed && (
              <>
                {pagedItems.map((item, rowIdx) => (
                  <div
                    key={(item as any).id || `${group.key}-${rowIdx}`}
                    onClick={() => onRowClick?.(item)}
                    className="flex items-center px-4 py-2 transition-colors"
                    style={{
                      borderBottom: "1px solid var(--neuron-ui-divider)",
                      backgroundColor: "var(--neuron-bg-elevated)",
                      cursor: onRowClick ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--neuron-state-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--neuron-bg-elevated)";
                    }}
                  >
                    {/* Indent spacer (matches header chevron + gap for column alignment) */}
                    <div className="shrink-0" style={{ width: "26px" }} />

                    {/* Columns */}
                    <div className="flex items-center flex-1 min-w-0">
                      {columns.map((col, colIdx) => (
                        <div
                          key={colIdx}
                          className="px-2 text-[12px] truncate min-w-0"
                          style={{
                            color: "var(--neuron-ink-secondary)",
                            width: col.width || "auto",
                            flex: col.width ? "none" : 1,
                            textAlign: col.align || "left",
                          }}
                        >
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                            ? String((item as any)[col.accessorKey] ?? "—")
                            : "—"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Pagination (only if more than 1 page) */}
                {totalPages > 1 && (
                  <div
                    className="flex items-center justify-between px-6 py-2"
                    style={{
                      backgroundColor: "var(--neuron-bg-page)",
                      borderBottom: "1px solid var(--neuron-ui-divider)",
                    }}
                  >
                    <span className="text-[11px]" style={{ color: "var(--neuron-ink-muted)" }}>
                      Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, group.items.length)} of {group.items.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage(group.key, Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-2.5 py-1 rounded text-[11px] font-medium disabled:opacity-30"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          color: "var(--neuron-ink-muted)",
                        }}
                      >
                        Prev
                      </button>
                      <span className="text-[11px] px-2" style={{ color: "var(--neuron-ink-muted)" }}>
                        {page + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(group.key, Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-2.5 py-1 rounded text-[11px] font-medium disabled:opacity-30"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          color: "var(--neuron-ink-muted)",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}