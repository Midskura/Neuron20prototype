import { useState } from "react";
import { X, Plus, Trash2, Printer, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { cn } from "./ui/utils";
import { toast } from "./ui/toast-utils";

interface RevenueLineItem {
  id: string;
  description: string;
  amount: number;
}

interface RevenueEntry {
  id?: string;
  company: string;
  date: string;
  category: string;
  linkedBooking: string;
  particulars: string;
  itemizedCost: number;
  expenses: number;
  adminCostPercent: number;
  collectedAmount: number;
  collectedDate: string;
  paymentChannel: string;
  showInSalesReport: boolean;
  status?: "Pending approval" | "Posted";
}

interface AccountingRevenueModalProps {
  entry?: RevenueEntry;
  categories: string[];
  companies: string[];
  onClose: () => void;
  onSave: (entry: RevenueEntry, status: "Draft" | "Posted") => void;
}

const PAYMENT_CHANNELS = ["Cash", "Petty Cash", "BPI", "BDO", "GCash"];

export function AccountingRevenueModal({ 
  entry, 
  categories,
  companies,
  onClose, 
  onSave 
}: AccountingRevenueModalProps) {
  const [formData, setFormData] = useState<RevenueEntry>(
    entry || {
      company: companies[0] || "CCE",
      date: new Date().toISOString().split("T")[0],
      category: "",
      linkedBooking: "",
      particulars: "",
      itemizedCost: 0,
      expenses: 0,
      adminCostPercent: 3,
      collectedAmount: 0,
      collectedDate: "",
      paymentChannel: "Cash",
      showInSalesReport: true,
    }
  );

  const isEditMode = !!entry;

  const calculateTotalExpenses = () => {
    const adminCost = (formData.itemizedCost + formData.expenses) * (formData.adminCostPercent / 100);
    return formData.itemizedCost + formData.expenses + adminCost;
  };

  const calculateGrossProfit = () => {
    return formData.collectedAmount - calculateTotalExpenses();
  };

  const handleSave = (status: "Draft" | "Posted") => {
    onSave(formData, status);
    const message = status === "Draft" 
      ? "Revenue entry saved as draft" 
      : "Revenue entry posted to accounting";
    toast.success(message);
    onClose();
  };

  const handlePrint = () => {
    toast.success("Opening print dialog...");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col"
        style={{ width: "1100px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-[20px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
              {isEditMode ? "Edit Revenue Entry" : "New Revenue Entry"}
            </h3>
            <p className="text-[11px] text-[#6B7280] mt-1">
              {isEditMode 
                ? "Update revenue entry details and profit calculation fields."
                : "Record revenue and track profit metrics for this transaction."}
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

        {/* Modal Body - 2-Column Layout */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Revenue Information (8 columns) */}
              <div className="col-span-8 space-y-4">
                {/* Basic Information Card */}
                <Card className="p-5 border border-[#E5E7EB]">
                  <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                    Revenue Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Company
                      </Label>
                      <Select 
                        value={formData.company} 
                        onValueChange={(value) => setFormData({ ...formData, company: value })}
                      >
                        <SelectTrigger className="h-11 border-[#E5E7EB] rounded-lg text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map(company => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Billing / Revenue Date
                      </Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="h-11 border-[#E5E7EB] rounded-lg text-[13px]"
                      />
                    </div>

                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Revenue Category
                      </Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="h-11 border-[#E5E7EB] rounded-lg text-[13px]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Linked Booking / Job
                      </Label>
                      <Input
                        value={formData.linkedBooking}
                        onChange={(e) => setFormData({ ...formData, linkedBooking: e.target.value })}
                        className="h-11 border-[#E5E7EB] rounded-lg text-[13px]"
                        placeholder="e.g., FCL-IMP-00012-SEA"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Particulars / Description
                      </Label>
                      <Textarea
                        value={formData.particulars}
                        onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
                        className="border-[#E5E7EB] rounded-lg text-[13px] min-h-[80px]"
                        placeholder="Describe the revenue source or service provided..."
                      />
                    </div>
                  </div>
                </Card>

                {/* Cost & Profit Breakdown Card */}
                <Card className="p-5 border border-[#E5E7EB] bg-[#FFFBF0]">
                  <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                    Cost & Profit Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Itemized Cost
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">₱</span>
                        <Input
                          type="number"
                          value={formData.itemizedCost || ""}
                          onChange={(e) => setFormData({ ...formData, itemizedCost: parseFloat(e.target.value) || 0 })}
                          className="h-11 border-[#E5E7EB] rounded-lg text-[13px] pl-7 bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Expenses
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">₱</span>
                        <Input
                          type="number"
                          value={formData.expenses || ""}
                          onChange={(e) => setFormData({ ...formData, expenses: parseFloat(e.target.value) || 0 })}
                          className="h-11 border-[#E5E7EB] rounded-lg text-[13px] pl-7 bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Admin Cost %
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.adminCostPercent}
                          onChange={(e) => setFormData({ ...formData, adminCostPercent: parseFloat(e.target.value) || 0 })}
                          className="h-11 border-[#E5E7EB] rounded-lg text-[13px] pr-8 bg-white"
                          placeholder="3"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">%</span>
                      </div>
                      <p className="text-[11px] text-[#92400E] mt-1.5">
                        Pre-filled to 3%. Auto-calculated from Itemized Cost + Expenses.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Payment Collection Card */}
                <Card className="p-5 border border-[#E5E7EB]">
                  <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                    Payment Collection
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Collected Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">₱</span>
                        <Input
                          type="number"
                          value={formData.collectedAmount || ""}
                          onChange={(e) => setFormData({ ...formData, collectedAmount: parseFloat(e.target.value) || 0 })}
                          className="h-11 border-[#E5E7EB] rounded-lg text-[13px] pl-7"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Collected Date
                      </Label>
                      <Input
                        type="date"
                        value={formData.collectedDate}
                        onChange={(e) => setFormData({ ...formData, collectedDate: e.target.value })}
                        className="h-11 border-[#E5E7EB] rounded-lg text-[13px]"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                        Payment Channel
                      </Label>
                      <Select 
                        value={formData.paymentChannel} 
                        onValueChange={(value) => setFormData({ ...formData, paymentChannel: value })}
                      >
                        <SelectTrigger className="h-11 border-[#E5E7EB] rounded-lg text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_CHANNELS.map(channel => (
                            <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <div>
                        <Label className="text-[13px] text-[#0A1D4D] block" style={{ fontWeight: 600 }}>
                          Show in Sales Profit Report
                        </Label>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          Include this entry in sales profit calculations
                        </p>
                      </div>
                      <Switch
                        checked={formData.showInSalesReport}
                        onCheckedChange={(checked) => setFormData({ ...formData, showInSalesReport: checked })}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Revenue Summary (4 columns) */}
              <div className="col-span-4 space-y-4">
                <Card className="p-5 border border-[#E5E7EB] bg-[#F9FAFB]">
                  <h3 className="text-[13px] font-medium text-[#0A1D4D] mb-4 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                    Revenue Summary
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Company</p>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                        {formData.company}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Booking / Job Linked</p>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                        {formData.linkedBooking || "—"}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#E5E7EB]">
                      <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Total Expenses</p>
                      <p className="text-[14px] text-[#DC2626]" style={{ fontWeight: 700 }}>
                        ₱{calculateTotalExpenses().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-[#6B7280] mt-1">
                        Itemized + Expenses + Admin Cost
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Collected Amount</p>
                      <p className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                        ₱{formData.collectedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="pt-3 border-t-2 border-[#0A1D4D]">
                      <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Gross Profit</p>
                      <p 
                        className={cn(
                          "text-[20px]",
                          calculateGrossProfit() >= 0 ? "text-[#10B981]" : "text-[#DC2626]"
                        )}
                        style={{ fontWeight: 700 }}
                      >
                        ₱{calculateGrossProfit().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-[#6B7280] mt-1">
                        Collected – Total Expenses
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-between flex-shrink-0 bg-[#F9FAFB]">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="ghost"
              className="text-[#6B7280] hover:text-[#0A1D4D] hover:bg-white h-10 px-4 text-[13px]"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleSave("Draft")}
              variant="outline"
              className="border-[#E5E7EB] hover:border-[#0A1D4D] hover:bg-white rounded-lg h-10 px-5 text-[13px]"
              style={{ fontWeight: 600 }}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave("Posted")}
              className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-10 px-5 text-[13px]"
              style={{ fontWeight: 600 }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Post to Accounting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
