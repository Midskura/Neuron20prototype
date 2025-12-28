import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Upload, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import { NumericKeypad } from "./NumericKeypad";
import { COMPANIES, getCompanyById } from "./companies";
import { Checkbox } from "../ui/checkbox";

type EntryType = "revenue" | "expense" | "transfer";

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
  includeTax: boolean;
  status: "draft" | "posted";
}

interface EntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: any;
  onSave: (data: EntryFormData, status: "draft" | "posted") => void;
  onDelete?: () => void;
  companyOptions: Array<{ value: string; label: string }>;
  bookingOptions: Array<{ value: string; label: string }>;
  accountOptions: Array<{ value: string; label: string }>;
  categoryOptions: {
    revenue: Array<{ value: string; label: string; color: string }>;
    expense: Array<{ value: string; label: string; color: string }>;
  };
}

export function EntrySheet({
  open,
  onOpenChange,
  entry,
  onSave,
  onDelete,
  companyOptions,
  bookingOptions,
  accountOptions,
  categoryOptions,
}: EntrySheetProps) {
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
    includeTax: false,
    status: "draft",
  });

  const [showKeypad, setShowKeypad] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCompanyPopoverOpen, setIsCompanyPopoverOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");

  useEffect(() => {
    if (open && entry) {
      setFormData({
        type: entry.type || "expense",
        amount: entry.amount?.toString() || "",
        company: entry.company || "",
        bookingNo: entry.bookingNo || "",
        account: (entry as any).accountId || "",
        category: entry.category || "",
        date: entry.date ? new Date(entry.date) : new Date(),
        note: entry.note || "",
        attachments: [],
        includeTax: (entry as any).includeTax || false,
        status: entry.status || "draft",
      });
    } else if (open) {
      // Reset for new entry
      setFormData({
        type: "expense",
        amount: "",
        company: "",
        bookingNo: "",
        account: "",
        category: "",
        date: new Date(),
        note: "",
        attachments: [],
        includeTax: false,
        status: "draft",
      });
    }
  }, [open, entry]);

  const handleSave = (status: "draft" | "posted") => {
    // Validation
    if (!formData.company || !formData.bookingNo) {
      alert("Booking No and Company are required.");
      return;
    }

    onSave(formData, status);
    onOpenChange(false);
  };

  const currentCategories = formData.type === "revenue" 
    ? categoryOptions.revenue 
    : formData.type === "expense" 
    ? categoryOptions.expense 
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{entry ? "Edit Entry" : "New Entry"}</SheetTitle>
          <SheetDescription>
            {entry ? "Edit the details of this accounting entry" : "Create a new accounting entry for revenue, expense, or transfer"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Type Segmented Control */}
          <div className="flex gap-2 p-1 bg-[#F9FAFB] w-fit rounded-lg">
            <button
              className={`px-4 py-2 text-[14px] transition-colors rounded-md ${
                formData.type === "revenue"
                  ? "bg-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#374151]"
              }`}
              onClick={() => setFormData({ ...formData, type: "revenue", category: "" })}
            >
              Revenue
            </button>
            <button
              className={`px-4 py-2 text-[14px] transition-colors rounded-md ${
                formData.type === "expense"
                  ? "bg-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#374151]"
              }`}
              onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
            >
              Expense
            </button>
            <button
              className={`px-4 py-2 text-[14px] transition-colors rounded-md ${
                formData.type === "transfer"
                  ? "bg-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#374151]"
              }`}
              onClick={() => setFormData({ ...formData, type: "transfer", category: "" })}
            >
              Transfer
            </button>
          </div>

          {/* Amount with Keypad */}
          <div className="space-y-2">
            <Label>Amount</Label>
            {showKeypad ? (
              <NumericKeypad
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
              />
            ) : (
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="text-[20px] h-14"
              />
            )}
            <button
              className="text-[12px] text-[#6B7280] hover:text-[#374151]"
              onClick={() => setShowKeypad(!showKeypad)}
            >
              {showKeypad ? "Use text input" : "Use keypad"}
            </button>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label>Company <span className="text-red-600">*</span></Label>
            <Popover open={isCompanyPopoverOpen} onOpenChange={setIsCompanyPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCompanyPopoverOpen}
                  className="w-full justify-between h-10 text-[14px] border-neutral-300 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D]"
                  style={{ fontWeight: formData.company ? 500 : 400 }}
                >
                  {formData.company
                    ? getCompanyById(formData.company)?.name
                    : "Select company"}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="p-3 md:w-[280px] w-[320px]" 
                align="start"
                style={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
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
                          setFormData({ ...formData, company: companyItem.id });
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
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            maxHeight: '32px',
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
            <p className="text-[11px] text-[#6B7280]">Saved as company ID</p>
          </div>

          {/* Booking No */}
          <div className="space-y-2">
            <Label>Booking No <span className="text-red-600">*</span></Label>
            <Select value={formData.bookingNo} onValueChange={(value) => setFormData({ ...formData, bookingNo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Search booking…" />
              </SelectTrigger>
              <SelectContent>
                {bookingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Account</Label>
            <Select value={formData.account} onValueChange={(value) => setFormData({ ...formData, account: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          {formData.type !== "transfer" && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date/Time */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-[14px]">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(formData.date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => {
                    if (date) {
                      setFormData({ ...formData, date });
                      setIsDatePickerOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Add notes or details…"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
                };
                input.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              {formData.attachments.length > 0 
                ? `${formData.attachments.length} file(s) attached` 
                : "Upload files"}
            </Button>
          </div>

          {/* Tax Toggle */}
          <div className="flex items-center justify-between">
            <Label>Include Tax</Label>
            <Switch
              checked={formData.includeTax}
              onCheckedChange={(checked) => setFormData({ ...formData, includeTax: checked })}
            />
          </div>

          {/* Validation Message */}
          {(!formData.company || !formData.bookingNo) && (
            <div className="text-[12px] text-[#6B7280] p-3 bg-[#F9FAFB] rounded-lg">
              Booking No and Company are required.
            </div>
          )}
        </div>

        <SheetFooter className="flex justify-between border-t pt-4">
          <div>
            {entry && onDelete && (
              <Button variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave("draft")}>
              Save as Draft
            </Button>
            <Button 
              className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white"
              onClick={() => handleSave("posted")}
            >
              Post
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
