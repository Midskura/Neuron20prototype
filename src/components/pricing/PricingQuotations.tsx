import { Search, Plus, FileText, Briefcase, Ship, Shield, Truck, Inbox, Clock, CheckCircle, X } from "lucide-react";
import { useState, useRef } from "react";
import type { QuotationNew } from "../../types/pricing";
import { SimpleDropdown } from "../bd/SimpleDropdown";
import { MultiSelectDropdown } from "../bd/MultiSelectDropdown";

interface PricingQuotationsProps {
  onViewQuotation: (quotation: QuotationNew) => void;
  onCreateQuotation: () => void;
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
    case "Pending Pricing": return "#F59E0B";
    case "Priced": return "#8B5CF6";
    case "Needs Revision": return "#F59E0B";
    case "Accepted by Client": return "#10B981";
    case "Disapproved": return "#DC2626";
    case "Cancelled": return "#6B7280";
    default: return "#6B7280";
  }
};

// Extract TableRow as a separate component
interface TableRowProps {
  item: QuotationNew;
  index: number;
  totalItems: number;
  onItemClick: (item: QuotationNew) => void;
}

function TableRow({ item, index, totalItems, onItemClick }: TableRowProps) {
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
        {item.financial_summary?.grand_total !== undefined && item.financial_summary.grand_total > 0 ? (
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

export function PricingQuotations({ onViewQuotation, onCreateQuotation, quotations, isLoading }: PricingQuotationsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mainTab, setMainTab] = useState<"inquiries" | "quotations">("inquiries");
  const [quotationsSubTab, setQuotationsSubTab] = useState<"in-progress" | "finalized">("in-progress");
  
  // Filter states for Quotations tab only
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  // Filter quotations based on main tab
  const inquiries = (quotations || [])
    .filter(quot => quot.status === "Pending Pricing")
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

  const inProgressQuotations = (quotations || [])
    .filter(quot => quot.status === "Priced" || quot.status === "Needs Revision")
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

  const finalizedQuotations = (quotations || [])
    .filter(quot => ["Accepted by Client", "Disapproved", "Cancelled"].includes(quot.status))
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

  const displayedItems = 
    mainTab === "inquiries" 
      ? inquiries 
      : quotationsSubTab === "in-progress" 
        ? inProgressQuotations 
        : finalizedQuotations;

  const renderTableHeader = () => (
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
              Quotations
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              Price inquiries and manage quotations
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={onCreateQuotation}
            className="neuron-btn-primary"
            style={{
              height: "48px",
              padding: "0 24px",
              borderRadius: "16px",
            }}
          >
            <Plus size={20} />
            Create Quotation
          </button>
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
            placeholder="Search quotations..."
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
            marginBottom: mainTab === "quotations" ? "16px" : "24px"
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
            <Inbox size={18} />
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
              borderBottom: mainTab === "quotations" ? "2px solid #0F766E" : "2px solid transparent",
              color: mainTab === "quotations" ? "#0F766E" : "#667085",
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
            <FileText size={18} />
            Quotations
            {(inProgressQuotations.length + finalizedQuotations.length) > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: mainTab === "quotations" ? "#0F766E" : "#E8F5F3",
                  color: mainTab === "quotations" ? "#FFFFFF" : "#0F766E",
                  minWidth: "20px",
                  textAlign: "center"
                }}
              >
                {inProgressQuotations.length + finalizedQuotations.length}
              </span>
            )}
          </button>
        </div>

        {/* Quotations Sub-Tab Navigation */}
        {mainTab === "quotations" && (
          <div 
            style={{ 
              display: "flex", 
              gap: "12px", 
              marginBottom: "24px",
              paddingLeft: "8px"
            }}
          >
            {/* In Progress Sub-Tab */}
            <button
              onClick={() => setQuotationsSubTab("in-progress")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: quotationsSubTab === "in-progress" ? "#8B5CF615" : "transparent",
                border: quotationsSubTab === "in-progress" ? "1px solid #8B5CF6" : "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                color: quotationsSubTab === "in-progress" ? "#8B5CF6" : "#667085",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Clock size={16} />
              In Progress
              {inProgressQuotations.length > 0 && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: quotationsSubTab === "in-progress" ? "#8B5CF6" : "#8B5CF615",
                    color: quotationsSubTab === "in-progress" ? "#FFFFFF" : "#8B5CF6",
                    minWidth: "16px",
                    textAlign: "center"
                  }}
                >
                  {inProgressQuotations.length}
                </span>
              )}
            </button>

            {/* Finalized Sub-Tab */}
            <button
              onClick={() => setQuotationsSubTab("finalized")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: quotationsSubTab === "finalized" ? "#10B98115" : "transparent",
                border: quotationsSubTab === "finalized" ? "1px solid #10B981" : "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                color: quotationsSubTab === "finalized" ? "#10B981" : "#667085",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <CheckCircle size={16} />
              Finalized
              {finalizedQuotations.length > 0 && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: quotationsSubTab === "finalized" ? "#10B981" : "#10B98115",
                    color: quotationsSubTab === "finalized" ? "#FFFFFF" : "#10B981",
                    minWidth: "16px",
                    textAlign: "center"
                  }}
                >
                  {finalizedQuotations.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Table */}
        {displayedItems.length > 0 ? (
          <div 
            className="rounded-lg overflow-hidden"
            style={{ 
              background: "#FFFFFF",
              border: "1px solid var(--neuron-ui-border)",
            }}
          >
            {renderTableHeader()}
            {displayedItems.map((item, index) => (
              <TableRow
                key={item.id}
                item={item}
                index={index}
                totalItems={displayedItems.length}
                onItemClick={onViewQuotation}
              />
            ))}
          </div>
        ) : (
          renderEmptyState(
            mainTab === "inquiries" 
              ? "No incoming inquiries from BD" 
              : quotationsSubTab === "in-progress"
                ? "No quotations in progress"
                : "No finalized quotations"
          )
        )}
      </div>
    </div>
  );
}