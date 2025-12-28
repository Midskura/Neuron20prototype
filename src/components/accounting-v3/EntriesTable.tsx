import { useState } from "react";
import { Eye, Copy, Trash2, Paperclip, MoreHorizontal, Stamp, Printer, ShieldCheck, Ban } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getCompanyById, getCompanyShort } from "./companies";
import { StatusPill, EntryStatus } from "./StatusPill";
import { RFPStatusPill, RFPStatus } from "./RFPStatusPill";

interface Entry {
  id: string;
  type: "revenue" | "expense" | "transfer";
  amount: number;
  category: string;
  categoryColor: string;
  accountId: string;
  accountName: string;
  company: string;
  bookingNo: string;
  note: string;
  date: string;
  status: EntryStatus;
  payee?: string;
  paymentMethod?: string;
  isNoBooking?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  requestedBy?: string;
  requestedDate?: string;
  rfpId?: string;
  rfpStatus?: RFPStatus;
}

interface EntriesTableProps {
  entries: Entry[];
  onView: (entry: Entry) => void;
  onDuplicate: (entry: Entry) => void;
  onToggleStatus: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onSendForApproval?: (entry: Entry) => void;
  onApprove?: (entry: Entry) => void;
  onReject?: (entry: Entry) => void;
  onPrintRFP?: (entry: Entry) => void;
  userRole?: "accountant" | "approver";
}

function TypePill({ type }: { type: Entry["type"] }) {
  const config = {
    revenue: { label: "Revenue", color: "#16a34a", bg: "#f0fdf4" },
    expense: { label: "Expense", color: "#dc2626", bg: "#fef2f2" },
    transfer: { label: "Transfer", color: "#6B7280", bg: "#F9FAFB" },
  };
  
  const { label, color, bg } = config[type];
  
  return (
    <div
      className="inline-flex items-center justify-center px-2.5 rounded-full whitespace-nowrap"
      style={{ 
        backgroundColor: bg, 
        color,
        fontSize: "12px",
        fontWeight: 600,
        height: "26px",
        lineHeight: "1",
      }}
    >
      {label}
    </div>
  );
}

export function EntriesTable({
  entries,
  onView,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onSendForApproval,
  onApprove,
  onReject,
  onPrintRFP,
  userRole = "approver",
}: EntriesTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const dateKey = new Date(entry.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, Entry[]>);

  const formatAmount = (amount: number, type: string) => {
    return `₱${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getAmountColor = (type: string) => {
    if (type === "revenue") return "#059669"; // positive
    if (type === "expense") return "#B91C1C"; // negative
    return "#374151"; // neutral-700
  };

  return (
    <div 
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden" 
      style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}
    >
      {/* Table Container - Vertical scroll only, NO horizontal scroll */}
      <div 
        className="overflow-y-auto overflow-x-hidden"
        style={{ 
          height: "560px",
        }}
      >
        {/* Table Header - Sticky */}
        <div
          className="entries-table-header sticky top-0 z-20 bg-white border-b border-neutral-200"
          style={{
            minHeight: "56px",
          }}
        >
          {/* CATEGORY */}
          <div 
            className="px-3 py-3 truncate"
            style={{ 
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Category
          </div>

          {/* BOOKING NO */}
          <div 
            className="px-2 py-3 truncate"
            style={{ 
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Booking No
          </div>

          {/* TYPE */}
          <div 
            className="px-2 py-3 text-center truncate"
            style={{ 
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Type
          </div>

          {/* ACCOUNT */}
          <div 
            className="px-2 py-3 truncate"
            style={{ 
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Account
          </div>

          {/* COMPANY */}
          <div 
            className="px-2 py-3 truncate"
            style={{ 
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Company
          </div>

          {/* AMOUNT */}
          <div 
            className="px-2 py-3 text-right truncate"
            style={{ 
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Amount
          </div>

          {/* STATUS */}
          <div 
            className="px-2 py-3 text-center truncate"
            style={{ 
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Status
          </div>

          {/* ACTIONS */}
          <div className="px-2 py-3"></div>
        </div>

        {/* Table Body with Date Groups */}
        {Object.entries(groupedEntries).map(([dateKey, dateEntries]) => (
          <div key={dateKey}>
            {/* Date Row - Non-sticky, scrolls with data */}
            <div
              className="bg-neutral-50 border-b border-neutral-100 px-4"
              style={{ 
                fontSize: "12px",
                color: "#6B7280",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                minHeight: "40px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {dateKey}
            </div>

            {/* Table Rows */}
            {dateEntries.map((entry) => (
              <div
                key={entry.id}
                className={`entries-table-row group cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0 focus:outline-none focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2 focus:z-10 ${
                  hoveredId === entry.id ? "bg-neutral-50" : "bg-white hover:bg-neutral-50"
                }`}
                style={{
                  minHeight: "56px",
                }}
                tabIndex={0}
                role="button"
                aria-label={`View entry for ${entry.category}`}
                onMouseEnter={() => setHoveredId(entry.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onView(entry)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView(entry);
                  }
                }}
              >
                {/* CATEGORY */}
                <div className="px-3 py-3 flex items-center gap-2 overflow-hidden">
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: entry.categoryColor + "20",
                      width: "20px",
                      height: "20px",
                    }}
                  >
                    <div
                      className="rounded-full"
                      style={{ 
                        backgroundColor: entry.categoryColor,
                        width: "8px",
                        height: "8px",
                      }}
                    />
                  </div>
                  <span 
                    className="truncate"
                    style={{ 
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1F2937",
                    }}
                  >
                    {entry.category}
                  </span>
                </div>

                {/* BOOKING NO */}
                <div className="px-2 py-3 overflow-hidden">
                  <a
                    href={`#/booking/${entry.bookingNo}`}
                    className="font-mono hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-[#0A1D4D] rounded truncate block"
                    style={{ 
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1F2937",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#0A1D4D";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#1F2937";
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`#/booking/${entry.bookingNo}`, "_blank");
                    }}
                  >
                    {entry.bookingNo}
                  </a>
                </div>

                {/* TYPE */}
                <div className="px-2 py-3 flex justify-center overflow-hidden">
                  <TypePill type={entry.type} />
                </div>

                {/* ACCOUNT */}
                <div 
                  className="px-2 py-3 truncate"
                  style={{ 
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1F2937",
                  }}
                >
                  {entry.accountName}
                </div>

                {/* COMPANY */}
                <div className="px-2 py-3 flex items-center overflow-hidden">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="inline-flex items-center px-2 rounded-full cursor-default whitespace-nowrap"
                          style={{ 
                            height: "24px",
                            backgroundColor: "#F3F4F6",
                            color: "#111827",
                            fontSize: "12px",
                            fontWeight: 600,
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {getCompanyShort(entry.company)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="max-w-[280px]"
                        style={{ fontSize: "12px", fontWeight: 500 }}
                      >
                        {getCompanyById(entry.company)?.name || entry.company}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* AMOUNT */}
                <div
                  className="px-2 py-3 text-right truncate"
                  style={{ 
                    fontSize: "14px",
                    color: getAmountColor(entry.type),
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatAmount(entry.amount, entry.type)}
                </div>

                {/* STATUS */}
                <div 
                  className="px-2 py-3 flex justify-center overflow-hidden"
                  style={{
                    maxWidth: "180px",
                  }}
                >
                  <StatusPill status={entry.status} size="sm" />
                </div>

                {/* ACTIONS */}
                <div 
                  className="px-2 py-3 flex items-center justify-center transition-opacity"
                  style={{
                    opacity: hoveredId === entry.id ? 1 : 0,
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-neutral-100 focus:outline-2 focus:outline-offset-1 focus:outline-[#0A1D4D] rounded"
                        onClick={(e) => e.stopPropagation()}
                        title="More actions"
                      >
                        <MoreHorizontal className="w-[18px] h-[18px]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(entry);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(entry);
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      
                      {/* Send for approval - visible when Draft */}
                      {entry.status === "draft" && onSendForApproval && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendForApproval(entry);
                            }}
                          >
                            <Stamp className="w-4 h-4 mr-2" />
                            Send for approval
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Approve/Reject - visible when Pending (approver only) */}
                      {entry.status === "pending" && userRole === "approver" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onApprove) onApprove(entry);
                            }}
                            className="text-[#0A1D4D]"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onReject) onReject(entry);
                            }}
                            className="text-[#B91C1C]"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Print RFP - visible for non-Draft */}
                      {entry.status !== "draft" && onPrintRFP && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrintRFP(entry);
                            }}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print RFP
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this entry?")) {
                            onDelete(entry);
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-[14px]" style={{ fontWeight: 500, color: "#6B7280" }}>No entries found</p>
          </div>
        )}
      </div>
    </div>
  );
}
