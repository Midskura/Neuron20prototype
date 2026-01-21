import { EVouchersContent } from "./EVouchersContent";
import { CollectionsContentNew } from "./CollectionsContentNew";
import { BillingsContentNew } from "./BillingsContentNew";
import { ExpensesPageNew } from "./ExpensesPageNew";
import type { EVoucher } from "../../types/evoucher";

type AccountingView = "evouchers" | "billings" | "collections" | "expenses" | "ledger" | "reports";

export function Accounting({ view }: { view: AccountingView }) {
  // Route to appropriate sub-module
  if (view === "evouchers") {
    return <EVouchersContent />;
  }
  
  if (view === "expenses") {
    return <ExpensesPageNew />;
  }

  if (view === "collections") {
    return <CollectionsContentNew />;
  }

  if (view === "billings") {
    return <BillingsContentNew />;
  }

  // Ledger and Reports views still under development
  return (
    <div className="h-full flex items-center justify-center" style={{ background: "var(--neuron-bg-page)" }}>
      <div style={{ 
        padding: "48px",
        textAlign: "center",
        color: "var(--neuron-text-secondary)"
      }}>
        <h2 style={{ 
          fontSize: "24px",
          fontWeight: 600,
          color: "var(--neuron-text-primary)",
          marginBottom: "16px"
        }}>
          Accounting Module: {view}
        </h2>
        <p>This module is under development</p>
      </div>
    </div>
  );
}