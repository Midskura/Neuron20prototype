import { Search, Plus, FileText, Briefcase, Ship, Shield, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import type { QuotationNew } from "../../types/pricing";

interface InquiriesModuleProps {
  onViewItem: (item: QuotationNew) => void;
  onCreateInquiry: () => void;
  quotations?: QuotationNew[];
  isLoading?: boolean;
}

// Get service icon based on service type
const getServiceIcon = (service: string) => {
  switch (service) {
    case "Brokerage":
      return <Briefcase size={16} style={{ color: "#667085" }} />;
    case "Forwarding":
      return <Ship size={16} style={{ color: "#667085" }} />;
    case "Marine Insurance":
      return <Shield size={16} style={{ color: "#667085" }} />;
    case "Trucking":
      return <Truck size={16} style={{ color: "#667085" }} />;
    default:
      return <FileText size={16} style={{ color: "#667085" }} />;
  }
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case "Draft": return "#6B7280";
    case "Pending Pricing": return "#F59E0B";
    case "Priced": return "#8B5CF6";
    case "Sent to Client": return "#3B82F6";
    case "Accepted by Client": return "#10B981";
    case "Rejected by Client": return "#EF4444";
    case "Needs Revision": return "#F59E0B";
    case "Disapproved": return "#DC2626";
    case "Cancelled": return "#6B7280";
    default: return "#6B7280";
  }
};

// Extract TableRow as a separate component for Inquiries tab
interface InquiryTableRowProps {
  item: QuotationNew;
  index: number;
  totalItems: number;
  onItemClick: (item: QuotationNew) => void;
}

function InquiryTableRow({ item, index, totalItems, onItemClick }: InquiryTableRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const hasMultipleServices = item.services.length > 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
      setShowTooltip(true);
    }
  };

  return (
    <div
      className="grid gap-3 px-4 py-3 transition-colors cursor-pointer"
      style={{ 
        gridTemplateColumns: "40px 120px 1fr 100px 100px 140px",
        borderBottom: index < totalItems - 1 ? "1px solid var(--neuron-ui-divider)" : "none"
      }}
      onClick={() => onItemClick(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Icon Column */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center"
        }}
      >
        <FileText size={16} style={{ color: "#667085" }} />
      </div>

      {/* Number Column */}
      <div>
        <p style={{ 
          fontSize: "13px",
          color: "var(--neuron-ink-primary)"
        }}>
          {item.quote_number}
        </p>
      </div>

      {/* Customer Column */}
      <div>
        <p style={{ 
          fontSize: "13px",
          color: "var(--neuron-ink-primary)"
        }}>
          {item.customer_company || item.customer_name}
        </p>
      </div>

      {/* Service Types Column - Icons with Badge */}
      <div 
        ref={iconRef}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          position: "relative",
          gap: "4px"
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Primary Service Icon */}
        {getServiceIcon(item.services[0])}
        
        {/* Badge for additional services */}
        {hasMultipleServices && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#0F766E",
              backgroundColor: "#E8F5F3",
              padding: "2px 5px",
              borderRadius: "4px",
              lineHeight: "1"
            }}
          >
            +{item.services.length - 1}
          </span>
        )}
        
        {/* Tooltip for multiple services */}
        {hasMultipleServices && showTooltip && (
          <div
            style={{
              position: "fixed",
              top: `${tooltipPosition.y}px`,
              left: `${tooltipPosition.x}px`,
              transform: "translate(-50%, -100%)",
              backgroundColor: "#12332B",
              color: "#FFFFFF",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              zIndex: 9999,
              pointerEvents: "none",
              boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)"
            }}
          >
            {item.services.join(", ")}
            {/* Tooltip arrow */}
            <div
              style={{
                position: "absolute",
                bottom: "-4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid #12332B"
              }}
            />
          </div>
        )}
      </div>

      {/* Date Column */}
      <div>
        <p style={{ 
          fontSize: "12px",
          color: "var(--neuron-ink-muted)"
        }}>
          {formatDate(item.created_at)}
        </p>
      </div>

      {/* Status Column */}
      <div>
        <span 
          className="px-2 py-0.5 rounded-full text-[11px] inline-block"
          style={{ 
            background: `${getStatusColor(item.status)}15`,
            color: getStatusColor(item.status),
            fontWeight: 500,
            whiteSpace: "nowrap"
          }}
        >
          {item.status}
        </span>
      </div>
    </div>
  );
}

// Extract TableRow for Quotations tab
interface QuotationTableRowProps {
  item: QuotationNew;
  index: number;
  totalItems: number;
  onItemClick: (item: QuotationNew) => void;
}

function QuotationTableRow({ item, index, totalItems, onItemClick }: QuotationTableRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const hasMultipleServices = item.services.length > 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
      setShowTooltip(true);
    }
  };

  return (
    <div
      className="grid gap-3 px-4 py-3 transition-colors cursor-pointer"
      style={{ 
        gridTemplateColumns: "40px 120px 1fr 100px 110px 100px 140px",
        borderBottom: index < totalItems - 1 ? "1px solid var(--neuron-ui-divider)" : "none"
      }}
      onClick={() => onItemClick(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Icon Column */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center"
        }}
      >
        <FileText size={16} style={{ color: "#667085" }} />
      </div>

      {/* Number Column */}
      <div>
        <p style={{ 
          fontSize: "13px",
          color: "var(--neuron-ink-primary)"
        }}>
          {item.quote_number}
        </p>
      </div>

      {/* Customer Column */}
      <div>
        <p style={{ 
          fontSize: "13px",
          color: "var(--neuron-ink-primary)"
        }}>
          {item.customer_company || item.customer_name}
        </p>
      </div>

      {/* Service Types Column - Icons with Badge */}
      <div 
        ref={iconRef}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          position: "relative",
          gap: "4px"
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Primary Service Icon */}
        {getServiceIcon(item.services[0])}
        
        {/* Badge for additional services */}
        {hasMultipleServices && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#0F766E",
              backgroundColor: "#E8F5F3",
              padding: "2px 5px",
              borderRadius: "4px",
              lineHeight: "1"
            }}
          >
            +{item.services.length - 1}
          </span>
        )}
        
        {/* Tooltip for multiple services */}
        {hasMultipleServices && showTooltip && (
          <div
            style={{
              position: "fixed",
              top: `${tooltipPosition.y}px`,
              left: `${tooltipPosition.x}px`,
              transform: "translate(-50%, -100%)",
              backgroundColor: "#12332B",
              color: "#FFFFFF",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              zIndex: 9999,
              pointerEvents: "none",
              boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)"
            }}
          >
            {item.services.join(", ")}
            {/* Tooltip arrow */}
            <div
              style={{
                position: "absolute",
                bottom: "-4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid #12332B"
              }}
            />
          </div>
        )}
      </div>

      {/* Total Column */}
      <div>
        {item.financial_summary?.grand_total !== undefined ? (
          <p style={{ 
            fontSize: "13px",
            color: "var(--neuron-ink-muted)"
          }}>
            {item.currency} {item.financial_summary.grand_total.toLocaleString()}
          </p>
        ) : (
          <p style={{ 
            fontSize: "12px",
            color: "var(--neuron-ink-muted)",
            fontStyle: "italic"
          }}>
            Pending
          </p>
        )}
      </div>

      {/* Date Column */}
      <div>
        <p style={{ 
          fontSize: "12px",
          color: "var(--neuron-ink-muted)"
        }}>
          {formatDate(item.created_at)}
        </p>
      </div>

      {/* Status Column */}
      <div>
        <span 
          className="px-2 py-0.5 rounded-full text-[11px] inline-block"
          style={{ 
            background: `${getStatusColor(item.status)}15`,
            color: getStatusColor(item.status),
            fontWeight: 500,
            whiteSpace: "nowrap"
          }}
        >
          {item.status}
        </span>
      </div>
    </div>
  );
}

export function InquiriesModule({ onViewItem, onCreateInquiry, quotations, isLoading }: InquiriesModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mainTab, setMainTab] = useState<"inquiries" | "quotations">("inquiries");
  const [quotationsSubTab, setQuotationsSubTab] = useState<"active" | "closed">("active");

  // Filter for Inquiries tab (Draft + Pending Pricing)
  const inquiries = (quotations || [])
    .filter(quot => quot.status === "Draft" || quot.status === "Pending Pricing")
    .filter(item => {
      if (!searchQuery) return true;
      
      const matchesSearch = 
        item.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.customer_company || item.customer_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pol_aol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pod_aod.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Separate inquiries by status
  const draftInquiries = inquiries.filter(item => item.status === "Draft");
  const pendingInquiries = inquiries.filter(item => item.status === "Pending Pricing");

  // Filter for Quotations tab (Priced onwards)
  const quotationsList = (quotations || [])
    .filter(quot => {
      const validStatuses = ["Priced", "Sent to Client", "Accepted by Client", "Rejected by Client", "Needs Revision", "Disapproved", "Cancelled"];
      return validStatuses.includes(quot.status);
    })
    .filter(item => {
      if (!searchQuery) return true;
      
      const matchesSearch = 
        item.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.customer_company || item.customer_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pol_aol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pod_aod.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Separate quotations by active vs closed
  const activeQuotations = quotationsList.filter(item => 
    ["Priced", "Sent to Client", "Needs Revision"].includes(item.status)
  );
  
  const closedQuotations = quotationsList.filter(item => 
    ["Accepted by Client", "Rejected by Client", "Disapproved", "Cancelled"].includes(item.status)
  );

  const displayedQuotations = quotationsSubTab === "active" ? activeQuotations : closedQuotations;

  const renderInquiryTableHeader = () => (
    <div 
      className="grid gap-3 px-4 py-2.5"
      style={{ 
        gridTemplateColumns: "40px 120px 1fr 100px 100px 140px",
        borderBottom: "1px solid var(--neuron-ui-divider)",
        background: "#FFFFFF"
      }}
    >
      <div></div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Number
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Customer
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Services
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Date
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Status
      </div>
    </div>
  );

  const renderQuotationTableHeader = () => (
    <div 
      className="grid gap-3 px-4 py-2.5"
      style={{ 
        gridTemplateColumns: "40px 120px 1fr 100px 110px 100px 140px",
        borderBottom: "1px solid var(--neuron-ui-divider)",
        background: "#FFFFFF"
      }}
    >
      <div></div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Number
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Customer
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Services
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Total
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Date
      </div>
      <div style={{ 
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--neuron-ink-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Status
      </div>
    </div>
  );

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center py-12">
      <FileText size={40} style={{ color: "var(--neuron-ink-muted)", marginBottom: "12px" }} />
      <p style={{ 
        fontSize: "14px",
        color: "var(--neuron-ink-muted)"
      }}>
        {message}
      </p>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-auto" style={{ background: "#FFFFFF" }}>
      <div style={{ padding: "32px 48px" }}>
        {/* Header */}
        <div 
          className="flex items-center justify-between"
          style={{
            marginBottom: "32px"
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#12332B", marginBottom: "4px", letterSpacing: "-1.2px" }}>
              Inquiries
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              {mainTab === "inquiries" 
                ? "Create and submit inquiries to Pricing Department"
                : "View priced quotations and update client status"
              }
            </p>
          </div>

          {/* Create Button - only show on Inquiries tab */}
          {mainTab === "inquiries" && (
            <button
              onClick={onCreateInquiry}
              className="neuron-btn-primary"
              style={{
                height: "48px",
                padding: "0 24px",
                borderRadius: "16px",
              }}
            >
              <Plus size={20} />
              Create Inquiry
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#667085",
            }}
          />
          <input
            type="text"
            placeholder={mainTab === "inquiries" ? "Search inquiries..." : "Search quotations..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "var(--neuron-ink-primary)",
              backgroundColor: "#FFFFFF",
            }}
          />
        </div>

        {/* Main Tab Navigation */}
        <div 
          style={{ 
            display: "flex", 
            gap: "8px", 
            borderBottom: "1px solid var(--neuron-ui-divider)",
            marginBottom: "24px"
          }}
        >
          {/* Inquiries Tab */}
          <button
            onClick={() => setMainTab("inquiries")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: mainTab === "inquiries" ? "2px solid #F59E0B" : "2px solid transparent",
              color: mainTab === "inquiries" ? "#F59E0B" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (mainTab !== "inquiries") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (mainTab !== "inquiries") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <AlertCircle size={18} />
            Inquiries
            {inquiries.length > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: mainTab === "inquiries" ? "#F59E0B" : "#F59E0B15",
                  color: mainTab === "inquiries" ? "#FFFFFF" : "#F59E0B",
                  minWidth: "20px",
                  textAlign: "center"
                }}
              >
                {inquiries.length}
              </span>
            )}
          </button>

          {/* Quotations Tab */}
          <button
            onClick={() => setMainTab("quotations")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: mainTab === "quotations" ? "2px solid #8B5CF6" : "2px solid transparent",
              color: mainTab === "quotations" ? "#8B5CF6" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (mainTab !== "quotations") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (mainTab !== "quotations") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <CheckCircle size={18} />
            Quotations
            {quotationsList.length > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: mainTab === "quotations" ? "#8B5CF6" : "#8B5CF615",
                  color: mainTab === "quotations" ? "#FFFFFF" : "#8B5CF6",
                  minWidth: "20px",
                  textAlign: "center"
                }}
              >
                {quotationsList.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        {mainTab === "inquiries" ? (
          <>
            {/* Draft Inquiries Section */}
            {draftInquiries.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px"
                }}>
                  <h2 style={{ 
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#12332B"
                  }}>
                    Draft
                  </h2>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#6B728015",
                      color: "#6B7280",
                      minWidth: "20px",
                      textAlign: "center"
                    }}
                  >
                    {draftInquiries.length}
                  </span>
                </div>
                <div 
                  className="rounded-lg overflow-hidden"
                  style={{ 
                    background: "#FFFFFF",
                    border: "1px solid var(--neuron-ui-border)",
                  }}
                >
                  {renderInquiryTableHeader()}
                  {draftInquiries.map((inquiry, index) => (
                    <InquiryTableRow
                      key={inquiry.id}
                      item={inquiry}
                      index={index}
                      totalItems={draftInquiries.length}
                      onItemClick={onViewItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Pricing Section */}
            {pendingInquiries.length > 0 && (
              <div>
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px"
                }}>
                  <h2 style={{ 
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#12332B"
                  }}>
                    Pending Pricing
                  </h2>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#F59E0B15",
                      color: "#F59E0B",
                      minWidth: "20px",
                      textAlign: "center"
                    }}
                  >
                    {pendingInquiries.length}
                  </span>
                </div>
                <div 
                  className="rounded-lg overflow-hidden"
                  style={{ 
                    background: "#FFFFFF",
                    border: "1px solid var(--neuron-ui-border)",
                  }}
                >
                  {renderInquiryTableHeader()}
                  {pendingInquiries.map((inquiry, index) => (
                    <InquiryTableRow
                      key={inquiry.id}
                      item={inquiry}
                      index={index}
                      totalItems={pendingInquiries.length}
                      onItemClick={onViewItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {inquiries.length === 0 && renderEmptyState("No inquiries found")}
          </>
        ) : (
          <>
            {/* Sub-tabs for Quotations */}
            <div 
              style={{ 
                display: "flex", 
                gap: "8px", 
                borderBottom: "1px solid var(--neuron-ui-divider)",
                marginBottom: "24px"
              }}
            >
              {/* Active Sub-tab */}
              <button
                onClick={() => setQuotationsSubTab("active")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  background: "transparent",
                  border: "none",
                  borderBottom: quotationsSubTab === "active" ? "2px solid #8B5CF6" : "2px solid transparent",
                  color: quotationsSubTab === "active" ? "#8B5CF6" : "#667085",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginBottom: "-1px"
                }}
                onMouseEnter={(e) => {
                  if (quotationsSubTab !== "active") {
                    e.currentTarget.style.color = "#12332B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (quotationsSubTab !== "active") {
                    e.currentTarget.style.color = "#667085";
                  }
                }}
              >
                <AlertCircle size={18} />
                Active
                {activeQuotations.length > 0 && (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: quotationsSubTab === "active" ? "#8B5CF6" : "#8B5CF615",
                      color: quotationsSubTab === "active" ? "#FFFFFF" : "#8B5CF6",
                      minWidth: "20px",
                      textAlign: "center"
                    }}
                  >
                    {activeQuotations.length}
                  </span>
                )}
              </button>

              {/* Closed Sub-tab */}
              <button
                onClick={() => setQuotationsSubTab("closed")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  background: "transparent",
                  border: "none",
                  borderBottom: quotationsSubTab === "closed" ? "2px solid #6B7280" : "2px solid transparent",
                  color: quotationsSubTab === "closed" ? "#6B7280" : "#667085",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginBottom: "-1px"
                }}
                onMouseEnter={(e) => {
                  if (quotationsSubTab !== "closed") {
                    e.currentTarget.style.color = "#12332B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (quotationsSubTab !== "closed") {
                    e.currentTarget.style.color = "#667085";
                  }
                }}
              >
                <CheckCircle size={18} />
                Closed
                {closedQuotations.length > 0 && (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: quotationsSubTab === "closed" ? "#6B7280" : "#6B728015",
                      color: quotationsSubTab === "closed" ? "#FFFFFF" : "#6B7280",
                      minWidth: "20px",
                      textAlign: "center"
                    }}
                  >
                    {closedQuotations.length}
                  </span>
                )}
              </button>
            </div>

            {/* Table */}
            {displayedQuotations.length > 0 ? (
              <div 
                className="rounded-lg overflow-hidden"
                style={{ 
                  background: "#FFFFFF",
                  border: "1px solid var(--neuron-ui-border)",
                }}
              >
                {renderQuotationTableHeader()}
                {displayedQuotations.map((quotation, index) => (
                  <QuotationTableRow
                    key={quotation.id}
                    item={quotation}
                    index={index}
                    totalItems={displayedQuotations.length}
                    onItemClick={onViewItem}
                  />
                ))}
              </div>
            ) : (
              renderEmptyState(`No ${quotationsSubTab} quotations found`)
            )}
          </>
        )}
      </div>
    </div>
  );
}