import { X, FileText, Calendar, User, Building, CreditCard, DollarSign, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Expense } from "../../types/accounting";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface ExpenseDetailPanelProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export function ExpenseDetailPanel({ expense, isOpen, onClose, onDelete }: ExpenseDetailPanelProps) {
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this expense (${expense.description})? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/accounting/expenses/${expense.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      console.log('✅ Expense deleted successfully');
      onClose();
      if (onDelete) onDelete();
    } catch (err) {
      console.error('❌ Error deleting expense:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

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
              Expense Details
            </h2>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              {expense.evoucher_number}
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
          {/* E-Voucher Badge */}
          {expense.evoucher_id && (
            <div style={{
              padding: "16px 20px",
              backgroundColor: "#E8F5F3",
              border: "1px solid #99F6E4",
              borderRadius: "12px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "#0F766E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF"
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <p style={{ fontSize: "13px", color: "#667085", marginBottom: "2px" }}>
                    Created from E-Voucher
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#12332B" }}>
                    {expense.evoucher_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Section */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ 
              display: "block", 
              fontSize: "13px", 
              fontWeight: 500, 
              color: "#667085", 
              marginBottom: "8px" 
            }}>
              Amount
            </label>
            <p style={{ fontSize: "36px", fontWeight: 700, color: "#12332B" }}>
              {formatCurrency(expense.amount)}
            </p>
            <p style={{ fontSize: "14px", color: "#667085", marginTop: "4px" }}>
              {expense.currency}
            </p>
          </div>

          {/* Basic Info */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "16px" }}>
              Basic Information
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
                  {expense.description}
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
                  Date
                </label>
                <p style={{ fontSize: "15px", color: "#12332B" }}>
                  {formatDate(expense.date)}
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
                  <Building size={16} />
                  Vendor
                </label>
                <p style={{ fontSize: "15px", color: "#12332B" }}>
                  {expense.vendor}
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
                  <CreditCard size={16} />
                  Category
                </label>
                <p style={{ fontSize: "15px", color: "#12332B" }}>
                  {expense.category}
                  {expense.sub_category && (
                    <span style={{ color: "#667085" }}> → {expense.sub_category}</span>
                  )}
                </p>
              </div>

              {expense.project_number && (
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
                    {expense.project_number}
                  </p>
                  {expense.customer_name && (
                    <p style={{ fontSize: "13px", color: "#667085", marginTop: "2px" }}>
                      {expense.customer_name}
                    </p>
                  )}
                </div>
              )}

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
                  <User size={16} />
                  Requestor
                </label>
                <p style={{ fontSize: "15px", color: "#12332B" }}>
                  {expense.requestor_name}
                </p>
              </div>
            </div>
          </div>

          {/* Posting Info */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "16px" }}>
              Posting Information
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ 
                  display: "block",
                  fontSize: "13px", 
                  fontWeight: 500, 
                  color: "#667085", 
                  marginBottom: "6px" 
                }}>
                  Posted By
                </label>
                <p style={{ fontSize: "15px", color: "#12332B" }}>
                  {expense.posted_by_name}
                </p>
              </div>

              <div>
                <label style={{ 
                  display: "block",
                  fontSize: "13px", 
                  fontWeight: 500, 
                  color: "#667085", 
                  marginBottom: "6px" 
                }}>
                  Posted At
                </label>
                <p style={{ fontSize: "15px", color: "#12332B" }}>
                  {formatDate(expense.posted_at)}
                </p>
              </div>

              <div>
                <label style={{ 
                  display: "block",
                  fontSize: "13px", 
                  fontWeight: 500, 
                  color: "#667085", 
                  marginBottom: "6px" 
                }}>
                  Status
                </label>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: "#E8F5F3",
                    color: "#0F766E",
                  }}
                >
                  {expense.status}
                </span>
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
            {deleting ? "Deleting..." : "Delete Expense"}
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