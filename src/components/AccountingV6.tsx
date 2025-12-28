import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Plus, 
  RefreshCw, 
  Search,
  ExternalLink,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "./ui/utils";
import { toast } from "./ui/toast-utils";
import { NewBillingModal } from "./accounting-v6/NewBillingModal";
import { NewCollectionModal } from "./accounting-v6/NewCollectionModal";
import { NewExpenseModal } from "./accounting-v6/NewExpenseModal";
import { ExpenseCategoriesDrawer } from "./accounting-v6/ExpenseCategoriesDrawer";

type TabType = "Billings" | "Collections" | "Expenses";
type StatusType = "All" | "Draft" | "Posted" | "Paid" | "Unpaid" | "Partial" | "Fully Applied" | "Partially Applied" | "Unapplied";

interface Billing {
  id: string;
  invoiceDate: string;
  invoiceNo: string;
  bookingNo: string;
  client: string;
  company: string;
  particulars: string;
  amount: number;
  collected: number;
  balance: number;
  status: "Draft" | "Posted" | "Paid" | "Partial";
}

interface Collection {
  id: string;
  collectionDate: string;
  receiptNo: string;
  client: string;
  company: string;
  paymentMethod: string;
  refNo: string;
  appliedTo: string[];
  amountReceived: number;
  status: "Fully Applied" | "Partially Applied" | "Unapplied";
}

interface Expense {
  id: string;
  expenseDate: string;
  expenseNo: string;
  category: string;
  bookingNo: string;
  company: string;
  payee: string;
  expenseType: "Operations" | "Admin" | "Commission" | "Itemized Cost";
  paymentChannel: string;
  amount: number;
  status: "Unpaid" | "Paid" | "Draft";
}

const COMPANIES = ["All Companies", "JLCS", "CCE", "CPTC", "ZNICF"];

// Mock Data
const mockBillings: Billing[] = [
  {
    id: "1",
    invoiceDate: "Oct 15",
    invoiceNo: "IN-2025-001",
    bookingNo: "FCL-IMP-00012-SEA",
    client: "Shoe Mart Inc.",
    company: "CCE",
    particulars: "Ocean Freight + Handling",
    amount: 125000,
    collected: 125000,
    balance: 0,
    status: "Paid"
  },
  {
    id: "2",
    invoiceDate: "Oct 18",
    invoiceNo: "IN-2025-002",
    bookingNo: "LCL-EXP-00045-AIR",
    client: "Global Tech Solutions",
    company: "JLCS",
    particulars: "Air Freight + Customs Clearance",
    amount: 85000,
    collected: 40000,
    balance: 45000,
    status: "Partial"
  },
  {
    id: "3",
    invoiceDate: "Oct 20",
    invoiceNo: "IN-2025-003",
    bookingNo: "DOM-TRK-00089",
    client: "Metro Warehouse Corp",
    company: "CPTC",
    particulars: "Trucking Service Manila-Cebu",
    amount: 65000,
    collected: 0,
    balance: 65000,
    status: "Posted"
  },
];

const mockCollections: Collection[] = [
  {
    id: "1",
    collectionDate: "Oct 15",
    receiptNo: "OR-2025-001",
    client: "Shoe Mart Inc.",
    company: "CCE",
    paymentMethod: "Bank Transfer",
    refNo: "BPI-REF-12345",
    appliedTo: ["IN-2025-001"],
    amountReceived: 125000,
    status: "Fully Applied"
  },
  {
    id: "2",
    collectionDate: "Oct 19",
    receiptNo: "OR-2025-002",
    client: "Global Tech Solutions",
    company: "JLCS",
    paymentMethod: "Check",
    refNo: "CHK-789456",
    appliedTo: ["IN-2025-002"],
    amountReceived: 40000,
    status: "Partially Applied"
  },
];

const mockExpenses: Expense[] = [
  {
    id: "1",
    expenseDate: "Oct 12",
    expenseNo: "EXP-2025-001",
    category: "Trucking",
    bookingNo: "FCL-IMP-00012-SEA",
    company: "CCE",
    payee: "Metro Haulers Inc.",
    expenseType: "Operations",
    paymentChannel: "BPI",
    amount: 15000,
    status: "Paid"
  },
  {
    id: "2",
    expenseDate: "Oct 14",
    expenseNo: "EXP-2025-002",
    category: "Office Rent",
    bookingNo: "",
    company: "JLCS",
    payee: "Building Management",
    expenseType: "Admin",
    paymentChannel: "Check",
    amount: 45000,
    status: "Paid"
  },
  {
    id: "3",
    expenseDate: "Oct 16",
    expenseNo: "EXP-2025-003",
    category: "Fumigation",
    bookingNo: "LCL-EXP-00045-AIR",
    company: "JLCS",
    payee: "Pest Control Services",
    expenseType: "Itemized Cost",
    paymentChannel: "Cash",
    amount: 8500,
    status: "Unpaid"
  },
];

// Month Navigator Component (same as Bookings)
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

export default function AccountingV6() {
  const [activeTab, setActiveTab] = useState<TabType>("Billings");
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState<StatusType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoriesDrawer, setShowCategoriesDrawer] = useState(false);

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      "Paid": { color: "#10b981", bg: "#E8F5E9" },
      "Posted": { color: "#10b981", bg: "#E8F5E9" },
      "Unpaid": { color: "#EF4444", bg: "#FEE2E2" },
      "Draft": { color: "#6B7280", bg: "#F3F4F6" },
      "Partial": { color: "#F59E0B", bg: "#FEF3C7" },
      "Fully Applied": { color: "#10b981", bg: "#E8F5E9" },
      "Partially Applied": { color: "#F59E0B", bg: "#FEF3C7" },
      "Unapplied": { color: "#EF4444", bg: "#FEE2E2" },
    };
    return styles[status as keyof typeof styles] || { color: "#6B7280", bg: "#F3F4F6" };
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Get search placeholder based on active tab
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "Billings":
        return "Search invoice, booking, client…";
      case "Collections":
        return "Search OR, client, invoice…";
      case "Expenses":
        return "Search expense, vendor, booking…";
      default:
        return "Search…";
    }
  };

  return (
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
            Log all money in and money out across companies and bookings.
          </p>
        </div>
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
        <div className="p-6">
          {/* Tabs (Pills - same as Reports) */}
          <div 
            className="flex justify-center items-center mb-6"
            style={{ 
              paddingLeft: '12px',
              paddingRight: '12px',
            }}
          >
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {(["Billings", "Collections", "Expenses"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[13px] transition-all whitespace-nowrap",
                    activeTab === tab
                      ? "bg-[#F25C05] text-white shadow-sm"
                      : "bg-transparent text-[#6B7280] hover:bg-[#F3F4F6] hover:border-[#D1D5DB] hover:shadow-sm border border-[#E5E7EB]"
                  )}
                  style={{ fontWeight: activeTab === tab ? 600 : 500 }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div 
            className="mb-4"
            style={{
              height: '1px',
              backgroundColor: '#E5E7EB',
              marginLeft: '-24px',
              marginRight: '-24px',
            }}
          />

          {/* Filters Row (Bento Style - same as Bookings) */}
          <div 
            className="border-b border-[#E5E7EB]"
            style={{ 
              minHeight: '60px',
              padding: '16px 0',
              gap: '12px'
            }}
          >
            <div className="h-full flex items-center flex-wrap" style={{ gap: '12px' }}>
              {/* Search Field */}
              <div className="relative flex-shrink-0" style={{ width: '260px' }}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-11 border border-[#E5E7EB] rounded-full bg-white hover:bg-[#F9FAFB] focus:border-[#F25C05] focus:ring-1 focus:ring-[#F25C05] text-[13px] text-[#0A1D4D] placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Company Filter */}
              <div className="flex-shrink-0">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger 
                    className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                    style={{
                      width: '180px',
                      borderColor: selectedCompany !== "All Companies" ? "#F25C05" : "#E5E7EB",
                      color: selectedCompany !== "All Companies" ? "#0A1D4D" : "#6B7280",
                      fontWeight: selectedCompany !== "All Companies" ? 600 : 400,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter (content changes per tab) */}
              <div className="flex-shrink-0">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger 
                    className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                    style={{
                      width: '160px',
                      borderColor: selectedType !== "All Types" ? "#F25C05" : "#E5E7EB",
                      color: selectedType !== "All Types" ? "#0A1D4D" : "#6B7280",
                      fontWeight: selectedType !== "All Types" ? 600 : 400,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    {activeTab === "Expenses" && (
                      <>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Commission">Commission</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="flex-shrink-0">
                <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as StatusType)}>
                  <SelectTrigger 
                    className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                    style={{
                      width: '160px',
                      borderColor: selectedStatus !== "All" ? "#F25C05" : "#E5E7EB",
                      color: selectedStatus !== "All" ? "#0A1D4D" : "#6B7280",
                      fontWeight: selectedStatus !== "All" ? 600 : 400,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Posted">Posted</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => toast.success("Data refreshed")}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Table Container (JJB table style) */}
          <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden" style={{ marginTop: '16px' }}>
            {/* Action Button Row - Inside table card, positioned top-right */}
            <div className="flex justify-end p-4 border-b border-[#E5E7EB] bg-white">
            {activeTab === "Billings" && (
              <Button
                onClick={() => setShowBillingModal(true)}
                className="bg-[#F25C05] hover:bg-[#E55304] text-white rounded-full transition-all"
                style={{
                  height: '40px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Plus className="w-4 h-4" />
                New Billing
              </Button>
            )}
            {activeTab === "Collections" && (
              <Button
                onClick={() => setShowCollectionModal(true)}
                className="bg-[#F25C05] hover:bg-[#E55304] text-white rounded-full transition-all"
                style={{
                  height: '40px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Plus className="w-4 h-4" />
                New Collection
              </Button>
            )}
            {activeTab === "Expenses" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  variant="outline"
                  onClick={() => setShowCategoriesDrawer(true)}
                  className="rounded-full"
                  style={{ height: '40px', gap: "6px" }}
                >
                  <Settings size={16} />
                  Manage Categories
                </Button>
                <Button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-[#F25C05] hover:bg-[#E55304] text-white rounded-full transition-all"
                  style={{
                    height: '40px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  New Expense
                </Button>
              </div>
            )}
          </div>
            <div style={{ overflowX: "auto" }}>
              {activeTab === "Billings" && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FFFFFF', borderBottom: "1px solid #E6E9F0" }}>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Invoice Date
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Invoice / Billing No.
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Booking / Job No.
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Client / Customer
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Company
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Particulars
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Amount (₱)
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Collected (₱)
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Balance (₱)
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBillings.map((billing) => {
                      const statusStyle = getStatusBadgeStyle(billing.status);
                      return (
                        <tr key={billing.id} style={{ borderBottom: "1px solid #E6E9F0", height: "52px" }}>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {billing.invoiceDate}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <button 
                              className="text-[#0F5EFE] hover:underline"
                              style={{ fontSize: "14px", fontWeight: 500 }}
                            >
                              {billing.invoiceNo}
                            </button>
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <button 
                              className="text-[#0F5EFE] hover:underline flex items-center gap-1"
                              style={{ fontSize: "14px", fontWeight: 500 }}
                            >
                              {billing.bookingNo}
                              <ExternalLink size={12} />
                            </button>
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {billing.client}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {billing.company}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#6B7280", maxWidth: "200px" }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {billing.particulars}
                            </div>
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: "#1F2937", textAlign: "right" }}>
                            ₱{billing.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: billing.collected === billing.amount ? "#10b981" : "#1F2937", textAlign: "right" }}>
                            ₱{billing.collected.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: billing.balance > 0 ? "#EF4444" : "#1F2937", textAlign: "right" }}>
                            ₱{billing.balance.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 20px", textAlign: "center" }}>
                            <div 
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                              }}
                            >
                              {billing.status}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {activeTab === "Collections" && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FFFFFF', borderBottom: "1px solid #E6E9F0" }}>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Collection Date
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        OR / Receipt No.
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Client
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Company
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Payment Method
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Ref / Check No.
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Applied To
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Amount Received (₱)
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCollections.map((collection) => {
                      const statusStyle = getStatusBadgeStyle(collection.status);
                      return (
                        <tr key={collection.id} style={{ borderBottom: "1px solid #E6E9F0", height: "52px" }}>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {collection.collectionDate}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 500, color: "#1F2937" }}>
                            {collection.receiptNo}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {collection.client}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {collection.company}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {collection.paymentMethod}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#6B7280" }}>
                            {collection.refNo}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#0F5EFE] text-[13px] font-medium">
                                {collection.appliedTo.length > 1 
                                  ? `${collection.appliedTo[0]}`
                                  : collection.appliedTo[0]
                                }
                              </span>
                              {collection.appliedTo.length > 1 && (
                                <span className="text-[11px] text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                                  +{collection.appliedTo.length - 1}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: "#10b981", textAlign: "right" }}>
                            ₱{collection.amountReceived.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 20px", textAlign: "center" }}>
                            <div 
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                              }}
                            >
                              {collection.status}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {activeTab === "Expenses" && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FFFFFF', borderBottom: "1px solid #E6E9F0" }}>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Expense Date
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Expense No.
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Category
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Booking / Job No.
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Company
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Payee / Vendor
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Expense Type
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Payment Channel
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Amount (₱)
                      </th>
                      <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#000000" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockExpenses.map((expense) => {
                      const statusStyle = getStatusBadgeStyle(expense.status);
                      return (
                        <tr key={expense.id} style={{ borderBottom: "1px solid #E6E9F0", height: "52px" }}>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {expense.expenseDate}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 500, color: "#1F2937" }}>
                            {expense.expenseNo}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {expense.category}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            {expense.bookingNo ? (
                              <button 
                                className="text-[#0F5EFE] hover:underline flex items-center gap-1"
                                style={{ fontSize: "14px", fontWeight: 500 }}
                              >
                                {expense.bookingNo}
                                <ExternalLink size={12} />
                              </button>
                            ) : (
                              <span style={{ fontSize: "14px", color: "#9CA3AF" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {expense.company}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {expense.payee}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#6B7280" }}>
                            {expense.expenseType}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#6B7280" }}>
                            {expense.paymentChannel}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: "#1F2937", textAlign: "right" }}>
                            ₱{expense.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 20px", textAlign: "center" }}>
                            <div 
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                              }}
                            >
                              {expense.status}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewBillingModal 
        open={showBillingModal} 
        onClose={() => setShowBillingModal(false)}
        onSubmit={(data) => {
          console.log("New billing:", data);
          toast.success("Billing created successfully");
          setShowBillingModal(false);
        }}
      />

      <NewCollectionModal
        open={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        onSubmit={(data) => {
          console.log("New collection:", data);
          toast.success("Collection recorded successfully");
          setShowCollectionModal(false);
        }}
      />

      <NewExpenseModal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={(data) => {
          console.log("New expense:", data);
          toast.success("Expense recorded successfully");
          setShowExpenseModal(false);
        }}
      />

      <ExpenseCategoriesDrawer
        open={showCategoriesDrawer}
        onClose={() => setShowCategoriesDrawer(false)}
      />
    </div>
  );
}
