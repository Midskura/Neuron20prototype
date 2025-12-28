import { ArrowLeft } from "lucide-react";
import type { QuotationNew } from "../../types/pricing";
import { QuotationFileView } from "./QuotationFileView";

interface QuotationDetailProps {
  quotation: QuotationNew;
  onBack: () => void;
  onEdit: () => void;
  userDepartment?: "BD" | "PD";
  onAcceptQuotation?: (quotation: QuotationNew) => void;
  onUpdate?: (quotation: QuotationNew) => void;
  onDelete?: () => void;
  onCreateTicket?: (quotation: QuotationNew) => void;
  onConvertToProject?: (projectId: string) => void;
  currentUser?: { id: string; name: string; email: string; department: string } | null;
}

export function QuotationDetail({ quotation, onBack, onEdit, userDepartment, onAcceptQuotation, onUpdate, onDelete, onCreateTicket, onConvertToProject, currentUser }: QuotationDetailProps) {
  const handleUpdate = (updatedQuotation: QuotationNew) => {
    if (onUpdate) {
      onUpdate(updatedQuotation);
    }
  };

  return (
    <QuotationFileView 
      quotation={quotation} 
      onBack={onBack} 
      onEdit={onEdit} 
      userDepartment={userDepartment} 
      onAcceptQuotation={onAcceptQuotation}
      onUpdate={handleUpdate}
      onDelete={onDelete}
      onCreateTicket={onCreateTicket}
      onConvertToProject={onConvertToProject}
      currentUser={currentUser}
    />
  );
}