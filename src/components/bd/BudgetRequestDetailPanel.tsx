import { X, Printer, Download, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import logoImage from "figma:asset/28c84ed117b026fbf800de0882eb478561f37f4f.png";
import { PhilippinePeso } from "../icons/PhilippinePeso";
import type { EVoucher } from "../../types/evoucher";

interface BudgetRequestDetailPanelProps {
  request: EVoucher | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetRequestDetailPanel({ request, isOpen, onClose }: BudgetRequestDetailPanelProps) {
  if (!isOpen || !request) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return { bg: "#E8F5F3", color: "#0F766E", icon: CheckCircle2 };
      case "Rejected":
        return { bg: "#FFE5E5", color: "#C94F3D", icon: XCircle };
      case "Under Review":
        return { bg: "#FEF3E7", color: "#C88A2B", icon: AlertCircle };
      case "Submitted":
        return { bg: "#E0E7FF", color: "#4F46E5", icon: Clock };
      case "Draft":
        return { bg: "#F3F4F6", color: "#6B7280", icon: Clock };
      default:
        return { bg: "#F3F4F6", color: "#6B7A76", icon: Clock };
    }
  };

  const statusStyle = getStatusColor(request.status);
  const StatusIcon = statusStyle.icon;

  // Get approved by information
  const approvedBy = request.approvers && request.approvers.length > 0 
    ? request.approvers[request.approvers.length - 1]
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black z-40"
        onClick={onClose}
        style={{ 
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(18, 51, 43, 0.15)"
        }}
      />

      {/* Slide-out Panel */}
      <div
        className="fixed right-0 top-0 h-full w-[920px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in"
        style={{
          borderLeft: "1px solid var(--neuron-ui-border)",
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: "24px 48px",
            borderBottom: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#12332B", marginBottom: "4px" }}>
                {request.description}
              </h2>
              <p style={{ fontSize: "13px", color: "#667085" }}>
                {request.voucher_number} • {request.purpose}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "transparent",
                color: "#667085",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px" }}>
          {/* Header Section with Logo */}
          <div style={{ 
            display: "flex", 
            alignItems: "flex-start", 
            justifyContent: "space-between",
            marginBottom: "32px",
            paddingBottom: "24px",
            borderBottom: "1px solid #E5E7EB"
          }}>
            <div>
              <img 
                src={logoImage} 
                alt="Neuron" 
                style={{ height: "32px", marginBottom: "12px" }}
              />
            </div>
            
            <div style={{ textAlign: "right" }}>
              <h1 style={{ 
                fontSize: "20px", 
                fontWeight: 700, 
                color: "#12332B",
                letterSpacing: "0.5px",
                marginBottom: "16px"
              }}>
                REQUEST FOR PAYMENT
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <span style={{ 
                    fontSize: "11px", 
                    fontWeight: 500, 
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: "4px"
                  }}>
                    DATE
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "#12332B" }}>
                    {new Date(request.request_date).toLocaleDateString('en-US', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div>
                  <span style={{ 
                    fontSize: "11px", 
                    fontWeight: 500, 
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: "4px"
                  }}>
                    E-VOUCHER REF NO.
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#0F766E" }}>
                    {request.voucher_number}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Request Name / Title */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "block", 
              fontSize: "13px", 
              fontWeight: 500, 
              color: "#374151",
              marginBottom: "8px"
            }}>
              Request Name / Title
            </label>
            <div style={{
              padding: "10px 14px",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              backgroundColor: "#F9FAFB",
              fontSize: "14px",
              color: "#6B7280",
            }}>
              {request.description}
            </div>
          </div>

          {/* Expense Category and Sub-Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Expense Category <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
              }}>
                {request.expense_category}
              </div>
            </div>
            <div>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Sub-Category <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
              }}>
                {request.sub_category}
              </div>
            </div>
          </div>

          {/* Project/Booking Number */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ 
              display: "block", 
              fontSize: "13px", 
              fontWeight: 500, 
              color: "#374151",
              marginBottom: "8px"
            }}>
              Project / Booking Number <span style={{ fontSize: "12px", color: "#9CA3AF" }}>(Optional)</span>
            </label>
            <div style={{
              padding: "10px 14px",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              backgroundColor: "#F9FAFB",
              fontSize: "14px",
              color: "#6B7280",
            }}>
              {request.project_number || "—"}
            </div>
          </div>

          {/* EXPENSE DETAILS */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ 
              fontSize: "13px", 
              fontWeight: 600, 
              color: "#12332B",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "16px"
            }}>
              EXPENSE DETAILS
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "2fr 3fr 1.5fr",
                gap: "12px",
                marginBottom: "8px"
              }}>
                <div style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  PARTICULAR
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  DESCRIPTION
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "right"
                }}>
                  AMOUNT (₱)
                </div>
              </div>

              {request.line_items && request.line_items.map((item, index) => (
                <div 
                  key={item.id || index}
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "2fr 3fr 1.5fr",
                    gap: "12px",
                    marginBottom: "12px"
                  }}
                >
                  <div style={{
                    padding: "10px 14px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    backgroundColor: "#F9FAFB",
                    fontSize: "14px",
                    color: "#6B7280",
                  }}>
                    {item.particular}
                  </div>
                  <div style={{
                    padding: "10px 14px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    backgroundColor: "#F9FAFB",
                    fontSize: "14px",
                    color: "#6B7280",
                  }}>
                    {item.description || "—"}
                  </div>
                  <div style={{
                    padding: "10px 14px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    backgroundColor: "#F9FAFB",
                    fontSize: "14px",
                    color: "#6B7280",
                    textAlign: "right"
                  }}>
                    {item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: "16px",
              borderTop: "2px solid #E5E7EB"
            }}>
              <div style={{ 
                fontSize: "14px", 
                fontWeight: 500, 
                color: "#6B7280",
                marginRight: "40px"
              }}>
                Total Amount
              </div>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: 600, 
                color: "#12332B",
                display: "flex",
                alignItems: "center"
              }}>
                <PhilippinePeso size={18} style={{ marginRight: "4px" }} />
                {request.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ 
              fontSize: "13px", 
              fontWeight: 600, 
              color: "#12332B",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "20px"
            }}>
              PAYMENT DETAILS
            </h3>

            {/* Preferred Payment Method */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Preferred Payment Method <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
              }}>
                {request.payment_method || "—"}
              </div>
            </div>

            {/* Credit Terms */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Credit Terms
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
              }}>
                {request.credit_terms || "—"}
              </div>
            </div>

            {/* Payment Schedule */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Payment Schedule <span style={{ fontSize: "12px", color: "#9CA3AF" }}>(Optional)</span>
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
              }}>
                {request.payment_schedule || "—"}
              </div>
            </div>

            {/* Vendor/Payee */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Vendor / Payee
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
              }}>
                {request.vendor_name || "—"}
              </div>
            </div>

            {/* Requestor */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Requestor
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
              }}>
                {request.requestor_name}
              </div>
            </div>

            {/* Notes/Remarks */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: 500, 
                color: "#374151",
                marginBottom: "8px"
              }}>
                Notes / Remarks <span style={{ fontSize: "12px", color: "#9CA3AF" }}>(Optional)</span>
              </label>
              <div style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                backgroundColor: "#F9FAFB",
                fontSize: "14px",
                color: "#6B7280",
                minHeight: "80px",
                whiteSpace: "pre-wrap"
              }}>
                {request.notes || "—"}
              </div>
            </div>
          </div>

          {/* CURRENT STATUS */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ 
              fontSize: "13px", 
              fontWeight: 600, 
              color: "#12332B",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "20px"
            }}>
              CURRENT STATUS
            </h3>
            
            <div style={{ 
              border: "1px solid #E5E7EB", 
              borderRadius: "8px",
              backgroundColor: "#FAFAFA",
              padding: "20px"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px",
                marginBottom: "12px"
              }}>
                <StatusIcon size={20} style={{ color: statusStyle.color }} />
                <span style={{ 
                  fontSize: "16px", 
                  fontWeight: 600, 
                  color: statusStyle.color 
                }}>
                  {request.status}
                </span>
              </div>
              
              {request.status === "Approved" && approvedBy && (
                <div style={{ fontSize: "14px", color: "#667085", lineHeight: "1.6" }}>
                  Approved by <span style={{ fontWeight: 500, color: "#12332B" }}>{approvedBy.name}</span>
                  {approvedBy.approved_at && (
                    <span> on {new Date(approvedBy.approved_at).toLocaleDateString('en-PH', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  )}
                </div>
              )}
              
              {request.status === "Under Review" && request.current_approver_name && (
                <div style={{ fontSize: "14px", color: "#667085", lineHeight: "1.6" }}>
                  Currently with <span style={{ fontWeight: 500, color: "#12332B" }}>{request.current_approver_name}</span> for review
                </div>
              )}
              
              {request.status === "Submitted" && (
                <div style={{ fontSize: "14px", color: "#667085", lineHeight: "1.6" }}>
                  Waiting for review
                </div>
              )}
              
              {request.status === "Rejected" && (
                <div style={{ fontSize: "14px", color: "#667085", lineHeight: "1.6" }}>
                  This request has been rejected
                </div>
              )}
              
              {request.status === "Draft" && (
                <div style={{ fontSize: "14px", color: "#667085", lineHeight: "1.6" }}>
                  This request has not been submitted yet
                </div>
              )}
            </div>
          </div>

          {/* WORKFLOW HISTORY */}
          {request.workflow_history && request.workflow_history.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "13px", 
                fontWeight: 600, 
                color: "#12332B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "20px"
              }}>
                ACTION LOG
              </h3>
              
              <div style={{ 
                border: "1px solid #E5E7EB", 
                borderRadius: "8px",
                backgroundColor: "#FAFAFA",
                padding: "20px"
              }}>
                <div style={{ position: "relative", paddingLeft: "24px" }}>
                  {/* Timeline line */}
                  <div
                    style={{
                      position: "absolute",
                      left: "7px",
                      top: "8px",
                      bottom: "8px",
                      width: "2px",
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                  
                  {request.workflow_history.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        position: "relative",
                        paddingBottom: index < request.workflow_history!.length - 1 ? "20px" : "0",
                      }}
                    >
                      {/* Timeline dot */}
                      <div
                        style={{
                          position: "absolute",
                          left: "-20px",
                          top: "6px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: index === 0 ? "#0F766E" : "#E5E7EB",
                          border: "2px solid #FFFFFF",
                        }}
                      />
                      
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#12332B" }}>
                            {item.status}
                          </span>
                          <span style={{ fontSize: "12px", color: "#667085" }}>
                            •
                          </span>
                          <span style={{ fontSize: "12px", color: "#667085" }}>
                            {new Date(item.timestamp).toLocaleDateString('en-PH', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p style={{ fontSize: "13px", color: "#667085", margin: "0 0 4px 0" }}>
                          {item.action}
                        </p>
                        <p style={{ fontSize: "12px", color: "#98A2B3", margin: 0 }}>
                          {item.user_name} ({item.user_role})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "20px 48px",
            borderTop: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px"
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              backgroundColor: "#FFFFFF",
              color: "#374151",
              border: "1px solid #D1D5DB",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}