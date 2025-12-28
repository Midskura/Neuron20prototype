import { ArrowLeft, Edit3, FileText, Calendar, Ticket, CheckCircle, FolderPlus } from "lucide-react";
import { useState } from "react";
import type { QuotationNew } from "../../types/pricing";
import { QuotationActionMenu } from "./QuotationActionMenu";
import { StatusChangeButton } from "./StatusChangeButton";
import { CreateProjectModal } from "../bd/CreateProjectModal";
import { 
  BrokerageServiceDisplay, 
  ForwardingServiceDisplay, 
  TruckingServiceDisplay, 
  MarineInsuranceServiceDisplay, 
  OthersServiceDisplay 
} from "./ServiceDetailsDisplay";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from "../ui/toast-utils";

interface QuotationFileViewProps {
  quotation: QuotationNew;
  onBack: () => void;
  onEdit: () => void;
  userDepartment?: "BD" | "PD";
  onAcceptQuotation?: (quotation: QuotationNew) => void;
  onDelete?: () => void;
  onUpdate: (quotation: QuotationNew) => void;
  onCreateTicket?: (quotation: QuotationNew) => void;
  onConvertToProject?: (projectId: string) => void;
  currentUser?: { id: string; name: string; email: string; department: string } | null;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function QuotationFileView({ quotation, onBack, onEdit, userDepartment, onAcceptQuotation, onDelete, onUpdate, onCreateTicket, onConvertToProject, currentUser }: QuotationFileViewProps) {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Check if pricing information should be visible
  // Visible if: user is PD, OR status indicates quotation has been priced
  const showPricing = userDepartment === "PD" || 
    quotation.status === "Priced" || 
    quotation.status === "Sent to Client" ||
    quotation.status === "Accepted by Client" ||
    quotation.status === "Rejected by Client" ||
    quotation.status === "Needs Revision" ||
    quotation.status === "Disapproved" ||
    quotation.status === "Cancelled" ||
    quotation.status === "Converted to Project";

  // Calculate financial totals
  const subtotalTaxable = quotation.charge_categories?.reduce((total, category) => {
    return total + (category.subtotal || 0);
  }, 0) || 0;

  const financialSummary = {
    subtotal_non_taxed: quotation.financial_summary?.subtotal_non_taxed || 0,
    subtotal_taxable: quotation.financial_summary?.subtotal_taxable || subtotalTaxable,
    tax_rate: quotation.financial_summary?.tax_rate || 0.12,
    tax_amount: quotation.financial_summary?.tax_amount || (subtotalTaxable * (quotation.financial_summary?.tax_rate || 0.12)),
    other_charges: quotation.financial_summary?.other_charges || 0,
    grand_total: quotation.financial_summary?.grand_total || 0
  };

  // Calculate grand total if not provided
  if (!quotation.financial_summary?.grand_total) {
    financialSummary.grand_total = financialSummary.subtotal_non_taxed + financialSummary.subtotal_taxable + financialSummary.tax_amount + financialSummary.other_charges;
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleAcceptQuotation = () => {
    if (onAcceptQuotation) {
      onAcceptQuotation(quotation);
    }
  };

  const handleDuplicate = () => {
    console.log("Duplicating quotation:", quotation.quote_number);
    alert(`📋 Quotation ${quotation.quote_number} has been duplicated!`);
  };

  const handleDelete = () => {
    console.log("Deleting quotation:", quotation.quote_number);
    if (onDelete) {
      onDelete();
    } else {
      onBack();
    }
  };

  const handleStatusChange = (newStatus: string, reason?: string) => {
    const updatedQuotation = { 
      ...quotation, 
      status: newStatus as QuotationNew["status"],
      disapproval_reason: reason,
      cancellation_reason: reason
    };
    onUpdate(updatedQuotation);
    
    // If status changed to "Approved", trigger project creation
    if (newStatus === "Approved") {
      handleAcceptQuotation();
    }
  };

  const handleCreateTicket = () => {
    if (onCreateTicket) {
      onCreateTicket(quotation);
    }
  };

  const handleConvertToProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleProjectCreationSuccess = (projectId: string) => {
    // Update quotation status to "Converted to Project"
    const updatedQuotation = {
      ...quotation,
      status: "Converted to Project" as QuotationNew["status"]
    };
    onUpdate(updatedQuotation);
    
    // Close modal
    setShowCreateProjectModal(false);
    
    // Notify parent component
    if (onConvertToProject) {
      onConvertToProject(projectId);
    }
  };

  // New: Accept quotation and create project in one action
  const handleAcceptAndCreateProject = async () => {
    if (!currentUser) {
      toast.error("User information not available");
      return;
    }

    setIsCreatingProject(true);

    try {
      const response = await fetch(`${API_URL}/quotations/${quotation.id}/accept-and-create-project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bd_owner_user_id: currentUser.id,
          bd_owner_user_name: currentUser.name,
          ops_assigned_user_id: null,
          ops_assigned_user_name: null,
          special_instructions: ""
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create project');
      }

      const { quotation: updatedQuotation, project } = result.data;

      // Update local quotation state
      onUpdate(updatedQuotation);

      // Show success message
      toast.success(`✓ Project ${project.project_number} created successfully!`);

      // Navigate to the created project
      if (onConvertToProject) {
        onConvertToProject(project.id);
      }

    } catch (error) {
      console.error('Error accepting quotation and creating project:', error);
      toast.error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}>
      {/* Header Bar */}
      <div style={{
        padding: "20px 48px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        backgroundColor: "#F8FBFB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: "var(--neuron-ink-secondary)",
              cursor: "pointer",
              fontSize: "13px",
              marginBottom: "12px",
              padding: "0"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--neuron-brand-green)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }}
          >
            <ArrowLeft size={16} />
            Back to Quotations
          </button>
          
          <h1 style={{ 
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            marginBottom: "4px"
          }}>
            {quotation.quotation_name || "Untitled Quotation"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--neuron-ink-muted)", margin: 0 }}>
            {quotation.quote_number}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Edit Pricing - PD Only, Pending Pricing Status */}
          {userDepartment === "PD" && quotation.status === "Pending Pricing" && (
            <button
              onClick={onEdit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "var(--neuron-brand-green)",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0D5F58";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
              }}
            >
              <Edit3 size={16} />
              Add Pricing
            </button>
          )}

          {/* Create Project - BD Only, Accepted by Client Status */}
          {userDepartment === "BD" && quotation.status === "Accepted by Client" && !quotation.project_id && (
            <button
              onClick={handleAcceptAndCreateProject}
              disabled={isCreatingProject}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: isCreatingProject ? "#E0E0E0" : "var(--neuron-brand-green)",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                cursor: isCreatingProject ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: isCreatingProject ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isCreatingProject) {
                  e.currentTarget.style.backgroundColor = "#0D5F58";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCreatingProject) {
                  e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
                }
              }}
            >
              <FolderPlus size={16} />
              {isCreatingProject ? "Creating Project..." : "Create Project"}
            </button>
          )}
          
          <StatusChangeButton
            quotation={quotation}
            onStatusChange={handleStatusChange}
            userDepartment={userDepartment}
          />
          
          {/* Hide Edit button if quotation is locked (converted to project) */}
          {!quotation.project_id && (
            <button
              onClick={onEdit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "white",
                border: "1.5px solid var(--neuron-brand-green)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--neuron-brand-green)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "var(--neuron-brand-green)";
              }}
            >
              <Edit3 size={16} />
              Edit
            </button>
          )}
          
          {/* Show "Locked" indicator if converted to project */}
          {quotation.project_id && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "#FEF3C7",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#92400E"
            }}>
              🔒 Locked (Converted to Project)
            </div>
          )}
          <QuotationActionMenu
            quotation={quotation}
            onEdit={onEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onCreateTicket={onCreateTicket}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        overflow: "auto"
      }}>
        {/* Form Sections (Scrollable) */}
        <div style={{ 
          padding: "32px 48px",
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          
          {/* General Details Section */}
          <div style={{
            backgroundColor: "white",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px"
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--neuron-brand-green)",
              marginBottom: "20px"
            }}>
              General Details
            </h2>

            <div style={{ display: "grid", gap: "20px" }}>
              {/* Customer and Contact Person Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Customer */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Customer *
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {quotation.customer_name || "—"}
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Contact Person
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: quotation.contact_person ? "var(--neuron-ink-primary)" : "#9CA3AF"
                  }}>
                    {quotation.contact_person || "—"}
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  Service/s *
                </label>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  {quotation.services && quotation.services.length > 0 ? (
                    quotation.services.map((service, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#0F766E",
                          border: "1px solid #0F766E",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "white",
                          cursor: "default"
                        }}
                      >
                        {service}
                      </span>
                    ))
                  ) : (
                    <div style={{
                      padding: "10px 14px",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid var(--neuron-ui-border)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: "#9CA3AF",
                      width: "100%"
                    }}>
                      No services selected
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Terms Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                {/* Date */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Date *
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <Calendar size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                    {formatDate(quotation.created_date)}
                  </div>
                </div>

                {/* Credit Terms */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Credit Terms
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: quotation.credit_terms ? "var(--neuron-ink-primary)" : "#9CA3AF"
                  }}>
                    {quotation.credit_terms || "—"}
                  </div>
                </div>

                {/* Validity */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Validity
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: quotation.validity_period ? "var(--neuron-ink-primary)" : "#9CA3AF"
                  }}>
                    {quotation.validity_period || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service-specific Detail Sections */}
          {quotation.services_metadata && quotation.services_metadata.map((service, idx) => {
            const details = service.service_details as any;
            
            if (service.service_type === "Brokerage") {
              return <BrokerageServiceDisplay key={idx} details={details} />;
            }
            
            if (service.service_type === "Forwarding") {
              return <ForwardingServiceDisplay key={idx} details={details} />;
            }
            
            if (service.service_type === "Trucking") {
              return <TruckingServiceDisplay key={idx} details={details} />;
            }
            
            if (service.service_type === "Marine Insurance") {
              return <MarineInsuranceServiceDisplay key={idx} details={details} />;
            }
            
            if (service.service_type === "Others") {
              return <OthersServiceDisplay key={idx} details={details} />;
            }
            
            return null;
          })}

          {/* Vendors Section */}
          {quotation.vendors && (
            <div style={{
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px"
            }}>
              <h2 style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--neuron-brand-green)",
                marginBottom: "20px"
              }}>
                Vendors
              </h2>

              <div style={{ display: "grid", gap: "20px" }}>
                {/* Overseas Agents */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Overseas Agents
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: quotation.vendors.overseas_agents && quotation.vendors.overseas_agents.length > 0 ? "var(--neuron-ink-primary)" : "#9CA3AF"
                  }}>
                    {quotation.vendors.overseas_agents && quotation.vendors.overseas_agents.length > 0
                      ? quotation.vendors.overseas_agents.join(", ")
                      : "—"}
                  </div>
                </div>

                {/* Local Agents */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Local Agents
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: quotation.vendors.local_agents && quotation.vendors.local_agents.length > 0 ? "var(--neuron-ink-primary)" : "#9CA3AF"
                  }}>
                    {quotation.vendors.local_agents && quotation.vendors.local_agents.length > 0
                      ? quotation.vendors.local_agents.join(", ")
                      : "—"}
                  </div>
                </div>

                {/* Subcontractors */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-ink-base)",
                    marginBottom: "8px"
                  }}>
                    Subcontractors
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: quotation.vendors.subcontractors && quotation.vendors.subcontractors.length > 0 ? "var(--neuron-ink-primary)" : "#9CA3AF"
                  }}>
                    {quotation.vendors.subcontractors && quotation.vendors.subcontractors.length > 0
                      ? quotation.vendors.subcontractors.join(", ")
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charge Categories Section - Conditional visibility based on userDepartment and status */}
          {showPricing && quotation.charge_categories && quotation.charge_categories.length > 0 && (
            <div style={{
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--neuron-brand-green)",
                  margin: 0
                }}>
                  Charge Categories
                </h2>
                
                <div style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-muted)"
                }}>
                  Currency: <span style={{ 
                    padding: "4px 12px",
                    backgroundColor: "#E8F4F3",
                    border: "1px solid var(--neuron-brand-green)",
                    borderRadius: "4px",
                    color: "var(--neuron-brand-green)",
                    fontWeight: 600,
                    marginLeft: "8px"
                  }}>{quotation.currency}</span>
                </div>
              </div>

              <div style={{ padding: "20px 0" }}>
                <div style={{ display: "grid", gap: "16px" }}>
                  {quotation.charge_categories.map((category, catIdx) => (
                    <div
                      key={catIdx}
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "6px",
                        overflow: "hidden"
                      }}
                    >
                      {/* Category Header */}
                      <div style={{
                        padding: "12px 16px",
                        backgroundColor: "#F9FAFB",
                        borderBottom: "1px solid var(--neuron-ui-border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                          <span style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--neuron-ink-primary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px"
                          }}>
                            {category.name}
                          </span>

                          <span style={{
                            fontSize: "11px",
                            color: "var(--neuron-ink-muted)",
                            marginLeft: "8px"
                          }}>
                            ({category.line_items?.length || 0} {(category.line_items?.length || 0) === 1 ? 'item' : 'items'})
                          </span>
                        </div>

                        <span style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--neuron-brand-green)"
                        }}>
                          {quotation.currency} {(category.subtotal || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Line Items */}
                      {category.line_items && category.line_items.length > 0 && (
                        <div>
                          {/* Table Header */}
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 0.8fr 0.8fr 1fr 0.6fr 1.2fr 1.2fr",
                            gap: "12px",
                            padding: "8px 12px",
                            backgroundColor: "#F9FAFB",
                            borderBottom: "1px solid var(--neuron-ui-border)",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--neuron-ink-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px"
                          }}>
                            <div>Description</div>
                            <div>Vendor</div>
                            <div>Qty</div>
                            <div>Unit</div>
                            <div>Cost Type</div>
                            <div>Buy</div>
                            <div>Sell</div>
                            <div>Total</div>
                          </div>

                          {/* Line Item Rows */}
                          {category.line_items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 0.8fr 0.8fr 1fr 0.6fr 1.2fr 1.2fr",
                                gap: "12px",
                                padding: "10px 12px",
                                borderBottom: itemIdx < category.line_items.length - 1 ? "1px solid var(--neuron-ui-border)" : "none",
                                fontSize: "13px",
                                alignItems: "center"
                              }}
                            >
                              <div style={{ color: "var(--neuron-ink-primary)" }}>{item.description}</div>
                              <div style={{ color: "var(--neuron-ink-secondary)", fontSize: "12px" }}>{item.vendor || "—"}</div>
                              <div style={{ color: "var(--neuron-ink-primary)" }}>{item.quantity}</div>
                              <div style={{ color: "var(--neuron-ink-secondary)", fontSize: "12px" }}>{item.unit}</div>
                              <div>
                                <span style={{
                                  padding: "2px 8px",
                                  backgroundColor: item.cost_type === "Billable" ? "#E8F4F3" : "#FEF3F2",
                                  border: `1px solid ${item.cost_type === "Billable" ? "var(--neuron-brand-green)" : "#FCA5A5"}`,
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: item.cost_type === "Billable" ? "var(--neuron-brand-green)" : "#DC2626"
                                }}>
                                  {item.cost_type}
                                </span>
                              </div>
                              <div style={{ color: "var(--neuron-ink-secondary)", fontSize: "12px" }}>{item.buy_price?.toFixed(2) || "—"}</div>
                              <div style={{ color: "var(--neuron-ink-primary)", fontWeight: 500 }}>{item.sell_price?.toFixed(2) || "—"}</div>
                              <div style={{ color: "var(--neuron-brand-green)", fontWeight: 600 }}>{item.total?.toFixed(2) || "0.00"}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Financial Summary Section - Conditional visibility */}
          {showPricing && quotation.financial_summary && (
            <div style={{
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px"
            }}>
              <h2 style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--neuron-brand-green)",
                marginBottom: "20px"
              }}>
                Financial Summary
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {/* Subtotal Non-Taxed */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--neuron-ink-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px"
                  }}>
                    Subtotal (Non-Taxed)
                  </label>
                  <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {financialSummary.subtotal_non_taxed.toFixed(2)}
                  </div>
                </div>

                {/* Subtotal Taxable */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--neuron-ink-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px"
                  }}>
                    Subtotal (Taxable)
                  </label>
                  <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {financialSummary.subtotal_taxable.toFixed(2)}
                  </div>
                </div>

                {/* Tax Rate */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--neuron-ink-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px"
                  }}>
                    Tax Rate
                  </label>
                  <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {(financialSummary.tax_rate * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Tax Amount */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--neuron-ink-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px"
                  }}>
                    Tax Amount
                  </label>
                  <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {financialSummary.tax_amount.toFixed(2)}
                  </div>
                </div>

                {/* Other Charges */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--neuron-ink-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px"
                  }}>
                    Other Charges
                  </label>
                  <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {financialSummary.other_charges.toFixed(2)}
                  </div>
                </div>

                {/* Grand Total */}
                <div style={{
                  backgroundColor: "#E8F4F3",
                  border: "2px solid var(--neuron-brand-green)",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  gridColumn: "1 / -1"
                }}>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--neuron-brand-green)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px"
                  }}>
                    Grand Total
                  </div>
                  <div style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "var(--neuron-brand-green)"
                  }}>
                    {quotation.currency} {financialSummary.grand_total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Section */}
          {quotation.terms_and_conditions && (
            <div style={{
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px"
            }}>
              <h2 style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--neuron-brand-green)",
                marginBottom: "20px"
              }}>
                Terms & Conditions
              </h2>
              <div style={{
                padding: "16px",
                backgroundColor: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--neuron-ink-primary)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}>
                {quotation.terms_and_conditions}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <CreateProjectModal
          quotation={quotation}
          onClose={() => setShowCreateProjectModal(false)}
          onSuccess={handleProjectCreationSuccess}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}