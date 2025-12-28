import { useState } from "react";
import {
  ChevronRight,
  Download,
  Plus,
  Building2,
  Calendar,
  Search,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Mock ledger data
const LEDGER_DATA = [
  {
    date: "Oct 24",
    fullDate: "2025-10-24",
    ref: "ND-2025-007",
    description: "Transport service",
    category: "Revenue",
    moneyIn: 25000,
    moneyOut: 0,
    balance: 50000,
    status: "Posted" as const,
    bookingNo: "ND-2025-007",
  },
  {
    date: "Oct 23",
    fullDate: "2025-10-23",
    ref: "ENTRY-1023",
    description: "Toll fees",
    category: "Operating expenses",
    moneyIn: 0,
    moneyOut: 2500,
    balance: 25000,
    status: "Posted" as const,
    bookingNo: "ND-2025-003",
  },
  {
    date: "Oct 23",
    fullDate: "2025-10-23",
    ref: "ND-2025-006",
    description: "Delivery service",
    category: "Revenue",
    moneyIn: 18000,
    moneyOut: 0,
    balance: 27500,
    status: "Reconciled" as const,
    bookingNo: "ND-2025-006",
  },
  {
    date: "Oct 22",
    fullDate: "2025-10-22",
    ref: "ENTRY-1022",
    description: "Fuel",
    category: "Operating expenses",
    moneyIn: 0,
    moneyOut: 3500,
    balance: 9500,
    status: "Posted" as const,
    bookingNo: "ND-2025-002",
  },
  {
    date: "Oct 22",
    fullDate: "2025-10-22",
    ref: "DRAFT-001",
    description: "Office supplies",
    category: "Operating expenses",
    moneyIn: 0,
    moneyOut: 1200,
    balance: 13000,
    status: "Draft" as const,
    bookingNo: null,
  },
  {
    date: "Oct 21",
    fullDate: "2025-10-21",
    ref: "ND-2025-005",
    description: "Express courier",
    category: "Revenue",
    moneyIn: 15000,
    moneyOut: 0,
    balance: 14200,
    status: "Posted" as const,
    bookingNo: "ND-2025-005",
  },
  {
    date: "Oct 20",
    fullDate: "2025-10-20",
    ref: "ENTRY-1020",
    description: "Vehicle maintenance",
    category: "Operating expenses",
    moneyIn: 0,
    moneyOut: 8500,
    balance: -800,
    status: "Posted" as const,
    bookingNo: null,
  },
  {
    date: "Oct 19",
    fullDate: "2025-10-19",
    ref: "ND-2025-004",
    description: "Freight forwarding",
    category: "Revenue",
    moneyIn: 32000,
    moneyOut: 0,
    balance: 7700,
    status: "Posted" as const,
    bookingNo: "ND-2025-004",
  },
];

interface LedgerScreenProps {
  accountName?: string;
  accountCode?: string;
  accountType?: string;
  isReconcilable?: boolean;
  isDefault?: boolean;
  currentBalance?: number;
  onBack?: () => void;
}

export function LedgerScreen({
  accountName = "Bank – BPI",
  accountCode = "BPI",
  accountType = "Bank",
  isReconcilable = true,
  isDefault = true,
  currentBalance = 50000,
  onBack,
}: LedgerScreenProps) {
  const [dateRange, setDateRange] = useState("This month");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Cash In" | "Cash Out">("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Calculate totals
  const openingBalance = 48300;
  const cashInTotal = LEDGER_DATA.reduce((sum, entry) => sum + entry.moneyIn, 0);
  const cashOutTotal = LEDGER_DATA.reduce((sum, entry) => sum + entry.moneyOut, 0);
  const closingBalance = currentBalance;

  // Filter data
  const filteredData = LEDGER_DATA.filter((entry) => {
    // Type filter
    if (typeFilter === "Cash In" && entry.moneyIn === 0) return false;
    if (typeFilter === "Cash Out" && entry.moneyOut === 0) return false;
    
    // Status filter
    if (statusFilter !== "All" && entry.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        entry.description.toLowerCase().includes(search) ||
        entry.ref.toLowerCase().includes(search) ||
        entry.category.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const handleExportCSV = () => {
    console.log("Exporting CSV with filtered results:", filteredData.length, "entries");
    // Stub: Would generate and download CSV
  };

  const handleRowClick = (entry: typeof LEDGER_DATA[0]) => {
    console.log("Opening entry sheet for:", entry.ref);
    // Would open Entry Sheet component
  };

  const handleBookingClick = (bookingNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Opening booking:", bookingNo);
    // Would open booking detail in new tab
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
        {/* Breadcrumbs + Header */}
        <div className="space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[#6B7280]" style={{ fontSize: "13px", lineHeight: "20px" }}>
            <button 
              onClick={onBack}
              className="hover:text-[#0A1D4D] transition-colors"
            >
              Accounting
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button 
              onClick={onBack}
              className="hover:text-[#0A1D4D] transition-colors"
            >
              Accounts
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0A1D4D]" style={{ fontWeight: 600 }}>
              {accountName}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-[#0A1D4D]" style={{ fontSize: "28px", lineHeight: "36px", fontWeight: 600 }}>
              {accountName}
            </h1>
            <p className="text-[#6B7280] mt-1" style={{ fontSize: "13px", lineHeight: "20px" }}>
              Ledger • {accountCode} • Account code: {accountCode}
              {isReconcilable && " • Reconcilable"}
            </p>
          </div>
        </div>

        {/* Account Summary Card */}
        <div 
          className="border border-[#E5E7EB] rounded-[12px] p-4 flex items-center justify-between"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div>
            <p className="text-[#6B7280]" style={{ fontSize: "12px", lineHeight: "18px" }}>
              Current balance
            </p>
            <div className="flex items-center gap-2 mt-1">
              {currentBalance < 0 && (
                <div 
                  className="px-2 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-[8px]"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  NEG
                </div>
              )}
              <p 
                className="tabular-nums"
                style={{ 
                  fontSize: "24px", 
                  lineHeight: "32px", 
                  fontWeight: 600,
                  color: currentBalance < 0 ? "#B91C1C" : "#0A1D4D"
                }}
              >
                {currentBalance >= 0 
                  ? `₱${currentBalance.toLocaleString()}` 
                  : `-₱${Math.abs(currentBalance).toLocaleString()}`}
              </p>
            </div>
            <p className="text-[#6B7280] mt-1" style={{ fontSize: "12px", lineHeight: "18px" }}>
              As of Oct 26, 2025 • {accountType}
              {isDefault && " • Default"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-10 border-[#D1D5DB] rounded-[10px]"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowEntryModal(true)}
              className="h-10 bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-[10px]"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div 
          className="border border-[#E5E7EB] rounded-[12px] p-3 flex flex-wrap items-center gap-3"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        >
          {/* Date Range */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-10 w-[160px] border-[#D1D5DB] rounded-[999px]">
              <Calendar className="w-4 h-4 mr-2 text-[#6B7280]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Yesterday">Yesterday</SelectItem>
              <SelectItem value="Last 7 days">Last 7 days</SelectItem>
              <SelectItem value="This month">This month</SelectItem>
              <SelectItem value="Last month">Last month</SelectItem>
              <SelectItem value="Custom">Custom...</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, booking no., client"
              className="h-10 pl-9 border-[#D1D5DB] rounded-[999px]"
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* Type Filter (Segmented) */}
          <div className="flex items-center gap-1 p-1 border border-[#E5E7EB] rounded-[999px] bg-[#F9FAFB]">
            {(["All", "Cash In", "Cash Out"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 h-8 rounded-[999px] transition-all ${
                  typeFilter === type
                    ? "bg-white text-[#0A1D4D] shadow-sm"
                    : "text-[#6B7280] hover:text-[#374151]"
                }`}
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[140px] border-[#D1D5DB] rounded-[999px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Posted">Posted</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Reconciled">Reconciled</SelectItem>
            </SelectContent>
          </Select>

          {/* Results count */}
          <div className="ml-auto text-[#6B7280]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            Showing 1–{filteredData.length} of {LEDGER_DATA.length}
          </div>
        </div>

        {/* Opening/Closing Summary Strip (Sticky) */}
        <div 
          className="sticky top-0 z-10 bg-[#F9FAFB] border-y border-[#E5E7EB] -mx-6 px-6 py-3"
        >
          <div className="max-w-[1200px] mx-auto flex items-center justify-between text-[#374151]" style={{ fontSize: "13px", fontWeight: 500 }}>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[#6B7280]">Opening balance (Oct 1)</span>
                <span className="ml-2 tabular-nums" style={{ fontWeight: 600 }}>
                  ₱{openingBalance.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-4 bg-[#E5E7EB]" />
              <div>
                <span className="text-[#6B7280]">Cash In total</span>
                <span className="ml-2 tabular-nums text-[#059669]" style={{ fontWeight: 600 }}>
                  ₱{cashInTotal.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-4 bg-[#E5E7EB]" />
              <div>
                <span className="text-[#6B7280]">Cash Out total</span>
                <span className="ml-2 tabular-nums" style={{ fontWeight: 600 }}>
                  ₱{cashOutTotal.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-4 bg-[#E5E7EB]" />
              <div>
                <span className="text-[#6B7280]">Closing balance</span>
                <span className="ml-2 tabular-nums" style={{ fontWeight: 600 }}>
                  ₱{closingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        {filteredData.length > 0 ? (
          <div className="border border-[#E5E7EB] rounded-[12px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label={`Ledger for ${accountName}. Money in, Money out, and running balance.`}>
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] sticky top-[57px] z-[9]">
                  <tr>
                    <th 
                      className="text-left px-4 py-3 text-[#6B7280] uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
                    >
                      Date
                    </th>
                    <th 
                      className="text-left px-4 py-3 text-[#6B7280] uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
                    >
                      Ref
                    </th>
                    <th 
                      className="text-left px-4 py-3 text-[#6B7280] uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
                    >
                      Description / Category
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-[#6B7280] uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">Cash In</span>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top"
                            className="max-w-[280px]"
                            style={{ 
                              borderRadius: "8px",
                              padding: "8px 10px",
                              fontSize: "12px",
                              lineHeight: "18px",
                              color: "#6B7280"
                            }}
                          >
                            Funds received into this account (deposits, collections, refunds).
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-[#6B7280] uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">Cash Out</span>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top"
                            className="max-w-[280px]"
                            style={{ 
                              borderRadius: "8px",
                              padding: "8px 10px",
                              fontSize: "12px",
                              lineHeight: "18px",
                              color: "#6B7280"
                            }}
                          >
                            Funds paid from this account (payments, withdrawals, fees).
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-[#6B7280] uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
                    >
                      Balance
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-[#6B7280] uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry, index) => (
                    <tr
                      key={`${entry.ref}-${index}`}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                      onClick={() => handleRowClick(entry)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${entry.date}, ${entry.ref}, ${entry.description}, ${
                        entry.moneyIn > 0 ? `cash in ₱${entry.moneyIn.toLocaleString()}` : `cash out ₱${entry.moneyOut.toLocaleString()}`
                      }, balance ₱${entry.balance.toLocaleString()}, ${entry.status.toLowerCase()}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(entry);
                        }
                      }}
                      style={{ height: "56px" }}
                    >
                      <td className="px-4 py-3 text-[#374151]" style={{ fontSize: "14px", fontWeight: 500 }}>
                        {entry.date}
                      </td>
                      <td className="px-4 py-3">
                        {entry.bookingNo ? (
                          <button
                            onClick={(e) => handleBookingClick(entry.bookingNo!, e)}
                            className="text-[#F25C05] hover:text-[#D84D00] underline"
                            style={{ fontSize: "14px", fontWeight: 500 }}
                          >
                            {entry.ref}
                          </button>
                        ) : (
                          <span className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 500 }}>
                            {entry.ref}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 500 }}>
                            {entry.description}
                          </p>
                          <p className="text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 400 }}>
                            {entry.category}
                            {entry.bookingNo && ` • ${entry.bookingNo}`}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontSize: "14px", fontWeight: 500 }}>
                        {entry.moneyIn > 0 ? (
                          <span className="text-[#059669]">
                            ₱{entry.moneyIn.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[#D1D5DB]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontSize: "14px", fontWeight: 500 }}>
                        {entry.moneyOut > 0 ? (
                          <span className="text-[#374151]">
                            ₱{entry.moneyOut.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[#D1D5DB]">—</span>
                        )}
                      </td>
                      <td 
                        className="px-4 py-3 text-right tabular-nums"
                        style={{ 
                          fontSize: "14px", 
                          fontWeight: 600,
                          color: entry.balance < 0 ? "#B91C1C" : "#0A1D4D"
                        }}
                      >
                        {entry.balance >= 0 
                          ? `₱${entry.balance.toLocaleString()}` 
                          : `-₱${Math.abs(entry.balance).toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <LedgerStatusBadge status={entry.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState onNewEntry={() => setShowEntryModal(true)} />
        )}

        {/* Footer Totals */}
        {filteredData.length > 0 && (
          <div 
            className="border border-[#E5E7EB] rounded-[12px] px-4 py-3 flex items-center justify-between"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[#6B7280]" style={{ fontSize: "14px", fontWeight: 500 }}>
              Period totals
            </p>
            <div className="flex items-center gap-6 text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
              <div className="tabular-nums">
                Cash In{" "}
                <span className="text-[#059669]">₱{cashInTotal.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-[#E5E7EB]" />
              <div className="tabular-nums">
                Cash Out{" "}
                <span>₱{cashOutTotal.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-[#E5E7EB]" />
              <div className="tabular-nums">
                Net{" "}
                <span className={cashInTotal - cashOutTotal < 0 ? "text-[#B91C1C]" : ""}>
                  ₱{(cashInTotal - cashOutTotal).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LedgerStatusBadge({ status }: { status: "Posted" | "Draft" | "Reconciled" }) {
  const styles = {
    Posted: {
      bg: "#F3F4F6",
      text: "#374151",
      border: "none",
    },
    Draft: {
      bg: "#FEF3C7",
      text: "#92400E",
      border: "none",
    },
    Reconciled: {
      bg: "transparent",
      text: "#0369A1",
      border: "#0369A1",
    },
  };

  const style = styles[status];

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-[999px]"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        fontSize: "12px",
        fontWeight: 600,
        border: style.border ? `1px solid ${style.border}` : "none",
      }}
    >
      {status}
    </span>
  );
}

function EmptyState({ onNewEntry }: { onNewEntry: () => void }) {
  return (
    <div className="border border-[#E5E7EB] rounded-[12px] py-16 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-[#6B7280]" />
      </div>
      <h3 className="text-[#0A1D4D] mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>
        No ledger activity this period
      </h3>
      <p className="text-[#6B7280] mb-4" style={{ fontSize: "14px" }}>
        Try widening the dates or record a Cash In or Cash Out.
      </p>
      <Button
        variant="outline"
        onClick={onNewEntry}
        className="h-10 border-[#D1D5DB] rounded-[10px]"
        style={{ fontSize: "14px", fontWeight: 600 }}
      >
        New Entry
      </Button>
    </div>
  );
}
