import { useState, useEffect } from "react";
import { Plus, Inbox, ListChecks, Wallet, Tags } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MonthNavigator } from "./accounting-v3/MonthNavigator";
import { CountPills } from "./accounting-v3/CountPills";
import { FilterGroup } from "./accounting-v3/FilterGroup";
import { EntriesTable } from "./accounting-v3/EntriesTable";
import { EntryModal } from "./accounting-v3/EntryModal";
import { AccountsScreen } from "./accounting-v3/AccountsScreen";
import { CategoriesScreen } from "./accounting-v3/CategoriesScreen";
import { ApproveRejectModal } from "./accounting-v3/ApproveRejectModal";
import { PrintRFPModal } from "./accounting-v3/PrintRFPModal";
import { COMPANIES, getCompanyById } from "./accounting-v3/companies";
import { EntryStatus } from "./accounting-v3/StatusPill";
import { RFPStatus } from "./accounting-v3/RFPStatusPill";

type TabValue = "entries" | "accounts" | "categories";

interface Entry {
  id: string;
  type: "revenue" | "expense" | "transfer";
  amount: number;
  category: string;
  categoryColor: string;
  accountId: string;
  accountName: string;
  company: string;
  bookingNo: string;
  note: string;
  date: string;
  status: EntryStatus;
  payee?: string;
  paymentMethod?: string;
  isNoBooking?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  requestedBy?: string;
  requestedDate?: string;
  rfpId?: string;
  rfpStatus?: RFPStatus;
}

interface Account {
  id: string;
  name: string;
  company: string;
  balance: number;
  isDefault?: boolean;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

export function AccountingV3() {
  const [activeTab, setActiveTab] = useState<TabValue>("entries");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEntrySheetOpen, setIsEntrySheetOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [entryToApprove, setEntryToApprove] = useState<Entry | null>(null);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [entryToPrint, setEntryToPrint] = useState<Entry | null>(null);
  const [userRole, setUserRole] = useState<"accountant" | "approver">("approver"); // For demo purposes

  // Filters
  const [filters, setFilters] = useState({
    bookingNo: "",
    company: [] as string[],
    type: "all",
    account: "all",
    category: "all",
    status: "all" as "all" | EntryStatus,
  });

  // Mock data
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: "1",
      type: "expense",
      amount: 5000,
      category: "Fuel",
      categoryColor: "#EF4444",
      accountId: "1",
      accountName: "Cash",
      company: "cce",
      bookingNo: "ND-2025-001",
      note: "Diesel for long haul",
      date: "2025-10-24",
      status: "posted",
      payee: "Shell Gas Station",
      paymentMethod: "Cash",
      approvedBy: "Juan dela Cruz",
      approvedDate: "2025-10-24",
      requestedBy: "Maria Santos",
      requestedDate: "2025-10-24",
      rfpId: "RFP-1024",
      rfpStatus: "approved" as RFPStatus,
    },
    {
      id: "2",
      type: "revenue",
      amount: 15000,
      category: "Transport Services",
      categoryColor: "#10B981",
      accountId: "2",
      accountName: "Bank - BPI",
      company: "znicf",
      bookingNo: "ND-2025-002",
      note: "Payment for delivery",
      date: "2025-10-24",
      status: "posted",
    },
    {
      id: "3",
      type: "expense",
      amount: 2500,
      category: "Toll Fees",
      categoryColor: "#F97316",
      accountId: "3",
      accountName: "Cash",
      company: "jlcs",
      bookingNo: "ND-2025-003",
      note: "Skyway toll fees",
      date: "2025-10-24",
      status: "pending",
      payee: "Skyway Toll",
      paymentMethod: "Cash",
      requestedBy: "Maria Santos",
      requestedDate: "2025-10-24",
      rfpId: "RFP-1023",
      rfpStatus: "submitted" as RFPStatus,
    },
    {
      id: "4",
      type: "revenue",
      amount: 22000,
      category: "Transport Services",
      categoryColor: "#10B981",
      accountId: "2",
      accountName: "Bank - BPI",
      company: "zomi",
      bookingNo: "ND-2025-004",
      note: "Long haul delivery payment",
      date: "2025-10-23",
      status: "posted",
    },
    {
      id: "5",
      type: "expense",
      amount: 3200,
      category: "Fuel",
      categoryColor: "#EF4444",
      accountId: "1",
      accountName: "Cash",
      company: "cptc",
      bookingNo: "ND-2025-004",
      note: "",
      date: "2025-10-23",
      status: "posted",
    },
    {
      id: "6",
      type: "expense",
      amount: 1500,
      category: "Maintenance",
      categoryColor: "#F59E0B",
      accountId: "1",
      accountName: "Cash",
      company: "cce",
      bookingNo: "ND-2025-005",
      note: "Oil change and tire rotation",
      date: "2025-10-23",
      status: "posted",
    },
    {
      id: "7",
      type: "revenue",
      amount: 18500,
      category: "Transport Services",
      categoryColor: "#10B981",
      accountId: "2",
      accountName: "Bank - BPI",
      company: "znicf",
      bookingNo: "ND-2025-006",
      note: "",
      date: "2025-10-22",
      status: "posted",
    },
    {
      id: "8",
      type: "expense",
      amount: 4200,
      category: "Fuel",
      categoryColor: "#EF4444",
      accountId: "3",
      accountName: "Cash",
      company: "jlcs",
      bookingNo: "ND-2025-006",
      note: "Diesel refill",
      date: "2025-10-22",
      status: "posted",
    },
    {
      id: "9",
      type: "expense",
      amount: 800,
      category: "Toll Fees",
      categoryColor: "#F97316",
      accountId: "1",
      accountName: "Cash",
      company: "cce",
      bookingNo: "ND-2025-007",
      note: "NLEX toll",
      date: "2025-10-22",
      status: "approved",
      payee: "NLEX Corporation",
      paymentMethod: "Cash",
      approvedBy: "Juan dela Cruz",
      approvedDate: "2025-10-23",
      requestedBy: "Maria Santos",
      requestedDate: "2025-10-22",
    },
    {
      id: "10",
      type: "expense",
      amount: 3500,
      category: "Driver Allowance",
      categoryColor: "#FB923C",
      accountId: "1",
      accountName: "Cash",
      company: "cce",
      bookingNo: "",
      note: "Weekly driver allowance for long haul deliveries",
      date: "2025-10-24",
      status: "pending",
      payee: "Pedro Reyes",
      paymentMethod: "Cash",
      isNoBooking: true,
      requestedBy: "Maria Santos",
      requestedDate: "2025-10-24",
    },
    {
      id: "11",
      type: "expense",
      amount: 1200,
      category: "Office & Admin",
      categoryColor: "#6366F1",
      accountId: "1",
      accountName: "Cash",
      company: "znicf",
      bookingNo: "",
      note: "Office supplies - printer ink and paper",
      date: "2025-10-23",
      status: "rejected",
      payee: "National Bookstore",
      paymentMethod: "Cash",
      isNoBooking: true,
      rejectedBy: "Juan dela Cruz",
      rejectionReason: "Please provide detailed receipt. Current receipt is unclear.",
      requestedBy: "Maria Santos",
      requestedDate: "2025-10-23",
    },
  ]);

  const [accounts, setAccounts] = useState<Account[]>([
    { id: "1", name: "Cash", company: "cce", balance: 50000, isDefault: true },
    { id: "2", name: "Bank - BPI", company: "znicf", balance: 120000 },
    { id: "3", name: "Cash", company: "jlcs", balance: 25000 },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Transport Services", type: "income", color: "#10B981" },
    { id: "2", name: "Fuel", type: "expense", color: "#EF4444" },
    { id: "3", name: "Toll Fees", type: "expense", color: "#F97316" },
    { id: "4", name: "Maintenance", type: "expense", color: "#F59E0B" },
  ]);

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    // Filter by month
    const entryDate = new Date(entry.date);
    if (
      entryDate.getMonth() !== currentDate.getMonth() ||
      entryDate.getFullYear() !== currentDate.getFullYear()
    ) {
      return false;
    }

    // Other filters
    if (filters.bookingNo && !entry.bookingNo.toLowerCase().includes(filters.bookingNo.toLowerCase())) {
      return false;
    }
    if (filters.company.length > 0 && !filters.company.includes(entry.company)) {
      return false;
    }
    if (filters.type !== "all" && entry.type !== filters.type) {
      return false;
    }
    if (filters.account !== "all" && entry.accountId !== filters.account) {
      return false;
    }
    if (filters.category !== "all" && entry.category !== filters.category) {
      return false;
    }
    if (filters.status !== "all" && entry.status !== filters.status) {
      return false;
    }

    return true;
  });

  const uniqueBookings = [...new Set(entries.map((e) => e.bookingNo))];
  
  // Count pending approvals
  const pendingApprovalsCount = entries.filter((e) => {
    const entryDate = new Date(e.date);
    return (
      e.status === "pending" &&
      entryDate.getMonth() === currentDate.getMonth() &&
      entryDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const companyOptions = COMPANIES.map((c) => ({ 
    value: c.id, 
    label: c.name 
  }));

  const accountOptions = accounts.map((a) => ({ 
    value: a.id, 
    label: `${a.name} - ${a.company}` 
  }));
  const categoryOptions = {
    revenue: categories
      .filter((c) => c.type === "income")
      .map((c) => ({ value: c.name, label: c.name, color: c.color })),
    expense: categories
      .filter((c) => c.type === "expense")
      .map((c) => ({ value: c.name, label: c.name, color: c.color })),
  };

  const allCategoryOptions = categories.map((c) => ({ value: c.name, label: c.name }));

  const bookingOptions = uniqueBookings.map((b) => ({ value: b, label: b }));

  // Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleClearFilters = () => {
    setFilters({
      bookingNo: "",
      company: [],
      type: "all",
      account: "all",
      category: "all",
      status: "all",
      hasRFP: "all",
      rfpStatus: [],
    });
  };

  const handleSaveEntry = (data: any, status: EntryStatus) => {
    const category = categories.find((c) => c.name === data.category);
    const account = accounts.find((a) => a.id === data.account);

    if (selectedEntry) {
      // Update existing
      setEntries(
        entries.map((e) =>
          e.id === selectedEntry.id
            ? {
                ...e,
                type: data.type,
                amount: parseFloat(data.amount),
                category: data.category,
                categoryColor: category?.color || "#6B7280",
                accountId: data.account,
                accountName: account?.name || "",
                company: data.company,
                bookingNo: data.bookingNo,
                note: data.note,
                date: data.date.toISOString().split("T")[0],
                status: status,
                payee: data.payee,
                paymentMethod: data.paymentMethod,
                isNoBooking: data.isNoBooking,
              }
            : e
        )
      );
    } else {
      // Create new
      const newEntry: Entry = {
        id: Date.now().toString(),
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        categoryColor: category?.color || "#6B7280",
        accountId: data.account,
        accountName: account?.name || "",
        company: data.company,
        bookingNo: data.bookingNo,
        note: data.note,
        date: data.date.toISOString().split("T")[0],
        status: status,
        payee: data.payee,
        paymentMethod: data.paymentMethod,
        isNoBooking: data.isNoBooking,
        requestedBy: "Maria Santos",
        requestedDate: new Date().toISOString().split("T")[0],
      };
      setEntries([newEntry, ...entries]);
    }

    setSelectedEntry(null);
  };

  const handleViewEntry = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEntrySheetOpen(true);
  };

  const handleDuplicateEntry = (entry: Entry) => {
    const newEntry: Entry = {
      ...entry,
      id: Date.now().toString(),
      status: "draft",
    };
    setEntries([newEntry, ...entries]);
  };

  const handleToggleStatus = (entry: Entry) => {
    setEntries(
      entries.map((e) =>
        e.id === entry.id
          ? { ...e, status: e.status === "posted" ? "draft" : "posted" }
          : e
      )
    );
  };

  const handleDeleteEntry = (entry: Entry) => {
    setEntries(entries.filter((e) => e.id !== entry.id));
    if (selectedEntry?.id === entry.id) {
      setIsEntrySheetOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleSendForApproval = (entry: Entry) => {
    setEntries(
      entries.map((e) =>
        e.id === entry.id
          ? {
              ...e,
              status: "pending" as EntryStatus,
              requestedBy: "Maria Santos",
              requestedDate: new Date().toISOString().split("T")[0],
            }
          : e
      )
    );
    setIsEntrySheetOpen(false);
    setSelectedEntry(null);
  };

  const handleApprove = (entry: Entry) => {
    setEntries(
      entries.map((e) =>
        e.id === entry.id
          ? {
              ...e,
              status: "approved" as EntryStatus,
              approvedBy: "Juan dela Cruz",
              approvedDate: new Date().toISOString().split("T")[0],
            }
          : e
      )
    );
  };

  const handleReject = (entry: Entry, reason: string) => {
    setEntries(
      entries.map((e) =>
        e.id === entry.id
          ? {
              ...e,
              status: "rejected" as EntryStatus,
              rejectedBy: "Juan dela Cruz",
              rejectionReason: reason,
            }
          : e
      )
    );
  };

  const handlePost = (entry: Entry) => {
    setEntries(
      entries.map((e) =>
        e.id === entry.id
          ? {
              ...e,
              status: "posted" as EntryStatus,
            }
          : e
      )
    );
    setIsEntrySheetOpen(false);
    setSelectedEntry(null);
  };

  const handlePrintRFP = (entry: Entry) => {
    // Close Entry Modal first, then open Print RFP Modal
    setIsEntrySheetOpen(false);
    setSelectedEntry(null);
    // Open Print Modal
    setEntryToPrint(entry);
    setIsPrintViewOpen(true);
  };

  const handleOpenApprovalModal = (entry: Entry) => {
    setEntryToApprove(entry);
    setIsApprovalModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4" style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '16px', width: '1440px', maxWidth: '100%', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="flex items-center justify-between" style={{ maxWidth: '100%', marginBottom: '16px' }}>
          <div>
            <h1 className="text-[28px] text-[#0A1D4D]" style={{ fontWeight: 700, lineHeight: '42px', letterSpacing: '-0.01em' }}>
              Accounting
            </h1>
            <p className="text-[14px] text-[#6B7280] mt-1" style={{ fontWeight: 400, lineHeight: '21px' }}>
              Manage entries, accounts, and categories
            </p>
          </div>
        </div>

        {/* Tabs Row */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1 flex flex-col">
          <div className="mt-3 mb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide md:px-0 px-3">
              <button
                onClick={() => setActiveTab("entries")}
                className={`h-9 min-w-[102px] px-3.5 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D] flex items-center justify-center gap-2 ${
                  activeTab === "entries"
                    ? "bg-[#EEF2FF] border-[#0A1D4D] text-[#0A1D4D]"
                    : "bg-white border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#C7CBD1] hover:text-[#374151]"
                }`}
                style={{ fontWeight: 600, fontSize: '14px' }}
                title="Entries"
              >
                <ListChecks className="w-4 h-4" />
                Entries
              </button>
              <button
                onClick={() => setActiveTab("accounts")}
                className={`h-9 min-w-[102px] px-3.5 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D] flex items-center justify-center gap-2 ${
                  activeTab === "accounts"
                    ? "bg-[#EEF2FF] border-[#0A1D4D] text-[#0A1D4D]"
                    : "bg-white border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#C7CBD1] hover:text-[#374151]"
                }`}
                style={{ fontWeight: 600, fontSize: '14px' }}
                title="Accounts"
              >
                <Wallet className="w-4 h-4" />
                Accounts
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`h-9 min-w-[102px] px-3.5 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D] flex items-center justify-center gap-2 ${
                  activeTab === "categories"
                    ? "bg-[#EEF2FF] border-[#0A1D4D] text-[#0A1D4D]"
                    : "bg-white border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#C7CBD1] hover:text-[#374151]"
                }`}
                style={{ fontWeight: 600, fontSize: '14px' }}
                title="Categories"
              >
                <Tags className="w-4 h-4" />
                Categories
              </button>
            </div>
          </div>

          {/* Divider under tabs */}
          <div className="border-t border-[#E5E7EB]" style={{ marginBottom: '12px' }} />

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1280px] mx-auto" style={{ paddingTop: '16px' }}>
            <TabsContent value="entries" className="mt-0">
              {/* Card — Period & Actions */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl mb-3" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', padding: '12px' }}>
                {/* Desktop layout: horizontal */}
                <div className="hidden md:flex items-center justify-between gap-4">
                  {/* Left: Period Controls */}
                  <MonthNavigator
                    currentDate={currentDate}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                  />

                  {/* Right: Counts and Action */}
                  <div className="flex items-center gap-3">
                    <CountPills
                      entriesCount={filteredEntries.length}
                      bookingsCount={uniqueBookings.length}
                    />
                    {/* Approvals Pill */}
                    <button
                      onClick={() => {
                        setFilters({ ...filters, status: "pending" });
                      }}
                      className={`h-9 px-3 rounded-full border transition-all ${
                        pendingApprovalsCount > 0
                          ? "bg-[#FFFBEB] border-[#FEF3C7] text-[#B45309] hover:bg-[#FEF3C7]"
                          : "bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF] cursor-default"
                      }`}
                      style={{ fontWeight: 600, fontSize: '13px' }}
                      disabled={pendingApprovalsCount === 0}
                      title={pendingApprovalsCount > 0 ? "View pending approvals" : "No pending approvals"}
                    >
                      Approvals • {pendingApprovalsCount}
                    </button>
                    <Button 
                      onClick={() => {
                        setSelectedEntry(null);
                        setIsEntrySheetOpen(true);
                      }}
                      className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-xl h-10 px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D]"
                      style={{ fontWeight: 600, fontSize: '14px' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Entry
                    </Button>
                  </div>
                </div>

                {/* Mobile layout: vertical */}
                <div className="flex md:hidden flex-col gap-3">
                  {/* Period Controls */}
                  <MonthNavigator
                    currentDate={currentDate}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                  />

                  {/* Count Pills */}
                  <CountPills
                    entriesCount={filteredEntries.length}
                    bookingsCount={uniqueBookings.length}
                  />

                  {/* Full-width New Entry Button */}
                  <Button 
                    onClick={() => {
                      setSelectedEntry(null);
                      setIsEntrySheetOpen(true);
                    }}
                    className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-xl h-11 w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D]"
                    style={{ fontWeight: 600, fontSize: '14px' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                  </Button>
                </div>
              </div>

              {/* Card B — Filters */}
              <div className="bg-white border border-neutral-200 rounded-xl mb-3" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ paddingBottom: '12px' }}>
                  <FilterGroup
                    bookingNo={filters.bookingNo}
                    onBookingNoChange={(value) => setFilters({ ...filters, bookingNo: value })}
                    company={filters.company}
                    onCompanyChange={(values) => setFilters({ ...filters, company: values })}
                    type={filters.type}
                    onTypeChange={(value) => setFilters({ ...filters, type: value })}
                    account={filters.account}
                    onAccountChange={(value) => setFilters({ ...filters, account: value })}
                    category={filters.category}
                    onCategoryChange={(value) => setFilters({ ...filters, category: value })}
                    status={filters.status}
                    onStatusChange={(value) => setFilters({ ...filters, status: value })}
                    hasRFP={filters.hasRFP}
                    onHasRFPChange={(value) => setFilters({ ...filters, hasRFP: value })}
                    rfpStatus={filters.rfpStatus}
                    onRFPStatusChange={(values) => setFilters({ ...filters, rfpStatus: values })}
                    onClearFilters={handleClearFilters}
                    companyOptions={companyOptions}
                    accountOptions={accountOptions}
                    categoryOptions={allCategoryOptions}
                    bookingSuggestions={uniqueBookings}
                  />
                </div>
              </div>

              {/* Entries Table or Empty State */}
              {filteredEntries.length > 0 ? (
                <EntriesTable
                  entries={filteredEntries}
                  onView={handleViewEntry}
                  onDuplicate={handleDuplicateEntry}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteEntry}
                  onSendForApproval={handleSendForApproval}
                  onApprove={handleOpenApprovalModal}
                  onReject={handleOpenApprovalModal}
                  onPrintRFP={handlePrintRFP}
                  userRole={userRole}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 border border-neutral-200 rounded-xl bg-white" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
                  <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-[16px] font-medium text-[#0A1D4D] mb-2">
                    {/* Check if there are no entries in the current month */}
                    {entries.filter((e) => {
                      const entryDate = new Date(e.date);
                      return entryDate.getMonth() === currentDate.getMonth() &&
                             entryDate.getFullYear() === currentDate.getFullYear();
                    }).length === 0 ? "No entries this month" : "No matches"}
                  </h3>
                  <p className="text-[13px] text-neutral-500">
                    {entries.filter((e) => {
                      const entryDate = new Date(e.date);
                      return entryDate.getMonth() === currentDate.getMonth() &&
                             entryDate.getFullYear() === currentDate.getFullYear();
                    }).length === 0
                      ? "Add one with +"
                      : "Clear filters."}
                  </p>
                  {entries.filter((e) => {
                    const entryDate = new Date(e.date);
                    return entryDate.getMonth() === currentDate.getMonth() &&
                           entryDate.getFullYear() === currentDate.getFullYear();
                  }).length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={handleClearFilters}
                      className="border-neutral-200 hover:bg-neutral-50 mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accounts" className="mt-0">
              <AccountsScreen
                accounts={accounts}
                companyOptions={companyOptions}
                onSetDefault={(id) => {
                  setAccounts(
                    accounts.map((a) => ({ ...a, isDefault: a.id === id }))
                  );
                }}
                onRename={(id, newName) => {
                  setAccounts(
                    accounts.map((a) => (a.id === id ? { ...a, name: newName } : a))
                  );
                }}
                onArchive={(id) => {
                  setAccounts(accounts.filter((a) => a.id !== id));
                }}
                onAddAccount={(data) => {
                  const newAccount: Account = {
                    id: Date.now().toString(),
                    name: data.name,
                    company: data.company,
                    balance: data.openingBalance,
                  };
                  setAccounts([...accounts, newAccount]);
                }}
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <CategoriesScreen
                categories={categories}
                onRename={(id, newName) => {
                  setCategories(
                    categories.map((c) => (c.id === id ? { ...c, name: newName } : c))
                  );
                }}
                onMerge={(sourceId, targetId) => {
                  // TODO: Implement merge logic
                  console.log("Merge", sourceId, "into", targetId);
                }}
                onArchive={(id) => {
                  setCategories(categories.filter((c) => c.id !== id));
                }}
                onAddCategory={(data) => {
                  const newCategory: Category = {
                    id: Date.now().toString(),
                    name: data.name,
                    type: data.type,
                    color: data.color,
                  };
                  setCategories([...categories, newCategory]);
                }}
              />
            </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Entry Modal */}
      <EntryModal
        open={isEntrySheetOpen}
        onOpenChange={setIsEntrySheetOpen}
        entry={selectedEntry}
        onSave={handleSaveEntry}
        onDelete={
          selectedEntry
            ? () => {
                handleDeleteEntry(selectedEntry);
              }
            : undefined
        }
        companyOptions={companyOptions}
        bookingOptions={bookingOptions}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        onSendForApproval={
          selectedEntry && selectedEntry.status === "draft"
            ? () => handleSendForApproval(selectedEntry)
            : undefined
        }
        onApprove={
          selectedEntry && selectedEntry.status === "pending" && userRole === "approver"
            ? () => handleOpenApprovalModal(selectedEntry)
            : undefined
        }
        onReject={
          selectedEntry && selectedEntry.status === "pending" && userRole === "approver"
            ? () => handleOpenApprovalModal(selectedEntry)
            : undefined
        }
        onPost={
          selectedEntry && selectedEntry.status === "approved"
            ? () => handlePost(selectedEntry)
            : undefined
        }
        onPrintRFP={
          selectedEntry && selectedEntry.status !== "draft"
            ? () => handlePrintRFP(selectedEntry)
            : undefined
        }
        userRole={userRole}
      />

      {/* Approval Modal */}
      {entryToApprove && (
        <ApproveRejectModal
          open={isApprovalModalOpen}
          onOpenChange={setIsApprovalModalOpen}
          entry={{
            payee: entryToApprove.payee,
            amount: entryToApprove.amount,
            company: getCompanyById(entryToApprove.company)?.name || entryToApprove.company,
            category: entryToApprove.category,
            bookingNo: entryToApprove.bookingNo,
            note: entryToApprove.note,
            attachments: 0, // Mock for now
          }}
          onApprove={() => {
            handleApprove(entryToApprove);
            setIsApprovalModalOpen(false);
            setEntryToApprove(null);
          }}
          onReject={(reason) => {
            handleReject(entryToApprove, reason);
            setIsApprovalModalOpen(false);
            setEntryToApprove(null);
          }}
        />
      )}

      {/* Print RFP Modal */}
      <PrintRFPModal
        open={isPrintViewOpen}
        onOpenChange={(open) => {
          setIsPrintViewOpen(open);
          if (!open) {
            setEntryToPrint(null);
          }
        }}
        entry={entryToPrint || entries[0]} // Fallback to prevent type errors
      />
    </>
  );
}
