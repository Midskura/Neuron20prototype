import type { FinancialData } from "../../../hooks/useProjectFinancials";
import type { Project } from "../../../types/pricing";
import { UnifiedBillingsTab } from "../../shared/billings/UnifiedBillingsTab";

interface ProjectBillingsProps {
  financials: FinancialData;
  project: Project;
}

export function ProjectBillings({ financials, project }: ProjectBillingsProps) {
  const { billingItems, refresh, isLoading } = financials;

  return (
    <div className="flex flex-col bg-white p-12 min-h-[600px]">
      <UnifiedBillingsTab
          items={billingItems}
          quotation={project.quotation} // Pass the quotation for reflective billing
          projectId={project.id}
          bookingId={undefined} // Project level view
          onRefresh={refresh}
          isLoading={isLoading}
      />
    </div>
  );
}
