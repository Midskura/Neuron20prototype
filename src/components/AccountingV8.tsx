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
  ChevronLeft,
  ChevronRight,
  FileText,
  Wallet,
  Banknote,
} from "lucide-react";
import { cn } from "./ui/utils";
import { toast } from "./ui/toast-utils";
import { NewBillingModal } from "./accounting-v6/NewBillingModal";
import { NewCollectionModal } from "./accounting-v6/NewCollectionModal";
import { NewExpenseModal } from "./accounting-v6/NewExpenseModal";
import { ExpenseCategoriesDrawer } from "./accounting-v6/ExpenseCategoriesDrawer";
import { BillingFileView } from "./accounting-v6/BillingFileView";
import { CollectionFileView } from "./accounting-v6/CollectionFileView";
import { ExpenseFileView } from "./accounting-v6/ExpenseFileView";
import { EVouchersList } from "./accounting/EVouchersList";

type TabType = "Billings" | "Collections" | "Expenses" | "E-Vouchers";
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

// Accounting Sections Tabs Component (same style as Booking File)
function AccountingSectionsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  const tabs = [
    { 
      id: "Billings" as TabType, 
      label: "Billings",
      icon: FileText
    },
    { 
      id: "Collections" as TabType, 
      label: "Collections",
      icon: Banknote
    },
    { 
      id: "Expenses" as TabType, 
      label: "Expenses",
      icon: Wallet
    },
    { 
      id: "E-Vouchers" as TabType, 
      label: "E-Vouchers",
      icon: Wallet
    },
  ];

  return (
    <div 
      className="flex items-center gap-2 bg-white border border-[#E6E9F0] rounded-2xl"
      style={{
        height: '56px',
        padding: '8px 12px',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] transition-all"
            )}
            style={{ 
              fontWeight: activeTab === tab.id ? 600 : 500,
              backgroundColor: activeTab === tab.id ? "#E4EFEA" : "transparent",
              border: activeTab === tab.id ? "1.5px solid #5FC4A1" : "1.5px solid transparent",
              color: activeTab === tab.id ? "#237F66" : "#6B7280",
            }}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AccountingV8() {
  const [activeTab, setActiveTab] = useState<TabType>("Billings");
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedType, setSelectedType] = useState("All Billings");
  const [selectedStatus, setSelectedStatus] = useState<StatusType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoriesDrawer, setShowCategoriesDrawer] = useState(false);
  
  // File view states
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

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

  // Get button label based on active tab
  const getButtonLabel = () => {
    switch (activeTab) {
      case "Billings":
        return "New Billing";
      case "Collections":
        return "New Collection";
      case "Expenses":
        return "New Expense";
      default:
        return "New";
    }
  };

  const handlePrimaryAction = () => {
    switch (activeTab) {
      case "Billings":
        setShowBillingModal(true);
        break;
      case "Collections":
        setShowCollectionModal(true);
        break;
      case "Expenses":
        setShowExpenseModal(true);
        break;
    }
  };

  return (
    <>
      <div 
        style={{
          minHeight: "100vh",
          background: "#FFFFFF",
        }}
      >
        {/* Main Content */}
        <div
          style={{
            padding: "32px 48px",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          {/* Page Header Row - Title + CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#12332B", marginBottom: "4px", letterSpacing: "-1.2px" }}>
                Accounting
              </h1>
              <p style={{ fontSize: "14px", color: "#667085" }}>
                Log all money in and money out across companies and bookings
              </p>
            </div>
            <button
              onClick={handlePrimaryAction}
              style={{
                height: "48px",
                padding: "0 24px",
                borderRadius: "16px",
                background: "#0F766E",
                border: "none",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(15, 118, 110, 0.2)",
                transition: "all 200ms ease-out",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0D6560";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(15, 118, 110, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0F766E";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 118, 110, 0.2)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.background = "#0B5952";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.background = "#0D6560";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 118, 110, 0.2), 0 0 0 2px #0F766E40";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 118, 110, 0.2)";
              }}
            >
              <Plus size={20} />
              {getButtonLabel()}
            </button>
          </div>

          {/* Pill-style Sub-tabs */}
          <div style={{ marginBottom: "16px" }}>
            <AccountingSectionsTabs 
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSelectedType(
                  tab === "Billings" ? "All Billings" :
                  tab === "Collections" ? "All Collections" :
                  "All Expenses"
                );
              }}
            />
          </div>

          {/* Main Content Container */}
          <div 
            style={{
              background: "transparent",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              overflow: "hidden",
            }}
          >
            {/* Month Navigator Bar */}
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid #E5E9F0",
                background: "#FFFFFF",
              }}
            >
              <MonthNavigator 
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
            </div>

            {/* Filter Bar */}
            <div 
              style={{
                background: "transparent",
                padding: "12px 20px",
                borderBottom: "1px solid #E5E9F0",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {/* Left Controls Group */}
              <div className="flex items-center flex-shrink-0 flex-wrap" style={{ gap: '12px' }}>
                {/* Search Field - Pill style */}
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

                {/* Type Filter */}
                <div className="flex-shrink-0">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger 
                      className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                      style={{
                        width: '160px',
                        borderColor: selectedType !== getTypeDropdownLabel() ? "#F25C05" : "#E5E7EB",
                        color: selectedType !== getTypeDropdownLabel() ? "#0A1D4D" : "#6B7280",
                        fontWeight: selectedType !== getTypeDropdownLabel() ? 600 : 400,
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={getTypeDropdownLabel()}>{getTypeDropdownLabel()}</SelectItem>
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
                      {activeTab === "Billings" && (
                        <>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Posted">Posted</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Partial">Partial</SelectItem>
                        </>
                      )}
                      {activeTab === "Collections" && (
                        <>
                          <SelectItem value="Fully Applied">Fully Applied</SelectItem>
                          <SelectItem value="Partially Applied">Partially Applied</SelectItem>
                          <SelectItem value="Unapplied">Unapplied</SelectItem>
                        </>
                      )}
                      {activeTab === "Expenses" && (
                        <>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
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
                        <tr 
                          key={billing.id} 
                          onClick={() => setSelectedBilling(billing)}
                          className="cursor-pointer hover:bg-[#F5F6FA] transition-colors"
                          style={{ borderBottom: "1px solid #E6E9F0", height: "52px" }}
                        >
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#1F2937" }}>
                            {billing.invoiceDate}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <span 
                              className="text-[#0F766E]"
                              style={{ fontSize: "14px", fontWeight: 500 }}
                            >
                              {billing.invoiceNo}
                            </span>
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <span 
                              className="text-[#0F766E] inline-flex items-center gap-1"
                              style={{ fontSize: "14px", fontWeight: 500 }}
                            >
                              {billing.bookingNo}
                              <ExternalLink size={12} />
                            </span>
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
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: billing.collected === billing.amount ? "#0E8A4E" : "#1F2937", textAlign: "right" }}>
                            ₱{billing.collected.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 600, color: billing.balance > 0 ? "#B42318" : "#1F2937", textAlign: "right" }}>
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
                        <tr 
                          key={collection.id} 
                          onClick={() => setSelectedCollection(collection)}
                          className="cursor-pointer hover:bg-[#F5F6FA] transition-colors"
                          style={{ borderBottom: "1px solid #E6E9F0", height: "52px" }}
                        >
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
                          <td style={{ padding: "12px 20px", fontSize: "14px", color: "#0F766E" }}>
                            {collection.appliedTo.length > 1 
                              ? `${collection.appliedTo[0]} +${collection.appliedTo.length - 1}`
                              : collection.appliedTo.join(", ")
                            }
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
                        <tr 
                          key={expense.id} 
                          onClick={() => setSelectedExpense(expense)}
                          className="cursor-pointer hover:bg-[#F5F6FA] transition-colors"
                          style={{ borderBottom: "1px solid #E6E9F0", height: "52px" }}
                        >
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
                              <span 
                                className="text-[#0F766E] inline-flex items-center gap-1"
                                style={{ fontSize: "14px", fontWeight: 500 }}
                              >
                                {expense.bookingNo}
                                <ExternalLink size={12} />
                              </span>
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

              {activeTab === "E-Vouchers" && (
                <EVouchersList />
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

      {/* File Views */}
      {selectedBilling && (
        <BillingFileView
          billing={selectedBilling}
          onClose={() => setSelectedBilling(null)}
          onOpenBooking={(bookingNo) => {
            toast.info(`Opening booking: ${bookingNo}`);
            // In real implementation, this would navigate to the booking
          }}
        />
      )}

      {selectedCollection && (
        <CollectionFileView
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
          onOpenBooking={(bookingNo) => {
            toast.info(`Opening booking: ${bookingNo}`);
            // In real implementation, this would navigate to the booking
          }}
        />
      )}

      {selectedExpense && (
        <ExpenseFileView
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onOpenBooking={(bookingNo) => {
            toast.info(`Opening booking: ${bookingNo}`);
            // In real implementation, this would navigate to the booking
          }}
        />
      )}
    </>
  );
}