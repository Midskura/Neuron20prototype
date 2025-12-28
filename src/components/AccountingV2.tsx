import { useState } from "react";
import { CommandBar } from "./accounting/CommandBar";
import { ModuleNavigation } from "./accounting/ModuleNavigation";
import { EntriesPage } from "./accounting/EntriesPage";
import { EntriesPageNew } from "./accounting/EntriesPageNew";
import { ApprovalsPage } from "./accounting/ApprovalsPage";
import { AccountsPage } from "./accounting/AccountsPage";
import { CategoriesPage } from "./accounting/CategoriesPage";
import { ImportExportPage } from "./accounting/ImportExportPage";
import { ClientsLedgerPage } from "./accounting/ClientsLedgerPage";
import { ComponentsDemo } from "./accounting/ComponentsDemo";

interface Expense {
  id: string;
  bookingId: string;
  bookingNo: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  enteredBy: string;
}

interface Payment {
  id: string;
  bookingId: string;
  bookingNo: string;
  amount: number;
  date: string;
  method: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface AccountingV2Props {
  expenses: Expense[];
  payments: Payment[];
  bookings: Array<{ id: string; trackingNo: string; client: string }>;
  onCreateExpense: (expense: Omit<Expense, "id" | "status" | "enteredBy">) => void;
  onApproveExpense: (id: string) => void;
  onRejectExpense: (id: string) => void;
  onApprovePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
  onViewExpense?: (id: string) => void;
  currentUser?: string;
}

export function AccountingV2({
  expenses,
  payments,
  bookings,
  onCreateExpense,
  onApproveExpense,
  onRejectExpense,
  onApprovePayment,
  onRejectPayment,
  onViewExpense,
  currentUser = "Current User",
}: AccountingV2Props) {
  const [activeTab, setActiveTab] = useState("entries");
  const [company, setCompany] = useState("jjb");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "entries":
        return <EntriesPageNew />;
      case "entries-old":
        return (
          <EntriesPage
            expenses={expenses}
            bookings={bookings}
            onCreateExpense={onCreateExpense}
            onViewExpense={onViewExpense}
          />
        );
      case "approvals":
        return (
          <ApprovalsPage
            expenses={expenses}
            payments={payments}
            onApproveExpense={onApproveExpense}
            onRejectExpense={onRejectExpense}
            onApprovePayment={onApprovePayment}
            onRejectPayment={onRejectPayment}
          />
        );
      case "accounts":
        return <AccountsPage />;
      case "categories":
        return <CategoriesPage />;
      case "clients":
        return (
          <ClientsLedgerPage
            bookings={bookings}
            expenses={expenses}
            payments={payments}
          />
        );
      case "import-export":
        return <ImportExportPage />;
      case "components-demo":
        return <ComponentsDemo />;
      default:
        return null;
    }
  };

  // EntriesPageNew is a full-page component with its own command bar and tabs
  if (activeTab === "entries") {
    return <EntriesPageNew />;
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Command Bar - Persistent across all Accounting pages */}
      <CommandBar
        company={company}
        onCompanyChange={setCompany}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewEntry={() => setIsNewEntryOpen(true)}
      />

      {/* Module Navigation - Top tabs with icons and underline indicator */}
      <ModuleNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Page Content - 1440×auto canvas, max-width 1200px, padding 24px */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
