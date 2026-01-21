import { X, FileText, Calendar, User, Building, CreditCard, DollarSign, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Billing } from "../../types/accounting";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface BillingDetailPanelProps {
  billing: Billing;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdate: () => void;
  onDelete?: () => void;
}

export function BillingDetailPanel({ billing, isOpen, onClose, onPaymentUpdate, onDelete }: BillingDetailPanelProps) {
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "#D1FAE5", color: "#059669" };
      case "partial":
        return { bg: "#FEF3E7", color: "#C88A2B" };
      case "unpaid":
        return { bg: "#FEE2E2", color: "#DC2626" };
      case "overdue":
        return { bg: "#FEE2E2", color: "#991B1B" };
      default:
        return { bg: "#F3F4F6", color: "#6B7280" };
    }
  };

  const isOverdue = () => {
    if (billing.payment_status === "paid") return false;
    const dueDate = new Date(billing.due_date);
    const today = new Date();
    return dueDate < today;
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (amount > billing.amount_due) {
      alert("Payment amount cannot exceed amount due");
      return;
    }

    try {
      setSubmitting(true);

      const newAmountPaid = billing.amount_paid + amount;
      const newStatus = newAmountPaid >= billing.total_amount ? "paid" : "partial";

      // Handle both old (billingId) and new (id) billing formats
      const billingIdentifier = billing.id || (billing as any).billingId;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/accounting/billings/${billingIdentifier}/payment`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount_paid: newAmountPaid,
            payment_status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      console.log('✅ Payment recorded successfully');
      setPaymentAmount("");
      setIsRecordingPayment(false);
      onPaymentUpdate();
    } catch (err) {
      console.error('❌ Error recording payment:', err);
      alert(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // Handle both old (billingId) and new (id) billing formats
    const billingIdentifier = billing.id || (billing as any).billingId;
    
    if (!billingIdentifier) {
      console.error('❌ No billing identifier found. Billing object:', billing);
      alert('Cannot delete: Billing has no ID. This may be a corrupted record. Please contact support.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete invoice ${billing.invoice_number || 'this billing'}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);

      console.log('🗑️ Deleting billing with ID:', billingIdentifier);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/accounting/billings/${billingIdentifier}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Server error response:', result);
        throw new Error(result.error || 'Failed to delete billing');
      }

      console.log('✅ Billing deleted successfully');
      onClose();
      if (onDelete) onDelete();
    } catch (err) {
      console.error('❌ Error deleting billing:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete billing');
    } finally {
      setDeleting(false);
    }
  };

  const statusStyle = getPaymentStatusColor(billing.payment_status);
  const overdueStatus = isOverdue();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease-out"
        }}
      />

      {/* Side Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "600px",
          height: "100vh",
          backgroundColor: "#FFFFFF",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.12)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.3s ease-out"
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: "24px 32px", 
          borderBottom: "1px solid var(--neuron-ui-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B", marginBottom: "4px" }}>
              Invoice Details
            </h2>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              {billing.invoice_number}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "1px solid var(--neuron-ui-border)",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <X size={20} color="#667085" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {/* Status Badges */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
            {billing.evoucher_id && (
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#E8F5F3",
                border: "1px solid #99F6E4",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <FileText size={16} color="#0F766E" />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                  E-Voucher: {billing.evoucher_number}
                </span>
              </div>
            )}
            <div style={{
              padding: "12px 16px",
              backgroundColor: statusStyle.bg,
              borderRadius: "8px",
            }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: statusStyle.color }}>
                Payment: {billing.payment_status}
              </span>
            </div>
            {overdueStatus && (
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#FEE2E2",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <Clock size={16} color="#991B1B" />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#991B1B" }}>
                  Overdue
                </span>
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ 
              display: "block", 
              fontSize: "13px", 
              fontWeight: 500, 
              color: "#667085", 
              marginBottom: "8px" 
            }}>
              Total Amount
            </label>
            <p style={{ fontSize: "36px", fontWeight: 700, color: "#12332B" }}>
              {formatCurrency(billing.total_amount)}
            </p>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {billing.amount_paid > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "#667085" }}>Paid:</span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>
                    {formatCurrency(billing.amount_paid)}
                  </span>
                </div>
              )}
              {billing.amount_due > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "#667085" }}>Amount Due:</span>
                  <span style={{ fontWeight: 600, color: "#DC2626" }}>
                    {formatCurrency(billing.amount_due)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Record Payment Section */}
          {billing.payment_status !== "paid" && (
            <div style={{ 
              marginBottom: "32px",
              padding: "20px",
              backgroundColor: "#F9FAFB",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "12px"
            }}>
              {!isRecordingPayment ? (
                <button
                  onClick={() => setIsRecordingPayment(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "12px 20px",
                    backgroundColor: "#0F766E",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500
                  }}
                >
                  <DollarSign size={18} />
                  Record Payment
                </button>
              ) : (
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#667085", 
                    marginBottom: "8px" 
                  }}>
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${billing.amount_due.toFixed(2)}`}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--neuron-ui-border)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      marginBottom: "12px"
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleRecordPayment}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        backgroundColor: submitting ? "#98A2B3" : "#0F766E",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        cursor: submitting ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: 500
                      }}
                    >
                      {submitting ? "Recording..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => {
                        setIsRecordingPayment(false);
                        setPaymentAmount("");
                      }}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        backgroundColor: "#FFFFFF",
                        color: "#374151",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        cursor: submitting ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: 500
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoice Info */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "16px" }}>
              Invoice Information
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px", 
                  fontWeight: 500, 
                  color: "#667085", 
                  marginBottom: "6px" 
                }}>
                  <FileText size={16} />
                  Description
                </label>
                <p style={{ fontSize: "15px", color: "#12332B" }}>
                  {billing.description}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#667085", 
                    marginBottom: "6px" 
                  }}>
                    <Calendar size={16} />
                    Invoice Date
                  </label>
                  <p style={{ fontSize: "15px", color: "#12332B" }}>
                    {formatDate(billing.invoice_date)}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#667085", 
                    marginBottom: "6px" 
                  }}>
                    <Calendar size={16} />
                    Due Date
                  </label>
                  <p style={{ fontSize: "15px", color: overdueStatus ? "#DC2626" : "#12332B", fontWeight: overdueStatus ? 600 : 400 }}>
                    {formatDate(billing.due_date)}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px", 
                  fontWeight: 500, 
                  color: "#667085", 
                  marginBottom: "6px" 
                }}>
                  <Building size={16} />
                  Customer
                </label>
                <p style={{ fontSize: "15px", color: "#12332B", marginBottom: "4px" }}>
                  {billing.customer_name}
                </p>
                {billing.customer_address && (
                  <p style={{ fontSize: "13px", color: "#667085" }}>
                    {billing.customer_address}
                  </p>
                )}
                {billing.customer_contact && (
                  <p style={{ fontSize: "13px", color: "#667085" }}>
                    {billing.customer_contact}
                  </p>
                )}
              </div>

              {billing.project_number && (
                <div>
                  <label style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#667085", 
                    marginBottom: "6px" 
                  }}>
                    <FileText size={16} />
                    Project
                  </label>
                  <p style={{ fontSize: "15px", color: "#0F766E", fontWeight: 500 }}>
                    {billing.project_number}
                  </p>
                </div>
              )}

              {billing.payment_terms && (
                <div>
                  <label style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#667085", 
                    marginBottom: "6px" 
                  }}>
                    <CreditCard size={16} />
                    Payment Terms
                  </label>
                  <p style={{ fontSize: "15px", color: "#12332B" }}>
                    {billing.payment_terms}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          {billing.line_items && billing.line_items.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "16px" }}>
                Line Items
              </h3>
              <div style={{ 
                border: "1px solid var(--neuron-ui-border)", 
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                {billing.line_items.map((item, index) => (
                  <div 
                    key={item.id || `line-item-${index}`}
                    style={{
                      padding: "16px",
                      borderBottom: index < billing.line_items.length - 1 ? "1px solid var(--neuron-ui-border)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>
                        {item.description}
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#12332B" }}>
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <p style={{ fontSize: "13px", color: "#667085" }}>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                ))}
                
                {/* Totals */}
                <div style={{ padding: "16px", backgroundColor: "#F9FAFB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", color: "#667085" }}>Subtotal:</span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>
                      {formatCurrency(billing.subtotal)}
                    </span>
                  </div>
                  {billing.tax_amount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", color: "#667085" }}>Tax:</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>
                        {formatCurrency(billing.tax_amount)}
                      </span>
                    </div>
                  )}
                  {billing.discount_amount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", color: "#667085" }}>Discount:</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#DC2626" }}>
                        -{formatCurrency(billing.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--neuron-ui-border)"
                  }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#12332B" }}>Total:</span>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#12332B" }}>
                      {formatCurrency(billing.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {billing.notes && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "12px" }}>
                Notes
              </h3>
              <p style={{ 
                fontSize: "14px", 
                color: "#667085", 
                lineHeight: "1.6",
                padding: "12px",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px"
              }}>
                {billing.notes}
              </p>
            </div>
          )}

          {/* Posting Info */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "16px" }}>
              System Information
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#667085" }}>Created By:</span>
                <span style={{ color: "#12332B" }}>{billing.created_by_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#667085" }}>Posted By:</span>
                <span style={{ color: "#12332B" }}>{billing.posted_by_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#667085" }}>Posted At:</span>
                <span style={{ color: "#12332B" }}>{formatDate(billing.posted_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: "20px 32px", 
          borderTop: "1px solid var(--neuron-ui-border)",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px"
        }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              border: "1px solid #DC2626",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              color: "#DC2626",
              fontSize: "14px",
              fontWeight: 500,
              cursor: deleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: deleting ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!deleting) {
                e.currentTarget.style.backgroundColor = "#FEE2E2";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <Trash2 size={18} />
            {deleting ? "Deleting..." : "Delete Invoice"}
          </button>
          
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s"
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

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}