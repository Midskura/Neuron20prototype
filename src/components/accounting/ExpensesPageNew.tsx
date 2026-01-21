import { useState, useEffect, useMemo } from "react";
import { Plus, Search, FileText, Wallet, Calendar, User, Package, CreditCard, Truck, Home, Briefcase, Coffee } from "lucide-react";
import type { Expense } from "../../types/accounting";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { ExpenseDetailPanel } from "./ExpenseDetailPanel";
import { AddRequestForPaymentPanel } from "./AddRequestForPaymentPanel";
import { CustomDropdown } from "../bd/CustomDropdown";

export function ExpensesPageNew() {
  // State for data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  
  // Get current user
  const userData = localStorage.getItem("neuron_user");
  const currentUser = userData ? JSON.parse(userData) : null;

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
  }, [dateRange]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (dateRange.from) params.append("date_from", dateRange.from);
      if (dateRange.to) params.append("date_to", dateRange.to);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/accounting/expenses?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Fetched expenses:', data);
      setExpenses(data.data || []);
    } catch (err) {
      console.error('❌ Error fetching expenses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load expenses';
      setError(errorMessage);
      
      // If it's a network error, show a more helpful message
      if (errorMessage.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logic
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description?.toLowerCase().includes(query) ||
        expense.vendor?.toLowerCase().includes(query) ||
        expense.evoucher_number?.toLowerCase().includes(query) ||
        expense.project_number?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Sort by date descending
    filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return filtered;
  }, [expenses, searchQuery, categoryFilter]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { className: "w-4 h-4", style: { color: "var(--neuron-ink-muted)" } };
    
    switch (category?.toLowerCase()) {
      case "forwarding":
      case "shipping":
        return <Package {...iconProps} />;
      case "trucking":
      case "transportation":
        return <Truck {...iconProps} />;
      case "office":
      case "supplies":
        return <Briefcase {...iconProps} />;
      case "rent":
      case "utilities":
        return <Home {...iconProps} />;
      case "meals":
      case "entertainment":
        return <Coffee {...iconProps} />;
      default:
        return <Wallet {...iconProps} />;
    }
  };

  const getCategoryColor = (category: string) => {
    // All expenses get expense/payment styling
    return "bg-[#FEF3E7] text-[#C88A2B]";
  };

  return (
    <div 
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF"
      }}
    >
      {/* Header */}
      <div style={{ padding: "32px 48px", borderBottom: "1px solid var(--neuron-ui-border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 600,
                color: "#12332B",
                marginBottom: "4px",
                letterSpacing: "-1.2px"
              }}
            >
              Expenses
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              Track all company expenses and disbursements
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowAddPanel(true)}
              style={{
                height: "48px",
                padding: "0 24px",
                borderRadius: "16px",
                background: "#0F766E",
                border: "none",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0D6560";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0F766E";
              }}
            >
              <Plus size={20} />
              Log Expense
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--neuron-ink-muted)" }} />
            <input
              type="text"
              placeholder="Search expenses, vendors, projects, or E-Voucher numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
              style={{
                border: "1px solid var(--neuron-ui-border)",
                backgroundColor: "#FFFFFF",
                color: "var(--neuron-ink-primary)"
              }}
            />
          </div>

          {/* Category Filter */}
          <CustomDropdown
            label=""
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
          />

          {/* Date Range Filter */}
          <CustomDropdown
            label=""
            value="all"
            onChange={(value) => {
              // TODO: Implement date range filtering logic
            }}
            options={[
              { value: "all", label: "All Time", icon: <Calendar className="w-3.5 h-3.5" style={{ color: "var(--neuron-ink-muted)" }} /> },
              { value: "today", label: "Today", icon: <Calendar className="w-3.5 h-3.5" style={{ color: "#0F766E" }} /> },
              { value: "this-week", label: "This Week", icon: <Calendar className="w-3.5 h-3.5" style={{ color: "#C88A2B" }} /> },
              { value: "this-month", label: "This Month", icon: <Calendar className="w-3.5 h-3.5" style={{ color: "#6B7A76" }} /> }
            ]}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="flex-1 overflow-auto px-12 pt-6 pb-6">
        {loading ? (
          <div className="rounded-[10px] overflow-hidden" style={{ 
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)"
          }}>
            <div className="px-6 py-12 text-center" style={{ color: "#667085" }}>
              Loading expenses...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[10px] overflow-hidden" style={{ 
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)"
          }}>
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                borderRadius: "50%", 
                backgroundColor: "#FEE2E2", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "32px"
              }}>
                ⚠️
              </div>
              <p style={{ fontSize: "16px", color: "#EF4444", marginBottom: "8px", fontWeight: 500 }}>
                Error loading expenses
              </p>
              <p style={{ fontSize: "14px", color: "#667085", marginBottom: "16px" }}>{error}</p>
              <button
                onClick={fetchExpenses}
                style={{
                  padding: "10px 20px",
                  background: "#0F766E",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="rounded-[10px] overflow-hidden" style={{ 
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)"
          }}>
            <div className="px-6 py-12 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
              <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">
                {searchQuery ? "No expenses found" : "No expenses recorded yet"}
              </h3>
              <p style={{ color: "var(--neuron-ink-muted)" }}>
                {searchQuery 
                  ? "Try adjusting your search query or filters"
                  : "Expenses will appear here once payment E-Vouchers are posted to the ledger"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[10px] overflow-hidden" style={{ 
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)"
          }}>
            {/* Table Header */}
            <div className="grid grid-cols-[32px_minmax(240px,1fr)_160px_180px_140px_1fr] gap-3 px-4 py-2 border-b" style={{ 
              backgroundColor: "var(--neuron-bg-page)",
              borderColor: "var(--neuron-ui-divider)"
            }}>
              <div></div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Description</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Category</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Vendor</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em] text-right" style={{ color: "var(--neuron-ink-muted)" }}>Amount</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em] pl-8" style={{ color: "var(--neuron-ink-muted)" }}>Project</div>
            </div>

            {/* Expense Rows */}
            <div className="divide-y" style={{ borderColor: "var(--neuron-ui-divider)" }}>
              {filteredExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="grid grid-cols-[32px_minmax(240px,1fr)_160px_180px_140px_1fr] gap-3 px-4 py-3 transition-colors cursor-pointer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => {
                    setSelectedExpense(expense);
                    setShowDetailPanel(true);
                  }}
                >
                  {/* Icon Column */}
                  <div className="flex items-center justify-center">
                    {getCategoryIcon(expense.category)}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="text-[12px] font-semibold" style={{ color: "var(--neuron-ink-primary)" }}>
                      {expense.description}
                    </div>
                    {expense.sub_category && (
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--neuron-ink-muted)" }}>
                        {expense.sub_category}
                      </div>
                    )}
                  </div>

                  {/* Category Badge + Date */}
                  <div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.002em] ${getCategoryColor(expense.category)}`}>
                      {expense.category || "Uncategorized"}
                    </span>
                    <div className="text-[10px] mt-1" style={{ color: "var(--neuron-ink-muted)" }}>
                      {formatDate(expense.date)}
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="truncate text-[12px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                    {expense.vendor || "—"}
                  </div>

                  {/* Amount */}
                  <div className="text-[13px] font-semibold text-right" style={{ color: "var(--neuron-ink-primary)" }}>
                    {formatCurrency(expense.amount)}
                  </div>

                  {/* Project */}
                  <div className="text-[11px] pl-8" style={{ color: "#0F766E", fontWeight: 500 }}>
                    {expense.project_number || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Panel */}
      {showAddPanel && (
        <AddRequestForPaymentPanel
          context="expense"
          isOpen={showAddPanel}
          onClose={() => setShowAddPanel(false)}
          onSave={async () => {
            await fetchExpenses();
            setShowAddPanel(false);
          }}
          defaultRequestor={currentUser?.name || "Current User"}
        />
      )}

      {/* Expense Detail Panel */}
      {selectedExpense && showDetailPanel && (
        <ExpenseDetailPanel
          expense={selectedExpense}
          isOpen={showDetailPanel}
          onClose={() => {
            setShowDetailPanel(false);
            setSelectedExpense(null);
          }}
          onDelete={() => {
            fetchExpenses();
          }}
        />
      )}
    </div>
  );
}