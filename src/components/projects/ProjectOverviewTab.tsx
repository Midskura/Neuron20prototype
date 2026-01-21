import { Calendar } from "lucide-react";
import type { Project } from "../../types/pricing";
import {
  BrokerageServiceDisplay,
  ForwardingServiceDisplay,
  TruckingServiceDisplay,
  MarineInsuranceServiceDisplay,
  OthersServiceDisplay
} from "../pricing/ServiceDetailsDisplay";

interface ProjectOverviewTabProps {
  project: Project;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    department: string;
  } | null;
  onUpdate?: () => void;
  onViewBooking?: (bookingId: string, serviceType: string) => void;
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const servicesMetadata = project.services_metadata || [];

  // Format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Calculate financial totals from quotation data
  const subtotalTaxable = project.charge_categories?.reduce((total, category) => {
    return total + (category.subtotal || 0);
  }, 0) || 0;

  const financialSummary = {
    subtotal_non_taxed: project.quotation?.financial_summary?.subtotal_non_taxed || 0,
    subtotal_taxable: project.quotation?.financial_summary?.subtotal_taxable || subtotalTaxable,
    tax_rate: project.quotation?.financial_summary?.tax_rate || 0.12,
    tax_amount: project.quotation?.financial_summary?.tax_amount || (subtotalTaxable * 0.12),
    other_charges: project.quotation?.financial_summary?.other_charges || 0,
    grand_total: project.quotation?.financial_summary?.grand_total || project.total || 0
  };

  // Calculate grand total if not provided
  if (!project.quotation?.financial_summary?.grand_total && !project.total) {
    financialSummary.grand_total = financialSummary.subtotal_non_taxed + financialSummary.subtotal_taxable + financialSummary.tax_amount + financialSummary.other_charges;
  }

  return (
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
                {project.customer_name || "—"}
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
                color: project.contact_person_name ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.contact_person_name || "—"}
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
              {project.services && project.services.length > 0 ? (
                project.services.map((service, idx) => (
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

          {/* Project Number, Quotation Reference, BD Owner */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            {/* Project Number */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Project Number
              </label>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--neuron-ink-primary)"
              }}>
                {project.project_number || "—"}
              </div>
            </div>

            {/* Quotation Reference */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Quotation Reference
              </label>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: project.quotation_number ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.quotation_number || "—"}
              </div>
            </div>

            {/* BD Owner */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                BD Owner
              </label>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: project.bd_owner_user_name ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.bd_owner_user_name || "—"}
              </div>
            </div>
          </div>

          {/* Date, Credit Terms, Validity */}
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
                Created Date
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
                {formatDate(project.created_at)}
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
                color: project.quotation?.credit_terms ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.quotation?.credit_terms || "—"}
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
                color: project.quotation?.validity_period ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.quotation?.validity_period || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service-specific Detail Sections */}
      {servicesMetadata.map((service, idx) => {
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
      {project.quotation?.vendors && (
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
                color: project.quotation.vendors.overseas_agents && project.quotation.vendors.overseas_agents.length > 0 ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.quotation.vendors.overseas_agents && project.quotation.vendors.overseas_agents.length > 0
                  ? project.quotation.vendors.overseas_agents.join(", ")
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
                color: project.quotation.vendors.local_agents && project.quotation.vendors.local_agents.length > 0 ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.quotation.vendors.local_agents && project.quotation.vendors.local_agents.length > 0
                  ? project.quotation.vendors.local_agents.join(", ")
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
                color: project.quotation.vendors.subcontractors && project.quotation.vendors.subcontractors.length > 0 ? "var(--neuron-ink-primary)" : "#9CA3AF"
              }}>
                {project.quotation.vendors.subcontractors && project.quotation.vendors.subcontractors.length > 0
                  ? project.quotation.vendors.subcontractors.join(", ")
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charge Categories Section */}
      {project.charge_categories && project.charge_categories.length > 0 && (
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
              }}>{project.currency}</span>
            </div>
          </div>

          <div style={{ padding: "20px 0" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              {project.charge_categories.map((category, catIdx) => (
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
                        backgroundColor: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--neuron-ui-border)"
                      }}>
                        {category.line_items?.length || 0} {category.line_items?.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--neuron-brand-green)"
                    }}>
                      {category.subtotal?.toFixed(2) || "0.00"}
                    </div>
                  </div>

                  {/* Line Items */}
                  {category.line_items && category.line_items.length > 0 && (
                    <div style={{ padding: "16px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--neuron-ui-border)" }}>
                            <th style={{
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--neuron-ink-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              padding: "8px 0"
                            }}>
                              Description
                            </th>
                            <th style={{
                              textAlign: "center",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--neuron-ink-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              padding: "8px 8px",
                              width: "80px"
                            }}>
                              Quantity
                            </th>
                            <th style={{
                              textAlign: "right",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--neuron-ink-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              padding: "8px 0",
                              width: "100px"
                            }}>
                              Unit Price
                            </th>
                            <th style={{
                              textAlign: "right",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--neuron-ink-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              padding: "8px 0",
                              width: "120px"
                            }}>
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.line_items.map((item, itemIdx) => (
                            <tr
                              key={itemIdx}
                              style={{
                                borderBottom: itemIdx < category.line_items!.length - 1 ? "1px solid #F3F4F6" : "none"
                              }}
                            >
                              <td style={{
                                fontSize: "13px",
                                color: "var(--neuron-ink-primary)",
                                padding: "12px 0"
                              }}>
                                {item.description}
                                {item.notes && (
                                  <div style={{
                                    fontSize: "12px",
                                    color: "var(--neuron-ink-muted)",
                                    marginTop: "4px",
                                    fontStyle: "italic"
                                  }}>
                                    {item.notes}
                                  </div>
                                )}
                              </td>
                              <td style={{
                                fontSize: "13px",
                                color: "var(--neuron-ink-secondary)",
                                padding: "12px 8px",
                                textAlign: "center"
                              }}>
                                {item.quantity || "—"}
                              </td>
                              <td style={{
                                fontSize: "13px",
                                color: "var(--neuron-ink-secondary)",
                                padding: "12px 0",
                                textAlign: "right"
                              }}>
                                {item.unit_price?.toFixed(2) || "0.00"}
                              </td>
                              <td style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "var(--neuron-ink-primary)",
                                padding: "12px 0",
                                textAlign: "right"
                              }}>
                                {item.amount?.toFixed(2) || "0.00"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}</div>
          </div>
        </div>
      )}

      {/* Financial Summary Section */}
      {(project.charge_categories && project.charge_categories.length > 0) && (
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
                Grand Total
              </label>
              <div style={{
                padding: "10px 12px",
                backgroundColor: "#E8F4F3",
                border: "2px solid var(--neuron-brand-green)",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--neuron-brand-green)"
              }}>
                {project.currency} {financialSummary.grand_total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
