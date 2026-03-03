// AggregateExpensesPage — Renders UnifiedExpensesTab with ALL expenses (system-wide)
// Plus a Catalog tab for managing Expense catalog items

import { useState, useEffect, useCallback } from "react";
import { UnifiedExpensesTab } from "./UnifiedExpensesTab";
import { CatalogManagementPage } from "./CatalogManagementPage";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import type { Expense as OperationsExpense } from "../../types/operations";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

type Tab = "all" | "catalog";

export function AggregateExpensesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [expenses, setExpenses] = useState<OperationsExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/accounting/expenses`, {
        headers: { "Authorization": `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Map API response to OperationsExpense format
        const mapped: OperationsExpense[] = (data.data || data || []).map((ev: any) => ({
          id: ev.id,
          expenseName: ev.voucher_number || ev.expense_name || ev.id,
          description: ev.purpose || ev.description || "",
          amount: ev.total_amount || ev.amount || 0,
          currency: ev.currency || "PHP",
          expenseCategory: ev.expense_category || ev.category || "General",
          expenseDate: ev.request_date || ev.expense_date || ev.created_at,
          createdAt: ev.created_at,
          status: ev.status || "pending",
          vendorName: ev.vendor_name || ev.payee_name || "—",
          bookingId: ev.project_number || ev.booking_id || "",
          isBillable: ev.is_billable || false,
        }));
        setExpenses(mapped);
      }
    } catch (error) {
      console.error("Error fetching all expenses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All Expenses" },
    { key: "catalog", label: "Catalog" },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Bar */}
      <div className="flex items-center gap-0 border-b border-[#E5E9F0] px-12 pt-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-5 py-3 text-[13px] font-medium transition-colors"
            style={{
              color: activeTab === tab.key ? "#0F766E" : "#667085",
              fontWeight: activeTab === tab.key ? 600 : 500,
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0F766E] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-12">
        {activeTab === "all" ? (
          <UnifiedExpensesTab
            expenses={expenses}
            isLoading={isLoading}
            onRefresh={fetchAll}
            readOnly={true}
            title="All Expenses"
            subtitle="System-wide view of all expenses across projects and bookings."
          />
        ) : (
          <CatalogManagementPage />
        )}
      </div>
    </div>
  );
}
