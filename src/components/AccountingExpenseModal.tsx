import { useState } from "react";
import { X, Plus, Trash2, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "./ui/utils";
import { toast } from "./ui/toast-utils";

interface ExpenseLineItem {
  id: string;
  particular: string;
  description: string;
  amount: number;
}

interface ExpenseEntry {
  id?: string;
  date: string;
  rfpNo: string;
  company: string;
  paymentChannel: string;
  linkedBooking: string;
  categories: string[];
  lineItems: ExpenseLineItem[];
  forAccountOf: string;
  status?: "Pending approval" | "Posted";
}

interface AccountingExpenseModalProps {
  entry?: ExpenseEntry;
  companies: string[];
  onClose: () => void;
  onSave: (entry: ExpenseEntry, status: "Draft" | "Posted") => void;
}

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

const PAYMENT_CHANNELS = ["Cash", "Petty Cash", "BPI", "BDO", "GCash"];

export function AccountingExpenseModal({ 
  entry, 
  companies,
  onClose, 
  onSave 
}: AccountingExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseEntry>(
    entry || {
      date: new Date().toISOString().split("T")[0],
      rfpNo: `RFP-${Date.now().toString().slice(-6)}`,
      company: companies[0] || "CCE",
      paymentChannel: "Cash",
      linkedBooking: "",
      categories: [],
      lineItems: [
        { id: "1", particular: "", description: "", amount: 0 },
      ],
      forAccountOf: "",
    }
  );

  const isEditMode = !!entry;

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAddLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: Date.now().toString(),
          particular: "",
          description: "",
          amount: 0,
        },
      ],
    }));
  };

  const handleUpdateLineItem = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteLineItem = (id: string) => {
    if (formData.lineItems.length === 1) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const calculateTotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSave = (status: "Draft" | "Posted") => {
    onSave(formData, status);
    const message = status === "Draft" 
      ? "Expense entry saved as draft" 
      : "Expense entry posted to accounting";
    toast.success(message);
    onClose();
  };

  const handlePrint = () => {
    toast.success("Opening print preview...");
  };

  const handleDownloadExcel = () => {
    toast.success("Downloading Excel file...");
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
              {isEditMode ? "Edit Expense / Request for Payment" : "New Expense / Request for Payment"}
            </h3>
            <p className="text-[11px] text-[#6B7280] mt-1">
              {isEditMode
                ? "Update expense details. Fields remain editable even after approval."
                : "Record costs incurred during this delivery. Add only the details that apply."}
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

        {/* Modal Body - Paper-style Single Column */}
        <div className="flex-1 overflow-y-auto">
          {/* Paper Sheet Container */}
          <div className="p-8">
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
              {/* Paper Header Row */}
              <div className="grid grid-cols-12 gap-6 mb-6 pb-4 border-b border-[#E5E7EB]">
                {/* Left side - Company & Payment Channel */}
                <div className="col-span-4 space-y-3">
                  <div>
                    <Label className="text-[10px] text-[#6B7280] mb-1 block uppercase">
                      Company
                    </Label>
                    <Select 
                      value={formData.company} 
                      onValueChange={(value) => setFormData({ ...formData, company: value })}
                    >
                      <SelectTrigger className="border-[#E5E7EB] text-[12px] h-9 rounded">
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
                    <Label className="text-[10px] text-[#6B7280] mb-1 block uppercase">
                      Payment Channel
                    </Label>
                    <Select 
                      value={formData.paymentChannel} 
                      onValueChange={(value) => setFormData({ ...formData, paymentChannel: value })}
                    >
                      <SelectTrigger className="border-[#E5E7EB] text-[12px] h-9 rounded">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_CHANNELS.map(channel => (
                          <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-[#6B7280] mb-1 block uppercase">
                      Linked Booking / Job
                    </Label>
                    <Input
                      value={formData.linkedBooking}
                      onChange={(e) => setFormData({ ...formData, linkedBooking: e.target.value })}
                      className="border-[#E5E7EB] text-[12px] h-9 rounded"
                      placeholder="e.g., FCL-IMP-00012-SEA"
                    />
                  </div>
                </div>

                {/* Title (center) */}
                <div className="col-span-4 flex items-center justify-center">
                  <h2 className="text-[18px] text-[#0A1D4D] tracking-wide" style={{ fontWeight: 700 }}>
                    REQUEST FOR PAYMENT
                  </h2>
                </div>

                {/* Date and RFP No. (right) */}
                <div className="col-span-4 space-y-2">
                  <div>
                    <Label className="text-[10px] text-[#6B7280] mb-1 block uppercase">
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="border-[#E5E7EB] text-[12px] h-9 rounded"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[#6B7280] mb-1 block uppercase">
                      RFP No.
                    </Label>
                    <Input
                      value={formData.rfpNo}
                      onChange={(e) =>
                        setFormData({ ...formData, rfpNo: e.target.value })
                      }
                      className="border-[#E5E7EB] text-[12px] h-9 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Category Strip - Table Style */}
              <div className="mb-6 pb-4 border-b border-[#E5E7EB]">
                <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                  <div className="grid grid-cols-8">
                    {EXPENSE_CATEGORIES.map((category, index) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={cn(
                          "px-3 py-3 text-[13px] font-semibold text-center transition-all",
                          index < EXPENSE_CATEGORIES.length - 1 && "border-r border-[#E5E7EB]",
                          formData.categories.includes(category)
                            ? "bg-[#0A1D4D] text-white"
                            : "bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line Items Table - Paper Style */}
              <div className="mb-6">
                <div className="border border-[#D1D5DB] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider border-b border-r border-[#E5E7EB]" style={{ width: "40%" }}>
                          Particular
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider border-b border-r border-[#E5E7EB]" style={{ width: "40%" }}>
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]" style={{ width: "20%" }}>
                          Amount (₱)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lineItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-[#FAFBFC] transition-colors">
                          <td className={cn(
                            "px-4 py-3 border-r border-[#E5E7EB] relative",
                            index < formData.lineItems.length - 1 && "border-b border-[#E5E7EB]"
                          )} style={{ width: "40%" }}>
                            <div className="flex items-center gap-2">
                              <Input
                                value={item.particular}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, "particular", e.target.value)
                                }
                                placeholder="Enter particular"
                                className="border-none bg-transparent text-[13px] h-8 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                              />
                              {formData.lineItems.length > 1 && (
                                <button
                                  onClick={() => handleDeleteLineItem(item.id)}
                                  className="text-[#6B7280] hover:text-[#EF4444] transition-colors flex-shrink-0"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className={cn(
                            "px-4 py-3 border-r border-[#E5E7EB]",
                            index < formData.lineItems.length - 1 && "border-b border-[#E5E7EB]"
                          )} style={{ width: "40%" }}>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, "description", e.target.value)
                              }
                              placeholder="Optional details"
                              className="border-none bg-transparent text-[13px] h-8 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </td>
                          <td className={cn(
                            "px-4 py-3 border-[#E5E7EB]",
                            index < formData.lineItems.length - 1 && "border-b"
                          )} style={{ width: "20%" }}>
                            <Input
                              type="number"
                              value={item.amount || ""}
                              onChange={(e) =>
                                handleUpdateLineItem(
                                  item.id,
                                  "amount",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                              className="border-none bg-transparent text-[13px] h-8 text-right px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </td>
                        </tr>
                      ))}

                      {/* Total Row */}
                      <tr className="bg-[#F9FAFB] border-t-2 border-[#D1D5DB]">
                        <td colSpan={2} className="px-4 py-3 text-right border-r border-[#E5E7EB]" style={{ width: "80%" }}>
                          <span className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                            Total Amount
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right border-[#E5E7EB]" style={{ width: "20%" }}>
                          <span className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                            ₱{calculateTotal().toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Add Another Line Button */}
                <Button
                  onClick={handleAddLineItem}
                  variant="ghost"
                  className="mt-3 text-[#0A1D4D] hover:bg-[#F9FAFB] h-9 text-[12px]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Line
                </Button>
              </div>

              {/* For the Account Of */}
              <div className="mb-8 pb-6 border-b border-[#E5E7EB]">
                <Label className="text-[11px] text-[#6B7280] mb-2 block uppercase">
                  For the account of:
                </Label>
                <Input
                  value={formData.forAccountOf}
                  onChange={(e) =>
                    setFormData({ ...formData, forAccountOf: e.target.value })
                  }
                  placeholder="Enter vendor or payee name"
                  className="border-[#E5E7EB] text-[13px] h-10 rounded"
                />
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
            <Button
              onClick={handleDownloadExcel}
              variant="ghost"
              className="text-[#6B7280] hover:text-[#0A1D4D] hover:bg-white h-10 px-4 text-[13px]"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Excel
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
              Post to Accounting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
