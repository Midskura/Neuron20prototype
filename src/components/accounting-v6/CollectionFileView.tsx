import React from "react";
import { X, Download, Printer, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { toast } from "../ui/toast-utils";

interface CollectionFileViewProps {
  collection: {
    id: string;
    collectionDate: string;
    receiptNo: string;
    client: string;
    company: string;
    paymentMethod: string;
    refNo: string;
    appliedTo: string[];
    amountReceived: number;
    status: "Fully Applied" | "Partially Applied" | "Unapplied";
  };
  onClose: () => void;
  onOpenBooking?: (bookingNo: string) => void;
}

const STATUS_STYLES = {
  "Fully Applied": { bg: "#E8F5E9", color: "#10b981", label: "Fully Applied" },
  "Partially Applied": { bg: "#FEF3C7", color: "#F59E0B", label: "Partially Applied" },
  "Unapplied": { bg: "#F3F4F6", color: "#6B7280", label: "Unapplied" },
};

// Mock invoice application data
const mockInvoiceApplications = [
  { invoiceNo: "IN-2025-001", bookingNo: "FCL-IMP-00012-SEA", amountApplied: 45000, remaining: 0 },
  { invoiceNo: "IN-2025-002", bookingNo: "LCL-EXP-00045-AIR", amountApplied: 30000, remaining: 15000 },
];

export function CollectionFileView({ collection, onClose, onOpenBooking }: CollectionFileViewProps) {
  const statusStyle = STATUS_STYLES[collection.status];
  
  // Calculate summary
  const totalReceived = collection.amountReceived;
  const totalApplied = mockInvoiceApplications.reduce((sum, inv) => sum + inv.amountApplied, 0);
  const unappliedBalance = totalReceived - totalApplied;

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
              Collection: {collection.receiptNo}
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1">
              Collection Date: {collection.collectionDate}
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
            {/* Left Column - Collection Details */}
            <div className="flex-[2]">
              <div className="bg-white border border-[#E6E9F0] rounded-[16px] p-6">
                <h3
                  className="text-[#0A1D4D] mb-6"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                >
                  Collection Details
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      OR / Receipt No.
                    </Label>
                    <Input
                      value={collection.receiptNo}
                      readOnly
                      className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Collection Date
                    </Label>
                    <Input
                      value={collection.collectionDate}
                      readOnly
                      className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Client
                    </Label>
                    <Input
                      value={collection.client}
                      readOnly
                      className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Company
                    </Label>
                    <Input
                      value={collection.company}
                      readOnly
                      className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Payment Method
                    </Label>
                    <Input
                      value={collection.paymentMethod}
                      readOnly
                      className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2 block">
                      Check No. / Bank Ref
                    </Label>
                    <Input
                      value={collection.refNo}
                      readOnly
                      className="h-11 bg-[#F9FAFB] border-[#E6E9F0]"
                    />
                  </div>
                </div>

                {/* Applied To Section */}
                <div className="mt-8">
                  <h4
                    className="text-[#0A1D4D] mb-4"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    Applied To Invoices
                  </h4>
                  <div className="border border-[#E6E9F0] rounded-[12px] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#FAFBFC] border-b border-[#E6E9F0]">
                          <th className="text-left py-3 px-4 text-[11px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                            Invoice No.
                          </th>
                          <th className="text-left py-3 px-4 text-[11px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                            Booking No.
                          </th>
                          <th className="text-right py-3 px-4 text-[11px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                            Amount Applied
                          </th>
                          <th className="text-right py-3 px-4 text-[11px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                            Remaining
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockInvoiceApplications.map((invoice, idx) => (
                          <tr key={idx} className="border-b border-[#E6E9F0] last:border-0">
                            <td className="py-3 px-4 text-[13px] text-[#0A1D4D]" style={{ fontWeight: 500 }}>
                              {invoice.invoiceNo}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => onOpenBooking?.(invoice.bookingNo)}
                                className="text-[13px] text-[#0F5EFE] hover:underline"
                                style={{ fontWeight: 500 }}
                              >
                                {invoice.bookingNo}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                              ₱{invoice.amountApplied.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-[13px]" style={{ fontWeight: 600, color: invoice.remaining > 0 ? "#B42318" : "#10b981" }}>
                              ₱{invoice.remaining.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="flex-1">
              <div className="bg-white border border-[#E6E9F0] rounded-[16px] p-6">
                <h3
                  className="text-[#0A1D4D] mb-6"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                >
                  Collection Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Client Name
                    </p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {collection.client}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Collection Date
                    </p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {collection.collectionDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Payment Method
                    </p>
                    <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      {collection.paymentMethod}
                    </p>
                  </div>

                  <div className="border-t border-[#E6E9F0] pt-4 mt-4">
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Total Received
                    </p>
                    <p className="text-[24px] text-[#10b981]" style={{ fontWeight: 700 }}>
                      ₱{totalReceived.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Total Applied
                    </p>
                    <p className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                      ₱{totalApplied.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">
                      Unapplied Balance
                    </p>
                    <p className="text-[16px]" style={{ fontWeight: 600, color: unappliedBalance > 0 ? "#F59E0B" : "#10b981" }}>
                      ₱{unappliedBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quick Action - Apply to Invoice */}
                <div className="mt-8">
                  <Button
                    onClick={() => toast.success("Opening invoice application...")}
                    className="w-full h-11 bg-[#F25C05] hover:bg-[#E55304] text-white rounded-lg"
                    style={{ fontWeight: 500, fontSize: "14px" }}
                  >
                    Apply to Invoice
                  </Button>
                </div>
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
                onClick={() => toast.success("Printing OR...")}
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
              {(collection.status === "Partially Applied" || collection.status === "Fully Applied") && (
                <Button
                  onClick={() => toast.success("Marked as applied")}
                  variant="outline"
                  disabled={collection.status === "Fully Applied"}
                  className="h-11 px-6 border-[#E6E9F0] text-[14px]"
                  style={{ fontWeight: 500, minWidth: '148px', borderRadius: '10px' }}
                >
                  Mark as Applied
                </Button>
              )}
              <Button
                onClick={() => toast.success("Collection saved")}
                className="h-11 px-6 bg-[#F25C05] hover:bg-[#E55304] text-white text-[14px]"
                style={{ fontWeight: 500, minWidth: '140px', borderRadius: '10px' }}
              >
                Save Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
