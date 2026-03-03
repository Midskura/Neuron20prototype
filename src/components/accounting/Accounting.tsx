import { EVouchersContent } from "./EVouchersContent";
import { CollectionsContentNew } from "./CollectionsContentNew";
import { BillingsContentNew } from "./BillingsContentNew";
import { ExpensesPageNew } from "./ExpensesPageNew";
import { ChartOfAccounts } from "./coa/ChartOfAccounts";
import { FinancialReports } from "./reports/FinancialReports";
import { ProjectsModule } from "../projects/ProjectsModule";
import { ContractsModule } from "../contracts/ContractsModule";
import { AccountingCustomers } from "./AccountingCustomers";
import { TransactionsModule } from "../transactions/TransactionsModule";
import { AuditingModule } from "./AuditingModule";
import { AggregateBillingsPage } from "./AggregateBillingsPage";
import { AggregateExpensesPage } from "./AggregateExpensesPage";
import { AggregateInvoicesPage } from "./AggregateInvoicesPage";
import { AggregateCollectionsPage } from "./AggregateCollectionsPage";
import { FinancialHealthPage } from "./reports/FinancialHealthPage";
import { useAppMode } from "../../config/appMode";

type AccountingView = "evouchers" | "billings" | "invoices" | "collections" | "expenses" | "ledger" | "reports" | "coa" | "projects" | "contracts" | "customers" | "transactions" | "catalog";

export function Accounting({ view }: { view: AccountingView }) {
  const { isEssentials } = useAppMode();

  // Route to appropriate sub-module
  if (view === "transactions") {
    return <TransactionsModule />;
  }

  if (view === "catalog") {
    return <AuditingModule />;
  }

  if (view === "evouchers") {
    return <EVouchersContent />;
  }
  
  if (view === "expenses") {
    // Essentials mode: use aggregate page with Unified component + Catalog tab
    // Full Suite: use original standalone page
    return isEssentials ? <AggregateExpensesPage /> : <ExpensesPageNew />;
  }

  if (view === "collections") {
    return isEssentials ? <AggregateCollectionsPage /> : <CollectionsContentNew />;
  }

  if (view === "billings") {
    return isEssentials ? <AggregateBillingsPage /> : <BillingsContentNew />;
  }

  if (view === "invoices") {
    return <AggregateInvoicesPage />;
  }

  if (view === "coa") {
    return <ChartOfAccounts />;
  }

  if (view === "reports") {
    return isEssentials ? <FinancialHealthPage /> : <FinancialReports />;
  }

  if (view === "projects") {
    return <ProjectsModule departmentOverride="Accounting" />;
  }

  if (view === "contracts") {
    return <ContractsModule departmentOverride="Accounting" />;
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