// AggregateCollectionsPage — Renders UnifiedCollectionsTab with ALL collections (system-wide)
// Constructs a FinancialData object and minimal Project for the Unified component

import { useState, useEffect, useCallback } from "react";
import { UnifiedCollectionsTab } from "../shared/collections/UnifiedCollectionsTab";
import type { FinancialData } from "../../hooks/useProjectFinancials";
import { calculateFinancialTotals } from "../../utils/financialCalculations";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function AggregateCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [collectionsRes, invoicesRes] = await Promise.all([
        fetch(`${API_URL}/accounting/collections`, {
          headers: { "Authorization": `Bearer ${publicAnonKey}` },
        }),
        fetch(`${API_URL}/accounting/invoices`, {
          headers: { "Authorization": `Bearer ${publicAnonKey}` },
        }),
      ]);

      if (collectionsRes.ok) {
        const data = await collectionsRes.json();
        if (data.success) setCollections(data.data || []);
      }

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        if (data.success) setInvoices(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching aggregate collections data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Construct FinancialData for UnifiedCollectionsTab
  const financials: FinancialData = {
    invoices,
    billingItems: [],
    collections,
    expenses: [],
    isLoading,
    refresh: fetchAll,
    totals: calculateFinancialTotals(invoices, [], [], collections),
  };

  // Minimal dummy project — UnifiedCollectionsTab uses project.customer_name for subtitle.
  // We override subtitle so this is unused.
  const dummyProject: any = {
    id: "",
    customer_name: "All Customers",
  };

  return (
    <div className="flex flex-col h-full bg-white p-12">
      <UnifiedCollectionsTab
        financials={financials}
        project={dummyProject}
        readOnly={true}
        title="All Collections"
        subtitle="System-wide view of all collections across projects and contracts."
      />
    </div>
  );
}
