import { useState, useEffect } from "react";
import { EVouchersList } from "./accounting/EVouchersList";
import { CollectionsContent } from "./accounting/CollectionsContent";
import { BillingsContent } from "./accounting/BillingsContent";
import type { EVoucher } from "../types/evoucher";

type AccountingView = "evouchers" | "billings" | "collections" | "expenses" | "ledger" | "reports";
type SubView = "list" | "detail";

interface AccountingProps {
  view?: AccountingView;
}

export function Accounting({ view = "evouchers" }: AccountingProps) {
  const [subView, setSubView] = useState<SubView>("list");
  const [selectedVoucher, setSelectedVoucher] = useState<EVoucher | null>(null);

  // Reset to list view when switching between main views
  useEffect(() => {
    setSubView("list");
    setSelectedVoucher(null);
  }, [view]);

  const handleViewVoucher = (voucher: EVoucher) => {
    setSelectedVoucher(voucher);
    setSubView("detail");
  };

  const handleBackFromVoucher = () => {
    setSelectedVoucher(null);
    setSubView("list");
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--neuron-bg-page)" }}>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === "evouchers" && (
          <>
            {subView === "list" && (
              <EVouchersList />
            )}
            {/* Detail view will be added later */}
          </>
        )}

        {view === "billings" && <BillingsContent />}

        {view === "collections" && <CollectionsContent />}

        {view === "expenses" && (
          <div style={{ padding: "32px 48px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B" }}>Expenses</h2>
            <p style={{ fontSize: "14px", color: "#667085", marginTop: "8px" }}>Record and categorize business expenses</p>
          </div>
        )}

        {view === "ledger" && (
          <div style={{ padding: "32px 48px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B" }}>Client Ledger</h2>
            <p style={{ fontSize: "14px", color: "#667085", marginTop: "8px" }}>View client account balances and transactions</p>
          </div>
        )}

        {view === "reports" && (
          <div style={{ padding: "32px 48px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B" }}>Reports</h2>
            <p style={{ fontSize: "14px", color: "#667085", marginTop: "8px" }}>Financial statements and analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}