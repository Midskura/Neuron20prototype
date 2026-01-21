import { useState, useEffect } from "react";
import { Receipt, Calendar, User, FileText, Filter, X } from "lucide-react";
import type { Project } from "../../types/pricing";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { AddRequestForPaymentPanel } from "../accounting/AddRequestForPaymentPanel";
import type { Expense as OperationsExpense } from "../../types/operations";
import { CustomDropdown } from "../bd/CustomDropdown";
import { CustomDatePicker } from "../common/CustomDatePicker";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface ProjectExpensesTabProps {
  project: Project;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    department: string;
  } | null;
}

interface Expense {
  id: string;
  booking_id: string;
  booking_type: string;
  expense_name: string;
  expense_category: string;
  amount: number;
  currency: string;
  expense_date: string;
  vendor_name?: string;
  description?: string;
  created_by?: string;
  created_at: string;
}

export function ProjectExpensesTab({ project, currentUser }: ProjectExpensesTabProps) {
  const [expenses, setExpenses] = useState<OperationsExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<OperationsExpense | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const linkedBookings = project.linkedBookings || [];

  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");

  useEffect(() => {
    fetchAllExpenses();
  }, [project.id]);

  const fetchAllExpenses = async () => {
    if (!linkedBookings || linkedBookings.length === 0) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const allExpenses: OperationsExpense[] = [];

      // Fetch expenses from each booking using the unified endpoint
      for (const booking of linkedBookings) {
        try {
          const response = await fetch(
            `${API_URL}/expenses?bookingId=${booking.bookingId}`,
            {
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // Add booking metadata to each expense
              const expensesWithBooking = result.data.map((expense: OperationsExpense) => ({
                ...expense,
                bookingId: booking.bookingId,
                bookingType: booking.serviceType
              }));
              allExpenses.push(...expensesWithBooking);
            }
          }
        } catch (error) {
          console.error(`Error fetching expenses for booking ${booking.bookingId}:`, error);
        }
      }

      // Sort by date (most recent first)
      allExpenses.sort((a, b) => new Date(b.expenseDate || b.createdAt).getTime() - new Date(a.expenseDate || a.createdAt).getTime());
      
      setExpenses(allExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "PHP") => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by booking
  const expensesByBooking = expenses.reduce((acc, expense) => {
    const key = expense.bookingId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(expense);
    return acc;
  }, {} as Record<string, OperationsExpense[]>);

  const handleExpenseClick = (expense: OperationsExpense) => {
    setSelectedExpense(expense);
    setShowDetailPanel(true);
  };

  // Map Operations Expense to EVoucher format for the detail panel
  const mapExpenseToEVoucher = (expense: OperationsExpense) => {
    return {
      id: expense.expenseId || "",
      voucher_number: expense.expenseId || "EXP-000",
      requestor_id: expense.createdBy || "",
      requestor_name: currentUser?.name || "Unknown",
      requestor_department: currentUser?.department || "Pricing",
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

  // Apply filters to expenses
  const filteredExpenses = expenses.filter((expense) => {
    // Date filter
    if (dateFrom) {
      const expenseDate = new Date(expense.expenseDate || expense.createdAt);
      const fromDate = new Date(dateFrom);
      if (expenseDate < fromDate) return false;
    }
    if (dateTo) {
      const expenseDate = new Date(expense.expenseDate || expense.createdAt);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (expenseDate > toDate) return false;
    }

    // Category filter
    if (selectedCategory && expense.expenseCategory !== selectedCategory) {
      return false;
    }

    // Booking filter
    if (selectedBooking && expense.bookingId !== selectedBooking) {
      return false;
    }

    return true;
  });

  // Get unique categories from expenses
  const categories = Array.from(new Set(expenses.map(e => e.expenseCategory).filter(Boolean)));

  // Check if any filters are active
  const hasActiveFilters = dateFrom || dateTo || selectedCategory || selectedBooking;

  // Clear all filters
  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedCategory("");
    setSelectedBooking("");
  };

  // Recalculate totals with filtered expenses
  const filteredTotalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group filtered expenses by booking
  const filteredExpensesByBooking = filteredExpenses.reduce((acc, expense) => {
    const key = expense.bookingId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(expense);
    return acc;
  }, {} as Record<string, OperationsExpense[]>);

  return (
    <div style={{
      flex: 1,
      overflow: "auto",
      backgroundColor: "#FAFBFC"
    }}>
      <div style={{
        padding: "32px 48px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>

        {/* Filters Bar */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          marginBottom: "24px"
        }}>
          {/* Title Section */}
          <div style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderBottom: "1px solid var(--neuron-ui-border)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <Receipt size={18} style={{ color: "var(--neuron-brand-green)" }} />
              <h2 style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--neuron-brand-green)",
                margin: 0
              }}>
                Project Expenses
              </h2>
            </div>
            <p style={{
              fontSize: "13px",
              color: "var(--neuron-ink-muted)",
              margin: 0,
              flex: 1
            }}>
              All expenses from bookings under this project
            </p>
          </div>

          {/* Single Line Filters */}
          <div style={{
            padding: "12px 24px",
            backgroundColor: "#FAFBFC",
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }}>
            {/* Filter Label */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--neuron-ink-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              <Filter size={14} />
              Filters
            </div>

            {/* Date From */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{
                fontSize: "12px",
                color: "var(--neuron-ink-secondary)",
                fontWeight: 500
              }}>
                From:
              </label>
              <CustomDatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="dd/mm/yyyy"
                minWidth="140px"
              />
            </div>

            {/* Date To */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{
                fontSize: "12px",
                color: "var(--neuron-ink-secondary)",
                fontWeight: 500
              }}>
                To:
              </label>
              <CustomDatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder="dd/mm/yyyy"
                minWidth="140px"
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{
                fontSize: "12px",
                color: "var(--neuron-ink-secondary)",
                fontWeight: 500
              }}>
                Category:
              </label>
              <div style={{ minWidth: "150px" }}>
                <CustomDropdown
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={[
                    { value: "", label: "All Categories" },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                  placeholder="All Categories"
                />
              </div>
            </div>

            {/* Booking Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{
                fontSize: "12px",
                color: "var(--neuron-ink-secondary)",
                fontWeight: 500
              }}>
                Booking:
              </label>
              <div style={{ minWidth: "180px" }}>
                <CustomDropdown
                  value={selectedBooking}
                  onChange={setSelectedBooking}
                  options={[
                    { value: "", label: "All Bookings" },
                    ...linkedBookings.map(booking => ({ 
                      value: booking.bookingId, 
                      label: booking.bookingId 
                    }))
                  ]}
                  placeholder="All Bookings"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#EF4444",
                  backgroundColor: "white",
                  border: "1px solid #FEE2E2",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginLeft: "auto"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expenses Log */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "24px"
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 24px",
            backgroundColor: "#F8FBFB",
            borderBottom: "1px solid var(--neuron-ui-border)"
          }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neuron-brand-green)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0
            }}>
              Expense Log ({expenses.length})
            </h3>
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--neuron-ink-muted)"
            }}>
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div style={{
              padding: "48px",
              textAlign: "center"
            }}>
              <Receipt size={48} style={{ 
                color: "#E5E7EB",
                margin: "0 auto 16px"
              }} />
              <p style={{
                fontSize: "14px",
                color: "var(--neuron-ink-muted)",
                margin: 0
              }}>
                No expenses recorded yet
              </p>
              <p style={{
                fontSize: "13px",
                color: "#9CA3AF",
                margin: "8px 0 0 0"
              }}>
                Expenses will appear here when added to bookings
              </p>
            </div>
          ) : (
            <div style={{ overflow: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: "#F9FAFB",
                    borderBottom: "1px solid var(--neuron-ui-border)"
                  }}>
                    <th style={{
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "12px 16px"
                    }}>
                      Date
                    </th>
                    <th style={{
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "12px 16px"
                    }}>
                      Booking
                    </th>
                    <th style={{
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "12px 16px"
                    }}>
                      Expense Name
                    </th>
                    <th style={{
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "12px 16px"
                    }}>
                      Category
                    </th>
                    <th style={{
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "12px 16px"
                    }}>
                      Vendor
                    </th>
                    <th style={{
                      textAlign: "right",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "12px 16px"
                    }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, idx) => (
                    <tr
                      key={expense.expenseId || expense.id}
                      onClick={() => handleExpenseClick(expense)}
                      style={{
                        borderBottom: idx < filteredExpenses.length - 1 ? "1px solid #F3F4F6" : "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#F9FAFB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* Date */}
                      <td style={{
                        padding: "16px",
                        fontSize: "13px",
                        color: "var(--neuron-ink-secondary)"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <Calendar size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                          {formatDate(expense.expenseDate || expense.createdAt)}
                        </div>
                      </td>

                      {/* Booking */}
                      <td style={{
                        padding: "16px",
                        fontSize: "13px"
                      }}>
                        <div style={{
                          fontWeight: 600,
                          color: "var(--neuron-brand-green)",
                          marginBottom: "2px"
                        }}>
                          {expense.bookingId}
                        </div>
                        <div style={{
                          fontSize: "11px",
                          color: "var(--neuron-ink-muted)"
                        }}>
                          {expense.bookingType}
                        </div>
                      </td>

                      {/* Expense Name */}
                      <td style={{
                        padding: "16px",
                        fontSize: "13px",
                        color: "var(--neuron-ink-primary)"
                      }}>
                        <div style={{ fontWeight: 500 }}>
                          {expense.expenseName}
                        </div>
                        {expense.description && (
                          <div style={{
                            fontSize: "12px",
                            color: "var(--neuron-ink-muted)",
                            marginTop: "4px"
                          }}>
                            {expense.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{
                        padding: "16px",
                        fontSize: "13px",
                        color: "var(--neuron-ink-secondary)"
                      }}>
                        {expense.expenseCategory}
                      </td>

                      {/* Vendor */}
                      <td style={{
                        padding: "16px",
                        fontSize: "13px",
                        color: "var(--neuron-ink-secondary)"
                      }}>
                        {expense.vendorName || "—"}
                      </td>

                      {/* Amount */}
                      <td style={{
                        padding: "16px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#C94F3D",
                        textAlign: "right"
                      }}>
                        {formatCurrency(expense.amount, expense.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expenses by Booking */}
        {linkedBookings.length > 0 && (
          <div style={{
            backgroundColor: "white",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px"
          }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neuron-brand-green)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "16px"
            }}>
              Expenses by Booking
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              {linkedBookings.map((booking) => {
                const bookingExpenses = filteredExpensesByBooking[booking.bookingId] || [];
                const bookingTotal = bookingExpenses.reduce((sum, exp) => sum + exp.amount, 0);

                return (
                  <div
                    key={booking.bookingId}
                    style={{
                      padding: "16px",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid var(--neuron-ui-border)",
                      borderRadius: "8px"
                    }}
                  >
                    <div style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--neuron-brand-green)",
                      marginBottom: "4px"
                    }}>
                      {booking.bookingId}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "var(--neuron-ink-muted)",
                      marginBottom: "12px"
                    }}>
                      {booking.serviceType}
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--neuron-ui-border)"
                    }}>
                      <span style={{
                        fontSize: "11px",
                        color: "var(--neuron-ink-muted)"
                      }}>
                        {bookingExpenses.length} {bookingExpenses.length === 1 ? "expense" : "expenses"}
                      </span>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: bookingTotal > 0 ? "#C94F3D" : "var(--neuron-ink-muted)"
                      }}>
                        {formatCurrency(bookingTotal, project.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Expenses Total - At the very bottom */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          padding: "24px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--neuron-ink-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px"
              }}>
                Total Project Expenses
              </div>
              <div style={{
                fontSize: "13px",
                color: "var(--neuron-ink-muted)"
              }}>
                {filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"} across {linkedBookings.length} {linkedBookings.length === 1 ? "booking" : "bookings"}
              </div>
            </div>

            <div style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#C94F3D"
            }}>
              {formatCurrency(filteredTotalExpenses, project.currency)}
            </div>
          </div>
        </div>

      </div>

      {/* Expense Detail Panel */}
      {selectedExpense && showDetailPanel && (
        <AddRequestForPaymentPanel
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
    </div>
  );
}