import { EVouchersContent } from "./EVouchersContent";
import { CollectionsContentNew } from "./CollectionsContentNew";
import { BillingsContentNew } from "./BillingsContentNew";
import { ExpensesPageNew } from "./ExpensesPageNew";
import { ChartOfAccounts } from "./coa/ChartOfAccounts";
import { FinancialReports } from "./reports/FinancialReports";
import { ProjectsModule } from "../projects/ProjectsModule";
import { AccountingCustomers } from "./AccountingCustomers";
import { TransactionsModule } from "../transactions/TransactionsModule";

type AccountingView = "evouchers" | "billings" | "collections" | "expenses" | "ledger" | "reports" | "coa" | "projects" | "customers" | "transactions";

export function Accounting({ view }: { view: AccountingView }) {
  // Route to appropriate sub-module
  if (view === "transactions") {
    return <TransactionsModule />;
  }

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

  if (view === "coa") {
    return <ChartOfAccounts />;
  }

  if (view === "reports") {
    return <FinancialReports />;
  }

  if (view === "projects") {
    return <ProjectsModule departmentOverride="Accounting" />;
  }

  // "ledger" is being deprecated in favor of "customers", but keeping for now or mapping it
  if (view === "customers" || view === "ledger") {
    return <AccountingCustomers />;
  }

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
