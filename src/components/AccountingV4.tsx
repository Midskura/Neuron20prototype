import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  Save,
  CheckCircle2,
  Printer,
  Download,
  Eye,
  ChevronDown,
} from "lucide-react";
import { toast } from "./ui/toast-utils";
import { cn } from "./ui/utils";

type EntryType = "Revenue" | "Expense" | "Transfer";
type EntryStatus = "Posted" | "Pending approval";

interface Entry {
  id: string;
  date: string;
  category: string;
  bookingNo: string;
  type: EntryType;
  company: string;
  paymentChannel: string;
  amount: number;
  status: EntryStatus;
  referenceNo?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  // Sales/Job Profit Fields (Revenue only)
  jobNo?: string;
  jobDate?: string;
  billingNo?: string;
  particulars?: string;
  itemizedCost?: number;
  expenses?: number;
  adminCostPercent?: number;
  collectedAmount?: number;
  collectedDate?: string;
  showInSalesReport?: boolean;
}

interface Category {
  id: string;
  name: string;
  type: "Revenue" | "Expense";
  company: string;
  active: boolean;
}

type ReportType = "Sales Profit" | "Receivables" | "Category Summary";

const COMPANIES = ["CCE", "ZNICF", "JLCS", "All"];
const PAYMENT_CHANNELS = ["Cash", "Petty Cash", "BPI", "BDO", "GCash"];

// Mock data
const mockEntries: Entry[] = [
  {
    id: "1",
    date: "2025-10-15",
    category: "Trucking Cost",
    bookingNo: "FCL-IMP-00012-SEA",
    type: "Revenue",
    company: "CCE",
    paymentChannel: "BPI",
    amount: 82500,
    status: "Posted",
    jobNo: "CPTC-SHOE-258011",
    billingNo: "No. 0012",
    particulars: "Trucking Cost",
    itemizedCost: 2000,
    expenses: 1090,
    adminCostPercent: 3,
    collectedAmount: 5040,
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "2025-10-15 09:30 AM",
  },
  {
    id: "2",
    date: "2025-10-14",
    category: "Fuel",
    bookingNo: "LCL-EXP-00008-AIR",
    type: "Expense",
    company: "ZNICF",
    paymentChannel: "Cash",
    amount: 4500,
    status: "Posted",
    createdBy: "Staff",
    createdAt: "2025-10-14 02:15 PM",
  },
  {
    id: "3",
    date: "2025-10-13",
    category: "Handling Fee",
    bookingNo: "FCL-DOM-00005-TRUCK",
    type: "Revenue",
    company: "CCE",
    paymentChannel: "GCash",
    amount: 12000,
    status: "Pending approval",
    createdBy: "Admin",
    createdAt: "2025-10-13 11:00 AM",
  },
];

const mockCategories: Category[] = [
  { id: "1", name: "Trucking Cost", type: "Revenue", company: "CCE", active: true },
  { id: "2", name: "Fuel", type: "Expense", company: "All", active: true },
  { id: "3", name: "Handling Fee", type: "Revenue", company: "CCE", active: true },
  { id: "4", name: "Office Supplies", type: "Expense", company: "ZNICF", active: false },
];

export default function AccountingV4() {
  const [activeTab, setActiveTab] = useState<"Entries" | "Categories" | "Reports">("Entries");
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)); // October 2025
  
  // Entries tab state
  const [entries, setEntries] = useState<Entry[]>(mockEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompany, setFilterCompany] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isEntrySheetOpen, setIsEntrySheetOpen] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(false);
  
  // Categories tab state
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Reports tab state
  const [activeReport, setActiveReport] = useState<ReportType>("Sales Profit");
  const [reportPeriod, setReportPeriod] = useState("Oct 2025");
  const [reportCompany, setReportCompany] = useState("CCE");
  const [reportSource, setReportSource] = useState("Both");
  const [showReportPreview, setShowReportPreview] = useState(false);

  // Navigate month
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Filtered entries
  const filteredEntries = entries.filter(entry => {
    if (searchQuery && !entry.bookingNo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCompany !== "All" && entry.company !== filterCompany) return false;
    if (filterType !== "All" && entry.type !== filterType) return false;
    if (filterCategory !== "All" && entry.category !== filterCategory) return false;
    if (filterStatus !== "All" && entry.status !== filterStatus) return false;
    return true;
  });

  // Count stats
  const totalEntries = entries.length;
  const bookingsCount = new Set(entries.map(e => e.bookingNo)).size;
  const approvalsCount = entries.filter(e => e.status === "Pending approval").length;

  const handleNewEntry = () => {
    setSelectedEntry({
      id: `temp-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      category: "",
      bookingNo: "",
      type: "Revenue",
      company: "CCE",
      paymentChannel: "Cash",
      amount: 0,
      status: "Pending approval",
      adminCostPercent: 3,
      showInSalesReport: true,
    });
    setIsNewEntry(true);
    setIsEntrySheetOpen(true);
  };

  const handleSaveEntry = () => {
    if (!selectedEntry) return;
    
    if (isNewEntry) {
      setEntries([...entries, { ...selectedEntry, id: `entry-${Date.now()}` }]);
      toast.success("Entry created successfully");
    } else {
      setEntries(entries.map(e => e.id === selectedEntry.id ? selectedEntry : e));
      toast.success("Entry updated successfully");
    }
    
    setIsEntrySheetOpen(false);
    setSelectedEntry(null);
    setIsNewEntry(false);
  };

  const handlePostEntry = () => {
    if (!selectedEntry) return;
    const updated = { ...selectedEntry, status: "Posted" as EntryStatus };
    setSelectedEntry(updated);
    setEntries(entries.map(e => e.id === updated.id ? updated : e));
    toast.success("Entry posted to accounting");
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex items-center gap-2 pt-6">
            {(["Entries", "Categories", "Reports"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-full text-[14px] transition-all",
                  activeTab === tab
                    ? "bg-[#0A1D4D] text-white"
                    : "bg-transparent text-[#6B7280] hover:bg-[#F3F4F6]"
                )}
                style={{ fontWeight: activeTab === tab ? 600 : 500 }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* ENTRIES TAB */}
        {activeTab === "Entries" && (
          <div className="space-y-6">
            {/* Month Navigator Card */}
            <Card className="p-6 border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
                  </button>
                  <h2 className="text-[18px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                    {formatMonth(currentMonth)}
                  </h2>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Count Pills */}
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-[#F3F4F6] rounded-full">
                      <span className="text-[13px] text-[#6B7280]" style={{ fontWeight: 500 }}>
                        Entries • <span className="text-[#0A1D4D]" style={{ fontWeight: 600 }}>{totalEntries}</span>
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-[#F3F4F6] rounded-full">
                      <span className="text-[13px] text-[#6B7280]" style={{ fontWeight: 500 }}>
                        Bookings • <span className="text-[#0A1D4D]" style={{ fontWeight: 600 }}>{bookingsCount}</span>
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-[#F3F4F6] rounded-full">
                      <span className="text-[13px] text-[#6B7280]" style={{ fontWeight: 500 }}>
                        Approvals • <span className="text-[#F25C05]" style={{ fontWeight: 600 }}>{approvalsCount}</span>
                      </span>
                    </div>
                  </div>

                  {/* New Entry Button */}
                  <Button
                    onClick={handleNewEntry}
                    className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-10 px-4"
                    style={{ fontWeight: 600 }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                  </Button>
                </div>
              </div>
            </Card>

            {/* Filters Bar */}
            <Card className="p-4 border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <Input
                    placeholder="Search booking…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-[#E5E7EB] rounded-lg"
                  />
                </div>

                {/* Company Filter */}
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="w-40 h-10 border-[#E5E7EB] rounded-lg">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 h-10 border-[#E5E7EB] rounded-lg">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40 h-10 border-[#E5E7EB] rounded-lg">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.filter(c => c.active).map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 h-10 border-[#E5E7EB] rounded-lg">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Posted">Posted</SelectItem>
                    <SelectItem value="Pending approval">Pending approval</SelectItem>
                  </SelectContent>
                </Select>

                {/* Refresh */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg hover:bg-[#F3F4F6]"
                >
                  <RefreshCw className="w-4 h-4 text-[#6B7280]" />
                </Button>
              </div>
            </Card>

            {/* Entries Table */}
            <Card className="border-[#E5E7EB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Booking / Job No.
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Payment Channel
                      </th>
                      <th className="px-6 py-3 text-right text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsNewEntry(false);
                          setIsEntrySheetOpen(true);
                        }}
                        className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                          {entry.category}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#374151] font-mono" style={{ fontWeight: 500 }}>
                          {entry.bookingNo}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={cn(
                              "rounded-full",
                              entry.type === "Revenue" && "bg-[#D1FAE5] text-[#059669]",
                              entry.type === "Expense" && "bg-[#FEE2E2] text-[#DC2626]",
                              entry.type === "Transfer" && "bg-[#E0E7FF] text-[#4F46E5]"
                            )}
                          >
                            {entry.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {entry.company}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {entry.paymentChannel}
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                          ₱{entry.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={cn(
                              "rounded-full",
                              entry.status === "Posted" && "bg-[#F3F4F6] text-[#6B7280]",
                              entry.status === "Pending approval" && "bg-[#FEF3C7] text-[#D97706]"
                            )}
                          >
                            {entry.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "Categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                Categories
              </h2>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-10 px-4"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Category
              </Button>
            </div>

            <Card className="border-[#E5E7EB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Category Name
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                        Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        onClick={() => {
                          setEditingCategory(category);
                          setIsCategoryModalOpen(true);
                        }}
                        className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                          {category.name}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={cn(
                              "rounded-full",
                              category.type === "Revenue" && "bg-[#D1FAE5] text-[#059669]",
                              category.type === "Expense" && "bg-[#FEE2E2] text-[#DC2626]"
                            )}
                          >
                            {category.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {category.company}
                        </td>
                        <td className="px-6 py-4">
                          <Switch
                            checked={category.active}
                            onCheckedChange={(checked) => {
                              setCategories(categories.map(c =>
                                c.id === category.id ? { ...c, active: checked } : c
                              ));
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "Reports" && (
          <div className="space-y-6">
            {/* Report Type Pills */}
            <div className="flex items-center gap-2">
              {(["Sales Profit", "Receivables", "Category Summary"] as const).map((report) => (
                <button
                  key={report}
                  onClick={() => setActiveReport(report)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[14px] transition-all",
                    activeReport === report
                      ? "bg-[#0A1D4D] text-white"
                      : "bg-white text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]"
                  )}
                  style={{ fontWeight: activeReport === report ? 600 : 500 }}
                >
                  {report}
                </button>
              ))}
            </div>

            {/* Filters Bar */}
            <Card className="p-4 border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <Label className="text-[12px] text-[#6B7280] mb-1 block">Period</Label>
                    <Input
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      className="w-40 h-9 border-[#E5E7EB] rounded-lg text-[13px]"
                    />
                  </div>
                  <div>
                    <Label className="text-[12px] text-[#6B7280] mb-1 block">Company</Label>
                    <Select value={reportCompany} onValueChange={setReportCompany}>
                      <SelectTrigger className="w-32 h-9 border-[#E5E7EB] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANIES.map(company => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[12px] text-[#6B7280] mb-1 block">Source</Label>
                    <Select value={reportSource} onValueChange={setReportSource}>
                      <SelectTrigger className="w-32 h-9 border-[#E5E7EB] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Both">Both</SelectItem>
                        <SelectItem value="Bookings">Bookings</SelectItem>
                        <SelectItem value="Entries">Entries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowReportPreview(true)}
                    className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-lg h-10 px-4"
                    style={{ fontWeight: 600 }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg h-10 px-4"
                    style={{ fontWeight: 600 }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg h-10 px-4"
                    style={{ fontWeight: 600 }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </Card>

            {/* Report Preview/Placeholder */}
            <Card className="p-8 border-[#E5E7EB] bg-white">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F3F4F6] rounded-full mb-4">
                  <Eye className="w-8 h-8 text-[#9CA3AF]" />
                </div>
                <h3 className="text-[16px] text-[#0A1D4D] mb-2" style={{ fontWeight: 600 }}>
                  {activeReport} Report
                </h3>
                <p className="text-[13px] text-[#6B7280]">
                  Click "Preview" to generate the report
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Entry File Sheet */}
      <Sheet open={isEntrySheetOpen} onOpenChange={setIsEntrySheetOpen}>
        <SheetContent side="right" className="w-[900px] max-w-[90vw] p-0 overflow-y-auto">
          {selectedEntry && (
            <>
              <SheetHeader className="px-6 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-[18px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                    Entry File – {selectedEntry.bookingNo || "New Entry"}
                  </SheetTitle>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSaveEntry}
                      className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-lg h-10 px-4"
                      style={{ fontWeight: 600 }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    {!isNewEntry && selectedEntry.status === "Pending approval" && (
                      <Button
                        onClick={handlePostEntry}
                        className="bg-[#10B981] hover:bg-[#059669] text-white rounded-lg h-10 px-4"
                        style={{ fontWeight: 600 }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg h-10 px-4"
                      style={{ fontWeight: 600 }}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <Card className="p-5 border-[#E5E7EB]">
                      <h3 className="text-[14px] text-[#0A1D4D] mb-4" style={{ fontWeight: 700 }}>
                        General Entry Info
                      </h3>
                      <div className="space-y-4">
                        {/* Entry Type */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Entry Type</Label>
                          <div className="flex gap-2">
                            {(["Revenue", "Expense", "Transfer"] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => setSelectedEntry({ ...selectedEntry, type })}
                                className={cn(
                                  "flex-1 px-4 py-2 rounded-lg text-[13px] transition-all border",
                                  selectedEntry.type === type
                                    ? "bg-[#0A1D4D] text-white border-[#0A1D4D]"
                                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]"
                                )}
                                style={{ fontWeight: 600 }}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Date</Label>
                          <Input
                            type="date"
                            value={selectedEntry.date}
                            onChange={(e) => setSelectedEntry({ ...selectedEntry, date: e.target.value })}
                            className="h-10 border-[#E5E7EB] rounded-lg"
                          />
                        </div>

                        {/* Company */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Company</Label>
                          <Select
                            value={selectedEntry.company}
                            onValueChange={(value) => setSelectedEntry({ ...selectedEntry, company: value })}
                          >
                            <SelectTrigger className="h-10 border-[#E5E7EB] rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPANIES.filter(c => c !== "All").map(company => (
                                <SelectItem key={company} value={company}>{company}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payment Channel */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Payment Channel</Label>
                          <Select
                            value={selectedEntry.paymentChannel}
                            onValueChange={(value) => setSelectedEntry({ ...selectedEntry, paymentChannel: value })}
                          >
                            <SelectTrigger className="h-10 border-[#E5E7EB] rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_CHANNELS.map(channel => (
                                <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Amount */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280]">₱</span>
                            <Input
                              type="number"
                              value={selectedEntry.amount}
                              onChange={(e) => setSelectedEntry({ ...selectedEntry, amount: parseFloat(e.target.value) || 0 })}
                              className="pl-7 h-10 border-[#E5E7EB] rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Category</Label>
                          <Select
                            value={selectedEntry.category}
                            onValueChange={(value) => setSelectedEntry({ ...selectedEntry, category: value })}
                          >
                            <SelectTrigger className="h-10 border-[#E5E7EB] rounded-lg">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.filter(c => c.active).map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Reference No */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Reference No. (OR/Invoice/Check/DR)</Label>
                          <Input
                            value={selectedEntry.referenceNo || ""}
                            onChange={(e) => setSelectedEntry({ ...selectedEntry, referenceNo: e.target.value })}
                            className="h-10 border-[#E5E7EB] rounded-lg"
                            placeholder="e.g., OR-2025-001"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Description / Particulars</Label>
                          <Textarea
                            value={selectedEntry.description || ""}
                            onChange={(e) => setSelectedEntry({ ...selectedEntry, description: e.target.value })}
                            className="min-h-[100px] border-[#E5E7EB] rounded-lg resize-none"
                            placeholder="Describe the transaction..."
                          />
                        </div>

                        {/* Linked Booking */}
                        <div>
                          <Label className="text-[13px] text-[#6B7280] mb-2 block">Linked Booking / Job</Label>
                          <Input
                            value={selectedEntry.bookingNo}
                            onChange={(e) => setSelectedEntry({ ...selectedEntry, bookingNo: e.target.value })}
                            className="h-10 border-[#E5E7EB] rounded-lg font-mono"
                            placeholder="e.g., FCL-IMP-00012-SEA"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Sales/Job Profit Fields - Only for Revenue */}
                    {selectedEntry.type === "Revenue" && (
                      <Card className="p-5 border-[#E5E7EB] border-2 border-[#D1FAE5] bg-[#F0FDF4]">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[14px] text-[#059669]" style={{ fontWeight: 700 }}>
                            Sales / Job Profit Fields
                          </h3>
                          <Badge className="bg-[#D1FAE5] text-[#059669]">
                            For Reports
                          </Badge>
                        </div>
                        <div className="space-y-4">
                          {/* Job No / Date */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[12px] text-[#047857] mb-1.5 block">Job No.</Label>
                              <Input
                                value={selectedEntry.jobNo || ""}
                                onChange={(e) => setSelectedEntry({ ...selectedEntry, jobNo: e.target.value })}
                                className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                                placeholder="e.g., CPTC-SHOE-258011"
                              />
                            </div>
                            <div>
                              <Label className="text-[12px] text-[#047857] mb-1.5 block">Job Date</Label>
                              <Input
                                type="date"
                                value={selectedEntry.jobDate || ""}
                                onChange={(e) => setSelectedEntry({ ...selectedEntry, jobDate: e.target.value })}
                                className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                              />
                            </div>
                          </div>

                          {/* Billing No */}
                          <div>
                            <Label className="text-[12px] text-[#047857] mb-1.5 block">Billing No.</Label>
                            <Input
                              value={selectedEntry.billingNo || ""}
                              onChange={(e) => setSelectedEntry({ ...selectedEntry, billingNo: e.target.value })}
                              className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                              placeholder="e.g., No. 0012"
                            />
                          </div>

                          {/* Particulars */}
                          <div>
                            <Label className="text-[12px] text-[#047857] mb-1.5 block">Particulars</Label>
                            <Textarea
                              value={selectedEntry.particulars || ""}
                              onChange={(e) => setSelectedEntry({ ...selectedEntry, particulars: e.target.value })}
                              className="min-h-[60px] border-[#A7F3D0] rounded-lg bg-white resize-none text-[13px]"
                              placeholder="Brief description for report..."
                            />
                          </div>

                          {/* Financial Fields */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[12px] text-[#047857] mb-1.5 block">Itemized Cost</Label>
                              <Input
                                type="number"
                                value={selectedEntry.itemizedCost || ""}
                                onChange={(e) => setSelectedEntry({ ...selectedEntry, itemizedCost: parseFloat(e.target.value) || 0 })}
                                className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-[12px] text-[#047857] mb-1.5 block">Expenses</Label>
                              <Input
                                type="number"
                                value={selectedEntry.expenses || ""}
                                onChange={(e) => setSelectedEntry({ ...selectedEntry, expenses: parseFloat(e.target.value) || 0 })}
                                className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[12px] text-[#047857] mb-1.5 block">Admin Cost %</Label>
                              <Input
                                type="number"
                                value={selectedEntry.adminCostPercent || 3}
                                onChange={(e) => setSelectedEntry({ ...selectedEntry, adminCostPercent: parseFloat(e.target.value) || 3 })}
                                className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                                placeholder="3"
                              />
                            </div>
                            <div>
                              <Label className="text-[12px] text-[#047857] mb-1.5 block">Collected Amount</Label>
                              <Input
                                type="number"
                                value={selectedEntry.collectedAmount || ""}
                                onChange={(e) => setSelectedEntry({ ...selectedEntry, collectedAmount: parseFloat(e.target.value) || 0 })}
                                className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Collected Date */}
                          <div>
                            <Label className="text-[12px] text-[#047857] mb-1.5 block">Collected Date (Optional)</Label>
                            <Input
                              type="date"
                              value={selectedEntry.collectedDate || ""}
                              onChange={(e) => setSelectedEntry({ ...selectedEntry, collectedDate: e.target.value })}
                              className="h-9 border-[#A7F3D0] rounded-lg bg-white text-[13px]"
                            />
                          </div>

                          {/* Toggle */}
                          <div className="flex items-center justify-between pt-2">
                            <Label className="text-[13px] text-[#047857]">Show in Sales Profit Report</Label>
                            <Switch
                              checked={selectedEntry.showInSalesReport}
                              onCheckedChange={(checked) => setSelectedEntry({ ...selectedEntry, showInSalesReport: checked })}
                            />
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Status & Audit */}
                    <Card className="p-5 border-[#E5E7EB]">
                      <h3 className="text-[14px] text-[#0A1D4D] mb-4" style={{ fontWeight: 700 }}>
                        Status & Audit
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[12px] text-[#9CA3AF] mb-2 block">Status</Label>
                          <Badge
                            className={cn(
                              "text-[13px] px-3 py-1.5 rounded-full",
                              selectedEntry.status === "Posted" && "bg-[#F3F4F6] text-[#6B7280]",
                              selectedEntry.status === "Pending approval" && "bg-[#FEF3C7] text-[#D97706]"
                            )}
                          >
                            {selectedEntry.status}
                          </Badge>
                        </div>

                        {selectedEntry.createdBy && (
                          <>
                            <div>
                              <Label className="text-[12px] text-[#9CA3AF] mb-1 block">Created by</Label>
                              <p className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                                {selectedEntry.createdBy}
                              </p>
                            </div>
                            <div>
                              <Label className="text-[12px] text-[#9CA3AF] mb-1 block">Created at</Label>
                              <p className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                                {selectedEntry.createdAt}
                              </p>
                            </div>
                          </>
                        )}

                        <div className="pt-4 border-t border-[#E5E7EB]">
                          <Label className="text-[12px] text-[#9CA3AF] mb-2 block">Audit Trail</Label>
                          <div className="space-y-2 text-[12px] text-[#6B7280]">
                            <p>• Entry created by {selectedEntry.createdBy || "Admin"}</p>
                            {selectedEntry.status === "Posted" && <p>• Posted to accounting ledger</p>}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Quick Summary */}
                    {selectedEntry.type === "Revenue" && selectedEntry.itemizedCost && selectedEntry.collectedAmount && (
                      <Card className="p-5 border-[#E5E7EB] bg-[#F0FDF4]">
                        <h3 className="text-[14px] text-[#059669] mb-4" style={{ fontWeight: 700 }}>
                          Profit Summary
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#047857]">Total Expenses</span>
                            <span className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                              ₱{((selectedEntry.itemizedCost || 0) + (selectedEntry.expenses || 0) + ((selectedEntry.itemizedCost || 0) * ((selectedEntry.adminCostPercent || 3) / 100))).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#047857]">Collected Amount</span>
                            <span className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                              ₱{(selectedEntry.collectedAmount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-[#A7F3D0] flex items-center justify-between">
                            <span className="text-[13px] text-[#047857]" style={{ fontWeight: 700 }}>Gross Profit</span>
                            <span className="text-[16px] text-[#059669]" style={{ fontWeight: 700 }}>
                              ₱{((selectedEntry.collectedAmount || 0) - ((selectedEntry.itemizedCost || 0) + (selectedEntry.expenses || 0) + ((selectedEntry.itemizedCost || 0) * ((selectedEntry.adminCostPercent || 3) / 100)))).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details below." : "Create a new accounting category for revenue or expenses."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-[13px] text-[#6B7280] mb-2 block">Category Name</Label>
              <Input
                placeholder="e.g., Handling Fee"
                className="h-10 border-[#E5E7EB] rounded-lg"
              />
            </div>
            <div>
              <Label className="text-[13px] text-[#6B7280] mb-2 block">Type</Label>
              <Select defaultValue="Revenue">
                <SelectTrigger className="h-10 border-[#E5E7EB] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-[#6B7280] mb-2 block">Company</Label>
              <Select defaultValue="CCE">
                <SelectTrigger className="h-10 border-[#E5E7EB] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="text-[13px] text-[#6B7280]">Active</Label>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
              className="border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Category saved");
                setIsCategoryModalOpen(false);
              }}
              className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg"
            >
              Save Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Preview Modal */}
      {showReportPreview && (
        <ReportPreviewModal
          reportType={activeReport}
          period={reportPeriod}
          company={reportCompany}
          onClose={() => setShowReportPreview(false)}
        />
      )}
    </div>
  );
}

// Report Preview Modal Component
function ReportPreviewModal({
  reportType,
  period,
  company,
  onClose,
}: {
  reportType: ReportType;
  company: string;
  period: string;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .report-preview-modal * {
          font-family: Arial, sans-serif !important;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .report-print-area, .report-print-area * {
            visibility: visible;
          }
          .report-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8 report-preview-modal"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-2xl flex flex-col report-print-area"
          style={{ width: "1100px", maxHeight: "90vh", fontFamily: "Arial, sans-serif" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between no-print">
            <div>
              <h3 className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700, fontFamily: "Arial, sans-serif" }}>
                {reportType} Report Preview
              </h3>
              <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Arial, sans-serif" }}>
                {period} • {company}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePrint}
                className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-lg h-10 px-4"
                style={{ fontWeight: 600 }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={() => toast.success("Report exported to Excel")}
                variant="outline"
                className="border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-lg h-10 px-4"
                style={{ fontWeight: 600 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-lg hover:bg-[#F3F4F6]"
              >
                <span className="text-[20px]">×</span>
              </Button>
            </div>
          </div>

          {/* Report Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB]" style={{ fontFamily: "Arial, sans-serif" }}>
            {reportType === "Sales Profit" && <SalesProfitReport period={period} company={company} />}
            {reportType === "Receivables" && <ReceivablesReport period={period} company={company} />}
            {reportType === "Category Summary" && <CategorySummaryReport period={period} company={company} />}
          </div>
        </div>
      </div>
    </>
  );
}

// Sales Profit Report Component
function SalesProfitReport({ period, company }: { period: string; company: string }) {
  return (
    <div className="bg-white p-8 shadow-sm" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-[#059669] rounded" />
          <div className="text-left">
            <div className="text-[11px] text-[#374151]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
              CONFORME PACKAGING AND
            </div>
            <div className="text-[11px] text-[#374151]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
              TRADING CORPORATION
            </div>
          </div>
        </div>
        <h1 className="text-[16px] text-[#0A1D4D] mb-1" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.05em" }}>
          SALES PROFIT (CRATING SERVICES & OTHERS)
        </h1>
        <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Arial, sans-serif" }}>
          AS OF {period.toUpperCase()}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse text-[10px]" style={{ fontFamily: "Arial, sans-serif" }}>
          <thead>
            <tr className="bg-[#60A5FA] text-white">
              <th className="border border-[#374151] px-2 py-2 text-left" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>JOB NO. / DATE</th>
              <th className="border border-[#374151] px-2 py-2 text-left" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>COMPANY NAME</th>
              <th className="border border-[#374151] px-2 py-2 text-left" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>BILLING NO.</th>
              <th className="border border-[#374151] px-2 py-2 text-left" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>PARTICULARS</th>
              <th className="border border-[#374151] px-2 py-2 text-center bg-[#FCA5A5]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>ITEMIZED COST</th>
              <th className="border border-[#374151] px-2 py-2 text-center bg-[#FCA5A5]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>EXPENSES</th>
              <th className="border border-[#374151] px-2 py-2 text-center bg-[#FCA5A5]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>ADMIN COST 3%</th>
              <th className="border border-[#374151] px-2 py-2 text-center bg-[#FCA5A5]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>TOTAL EXPENSES</th>
              <th className="border border-[#374151] px-2 py-2 text-center bg-[#7DD3FC]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>COLLECTED AMOUNT</th>
              <th className="border border-[#374151] px-2 py-2 text-center bg-[#86EFAC]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>GROSS PROFIT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#D1D5DB] px-2 py-1.5" style={{ fontFamily: "Arial, sans-serif" }}>
                CPTC-SHOE-258011<br/>6-23
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5" style={{ fontFamily: "Arial, sans-serif" }}>
                Flying Eagle World Movers INC.
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5" style={{ fontFamily: "Arial, sans-serif" }}>
                No. 0012
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5" style={{ fontFamily: "Arial, sans-serif" }}>
                Trucking Cost
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5 text-right bg-[#FEE2E2]" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>
                ₱2,000.00
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5 text-right bg-[#FEE2E2]" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>
                ₱1,090.00
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5 text-right bg-[#FEE2E2]" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>
                ₱60.00
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5 text-right bg-[#FEE2E2]" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", fontWeight: 700 }}>
                ₱3,150.00
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5 text-right bg-[#DBEAFE]" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>
                ₱5,040.00
              </td>
              <td className="border border-[#D1D5DB] px-2 py-1.5 text-right bg-[#D1FAE5]" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", fontWeight: 700 }}>
                ₱1,890.00
              </td>
            </tr>
            <tr className="bg-[#F3F4F6]">
              <td colSpan={4} className="border border-[#374151] px-2 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
                TOTAL
              </td>
              <td className="border border-[#374151] px-2 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>
                ₱2,000.00
              </td>
              <td className="border border-[#374151] px-2 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>
                ₱1,090.00
              </td>
              <td className="border border-[#374151] px-2 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>
                ₱60.00
              </td>
              <td className="border border-[#374151] px-2 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>
                ₱3,150.00
              </td>
              <td className="border border-[#374151] px-2 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>
                ₱5,040.00
              </td>
              <td className="border border-[#374151] px-2 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>
                ₱1,890.00
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend and Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Legend */}
        <div>
          <h3 className="text-[11px] text-[#0A1D4D] mb-3" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
            NOTE:
          </h3>
          <div className="space-y-2 text-[10px]" style={{ fontFamily: "Arial, sans-serif" }}>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-[#DBEAFE] border border-[#93C5FD]"></div>
              <span>CRT - CRATING SERVICE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-[#FEE2E2] border border-[#FCA5A5]"></div>
              <span>MOB - MOBILIZATION</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-[#FEF3C7] border border-[#FDE047]"></div>
              <span>PLT - PALLETIZED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-[#E0E7FF] border border-[#C7D2FE]"></div>
              <span>OC - OTHER CHARGES</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 bg-[#D1FAE5] border border-[#A7F3D0]"></div>
              <span>PCKS - PACKAGING SUPPLIES</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="text-[11px] text-[#0A1D4D] mb-3" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
            SUMMARY:
          </h3>
          <div className="space-y-1.5 text-[10px]" style={{ fontFamily: "Arial, sans-serif" }}>
            <div className="flex justify-between">
              <span>PROFIT</span>
              <span style={{ fontWeight: 700, letterSpacing: "0.5px" }}>₱522,893.75</span>
            </div>
            <div className="flex justify-between">
              <span>LESS: COMMISSION (ON CHARLES)</span>
              <span style={{ fontWeight: 700, letterSpacing: "0.5px" }}>₱1,000.00</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#D1D5DB]">
              <span style={{ fontWeight: 700 }}>TOTAL PROFIT</span>
              <span style={{ fontWeight: 700, letterSpacing: "0.5px" }}>₱519,883.75</span>
            </div>
            <div className="flex justify-between">
              <span>LESS: 10 % COMMISSION FOR STAFF</span>
              <span style={{ fontWeight: 700, letterSpacing: "0.5px" }}>₱8,966.38</span>
            </div>
            <div className="flex justify-between pt-1 border-t-2 border-[#374151]">
              <span style={{ fontWeight: 700 }}>TOTAL GROSS PROFIT</span>
              <span style={{ fontWeight: 700, letterSpacing: "0.5px" }}>₱34,716.33</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-8 pt-8 border-t border-[#D1D5DB]">
        <div>
          <p className="text-[10px] text-[#6B7280] mb-4" style={{ fontFamily: "Arial, sans-serif" }}>Prepared by:</p>
          <div className="border-t border-[#374151] pt-1">
            <p className="text-[10px]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>ADMIN</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#6B7280] mb-4" style={{ fontFamily: "Arial, sans-serif" }}>Reviewed by:</p>
          <div className="border-t border-[#374151] pt-1">
            <p className="text-[10px]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>FINANCE</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#6B7280] mb-4" style={{ fontFamily: "Arial, sans-serif" }}>Approved by:</p>
          <div className="border-t border-[#374151] pt-1">
            <p className="text-[10px]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>PRESIDENT / VP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Receivables Report Component
function ReceivablesReport({ period, company }: { period: string; company: string }) {
  return (
    <div className="bg-white p-8 shadow-sm" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-[#059669] rounded" />
          <div className="text-left">
            <div className="text-[11px] text-[#374151]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
              CONFORME PACKAGING AND
            </div>
            <div className="text-[11px] text-[#374151]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
              TRADING CORPORATION
            </div>
          </div>
        </div>
        <p className="text-[9px] text-[#6B7280] mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
          RM 204 DOÑA EUSEBIA BLDG. 0611 QUIRINO AVE. SAN DIONISIO, PARAÑAQUE CITY
        </p>
        <p className="text-[9px] text-[#6B7280] mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
          Tel.: (02) 67310988
        </p>
        <div className="inline-block bg-[#84CC16] px-4 py-1 mb-4">
          <h1 className="text-[12px] text-white" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
            RECEIVABLES REPORT FOR THE MONTH OF {period.toUpperCase()}
          </h1>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[10px]" style={{ fontFamily: "Arial, sans-serif" }}>
          <thead>
            <tr className="bg-white">
              <th className="border border-[#374151] px-3 py-2 text-left" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>COMPANY NAME</th>
              <th className="border border-[#374151] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>AMOUNT</th>
              <th className="border border-[#374151] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>CHECK NO. / CASH</th>
              <th className="border border-[#374151] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>INVOICE AMOUNT</th>
              <th className="border border-[#374151] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>COLLECTED DATE OF PAYMENT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#D1D5DB] px-3 py-2" style={{ fontFamily: "Arial, sans-serif" }}>FLYING EAGLE WORLD MOVERS</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱5,040.00</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif" }}>CHEQUE / CCE</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱5,040.00</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif" }}>8-6-2025 / FULLY PAID</td>
            </tr>
            <tr>
              <td className="border border-[#D1D5DB] px-3 py-2" style={{ fontFamily: "Arial, sans-serif" }}>CONFORME CARGO EXPRESS</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱1,320.00</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif" }}>-</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱1,320.00</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-center bg-[#FED7AA]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>8-22-2025 / UNPAID</td>
            </tr>
            <tr>
              <td className="border border-[#D1D5DB] px-3 py-2" style={{ fontFamily: "Arial, sans-serif" }}>CONFORME CARGO EXPRESS</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱44,200</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-center" style={{ fontFamily: "Arial, sans-serif" }}>-</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱44,200</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-center bg-[#FED7AA]" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>10-14-2025 / UNPAID</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Category Summary Report Component
function CategorySummaryReport({ period, company }: { period: string; company: string }) {
  return (
    <div className="bg-white p-8 shadow-sm" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-[16px] text-[#0A1D4D] mb-2" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>
          CATEGORY SUMMARY REPORT
        </h1>
        <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Arial, sans-serif" }}>
          {period} • {company}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]" style={{ fontFamily: "Arial, sans-serif" }}>
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="border border-[#D1D5DB] px-4 py-3 text-left" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>Category</th>
              <th className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>Revenue</th>
              <th className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>Expense</th>
              <th className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>Net</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#D1D5DB] px-4 py-3" style={{ fontFamily: "Arial, sans-serif" }}>Trucking Cost</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱82,500.00</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱0.00</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", fontWeight: 700 }}>₱82,500.00</td>
            </tr>
            <tr>
              <td className="border border-[#D1D5DB] px-4 py-3" style={{ fontFamily: "Arial, sans-serif" }}>Fuel</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱0.00</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱4,500.00</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", fontWeight: 700 }}>-₱4,500.00</td>
            </tr>
            <tr>
              <td className="border border-[#D1D5DB] px-4 py-3" style={{ fontFamily: "Arial, sans-serif" }}>Handling Fee</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱12,000.00</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>₱0.00</td>
              <td className="border border-[#D1D5DB] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", fontWeight: 700 }}>₱12,000.00</td>
            </tr>
            <tr className="bg-[#F3F4F6]">
              <td className="border border-[#374151] px-4 py-3" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700 }}>TOTAL</td>
              <td className="border border-[#374151] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>₱94,500.00</td>
              <td className="border border-[#374151] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>₱4,500.00</td>
              <td className="border border-[#374151] px-4 py-3 text-right" style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.5px" }}>₱90,000.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
