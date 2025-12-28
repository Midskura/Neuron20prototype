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
  Search,
  ExternalLink,
  Settings,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
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

export default function AccountingV7() {
  const [activeTab, setActiveTab] = useState<TabType>("Billings");
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedType, setSelectedType] = useState("All Billings");
  const [selectedStatus, setSelectedStatus] = useState<StatusType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoriesDrawer, setShowCategoriesDrawer] = useState(false);

  // Calculate stats for Billings
  const totalBilled = mockBillings.reduce((sum, b) => sum + b.amount, 0);
  const totalCollected = mockBillings.reduce((sum, b) => sum + b.collected, 0);
  const outstanding = totalBilled - totalCollected;

  // Calculate stats for Collections
  const totalCollectedAmt = mockCollections.reduce((sum, c) => sum + c.amountReceived, 0);
  const totalApplied = totalCollectedAmt; // Mock: assume all applied
  const unapplied = 0;

  // Calculate stats for Expenses
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = mockExpenses.filter(e => e.status === "Paid").reduce((sum, e) => sum + e.amount, 0);
  const unpaidExpenses = mockExpenses.filter(e => e.status === "Unpaid").reduce((sum, e) => sum + e.amount, 0);

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

  // Get dropdown label based on active tab
  const getTypeDropdownLabel = () => {
    switch (activeTab) {
      case "Billings":
        return "All Billings";
      case "Collections":
        return "All Collections";
      case "Expenses":
        return "All Expenses";
      default:
        return "All";
    }
  };

  return (
    <div className="flex flex-col pb-6" style={{ width: '1440px', maxWidth: '100%', margin: '0 auto', backgroundColor: '#F5F6FA' }}>
      {/* Page Header Section */}
      <div 
        className="bg-white border-b border-[#E6E9F0]"
        style={{ 
          paddingTop: '24px',
          paddingBottom: '16px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 
              className="text-[#0A1D4D]"
              style={{ 
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: '1.2',
                marginBottom: '4px',
              }}
            >
              Accounting
            </h1>
            <p 
              className="text-[#6B7280]"
              style={{ 
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.4',
                marginBottom: '8px',
              }}
            >
              Log all money in and money out across companies and bookings.
            </p>
            <button 
              className="text-[#0F5EFE] hover:underline flex items-center gap-1"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              Open Accounting Reports
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Flat Tabs (Xero-style) */}
      <div className="bg-white border-b border-[#E6E9F0]" style={{ paddingLeft: '32px' }}>
        <div className="flex items-center gap-8">
          {(["Billings", "Collections", "Expenses"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-0 py-3 text-[14px] transition-all relative",
                activeTab === tab
                  ? "text-[#0A1D4D]"
                  : "text-[#6B7280] hover:text-[#0A1D4D]"
              )}
              style={{ 
                fontWeight: activeTab === tab ? 600 : 500,
                borderBottom: activeTab === tab ? '3px solid #F26A21' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ paddingLeft: '32px', paddingRight: '32px', paddingTop: '24px' }}>
        {/* KPI Tiles Row */}
        <div className="flex gap-4 mb-6">
          {activeTab === "Billings" && (
            <>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FFF4E6' }}
                  >
                    <DollarSign className="w-5 h-5" style={{ color: '#F26A21' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Billed
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{totalBilled.toLocaleString()}
                </div>
              </div>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#E8F5E9' }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Collected
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{totalCollected.toLocaleString()}
                </div>
              </div>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FEE2E2' }}
                  >
                    <TrendingDown className="w-5 h-5" style={{ color: '#EF4444' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Balance
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{outstanding.toLocaleString()}
                </div>
              </div>
            </>
          )}

          {activeTab === "Collections" && (
            <>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#E8F5E9' }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Collected
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{totalCollectedAmt.toLocaleString()}
                </div>
              </div>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FFF4E6' }}
                  >
                    <DollarSign className="w-5 h-5" style={{ color: '#F26A21' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Applied to Invoices
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{totalApplied.toLocaleString()}
                </div>
              </div>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FEE2E2' }}
                  >
                    <TrendingDown className="w-5 h-5" style={{ color: '#EF4444' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Unapplied
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{unapplied.toLocaleString()}
                </div>
              </div>
            </>
          )}

          {activeTab === "Expenses" && (
            <>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FFF4E6' }}
                  >
                    <DollarSign className="w-5 h-5" style={{ color: '#F26A21' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Expenses
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{totalExpenses.toLocaleString()}
                </div>
              </div>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#E8F5E9' }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Paid
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{paidExpenses.toLocaleString()}
                </div>
              </div>
              <div 
                className="bg-white rounded-2xl flex-1" 
                style={{ 
                  padding: '20px 24px',
                  border: '1px solid #E6E9F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FEE2E2' }}
                  >
                    <TrendingDown className="w-5 h-5" style={{ color: '#EF4444' }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                    Unpaid
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000' }}>
                  ₱{unpaidExpenses.toLocaleString()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter Bar */}
        <div 
          className="bg-white rounded-2xl flex items-center gap-4"
          style={{ 
            padding: '16px',
            border: '1px solid #E6E9F0',
            marginBottom: '16px',
            height: '72px',
          }}
        >
          {/* Transaction Type */}
          <div className="flex-shrink-0">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger 
                className="h-10 rounded-lg border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                style={{ width: '160px' }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={getTypeDropdownLabel()}>{getTypeDropdownLabel()}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer" style={{ height: '40px' }}>
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <span className="text-[13px] text-[#0A1D4D]">Nov 1, 2025</span>
            </div>
            <span className="text-[#6B7280]">→</span>
            <div className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer" style={{ height: '40px' }}>
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <span className="text-[13px] text-[#0A1D4D]">Nov 30, 2025</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 border border-[#E5E7EB] rounded-lg bg-white hover:bg-[#F9FAFB] focus:border-[#F26A21] focus:ring-1 focus:ring-[#F26A21] text-[13px] text-[#0A1D4D] placeholder:text-[#9CA3AF]"
            />
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 flex gap-2">
            {activeTab === "Billings" && (
              <Button
                onClick={() => setShowBillingModal(true)}
                className="bg-[#F26A21] hover:bg-[#E55A11] text-white rounded-lg transition-all"
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
                className="bg-[#F26A21] hover:bg-[#E55A11] text-white rounded-lg transition-all"
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
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowCategoriesDrawer(true)}
                  className="rounded-lg border-[#E5E7EB]"
                  style={{ height: '40px', gap: "6px" }}
                >
                  <Settings size={16} />
                  Manage
                </Button>
                <Button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-[#F26A21] hover:bg-[#E55A11] text-white rounded-lg transition-all"
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
              </>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div 
          className="bg-white rounded-2xl overflow-hidden"
          style={{ 
            border: '1px solid #E6E9F0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ overflowX: "auto" }}>
            {activeTab === "Billings" && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAFBFC', borderBottom: "1px solid #E6E9F0" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Invoice Date
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Invoice / Billing No.
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Booking / Job No.
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Client / Customer
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Company
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Particulars
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Amount (₱)
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Collected (₱)
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Balance (₱)
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                  <tr style={{ backgroundColor: '#FAFBFC', borderBottom: "1px solid #E6E9F0" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Collection Date
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      OR / Receipt No.
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Client
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Company
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Payment Method
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Ref / Check No.
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Applied To
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Amount Received (₱)
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                        <td style={{ padding: "12px 20px", fontSize: "14px", color: "#0F5EFE" }}>
                          {collection.appliedTo.join(", ")}
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: "#1F2937", textAlign: "right" }}>
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
                  <tr style={{ backgroundColor: '#FAFBFC', borderBottom: "1px solid #E6E9F0" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Expense Date
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Expense No.
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Category
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Booking / Job No.
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Company
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Payee / Vendor
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Expense Type
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Amount (₱)
                    </th>
                    <th style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
