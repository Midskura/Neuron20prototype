import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import { Button } from "../ui/button";
import { Printer, X } from "lucide-react";
import { EntryStatus } from "./StatusPill";
import { getCompanyById } from "./companies";

interface PrintRFPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: {
    id: string;
    payee?: string;
    amount: number;
    category: string;
    company: string;
    bookingNo?: string;
    note: string;
    date: string;
    paymentMethod?: string;
    status: EntryStatus;
    requestedBy?: string;
    requestedDate?: string;
    approvedBy?: string;
    approvedDate?: string;
    isNoBooking?: boolean;
  };
}

export function PrintRFPModal({ open, onOpenChange, entry }: PrintRFPModalProps) {
  const companyData = getCompanyById(entry.company);
  const companyName = companyData?.name || entry.company;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const amountInWords = (amount: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (amount === 0) return "Zero Pesos";

    let num = Math.floor(amount);
    const cents = Math.round((amount - num) * 100);

    let words = "";

    if (num >= 1000000) {
      words += ones[Math.floor(num / 1000000)] + " Million ";
      num %= 1000000;
    }

    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      if (thousands >= 100) {
        words += ones[Math.floor(thousands / 100)] + " Hundred ";
        const remaining = thousands % 100;
        if (remaining >= 20) {
          words += tens[Math.floor(remaining / 10)] + " ";
          words += ones[remaining % 10] + " ";
        } else if (remaining >= 10) {
          words += teens[remaining - 10] + " ";
        } else {
          words += ones[remaining] + " ";
        }
      } else if (thousands >= 20) {
        words += tens[Math.floor(thousands / 10)] + " ";
        words += ones[thousands % 10] + " ";
      } else if (thousands >= 10) {
        words += teens[thousands - 10] + " ";
      } else {
        words += ones[thousands] + " ";
      }
      words += "Thousand ";
      num %= 1000;
    }

    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }

    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + " ";
      words += ones[num % 10] + " ";
    } else if (num >= 10) {
      words += teens[num - 10] + " ";
    } else if (num > 0) {
      words += ones[num] + " ";
    }

    words += "Pesos";

    if (cents > 0) {
      words += ` and ${cents}/100`;
    }

    return words.trim();
  };

  const handlePrint = () => {
    window.print();
  };

  const showWatermark = entry.status === "pending" || entry.status === "draft";
  const showPostedStamp = entry.status === "posted" && entry.approvedDate;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[960px] w-[min(960px,92vw)] max-h-[88vh] p-0 gap-0 border-[#E5E7EB] rounded-2xl flex flex-col print:max-w-none print:w-full print:max-h-none print:h-auto print:border-0 print:rounded-none [&>button]:print:hidden"
          style={{ boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
          aria-describedby={undefined}
        >
          <VisuallyHidden>
            <DialogTitle>Request for Payment</DialogTitle>
          </VisuallyHidden>
          {/* Header - hidden when printing */}
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0 print:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-[#0A1D4D]" style={{ fontSize: "18px", fontWeight: 700 }}>
                Request for Payment
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handlePrint}
                  className="h-10 px-4 bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-[10px]"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                  aria-label="Print RFP"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] rounded-[10px]"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0" 
            id="rfp-print-content"
          >
            {/* Print-only wrapper for A4 sizing */}
            <div className="print:w-[210mm] print:min-h-[297mm] print:p-[16mm] print:mx-auto print:bg-white relative">
              {/* Watermark */}
              {showWatermark && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none print:flex"
                  style={{
                    transform: "rotate(-45deg)",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "72px",
                      fontWeight: 900,
                      color: "rgba(0, 0, 0, 0.05)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    NOT APPROVED
                  </div>
                </div>
              )}

              {/* Posted stamp */}
              {showPostedStamp && (
                <div
                  className="absolute top-12 right-12 px-4 py-2 border-4 border-[#059669] rounded-lg transform rotate-12 print:block"
                  style={{ zIndex: 1 }}
                >
                  <div className="text-[#059669]" style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "0.05em" }}>
                    POSTED
                  </div>
                  <div className="text-[#059669] text-center" style={{ fontSize: "10px", fontWeight: 600 }}>
                    {entry.approvedDate && formatDate(entry.approvedDate)}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative" style={{ zIndex: 2 }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-[#E5E7EB] print:mb-8 print:pb-6">
                  <div>
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 bg-[#0A1D4D] text-white rounded-lg mb-2"
                      style={{ fontSize: "24px", fontWeight: 900 }}
                    >
                      JJB
                    </div>
                  </div>
                  <div className="text-right">
                    <h1
                      className="text-[#0A1D4D] mb-1"
                      style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: "1.2" }}
                    >
                      REQUEST FOR PAYMENT
                    </h1>
                    <p className="text-[#6B7280]" style={{ fontSize: "14px", fontWeight: 500 }}>
                      {companyName} • Generated from JJB OS
                    </p>
                  </div>
                </div>

                {/* Payee & Amount */}
                <div className="mb-4 p-4 border border-[#E5E7EB] rounded-lg print:mb-6 print:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
                    <div>
                      <p className="text-[#6B7280] mb-2" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        PAYEE
                      </p>
                      <p className="text-[#0A1D4D]" style={{ fontSize: "18px", fontWeight: 700 }}>
                        {entry.payee || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B7280] mb-2" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        AMOUNT
                      </p>
                      <p className="text-[#0A1D4D]" style={{ fontSize: "24px", fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
                        ₱{entry.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[#6B7280] mt-1" style={{ fontSize: "13px", fontWeight: 500, fontStyle: "italic" }}>
                        {amountInWords(entry.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expense Details */}
                <div className="mb-4 p-4 border border-[#E5E7EB] rounded-lg print:mb-6 print:p-6">
                  <h3 className="text-[#0A1D4D] mb-3" style={{ fontSize: "16px", fontWeight: 700 }}>
                    Expense Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-4">
                    <div>
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        CATEGORY
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
                        {entry.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        DATE
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
                        {formatDate(entry.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        PAYMENT METHOD
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
                        {entry.paymentMethod || "Cash"}
                      </p>
                    </div>
                  </div>
                  {entry.note && (
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB] print:mt-4 print:pt-4">
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        PURPOSE / NOTE
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.6" }}>
                        {entry.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Booking Link */}
                <div className="mb-4 p-4 border border-[#E5E7EB] rounded-lg print:mb-6 print:p-6">
                  <h3 className="text-[#0A1D4D] mb-3" style={{ fontSize: "16px", fontWeight: 700 }}>
                    Booking Link
                  </h3>
                  {entry.isNoBooking ? (
                    <p className="text-[#6B7280]" style={{ fontSize: "14px", fontWeight: 500, fontStyle: "italic" }}>
                      General expense (no booking)
                    </p>
                  ) : entry.bookingNo ? (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#F3F4F6] rounded-lg print:bg-[#F3F4F6]">
                      <span className="text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Booking No:
                      </span>
                      <span className="text-[#0A1D4D] font-mono" style={{ fontSize: "14px", fontWeight: 700 }}>
                        {entry.bookingNo}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#6B7280]" style={{ fontSize: "14px", fontWeight: 500, fontStyle: "italic" }}>
                      No booking linked
                    </p>
                  )}
                </div>

                {/* Cost Center, Account, Due Date, Terms - Placeholder Card */}
                <div className="mb-4 p-4 border border-[#E5E7EB] rounded-lg print:mb-6 print:p-6">
                  <h3 className="text-[#0A1D4D] mb-3" style={{ fontSize: "16px", fontWeight: 700 }}>
                    Payment Terms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-4">
                    <div>
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        COST CENTER
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
                        —
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        ACCOUNT TO CREDIT
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
                        {entry.paymentMethod || "Cash"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        DUE DATE
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
                        —
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B7280] mb-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        TERMS
                      </p>
                      <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 600 }}>
                        Net 7
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="mb-4 p-4 border border-[#E5E7EB] rounded-lg print:mb-6 print:p-6">
                  <h3 className="text-[#0A1D4D] mb-3" style={{ fontSize: "16px", fontWeight: 700 }}>
                    Attachments
                  </h3>
                  <p className="text-[#6B7280]" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Receipts attached in system.
                  </p>
                </div>

                {/* Signatures Grid */}
                <div className="mb-4 p-4 border border-[#E5E7EB] rounded-lg print:mb-6 print:p-6">
                  <h3 className="text-[#0A1D4D] mb-4" style={{ fontSize: "16px", fontWeight: 700 }}>
                    Signatures
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-8">
                    {/* Prepared By */}
                    <div>
                      <p className="text-[#6B7280] mb-3" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        PREPARED BY
                      </p>
                      <p className="text-[#374151] mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
                        {entry.requestedBy || "Accountant"}
                      </p>
                      <p className="text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                        {entry.requestedDate ? formatDate(entry.requestedDate) : formatDate(entry.date)}
                      </p>
                      <div className="mt-4 pt-8 border-t border-[#D1D5DB]">
                        <p className="text-[#9CA3AF] text-center" style={{ fontSize: "11px", fontWeight: 500 }}>
                          Signature
                        </p>
                      </div>
                    </div>

                    {/* Verified By */}
                    <div>
                      <p className="text-[#6B7280] mb-3" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        VERIFIED BY
                      </p>
                      <p className="text-[#374151] mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
                        —
                      </p>
                      <p className="text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                        —
                      </p>
                      <div className="mt-4 pt-8 border-t border-[#D1D5DB]">
                        <p className="text-[#9CA3AF] text-center" style={{ fontSize: "11px", fontWeight: 500 }}>
                          Signature
                        </p>
                      </div>
                    </div>

                    {/* Approved By */}
                    <div>
                      <p className="text-[#6B7280] mb-3" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        APPROVED BY
                      </p>
                      {entry.approvedBy && entry.approvedDate ? (
                        <>
                          <p className="text-[#374151] mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
                            {entry.approvedBy}
                          </p>
                          <p className="text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                            {formatDate(entry.approvedDate)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[#6B7280] mb-1" style={{ fontSize: "14px", fontWeight: 500, fontStyle: "italic" }}>
                            Pending approval
                          </p>
                          <p className="text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                            —
                          </p>
                        </>
                      )}
                      <div className="mt-4 pt-8 border-t border-[#D1D5DB]">
                        <p className="text-[#9CA3AF] text-center" style={{ fontSize: "11px", fontWeight: 500 }}>
                          Signature
                        </p>
                      </div>
                    </div>

                    {/* Received By */}
                    <div>
                      <p className="text-[#6B7280] mb-3" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        RECEIVED BY
                      </p>
                      <p className="text-[#374151] mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
                        —
                      </p>
                      <p className="text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                        —
                      </p>
                      <div className="mt-4 pt-8 border-t border-[#D1D5DB]">
                        <p className="text-[#9CA3AF] text-center" style={{ fontSize: "11px", fontWeight: 500 }}>
                          Signature
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="p-4 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] print:bg-[#F9FAFB]">
                  <p className="text-[#6B7280]" style={{ fontSize: "13px", fontWeight: 500 }}>
                    All amounts in PHP.
                  </p>
                </div>

                {/* Document Footer */}
                <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center print:mt-8 print:pt-6">
                  <p className="text-[#9CA3AF]" style={{ fontSize: "11px", fontWeight: 500 }}>
                    Document ID: {entry.id} • Generated on {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:flex {
            display: flex !important;
          }
          
          .print\\:overflow-visible {
            overflow: visible !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:max-w-none {
            max-width: none !important;
          }
          
          .print\\:w-full {
            width: 100% !important;
          }
          
          .print\\:max-h-none {
            max-height: none !important;
          }
          
          .print\\:h-auto {
            height: auto !important;
          }
          
          .print\\:border-0 {
            border: 0 !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:w-\\[210mm\\] {
            width: 210mm !important;
          }
          
          .print\\:min-h-\\[297mm\\] {
            min-height: 297mm !important;
          }
          
          .print\\:p-\\[16mm\\] {
            padding: 16mm !important;
          }
          
          .print\\:mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
          
          .print\\:bg-\\[\\#F3F4F6\\] {
            background-color: #F3F4F6 !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .print\\:mb-8 {
            margin-bottom: 2rem !important;
          }
          
          .print\\:pb-6 {
            padding-bottom: 1.5rem !important;
          }
          
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          
          .print\\:gap-6 {
            gap: 1.5rem !important;
          }
          
          .print\\:gap-8 {
            gap: 2rem !important;
          }
          
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          .print\\:gap-4 {
            gap: 1rem !important;
          }
          
          .print\\:mt-4 {
            margin-top: 1rem !important;
          }
          
          .print\\:pt-4 {
            padding-top: 1rem !important;
          }
          
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
          
          .print\\:pt-6 {
            padding-top: 1.5rem !important;
          }
          
          /* Hide modal overlay/scrim */
          [data-radix-dialog-overlay] {
            display: none !important;
          }
          
          /* Ensure borders are black in print */
          .border,
          .border-t,
          .border-b,
          .border-l,
          .border-r {
            border-color: #000 !important;
          }
          
          /* Remove shadows in print */
          * {
            box-shadow: none !important;
          }
          
          /* Remove rounded corners for professional print look */
          * {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
