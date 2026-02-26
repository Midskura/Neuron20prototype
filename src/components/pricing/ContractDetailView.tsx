/**
 * ContractDetailView
 *
 * Dedicated detail view for Contract Quotations.
 * Categorized tabs matching ProjectDetail pattern:
 *   Dashboard (Financial Overview, Rate Card) |
 *   Operations (Bookings) |
 *   Accounting (Billings, Invoices, Collections, Expenses) |
 *   Collaboration (Attachments, Comments)
 *
 * @see /docs/blueprints/CONTRACT_PARITY_BLUEPRINT.md
 * @see /docs/blueprints/CONTRACT_QUOTATION_BLUEPRINT.md - Phase 3, Task 3.3
 */

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Edit3, RefreshCw, FileText, Calendar, Building2, Briefcase, Ship, Shield, Truck, Clock, Zap, Plus, ChevronDown, Layout, Layers, Users, Receipt, FileStack, DollarSign, TrendingUp, Paperclip, MessageSquare, Eye } from "lucide-react";
import type { QuotationNew, ContractRateMatrix } from "../../types/pricing";
import { ContractRateCardV2 as ContractRateMatrixEditor } from "./quotations/ContractRateCardV2";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "../ui/toast-utils";
import { CreateBookingFromContractPanel } from "../contracts/CreateBookingFromContractPanel";
import type { InquiryService } from "../../types/pricing";
import { useContractFinancials } from "../../hooks/useContractFinancials";
import { UnifiedBillingsTab } from "../shared/billings/UnifiedBillingsTab";
import { ProjectFinancialOverview } from "../projects/tabs/ProjectFinancialOverview";
import { UnifiedInvoicesTab } from "../shared/invoices/UnifiedInvoicesTab";
import { UnifiedCollectionsTab } from "../shared/collections/UnifiedCollectionsTab";
import { ProjectExpensesTab } from "../projects/ProjectExpensesTab";
import { contractAsProject } from "../../utils/contractAdapter";
import { ProjectBookingReadOnlyView } from "../projects/ProjectBookingReadOnlyView";
import { EntityAttachmentsTab } from "../shared/EntityAttachmentsTab";
import { CommentsTab } from "../shared/CommentsTab";
import { ContractStatusSelector } from "../contracts/ContractStatusSelector";

// ============================================
// TYPES
// ============================================

interface ContractDetailViewProps {
  quotation: QuotationNew;
  onBack: () => void;
  onEdit: () => void;
  onUpdate?: (quotation: QuotationNew) => void;
  currentUser?: { name: string; email: string; department: string } | null;
}

type ContractTab = "financial_overview" | "rate-card" | "bookings" | "billings" | "invoices" | "collections" | "expenses" | "attachments" | "comments" | "activity";

type TabCategory = "dashboard" | "operations" | "accounting" | "collaboration";

// ============================================
// HELPERS
// ============================================

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Draft": return { text: "#6B7280", bg: "#F3F4F6" };
    case "Sent": return { text: "#3B82F6", bg: "#DBEAFE" };
    case "Active": return { text: "#059669", bg: "#D1FAE5" };
    case "Expiring": return { text: "#D97706", bg: "#FEF3C7" };
    case "Expired": return { text: "#6B7280", bg: "#F3F4F6" };
    case "Renewed": return { text: "#7C3AED", bg: "#EDE9FE" };
    default: return { text: "#6B7280", bg: "#F3F4F6" };
  }
};

const getServiceIcon = (service: string) => {
  const iconProps = { size: 15, style: { color: "#0F766E" } };
  switch (service) {
    case "Brokerage": return <Briefcase {...iconProps} />;
    case "Forwarding": return <Ship {...iconProps} />;
    case "Trucking": return <Truck {...iconProps} />;
    case "Marine Insurance": return <Shield {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

const getDaysRemaining = (endDate?: string) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ContractDetailView({
  quotation,
  onBack,
  onEdit,
  onUpdate,
  currentUser,
}: ContractDetailViewProps) {
  const [activeTab, setActiveTab] = useState<ContractTab>("financial_overview");
  const [activeCategory, setActiveCategory] = useState<TabCategory>("dashboard");
  const [linkedBookings, setLinkedBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // ✨ CONTRACT PARITY: Financial data hook (replaces useContractBillings)
  const linkedBookingIds = linkedBookings.map((b: any) => b.bookingId || b.id).filter(Boolean);
  const contractFinancials = useContractFinancials(
    quotation.quote_number,
    linkedBookingIds,
    quotation.id
  );

  // Renewal modal state
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewStart, setRenewStart] = useState("");
  const [renewEnd, setRenewEnd] = useState("");
  const [isRenewing, setIsRenewing] = useState(false);

  // ✨ PHASE 3: Create Booking from Contract state
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [createBookingService, setCreateBookingService] = useState<InquiryService | null>(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // ✨ CONTRACTS MODULE: Activate contract state
  const [isActivating, setIsActivating] = useState(false);

  // ✨ CONTRACT PARITY Phase 3: Booking drill-down + Generate Billing state
  const [selectedBooking, setSelectedBooking] = useState<{ bookingId: string; bookingType: string } | null>(null);
  const [generatingBillingId, setGeneratingBillingId] = useState<string | null>(null);

  // ✨ CONTRACT PARITY Phase 5: Activity log state
  const [activityEvents, setActivityEvents] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const handleActivateContract = async () => {
    setIsActivating(true);
    try {
      const updatedQuotation: QuotationNew = {
        ...quotation,
        contract_status: "Active",
        status: "Converted to Contract" as any,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/quotations/${quotation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updatedQuotation),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Contract activated successfully! Operations can now link bookings.");
        if (onUpdate) {
          onUpdate(updatedQuotation);
        }
      } else {
        toast.error(data.error || "Failed to activate contract");
      }
    } catch (err) {
      console.error("Error activating contract:", err);
      toast.error("Failed to activate contract");
    } finally {
      setIsActivating(false);
    }
  };

  const contractStatus = quotation.contract_status || "Draft";
  const statusStyle = getStatusColor(contractStatus);
  const daysRemaining = getDaysRemaining(quotation.contract_validity_end);
  const rateMatrices = quotation.rate_matrices || [];

  // Determine if the "Activate Contract" CTA should show
  // Show when: quotation status is "Accepted by Client" AND contract_status is not yet "Active"
  const showActivateCTA = quotation.status === "Accepted by Client" && contractStatus !== "Active";

  // Fetch linked bookings when Bookings or Billings tab is active
  useEffect(() => {
    if ((activeTab === "bookings" || activeTab === "billings" || activeTab === "expenses" || activeTab === "invoices" || activeTab === "collections") && quotation.id) {
      fetchLinkedBookings();
    }
    if (activeTab === "activity" && quotation.id) {
      fetchActivityLog();
    }
  }, [activeTab, quotation.id]);

  const fetchLinkedBookings = async () => {
    setIsLoadingBookings(true);
    try {
      // Primary: try fetching from bookings API with contract_id filter
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/bookings?contract_id=${quotation.id}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const fetched = data.data || data.bookings || [];
        if (fetched.length > 0) {
          setLinkedBookings(fetched);
          return;
        }
      }
      // Fallback: use the contract's own linkedBookings array
      if ((quotation as any).linkedBookings?.length > 0) {
        setLinkedBookings((quotation as any).linkedBookings);
      }
    } catch (err) {
      console.error("Error fetching contract bookings:", err);
      // Fallback: use contract's linkedBookings
      if ((quotation as any).linkedBookings?.length > 0) {
        setLinkedBookings((quotation as any).linkedBookings);
      }
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchActivityLog = async () => {
    setIsLoadingActivity(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/contracts/${quotation.id}/activity`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const fetched = data.data || data.activity || [];
        if (fetched.length > 0) {
          setActivityEvents(fetched);
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching contract activity log:", err);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // ✨ PHASE 5: Renew contract
  const handleRenewContract = async () => {
    if (!renewStart || !renewEnd) {
      toast.error("Please specify both start and end dates");
      return;
    }
    setIsRenewing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/contracts/${quotation.id}/renew`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            new_validity_start: renewStart,
            new_validity_end: renewEnd,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success(`Contract renewed as ${data.new_contract.quote_number}`);
        setShowRenewModal(false);
        setRenewStart("");
        setRenewEnd("");
        // Update current view to show renewed status
        if (onUpdate) {
          onUpdate({ ...quotation, contract_status: "Renewed" });
        }
      } else {
        toast.error(data.error || "Failed to renew contract");
      }
    } catch (err) {
      console.error("Error renewing contract:", err);
      toast.error("Failed to renew contract");
    } finally {
      setIsRenewing(false);
    }
  };

  // ✨ CONTRACT PARITY Phase 3: Generate billing for a specific booking
  const handleGenerateBilling = async (bookingId: string, serviceType: string) => {
    try {
      setGeneratingBillingId(bookingId);
      toast.loading(`Generating billing for ${serviceType}...`, { id: "gen-billing" });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/contracts/${quotation.id}/generate-billing`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            bookingType: serviceType,
            filterByService: true,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Billing generated successfully!", { id: "gen-billing" });
        contractFinancials.refresh();
      } else {
        toast.error(result.error || "Failed to generate billing", { id: "gen-billing" });
      }
    } catch (error) {
      console.error("Error generating billing:", error);
      toast.error("An error occurred", { id: "gen-billing" });
    } finally {
      setGeneratingBillingId(null);
    }
  };

  // Map service type string to bookingType slug for ProjectBookingReadOnlyView
  const serviceTypeToBookingType = (serviceType: string): "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others" => {
    switch (serviceType?.toLowerCase()) {
      case "forwarding": return "forwarding";
      case "brokerage": return "brokerage";
      case "trucking": return "trucking";
      case "marine insurance": return "marine-insurance";
      case "others": return "others";
      default: return "others";
    }
  };

  // ============================================
  // TAB CONTENT RENDERERS
  // ============================================

  const renderRateCardTab = () => (
    <div style={{ padding: "24px 0" }}>
      {rateMatrices.length === 0 ? (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--neuron-ink-muted)",
          fontSize: "14px",
        }}>
          No rate matrices configured for this contract.
        </div>
      ) : (
        rateMatrices.map((matrix) => (
          <ContractRateMatrixEditor
            key={matrix.id}
            matrix={matrix}
            onChange={() => {}} // Read-only
            viewMode={true}
          />
        ))
      )}
    </div>
  );

  // ✨ PHASE 3: Get contract services as InquiryService array
  const contractServices: InquiryService[] = (quotation.services || []).map((s: string) => {
    const meta = quotation.services_metadata?.find(m => m.service_type === s);
    return meta || { service_type: s as any, service_details: {} };
  });

  const handleCreateBookingForService = (service: InquiryService) => {
    setCreateBookingService(service);
    setShowCreateBooking(true);
    setShowServiceDropdown(false);
  };

  const handleBookingCreated = () => {
    setShowCreateBooking(false);
    setCreateBookingService(null);
    fetchLinkedBookings(); // Refresh the list
  };

  const renderBookingsTab = () => (
    <div style={{ padding: "24px 0" }}>
      {/* ✨ PHASE 3: Create Booking button — only when contract is Active */}
      {["Active", "Expiring"].includes(contractStatus) && contractServices.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", position: "relative" }}>
          {contractServices.length === 1 ? (
            <button
              onClick={() => handleCreateBookingForService(contractServices[0])}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", fontSize: "13px", fontWeight: 600,
                color: "white", backgroundColor: "#0F766E",
                border: "none", borderRadius: "6px", cursor: "pointer",
              }}
            >
              <Plus size={14} />
              Create {contractServices[0].service_type} Booking
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", fontSize: "13px", fontWeight: 600,
                  color: "white", backgroundColor: "#0F766E",
                  border: "none", borderRadius: "6px", cursor: "pointer",
                }}
              >
                <Plus size={14} />
                Create Booking
                <ChevronDown size={14} />
              </button>
              {showServiceDropdown && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: "4px",
                  backgroundColor: "white", borderRadius: "8px",
                  border: "1px solid var(--neuron-ui-border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 10,
                  minWidth: "200px", overflow: "hidden",
                }}>
                  {contractServices.map(svc => (
                    <button
                      key={svc.service_type}
                      onClick={() => handleCreateBookingForService(svc)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        width: "100%", padding: "10px 16px", fontSize: "13px",
                        color: "#12332B", backgroundColor: "white",
                        border: "none", borderBottom: "1px solid #F3F4F6",
                        cursor: "pointer", textAlign: "left",
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F0FAFA"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                    >
                      {getServiceIcon(svc.service_type)}
                      {svc.service_type}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isLoadingBookings ? (
        <div style={{ padding: "48px", textAlign: "center", color: "var(--neuron-ink-muted)", fontSize: "13px" }}>
          Loading bookings...
        </div>
      ) : linkedBookings.length === 0 ? (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--neuron-ink-muted)",
        }}>
          <FileText size={40} style={{ marginBottom: "12px", opacity: 0.3, margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 4px" }}>No bookings linked yet</p>
          <p style={{ fontSize: "13px", margin: 0 }}>
            {["Active", "Expiring"].includes(contractStatus)
              ? 'Click "Create Booking" above to create a booking directly from this contract.'
              : "When Operations creates bookings for this client, they'll appear here automatically."
            }
          </p>
        </div>
      ) : (
        <div style={{
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}>
          {/* Bookings table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr 120px 120px 140px",
            gap: "12px",
            padding: "10px 16px",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--neuron-ink-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FAFCFB",
          }}>
            <div>Booking ID</div>
            <div>Service</div>
            <div>Date</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>
          {linkedBookings.map((booking: any, idx: number) => {
            const bookingId = booking.bookingId || booking.id;
            const serviceType = booking.serviceType || booking.bookingType || "Others";
            const isGenerating = generatingBillingId === bookingId;
            return (
            <div
              key={bookingId || idx}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 120px 120px 140px",
                gap: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                color: "var(--neuron-ink-primary)",
                borderBottom: idx < linkedBookings.length - 1 ? "1px solid var(--neuron-ui-divider)" : "none",
                backgroundColor: idx % 2 === 0 ? "white" : "#FAFCFB",
              }}
            >
              <div
                style={{ fontWeight: 500, cursor: "pointer", color: "#0F766E" }}
                onClick={() => setSelectedBooking({ bookingId, bookingType: serviceTypeToBookingType(serviceType) })}
              >
                {bookingId || "—"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--neuron-ink-muted)" }}>
                {getServiceIcon(serviceType)}
                {serviceType}
              </div>
              <div style={{ color: "var(--neuron-ink-muted)", fontSize: "12px" }}>{formatDate(booking.createdAt)}</div>
              <div>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor: booking.status === "Completed" ? "#D1FAE5" : "#F3F4F6",
                  color: booking.status === "Completed" ? "#059669" : "#6B7280",
                }}>
                  {booking.status || "Draft"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                <button
                  onClick={() => setSelectedBooking({ bookingId, bookingType: serviceTypeToBookingType(serviceType) })}
                  title="View booking details"
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "4px 8px", fontSize: "12px", fontWeight: 500,
                    color: "#0F766E", backgroundColor: "transparent",
                    border: "1px solid #D1D5DB", borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#0F766E"; e.currentTarget.style.backgroundColor = "#F0FAFA"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Eye size={12} />
                  View
                </button>
                <button
                  onClick={() => handleGenerateBilling(bookingId, serviceType)}
                  disabled={isGenerating}
                  title="Generate billing from rate card"
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "4px 8px", fontSize: "12px", fontWeight: 500,
                    color: isGenerating ? "#9CA3AF" : "#7C3AED",
                    backgroundColor: "transparent",
                    border: `1px solid ${isGenerating ? "#E5E7EB" : "#DDD6FE"}`,
                    borderRadius: "4px",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={e => { if (!isGenerating) { e.currentTarget.style.backgroundColor = "#F5F3FF"; e.currentTarget.style.borderColor = "#7C3AED"; }}}
                  onMouseLeave={e => { if (!isGenerating) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "#DDD6FE"; }}}
                >
                  <Receipt size={12} />
                  {isGenerating ? "..." : "Bill"}
                </button>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );

  const renderBillingsTab = () => (
    <div style={{ padding: "24px 0" }}>
      {/* ✨ PHASE 5C: Read-only aggregate view — billing items live on bookings, this is a rollup */}
      <UnifiedBillingsTab
        items={contractFinancials.billingItems}
        projectId={quotation.id}
        bookingId=""
        onRefresh={contractFinancials.refresh}
        isLoading={contractFinancials.isLoading}
        readOnly={true}
        title="Contract Billings"
        subtitle={`Read-only aggregate across ${linkedBookingIds.length} linked booking${linkedBookingIds.length !== 1 ? "s" : ""} — ${quotation.quote_number} · ${quotation.customer_name}`}
      />
    </div>
  );

  const renderInvoicesTab = () => {
    const adaptedProject = contractAsProject(quotation, linkedBookings);
    const currentUserWithId = currentUser ? { id: "current-user", ...currentUser } : null;
    return (
      <div style={{ padding: "24px 0" }}>
        <UnifiedInvoicesTab
          financials={contractFinancials}
          project={adaptedProject}
          currentUser={currentUserWithId}
          onRefresh={contractFinancials.refresh}
          title="Contract Invoices"
          subtitle={`Generate, track, and manage official invoices — ${quotation.quote_number} · ${quotation.customer_name}`}
        />
      </div>
    );
  };

  const renderCollectionsTab = () => {
    const adaptedProject = contractAsProject(quotation, linkedBookings);
    const currentUserWithId = currentUser ? { id: "current-user", ...currentUser } : null;
    return (
      <div style={{ padding: "24px 0" }}>
        <UnifiedCollectionsTab
          financials={contractFinancials}
          project={adaptedProject}
          currentUser={currentUserWithId}
          onRefresh={contractFinancials.refresh}
          title="Contract Collections"
          subtitle={`Track payments received from ${quotation.customer_name} — ${quotation.quote_number}`}
        />
      </div>
    );
  };

  const renderExpensesTab = () => {
    const adaptedProject = contractAsProject(quotation, linkedBookings);
    const currentUserWithId = currentUser ? { id: "current-user", ...currentUser } : null;
    return (
      <div style={{ padding: "24px 0" }}>
        <ProjectExpensesTab
          project={adaptedProject}
          currentUser={currentUserWithId}
          title="Contract Expenses"
          subtitle={`Manage, track, and approve expenses across ${linkedBookingIds.length} linked booking${linkedBookingIds.length !== 1 ? "s" : ""} — ${quotation.quote_number} · ${quotation.customer_name}`}
        />
      </div>
    );
  };

  const renderActivityTab = () => {
    // Event type → dot color mapping
    const getEventColor = (eventType: string) => {
      switch (eventType) {
        case "contract_activated": return "#059669";
        case "status_changed": return "#D97706";
        case "booking_linked": return "#3B82F6";
        case "billing_generated": return "#7C3AED";
        case "contract_renewed": return "#7C3AED";
        default: return "#6B7280";
      }
    };

    return (
      <div style={{ padding: "24px 0" }}>
        <div style={{
          borderLeft: "2px solid var(--neuron-ui-border)",
          paddingLeft: "20px",
          marginLeft: "8px",
        }}>
          {/* Always show: Contract created event (from quotation data) */}
          <div style={{ position: "relative", marginBottom: "24px" }}>
            <div style={{
              position: "absolute", left: "-27px", top: "4px",
              width: "12px", height: "12px", borderRadius: "50%",
              backgroundColor: "#0F766E", border: "2px solid white",
            }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-primary)", margin: "0 0 2px" }}>
                Contract created
              </p>
              <p style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", margin: "0 0 2px" }}>
                {formatDate(quotation.created_at)} by {quotation.created_by || "Unknown"}
              </p>
              <p style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", margin: 0 }}>
                {quotation.quotation_name || quotation.quote_number} for {quotation.customer_name}
              </p>
            </div>
          </div>

          {/* Dynamic events from activity log API */}
          {isLoadingActivity ? (
            <div style={{ padding: "12px 0", fontSize: "12px", color: "var(--neuron-ink-muted)" }}>
              Loading activity...
            </div>
          ) : activityEvents.length > 0 ? (
            [...activityEvents].reverse().map((event: any) => (
              <div key={event.id} style={{ position: "relative", marginBottom: "24px" }}>
                <div style={{
                  position: "absolute", left: "-27px", top: "4px",
                  width: "12px", height: "12px", borderRadius: "50%",
                  backgroundColor: getEventColor(event.event_type),
                  border: "2px solid white",
                }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-primary)", margin: "0 0 2px" }}>
                    {event.description}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", margin: 0 }}>
                    {formatDate(event.created_at)}{event.user && event.user !== "System" ? ` by ${event.user}` : ""}
                  </p>
                </div>
              </div>
            ))
          ) : contractStatus !== "Draft" ? (
            <div style={{ position: "relative", marginBottom: "24px" }}>
              <div style={{
                position: "absolute", left: "-27px", top: "4px",
                width: "12px", height: "12px", borderRadius: "50%",
                backgroundColor: statusStyle.text, border: "2px solid white",
              }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-primary)", margin: "0 0 2px" }}>
                  Status changed to {contractStatus}
                </p>
                <p style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", margin: 0 }}>
                  {formatDate(quotation.updated_at)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // ============================================
  // TAB STRUCTURE (mirrors ProjectDetail.tsx pattern)
  // ============================================

  const PhilippinePeso = ({ size = 24, ...props }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 11H4"/><path d="M20 7H4"/><path d="M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7"/>
    </svg>
  );

  const TAB_STRUCTURE = {
    dashboard: [
      { id: "financial_overview", label: "Financial Overview", icon: Layout },
      { id: "rate-card", label: "Rate Card", icon: FileText },
    ],
    operations: [
      { id: "bookings", label: "Bookings", icon: Briefcase },
    ],
    accounting: [
      { id: "billings", label: "Billings", icon: Receipt },
      { id: "invoices", label: "Invoices", icon: FileStack },
      { id: "collections", label: "Collections", icon: DollarSign },
      { id: "expenses", label: "Expenses", icon: TrendingUp },
    ],
    collaboration: [
      { id: "attachments", label: "Attachments", icon: Paperclip },
      { id: "comments", label: "Comments", icon: MessageSquare },
      { id: "activity", label: "Activity", icon: Clock },
    ],
  } as const;

  // Sync category when activeTab changes
  useEffect(() => {
    for (const [category, tabs] of Object.entries(TAB_STRUCTURE)) {
      if (tabs.some(t => t.id === activeTab)) {
        setActiveCategory(category as TabCategory);
        break;
      }
    }
  }, [activeTab]);

  const handleCategoryClick = (category: TabCategory) => {
    setActiveCategory(category);
    const firstTab = TAB_STRUCTURE[category][0].id as ContractTab;
    setActiveTab(firstTab);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
      {/* Top bar */}
      <div style={{
        padding: "16px 48px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-secondary)",
          }}
        >
          <ArrowLeft size={16} />
          Back to Contracts
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          {/* ✨ CONTRACTS MODULE: Activate Contract CTA — show when approved but not yet active */}
          {showActivateCTA && (
            <button
              onClick={handleActivateContract}
              disabled={isActivating}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "white",
                backgroundColor: isActivating ? "#9CA3AF" : "var(--neuron-brand-green)",
                border: "none",
                borderRadius: "6px",
                cursor: isActivating ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActivating) e.currentTarget.style.backgroundColor = "#0D5F58";
              }}
              onMouseLeave={(e) => {
                if (!isActivating) e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
              }}
            >
              <Zap size={14} />
              {isActivating ? "Activating..." : "Activate Contract"}
            </button>
          )}
          {/* ✨ PHASE 5: Renew button — only show for Active/Expiring/Expired contracts */}
          {["Active", "Expiring", "Expired"].includes(contractStatus) && (
            <button
              onClick={() => setShowRenewModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#7C3AED",
                backgroundColor: "white",
                border: "1px solid #DDD6FE",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} />
              Renew Contract
            </button>
          )}
          <button
            onClick={onEdit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-brand-green)",
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Edit3 size={14} />
            Edit Contract
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "32px 48px 0" }}>
        {/* Contract title line */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h1 style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "#12332B",
                margin: 0,
                letterSpacing: "-0.5px",
              }}>
                {quotation.quotation_name || quotation.quote_number}
              </h1>
              {/* Status badge */}
              <ContractStatusSelector
                status={contractStatus as any}
                onUpdateStatus={async (newStatus) => {
                  try {
                    const response = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/contracts/${quotation.id}/status`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${publicAnonKey}`,
                        },
                        body: JSON.stringify({
                          status: newStatus,
                          user: currentUser?.name || "Unknown",
                        }),
                      }
                    );
                    const data = await response.json();
                    if (data.success) {
                      toast.success(`Status changed to ${newStatus}`);
                      if (onUpdate) onUpdate({ ...quotation, contract_status: newStatus });
                    } else {
                      toast.error(data.error || "Failed to update status");
                    }
                  } catch (err) {
                    console.error("Error updating contract status:", err);
                    toast.error("Failed to update status");
                  }
                }}
              />
              {/* CONTRACT type badge */}
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#12332B",
                backgroundColor: "#E8F2EE",
                border: "1px solid #12332B",
                padding: "3px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Contract
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--neuron-ink-muted)", margin: 0 }}>
              {quotation.quote_number}
            </p>
          </div>
        </div>

        {/* Meta info row */}
        <div style={{
          display: "flex",
          gap: "32px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}>
          {/* Customer */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={14} style={{ color: "var(--neuron-ink-muted)" }} />
            <div>
              <p style={{ fontSize: "11px", color: "var(--neuron-ink-muted)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.3px", fontWeight: 600 }}>Customer</p>
              <p style={{ fontSize: "13px", color: "var(--neuron-ink-primary)", margin: 0, fontWeight: 500 }}>{quotation.customer_name}</p>
            </div>
          </div>

          {/* Validity */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={14} style={{ color: "var(--neuron-ink-muted)" }} />
            <div>
              <p style={{ fontSize: "11px", color: "var(--neuron-ink-muted)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.3px", fontWeight: 600 }}>Validity Period</p>
              <p style={{ fontSize: "13px", color: "var(--neuron-ink-primary)", margin: 0, fontWeight: 500 }}>
                {formatDate(quotation.contract_validity_start)} — {formatDate(quotation.contract_validity_end)}
                {daysRemaining !== null && (
                  <span style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: daysRemaining <= 0 ? "#DC2626" : daysRemaining <= 30 ? "#D97706" : "#059669",
                  }}>
                    {daysRemaining <= 0 ? "Expired" : `${daysRemaining}d remaining`}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Services */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Briefcase size={14} style={{ color: "var(--neuron-ink-muted)" }} />
            <div>
              <p style={{ fontSize: "11px", color: "var(--neuron-ink-muted)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.3px", fontWeight: 600 }}>Services</p>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {quotation.services.map((s) => (
                  <span key={s} style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#0F766E",
                    backgroundColor: "#E8F5F3",
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}>
                    {getServiceIcon(s)}
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Credit Terms */}
          {quotation.credit_terms && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={14} style={{ color: "var(--neuron-ink-muted)" }} />
              <div>
                <p style={{ fontSize: "11px", color: "var(--neuron-ink-muted)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.3px", fontWeight: 600 }}>Credit Terms</p>
                <p style={{ fontSize: "13px", color: "var(--neuron-ink-primary)", margin: 0, fontWeight: 500 }}>{quotation.credit_terms}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Tier 1: Categories */}
      <div className="px-12 bg-white flex gap-8 border-b border-[#E5E9F0]">
        {[
          { id: "dashboard", label: "Dashboard", icon: Layout },
          { id: "operations", label: "Operations", icon: Layers },
          { id: "accounting", label: "Accounting", icon: PhilippinePeso },
          { id: "collaboration", label: "Collaboration", icon: Users },
        ].map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id as TabCategory)}
              className="flex items-center gap-2 py-4 relative group"
              style={{
                color: isActive ? "#0F766E" : "#6B7280",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: "14px", fontWeight: isActive ? 600 : 500 }}>{cat.label}</span>
              {isActive && (
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  backgroundColor: "#0F766E",
                  borderRadius: "2px 2px 0 0",
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs Tier 2: Sub-tabs */}
      <div className="px-12 py-3 bg-white border-b border-[#E5E9F0] flex gap-2 overflow-x-auto min-h-[57px]">
        {TAB_STRUCTURE[activeCategory].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ContractTab)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all whitespace-nowrap"
              style={{
                backgroundColor: isActive ? "rgba(15, 118, 110, 0.05)" : "transparent",
                color: isActive ? "#0F766E" : "#6B7280",
                border: isActive ? "1px solid #0F766E" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              <Icon size={14} />
              <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 500 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: "auto", backgroundColor: "white" }}>
        {activeTab === "financial_overview" && (
          <div className="max-w-7xl mx-auto">
            <ProjectFinancialOverview financials={contractFinancials} />
          </div>
        )}
        {activeTab === "rate-card" && (
          <div style={{ padding: "0 48px" }}>{renderRateCardTab()}</div>
        )}
        {activeTab === "bookings" && (
          <div style={{ padding: "0 48px" }}>{renderBookingsTab()}</div>
        )}
        {activeTab === "billings" && (
          <div className="max-w-7xl mx-auto" style={{ padding: "0 48px" }}>{renderBillingsTab()}</div>
        )}
        {activeTab === "invoices" && (
          <div className="max-w-7xl mx-auto" style={{ padding: "0 48px" }}>{renderInvoicesTab()}</div>
        )}
        {activeTab === "collections" && (
          <div className="max-w-7xl mx-auto" style={{ padding: "0 48px" }}>{renderCollectionsTab()}</div>
        )}
        {activeTab === "expenses" && (
          <div className="max-w-7xl mx-auto" style={{ padding: "0 48px" }}>{renderExpensesTab()}</div>
        )}
        {activeTab === "attachments" && (
          <div className="max-w-7xl mx-auto">
            <EntityAttachmentsTab
              entityId={quotation.id}
              entityType="contracts"
              currentUser={currentUser}
            />
          </div>
        )}
        {activeTab === "comments" && (
          <div className="max-w-7xl mx-auto" style={{ padding: "32px 48px" }}>
            <CommentsTab
              inquiryId={quotation.id}
              currentUserId={currentUser?.email || "unknown"}
              currentUserName={currentUser?.name || "Unknown User"}
              currentUserDepartment={currentUser?.department || ""}
            />
          </div>
        )}
        {activeTab === "activity" && (
          <div style={{ padding: "0 48px" }}>{renderActivityTab()}</div>
        )}
      </div>

      {/* ✨ PHASE 5: Renewal Modal */}
      {showRenewModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            width: "440px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#12332B", margin: "0 0 4px" }}>
              Renew Contract
            </h2>
            <p style={{ fontSize: "13px", color: "var(--neuron-ink-muted)", margin: "0 0 24px" }}>
              Create a new contract from <strong>{quotation.quote_number}</strong> with updated validity dates. The current contract will be marked as "Renewed" and all rate matrices will be copied.
            </p>

            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#12332B", marginBottom: "6px" }}>
                  New Start Date
                </label>
                <input
                  type="date"
                  value={renewStart}
                  onChange={(e) => setRenewStart(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--neuron-ui-border)",
                    fontSize: "13px",
                    color: "#12332B",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#12332B", marginBottom: "6px" }}>
                  New End Date
                </label>
                <input
                  type="date"
                  value={renewEnd}
                  onChange={(e) => setRenewEnd(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--neuron-ui-border)",
                    fontSize: "13px",
                    color: "#12332B",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => { setShowRenewModal(false); setRenewStart(""); setRenewEnd(""); }}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-muted)",
                  backgroundColor: "white",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRenewContract}
                disabled={isRenewing || !renewStart || !renewEnd}
                style={{
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "white",
                  backgroundColor: isRenewing ? "#9b8fcc" : "#7C3AED",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isRenewing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <RefreshCw size={14} />
                {isRenewing ? "Renewing..." : "Renew Contract"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✨ PHASE 3: Create Booking from Contract Panel */}
      {showCreateBooking && createBookingService && (
        <CreateBookingFromContractPanel
          isOpen={showCreateBooking}
          onClose={() => { setShowCreateBooking(false); setCreateBookingService(null); }}
          contract={quotation}
          service={createBookingService}
          currentUser={currentUser ? { id: "current-user", ...currentUser } : null}
          onBookingCreated={handleBookingCreated}
        />
      )}

      {/* ✨ CONTRACT PARITY Phase 3: Booking Drill-down via ProjectBookingReadOnlyView */}
      {selectedBooking && (
        <ProjectBookingReadOnlyView
          bookingId={selectedBooking.bookingId}
          bookingType={selectedBooking.bookingType as any}
          onBack={() => setSelectedBooking(null)}
          currentUser={currentUser ? { id: "current-user", ...currentUser } : null}
          onBookingUpdated={fetchLinkedBookings}
        />
      )}
    </div>
  );
}