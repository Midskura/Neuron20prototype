import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { CalendarIcon, Paperclip, X, HelpCircle, Search, FileText, Upload, Printer } from "lucide-react";
import { format } from "date-fns";
import { COMPANIES, getCompanyById } from "./companies";
import { toast } from "sonner@2.0.3";
import { BookingPicker } from "./BookingPicker";
import { ApprovalBanner } from "./ApprovalBanner";
import { EntryStatus } from "./StatusPill";

type EntryType = "revenue" | "expense" | "transfer";

interface RFPFormData {
  payee: string;
  amount: string;
  amountInWords: string;
  company: string;
  bookingNo: string;
  justification: string;
  category: string;
  accountToCredit: string;
  dueDate: Date | undefined;
  paymentTerms: string;
  costCenter: string;
  preparedBy: string;
  attachments: File[];
  notesToApprover: string;
}

interface EntryFormData {
  type: EntryType;
  amount: string;
  company: string;
  bookingNo: string;
  account: string;
  category: string;
  date: Date;
  note: string;
  attachments: File[];
  status: EntryStatus;
  payee: string;
  paymentMethod: string;
  isNoBooking: boolean;
}

interface EntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: any;
  onSave: (data: EntryFormData, status: EntryStatus) => void;
  onDelete?: () => void;
  onSendForApproval?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPost?: () => void;
  onPrintRFP?: () => void;
  companyOptions: Array<{ value: string; label: string }>;
  bookingOptions: Array<{ value: string; label: string }>;
  accountOptions: Array<{ value: string; label: string }>;
  categoryOptions: {
    revenue: Array<{ value: string; label: string; color: string }>;
    expense: Array<{ value: string; label: string; color: string }>;
  };
  userRole?: "accountant" | "approver";
}

export function EntryModal({
  open,
  onOpenChange,
  entry,
  onSave,
  onDelete,
  onSendForApproval,
  onApprove,
  onReject,
  onPost,
  onPrintRFP,
  companyOptions,
  bookingOptions,
  accountOptions,
  categoryOptions,
  userRole = "approver",
}: EntryModalProps) {
  const [formData, setFormData] = useState<EntryFormData>({
    type: "expense",
    amount: "",
    company: "",
    bookingNo: "",
    account: "",
    category: "",
    date: new Date(),
    note: "",
    attachments: [],
    status: "draft",
    payee: "",
    paymentMethod: "Cash",
    isNoBooking: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCompanyPopoverOpen, setIsCompanyPopoverOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPristine, setIsPristine] = useState(true);
  const [isBookingVerified, setIsBookingVerified] = useState(true);
  
  // RFP state - embedded inline
  const [showRFPForm, setShowRFPForm] = useState(false);
  const [rfpData, setRfpData] = useState<RFPFormData>({
    payee: "",
    amount: "",
    amountInWords: "",
    company: "",
    bookingNo: "",
    justification: "",
    category: "",
    accountToCredit: "Cash",
    dueDate: undefined,
    paymentTerms: "Net 7",
    costCenter: "",
    preparedBy: "Current User",
    attachments: [],
    notesToApprover: "",
  });
  const [rfpErrors, setRfpErrors] = useState<Record<string, string>>({});
  const [rfpStatus, setRfpStatus] = useState<"draft" | "submitted" | "approved">("draft");
  const [isDueDatePickerOpen, setIsDueDatePickerOpen] = useState(false);

  useEffect(() => {
    if (open && entry) {
      const newFormData = {
        type: entry.type || "expense",
        amount: entry.amount?.toString() || "",
        company: entry.company || "",
        bookingNo: entry.bookingNo || "",
        account: (entry as any).accountId || "",
        category: entry.category || "",
        date: entry.date ? new Date(entry.date) : new Date(),
        note: entry.note || "",
        attachments: [],
        status: entry.status || "draft",
        payee: entry.payee || "",
        paymentMethod: entry.paymentMethod || "Cash",
        isNoBooking: entry.isNoBooking || false,
      };
      setFormData(newFormData);
      setIsPristine(true);
      
      // Initialize RFP if exists
      if (entry.rfpId) {
        setShowRFPForm(true);
        setRfpStatus(entry.rfpStatus || "draft");
        setRfpData({
          ...rfpData,
          payee: entry.payee || "",
          amount: entry.amount?.toString() || "",
          amountInWords: convertAmountToWords(entry.amount || 0),
          company: entry.company || "",
          bookingNo: entry.bookingNo || "",
          category: entry.category || "",
        });
      } else {
        setShowRFPForm(false);
        setRfpStatus("draft");
      }
    } else if (open) {
      // Reset for new entry
      const newFormData = {
        type: "expense" as EntryType,
        amount: "",
        company: "",
        bookingNo: "",
        account: "",
        category: "",
        date: new Date(),
        note: "",
        attachments: [],
        status: "draft" as EntryStatus,
        payee: "",
        paymentMethod: "Cash",
        isNoBooking: false,
      };
      setFormData(newFormData);
      setShowRFPForm(false);
      setRfpStatus("draft");
      setIsPristine(true);
    }
    setErrors({});
    setRfpErrors({});
  }, [open, entry]);

  // Auto-sync entry data to RFP
  useEffect(() => {
    if (showRFPForm) {
      setRfpData(prev => ({
        ...prev,
        amount: formData.amount,
        amountInWords: formData.amount ? convertAmountToWords(parseFloat(formData.amount.replace(/,/g, ""))) : "",
        company: formData.company,
        bookingNo: formData.bookingNo,
        category: formData.category,
        payee: formData.payee,
      }));
    }
  }, [formData.amount, formData.company, formData.bookingNo, formData.category, formData.payee, showRFPForm]);

  const convertAmountToWords = (amount: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (amount === 0 || isNaN(amount)) return "Zero Pesos";

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

  const updateFormData = (updates: Partial<EntryFormData>) => {
    setFormData({ ...formData, ...updates });
    setIsPristine(false);
  };

  const updateRfpData = (updates: Partial<RFPFormData>) => {
    setRfpData({ ...rfpData, ...updates });
    setIsPristine(false);
  };

  const validateForm = useCallback((status: EntryStatus): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount is always required
    const cleanAmount = formData.amount.replace(/,/g, "");
    if (!formData.amount || parseFloat(cleanAmount) < 0.01) {
      newErrors.amount = "Amount must be greater than zero";
    }

    // For sending to approval or posting, validate all fields
    if (status === "pending" || status === "posted" || status === "approved") {
      if (!formData.company) newErrors.company = "Company is required";
      if (!formData.account) newErrors.account = "Account is required";
      if (!formData.category && formData.type !== "transfer") {
        newErrors.category = "Category is required";
      }
      if (!formData.payee) {
        newErrors.payee = "Add a payee to continue";
      }
      
      // Validate booking - either have a booking or mark as no booking
      if (!formData.bookingNo && !formData.isNoBooking) {
        newErrors.bookingNo = "Link a booking or mark this as a general expense";
      }
      
      // Check if booking is unverified
      if (formData.bookingNo && !isBookingVerified && !formData.isNoBooking) {
        newErrors.bookingNo = "Link a valid booking to post. Save as Draft to keep this number.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isBookingVerified]);

  const validateRFPForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!rfpData.payee.trim()) {
      newErrors.payee = "Payee is required.";
    }

    const amount = parseFloat(rfpData.amount.replace(/,/g, ""));
    if (!rfpData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be greater than zero.";
    }

    if (!rfpData.bookingNo && !rfpData.justification.trim()) {
      newErrors.justification = "Provide a justification when no booking is linked.";
    }

    if (rfpData.attachments.length === 0) {
      newErrors.attachments = "Attach at least one file.";
    }

    setRfpErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async (status: EntryStatus) => {
    if (!validateForm(status)) {
      return;
    }

    setIsSaving(true);
    try {
      onSave(formData, status);
      onOpenChange(false);
      const messages: Record<EntryStatus, string> = {
        draft: "Draft saved",
        pending: "Sent for approval",
        approved: "Entry approved",
        posted: "Entry posted",
        rejected: "Entry rejected",
      };
      toast.success(messages[status] || "Saved");
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, onSave, onOpenChange]);

  const handleCreateRFP = () => {
    // Initialize RFP with entry data
    setShowRFPForm(true);
    setRfpData({
      ...rfpData,
      payee: formData.payee,
      amount: formData.amount,
      amountInWords: formData.amount ? convertAmountToWords(parseFloat(formData.amount.replace(/,/g, ""))) : "",
      company: formData.company,
      bookingNo: formData.bookingNo,
      category: formData.category,
    });
    setRfpStatus("draft");
    toast.success("RFP form created");
  };

  const handleSubmitRFP = () => {
    if (!validateRFPForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Set status to submitted and entry status to pending
    setRfpStatus("submitted");
    updateFormData({ status: "pending" });
    toast.success("RFP submitted for approval");
    setIsPristine(false);
  };

  const handleCancelRFP = () => {
    if (confirm("Cancel this RFP? This action cannot be undone.")) {
      setShowRFPForm(false);
      setRfpStatus("draft");
      setRfpData({
        payee: "",
        amount: "",
        amountInWords: "",
        company: "",
        bookingNo: "",
        justification: "",
        category: "",
        accountToCredit: "Cash",
        dueDate: undefined,
        paymentTerms: "Net 7",
        costCenter: "",
        preparedBy: "Current User",
        attachments: [],
        notesToApprover: "",
      });
      updateFormData({ status: "draft" });
      toast.success("RFP cancelled");
    }
  };

  const handleClose = useCallback(() => {
    if (isPristine || confirm("You have unsaved changes. Close anyway?")) {
      onOpenChange(false);
    }
  }, [isPristine, onOpenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc to close if pristine
      if (e.key === "Escape" && isPristine) {
        onOpenChange(false);
      }

      // Cmd/Ctrl+S to save draft
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave("draft");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isPristine, onOpenChange, handleSave]);

  const currentCategories =
    formData.type === "revenue"
      ? categoryOptions.revenue
      : formData.type === "expense"
      ? categoryOptions.expense
      : [];

  const formatAmount = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, "");
    // Parse and format with thousand separators
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const isRFPLocked = rfpStatus === "submitted" || rfpStatus === "approved";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[888px] max-w-[min(920px,92vw)] max-h-[88vh] p-0 gap-0 border-[#E5E7EB] md:rounded-2xl rounded-none md:w-[888px] md:max-w-[min(920px,92vw)] w-full md:h-auto h-full md:max-h-[88vh] max-h-full flex flex-col [&>button]:hidden"
        style={{ boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
        aria-describedby={undefined}
      >
        {/* Header */}
        <DialogHeader className="md:px-5 px-4 md:py-4 py-3 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#0A1D4D]" style={{ fontSize: "18px", fontWeight: 700 }}>
              {entry ? "Edit Entry" : "New Entry"}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB]"
                title="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB]"
                onClick={handleClose}
                title="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto md:px-5 px-4 md:py-4 py-3">
          {/* Approval Banner */}
          {entry && (
            <ApprovalBanner
              status={formData.status}
              approverName={entry.approvedBy || entry.rejectedBy}
              approvalDate={entry.approvedDate}
              rejectionReason={entry.rejectionReason}
            />
          )}

          <div className="md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-4 flex flex-col gap-4">
            {/* Section 1: Type Selector - Spans 2 columns */}
            <div className="md:col-span-2">
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Type
              </Label>
              <div className="flex gap-2">
                <button
                  className={`h-9 flex-1 px-4 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D] ${
                    formData.type === "revenue"
                      ? "bg-[#EEF2FF] border-[#0A1D4D] text-[#0A1D4D]"
                      : "bg-white border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#C7CBD1] hover:text-[#374151]"
                  }`}
                  style={{ fontWeight: 600, fontSize: "14px" }}
                  onClick={() => updateFormData({ type: "revenue", category: "" })}
                >
                  Revenue
                </button>
                <button
                  className={`h-9 flex-1 px-4 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D] ${
                    formData.type === "expense"
                      ? "bg-[#EEF2FF] border-[#0A1D4D] text-[#0A1D4D]"
                      : "bg-white border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#C7CBD1] hover:text-[#374151]"
                  }`}
                  style={{ fontWeight: 600, fontSize: "14px" }}
                  onClick={() => updateFormData({ type: "expense", category: "" })}
                >
                  Expense
                </button>
                <button
                  className={`h-9 flex-1 px-4 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D] ${
                    formData.type === "transfer"
                      ? "bg-[#EEF2FF] border-[#0A1D4D] text-[#0A1D4D]"
                      : "bg-white border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#C7CBD1] hover:text-[#374151]"
                  }`}
                  style={{ fontWeight: 600, fontSize: "14px" }}
                  onClick={() => updateFormData({ type: "transfer", category: "" })}
                >
                  Transfer
                </button>
              </div>
            </div>

            {/* Section 2: Amount - Spans 2 columns */}
            <div className="md:col-span-2">
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" style={{ fontSize: "14px" }}>
                  ₱
                </span>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    const formatted = formatAmount(e.target.value);
                    updateFormData({ amount: formatted });
                  }}
                  className="h-12 pl-7 pr-3 text-right border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                  style={{ fontSize: "14px" }}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Section 3: Date (col 1) */}
            <div>
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Date
              </Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                    style={{ fontSize: "14px", fontWeight: 500 }}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2 text-[#6B7280]" />
                    {format(formData.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) {
                        updateFormData({ date });
                        setIsDatePickerOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Section 4: Account (col 2) */}
            <div>
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Account
              </Label>
              <Select value={formData.account} onValueChange={(value) => updateFormData({ account: value })}>
                <SelectTrigger className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2 rounded-[10px]" style={{ fontSize: "14px" }}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} style={{ fontSize: "14px" }}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account && (
                <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                  {errors.account}
                </p>
              )}
            </div>

            {/* Section 5: Company (col 1) */}
            <div>
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Company
              </Label>
              <Popover open={isCompanyPopoverOpen} onOpenChange={setIsCompanyPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-between border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                    style={{ fontSize: "14px", fontWeight: formData.company ? 500 : 400 }}
                  >
                    <span className="truncate">
                      {formData.company ? getCompanyById(formData.company)?.name : "Select company"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-3 w-[280px]"
                  align="start"
                  style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
                >
                  <div className="space-y-3">
                    {/* Search field */}
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                      <Input
                        placeholder="Search companies…"
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="h-7 pl-7 pr-2 text-[12px] border-neutral-300 rounded-lg focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
                      />
                    </div>

                    {/* Company list */}
                    <div className="space-y-1 max-h-[240px] overflow-y-auto">
                      {COMPANIES.filter((c) =>
                        c.name.toLowerCase().includes(companySearch.toLowerCase())
                      ).map((companyItem) => (
                        <button
                          key={companyItem.id}
                          className="w-full flex items-start gap-2 min-h-[36px] py-1.5 hover:bg-[#F9FAFB] rounded-md px-1 transition-colors text-left"
                          onClick={() => {
                            updateFormData({ company: companyItem.id });
                            setIsCompanyPopoverOpen(false);
                            setCompanySearch("");
                          }}
                        >
                          <div
                            className={`mt-0.5 rounded-sm border flex-shrink-0 ${
                              formData.company === companyItem.id
                                ? "bg-[#0A1D4D] border-[#0A1D4D]"
                                : "border-neutral-300"
                            }`}
                            style={{ width: "16px", height: "16px" }}
                          >
                            {formData.company === companyItem.id && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M13 4L6 11L3 8"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className="text-[12px] leading-snug text-[#111827] flex-1"
                            style={{
                              fontWeight: 500,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              maxHeight: "32px",
                            }}
                          >
                            {companyItem.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                Saved as company ID
              </p>
              {errors.company && (
                <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                  {errors.company}
                </p>
              )}
            </div>

            {/* Section 6: Category (col 2) */}
            {formData.type !== "transfer" ? (
              <div>
                <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData({ category: value })}
                >
                  <SelectTrigger className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2 rounded-[10px]" style={{ fontSize: "14px" }}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategories.map((option) => (
                      <SelectItem key={option.value} value={option.value} style={{ fontSize: "14px" }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: option.color }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                    {errors.category}
                  </p>
                )}
              </div>
            ) : (
              <div></div>
            )}

            {/* Section 7: Booking No - Spans 2 columns */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[#374151]" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Booking No
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="no-booking"
                    checked={formData.isNoBooking}
                    onCheckedChange={(checked) => {
                      updateFormData({ 
                        isNoBooking: checked === true, 
                        bookingNo: checked ? "" : formData.bookingNo 
                      });
                    }}
                  />
                  <Label
                    htmlFor="no-booking"
                    className="text-[#6B7280] cursor-pointer"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    No booking (general expense)
                  </Label>
                </div>
              </div>
              <BookingPicker
                value={formData.bookingNo}
                onChange={(bookingNo) => updateFormData({ bookingNo })}
                companyId={formData.company}
                entryDate={formData.date}
                error={errors.bookingNo}
                onVerificationChange={setIsBookingVerified}
                disabled={formData.isNoBooking}
              />
              {formData.isNoBooking && (
                <p className="mt-1 text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Provide a clear note for audit.
                </p>
              )}
            </div>

            {/* Section 8: Note - Spans 2 columns */}
            <div className="md:col-span-2">
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Note
              </Label>
              <Textarea
                placeholder="Add notes or details…"
                value={formData.note}
                onChange={(e) => updateFormData({ note: e.target.value })}
                className="min-h-[72px] max-h-[144px] border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px] resize-y"
                style={{ fontSize: "14px" }}
                rows={3}
                disabled={formData.status === "pending" || formData.status === "approved"}
              />
            </div>

            {/* Payment Details Divider */}
            <div className="md:col-span-2">
              <div className="border-t border-[#E5E7EB] pt-4 -mt-2">
                <h4 className="text-[#6B7280] mb-4" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Payment Details
                </h4>
              </div>
            </div>

            {/* Payee (col 1) */}
            <div>
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Payee <span className="text-[#B91C1C]">*</span>
              </Label>
              <Input
                placeholder="Who will receive payment?"
                value={formData.payee}
                onChange={(e) => updateFormData({ payee: e.target.value })}
                className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                style={{ fontSize: "14px" }}
                disabled={formData.status === "pending" || formData.status === "approved"}
              />
              {errors.payee && (
                <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                  {errors.payee}
                </p>
              )}
            </div>

            {/* Payment Method (col 2) */}
            <div>
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Payment Method
              </Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => updateFormData({ paymentMethod: value })}
                disabled={formData.status === "pending" || formData.status === "approved"}
              >
                <SelectTrigger className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2 rounded-[10px]" style={{ fontSize: "14px" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash" style={{ fontSize: "14px" }}>Cash</SelectItem>
                  <SelectItem value="Bank - BPI" style={{ fontSize: "14px" }}>Bank – BPI</SelectItem>
                  <SelectItem value="Bank - BDO" style={{ fontSize: "14px" }}>Bank – BDO</SelectItem>
                  <SelectItem value="GCash" style={{ fontSize: "14px" }}>GCash</SelectItem>
                  <SelectItem value="Check" style={{ fontSize: "14px" }}>Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Section 9: Attachment - Spans 2 columns */}
            <div className="md:col-span-2">
              <Button
                variant="outline"
                className="h-9 border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] rounded-[10px]"
                style={{ fontSize: "14px", fontWeight: 600 }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    updateFormData({ attachments: [...formData.attachments, ...files] });
                  };
                  input.click();
                }}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                {formData.attachments.length > 0
                  ? `${formData.attachments.length} file(s) attached`
                  : "Add receipt"}
              </Button>
            </div>
          </div>

          {/* RFP Section - Only for Expenses */}
          {formData.type === "expense" && entry && (
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <h4 className="text-[#374151] mb-3" style={{ fontSize: "14px", fontWeight: 700 }}>
                Request for Payment
              </h4>
              
              {!showRFPForm ? (
                <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                  <p className="text-[#6B7280] mb-1" style={{ fontSize: "13px", fontWeight: 600 }}>
                    No RFP created.
                  </p>
                  <p className="text-[#9CA3AF]" style={{ fontSize: "12px", fontWeight: 500 }}>
                    Create an RFP to request approval and printing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* RFP Form Fields */}
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {/* Payee / Vendor */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Payee / Vendor <span className="text-[#B91C1C]">*</span>
                      </Label>
                      <Input
                        placeholder="Who will receive payment?"
                        value={rfpData.payee}
                        onChange={(e) => updateRfpData({ payee: e.target.value })}
                        className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                        style={{ fontSize: "14px" }}
                        disabled={isRFPLocked}
                      />
                      {rfpErrors.payee && (
                        <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                          {rfpErrors.payee}
                        </p>
                      )}
                    </div>

                    {/* Amount to Pay */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Amount to Pay <span className="text-[#B91C1C]">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" style={{ fontSize: "14px" }}>
                          ₱
                        </span>
                        <Input
                          type="text"
                          placeholder="0.00"
                          value={rfpData.amount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, "");
                            updateRfpData({ 
                              amount: value,
                              amountInWords: value ? convertAmountToWords(parseFloat(value)) : "",
                            });
                          }}
                          className="h-12 pl-7 pr-3 text-right border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                          style={{ fontSize: "14px" }}
                          disabled={isRFPLocked}
                        />
                      </div>
                      {rfpErrors.amount && (
                        <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                          {rfpErrors.amount}
                        </p>
                      )}
                    </div>

                    {/* Amount in Words */}
                    <div className="md:col-span-2">
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Amount in Words
                      </Label>
                      <Input
                        placeholder="Auto-generated"
                        value={rfpData.amountInWords}
                        onChange={(e) => updateRfpData({ amountInWords: e.target.value })}
                        className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                        style={{ fontSize: "14px", fontStyle: "italic" }}
                        disabled={isRFPLocked}
                      />
                    </div>

                    {/* Company (locked) */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Company
                      </Label>
                      <Input
                        value={getCompanyById(rfpData.company)?.name || rfpData.company}
                        className="h-12 border-[#D1D5DB] bg-[#F9FAFB] rounded-[10px]"
                        style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}
                        disabled
                        readOnly
                      />
                      <p className="mt-1 text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
                        From entry
                      </p>
                    </div>

                    {/* Booking No (locked) */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Booking No
                      </Label>
                      <Input
                        value={rfpData.bookingNo || "—"}
                        className="h-12 border-[#D1D5DB] bg-[#F9FAFB] rounded-[10px]"
                        style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}
                        disabled
                        readOnly
                      />
                      {!rfpData.bookingNo && (
                        <p className="mt-1 text-[#9CA3AF]" style={{ fontSize: "12px", fontWeight: 500 }}>
                          General expense (no booking linked)
                        </p>
                      )}
                    </div>

                    {/* Justification - only if no booking */}
                    {!rfpData.bookingNo && (
                      <div className="md:col-span-2">
                        <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                          Justification <span className="text-[#B91C1C]">*</span>
                        </Label>
                        <Textarea
                          placeholder="Explain why this expense is not linked to a booking…"
                          value={rfpData.justification}
                          onChange={(e) => updateRfpData({ justification: e.target.value })}
                          className="min-h-[72px] border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                          style={{ fontSize: "14px" }}
                          rows={3}
                          disabled={isRFPLocked}
                        />
                        {rfpErrors.justification && (
                          <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                            {rfpErrors.justification}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Category (locked) */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Category
                      </Label>
                      <Input
                        value={rfpData.category}
                        className="h-12 border-[#D1D5DB] bg-[#F9FAFB] rounded-[10px]"
                        style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}
                        disabled
                        readOnly
                      />
                    </div>

                    {/* Account to Credit */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Account to Credit
                      </Label>
                      <Select 
                        value={rfpData.accountToCredit} 
                        onValueChange={(value) => updateRfpData({ accountToCredit: value })}
                        disabled={isRFPLocked}
                      >
                        <SelectTrigger className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2 rounded-[10px]" style={{ fontSize: "14px" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash" style={{ fontSize: "14px" }}>Cash</SelectItem>
                          <SelectItem value="Bank - BPI" style={{ fontSize: "14px" }}>Bank – BPI</SelectItem>
                          <SelectItem value="Bank - BDO" style={{ fontSize: "14px" }}>Bank – BDO</SelectItem>
                          <SelectItem value="GCash" style={{ fontSize: "14px" }}>GCash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Due Date */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Due Date
                      </Label>
                      <Popover open={isDueDatePickerOpen} onOpenChange={setIsDueDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                            style={{ fontSize: "14px", fontWeight: 500 }}
                            disabled={isRFPLocked}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2 text-[#6B7280]" />
                            {rfpData.dueDate ? format(rfpData.dueDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={rfpData.dueDate}
                            onSelect={(date) => {
                              updateRfpData({ dueDate: date });
                              setIsDueDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Payment Terms */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Payment Terms
                      </Label>
                      <Select 
                        value={rfpData.paymentTerms} 
                        onValueChange={(value) => updateRfpData({ paymentTerms: value })}
                        disabled={isRFPLocked}
                      >
                        <SelectTrigger className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2 rounded-[10px]" style={{ fontSize: "14px" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Net 7" style={{ fontSize: "14px" }}>Net 7</SelectItem>
                          <SelectItem value="Net 15" style={{ fontSize: "14px" }}>Net 15</SelectItem>
                          <SelectItem value="Net 30" style={{ fontSize: "14px" }}>Net 30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cost Center */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Cost Center
                      </Label>
                      <Input
                        placeholder="Optional"
                        value={rfpData.costCenter}
                        onChange={(e) => updateRfpData({ costCenter: e.target.value })}
                        className="h-12 border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                        style={{ fontSize: "14px" }}
                        disabled={isRFPLocked}
                      />
                    </div>

                    {/* Prepared By (locked) */}
                    <div>
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Prepared By
                      </Label>
                      <Input
                        value={rfpData.preparedBy}
                        className="h-12 border-[#D1D5DB] bg-[#F9FAFB] rounded-[10px]"
                        style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}
                        disabled
                        readOnly
                      />
                    </div>

                    {/* Attachments */}
                    <div className="md:col-span-2">
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Attachments <span className="text-[#B91C1C]">*</span>
                      </Label>
                      {!isRFPLocked && (
                        <Button
                          variant="outline"
                          className="w-full h-12 border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] rounded-[10px] justify-start"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.multiple = true;
                            input.onchange = (e) => {
                              const files = Array.from((e.target as HTMLInputElement).files || []);
                              updateRfpData({ attachments: [...rfpData.attachments, ...files] });
                            };
                            input.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {rfpData.attachments.length > 0 
                            ? `${rfpData.attachments.length} file(s) attached` 
                            : "Upload files"}
                        </Button>
                      )}
                      
                      {rfpData.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {rfpData.attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                            >
                              <span className="text-[#374151] truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                                {file.name}
                              </span>
                              {!isRFPLocked && (
                                <button
                                  onClick={() => {
                                    const newAttachments = rfpData.attachments.filter((_, i) => i !== index);
                                    updateRfpData({ attachments: newAttachments });
                                  }}
                                  className="text-[#9CA3AF] hover:text-[#B91C1C] transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {rfpErrors.attachments && (
                        <p className="mt-1 text-[#B91C1C]" style={{ fontSize: "12px" }}>
                          {rfpErrors.attachments}
                        </p>
                      )}
                    </div>

                    {/* Notes to Approver */}
                    <div className="md:col-span-2">
                      <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Notes to Approver
                      </Label>
                      <Textarea
                        placeholder="Optional notes for the approver…"
                        value={rfpData.notesToApprover}
                        onChange={(e) => updateRfpData({ notesToApprover: e.target.value })}
                        className="min-h-[72px] border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px]"
                        style={{ fontSize: "14px" }}
                        rows={3}
                        disabled={isRFPLocked}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="md:px-5 px-4 py-3 border-t border-[#E5E7EB] flex-shrink-0 flex md:flex-row flex-col-reverse md:items-center md:justify-between gap-3">
          <p className="text-[#6B7280] md:text-left text-center" style={{ fontSize: "12px", fontWeight: 500 }}>
            All amounts in PHP
          </p>
          <div className="flex md:flex-row flex-col gap-3 md:w-auto w-full">
            {/* Always show Save as Draft and Update Entry */}
            <Button
              variant="outline"
              className="h-10 border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] rounded-[10px] md:w-auto w-full md:order-1 order-2"
              style={{ fontSize: "14px", fontWeight: 600 }}
              onClick={() => handleSave("draft")}
              disabled={isSaving || !formData.amount || parseFloat(formData.amount.replace(/,/g, "")) < 0.01 || (rfpStatus === "submitted")}
            >
              Save as Draft
            </Button>
            <Button
              className="h-10 bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-[10px] md:w-auto w-full md:order-2 order-1"
              style={{ fontSize: "14px", fontWeight: 600 }}
              onClick={() => handleSave("posted")}
              disabled={isSaving || (rfpStatus === "submitted" || rfpStatus === "approved")}
            >
              {isSaving ? "Saving..." : entry ? "Update Entry" : "Post Entry"}
            </Button>
            
            {/* RFP Buttons - Only for Expenses */}
            {formData.type === "expense" && entry && (
              <>
                {!showRFPForm ? (
                  <Button
                    className="h-10 bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-[10px] md:w-auto w-full"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                    onClick={handleCreateRFP}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create RFP
                  </Button>
                ) : (
                  <>
                    {rfpStatus === "draft" && (
                      <>
                        <Button
                          className="h-10 bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-[10px] md:w-auto w-full"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                          onClick={handleSubmitRFP}
                          disabled={!rfpData.payee || !rfpData.amount || rfpData.attachments.length === 0}
                        >
                          Submit for Approval
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-10 text-[#B91C1C] hover:bg-[#FEE2E2] rounded-[10px] md:w-auto w-full"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                          onClick={handleCancelRFP}
                        >
                          Cancel RFP
                        </Button>
                      </>
                    )}
                    {(formData.status === "posted" || formData.status === "approved") && onPrintRFP && (
                      <Button
                        className="h-10 bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-[10px] md:w-auto w-full"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                        onClick={onPrintRFP}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print RFP
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
