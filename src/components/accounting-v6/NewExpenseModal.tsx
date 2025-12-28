import { useState } from "react";
import { X, Plus, Trash2, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../ui/utils";
import imgLandingPageLogoPng1 from "figma:asset/28c84ed117b026fbf800de0882eb478561f37f4f.png";

interface ExpenseLineItem {
  id: string;
  particular: string;
  description: string;
  amount: number;
}

interface NewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
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

const COMPANIES = ["JLCS", "CCE", "CPTC", "ZNICF"];

// Mock bookings for dropdown
const MOCK_BOOKINGS = [
  "FCL-IMP-00012-SEA",
  "LCL-EXP-00045-AIR",
  "DOM-TRK-00089",
  "FCL-IMP-00013-SEA",
  "LCL-EXP-00046-AIR",
];

export function NewExpenseModal({ open, onClose, onSubmit }: NewExpenseModalProps) {
  const [formData, setFormData] = useState({
    expenseNo: `EXP-${Date.now().toString().slice(-6)}`,
    forAccountOf: "",
    date: new Date().toISOString().split("T")[0],
    company: "",
    bookingRef: "", // Added for Accounting module
    selectedCategories: [] as string[],
    lineItems: [
      { id: "1", particular: "", description: "", amount: 0 },
    ] as ExpenseLineItem[],
  });

  if (!open) return null;

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category],
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
    const expenseData = {
      expenseNo: formData.expenseNo,
      forAccountOf: formData.forAccountOf,
      date: formData.date,
      company: formData.company,
      bookingRef: formData.bookingRef,
      categories: formData.selectedCategories,
      lineItems: formData.lineItems,
      total: calculateTotal(),
      status,
    };

    onSubmit(expenseData);
  };

  const handlePrint = () => {
    console.log("Print clicked");
  };

  const handleDownloadExcel = () => {
    console.log("Download Excel clicked");
  };

  // Check if Admin category is selected (for conditional booking field)
  const isAdminCategory = formData.selectedCategories.includes("Admin");

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
              New Expense / Request for Payment
            </h3>
            <p className="text-[13px] text-[#667085]">
              Record costs incurred during this delivery. Add only the details that apply.
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
            <div className="bg-white border border-[#E5E9F0] rounded-lg p-8 shadow-sm">
              {/* Paper Header Row */}
              <div className="grid grid-cols-12 gap-4 mb-6 pb-4 border-b border-[#E5E9F0]">
                {/* Neuron Logo (left) */}
                <div className="col-span-3">
                  <div className="h-12 border border-[#E5E9F0] rounded-lg bg-[#FAFBFC] flex items-center justify-center p-2">
                    <img 
                      src={imgLandingPageLogoPng1} 
                      alt="Neuron Logo" 
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </div>

                {/* Title (center) */}
                <div className="col-span-6 flex items-center justify-center">
                  <h2 className="text-[18px] text-[#12332B] tracking-wide" style={{ fontWeight: 700 }}>
                    REQUEST FOR PAYMENT
                  </h2>
                </div>

                {/* Date and RFP No. (right) */}
                <div className="col-span-3 space-y-2">
                  <div>
                    <Label className="text-[10px] text-[#667085] mb-1 block uppercase">
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="border-[#E5E9F0] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] text-[12px] h-8 rounded"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[#667085] mb-1 block uppercase">
                      RFP No.
                    </Label>
                    <Input
                      value={formData.expenseNo}
                      onChange={(e) =>
                        setFormData({ ...formData, expenseNo: e.target.value })
                      }
                      className="border-[#E5E9F0] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] text-[12px] h-8 rounded"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[#667085] mb-1 block uppercase">
                      Company
                    </Label>
                    <Select
                      value={formData.company}
                      onValueChange={(value) =>
                        setFormData({ ...formData, company: value })
                      }
                    >
                      <SelectTrigger className="border-[#E5E9F0] focus:ring-[#0F766E] focus:border-[#0F766E] text-[12px] h-8 rounded">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Category Strip - Table Style */}
              <div className="mb-6 pb-4 border-b border-[#E5E9F0]">
                <div className="border border-[#E5E9F0] rounded-lg overflow-hidden">
                  <div className="grid grid-cols-8">
                    {EXPENSE_CATEGORIES.map((category, index) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={cn(
                          "px-3 py-3 text-[13px] font-semibold text-center transition-all",
                          index < EXPENSE_CATEGORIES.length - 1 && "border-r border-[#E5E9F0]",
                          formData.selectedCategories.includes(category)
                            ? "bg-[#0F766E] text-white"
                            : "bg-white text-[#667085] hover:bg-[#F9FAFB]"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking / Job No. Field (Accounting-specific) */}
              {!isAdminCategory && (
                <div className="mb-6 pb-4 border-b border-[#E5E9F0]">
                  <Label className="text-[11px] text-[#667085] mb-2 block uppercase">
                    Booking / Job No. <span className="text-[#9CA3AF] normal-case">(Optional for Operations expenses)</span>
                  </Label>
                  <Select
                    value={formData.bookingRef}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bookingRef: value })
                    }
                  >
                    <SelectTrigger className="border-[#E5E9F0] focus:ring-[#0F766E] focus:border-[#0F766E] text-[13px] h-10 rounded">
                      <SelectValue placeholder="Select booking to link expense" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {MOCK_BOOKINGS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Line Items Table - Paper Style */}
              <div className="mb-6">
                <div className="border border-[#E5E9F0] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th
                          className="px-4 py-3 text-left text-[11px] font-medium text-[#667085] uppercase tracking-wider border-b border-r border-[#E5E9F0]"
                          style={{ width: "40%" }}
                        >
                          Particular
                        </th>
                        <th
                          className="px-4 py-3 text-left text-[11px] font-medium text-[#667085] uppercase tracking-wider border-b border-r border-[#E5E9F0]"
                          style={{ width: "40%" }}
                        >
                          Description
                        </th>
                        <th
                          className="px-4 py-3 text-right text-[11px] font-medium text-[#667085] uppercase tracking-wider border-b border-[#E5E9F0]"
                          style={{ width: "20%" }}
                        >
                          Amount (₱)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lineItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-[#FAFBFC] transition-colors">
                          <td
                            className={cn(
                              "px-4 py-3 border-r border-[#E5E9F0] relative",
                              index < formData.lineItems.length - 1 && "border-b border-[#E5E9F0]"
                            )}
                            style={{ width: "40%" }}
                          >
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
                                  className="text-[#667085] hover:text-[#EF4444] transition-colors flex-shrink-0"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 border-r border-[#E5E9F0]",
                              index < formData.lineItems.length - 1 && "border-b border-[#E5E9F0]"
                            )}
                            style={{ width: "40%" }}
                          >
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, "description", e.target.value)
                              }
                              placeholder="Optional details"
                              className="border-none bg-transparent text-[13px] h-8 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 border-[#E5E9F0]",
                              index < formData.lineItems.length - 1 && "border-b"
                            )}
                            style={{ width: "20%" }}
                          >
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
                      <tr className="bg-[#F9FAFB] border-t-2 border-[#E5E9F0]">
                        <td
                          colSpan={2}
                          className="px-4 py-3 text-right border-r border-[#E5E9F0]"
                          style={{ width: "80%" }}
                        >
                          <span className="text-[13px] text-[#12332B]" style={{ fontWeight: 600 }}>
                            Total Amount
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right border-[#E5E9F0]" style={{ width: "20%" }}>
                          <span className="text-[14px] text-[#12332B]" style={{ fontWeight: 700 }}>
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
                  className="mt-3 text-[#0F766E] hover:bg-[#0F766E]/10 h-9 text-[12px]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Line
                </Button>
              </div>

              {/* For the Account Of */}
              <div className="mb-8 pb-6 border-b border-[#E5E9F0]">
                <Label className="text-[11px] text-[#667085] mb-2 block uppercase">
                  For the account of:
                </Label>
                <Input
                  value={formData.forAccountOf}
                  onChange={(e) =>
                    setFormData({ ...formData, forAccountOf: e.target.value })
                  }
                  placeholder="Enter vendor or payee name"
                  className="border-[#E5E9F0] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] text-[13px] h-10 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Action Buttons */}
        <div className="border-t border-[#E5E9F0] px-8 py-5 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="ghost"
              className="h-9 text-[12px] text-[#667085] hover:bg-[#F9FAFB]"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleDownloadExcel}
              variant="ghost"
              className="h-9 text-[12px] text-[#667085] hover:bg-[#F9FAFB]"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleSave("Draft")}
              variant="outline"
              className="border-[#E5E9F0] text-[#12332B] hover:bg-[#F9FAFB] rounded-lg font-medium"
              style={{ height: "44px" }}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave("Posted")}
              className="bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-lg font-semibold shadow-md"
              style={{ height: "44px" }}
            >
              Save Expense
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}