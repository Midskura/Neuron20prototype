import { useState, useEffect } from "react";
import { FileText, Search, Filter, Calendar, Plus } from "lucide-react";
import { PhilippinePeso } from "../../icons/PhilippinePeso";
import { EVoucherStatusBadge } from "./EVoucherStatusBadge";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import type { EVoucherStatus } from "../../../types/evoucher";

interface MyEVoucher {
  id: string;
  voucher_number: string;
  vendor_name: string;
  purpose: string;
  amount: number;
  currency: string;
  status: EVoucherStatus;
  request_date: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface MyEVouchersListProps {
  userId: string;
  onViewDetail?: (evoucher: MyEVoucher) => void;
  onCreateNew?: () => void;
  refreshTrigger?: number;
}

export function MyEVouchersList({ userId, onViewDetail, onCreateNew, refreshTrigger }: MyEVouchersListProps) {
  const [evouchers, setEvouchers] = useState<MyEVoucher[]>([]);
  const [filteredEvouchers, setFilteredEvouchers] = useState<MyEVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchMyEvouchers();
  }, [userId, refreshTrigger]);

  useEffect(() => {
    filterEvouchers();
  }, [evouchers, searchQuery, statusFilter]);

  const fetchMyEvouchers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/evouchers/my-evouchers?requestor_id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        setEvouchers(result.data);
      } else {
        console.error("Error fetching my E-Vouchers:", result.error);
      }
    } catch (error) {
      console.error("Error fetching my E-Vouchers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvouchers = () => {
    let filtered = [...evouchers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ev) =>
          ev.voucher_number.toLowerCase().includes(query) ||
          ev.vendor_name.toLowerCase().includes(query) ||
          ev.purpose.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((ev) => ev.status === statusFilter);
    }

    setFilteredEvouchers(filtered);
  };

  const getStatusCounts = () => {
    return {
      draft: evouchers.filter((ev) => ev.status === "draft").length,
      pending: evouchers.filter((ev) => ev.status === "pending").length,
      posted: evouchers.filter((ev) => ev.status === "posted").length,
      rejected: evouchers.filter((ev) => ev.status === "rejected").length,
      cancelled: evouchers.filter((ev) => ev.status === "cancelled").length
    };
  };

  const getStatusMessage = (evoucher: MyEVoucher) => {
    if (evoucher.status === "draft") {
      return "Draft - Not submitted yet";
    }
    if (evoucher.status === "pending") {
      const days = Math.floor(
        (new Date().getTime() - new Date(evoucher.submitted_at!).getTime()) / (1000 * 60 * 60 * 24)
      );
      return `Pending approval${days > 0 ? ` • ${days} ${days === 1 ? "day" : "days"} ago` : ""}`;
    }
    if (evoucher.status === "posted") {
      return "Approved and posted to ledger";
    }
    if (evoucher.status === "rejected") {
      return evoucher.rejection_reason || "Rejected by Accounting";
    }
    if (evoucher.status === "cancelled") {
      return "Cancelled";
    }
    return "";
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          color: "#6B7280"
        }}
      >
        <FileText size={24} className="animate-spin" style={{ marginRight: "12px" }} />
        Loading your E-Vouchers...
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: "300px", position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF"
            }}
          />
          <input
            type="text"
            placeholder="Search by voucher #, vendor, purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ position: "relative" }}>
          <Filter
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
              pointerEvents: "none"
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px 10px 40px",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              outline: "none",
              minWidth: "150px"
            }}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="posted">Posted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* E-Vouchers List */}
      {filteredEvouchers.length === 0 ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "12px",
            backgroundColor: "#FAFAFA"
          }}
        >
          <FileText size={48} style={{ color: "#D1D5DB", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
            No E-Vouchers Found
          </h3>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            {searchQuery || statusFilter !== "all"
              ? "No E-Vouchers match your filters"
              : "You haven't created any E-Vouchers yet"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredEvouchers.map((evoucher) => (
            <div
              key={evoucher.id}
              onClick={() => onViewDetail?.(evoucher)}
              style={{
                padding: "20px",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0F766E";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(15, 118, 110, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Header Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                    {evoucher.voucher_number}
                  </span>
                  <EVoucherStatusBadge status={evoucher.status} size="sm" />
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#12332B",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <PhilippinePeso size={16} />
                  {evoucher.amount.toLocaleString()} {evoucher.currency}
                </div>
              </div>

              {/* Purpose */}
              <div style={{ fontSize: "14px", color: "#374151", marginBottom: "8px" }}>
                {evoucher.purpose}
              </div>

              {/* Status Message */}
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>
                {getStatusMessage(evoucher)}
              </div>

              {/* Details Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--neuron-ui-border)",
                  fontSize: "13px",
                  color: "#6B7280",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={14} />
                  {new Date(evoucher.request_date).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </div>
                <div>Vendor: {evoucher.vendor_name}</div>
              </div>

              {/* Rejection Message */}
              {evoucher.status === "rejected" && evoucher.rejection_reason && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#FEE2E2",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#991B1B"
                  }}
                >
                  <strong>Rejection Reason:</strong> {evoucher.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}