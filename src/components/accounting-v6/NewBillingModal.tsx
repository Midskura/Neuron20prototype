import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";

interface BillingLineItem {
  id: string;
  description: string;
  amount: number;
}

interface NewBillingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const COMPANIES = ["JLCS", "CCE", "CPTC", "ZNICF"];

// Mock bookings for dropdown
const MOCK_BOOKINGS = [
  "FCL-IMP-00012-SEA",
  "LCL-EXP-00045-AIR",
  "DOM-TRK-00089",
  "FCL-IMP-00013-SEA",
  "LCL-EXP-00046-AIR",
];

export function NewBillingModal({ open, onClose, onSubmit }: NewBillingModalProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    billingDate: new Date().toISOString().split("T")[0],
    billTo: "",
    billingNo: `BIL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
    clientAddress: "",
    bookingRef: "",
    notes: "Kindly make check payable to CONFORME CARGO EXPRESS",
    company: "",
    lineItems: [
      {
        id: "1",
        description: "Door-door rate (Pickup, Freight, Permits/Lodgement & Customs Formalities)",
        amount: 0,
      },
    ] as BillingLineItem[],
    paymentDetails: {
      bankName: "BDO",
      accountName: "CONFORME CARGO EXPRESS",
      accountNo: "0014-8803-0454",
      branch: "SM City Sucat A",
      swiftCode: "BNORPHMM",
    },
  });

  if (!open) return null;

  const addLineItem = () => {
    const newLineItem: BillingLineItem = {
      id: String(Date.now()),
      description: "",
      amount: 0,
    };
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, newLineItem],
    });
  };

  const updateLineItem = (id: string, updates: Partial<BillingLineItem>) => {
    const updatedItems = formData.lineItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setFormData({ ...formData, lineItems: updatedItems });
  };

  const deleteLineItem = (id: string) => {
    if (formData.lineItems.length === 1) return;
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((item) => item.id !== id),
    });
  };

  const calculateTotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSave = (generateInvoice: boolean = false) => {
    const totalAmount = calculateTotal();
    const savedBilling = {
      ...formData,
      amount: totalAmount,
      status: generateInvoice ? "Posted" : "Draft",
    };
    onSubmit(savedBilling);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col my-10"
        style={{ width: "1180px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-[#E5E9F0] px-8 py-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-[20px] font-semibold text-[#12332B] mb-1">
              Create Billing
            </h3>
            <p className="text-[13px] text-[#667085]">
              This billing will be linked to a booking.
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-[#F9FAFB]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* 2-Column Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Main Form (8 columns) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Section 1: Billing & Client Information */}
              <Card className="p-6 border border-[#E5E9F0] rounded-xl shadow-sm">
                <h3 className="text-[14px] font-semibold text-[#12332B] mb-5">
                  Billing & Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Client Name
                    </Label>
                    <Input
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Billing Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.billingDate}
                      onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
                      className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Bill To / Attention To
                    </Label>
                    <Input
                      value={formData.billTo}
                      onChange={(e) => setFormData({ ...formData, billTo: e.target.value })}
                      className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                      placeholder="e.g., Mr. Sandesh Mhatre"
                    />
                    <p className="text-[11px] text-[#667085] mt-1.5">
                      This name will appear on the SOA / invoice header.
                    </p>
                  </div>
                  <div>
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Billing No.
                    </Label>
                    <Input
                      value={formData.billingNo}
                      disabled
                      className="rounded-lg border-[#E5E9F0] text-[13px] bg-[#F9FAFB]"
                      style={{ height: "40px" }}
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Client Address / Location
                    </Label>
                    <Input
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                      placeholder="e.g., MAHARASHTRA, INDIA"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Company
                    </Label>
                    <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
                      <SelectTrigger 
                        className="rounded-lg border-[#E5E9F0] text-[13px] focus:ring-[#0F766E] focus:border-[#0F766E]"
                        style={{ height: "40px" }}
                      >
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Booking Ref
                    </Label>
                    <Select value={formData.bookingRef} onValueChange={(value) => setFormData({ ...formData, bookingRef: value })}>
                      <SelectTrigger 
                        className="rounded-lg border-[#E5E9F0] text-[13px] focus:ring-[#0F766E] focus:border-[#0F766E]"
                        style={{ height: "40px" }}
                      >
                        <SelectValue placeholder="Select booking" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_BOOKINGS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                      Notes / Remarks <span className="text-[#667085] font-normal">(Optional)</span>
                    </Label>
                    <Input
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                      placeholder="e.g., Kindly make check payable to CONFORME CARGO EXPRESS"
                    />
                  </div>
                </div>
              </Card>

              {/* Section 2: Particular Charges */}
              <Card className="p-6 border border-[#E5E9F0] rounded-xl shadow-sm">
                <h3 className="text-[14px] font-semibold text-[#12332B] mb-5">
                  Particular Charges
                </h3>
                
                {/* Line Items */}
                <div className="space-y-3 mb-4">
                  {formData.lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3">
                      <div className="col-span-7">
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                          placeholder="Particular description"
                          className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                          style={{ height: "40px" }}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          value={item.amount || ""}
                          onChange={(e) => updateLineItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                          placeholder="Amount (₱)"
                          className="rounded-lg border-[#E5E9F0] text-[13px] text-right focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                          style={{ height: "40px" }}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        {formData.lineItems.length > 1 && (
                          <button
                            onClick={() => deleteLineItem(item.id)}
                            className="text-[#667085] hover:text-[#EF4444] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={addLineItem}
                  variant="ghost"
                  className="text-[#0F766E] hover:bg-[#0F766E]/10 h-9 text-[13px] font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Charge
                </Button>

                {/* Grand Total */}
                <div className="mt-6 pt-4 border-t border-[#E5E9F0]">
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-[#12332B] font-semibold">
                      GRAND TOTAL
                    </span>
                    <span className="text-[24px] text-[#0F766E] font-bold">
                      ₱{calculateTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Section 3: Payment Details */}
              <Card className="p-6 border border-[#E5E9F0] rounded-xl shadow-sm bg-[#F9FAFB]">
                <h3 className="text-[14px] font-semibold text-[#12332B] mb-5">
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                      Bank Name
                    </Label>
                    <Input
                      value={formData.paymentDetails.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentDetails: { ...formData.paymentDetails, bankName: e.target.value },
                        })
                      }
                      className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                    />
                  </div>
                  <div>
                    <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                      Account Name
                    </Label>
                    <Input
                      value={formData.paymentDetails.accountName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentDetails: { ...formData.paymentDetails, accountName: e.target.value },
                        })
                      }
                      className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                    />
                  </div>
                  <div>
                    <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                      Account No.
                    </Label>
                    <Input
                      value={formData.paymentDetails.accountNo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentDetails: { ...formData.paymentDetails, accountNo: e.target.value },
                        })
                      }
                      className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                    />
                  </div>
                  <div>
                    <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                      Branch
                    </Label>
                    <Input
                      value={formData.paymentDetails.branch}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentDetails: { ...formData.paymentDetails, branch: e.target.value },
                        })
                      }
                      className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                      Swift Code
                    </Label>
                    <Input
                      value={formData.paymentDetails.swiftCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentDetails: { ...formData.paymentDetails, swiftCode: e.target.value },
                        })
                      }
                      className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                      style={{ height: "40px" }}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Summary (4 columns) */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="p-6 border border-[#E5E9F0] bg-[#F9FAFB] rounded-xl shadow-sm sticky top-0">
                <h3 className="text-[14px] font-semibold text-[#12332B] mb-5">
                  Billing Summary
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-[11px] text-[#667085] mb-1">Client</div>
                    <div className="text-[13px] text-[#12332B] font-medium">
                      {formData.clientName || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#667085] mb-1">Date</div>
                    <div className="text-[13px] text-[#12332B] font-medium">
                      {formData.billingDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#667085] mb-1">Linked Booking</div>
                    <div className="text-[13px] text-[#12332B] font-medium">
                      {formData.bookingRef || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#667085] mb-1">Company</div>
                    <div className="text-[13px] text-[#12332B] font-medium">
                      {formData.company || "—"}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#E5E9F0]">
                    <div className="text-[11px] text-[#667085] mb-2">Total Amount</div>
                    <div className="text-[24px] text-[#0F766E] font-bold">
                      ₱{calculateTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleSave(true)}
                    className="w-full bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-lg shadow-md font-semibold"
                    style={{ height: "44px" }}
                  >
                    Save & Generate Invoice
                  </Button>
                  <Button
                    onClick={() => handleSave(false)}
                    variant="outline"
                    className="w-full rounded-lg border-[#E5E9F0] text-[#12332B] hover:bg-[#F9FAFB] font-medium"
                    style={{ height: "44px" }}
                  >
                    Save as Draft
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}