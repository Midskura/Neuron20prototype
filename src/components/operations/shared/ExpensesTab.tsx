import { useState, useEffect } from "react";
import { Plus, FileText, Receipt, Calendar, DollarSign, Building2 } from "lucide-react";
import type { Expense } from "../../../types/operations";
import { AddRequestForPaymentPanel } from "../../accounting/AddRequestForPaymentPanel";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "../../ui/toast-utils";

interface ExpensesTabProps {
  bookingId: string;
  bookingType?: "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";
  currentUserId?: string;
  currentUserName?: string;
  currentUserDepartment?: string;
  currentUser?: { name: string; email: string; department: string } | null;
  readOnly?: boolean;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "#059669";
    case "Approved":
      return "#0F766E";
    case "Pending":
      return "#C88A2B";
    default:
      return "#6B7280";
  }
};

export function ExpensesTab({ 
  bookingId, 
  bookingType, 
  currentUser, 
  currentUserId, 
  currentUserName, 
  currentUserDepartment, 
  readOnly = false 
}: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [bookingId]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/expenses?bookingId=${bookingId}`, {
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
        console.log('Expenses fetched for booking:', bookingId, result.data);
        setExpenses(result.data || []);
      } else {
        console.error('Error fetching expenses:', result.error);
        toast.error('Error loading expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Unable to load expenses');
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseCreated = () => {
    setShowCreateModal(false);
    fetchExpenses();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetailPanel(true);
  };

  // Map Operations Expense to EVoucher format for the detail panel
  const mapExpenseToEVoucher = (expense: Expense) => {
    return {
      id: expense.expenseId || "",
      voucher_number: expense.expenseId || "EXP-000",
      requestor_id: expense.createdBy || "",
      requestor_name: currentUser?.name || currentUserName || "Unknown",
      requestor_department: currentUserDepartment || "Operations",
      request_date: expense.createdAt || new Date().toISOString(),
      amount: expense.amount || 0,
      currency: expense.currency || "PHP",
      purpose: expense.description || "",
      description: expense.notes,
      project_number: expense.bookingId,
      vendor_name: expense.vendor || "",
      credit_terms: expense.creditTerms,
      due_date: expense.dueDate,
      payment_method: expense.paymentMethod as any,
      status: expense.status as any,
      approvers: [],
      workflow_history: [],
      created_at: expense.createdAt || new Date().toISOString(),
      updated_at: expense.updatedAt || new Date().toISOString(),
      expense_category: expense.category,
      sub_category: expense.subCategory,
      line_items: expense.lineItems || []
    };
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const paidAmount = expenses
    .filter(e => e.status === "Paid")
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <>
      <div style={{ padding: "32px 48px" }}>
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#12332B", marginBottom: "4px" }}>
                Expenses
              </h3>
              <p style={{ fontSize: "13px", color: "#667085" }}>
                Track and manage booking expenses
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  backgroundColor: "#0F766E",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0D6559";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0F766E";
                }}
              >
                <Plus size={16} />
                Add Expense
              </button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              padding: "60px 20px",
              color: "#9CA3AF"
            }}>
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div style={{ 
              display: "flex", 
              flexDirection: "column",
              alignItems: "center", 
              justifyContent: "center",
              padding: "60px 20px",
              color: "#9CA3AF"
            }}>
              <Receipt size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
              <p style={{ fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>No expenses yet</p>
              {!readOnly && (
                <p style={{ fontSize: "14px" }}>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      color: "#0F766E",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontSize: "14px"
                    }}
                  >
                    Add your first expense
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div style={{ 
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "white"
            }}>
              {/* Table Header */}
              <div 
                style={{ 
                  display: "grid",
                  gridTemplateColumns: "40px 2fr 1.5fr 1.2fr 1.2fr 1fr 1fr",
                  gap: "12px",
                  padding: "0 16px",
                  backgroundColor: "transparent",
                  borderBottom: "1px solid #E5E7EB",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* Icon column */}
                </div>
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                  Description
                </div>
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                  Vendor
                </div>
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                  Category
                </div>
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                  Amount
                </div>
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                  Expense Date
                </div>
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                  Status
                </div>
              </div>

              {/* Table Rows */}
              {expenses.map((expense, index) => (
                <div
                  key={expense.expenseId || `expense-${index}`}
                  style={{ 
                    display: "grid",
                    gridTemplateColumns: "40px 2fr 1.5fr 1.2fr 1.2fr 1fr 1fr",
                    gap: "12px",
                    padding: "12px 16px",
                    borderBottom: index < expenses.length - 1 ? "1px solid #F3F4F6" : "none",
                    transition: "background-color 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => handleExpenseClick(expense)}
                >
                  {/* Icon Column */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center"
                  }}>
                    <Receipt size={16} style={{ color: "#667085" }} />
                  </div>

                  {/* Description */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p style={{ 
                      fontSize: "13px", 
                      fontWeight: 500, 
                      color: "#12332B",
                      marginBottom: "2px"
                    }}>
                      {expense.description || "—"}
                    </p>
                    {expense.notes && (
                      <p style={{ 
                        fontSize: "12px", 
                        color: "#9CA3AF"
                      }}>
                        {expense.notes.substring(0, 60)}{expense.notes.length > 60 ? "..." : ""}
                      </p>
                    )}
                  </div>

                  {/* Vendor */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ fontSize: "12px", color: "#667085" }}>
                      {expense.vendor || "—"}
                    </p>
                  </div>

                  {/* Category */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ fontSize: "12px", color: "#667085" }}>
                      {expense.category || "—"}
                    </p>
                  </div>

                  {/* Amount */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ 
                      fontSize: "13px", 
                      fontWeight: 600, 
                      color: "#12332B" 
                    }}>
                      {(() => {
                        const amount = expense.amount ?? 0;
                        const currency = expense.currency || 'PHP';
                        return `${currency} ${amount.toLocaleString('en-PH', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}`;
                      })()}
                    </p>
                  </div>

                  {/* Date */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      {formatDate(expense.expenseDate)}
                    </p>
                  </div>

                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span 
                      style={{ 
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        background: `${getStatusColor(expense.status)}15`,
                        color: getStatusColor(expense.status)
                      }}
                    >
                      {expense.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <AddRequestForPaymentPanel
          context="operations"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleExpenseCreated}
          defaultRequestor={currentUser?.name || currentUserName || "Current User"}
          bookingId={bookingId}
          bookingType={bookingType}
        />
      )}

      {/* Expense Detail Panel - Disabled for now, to be implemented later */}
      {/* 
      {selectedExpense && showDetailPanel && (
        <CreateEVoucherForm
          isOpen={showDetailPanel}
          onClose={() => {
            setShowDetailPanel(false);
            setSelectedExpense(null);
          }}
          context="operations"
          mode="view"
          existingData={mapExpenseToEVoucher(selectedExpense)}
        />
      )}
      */}
    </>
  );
}