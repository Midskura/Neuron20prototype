import { useState, useEffect } from "react";
import { QuotationsList } from "./QuotationsList";
import { QuotationDetail } from "./QuotationDetail";
import { QuotationBuilderV3 } from "./quotations/QuotationBuilderV3";
import type { QuotationNew, Project } from "../../types/pricing";
import type { Customer } from "../../types/bd";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from "../ui/toast-utils";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface QuotationsProps {
  department?: "BD" | "Pricing";
  customerData?: Customer | null;
  inquiryId?: string | null;
  onProjectCreated?: () => void;
}

type SubView = "list" | "detail" | "builder";

export function Quotations({ department = "Pricing", customerData, inquiryId, onProjectCreated }: QuotationsProps) {
  const [subView, setSubView] = useState<SubView>(customerData ? "builder" : "list");
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationNew | null>(null);
  const [quotations, setQuotations] = useState<QuotationNew[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch quotations from backend
  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/quotations`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setQuotations(result.data);
        console.log(`Fetched ${result.data.length} quotations`);
      } else {
        console.error('Error fetching quotations:', result.error);
        toast.error('Error loading quotations: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Unable to load quotations. Please try again.');
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
      } else {
        console.error('Error fetching projects:', result.error);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchQuotations();
    fetchProjects();
  }, []);

  // Handle inquiryId prop - when set, show the detail view for that inquiry
  useEffect(() => {
    if (inquiryId && quotations.length > 0) {
      const inquiry = quotations.find(q => q.id === inquiryId);
      if (inquiry) {
        setSelectedQuotation(inquiry);
        setSubView("detail");
      }
    }
  }, [inquiryId, quotations]);

  const handleViewQuotation = (quotation: QuotationNew) => {
    setSelectedQuotation(quotation);
    setSubView("detail");
  };

  const handleCreateQuotation = () => {
    setSubView("builder");
  };

  const handleBackFromDetail = () => {
    setSelectedQuotation(null);
    setSubView("list");
  };

  const handleBackFromBuilder = () => {
    setSubView("list");
  };

  const handleEditQuotation = () => {
    // Switch to edit mode (builder) with the selected quotation
    setSubView("builder");
  };

  const handleSaveQuotation = (data: QuotationNew) => {
    console.log("Quotation saved:", data);
    setSubView("list");
    // TODO: Save to backend
  };

  const handleAcceptQuotation = (quotation: QuotationNew) => {
    // Create a new project from the accepted quotation
    const projectNumber = `PROJ-2025-${String(projects.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    
    // Calculate due date (48 hours from now for handover SLA)
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 48);
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      project_number: projectNumber,
      quotation_id: quotation.id,
      quotation_number: quotation.quote_number,
      customer_id: quotation.customer_id,
      customer_name: quotation.customer_company || quotation.customer_name,
      contact_person: quotation.customer_name,
      contact_email: "", // TODO: Get from customer data
      services: quotation.services || [],
      origin: quotation.pol_aol || "TBA",
      destination: quotation.pod_aod || "TBA",
      cargo_description: quotation.commodity || "General Cargo",
      estimated_weight: quotation.gross_weight ? `${quotation.gross_weight} kg` : quotation.volume,
      estimated_volume: quotation.volume,
      currency: quotation.currency,
      total: quotation.financial_summary.grand_total,
      status: "Pending Handover",
      handover_checklist: {
        documents_prepared: false,
        customer_notified: false,
        operations_briefed: false,
        vendors_confirmed: false
      },
      quotation_approved_at: now,
      handover_due_date: dueDate.toISOString(),
      created_by: "pu1", // TODO: Get current user
      created_at: now,
      updated_at: now
    };

    // TODO: Add project to backend
    setProjects([...projects, newProject]);
    
    // Update quotation status to "Accepted"
    quotation.status = "Accepted";
    
    console.log("Project created:", newProject);
    toast.success(`✅ Quotation accepted! Project ${projectNumber} has been created.`);
    
    // Callback to notify parent component
    if (onProjectCreated) {
      onProjectCreated();
    }
    
    // Go back to list
    handleBackFromDetail();
  };

  const handleUpdateQuotation = (updatedQuotation: QuotationNew) => {
    // Update the selected quotation in state
    setSelectedQuotation(updatedQuotation);
    
    // TODO: Update in backend
    console.log("Quotation updated:", updatedQuotation);
  };

  return (
    <>
      {subView === "list" && (
        <QuotationsList 
          onViewQuotation={handleViewQuotation}
          onCreateQuotation={handleCreateQuotation}
          department={department}
          quotations={quotations}
          isLoading={isLoading}
        />
      )}
      {subView === "detail" && selectedQuotation && (
        <QuotationDetail 
          quotation={selectedQuotation} 
          onBack={handleBackFromDetail}
          userDepartment={department === "BD" ? "BD" : "PD"}
          onEdit={handleEditQuotation}
          onAcceptQuotation={handleAcceptQuotation}
          onUpdate={handleUpdateQuotation}
        />
      )}
      {subView === "builder" && (
        <QuotationBuilderV3 
          onClose={handleBackFromBuilder}
          onSave={handleSaveQuotation}
          initialData={selectedQuotation || (department === "BD" ? { status: "Inquiry" } : undefined)}
          customerData={customerData}
        />
      )}
    </>
  );
}