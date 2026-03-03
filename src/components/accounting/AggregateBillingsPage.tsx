// AggregateBillingsPage — Renders UnifiedBillingsTab with ALL billing items (system-wide)
// Plus a Catalog tab for managing Billing catalog items

import { useState, useEffect, useCallback } from "react";
import { UnifiedBillingsTab } from "../shared/billings/UnifiedBillingsTab";
import type { BillingItem } from "../shared/billings/UnifiedBillingsTab";
import { CatalogManagementPage } from "./CatalogManagementPage";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

type Tab = "all" | "catalog";

export function AggregateBillingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [items, setItems] = useState<BillingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/accounting/billing-items`, {
        headers: { "Authorization": `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItems(data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching all billing items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All Billings" },
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
          <UnifiedBillingsTab
            items={items}
            projectId=""
            onRefresh={fetchAll}
            isLoading={isLoading}
            readOnly={true}
            title="All Billings"
            subtitle="System-wide view of all billing items across projects and bookings."
          />
        ) : (
          <CatalogManagementPage />
        )}
      </div>
    </div>
  );
}