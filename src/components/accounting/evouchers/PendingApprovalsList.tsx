import { useState, useEffect } from "react";
import { Clock, User, Building2, Search, Filter, Calendar } from "lucide-react";
import { PhilippinePeso } from "../../icons/PhilippinePeso";
import { EVoucherStatusBadge } from "./EVoucherStatusBadge";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface PendingEVoucher {
  id: string;
  voucher_number: string;
  requestor_name: string;
  requestor_department?: string;
  vendor_name: string;
  purpose: string;
  amount: number;
  currency: string;
  status: string;
  submitted_at: string;
  request_date: string;
  project_number?: string;
  customer_name?: string;
}

interface PendingApprovalsListProps {
  onViewDetail?: (evoucher: PendingEVoucher) => void;
  refreshTrigger?: number;
}

export function PendingApprovalsList({ onViewDetail, refreshTrigger }: PendingApprovalsListProps) {
  const [evouchers, setEvouchers] = useState<PendingEVoucher[]>([]);
  const [filteredEvouchers, setFilteredEvouchers] = useState<PendingEVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  useEffect(() => {
    fetchPendingEvouchers();
  }, [refreshTrigger]);

  useEffect(() => {
    filterEvouchers();
  }, [evouchers, searchQuery, departmentFilter]);

  const fetchPendingEvouchers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/evouchers/pending`,
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
        console.error("Error fetching pending E-Vouchers:", result.error);
      }
    } catch (error) {
      console.error("Error fetching pending E-Vouchers:", error);
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
          ev.requestor_name.toLowerCase().includes(query) ||
          ev.vendor_name.toLowerCase().includes(query) ||
          ev.purpose.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((ev) => ev.requestor_department === departmentFilter);
    }

    setFilteredEvouchers(filtered);
  };

  const getDaysSinceSubmitted = (submittedAt: string) => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days: number) => {
    if (days >= 3) return "#EF4444"; // Red - Very urgent
    if (days >= 2) return "#F59E0B"; // Amber - Urgent
    return "#6B7280"; // Gray - Normal
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
        <Clock size={24} className="animate-spin" style={{ marginRight: "12px" }} />
        Loading pending approvals...
      </div>
    );
  }

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
            placeholder="Search by voucher #, requestor, vendor, purpose..."
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

        {/* Department Filter */}
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
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{
              padding: "10px 12px 10px 40px",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all">All Departments</option>
            <option value="BD">Business Development</option>
            <option value="Operations">Operations</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Admin">Admin</option>
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
          <Clock size={48} style={{ color: "#D1D5DB", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
            No Pending Approvals
          </h3>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            {searchQuery || departmentFilter !== "all"
              ? "No E-Vouchers match your filters"
              : "All E-Vouchers have been reviewed"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredEvouchers.map((evoucher) => {
            const daysSinceSubmitted = getDaysSinceSubmitted(evoucher.submitted_at);
            const urgencyColor = getUrgencyColor(daysSinceSubmitted);

            return (
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
                    <EVoucherStatusBadge status={evoucher.status as any} size="sm" />
                    {daysSinceSubmitted > 0 && (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: urgencyColor,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <Clock size={12} />
                        {daysSinceSubmitted} {daysSinceSubmitted === 1 ? "day" : "days"} ago
                      </span>
                    )}
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
                <div style={{ fontSize: "14px", color: "#374151", marginBottom: "12px" }}>
                  {evoucher.purpose}
                </div>

                {/* Details Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--neuron-ui-border)"
                  }}
                >
                  {/* Requestor */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User size={14} style={{ color: "#9CA3AF" }} />
                    <div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>Requestor</div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                        {evoucher.requestor_name}
                        {evoucher.requestor_department && (
                          <span style={{ color: "#9CA3AF" }}> • {evoucher.requestor_department}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vendor */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Building2 size={14} style={{ color: "#9CA3AF" }} />
                    <div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>Vendor</div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                        {evoucher.vendor_name}
                      </div>
                    </div>
                  </div>

                  {/* Request Date */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={14} style={{ color: "#9CA3AF" }} />
                    <div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>Request Date</div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                        {new Date(evoucher.request_date).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Project/Customer */}
                  {(evoucher.project_number || evoucher.customer_name) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building2 size={14} style={{ color: "#9CA3AF" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#6B7280" }}>Linked To</div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#0F766E" }}>
                          {evoucher.project_number || evoucher.customer_name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}