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
import imgLandingPageLogoPng1 from "figma:asset/28c84ed117b026fbf800de0882eb478561f37f4f.png";

interface ExpenseLineItem {
  id: string;
  particular: string;
  description: string;
  amount: number;
  attachment?: string;
}

interface Expense {
  id: string;
  expenseNo: string;
  bookingId: string;
  forAccountOf: string;
  date: string;
  categories: string[];
  lineItems: ExpenseLineItem[];
  subtotal: number;
  lessAdvance: number;
  total: number;
  status: "Draft" | "For Review" | "Approved" | "Posted";
  preparedBy: string;
  notedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

interface ExpenseModalProps {
  booking: {
    id: string;
    trackingNo: string;
  };
  currentUser?: string | { id: string; name: string; email: string; role: string; status: string };
  expense?: Expense; // Optional for edit mode
  onClose: () => void;
  onSave: (expense: any) => void;
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

export function ExpenseModal({ booking, currentUser, expense, onClose, onSave }: ExpenseModalProps) {
  // Helper to get user display name
  const getUserName = () => {
    if (!currentUser) return "Current User";
    if (typeof currentUser === "string") return currentUser;
    return currentUser.name || "Current User";
  };

  // Initialize form data from expense if editing, otherwise use defaults
  const [formData, setFormData] = useState({
    expenseNo: expense?.expenseNo || `EXP-${Date.now().toString().slice(-6)}`,
    forAccountOf: expense?.forAccountOf || "",
    date: expense?.date || new Date().toISOString().split("T")[0],
    selectedCategories: expense?.categories || ([] as string[]),
    lineItems: expense?.lineItems?.length
      ? expense.lineItems
      : ([
          { id: "1", particular: "", description: "", amount: 0, attachment: "" },
        ] as ExpenseLineItem[]),
    notedBy: expense?.notedBy || "",
    approvedBy: expense?.approvedBy || "",
  });

  const isEditMode = !!expense;

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
          attachment: "",
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

  const handleSave = (status: "Draft" | "For Review") => {
    const expenseData = {
      id: expense?.id || formData.expenseNo,
      expenseNo: formData.expenseNo,
      bookingId: booking.id,
      forAccountOf: formData.forAccountOf,
      date: formData.date,
      categories: formData.selectedCategories,
      lineItems: formData.lineItems,
      subtotal: calculateTotal(),
      lessAdvance: 0,
      total: calculateTotal(),
      billToClient: false,
      billingReference: "",
      reimbursableToDriver: false,
      preparedBy: expense?.preparedBy || getUserName(),
      notedBy: formData.notedBy,
      approvedBy: formData.approvedBy,
      status,
      createdAt: expense?.createdAt || new Date().toISOString(),
    };

    onSave(expenseData);
    toast.success(
      isEditMode
        ? "Expense updated successfully"
        : status === "Draft"
        ? "Expense saved as draft"
        : "Expense saved successfully"
    );
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col"
        style={{ width: "1440px", maxWidth: "97vw", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-[14px] font-medium text-[#0A1D4D]">
                {isEditMode ? "Edit Expense / Request for Payment" : "New Expense / Request for Payment"}
              </h3>
              {isEditMode && expense && (expense.status === "Approved" || expense.status === "Posted") && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    expense.status === "Posted" && "bg-[#D1FAE5] text-[#10B981]",
                    expense.status === "Approved" && "bg-[#E0F2FE] text-[#0284C7]"
                  )}
                >
                  {expense.status}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6B7280]">
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
                {/* Left side - Neuron Logo & Linked Booking */}
                <div className="col-span-4 space-y-3">
                  <div>
                    <img 
                      src={imgLandingPageLogoPng1} 
                      alt="Neuron" 
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[#6B7280] mb-1 block uppercase">
                      BOOKING / JOB NO. (Optional for Operations expenses)
                    </Label>
                    <Input
                      value={booking.trackingNo}
                      disabled
                      className="border-[#E5E7EB] text-[12px] h-9 rounded bg-[#F9FAFB]"
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
                      value={formData.expenseNo}
                      onChange={(e) =>
                        setFormData({ ...formData, expenseNo: e.target.value })
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
                          formData.selectedCategories.includes(category)
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

              {/* Approvals Row - Horizontal */}
              <div className="grid grid-cols-3 gap-6">
                {/* Prepared By */}
                <div>
                  <Label className="text-[11px] text-[#6B7280] mb-2 block uppercase">
                    Prepared by
                  </Label>
                  <div className="border border-[#E5E7EB] rounded-lg p-3 bg-[#F9FAFB]">
                    <div className="text-[13px] text-[#0A1D4D] mb-2" style={{ fontWeight: 500 }}>
                      {getUserName()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[#D1FAE5] text-[#10B981] rounded-full">
                        Pending
                      </span>
                      <span className="text-[10px] text-[#9CA3AF]">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Noted By */}
                <div>
                  <Label className="text-[11px] text-[#6B7280] mb-2 block uppercase">
                    Noted by
                  </Label>
                  <Select
                    value={formData.notedBy}
                    onValueChange={(value) =>
                      setFormData({ ...formData, notedBy: value })
                    }
                  >
                    <SelectTrigger className="border-[#E5E7EB] text-[13px] h-11 rounded-lg">
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">John Doe</SelectItem>
                      <SelectItem value="user2">Jane Smith</SelectItem>
                      <SelectItem value="user3">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.notedBy && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[#FFF3E0] text-[#F25C05] rounded-full">
                        Pending
                      </span>
                    </div>
                  )}
                </div>

                {/* Approved By */}
                <div>
                  <Label className="text-[11px] text-[#6B7280] mb-2 block uppercase">
                    Approved by
                  </Label>
                  <Select
                    value={formData.approvedBy}
                    onValueChange={(value) =>
                      setFormData({ ...formData, approvedBy: value })
                    }
                  >
                    <SelectTrigger className="border-[#E5E7EB] text-[13px] h-11 rounded-lg">
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">John Doe</SelectItem>
                      <SelectItem value="user2">Jane Smith</SelectItem>
                      <SelectItem value="user3">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.approvedBy && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[#FFF3E0] text-[#F25C05] rounded-full">
                        Pending
                      </span>
                    </div>
                  )}
                </div>
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
              className="text-[#6B7280] hover:text-[#0A1D4D] hover:bg-white h-9 px-3 text-[13px]"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleDownloadExcel}
              variant="ghost"
              className="text-[#6B7280] hover:text-[#0A1D4D] hover:bg-white h-9 px-3 text-[13px]"
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
              onClick={() => handleSave("For Review")}
              className="bg-[#0F766E] hover:bg-[#0D6860] text-white rounded-lg h-10 px-5 text-[13px]"
              style={{ fontWeight: 600 }}
            >
              Save Expense
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}