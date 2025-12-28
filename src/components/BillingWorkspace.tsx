import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Plus,
  Download,
  Printer,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Eye,
  ArrowLeft,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { toast } from "./ui/toast-utils";
import { cn } from "./ui/utils";
import soaPreviewImage from "figma:asset/cadd27785e3e0f20f21ec188e68ffe711c6ea850.png";

/**
 * BILLING WORKSPACE - EXPORT RULES
 * 
 * This component manages billings for bookings and supports two export formats:
 * 
 * 1. "Download Excel Invoice" - Uses the CCE Excel template (photo reference)
 *    - Maps to: Client, Details of Cargo, Particular Charges, Grand Total
 *    - Fields: billTo/attentionTo, clientAddress, billingDate, destination, commodity, 
 *              measurement, line items, total, payment details (Bank, Account, Branch, Swift)
 * 
 * 2. "Print to SOA Paper" - Uses pre-printed CCE Statement of Account (photo reference)
 *    - Aligns to pre-printed form fields: Name, Address, Date, Terms, TIN, QTY/UNIT/ARTICLES, Total
 * 
 * IMPORTANT:
 * - Form fields from the left editor are the single source of truth
 * - If Payment Details are edited, those values override the default bank footer in both Excel and SOA print
 * - Posted billings can still be exported/printed
 */

interface Booking {
  id: string;
  trackingNo: string;
  client: string;
  pickup: string;
  dropoff: string;
  deliveryType?: "Import" | "Export" | "Domestic";
}

interface BillingLineItem {
  id: string;
  description: string;
  amount: number;
}

interface Billing {
  id: string;
  billingNo: string;
  date: string;
  description: string;
  amount: number;
  status: "Draft" | "Ready to print" | "Posted";
  clientName: string;
  billTo?: string;
  clientAddress: string;
  bookingRef: string;
  notes?: string;
  destination?: string;
  commodity?: string;
  measurement?: string;
  lineItems: BillingLineItem[];
  paymentDetails?: {
    bankName: string;
    accountName: string;
    accountNo: string;
    branch: string;
    swiftCode: string;
  };
}

interface BillingWorkspaceProps {
  booking: Booking;
  billings: Billing[];
  onCreateBilling: (billing: Partial<Billing>) => void;
  onUpdateBilling: (id: string, updates: Partial<Billing>) => void;
  onDeleteBilling: (id: string) => void;
  onDownloadExcel: (billing: Billing) => void;
  onPrintSOA: (billing: Billing) => void;
  onPostToAccounting: (billing: Billing) => void;
}

// Status pill component
function BillingStatusPill({ status }: { status: Billing["status"] }) {
  const statusConfig: Record<Billing["status"], { color: string; bg: string }> = {
    "Draft": { color: "#0F766E", bg: "#E8F2EE" },
    "Ready to print": { color: "#10B981", bg: "#D1FAE5" },
    "Posted": { color: "#667085", bg: "#F3F4F6" },
  };

  const config = statusConfig[status];

  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px]"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 500,
      }}
    >
      {status}
    </div>
  );
}

// Inline Billing Editor Component
function BillingEditor({
  booking,
  billing,
  onSave,
  onCancel,
  mode = "create",
}: {
  booking: Booking;
  billing?: Billing;
  onSave: (billing: Partial<Billing>) => void;
  onCancel: () => void;
  mode?: "create" | "view";
}) {
  const [formData, setFormData] = useState<Partial<Billing>>(
    billing || {
      clientName: booking.client,
      billTo: "",
      clientAddress: "",
      date: new Date().toISOString().split("T")[0],
      billingNo: `BIL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      bookingRef: booking.trackingNo,
      notes: "Kindly make check payable to CONFORME CARGO EXPRESS",
      destination: "",
      commodity: "",
      measurement: "",
      lineItems: [
        {
          id: "1",
          description: "Door-door rate (Pickup, Freight, Permits/Lodgement & Customs Formalities)",
          amount: 82500,
        },
      ],
      paymentDetails: {
        bankName: "BDO",
        accountName: "CONFORME CARGO EXPRESS",
        accountNo: "0014-8803-0454",
        branch: "SM City Sucat A",
        swiftCode: "BNORPHMM",
      },
      status: "Draft",
    }
  );

  const [isEditing, setIsEditing] = useState(mode === "create");
  const [showSOAPreview, setShowSOAPreview] = useState(false);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const isPosted = billing?.status === "Posted";
  const canEdit = isEditing && !isPosted;

  const addLineItem = () => {
    const newLineItem: BillingLineItem = {
      id: String(Date.now()),
      description: "",
      amount: 0,
    };
    setFormData({
      ...formData,
      lineItems: [...(formData.lineItems || []), newLineItem],
    });
  };

  const updateLineItem = (id: string, updates: Partial<BillingLineItem>) => {
    const lineItems = formData.lineItems || [];
    const updatedItems = lineItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );

    setFormData({ ...formData, lineItems: updatedItems });
  };

  const deleteLineItem = (id: string) => {
    setFormData({
      ...formData,
      lineItems: (formData.lineItems || []).filter((item) => item.id !== id),
    });
  };

  const calculateTotal = () => {
    return (formData.lineItems || []).reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSave = (generateInvoice: boolean = false) => {
    const totalAmount = calculateTotal();
    const savedBilling = {
      ...formData,
      amount: totalAmount,
      description: formData.lineItems?.[0]?.description || "Freight and handling",
    };

    if (generateInvoice) {
      onSave({ ...savedBilling, status: "Ready to print" });
      toast.success("Billing saved and invoice generated!");
    } else {
      onSave({ ...savedBilling, status: "Draft" });
      toast.success("Billing saved as draft");
    }
  };

  return (
    <div>
      {/* Title Header */}
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-[#12332B] mb-1">
          {mode === "create" ? "Create Billing" : `Billing: ${billing?.billingNo}`}
        </h3>
        <p className="text-[11px] text-[#667085]">
          {mode === "create"
            ? `This billing will be linked to Booking: ${booking.trackingNo}`
            : `Linked to Booking: ${booking.trackingNo}`}
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Main Form (8 columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Section 1: Billing & Client Information */}
          <Card className="p-4 border border-[#E5E9F0]">
            <h3 className="text-[13px] font-medium text-[#12332B] mb-4">
              Billing & Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <Label className="text-[13px] text-[#667085] mb-2 block" style={{ fontWeight: 500 }}>
                  Client Name
                </Label>
                <Input
                  value={formData.clientName}
                  disabled
                  className="rounded-lg border-[#E5E7EB] text-[13px] bg-[#F9FAFB]"
                  style={{ height: "44px" }}
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Billing Date
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Bill To / Attention To
                </Label>
                <Input
                  value={formData.billTo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, billTo: e.target.value })
                  }
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., Mr. Sandesh Mhatre"
                />
                <p className="text-[12px] text-[#9CA3AF] mt-1.5">
                  This name will appear on the SOA / invoice header.
                </p>
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Billing No.
                </Label>
                <Input
                  value={formData.billingNo}
                  disabled
                  className="rounded-lg border-[#E5E7EB] text-[13px] bg-[#F9FAFB]"
                  style={{ height: "44px" }}
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Client Address / Location
                </Label>
                <Input
                  value={formData.clientAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, clientAddress: e.target.value })
                  }
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., MAHARASHTRA, INDIA"
                />
              </div>
              <div></div>
              <div className="md:col-span-2">
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Booking Ref
                </Label>
                <Input
                  value={formData.bookingRef}
                  disabled
                  className="rounded-lg border-[#E5E7EB] text-[13px] bg-[#F9FAFB]"
                  style={{ height: "44px" }}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Notes / Remarks <span className="text-[#9CA3AF] font-normal">(Optional)</span>
                </Label>
                <Input
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., Kindly make check payable to CONFORME CARGO EXPRESS"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Details of Cargo */}
          <Card className="p-4 bg-[#F9FAFB] border border-[#E5E9F0]">
            <h3 className="text-[13px] font-medium text-[#12332B] mb-4">
              Details of Cargo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label className="text-[13px] text-[#667085] mb-2 block" style={{ fontWeight: 500 }}>
                  Destination
                </Label>
                <Input
                  value={formData.destination || ""}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px] bg-white"
                  style={{ height: "44px" }}
                  placeholder="e.g., Manila, Philippines"
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#667085] mb-2 block" style={{ fontWeight: 500 }}>
                  Commodity
                </Label>
                <Input
                  value={formData.commodity || ""}
                  onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px] bg-white"
                  style={{ height: "44px" }}
                  placeholder="e.g., Personal Household Items"
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#667085] mb-2 block" style={{ fontWeight: 500 }}>
                  Measurement
                </Label>
                <Input
                  value={formData.measurement || ""}
                  onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px] bg-white"
                  style={{ height: "44px" }}
                  placeholder="e.g., 10 bxs"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] mt-4">
              These fields will appear under "Details of Cargo" in the invoice.
            </p>
          </Card>

          {/* Section 3: Particular Charges */}
          <Card className="p-4 border border-[#E5E9F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-medium text-[#12332B]">
                Particular Charges
              </h3>
              {canEdit && (
                <Button
                  onClick={addLineItem}
                  variant="ghost"
                  className="text-[#0F766E] hover:bg-[#E8F2EE] rounded-lg h-9 px-3 text-[13px]"
                  style={{ fontWeight: 500 }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add charge
                </Button>
              )}
            </div>

            {/* Charges List */}
            <div className="space-y-3 mb-6">
              {(formData.lineItems || []).map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
                >
                  <div className="md:col-span-8">
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, { description: e.target.value })
                      }
                      disabled={!canEdit}
                      className="rounded-lg border-[#E5E7EB] text-[13px] resize-none w-full"
                      style={{ minHeight: "44px" }}
                      placeholder="Description of charge or service"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateLineItem(item.id, { amount: Number(e.target.value) })
                      }
                      disabled={!canEdit}
                      className="rounded-lg border-[#E5E7EB] text-[13px] text-right"
                      style={{ height: "44px" }}
                      placeholder="0.00"
                    />
                  </div>
                  {canEdit && (
                    <div className="md:col-span-1 flex items-center justify-center">
                      <Button
                        onClick={() => deleteLineItem(item.id)}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-[#FEE2E2] hover:text-[#EF4444] rounded-lg"
                        disabled={(formData.lineItems || []).length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="flex justify-end pt-4 border-t-2 border-[#0A1D4D]">
              <div style={{ width: "280px" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                    Grand Total
                  </span>
                  <span className="text-[18px] text-[#0F172A]" style={{ fontWeight: 700 }}>
                    ₱{calculateTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 4: Payment Details */}
          <Card className="p-4 border border-[#E5E7EB]">
            <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4">
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Bank Name
                </Label>
                <Input
                  value={formData.paymentDetails?.bankName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDetails: {
                        ...formData.paymentDetails!,
                        bankName: e.target.value,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., BDO"
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Account Name
                </Label>
                <Input
                  value={formData.paymentDetails?.accountName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDetails: {
                        ...formData.paymentDetails!,
                        accountName: e.target.value,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., CONFORME CARGO EXPRESS"
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Account No.
                </Label>
                <Input
                  value={formData.paymentDetails?.accountNo || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDetails: {
                        ...formData.paymentDetails!,
                        accountNo: e.target.value,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., 0014-8803-0454"
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Branch
                </Label>
                <Input
                  value={formData.paymentDetails?.branch || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDetails: {
                        ...formData.paymentDetails!,
                        branch: e.target.value,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., SM City Sucat A"
                />
              </div>
              <div>
                <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                  Swift Code
                </Label>
                <Input
                  value={formData.paymentDetails?.swiftCode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDetails: {
                        ...formData.paymentDetails!,
                        swiftCode: e.target.value,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="rounded-lg border-[#E5E7EB] text-[13px]"
                  style={{ height: "44px" }}
                  placeholder="e.g., BNORPHMM"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] mt-5">
              These will appear in the printed invoice.
            </p>
          </Card>
        </div>

        {/* Right Column - Summary & Actions (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Billing Summary Card */}
          <Card className="p-4 border border-[#E5E7EB]">
            <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4">
              Billing Summary
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Client Name</p>
                <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 500 }}>
                  {formData.clientName}
                </p>
                {formData.billTo && (
                  <p className="text-[12px] text-[#64748B] mt-0.5">
                    Attn: {formData.billTo}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Date</p>
                <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 500 }}>
                  {formData.date}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Linked Booking</p>
                <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 500 }}>
                  {formData.bookingRef}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Status</p>
                <BillingStatusPill status={formData.status || "Draft"} />
              </div>
              <div className="pt-3 border-t border-[#E5E7EB]">
                <p className="text-[11px] text-[#9CA3AF] mb-1">Total Amount</p>
                <p className="text-[18px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                  ₱{calculateTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions Card */}
          <Card className="p-4 border border-[#E5E7EB]">
            <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              {canEdit ? (
                <>
                  <Button
                    onClick={() => handleSave(true)}
                    className="w-full bg-[#0F766E] hover:bg-[#0D6860] text-white rounded-lg text-[13px]"
                    style={{ height: "44px", fontWeight: 600 }}
                  >
                    Save & Generate Invoice
                  </Button>
                  <Button
                    onClick={() => handleSave(false)}
                    variant="outline"
                    className="w-full border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg text-[13px]"
                    style={{ height: "44px", fontWeight: 500 }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={onCancel}
                    variant="ghost"
                    className="w-full text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg text-[13px]"
                    style={{ height: "44px" }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {/* Download Excel Invoice */}
                  <Button
                    onClick={() => setShowExcelPreview(true)}
                    variant="outline"
                    className="w-full border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg text-[13px]"
                    style={{ height: "44px" }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Download Excel Invoice
                  </Button>

                  {/* Print to SOA Paper */}
                  <Button
                    onClick={() => {
                      if (billing) {
                        window.print();
                        toast.success("Opening print dialog...");
                      }
                    }}
                    variant="outline"
                    className="w-full border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg text-[13px]"
                    style={{ height: "44px" }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print to SOA Paper
                  </Button>

                  {/* Post to Accounting */}
                  {!isPosted && (
                    <Button
                      onClick={() => {
                        if (billing) {
                          toast.success("Posted to accounting!");
                        }
                      }}
                      className="w-full bg-[#0F766E] hover:bg-[#0D6860] text-white rounded-lg text-[13px]"
                      style={{ height: "44px", fontWeight: 600 }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Post to Accounting
                    </Button>
                  )}

                  {/* Back to List */}
                  <Button
                    onClick={onCancel}
                    variant="ghost"
                    className="w-full text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg text-[13px]"
                    style={{ height: "44px" }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Excel Invoice Preview Modal - Hard-coded Static Layout */}
      {showExcelPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
          onClick={() => setShowExcelPreview(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl flex flex-col"
            style={{ width: "1220px", height: "720px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white z-20">
              <div>
                <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-1">
                  Excel Invoice Preview
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  This is how it will appear in the exported .xlsx file.
                </p>
              </div>
              <Button
                onClick={() => setShowExcelPreview(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-[#F9FAFB]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Sheet Container - Scrollable with Clipping */}
            <div className="flex-1 overflow-hidden bg-[#E8EAED] relative">
              <div className="h-full flex overflow-hidden">
                {/* Row Numbers Column - Fixed */}
                <div className="w-12 bg-[#F8FAFC] border-r border-[#D1D5DB] flex-shrink-0 overflow-hidden">
                  <div className="h-[30px] border-b border-[#D1D5DB] sticky top-0 bg-[#F8FAFC] z-10"></div>
                  <div className="overflow-y-auto" style={{ height: "calc(100% - 30px)" }}>
                    {Array.from({ length: 50 }, (_, i) => (
                      <div
                        key={i}
                        className="h-[36px] border-b border-[#E5E7EB] flex items-center justify-center text-[11px] text-[#64748B]"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Sheet Area - Scrollable */}
                <div className="flex-1 overflow-auto">
                  {/* Column Headers - Sticky */}
                  <div className="h-[30px] bg-[#F8FAFC] border-b border-[#D1D5DB] flex sticky top-0 z-10">
                    {["A", "B", "C", "D", "E", "F", "G", "H"].map((col, idx) => (
                      <div
                        key={col}
                        className="flex items-center justify-center text-[11px] text-[#64748B] border-r border-[#E5E7EB] flex-shrink-0"
                        style={{ 
                          width: idx === 0 ? "100px" : idx === 7 ? "120px" : "140px"
                        }}
                      >
                        {col}
                      </div>
                    ))}
                  </div>

                  {/* Sheet Grid - 8 Column Layout */}
                  <div className="bg-white">
                    {/* Grid System - 8 Columns */}
                    <div className="grid grid-cols-8 border-l border-[#E5E7EB]">
                      {/* Row 1: Empty */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`r1-${i}`}
                          className="border-r border-b border-[#E5E7EB] h-[36px]"
                          style={{ 
                            width: i === 0 ? "100px" : i === 7 ? "120px" : "140px"
                          }}
                        ></div>
                      ))}

                      {/* Row 2-3: Bill To (spans A-F) and Date (H) */}
                      <div className="col-span-6 border-r border-b border-[#E5E7EB] p-3" style={{ minHeight: "72px" }}>
                        <p className="text-[16px] text-[#0F172A]" style={{ fontWeight: 700 }}>
                          MR. SANDESH MHATRE
                        </p>
                        <p className="text-[13px] text-[#475569] mt-1" style={{ fontWeight: 500 }}>
                          MAHARASHTRA, INDIA
                        </p>
                      </div>
                      <div className="border-r border-b border-[#E5E7EB]"></div>
                      <div className="border-r border-b border-[#E5E7EB] p-3 flex items-start justify-end">
                        <p className="text-[13px] text-[#0F172A]" style={{ fontWeight: 700 }}>
                          4/21/2025
                        </p>
                      </div>

                      {/* Row 4: Empty */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`r4-${i}`}
                          className="border-r border-b border-[#E5E7EB] h-[36px]"
                        ></div>
                      ))}

                      {/* Row 5-8: Details of Cargo (spans A-H) */}
                      <div className="col-span-8 border-r border-b border-[#E5E7EB] p-3" style={{ minHeight: "144px" }}>
                        <p className="text-[12px] text-[#475569] mb-3 uppercase tracking-wide" style={{ fontWeight: 700 }}>
                          DETAILS OF CARGO
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <span className="text-[12px] text-[#64748B] w-32" style={{ fontWeight: 600 }}>Destination:</span>
                            <span className="text-[13px] text-[#0F172A]" style={{ fontWeight: 500 }}>Manila-Singapore</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-[12px] text-[#64748B] w-32" style={{ fontWeight: 600 }}>Commodity:</span>
                            <span className="text-[13px] text-[#0F172A]" style={{ fontWeight: 500 }}>Personal Household Items</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-[12px] text-[#64748B] w-32" style={{ fontWeight: 600 }}>Measurement:</span>
                            <span className="text-[13px] text-[#0F172A]" style={{ fontWeight: 500 }}>10 bxs</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 9: Empty */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`r9-${i}`}
                          className="border-r border-b border-[#E5E7EB] h-[36px]"
                        ></div>
                      ))}

                      {/* Row 10: Particular Charges Header (A-H) */}
                      <div className="col-span-7 border-r border-b border-[#CBD5E1] p-3 flex items-center" style={{ height: "40px" }}>
                        <p className="text-[12px] text-[#0F172A] uppercase tracking-wide" style={{ fontWeight: 700 }}>
                          PARTICULAR CHARGES
                        </p>
                      </div>
                      <div className="border-r border-b border-[#CBD5E1] p-3 flex items-center justify-end" style={{ height: "40px" }}>
                        <p className="text-[12px] text-[#0F172A] uppercase tracking-wide" style={{ fontWeight: 700 }}>
                          AMOUNT
                        </p>
                      </div>

                      {/* Row 11-12: Door-Door Rate (A-F) and Amount (H) */}
                      <div className="col-span-6 border-r border-b border-[#E5E7EB] p-3" style={{ minHeight: "72px" }}>
                        <p className="text-[13px] text-[#0F172A] mb-1" style={{ fontWeight: 700 }}>
                          DOOR-DOOR RATE
                        </p>
                        <p className="text-[12px] text-[#475569]">
                          (Pickup, Freight, Permits/Lodgement & Customs Formalities)
                        </p>
                      </div>
                      <div className="border-r border-b border-[#E5E7EB]"></div>
                      <div className="border-r border-b border-[#E5E7EB] p-3 flex items-center justify-end">
                        <p className="text-[13px] text-[#0F172A]" style={{ fontWeight: 700 }}>
                          ₱82,500.00
                        </p>
                      </div>

                      {/* Row 13: Divider */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`r13-${i}`}
                          className="border-r border-b border-[#E2E8F0] h-[12px]"
                        ></div>
                      ))}

                      {/* Row 14: Empty */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`r14-${i}`}
                          className="border-r border-b border-[#E5E7EB] h-[36px]"
                        ></div>
                      ))}

                      {/* Row 15: Grand Total (A-H, horizontal layout) */}
                      <div className="col-span-8 border-r border-b border-[#E5E7EB] px-3 py-3 flex items-center justify-between" style={{ height: "48px" }}>
                        <p className="text-[12px] text-[#0F172A] uppercase tracking-wide" style={{ fontWeight: 700 }}>
                          GRAND TOTAL
                        </p>
                        <p className="text-[16px] text-[#0F172A]" style={{ fontWeight: 700 }}>
                          ₱82,500.00
                        </p>
                      </div>

                      {/* Row 16: Empty */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`r16-${i}`}
                          className="border-r border-b border-[#E5E7EB] h-[36px]"
                        ></div>
                      ))}

                      {/* Row 17-22: Payment Details (A-H) */}
                      <div className="col-span-8 border-r border-b border-[#E5E7EB] p-3" style={{ minHeight: "216px" }}>
                        <p className="text-[12px] text-[#0F172A] mb-4">
                          Kindly make check payable to "CONFORME CARGO EXPRESS"
                        </p>
                        <div className="space-y-1.5 text-[12px]">
                          <div className="flex">
                            <span className="text-[#0F172A] w-36" style={{ fontWeight: 700 }}>BANK NAME:</span>
                            <span className="text-[#0F172A]">BDO</span>
                          </div>
                          <div className="flex">
                            <span className="text-[#0F172A] w-36" style={{ fontWeight: 700 }}>ACCOUNT NAME:</span>
                            <span className="text-[#0F172A]">CONFORME CARGO EXPRESS</span>
                          </div>
                          <div className="flex">
                            <span className="text-[#0F172A] w-36" style={{ fontWeight: 700 }}>ACCOUNT NO.:</span>
                            <span className="text-[#0F172A]">0014-8803-0454</span>
                          </div>
                          <div className="flex">
                            <span className="text-[#0F172A] w-36" style={{ fontWeight: 700 }}>BRANCH:</span>
                            <span className="text-[#0F172A]">SM City Sucat A</span>
                          </div>
                          <div className="flex">
                            <span className="text-[#0F172A] w-36" style={{ fontWeight: 700 }}>SWIFT CODE:</span>
                            <span className="text-[#0F172A]">BNORPHMM</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Empty Rows for scrolling */}
                      {Array.from({ length: 10 }).map((_, rowIdx) =>
                        Array.from({ length: 8 }).map((_, colIdx) => (
                          <div
                            key={`extra-r${rowIdx}-c${colIdx}`}
                            className="border-r border-b border-[#E5E7EB] h-[36px]"
                          ></div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0 bg-white z-20">
              <Button
                onClick={() => setShowExcelPreview(false)}
                variant="ghost"
                className="h-10 px-4 text-[13px] text-[#6B7280] hover:bg-[#F9FAFB]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowExcelPreview(false);
                  toast.success(
                    "Excel invoice generated",
                    `Saved as Invoice_${formData.bookingRef}.xlsx`
                  );
                }}
                className="h-10 px-6 text-[13px] bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg"
                style={{ fontWeight: 600 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download .xlsx
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SOA Preview Overlay */}
      {showSOAPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end"
          onClick={() => setShowSOAPreview(false)}
        >
          <div
            className="bg-white h-full w-full max-w-2xl shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-1">
                  SOA Print Layout (Preview)
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  For CONFORME CARGO EXPRESS official form
                </p>
              </div>
              <Button
                onClick={() => setShowSOAPreview(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-[#F9FAFB]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preview Image */}
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-[#F9FAFB]">
                <img
                  src={soaPreviewImage}
                  alt="SOA Print Layout Preview"
                  className="w-full h-auto"
                />
              </div>

              {/* Field Mapping Info */}
              <Card className="p-4 border border-[#E5E7EB] bg-[#F9FAFB]">
                <h4 className="text-[13px] font-medium text-[#0A1D4D] mb-3">
                  Field Alignment Guide
                </h4>
                <div className="space-y-2 text-[12px]">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[#6B7280]">Name:</span>
                    <span className="text-[#0A1D4D]">Bill To / Client Name</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[#6B7280]">Address:</span>
                    <span className="text-[#0A1D4D]">Client Address</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[#6B7280]">Date:</span>
                    <span className="text-[#0A1D4D]">Billing Date</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[#6B7280]">Terms:</span>
                    <span className="text-[#0A1D4D]">Payment Terms</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[#6B7280]">TIN:</span>
                    <span className="text-[#0A1D4D]">Client TIN</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[#6B7280]">Articles Table:</span>
                    <span className="text-[#0A1D4D]">Line Items</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[#6B7280]">Total Amount Due:</span>
                    <span className="text-[#0A1D4D]">Grand Total</span>
                  </div>
                </div>
              </Card>

              {/* Important Note */}
              <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4">
                <p className="text-[12px] text-[#92400E]">
                  <strong>Important:</strong> This preview is for alignment guidance. Actual printout will match paper margins. Always load pre-printed SOA paper before printing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Billings List View
function BillingsList({
  booking,
  billings,
  onCreateNew,
  onViewBilling,
  onDeleteBilling,
}: {
  booking: Booking;
  billings: Billing[];
  onCreateNew: () => void;
  onViewBilling: (billing: Billing) => void;
  onDeleteBilling: (id: string) => void;
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[14px] font-medium text-[#12332B] mb-1">
            Billings for this booking
          </h3>
          <p className="text-[11px] text-[#667085]">
            Revenue entries linked to this booking.
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-[#0F766E] hover:bg-[#0D6860] text-white rounded-lg h-9 px-4 text-[13px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Billing from Booking
        </Button>
      </div>

      {/* Billings Table */}
      {billings.length > 0 ? (
        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Billing No.
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Description / Service
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {billings.map((billing, index) => (
                <tr
                  key={billing.id}
                  onClick={() => onViewBilling(billing)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onViewBilling(billing);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open billing ${billing.billingNo}`}
                  className={cn(
                    "border-b border-[#E5E7EB] cursor-pointer transition-colors duration-150 hover:bg-[#F9FAFB]",
                    index === billings.length - 1 && "border-b-0"
                  )}
                >
                  <td className="px-4 py-4">
                    <span className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 500 }}>
                      {billing.billingNo}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[13px] text-[#64748B]">
                      {new Date(billing.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[13px] text-[#0A1D4D]">
                      {billing.description}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 500 }}>
                      ₱{billing.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <BillingStatusPill status={billing.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 hover:bg-[#F9FAFB]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBilling(billing.id);
                            }}
                            className="text-[#EF4444] focus:text-[#EF4444]"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-[#E5E7EB] rounded-lg p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-2">
              No billings yet
            </h3>
            <p className="text-[11px] text-[#6B7280] mb-6">
              Create your first billing for this booking to get started.
            </p>
            <Button
              onClick={onCreateNew}
              className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-9 px-6 text-[13px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Billing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Billing Workspace Component
export function BillingWorkspace({
  booking,
  billings,
  onCreateBilling,
  onUpdateBilling,
  onDeleteBilling,
  onDownloadExcel,
  onPrintSOA,
  onPostToAccounting,
}: BillingWorkspaceProps) {
  const [view, setView] = useState<"list" | "create" | "view">("list");
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);

  const handleCreateNew = () => {
    setSelectedBilling(null);
    setView("create");
  };

  const handleViewBilling = (billing: Billing) => {
    setSelectedBilling(billing);
    setView("view");
  };

  const handleSave = (billing: Partial<Billing>) => {
    if (view === "create") {
      onCreateBilling(billing);
    } else if (selectedBilling) {
      onUpdateBilling(selectedBilling.id, billing);
    }
    setView("list");
    setSelectedBilling(null);
  };

  const handleCancel = () => {
    setView("list");
    setSelectedBilling(null);
  };

  return (
    <Card className="bg-white border border-[#E5E9F0] rounded-xl">
      <div className="p-6">
        {view === "list" ? (
          <BillingsList
            booking={booking}
            billings={billings}
            onCreateNew={handleCreateNew}
            onViewBilling={handleViewBilling}
            onDeleteBilling={onDeleteBilling}
          />
        ) : (
          <BillingEditor
            booking={booking}
            billing={selectedBilling || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            mode={view === "create" ? "create" : "view"}
          />
        )}
      </div>
    </Card>
  );
}