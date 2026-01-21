import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Download, FileText, TrendingUp, Users, Building2, Wallet, DollarSign, Receipt } from "lucide-react";
import { EVoucherStatusBadge } from "./EVoucherStatusBadge";
import { PhilippinePeso } from "../../icons/PhilippinePeso";
import type { EVoucher, EVoucherStatus, EVoucherTransactionType, EVoucherSourceModule } from "../../../types/evoucher";
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from "../../ui/toast-utils";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface AllEVouchersListProps {
  onViewDetail: (evoucher: EVoucher) => void;
  refreshTrigger?: number;
}

export function AllEVouchersList({ onViewDetail, refreshTrigger }: AllEVouchersListProps) {
  const [evouchers, setEvouchers] = useState<EVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EVoucherStatus | "all">("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<EVoucherTransactionType | "all">("all");
  const [sourceModuleFilter, setSourceModuleFilter] = useState<EVoucherSourceModule | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllEvouchers();
  }, [refreshTrigger]);

  const fetchAllEvouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/evouchers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch E-Vouchers');
      }

      const data = await response.json();
      setEvouchers(data.data || []);
    } catch (error) {
      console.error('Error fetching E-Vouchers:', error);
      toast.error('Failed to load E-Vouchers');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted E-Vouchers
  const filteredEvouchers = useMemo(() => {
    return evouchers.filter(ev => {
      const matchesSearch = !searchQuery || 
        ev.voucher_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.requestor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || ev.status === statusFilter;
      const matchesTransactionType = transactionTypeFilter === "all" || ev.transaction_type === transactionTypeFilter;
      const matchesSourceModule = sourceModuleFilter === "all" || ev.source_module === sourceModuleFilter;

      return matchesSearch && matchesStatus && matchesTransactionType && matchesSourceModule;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [evouchers, searchQuery, statusFilter, transactionTypeFilter, sourceModuleFilter]);

  // Summary Statistics
  const stats = useMemo(() => {
    const totalAmount = filteredEvouchers.reduce((sum, ev) => sum + ev.amount, 0);
    const pendingCount = filteredEvouchers.filter(ev => ev.status === "pending").length;
    const postedCount = filteredEvouchers.filter(ev => ev.status === "posted").length;

    return { totalAmount, pendingCount, postedCount, totalCount: filteredEvouchers.length };
  }, [filteredEvouchers]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTransactionTypeFilter("all");
    setSourceModuleFilter("all");
  };

  const activeFilterCount = [statusFilter, transactionTypeFilter, sourceModuleFilter].filter(f => f !== "all").length;

  const getTransactionTypeLabel = (type: EVoucherTransactionType | undefined) => {
    if (!type) return "Expense";
    const labels: Record<EVoucherTransactionType, string> = {
      expense: "Expense",
      budget_request: "Budget Request",
      collection: "Collection",
      billing: "Billing",
      adjustment: "Adjustment",
      reimbursement: "Reimbursement"
    };
    return labels[type] || type;
  };

  const getSourceModuleLabel = (module: EVoucherSourceModule | undefined) => {
    if (!module) return "Unknown";
    const labels: Record<EVoucherSourceModule, string> = {
      bd: "Business Development",
      operations: "Operations",
      accounting: "Accounting",
      pricing: "Pricing",
      hr: "HR",
      executive: "Executive"
    };
    return labels[module] || module;
  };

  const formatCurrency = (amount: number | undefined | null) => {
    const value = amount ?? 0;
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type: EVoucherTransactionType | undefined) => {
    const iconProps = { className: "w-4 h-4", style: { color: "var(--neuron-ink-muted)" } };
    
    switch (type) {
      case "expense":
        return <Wallet {...iconProps} />;
      case "budget_request":
        return <DollarSign {...iconProps} />;
      case "collection":
        return <TrendingUp {...iconProps} />;
      case "billing":
        return <Receipt {...iconProps} />;
      case "reimbursement":
        return <Users {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "#667085" }}>Loading E-Vouchers...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Search and Filters */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#667085"
          }} />
          <input
            type="text"
            placeholder="Search by voucher number, requestor, purpose, or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: showFilters ? "#0F766E" : "#667085",
            backgroundColor: showFilters ? "#E8F5F3" : "#FFFFFF",
            cursor: "pointer"
          }}
        >
          <Filter size={16} />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#C94F3D",
              backgroundColor: "#FFE5E5",
              cursor: "pointer"
            }}
          >
            <X size={16} />
            Clear
          </button>
        )}

        {/* Export */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#667085",
            backgroundColor: "#FFFFFF",
            cursor: "pointer"
          }}
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          padding: "16px",
          backgroundColor: "#F9FAFB",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px"
        }}>
          {/* Status Filter */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EVoucherStatus | "all")}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#FFFFFF"
              }}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="posted">Posted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Transaction Type
            </label>
            <select
              value={transactionTypeFilter}
              onChange={(e) => setTransactionTypeFilter(e.target.value as EVoucherTransactionType | "all")}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#FFFFFF"
              }}
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="budget_request">Budget Request</option>
              <option value="collection">Collection</option>
              <option value="billing">Billing</option>
              <option value="adjustment">Adjustment</option>
              <option value="reimbursement">Reimbursement</option>
            </select>
          </div>

          {/* Source Module Filter */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Source Module
            </label>
            <select
              value={sourceModuleFilter}
              onChange={(e) => setSourceModuleFilter(e.target.value as EVoucherSourceModule | "all")}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#FFFFFF"
              }}
            >
              <option value="all">All Modules</option>
              <option value="bd">Business Development</option>
              <option value="operations">Operations</option>
              <option value="accounting">Accounting</option>
              <option value="pricing">Pricing</option>
              <option value="hr">HR</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
      )}

      {/* E-Vouchers Table */}
      {filteredEvouchers.length === 0 ? (
        <div className="rounded-[10px] overflow-hidden" style={{ 
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--neuron-ui-border)"
        }}>
          <div className="px-6 py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
            <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">
              No E-Vouchers Found
            </h3>
            <p style={{ color: "var(--neuron-ink-muted)" }}>
              {searchQuery || activeFilterCount > 0 
                ? "Try adjusting your search or filters"
                : "No E-Vouchers have been created yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] overflow-hidden" style={{ 
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--neuron-ui-border)"
        }}>
          {/* Table Header */}
          <div className="grid grid-cols-[32px_minmax(180px,1fr)_140px_180px_140px_1fr] gap-3 px-4 py-2 border-b" style={{ 
            backgroundColor: "var(--neuron-bg-page)",
            borderColor: "var(--neuron-ui-divider)"
          }}>
            <div></div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Voucher #</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Type</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.002em]" style={{ color: "var(--neuron-ink-muted)" }}>Requestor</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.002em] text-right" style={{ color: "var(--neuron-ink-muted)" }}>Amount</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.002em] pl-8" style={{ color: "var(--neuron-ink-muted)" }}>Purpose</div>
          </div>

          {/* E-Voucher Rows */}
          <div className="divide-y" style={{ borderColor: "var(--neuron-ui-divider)" }}>
            {filteredEvouchers.map(ev => (
              <div
                key={ev.id}
                className="grid grid-cols-[32px_minmax(180px,1fr)_140px_180px_140px_1fr] gap-3 px-4 py-3 transition-colors cursor-pointer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => onViewDetail(ev)}
              >
                {/* Icon Column */}
                <div className="flex items-center justify-center">
                  {getTypeIcon(ev.transaction_type)}
                </div>

                {/* Voucher # */}
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: "var(--neuron-ink-primary)" }}>
                    {ev.voucher_number}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--neuron-ink-muted)" }}>
                    {formatDate(ev.request_date)}
                  </div>
                </div>

                {/* Type Badge */}
                <div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.002em] bg-[#F3F4F6] text-[#374151]">
                    {getTransactionTypeLabel(ev.transaction_type)}
                  </span>
                </div>

                {/* Requestor + Module */}
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: "var(--neuron-ink-primary)" }}>
                    {ev.requestor_name}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--neuron-ink-muted)" }}>
                    {getSourceModuleLabel(ev.source_module)}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-[13px] font-semibold text-right" style={{ color: "var(--neuron-ink-primary)" }}>
                  {formatCurrency(ev.amount)}
                </div>

                {/* Purpose + Status */}
                <div className="pl-8">
                  <div className="text-[12px] font-medium mb-1" style={{ color: "var(--neuron-ink-secondary)" }}>
                    {ev.purpose}
                  </div>
                  {ev.vendor_name && (
                    <div className="text-[10px] mb-1" style={{ color: "var(--neuron-ink-muted)" }}>
                      → {ev.vendor_name}
                    </div>
                  )}
                  <EVoucherStatusBadge status={ev.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}