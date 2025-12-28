import { useState } from "react";
import { X, Plus, Trash2, FileSpreadsheet, Printer, Check, ChevronsUpDown } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "./ui/utils";
import { toast } from "./ui/toast-utils";

type EntryMode = "Revenue" | "Expense";

interface ExpenseLineItem {
  id: string;
  particular: string;
  description: string;
  amount: number;
}

interface AccountingEntryModalProps {
  entry?: any;
  mode?: EntryMode;
  categories: string[];
  companies: string[];
  onClose: () => void;
  onSave: (entry: any, status: "Draft" | "Posted") => void;
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

export function AccountingEntryModal({
  entry,
  mode: initialMode,
  categories,
  companies,
  onClose,
  onSave,
}: AccountingEntryModalProps) {
  // Determine mode from entry if editing, otherwise use initialMode or default to Revenue
  const [entryMode, setEntryMode] = useState<EntryMode>(
    entry?.type === "Expense" ? "Expense" : (initialMode || "Revenue")
  );

  // Initialize form data based on mode
  const [revenueData, setRevenueData] = useState({
    company: entry?.company || companies[0] || "CCE",
    date: entry?.date || new Date().toISOString().split("T")[0],
    category: entry?.category || "",
    linkedBooking: entry?.linkedBooking || entry?.bookingNo || "",
    particulars: entry?.particulars || entry?.description || "",
    itemizedCost: entry?.itemizedCost || 0,
    expenses: entry?.expenses || 0,
    adminCostPercent: entry?.adminCostPercent || 3,
    collectedAmount: entry?.collectedAmount || 0,
    collectedDate: entry?.collectedDate || "",
    paymentChannel: entry?.paymentChannel || "Cash",
    showInSalesReport: entry?.showInSalesReport ?? true,
  });

  const [expenseData, setExpenseData] = useState({
    date: entry?.date || new Date().toISOString().split("T")[0],
    rfpNo: entry?.referenceNo || `RFP-${Date.now().toString().slice(-6)}`,
    company: entry?.company || companies[0] || "CCE",
    paymentChannel: entry?.paymentChannel || "Cash",
    linkedBooking: entry?.linkedBooking || entry?.bookingNo || "",
    categories: entry?.categories || [],
    lineItems: entry?.lineItems || [
      { id: "1", particular: "", description: "", amount: 0 },
    ] as ExpenseLineItem[],
    forAccountOf: entry?.forAccountOf || "",
  });

  const isEditMode = !!entry;
  const showModeSelector = !isEditMode;

  // Category combobox state
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Expense handlers
  const handleCategoryToggle = (category: string) => {
    setExpenseData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAddLineItem = () => {
    setExpenseData((prev) => ({
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
    setExpenseData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item: ExpenseLineItem) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteLineItem = (id: string) => {
    if (expenseData.lineItems.length === 1) {
      return;
    }
    setExpenseData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item: ExpenseLineItem) => item.id !== id),
    }));
  };

  const calculateExpenseTotal = () => {
    return expenseData.lineItems.reduce((sum: number, item: ExpenseLineItem) => sum + (Number(item.amount) || 0), 0);
  };

  // Revenue calculations
  const calculateTotalExpenses = () => {
    const adminCost = (revenueData.itemizedCost + revenueData.expenses) * (revenueData.adminCostPercent / 100);
    return revenueData.itemizedCost + revenueData.expenses + adminCost;
  };

  const calculateGrossProfit = () => {
    return revenueData.collectedAmount - calculateTotalExpenses();
  };

  const handleSave = (asDraft: boolean = false) => {
    const status = asDraft ? "Draft" : "Posted";
    const entryData = entryMode === "Revenue" 
      ? {
          ...revenueData,
          type: "Revenue",
          amount: revenueData.collectedAmount,
          bookingNo: revenueData.linkedBooking,
        }
      : {
          ...expenseData,
          type: "Expense",
          amount: calculateExpenseTotal(),
          bookingNo: expenseData.linkedBooking,
          referenceNo: expenseData.rfpNo,
        };

    onSave(entryData, status);
    const message = asDraft 
      ? `${entryMode} entry saved as draft` 
      : `${entryMode} entry saved successfully`;
    toast.success(message);
    onClose();
  };

  const handlePrint = () => {
    toast.success("Opening print dialog...");
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
        {/* Modal Header with Mode Selector */}
        <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1">
              <h3 className="text-[20px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                {isEditMode 
                  ? (entryMode === "Revenue" ? "Edit Revenue Entry" : "Edit Expense / Request for Payment")
                  : "New Entry"}
              </h3>
              <p className="text-[11px] text-[#6B7280] mt-1">
                {isEditMode
                  ? (entryMode === "Revenue"
                      ? "Update revenue entry details and profit calculation fields."
                      : "Update expense details. Fields remain editable even after approval.")
                  : "Select entry type and fill in the required information."}
              </p>
            </div>

            {/* Mode Selector - Only show when creating new entry */}
            {showModeSelector && (
              <div className="flex gap-2 bg-[#F9FAFB] p-1 rounded-lg border border-[#E5E7EB]">
                <button
                  onClick={() => setEntryMode("Revenue")}
                  className={cn(
                    "px-6 py-2 rounded-md text-[13px] transition-all",
                    entryMode === "Revenue"
                      ? "bg-[#F25C05] text-white shadow-sm"
                      : "bg-transparent text-[#6B7280] hover:bg-white"
                  )}
                  style={{ fontWeight: 600 }}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setEntryMode("Expense")}
                  className={cn(
                    "px-6 py-2 rounded-md text-[13px] transition-all",
                    entryMode === "Expense"
                      ? "bg-[#F25C05] text-white shadow-sm"
                      : "bg-transparent text-[#6B7280] hover:bg-white"
                  )}
                  style={{ fontWeight: 600 }}
                >
                  Expense
                </button>
              </div>
            )}
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
        <div className="flex-1 overflow-y-auto">
          {entryMode === "Revenue" ? (
            // REVENUE FORM
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
                          value={revenueData.company} 
                          onValueChange={(value) => setRevenueData({ ...revenueData, company: value })}
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
                          value={revenueData.date}
                          onChange={(e) => setRevenueData({ ...revenueData, date: e.target.value })}
                          className="h-11 border-[#E5E7EB] rounded-lg text-[13px]"
                        />
                      </div>

                      <div>
                        <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                          Revenue Category
                        </Label>
                        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={categoryOpen}
                              className="h-11 w-full justify-between border-[#E5E7EB] rounded-lg text-[13px] font-normal hover:bg-[#F9FAFB]"
                            >
                              {revenueData.category || "Type to search or create..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder="Search or type new category..." 
                                value={categorySearch}
                                onValueChange={setCategorySearch}
                              />
                              <CommandEmpty>
                                <button
                                  onClick={() => {
                                    setRevenueData({ ...revenueData, category: categorySearch });
                                    setCategoryOpen(false);
                                    setCategorySearch("");
                                    toast.success(`Created new category: "${categorySearch}"`);
                                  }}
                                  className="w-full text-left px-4 py-2 text-[13px] text-[#F25C05] hover:bg-[#FFF3E0] rounded"
                                >
                                  Create "{categorySearch}"
                                </button>
                              </CommandEmpty>
                              <CommandGroup heading="Common Categories">
                                {categories.filter(c => c).map((category) => (
                                  <CommandItem
                                    key={category}
                                    value={category}
                                    onSelect={() => {
                                      setRevenueData({ ...revenueData, category });
                                      setCategoryOpen(false);
                                      setCategorySearch("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        revenueData.category === category ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {category}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                          Linked Booking / Job
                        </Label>
                        <Input
                          value={revenueData.linkedBooking}
                          onChange={(e) => setRevenueData({ ...revenueData, linkedBooking: e.target.value })}
                          className="h-11 border-[#E5E7EB] rounded-lg text-[13px]"
                          placeholder="e.g., FCL-IMP-00012-SEA"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                          Particulars / Description
                        </Label>
                        <Textarea
                          value={revenueData.particulars}
                          onChange={(e) => setRevenueData({ ...revenueData, particulars: e.target.value })}
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
                            value={revenueData.itemizedCost || ""}
                            onChange={(e) => setRevenueData({ ...revenueData, itemizedCost: parseFloat(e.target.value) || 0 })}
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
                            value={revenueData.expenses || ""}
                            onChange={(e) => setRevenueData({ ...revenueData, expenses: parseFloat(e.target.value) || 0 })}
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
                            value={revenueData.adminCostPercent}
                            onChange={(e) => setRevenueData({ ...revenueData, adminCostPercent: parseFloat(e.target.value) || 0 })}
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
                            value={revenueData.collectedAmount || ""}
                            onChange={(e) => setRevenueData({ ...revenueData, collectedAmount: parseFloat(e.target.value) || 0 })}
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
                          value={revenueData.collectedDate}
                          onChange={(e) => setRevenueData({ ...revenueData, collectedDate: e.target.value })}
                          className="h-11 border-[#E5E7EB] rounded-lg text-[13px]"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-[13px] text-[#6B7280] mb-2 block" style={{ fontWeight: 500 }}>
                          Payment Channel
                        </Label>
                        <Select 
                          value={revenueData.paymentChannel} 
                          onValueChange={(value) => setRevenueData({ ...revenueData, paymentChannel: value })}
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
                          checked={revenueData.showInSalesReport}
                          onCheckedChange={(checked) => setRevenueData({ ...revenueData, showInSalesReport: checked })}
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
                          {revenueData.company}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Booking / Job Linked</p>
                        <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                          {revenueData.linkedBooking || "—"}
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
                          ₱{revenueData.collectedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
          ) : (
            // EXPENSE FORM
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
                        value={expenseData.company} 
                        onValueChange={(value) => setExpenseData({ ...expenseData, company: value })}
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
                        value={expenseData.paymentChannel} 
                        onValueChange={(value) => setExpenseData({ ...expenseData, paymentChannel: value })}
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
                        value={expenseData.linkedBooking}
                        onChange={(e) => setExpenseData({ ...expenseData, linkedBooking: e.target.value })}
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
                        value={expenseData.date}
                        onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                        className="border-[#E5E7EB] text-[12px] h-9 rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-[#6B7280] mb-1 block uppercase">
                        RFP No.
                      </Label>
                      <Input
                        value={expenseData.rfpNo}
                        onChange={(e) => setExpenseData({ ...expenseData, rfpNo: e.target.value })}
                        className="border-[#E5E7EB] text-[12px] h-9 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Strip */}
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
                            expenseData.categories.includes(category)
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

                {/* Line Items Table */}
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
                        {expenseData.lineItems.map((item, index) => (
                          <tr key={item.id} className="hover:bg-[#FAFBFC] transition-colors">
                            <td className={cn(
                              "px-4 py-3 border-r border-[#E5E7EB] relative",
                              index < expenseData.lineItems.length - 1 && "border-b border-[#E5E7EB]"
                            )} style={{ width: "40%" }}>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={item.particular}
                                  onChange={(e) => handleUpdateLineItem(item.id, "particular", e.target.value)}
                                  placeholder="Enter particular"
                                  className="border-none bg-transparent text-[13px] h-8 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                                />
                                {expenseData.lineItems.length > 1 && (
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
                              index < expenseData.lineItems.length - 1 && "border-b border-[#E5E7EB]"
                            )} style={{ width: "40%" }}>
                              <Input
                                value={item.description}
                                onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                                placeholder="Optional details"
                                className="border-none bg-transparent text-[13px] h-8 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </td>
                            <td className={cn(
                              "px-4 py-3 border-[#E5E7EB]",
                              index < expenseData.lineItems.length - 1 && "border-b"
                            )} style={{ width: "20%" }}>
                              <Input
                                type="number"
                                value={item.amount || ""}
                                onChange={(e) => handleUpdateLineItem(item.id, "amount", parseFloat(e.target.value) || 0)}
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
                              ₱{calculateExpenseTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                    value={expenseData.forAccountOf}
                    onChange={(e) => setExpenseData({ ...expenseData, forAccountOf: e.target.value })}
                    placeholder="Enter vendor or payee name"
                    className="border-[#E5E7EB] text-[13px] h-10 rounded"
                  />
                </div>
              </div>
            </div>
          )}
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
            {entryMode === "Expense" && (
              <Button
                onClick={handleDownloadExcel}
                variant="ghost"
                className="text-[#6B7280] hover:text-[#0A1D4D] hover:bg-white h-10 px-4 text-[13px]"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleSave(true)}
              variant="outline"
              className="border-[#E5E7EB] hover:border-[#0A1D4D] hover:bg-white rounded-lg h-10 px-5 text-[13px]"
              style={{ fontWeight: 600 }}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(false)}
              className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-10 px-5 text-[13px]"
              style={{ fontWeight: 600 }}
            >
              Save Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
