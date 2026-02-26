import type { Project } from "../../types/pricing";
import type { FinancialData } from "../../hooks/useProjectFinancials";
import { UnifiedCollectionsTab } from "../../components/shared/collections/UnifiedCollectionsTab";

interface ProjectCollectionsTabProps {
  financials: FinancialData;
  project: Project;
  currentUser: any;
}

export function ProjectCollectionsTab({ 
  financials,
  project, 
  currentUser 
}: ProjectCollectionsTabProps) {
  // Simple wrapper around the unified component with consistent padding
  return (
    <div className="flex flex-col bg-white p-12 min-h-[600px]">
      <UnifiedCollectionsTab 
        financials={financials}
        project={project}
        currentUser={currentUser}
        onRefresh={financials.refresh}
      />
    </div>
  );
}
