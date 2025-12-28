import React, { useState } from "react";
import { X, Download, Printer, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { cn } from "../ui/utils";
import { toast } from "../ui/toast-utils";

interface ExpenseFileViewProps {
  expense: {
    id: string;
    expenseDate: string;
    expenseNo: string;
    category: string;
    bookingNo: string;
    company: string;
    payee: string;
    expenseType: "Operations" | "Admin" | "Commission" | "Itemized Cost";
    paymentChannel: string;
    amount: number;
    status: "Unpaid" | "Paid" | "Draft";
  };
  onClose: () => void;
  onOpenBooking?: (bookingNo: string) => void;
}

const STATUS_STYLES = {
  Draft: { bg: "#F3F4F6", color: "#6B7280", label: "Draft" },
  Unpaid: { bg: "#FEF3C7", color: "#F59E0B", label: "Pending" },
  Paid: { bg: "#E8F5E9", color: "#10b981", label: "Approved" },
};

const EXPENSE_CATEGORIES = [
  "Forwarding",
  "Operation",
  "Brokerage",
  "Trucking",
  "Warehouse",
  "Admin",
  "Accounting",
  "Others",
];

interface LineItem {
  id: string;
  particular: string;
  description: string;
  amount: number;
}

export function ExpenseFileView({ expense, onClose, onOpenBooking }: ExpenseFileViewProps) {
  const statusStyle = STATUS_STYLES[expense.status];
  const [activeCategory, setActiveCategory] = useState(expense.category || "Forwarding");
  
  // Mock line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", particular: "Ocean Freight", description: "Shanghai → Manila", amount: 45000 },
    { id: "2", particular: "Customs & Brokerage", description: "Import clearance fees", amount: 15000 },
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: Date.now().toString(),
      particular: "",
      description: "",
      amount: 0
    }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "1200px", maxWidth: "95vw", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-[#E6E9F0] flex-shrink-0"
          style={{ padding: "24px 32px" }}
        >
          <div>
            <h2 className="text-[#0A1D4D]" style={{ fontSize: "20px", fontWeight: 600 }}>
              Expense / Request for Payment
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1">
              {expense.bookingNo ? (
                <>
                  Linked to Booking:{" "}
                  <button
                    onClick={() => onOpenBooking?.(expense.bookingNo)}
                    className="text-[#0F5EFE] hover:underline"
                    style={{ fontWeight: 500 }}
                  >
                    {expense.bookingNo}
                  </button>
                </>
              ) : (
                "No booking linked"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1.5 rounded-full text-[11px]"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: 600,
              }}
            >
              {statusStyle.label}
            </span>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-9 w-9 p-0 rounded-full hover:bg-[#F3F4F6]"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </Button>
          </div>
        </div>

        {/* Tabs - Category Pills */}
        <div
          className="border-b border-[#E6E9F0] flex-shrink-0"
          style={{ padding: "16px 32px" }}
        >
          <div 
            className="flex items-center gap-2 bg-white border border-[#E6E9F0] rounded-2xl w-fit"
            style={{ padding: '8px 12px' }}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[13px] transition-all",
                  activeCategory === category
                    ? "bg-[#EDF0F7] text-[#0A1D4D]"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                )}
                style={{ fontWeight: activeCategory === category ? 600 : 500 }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "32px" }}>
          {/* Expense Details Card */}
          <div className="bg-white border border-[#E6E9F0] rounded-[16px] p-6 mb-6">
            <h3
              className="text-[#0A1D4D] mb-6"
              style={{ fontSize: "16px", fontWeight: 600 }}
            >
              Expense Details
            </h3>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                  Expense No.
                </Label>
                <Input
                  value={expense.expenseNo}
                  readOnly
                  className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                />
              </div>

              <div>
                <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                  Date
                </Label>
                <Input
                  value={expense.expenseDate}
                  readOnly
                  className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                />
              </div>

              <div>
                <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                  Company
                </Label>
                <Input
                  value={expense.company}
                  readOnly
                  className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                  For the account of
                </Label>
                <Input
                  value={expense.payee}
                  readOnly
                  className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                />
              </div>

              <div>
                <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                  Payment Channel
                </Label>
                <Input
                  value={expense.paymentChannel}
                  readOnly
                  className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white border border-[#E6E9F0] rounded-[16px] p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-[#0A1D4D]"
                style={{ fontSize: "16px", fontWeight: 600 }}
              >
                Particular Line Items
              </h3>
              <Button
                onClick={addLineItem}
                variant="outline"
                className="h-9 rounded-full border-[#E6E9F0]"
                style={{ fontWeight: 600, fontSize: "13px" }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-3">
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Particular
                    </Label>
                    <Input
                      value={item.particular}
                      readOnly
                      className="h-11 border-[#E6E9F0]"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Description
                    </Label>
                    <Input
                      value={item.description}
                      readOnly
                      className="h-11 border-[#E6E9F0]"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Amount (₱)
                    </Label>
                    <Input
                      value={`₱${item.amount.toLocaleString()}`}
                      readOnly
                      className="h-11 border-[#E6E9F0]"
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      onClick={() => removeLineItem(item.id)}
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-[#E6E9F0]">
              <div className="w-64">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#6B7280]" style={{ fontWeight: 600 }}>
                    Subtotal:
                  </span>
                  <span className="text-[20px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                    ₱{subtotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#E6E9F0] rounded-[12px] p-4">
              <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2">
                Prepared By
              </p>
              <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                Juan Dela Cruz
              </p>
              <span className="inline-block mt-2 px-2 py-1 rounded-full text-[10px] bg-[#E8F5E9] text-[#10b981]" style={{ fontWeight: 600 }}>
                Submitted
              </span>
            </div>

            <div className="bg-white border border-[#E6E9F0] rounded-[12px] p-4">
              <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2">
                Noted By
              </p>
              <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                Maria Santos
              </p>
              <span className="inline-block mt-2 px-2 py-1 rounded-full text-[10px] bg-[#FEF3C7] text-[#F59E0B]" style={{ fontWeight: 600 }}>
                Pending
              </span>
            </div>

            <div className="bg-white border border-[#E6E9F0] rounded-[12px] p-4">
              <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2">
                Approved By
              </p>
              <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                —
              </p>
              <span className="inline-block mt-2 px-2 py-1 rounded-full text-[10px] bg-[#F3F4F6] text-[#6B7280]" style={{ fontWeight: 600 }}>
                Awaiting
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div 
          className="border-t border-[#E6E9F0] bg-white flex items-center justify-between flex-shrink-0"
          style={{ 
            height: '72px',
            padding: '0 24px',
          }}
        >
          {/* Left group - Utilities */}
          <div className="flex items-center" style={{ gap: '12px' }}>
            <Button
              onClick={() => toast.success("Printing expense...")}
              variant="ghost"
              className="h-11 text-[14px]"
              style={{ fontWeight: 500, minWidth: '120px', borderRadius: '10px' }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={() => toast.success("Downloading Excel...")}
              variant="ghost"
              className="h-11 text-[14px]"
              style={{ fontWeight: 500, minWidth: '120px', borderRadius: '10px' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </div>

          {/* Right group - State-changing actions */}
          <div className="flex items-center" style={{ gap: '12px' }}>
            {(expense.status === "Unpaid") && (
              <Button
                onClick={() => toast.success("Marked as paid")}
                variant="outline"
                disabled={expense.status === "Paid"}
                className="h-11 px-6 border-[#E6E9F0] text-[14px]"
                style={{ fontWeight: 500, minWidth: '148px', borderRadius: '10px' }}
              >
                Mark as Paid
              </Button>
            )}
            <Button
              onClick={() => toast.success("Expense saved")}
              className="h-11 px-6 bg-[#F25C05] hover:bg-[#E55304] text-white text-[14px]"
              style={{ fontWeight: 500, minWidth: '140px', borderRadius: '10px' }}
            >
              Save Expense
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
