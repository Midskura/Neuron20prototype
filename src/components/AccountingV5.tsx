import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "./ui/toast-utils";
import { cn } from "./ui/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { AccountingEntryModal } from "./AccountingEntryModal";
import { EntryFileView } from "./EntryFileView";

type EntryType = "Revenue" | "Expense";
type EntryStatus = "Posted" | "Draft";

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
  updatedAt?: string;
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
  // Expense fields
  lineItems?: Array<{
    id: string;
    particular: string;
    description: string;
    amount: number;
  }>;
  forAccountOf?: string;
  categories?: string[];
}

interface Category {
  id: string;
  name: string;
  type: "Revenue" | "Expense";
  company: string;
  active: boolean;
}



const COMPANIES = ["CCE", "ZNICF", "JLCS", "All"];
const PAYMENT_CHANNELS = ["Cash", "Petty Cash", "BPI", "BDO", "GCash"];

// Mock data
const mockEntries: Entry[] = [
  {
    id: "1",
    date: "2025-10-15",
    category: "Trucking Cost",
    bookingNo: "CPTC-SHOE-258011",
    type: "Revenue",
    company: "Artsy Eagle Wood Mosaic Inc.",
    paymentChannel: "BPI",
    amount: 5040,
    status: "Posted",
    referenceNo: "No. 0012",
    particulars: "Trucking Cost",
    itemizedCost: 2000,
    expenses: 1090,
    adminCostPercent: 3,
    collectedAmount: 5040,
    collectedDate: "2025-10-15",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 15, 2025, 9:30 AM",
    updatedAt: "Oct 15, 2025, 9:30 AM",
  },
  {
    id: "2",
    date: "2025-10-10",
    category: "Fumigation",
    bookingNo: "CPTC-PCKS-256901",
    type: "Revenue",
    company: "Forge International Logistics INC.",
    paymentChannel: "BPI",
    amount: 11238.50,
    status: "Posted",
    referenceNo: "No.001243 & No.001234",
    particulars: "Publishing & Fumigation w/ 24 Pest (Fumigation)",
    itemizedCost: 8400,
    expenses: 650,
    adminCostPercent: 3,
    collectedAmount: 11238.50,
    collectedDate: "2025-10-10",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 10, 2025, 2:15 PM",
    updatedAt: "Oct 10, 2025, 2:15 PM",
  },
  {
    id: "3",
    date: "2025-10-08",
    category: "Crating",
    bookingNo: "CPTC-PCKS-258012",
    type: "Revenue",
    company: "Star Freight (Phils Corporation)",
    paymentChannel: "BPI",
    amount: 14565,
    status: "Posted",
    referenceNo: "No. 001252",
    particulars: "Revised Fumigation Certificate",
    itemizedCost: 11000,
    expenses: 2000,
    adminCostPercent: 3,
    collectedAmount: 14565,
    collectedDate: "2025-10-08",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 8, 2025, 11:00 AM",
    updatedAt: "Oct 8, 2025, 11:00 AM",
  },
  {
    id: "4",
    date: "2025-10-05",
    category: "Mobilization",
    bookingNo: "CPTC-CRT-258013",
    type: "Revenue",
    company: "Eastline Forwarding Corp",
    paymentChannel: "BPI",
    amount: 10375,
    status: "Posted",
    referenceNo: "No. 001258",
    particulars: "Crating, Mobilization & Additional Fee",
    itemizedCost: 7200,
    expenses: 1500,
    adminCostPercent: 3,
    collectedAmount: 10375,
    collectedDate: "2025-10-05",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 5, 2025, 3:45 PM",
    updatedAt: "Oct 5, 2025, 3:45 PM",
  },
  {
    id: "5",
    date: "2025-10-03",
    category: "Handling Fee",
    bookingNo: "CPTC-CRT-258014",
    type: "Revenue",
    company: "Baseline Forwarding Corp.",
    paymentChannel: "BPI",
    amount: 11375,
    status: "Posted",
    referenceNo: "No. 001263",
    particulars: "Fumigation Expedition & Handling Fee",
    itemizedCost: 8600,
    expenses: 950,
    adminCostPercent: 3,
    collectedAmount: 11375,
    collectedDate: "2025-10-03",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 3, 2025, 10:20 AM",
    updatedAt: "Oct 3, 2025, 10:20 AM",
  },
  {
    id: "6",
    date: "2025-10-02",
    category: "Palletizing",
    bookingNo: "CPTC-CRT-258633",
    type: "Revenue",
    company: "Eastline Forwarding Corp",
    paymentChannel: "BPI",
    amount: 15965,
    status: "Posted",
    referenceNo: "No. 00404 & 00035",
    particulars: "4 Palletizing, Mobilization, Handling Fee & Trucking Cost",
    itemizedCost: 10600,
    expenses: 2100,
    adminCostPercent: 3,
    collectedAmount: 15965,
    collectedDate: "2025-10-02",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 2, 2025, 4:30 PM",
    updatedAt: "Oct 2, 2025, 4:30 PM",
  },
  {
    id: "7",
    date: "2025-10-14",
    category: "Fuel",
    bookingNo: "LCL-EXP-00008-AIR",
    type: "Expense",
    company: "ZNICF",
    paymentChannel: "Cash",
    amount: 4500,
    status: "Posted",
    referenceNo: "RFP-001482",
    description: "Fuel for delivery truck",
    lineItems: [
      { id: "1", particular: "Diesel fuel", description: "50 liters for delivery route", amount: 4500 },
    ],
    forAccountOf: "Shell Gas Station",
    categories: ["Operation", "Trucking"],
    createdBy: "Staff",
    createdAt: "Oct 14, 2025, 2:15 PM",
    updatedAt: "Oct 14, 2025, 2:15 PM",
  },
  {
    id: "9",
    date: "2025-10-07",
    category: "Handling Fee",
    bookingNo: "CPTC-CRT-258015",
    type: "Revenue",
    company: "DHL Express",
    paymentChannel: "BPI",
    amount: 8650,
    status: "Posted",
    referenceNo: "No. 001270",
    particulars: "Warehouse Handling & Sorting",
    itemizedCost: 5200,
    expenses: 1800,
    adminCostPercent: 3,
    collectedAmount: 8650,
    collectedDate: "2025-10-07",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 7, 2025, 9:15 AM",
    updatedAt: "Oct 7, 2025, 9:15 AM",
  },
  {
    id: "10",
    date: "2025-10-06",
    category: "Maintenance",
    bookingNo: "CPTC-CRT-258014",
    type: "Expense",
    company: "JLCS",
    paymentChannel: "BDO",
    amount: 12500,
    status: "Posted",
    referenceNo: "RFP-001485",
    description: "Forklift maintenance and repair",
    lineItems: [
      { id: "1", particular: "Parts replacement", description: "Hydraulic components", amount: 8500 },
      { id: "2", particular: "Labor", description: "Technician fee", amount: 4000 },
    ],
    forAccountOf: "JMC Equipment Services",
    categories: ["Equipment", "Maintenance"],
    createdBy: "Staff",
    createdAt: "Oct 6, 2025, 3:30 PM",
    updatedAt: "Oct 6, 2025, 3:30 PM",
  },
  {
    id: "11",
    date: "2025-10-04",
    category: "Documentation Fee",
    bookingNo: "CPTC-PCKS-258016",
    type: "Revenue",
    company: "Maersk Philippines",
    paymentChannel: "BPI",
    amount: 6850,
    status: "Posted",
    referenceNo: "No. 001275",
    particulars: "Customs Documentation & Clearance",
    itemizedCost: 3500,
    expenses: 1600,
    adminCostPercent: 3,
    collectedAmount: 6850,
    collectedDate: "2025-10-04",
    showInSalesReport: true,
    createdBy: "Admin",
    createdAt: "Oct 4, 2025, 10:45 AM",
    updatedAt: "Oct 4, 2025, 10:45 AM",
  },
  {
    id: "8",
    date: "2025-10-01",
    category: "Packaging",
    bookingNo: "CPTC-PCKS-258001",
    type: "Revenue",
    company: "Zo International Cargo",
    paymentChannel: "BDO",
    amount: 1100,
    status: "Draft",
    referenceNo: "—",
    particulars: "Bathtaxah (3) - 10 pcs",
    itemizedCost: 530,
    expenses: 430,
    adminCostPercent: 3,
    collectedAmount: 1100,
    collectedDate: "2025-10-01",
    showInSalesReport: false,
    createdBy: "Admin",
    createdAt: "Oct 1, 2025, 11:00 AM",
    updatedAt: "Oct 1, 2025, 11:00 AM",
  },
];

const mockCategories: Category[] = [
  { id: "1", name: "Trucking Cost", type: "Revenue", company: "CCE", active: true },
  { id: "2", name: "Fuel", type: "Expense", company: "All", active: true },
  { id: "3", name: "Handling Fee", type: "Revenue", company: "CCE", active: true },
  { id: "4", name: "Office Supplies", type: "Expense", company: "ZNICF", active: false },
];

// Status Badge Component matching Bookings
function StatusBadge({ status }: { status: EntryStatus }) {
  const config = {
    "Posted": { color: "#10B981", bg: "#D1FAE5" },
    "Draft": { color: "#F59E0B", bg: "#FEF3C7" },
  }[status];

  return (
    <div 
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
      }}
    >
      {status}
    </div>
  );
}

// Type Badge Component matching Bookings
function TypeBadge({ type }: { type: EntryType }) {
  const config = {
    "Revenue": { color: "#059669", bg: "#D1FAE5" },
    "Expense": { color: "#DC2626", bg: "#FEE2E2" },
  }[type];

  return (
    <div 
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {type}
    </div>
  );
}

// Month Navigator Component (matching Bookings)
function MonthNavigator({ currentDate, onPrevMonth, onNextMonth }: {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const monthYear = currentDate.toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevMonth}
        className="h-8 w-8 rounded-lg text-[#374151] hover:bg-[#F9FAFB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F25C05]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
        {monthYear}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="h-8 w-8 rounded-lg text-[#374151] hover:bg-[#F9FAFB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F25C05]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Summary Pills Component (matching Bookings)
function SummaryPills({ entriesCount, bookingsCount, draftsCount }: { 
  entriesCount: number; 
  bookingsCount: number;
  draftsCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 flex items-center px-2.5 rounded-full bg-[#F3F4F6] text-[#111827] text-[12px]" style={{ fontWeight: 600 }}>
        Entries • {entriesCount}
      </div>
      <div className="h-7 flex items-center px-2.5 rounded-full bg-[#EBF5FF] text-[#0A1D4D] text-[12px]" style={{ fontWeight: 600 }}>
        Bookings • {bookingsCount}
      </div>
      <div className="h-7 flex items-center px-2.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[12px]" style={{ fontWeight: 600 }}>
        Drafts • {draftsCount}
      </div>
    </div>
  );
}

export default function AccountingV5() {
  const [activeTab, setActiveTab] = useState<"Entries" | "Common Categories">("Entries");
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)); // October 2025
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  
  // Entries tab state
  const [entries, setEntries] = useState<Entry[]>(mockEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(false);
  
  // Categories tab state
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Navigate month
  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Filtered entries
  const filteredEntries = entries.filter(entry => {
    if (searchQuery && !entry.bookingNo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCompany !== "all" && entry.company !== filterCompany) return false;
    if (filterType !== "all" && entry.type !== filterType) return false;
    if (filterCategory !== "all" && entry.category !== filterCategory) return false;
    if (filterStatus !== "all" && entry.status !== filterStatus) return false;
    return true;
  });

  // Count stats
  const totalEntries = entries.length;
  const bookingsCount = new Set(entries.map(e => e.bookingNo)).size;
  const draftsCount = entries.filter(e => e.status === "Draft").length;

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setIsNewEntry(true);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = (entryData: any, status: "Draft" | "Posted") => {
    const now = new Date();
    const finalEntry = {
      ...entryData,
      id: isNewEntry ? `entry-${Date.now()}` : selectedEntry?.id,
      status: status,
      createdBy: isNewEntry ? "Admin" : selectedEntry?.createdBy,
      createdAt: isNewEntry ? now.toISOString() : selectedEntry?.createdAt,
      updatedAt: now.toLocaleString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true 
      }),
    };

    if (isNewEntry) {
      setEntries([...entries, finalEntry as Entry]);
    } else {
      setEntries(entries.map(e => e.id === finalEntry.id ? finalEntry as Entry : e));
    }
    
    setIsEntryModalOpen(false);
    setSelectedEntry(null);
    setIsNewEntry(false);
  };

  const handleViewEntry = (entry: Entry) => {
    setSelectedEntry(entry);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedEntry(null);
  };

  const handleEditEntry = () => {
    setIsNewEntry(false);
    setIsEntryModalOpen(true);
  };

  const handleDuplicateEntry = () => {
    if (selectedEntry) {
      const duplicated = {
        ...selectedEntry,
        id: `entry-${Date.now()}`,
        status: "Draft" as EntryStatus,
        createdBy: "Admin",
        createdAt: new Date().toISOString(),
      };
      setEntries([...entries, duplicated]);
      setSelectedEntry(duplicated);
    }
  };



  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterCompany("all");
    setFilterType("all");
    setFilterCategory("all");
    setFilterStatus("all");
  };

  const hasActiveFilters = searchQuery || filterCompany !== "all" || filterType !== "all" || filterCategory !== "all" || filterStatus !== "all";

  // Show Entry File View if in detail mode
  if (viewMode === "detail" && selectedEntry) {
    return (
      <EntryFileView
        entry={selectedEntry}
        onBack={handleBackToList}
        onEdit={handleEditEntry}
        onDuplicate={handleDuplicateEntry}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col pb-6" style={{ width: '1440px', maxWidth: '100%', margin: '0 auto' }}>
        {/* Page Header */}
        <div 
          className="flex items-center justify-between border-b"
          style={{ 
            paddingTop: '16px',
            paddingBottom: '12px',
            paddingLeft: '32px',
            paddingRight: '32px',
            backgroundColor: '#FFFFFF',
            width: '100%',
            borderColor: '#EDF0F3',
          }}
        >
          {/* Left block - Title + Subtitle */}
          <div className="flex flex-col" style={{ gap: '3px' }}>
            <h1 
              className="text-[#0A1D4D]"
              style={{ 
                fontSize: '26px',
                fontWeight: 700,
                lineHeight: '1.2',
              }}
            >
              Accounting
            </h1>
            <p 
              className="text-[#94A3B8]"
              style={{ 
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: '1.4',
              }}
            >
              Manage entries and categories
            </p>
          </div>
        </div>

        {/* Tabs Row - Below Header */}
        <div 
          className="flex items-center gap-2 bg-white border-b"
          style={{
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '32px',
            paddingRight: '32px',
            borderColor: '#E5E7EB',
          }}
        >
          {(["Entries", "Common Categories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-full text-[14px] transition-all",
                activeTab === tab
                  ? "bg-[#F25C05] text-white"
                  : "bg-transparent text-[#6B7280] hover:bg-[#F3F4F6]"
              )}
              style={{ fontWeight: activeTab === tab ? 600 : 500 }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Container */}
        <div 
          className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden"
          style={{ 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            marginTop: '16px',
            marginLeft: '24px',
            marginRight: '24px',
          }}
        >
          {/* ENTRIES TAB */}
          {activeTab === "Entries" && (
            <>
              {/* Month Navigator Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                <MonthNavigator 
                  currentDate={currentMonth}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                />
                <div className="flex items-center gap-3">
                  <SummaryPills 
                    entriesCount={totalEntries}
                    bookingsCount={bookingsCount}
                    draftsCount={draftsCount}
                  />
                  <Button 
                    onClick={handleNewEntry}
                    className="bg-[#F25C05] hover:bg-[#E55304] text-white rounded-full transition-all"
                    style={{
                      height: '44px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                      border: '1px solid rgba(10, 29, 77, 0.25)',
                      boxShadow: '0 3px 10px rgba(242, 92, 5, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    New Entry
                  </Button>
                </div>
              </div>

              {/* Inline Bento-Style Filter Bar */}
              <div 
                className="border-b border-[#E5E7EB]"
                style={{ 
                  minHeight: '60px',
                  padding: '16px',
                  gap: '12px'
                }}
              >
                <div className="h-full flex items-center flex-wrap" style={{ gap: '12px' }}>
                  {/* Left Controls Group */}
                  <div className="flex items-center flex-shrink-0 flex-wrap" style={{ gap: '12px' }}>
                    {/* Search Field - Pill style */}
                    <div className="relative flex-shrink-0" style={{ width: '260px' }}>
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                      <Input
                        placeholder="Search booking…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 h-11 border border-[#E5E7EB] rounded-full bg-white hover:bg-[#F9FAFB] focus:border-[#F25C05] focus:ring-1 focus:ring-[#F25C05] text-[13px] text-[#0A1D4D] placeholder:text-[#9CA3AF]"
                      />
                    </div>

                    {/* Company Filter */}
                    <div className="flex-shrink-0">
                      <Select value={filterCompany} onValueChange={setFilterCompany}>
                        <SelectTrigger 
                          className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                          style={{
                            width: '150px',
                            borderColor: filterCompany !== "all" ? "#F25C05" : "#E5E7EB",
                            color: filterCompany !== "all" ? "#0A1D4D" : "#6B7280",
                            fontWeight: filterCompany !== "all" ? 600 : 400,
                          }}
                        >
                          <SelectValue placeholder="Company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Companies</SelectItem>
                          {COMPANIES.filter(c => c !== "All").map((company) => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="flex-shrink-0">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger 
                          className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                          style={{
                            width: '160px',
                            borderColor: filterType !== "all" ? "#F25C05" : "#E5E7EB",
                            color: filterType !== "all" ? "#0A1D4D" : "#6B7280",
                            fontWeight: filterType !== "all" ? 600 : 400,
                          }}
                        >
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Revenue">Revenue</SelectItem>
                          <SelectItem value="Expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex-shrink-0">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger 
                          className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                          style={{
                            width: '180px',
                            borderColor: filterCategory !== "all" ? "#F25C05" : "#E5E7EB",
                            color: filterCategory !== "all" ? "#0A1D4D" : "#6B7280",
                            fontWeight: filterCategory !== "all" ? 600 : 400,
                          }}
                        >
                          <SelectValue placeholder="Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.filter(c => c.active).map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex-shrink-0">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger 
                          className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                          style={{
                            width: '160px',
                            borderColor: filterStatus !== "all" ? "#F25C05" : "#E5E7EB",
                            color: filterStatus !== "all" ? "#0A1D4D" : "#6B7280",
                            fontWeight: filterStatus !== "all" ? 600 : 400,
                          }}
                        >
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Posted">Posted</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Refresh Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#0A1D4D] transition-colors duration-150 flex-shrink-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" style={{ minWidth: '1px', height: '1px' }}></div>

                  {/* Clear filters - Right Aligned */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[13px] text-[#F25C05] hover:text-[#D84D00] font-medium transition-colors flex-shrink-0"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Entries Table */}
              <div className="relative">
                {/* Table Header */}
                <div className="bg-white border-b border-[#E5E7EB]">
                  <div 
                    className="grid gap-4 px-5 py-3"
                    style={{ 
                      gridTemplateColumns: '120px 180px 180px 120px 120px 140px 140px 140px',
                    }}
                  >
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Date</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Category</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Booking / Job No.</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Type</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Company</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Payment Channel</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280] text-right">Amount</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Status</div>
                  </div>
                </div>

                {/* Table Body */}
                <div>
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="cursor-pointer transition-all duration-150 hover:bg-[#FFF3E0]/30 hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)] grid gap-4 px-5 h-16 items-center border-b border-[#F3F4F6] last:border-b-0"
                      style={{ 
                        gridTemplateColumns: '120px 180px 180px 120px 120px 140px 140px 140px',
                      }}
                      onClick={() => handleViewEntry(entry)}
                    >
                      {/* Date */}
                      <div className="flex items-center">
                        <span className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {/* Category */}
                      <div className="flex items-center overflow-hidden">
                        <span className="text-[13px] text-[#0A1D4D] truncate" style={{ fontWeight: 600 }}>
                          {entry.category}
                        </span>
                      </div>

                      {/* Booking / Job No - Blue and clickable */}
                      <div className="flex items-center overflow-hidden">
                        <span className="text-[13px] text-[#0A6EBD] font-medium truncate hover:underline">
                          {entry.bookingNo}
                        </span>
                      </div>

                      {/* Type */}
                      <div className="flex items-center">
                        <TypeBadge type={entry.type} />
                      </div>

                      {/* Company */}
                      <div className="flex items-center">
                        <span className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {entry.company}
                        </span>
                      </div>

                      {/* Payment Channel */}
                      <div className="flex items-center">
                        <span className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {entry.paymentChannel}
                        </span>
                      </div>

                      {/* Amount - Right aligned, bold */}
                      <div className="flex items-center justify-end">
                        <span className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                          ₱{entry.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center">
                        <StatusBadge status={entry.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* COMMON CATEGORIES TAB */}
          {activeTab === "Common Categories" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
                    Common Categories
                  </h2>
                  <p className="text-[13px] text-[#6B7280] mt-1">
                    These are suggested / standard categories. Accountants can still type new categories when encoding.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  variant="outline"
                  className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-10 px-4"
                  style={{ fontWeight: 600 }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Category
                </Button>
              </div>

              {/* Categories Table */}
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <div 
                    className="grid gap-4 px-5 py-3"
                    style={{ 
                      gridTemplateColumns: '1fr 180px 180px 120px',
                    }}
                  >
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Category Name</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Type</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Company</div>
                    <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Active</div>
                  </div>
                </div>

                {/* Table Body */}
                <div>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="cursor-pointer transition-all duration-150 hover:bg-[#F9FAFB] grid gap-4 px-5 h-16 items-center border-b border-[#E5E7EB] last:border-b-0 bg-white"
                      style={{ 
                        gridTemplateColumns: '1fr 180px 180px 120px',
                      }}
                      onClick={() => {
                        setEditingCategory(category);
                        setIsCategoryModalOpen(true);
                      }}
                    >
                      {/* Category Name */}
                      <div className="flex items-center">
                        <span className="text-[14px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
                          {category.name}
                        </span>
                      </div>

                      {/* Type */}
                      <div className="flex items-center">
                        <TypeBadge type={category.type} />
                      </div>

                      {/* Company */}
                      <div className="flex items-center">
                        <span className="text-[13px] text-[#374151]" style={{ fontWeight: 500 }}>
                          {category.company}
                        </span>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center">
                        <Switch
                          checked={category.active}
                          onCheckedChange={(checked) => {
                            setCategories(categories.map(c =>
                              c.id === category.id ? { ...c, active: checked } : c
                            ));
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entry Modal */}
      {isEntryModalOpen && (
        <AccountingEntryModal
          entry={selectedEntry}
          mode={selectedEntry?.type}
          categories={categories.filter(c => c.active).map(c => c.name)}
          companies={COMPANIES.filter(c => c !== "All")}
          onClose={() => {
            setIsEntryModalOpen(false);
            setSelectedEntry(null);
            setIsNewEntry(false);
          }}
          onSave={handleSaveEntry}
        />
      )}

      {/* Old Sheet component - REMOVED */}
      {/* <Sheet open={isEntrySheetOpen} onOpenChange={setIsEntrySheetOpen}>
 */}

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[20px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#6B7280]">
              {editingCategory ? "Update the category details below." : "Create a new accounting category for organizing entries."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[13px] text-[#374151] mb-2 block" style={{ fontWeight: 600 }}>
                Category Name
              </Label>
              <Input
                className="h-10 border-[#E5E7EB] rounded-lg text-[13px]"
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label className="text-[13px] text-[#374151] mb-2 block" style={{ fontWeight: 600 }}>
                Type
              </Label>
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
              <Label className="text-[13px] text-[#374151] mb-2 block" style={{ fontWeight: 600 }}>
                Company
              </Label>
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
            <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <Label className="text-[13px] text-[#374151]" style={{ fontWeight: 600 }}>
                Active
              </Label>
              <Switch defaultChecked />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex-1 border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success(editingCategory ? "Category updated" : "Category created");
                  setIsCategoryModalOpen(false);
                }}
                className="flex-1 bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-10"
              >
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
