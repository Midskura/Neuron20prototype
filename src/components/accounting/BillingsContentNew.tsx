import { useState, useEffect, useMemo } from "react";
import { Plus, FileText, Search, Filter, Calendar, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Billing } from "../../types/accounting";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { BillingDetailPanel } from "./BillingDetailPanel";
import { AddRequestForPaymentPanel } from "./AddRequestForPaymentPanel";
import { CustomDropdown } from "../bd/CustomDropdown";

export function BillingsContentNew() {
  // State for data
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  
  // Get current user
  const userData = localStorage.getItem("neuron_user");
  const currentUser = userData ? JSON.parse(userData) : null;

  // Check if user has billing access
  const hasBillingAccess = 
    currentUser?.department === "Accounting" || 
    currentUser?.department === "Executive";

  // Fetch billings from API
  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/accounting/billings`,
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
      console.log('✅ Fetched billings:', data);
      setBillings(data.data || []);
    } catch (err) {
      console.error('❌ Error fetching billings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load billings';
      setError(errorMessage);
      
      // If it's a network error, show a more helpful message
      if (errorMessage.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredBillings = useMemo(() => {
    let filtered = billings;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(billing =>
        billing.description?.toLowerCase().includes(query) ||
        billing.customer_name?.toLowerCase().includes(query) ||
        billing.invoice_number?.toLowerCase().includes(query) ||
        billing.evoucher_number?.toLowerCase().includes(query) ||
        billing.project_number?.toLowerCase().includes(query)
      );
    }

    // Payment status filter
    if (paymentStatusFilter && paymentStatusFilter !== "all") {
      filtered = filtered.filter(billing => billing.payment_status === paymentStatusFilter);
    }

    // Sort by invoice date descending
    filtered.sort((a, b) => 
      new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
    );

    return filtered;
  }, [billings, searchQuery, paymentStatusFilter]);

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-[#D1FAE5] text-[#059669]";
      case "partial":
        return "bg-[#FEF3E7] text-[#C88A2B]";
      case "unpaid":
        return "bg-[#FEE2E2] text-[#DC2626]";
      case "overdue":
        return "bg-[#FEE2E2] text-[#991B1B]";
      default:
        return "bg-[#F3F4F6] text-[#6B7280]";
    }
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: "w-4 h-4", style: { color: "var(--neuron-ink-muted)" } };
    
    switch (status) {
      case "paid":
        return <CheckCircle2 {...iconProps} style={{ color: "#059669" }} />;
      case "partial":
        return <Clock {...iconProps} style={{ color: "#C88A2B" }} />;
      case "unpaid":
        return <AlertCircle {...iconProps} style={{ color: "#DC2626" }} />;
      case "overdue":
        return <AlertCircle {...iconProps} style={{ color: "#991B1B" }} />;
      default:
        return <Receipt {...iconProps} />;
    }
  };

  const isOverdue = (billing: Billing) => {
    if (billing.payment_status === "paid") return false;
    const dueDate = new Date(billing.due_date);
    const today = new Date();
    return dueDate < today;
  };

  // Define table columns
  const columns: ColumnDef<Billing>[] = [
    {
      key: "invoice_number",
      label: "Invoice #",
      width: "140px",
      sortable: true,
      render: (billing) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>
            {billing.invoice_number}
          </span>
          {billing.evoucher_id && (
            <span
              style={{
                fontSize: "11px",
                color: "#0F766E",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FileText size={10} />
              E-Voucher
            </span>
          )}
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      width: "200px",
      sortable: true,
      render: (billing) => (
        <span style={{ fontWeight: 500 }}>{billing.customer_name || "N/A"}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: "1fr",
      render: (billing) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span>{billing.description}</span>
          {billing.project_number && (
            <span style={{ fontSize: "12px", color: "#0F766E", fontWeight: 500 }}>
              {billing.project_number}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      width: "140px",
      align: "right",
      sortable: true,
      render: (billing) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
          <span style={{ fontWeight: 600, fontSize: "15px" }}>
            {formatCurrency(billing.total_amount)}
          </span>
          {billing.amount_due > 0 && billing.payment_status !== "unpaid" && (
            <span style={{ fontSize: "11px", color: "#DC2626" }}>
              {formatCurrency(billing.amount_due)} due
            </span>
          )}
        </div>
      ),
    },
    {
      key: "invoice_date",
      label: "Issued",
      width: "110px",
      sortable: true,
      render: (billing) => (
        <span style={{ fontSize: "13px" }}>{formatDate(billing.invoice_date)}</span>
      ),
    },
    {
      key: "due_date",
      label: "Due Date",
      width: "110px",
      sortable: true,
      render: (billing) => {
        const overdue = isOverdue(billing);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "13px", color: overdue ? "#DC2626" : "inherit" }}>
              {formatDate(billing.due_date)}
            </span>
            {overdue && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#991B1B",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <Calendar size={10} />
                Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (billing) => {
        const statusStyle = getPaymentStatusColor(billing.payment_status);
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              background: statusStyle,
              textTransform: "capitalize",
              display: "inline-block",
            }}
          >
            {billing.payment_status}
            {getStatusIcon(billing.payment_status)}
          </span>
        );
      },
    },
  ];

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
            marginBottom: "24px"
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
              Billings
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              Manage customer invoices and billing transactions
            </p>
          </div>

          {/* Action Buttons */}
          {hasBillingAccess && (
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
              Create Invoice
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--neuron-ink-muted)" }} />
            <input
              type="text"
              placeholder="Search invoices by customer, invoice number, or E-Voucher..."
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

          {/* Payment Status Filter */}
          <CustomDropdown
            label=""
            value={paymentStatusFilter}
            onChange={(value) => setPaymentStatusFilter(value)}
            options={[
              { value: "all", label: "All Payment Status" },
              { value: "unpaid", label: "Unpaid" },
              { value: "partial", label: "Partially Paid" },
              { value: "paid", label: "Paid" },
              { value: "overdue", label: "Overdue" },
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

      {/* Billings Table */}
      <div className="flex-1 overflow-auto px-12 pt-6 pb-6">
        {loading ? (
          <div className="rounded-[10px] overflow-hidden" style={{ 
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)"
          }}>
            <div className="px-6 py-12 text-center" style={{ color: "#667085" }}>
              Loading invoices...
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
                Error loading billings
              </p>
              <p style={{ fontSize: "14px", color: "#667085", marginBottom: "16px" }}>{error}</p>
              <button
                onClick={fetchBillings}
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
        ) : filteredBillings.length === 0 ? (
          <div className="rounded-[10px] overflow-hidden" style={{ 
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)"
          }}>
            <div className="px-6 py-12 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
              <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">
                {searchQuery ? "No invoices found" : "No invoices created yet"}
              </h3>
              <p style={{ color: "var(--neuron-ink-muted)" }}>
                {searchQuery 
                  ? "Try adjusting your search query or filters"
                  : "Invoices will appear here once billing E-Vouchers are posted to the ledger"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[10px] overflow-hidden" style={{ 
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--neuron-ui-border)"
          }}>
            {/* Table Header */}
            <div className="grid grid-cols-[32px_minmax(240px,1fr)_180px_140px_120px_1fr] gap-3 px-4 py-2 border-b" style={{ 
              backgroundColor: "var(--neuron-bg-page)",
              borderColor: "var(--neuron-ui-divider)"
            }}>
              <div></div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Description</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Customer</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em] text-right" style={{ color: "var(--neuron-ink-muted)" }}>Amount</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Status</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.002em] pl-8" style={{ color: "var(--neuron-ink-muted)" }}>Invoice #</div>
            </div>

            {/* Billing Rows */}
            <div className="divide-y" style={{ borderColor: "var(--neuron-ui-divider)" }}>
              {filteredBillings.map(billing => (
                <div
                  key={billing.id || billing.invoice_number}
                  className="grid grid-cols-[32px_minmax(240px,1fr)_180px_140px_120px_1fr] gap-3 px-4 py-3 transition-colors cursor-pointer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => {
                    setSelectedBilling(billing);
                    setShowDetailPanel(true);
                  }}
                >
                  {/* Icon Column */}
                  <div className="flex items-center justify-center">
                    {getStatusIcon(billing.payment_status)}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="text-[12px] font-semibold" style={{ color: "var(--neuron-ink-primary)" }}>
                      {billing.description}
                    </div>
                    {billing.project_number && (
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--neuron-ink-muted)" }}>
                        Project: {billing.project_number}
                      </div>
                    )}
                  </div>

                  {/* Customer */}
                  <div className="truncate text-[12px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                    {billing.customer_name || "—"}
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-[13px] font-semibold" style={{ color: "var(--neuron-ink-primary)" }}>
                      {formatCurrency(billing.total_amount)}
                    </div>
                    {billing.amount_due > 0 && billing.payment_status !== "unpaid" && (
                      <div className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>
                        {formatCurrency(billing.amount_due)} due
                      </div>
                    )}
                  </div>

                  {/* Status Badge + Due Date */}
                  <div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.002em] ${getPaymentStatusColor(billing.payment_status)}`}>
                      {billing.payment_status}
                    </span>
                    <div className="text-[10px] mt-1" style={{ color: isOverdue(billing) ? "#DC2626" : "var(--neuron-ink-muted)" }}>
                      Due: {formatDate(billing.due_date)}
                    </div>
                  </div>

                  {/* Invoice # */}
                  <div className="text-[11px] pl-8" style={{ color: "#0F766E", fontWeight: 500 }}>
                    {billing.invoice_number || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Billing Panel */}
      {showAddPanel && (
        <AddRequestForPaymentPanel
          context="billing"
          isOpen={showAddPanel}
          onClose={() => setShowAddPanel(false)}
          onSave={async () => {
            await fetchBillings();
            setShowAddPanel(false);
          }}
          defaultRequestor={currentUser?.name || "Current User"}
        />
      )}

      {/* Billing Detail Panel */}
      {selectedBilling && showDetailPanel && (
        <BillingDetailPanel
          billing={selectedBilling}
          isOpen={showDetailPanel}
          onClose={() => {
            setShowDetailPanel(false);
            setSelectedBilling(null);
          }}
          onPaymentUpdate={() => {
            fetchBillings();
          }}
          onDelete={() => {
            fetchBillings();
          }}
        />
      )}
    </div>
  );
}