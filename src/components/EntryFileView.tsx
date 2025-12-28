import { useState } from "react";
import { ArrowLeft, Printer, Copy, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { toast } from "./ui/toast-utils";

interface Entry {
  id: string;
  date: string;
  category: string;
  bookingNo: string;
  type: "Revenue" | "Expense";
  company: string;
  paymentChannel: string;
  amount: number;
  status: "Posted" | "Draft";
  referenceNo?: string;
  description?: string;
  particulars?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  // Revenue fields
  itemizedCost?: number;
  expenses?: number;
  adminCostPercent?: number;
  collectedAmount?: number;
  collectedDate?: string;
  showInSalesReport?: boolean;
  // Expense fields
  lineItems?: Array<{
    id: string;
    particular: string;
    description: string;
    amount: number;
  }>;
  forAccountOf?: string;
  categories?: string[];
}

interface EntryFileViewProps {
  entry: Entry;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate?: () => void;
}

// Status Badge
function StatusBadge({ status }: { status: "Posted" | "Draft" }) {
  const config = {
    "Posted": { color: "#10B981", bg: "#D1FAE5", text: "Posted" },
    "Draft": { color: "#F59E0B", bg: "#FEF3C7", text: "Draft" },
  }[status];

  return (
    <div
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
      }}
    >
      {config.text}
    </div>
  );
}

// Type Badge
function TypeBadge({ type }: { type: "Revenue" | "Expense" }) {
  const config = {
    "Revenue": { color: "#059669", bg: "#D1FAE5" },
    "Expense": { color: "#DC2626", bg: "#FEE2E2" },
  }[type];

  return (
    <div
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
      }}
    >
      {type}
    </div>
  );
}

export function EntryFileView({ entry, onBack, onEdit, onDuplicate }: EntryFileViewProps) {
  const calculateTotalExpenses = () => {
    if (entry.type !== "Revenue") return 0;
    const adminCost = ((entry.itemizedCost || 0) + (entry.expenses || 0)) * ((entry.adminCostPercent || 3) / 100);
    return (entry.itemizedCost || 0) + (entry.expenses || 0) + adminCost;
  };

  const calculateGrossProfit = () => {
    if (entry.type !== "Revenue") return 0;
    return (entry.collectedAmount || 0) - calculateTotalExpenses();
  };

  const calculateExpenseTotal = () => {
    if (entry.type !== "Expense" || !entry.lineItems) return 0;
    return entry.lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate();
      toast.success("Entry duplicated");
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ width: '1440px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        className="flex items-center justify-between border-b bg-white"
        style={{
          paddingTop: '16px',
          paddingBottom: '12px',
          paddingLeft: '32px',
          paddingRight: '32px',
          borderColor: '#EDF0F3',
        }}
      >
        {/* Left - Back + Title */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-[#F9FAFB] text-[#6B7280]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-[#0A1D4D]"
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  lineHeight: '1.2',
                }}
              >
                {entry.bookingNo} • {entry.type} Entry
              </h1>
              <StatusBadge status={entry.status} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[#94A3B8]" style={{ fontSize: '13px', fontWeight: 400 }}>
                {new Date(entry.date).toLocaleDateString("en-US", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </p>
              <span className="text-[#E5E7EB]">•</span>
              <p className="text-[#94A3B8]" style={{ fontSize: '13px', fontWeight: 400 }}>
                {entry.company}
              </p>
            </div>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onEdit}
            variant="outline"
            className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-10 px-4"
            style={{ fontWeight: 600 }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-10 px-4"
            style={{ fontWeight: 600 }}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {onDuplicate && (
            <Button
              onClick={handleDuplicate}
              variant="outline"
              className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-10 px-4"
              style={{ fontWeight: 600 }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          )}
        </div>
      </div>

      {/* Body - 2-column layout */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]" style={{ padding: '24px 32px' }}>
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main content (8 columns) */}
          <div className="col-span-8 space-y-6">
            {/* General Information Card */}
            <Card className="p-6 border border-[#E5E7EB] bg-white">
              <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                General Information
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Entry Type</p>
                  <TypeBadge type={entry.type} />
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Company</p>
                  <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                    {entry.company}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Category</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F3F4F6] text-[#374151] text-[12px]" style={{ fontWeight: 500 }}>
                    {entry.category}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Payment Channel</p>
                  <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                    {entry.paymentChannel}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Linked Booking / Job</p>
                  <a
                    href="#"
                    className="text-[13px] text-[#0A6EBD] hover:underline"
                    style={{ fontWeight: 600 }}
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success("Navigate to booking");
                    }}
                  >
                    {entry.bookingNo}
                  </a>
                </div>
                {entry.referenceNo && (
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Reference No.</p>
                    <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {entry.referenceNo}
                    </p>
                  </div>
                )}
                {(entry.description || entry.particulars) && (
                  <div className="col-span-2">
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">
                      {entry.type === "Revenue" ? "Particulars" : "Description"}
                    </p>
                    <p className="text-[13px] text-[#374151]" style={{ fontWeight: 500, lineHeight: '1.6' }}>
                      {entry.description || entry.particulars}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Revenue-specific: Cost & Profit Breakdown */}
            {entry.type === "Revenue" && (
              <Card className="p-6 border border-[#E5E7EB] bg-[#FFFBF0]">
                <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Cost & Profit Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Itemized Cost</p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                      ₱{(entry.itemizedCost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Expenses</p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                      ₱{(entry.expenses || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Admin Cost</p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                      {entry.adminCostPercent || 3}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Total Expenses</p>
                    <p className="text-[14px] text-[#DC2626]" style={{ fontWeight: 700 }}>
                      ₱{calculateTotalExpenses().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Collected Amount</p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                      ₱{(entry.collectedAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Gross Profit</p>
                    <p
                      className={cn(
                        "text-[16px]",
                        calculateGrossProfit() >= 0 ? "text-[#10B981]" : "text-[#DC2626]"
                      )}
                      style={{ fontWeight: 700 }}
                    >
                      ₱{calculateGrossProfit().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Expense-specific: RFP Lines */}
            {entry.type === "Expense" && entry.lineItems && entry.lineItems.length > 0 && (
              <Card className="p-6 border border-[#E5E7EB] bg-white">
                <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Request for Payment Lines
                </h3>
                <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[#6B7280]" style={{ width: "40%" }}>
                          Particular
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[#6B7280]" style={{ width: "40%" }}>
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-[#6B7280]" style={{ width: "20%" }}>
                          Amount (₱)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lineItems.map((item, index) => (
                        <tr key={item.id} className="border-t border-[#E5E7EB]">
                          <td className="px-4 py-3 text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                            {item.particular}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                            {item.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#0A1D4D] text-right" style={{ fontWeight: 600 }}>
                            ₱{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-[#0A1D4D] bg-[#F9FAFB]">
                        <td colSpan={2} className="px-4 py-3 text-[13px] text-[#0A1D4D] text-right uppercase tracking-wide" style={{ fontWeight: 600 }}>
                          Total Amount
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#0A1D4D] text-right" style={{ fontWeight: 700 }}>
                          ₱{calculateExpenseTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {entry.forAccountOf && (
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">For the account of</p>
                    <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {entry.forAccountOf}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Reporting Fields Card (Revenue only) */}
            {entry.type === "Revenue" && (
              <Card className="p-6 border border-[#E5E7EB] bg-white">
                <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Reporting Fields
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {entry.collectedDate && (
                    <div>
                      <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Collected Date</p>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                        {new Date(entry.collectedDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Show in Sales Profit Report</p>
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[12px]",
                      entry.showInSalesReport
                        ? "bg-[#D1FAE5] text-[#059669]"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    )} style={{ fontWeight: 600 }}>
                      {entry.showInSalesReport ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar (4 columns) */}
          <div className="col-span-4 space-y-6">
            {/* Summary Card */}
            <Card className="p-5 border border-[#E5E7EB] bg-white">
              <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Total Amount</p>
                  <p className="text-[20px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                    ₱{entry.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E5E7EB]">
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Company</p>
                  <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                    {entry.company}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Linked Job</p>
                  <p className="text-[13px] text-[#0A6EBD]" style={{ fontWeight: 600 }}>
                    {entry.bookingNo}
                  </p>
                </div>
              </div>
            </Card>

            {/* Audit Card */}
            <Card className="p-5 border border-[#E5E7EB] bg-[#F9FAFB]">
              <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                Audit Trail
              </h3>
              <div className="space-y-3">
                {entry.createdBy && (
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Created by</p>
                    <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {entry.createdBy}
                    </p>
                  </div>
                )}
                {entry.createdAt && (
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Created at</p>
                    <p className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                      {entry.createdAt}
                    </p>
                  </div>
                )}
                {entry.updatedAt && (
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Last updated</p>
                    <p className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                      {entry.updatedAt}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
