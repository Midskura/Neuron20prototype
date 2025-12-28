import React from "react";
import { X, Download, Printer, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { cn } from "../ui/utils";
import { toast } from "../ui/toast-utils";

interface BillingFileViewProps {
  billing: {
    id: string;
    invoiceDate: string;
    invoiceNo: string;
    bookingNo: string;
    client: string;
    company: string;
    particulars: string;
    amount: number;
    collected: number;
    balance: number;
    status: "Draft" | "Posted" | "Paid" | "Partial";
  };
  onClose: () => void;
  onOpenBooking?: (bookingNo: string) => void;
}

const STATUS_STYLES = {
  Draft: { bg: "#F3F4F6", color: "#6B7280", label: "Draft" },
  Posted: { bg: "#E8F5E9", color: "#10b981", label: "Posted" },
  Paid: { bg: "#E8F5E9", color: "#10b981", label: "Paid" },
  Partial: { bg: "#FEF3C7", color: "#F59E0B", label: "Partially Paid" },
};

export function BillingFileView({ billing, onClose, onOpenBooking }: BillingFileViewProps) {
  const statusStyle = STATUS_STYLES[billing.status];

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
              Billing: {billing.invoiceNo}
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1">
              Linked to Booking:{" "}
              <button
                onClick={() => onOpenBooking?.(billing.bookingNo)}
                className="text-[#0F5EFE] hover:underline"
                style={{ fontWeight: 500 }}
              >
                {billing.bookingNo}
              </button>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "32px" }}>
          <div className="flex gap-6">
            {/* Left Column - Billing & Client Information */}
            <div className="flex-[2]">
              <div className="bg-white border border-[#E6E9F0] rounded-[16px] p-6">
                <h3
                  className="text-[#0A1D4D] mb-6"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                >
                  Billing & Client Information
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Client Name
                    </Label>
                    <Input
                      value={billing.client}
                      disabled
                      className="bg-[#F9FAFB] border-[#E6E9F0] h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Billing Date
                    </Label>
                    <Input
                      value={billing.invoiceDate}
                      disabled
                      className="bg-[#F9FAFB] border-[#E6E9F0] h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Billing No.
                    </Label>
                    <Input
                      value={billing.invoiceNo}
                      disabled
                      className="bg-[#F9FAFB] border-[#E6E9F0] h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Booking Ref
                    </Label>
                    <Input
                      value={billing.bookingNo}
                      disabled
                      className="bg-[#F9FAFB] border-[#E6E9F0] h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Company
                    </Label>
                    <Input
                      value={billing.company}
                      disabled
                      className="bg-[#F9FAFB] border-[#E6E9F0] h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Bill To / Attention To
                    </Label>
                    <Input
                      value={billing.client}
                      disabled
                      className="bg-[#F9FAFB] border-[#E6E9F0] h-11"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                    Particulars / Cargo Details
                  </Label>
                  <Textarea
                    value={billing.particulars}
                    disabled
                    className="bg-[#F9FAFB] border-[#E6E9F0] min-h-[80px]"
                  />
                </div>

                {/* Itemized Charges */}
                <div className="mt-8">
                  <h4
                    className="text-[#0A1D4D] mb-4"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    Itemized Charges
                  </h4>
                  <div className="border border-[#E6E9F0] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#F9FAFB]">
                        <tr>
                          <th
                            className="text-left px-4 py-3 text-[11px] text-[#6B7280] uppercase tracking-wide"
                            style={{ fontWeight: 600 }}
                          >
                            Item
                          </th>
                          <th
                            className="text-left px-4 py-3 text-[11px] text-[#6B7280] uppercase tracking-wide"
                            style={{ fontWeight: 600 }}
                          >
                            Description
                          </th>
                          <th
                            className="text-right px-4 py-3 text-[11px] text-[#6B7280] uppercase tracking-wide"
                            style={{ fontWeight: 600 }}
                          >
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-[#E6E9F0]">
                          <td className="px-4 py-3 text-[13px] text-[#0A1D4D]">Ocean Freight</td>
                          <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                            {billing.particulars}
                          </td>
                          <td className="px-4 py-3 text-right text-[13px] text-[#0A1D4D]">
                            ₱{billing.amount.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="flex-1">
              <div className="bg-white border border-[#E6E9F0] rounded-[16px] p-6 sticky top-0">
                <h3
                  className="text-[#0A1D4D] mb-6"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                >
                  Billing Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Client
                    </p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {billing.client}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Date
                    </p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {billing.invoiceDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Linked Booking
                    </p>
                    <button
                      onClick={() => onOpenBooking?.(billing.bookingNo)}
                      className="text-[14px] text-[#0F5EFE] hover:underline"
                      style={{ fontWeight: 600 }}
                    >
                      {billing.bookingNo}
                    </button>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <span
                      className="inline-block px-3 py-1.5 rounded-full text-[11px]"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 600,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E6E9F0] pt-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[13px] text-[#6B7280]">Billed Amount</span>
                      <span className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                        ₱{billing.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[13px] text-[#6B7280]">Collected</span>
                      <span className="text-[13px] text-[#10b981]" style={{ fontWeight: 600 }}>
                        ₱{billing.collected.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-[#E6E9F0]">
                      <span className="text-[15px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                        Balance
                      </span>
                      <span
                        className="text-[18px]"
                        style={{
                          fontWeight: 700,
                          color: billing.balance > 0 ? "#EF4444" : "#10b981",
                        }}
                      >
                        ₱{billing.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div 
                  className="border-t border-[#E6E9F0] bg-white flex items-center justify-between"
                  style={{ 
                    height: '72px',
                    padding: '0 24px',
                    marginTop: '24px',
                    marginLeft: '-24px',
                    marginRight: '-24px',
                    marginBottom: '-24px',
                    gap: '24px'
                  }}
                >
                  {/* Left group - Utilities */}
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <Button
                      onClick={() => toast.success("Printing to SOA paper...")}
                      variant="ghost"
                      className="h-11 text-[14px] bg-white hover:bg-[#F9FAFB]"
                      style={{ fontWeight: 500, minWidth: '120px', borderRadius: '10px' }}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      onClick={() => toast.success("Downloading Excel invoice...")}
                      className="h-11 text-[14px] bg-[#0F766E] hover:bg-[#0D6560] text-white"
                      style={{ fontWeight: 500, minWidth: '160px', borderRadius: '10px' }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </Button>
                  </div>

                  {/* Right group - State-changing actions */}
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    {(billing.status === "Posted" || billing.status === "Partial") && (
                      <Button
                        onClick={() => toast.success("Marked as collected")}
                        variant="outline"
                        disabled={billing.status === "Paid"}
                        className="h-11 px-6 border-[#E6E9F0] text-[14px] bg-white hover:bg-[#F9FAFB]"
                        style={{ fontWeight: 500, minWidth: '148px', borderRadius: '10px' }}
                      >
                        Mark as Collected
                      </Button>
                    )}
                    <Button
                      onClick={() => toast.success("Billing saved")}
                      className="h-11 px-6 bg-[#F25C05] hover:bg-[#E55304] text-white text-[14px]"
                      style={{ fontWeight: 500, minWidth: '140px', borderRadius: '10px' }}
                    >
                      Save Billing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}