import { Search, Plus, FileText, Eye, ChevronDown, ChevronUp, AlertCircle, Filter, X, ArrowRight, SlidersHorizontal, MessageSquare, DollarSign, Briefcase, Ship, Shield, Truck, Layers, Inbox, Calendar, Handshake } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { QuotationNew, QuotationStatus, QuotationType } from "../../types/pricing";
import { CustomDropdown } from "../bd/CustomDropdown";
import { MultiSelectDropdown } from "../bd/MultiSelectDropdown";
import { CreateQuotationMenu } from "./CreateQuotationMenu";
import { QuotationTypeIcon, QuotationTypeSubLabel, getQuotationTypeAccentStyle } from "./QuotationTypeIcons";

interface QuotationsListProps {
  onViewQuotation: (quotation: QuotationNew) => void;
  onCreateQuotation: (quotationType: QuotationType) => void;
  department?: "BD" | "Pricing";
  quotations?: QuotationNew[];
  isLoading?: boolean;
}

type CombinedStatus = "All" | "Inquiry" | QuotationStatus;

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
    case "Ongoing": return "#F59E0B";
    case "Waiting Approval": return "#C88A2B";
    case "Approved": return "#0F766E";
    case "Disapproved": return "#DC2626";
    case "Cancelled": return "#6B7280";
    default: return "#6B7280";
  }
};

// Combine and transform inquiries and quotations into a unified format
type CombinedItem = {
  id: string;
  number: string;
  name?: string;
  customer_name: string;
  contact_person?: string;
  origin: string;
  destination: string;
  services: string[];
  total?: number;
  currency?: string;
  created_at: string;
  status: string;
  type: "inquiry" | "quotation";
  rawData: QuotationNew;
};

// Extract TableRow as a separate component to fix hooks violation
interface TableRowProps {
  item: CombinedItem;
  index: number;
  totalItems: number;
  onItemClick: (item: CombinedItem) => void;
}

function TableRow({ item, index, totalItems, onItemClick }: TableRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const hasMultipleServices = item.services.length > 1;

  // ✨ CONTRACT: Access quotation type from raw data
  const quotationType = item.rawData.quotation_type;
  const isContract = quotationType === "contract";

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
        borderBottom: index < totalItems - 1 ? "1px solid var(--neuron-ui-divider)" : "none",
        ...getQuotationTypeAccentStyle(quotationType),
      }}
      onClick={() => onItemClick(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Icon Column — type-aware */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center"
        }}
      >
        <QuotationTypeIcon type={quotationType} size={16} />
      </div>

      {/* Number Column with type sub-label */}
      <div>
        <p style={{ 
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--neuron-ink-primary)",
          marginBottom: "0",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {item.name || item.number}
        </p>
        <QuotationTypeSubLabel quoteNumber={item.number} type={quotationType} />
      </div>

      {/* Customer Column */}
      <div>
        <p style={{ 
          fontSize: "13px",
          color: "var(--neuron-ink-primary)"
        }}>
          {item.customer_name}
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
        
        {/* Tooltip for multiple services - Fixed positioning */}
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

      {/* Total Column — adaptive (total for projects, validity for contracts) */}
      <div>
        {isContract ? (
          <p style={{
            fontSize: "12px",
            color: "var(--neuron-ink-muted)",
          }}>
            {item.rawData.contract_validity_start && item.rawData.contract_validity_end
              ? `${formatDate(item.rawData.contract_validity_start)} - ${formatDate(item.rawData.contract_validity_end)}`
              : "No validity"
            }
          </p>
        ) : item.total !== undefined ? (
          <p style={{ 
            fontSize: "13px",
            color: "var(--neuron-ink-muted)"
          }}>
            {item.currency} {item.total.toLocaleString()}
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
            background: `${getStatusColor(item.status as any)}15`,
            color: getStatusColor(item.status as any),
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

export function QuotationsList({ onViewQuotation, onCreateQuotation, department, quotations, isLoading }: QuotationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "completed">("all");
  
  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  // Combine and transform
  const combinedItems: CombinedItem[] = (quotations || []).map(quot => {
    const needsPricing = quot.status === "Draft" || quot.status === "Pending Pricing";
    
    return {
      id: quot.id,
      number: quot.quote_number,
      name: quot.quotation_name,
      customer_name: quot.customer_company || quot.customer_name,
      origin: quot.pol_aol,
      destination: quot.pod_aod,
      services: quot.services,
      total: quot.financial_summary?.grand_total,
      currency: quot.currency,
      created_at: quot.created_at,
      status: quot.status,
      type: needsPricing ? "inquiry" : "quotation",
      rawData: quot
    };
  });

  // Filter by search
  const filteredItems = combinedItems.filter(item => {
    // Search filter
    if (searchQuery) {
      const matchesSearch = 
        item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.destination.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      if (!selectedStatuses.includes(item.status)) return false;
    }

    // Customer filter
    if (selectedCustomers.length > 0) {
      if (!selectedCustomers.includes(item.customer_name)) return false;
    }

    // Service filter
    if (selectedServices.length > 0) {
      const hasService = item.services.some(service => selectedServices.includes(service));
      if (!hasService) return false;
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const itemDate = new Date(item.created_at);
      const [start, end] = dateRangeFilter.split(" to ");
      if (start && itemDate < new Date(start)) return false;
      if (end && itemDate > new Date(end)) return false;
    }

    return true;
  });

  // Get unique customers and services for filter options
  const allCustomers = Array.from(new Set(combinedItems.map(item => item.customer_name))).sort();
  const allServices = Array.from(new Set(combinedItems.flatMap(item => item.services))).sort();
  const allStatuses = ["Ongoing", "Waiting Approval", "Approved", "Disapproved", "Cancelled"];

  // Create service options with icons
  const serviceOptions = allServices.map(service => ({
    value: service,
    label: service,
    icon: getServiceIcon(service)
  }));

  // Count active filters
  const activeFilterCount = 
    selectedStatuses.length + 
    selectedCustomers.length + 
    selectedServices.length + 
    (dateRangeFilter !== "all" ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedCustomers([]);
    setSelectedServices([]);
    setDateRangeFilter("all");
  };

  // Remove individual filter
  const removeStatusFilter = (status: string) => {
    setSelectedStatuses(selectedStatuses.filter(s => s !== status));
  };

  const removeCustomerFilter = (customer: string) => {
    setSelectedCustomers(selectedCustomers.filter(c => c !== customer));
  };

  const removeServiceFilter = (service: string) => {
    setSelectedServices(selectedServices.filter(s => s !== service));
  };

  const removeDateFilter = () => {
    setDateRangeFilter("all");
  };

  // Toggle filter selections
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const toggleCustomer = (customer: string) => {
    if (selectedCustomers.includes(customer)) {
      setSelectedCustomers(selectedCustomers.filter(c => c !== customer));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Organize into sections based on status
  const completed = filteredItems
    .filter(item => ["Approved", "Disapproved"].includes(item.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Active items - Ongoing only
  const active = filteredItems
    .filter(item => item.status === "Ongoing")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pending items - Waiting Approval only
  const pending = filteredItems
    .filter(item => item.status === "Waiting Approval")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleItemClick = (item: CombinedItem) => {
    // Unified handling - both inquiries and quotations open in QuotationDetail
    onViewQuotation(item.rawData);
  };

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
        Service Types
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
              Manage quotations from BD
            </p>
          </div>

          {/* Create Button */}
          <CreateQuotationMenu
            onSelect={onCreateQuotation}
            buttonText="Create Quotation"
          />
        </div>

        {/* Filters Row - Dropdown Style like Budget Requests */}
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "16px" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 300px", minWidth: "250px" }}>
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

          {/* Date Range Filter */}
          <div style={{ flex: "0 1 180px" }}>
            <CustomDropdown
              value={dateRangeFilter}
              onChange={(value) => setDateRangeFilter(value)}
              options={[
                { value: "all", label: "All Time", icon: <Calendar size={16} /> },
                { value: "today", label: "Today", icon: <Calendar size={16} /> },
                { value: "this-week", label: "This Week", icon: <Calendar size={16} /> },
                { value: "this-month", label: "This Month", icon: <Calendar size={16} /> },
                { value: "last-30-days", label: "Last 30 Days", icon: <Calendar size={16} /> },
              ]}
              placeholder="Date Range"
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: "0 1 200px" }}>
            <MultiSelectDropdown
              values={selectedStatuses}
              onChange={setSelectedStatuses}
              options={allStatuses}
              placeholder="All Statuses"
            />
          </div>

          {/* Service Type Filter */}
          <div style={{ flex: "0 1 200px" }}>
            <MultiSelectDropdown
              values={selectedServices}
              onChange={setSelectedServices}
              options={serviceOptions}
              placeholder="All Services"
            />
          </div>

          {/* Customer Filter */}
          <div style={{ flex: "0 1 200px" }}>
            <MultiSelectDropdown
              values={selectedCustomers}
              onChange={setSelectedCustomers}
              options={allCustomers}
              placeholder="All Customers"
            />
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#667085",
                backgroundColor: "#F9FAFB",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
            >
              <X size={14} />
              Clear All
            </button>
          )}
        </div>

        {/* TAB NAVIGATION */}
        <div 
          style={{ 
            display: "flex", 
            gap: "8px", 
            borderBottom: "1px solid var(--neuron-ui-divider)",
            marginBottom: "32px"
          }}
        >
          {/* All Tab */}
          <button
            onClick={() => setActiveTab("all")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "all" ? "2px solid #12332B" : "2px solid transparent",
              color: activeTab === "all" ? "#12332B" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "all") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "all") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <SlidersHorizontal size={18} />
            All
          </button>

          {/* Active Tab */}
          <button
            onClick={() => setActiveTab("active")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "active" ? "2px solid #9333EA" : "2px solid transparent",
              color: activeTab === "active" ? "#9333EA" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "active") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "active") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <Inbox size={18} />
            Active
            {(active.length) > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: activeTab === "active" ? "#9333EA" : "#9333EA15",
                  color: activeTab === "active" ? "#FFFFFF" : "#9333EA",
                  minWidth: "20px",
                  textAlign: "center"
                }}
              >
                {active.length}
              </span>
            )}
          </button>

          {/* Pending Tab */}
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "pending" ? "2px solid #C88A2B" : "2px solid transparent",
              color: activeTab === "pending" ? "#C88A2B" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "pending") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "pending") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <AlertCircle size={18} />
            Pending
            {(pending.length) > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: activeTab === "pending" ? "#C88A2B" : "#C88A2B15",
                  color: activeTab === "pending" ? "#FFFFFF" : "#C88A2B",
                  minWidth: "20px",
                  textAlign: "center"
                }}
              >
                {pending.length}
              </span>
            )}
          </button>

          {/* Completed Tab */}
          <button
            onClick={() => setActiveTab("completed")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "completed" ? "2px solid #0F766E" : "2px solid transparent",
              color: activeTab === "completed" ? "#0F766E" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "completed") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "completed") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <FileText size={18} />
            Completed
            {(completed.length) > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: activeTab === "completed" ? "#0F766E" : "#E8F5F3",
                  color: activeTab === "completed" ? "#FFFFFF" : "#0F766E",
                  minWidth: "20px",
                  textAlign: "center"
                }}
              >
                {completed.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB CONTENT - ALL TAB */}
        {activeTab === "all" && (
          <div>
            <div 
              className="rounded-lg overflow-hidden"
              style={{ 
                background: "#FFFFFF",
                border: "1px solid var(--neuron-ui-border)",
                position: "relative"
              }}
            >
              {renderTableHeader()}
              <div style={{ position: "relative", overflow: "visible" }}>
                {filteredItems.length === 0 ? (
                  renderEmptyState("No quotations found")
                ) : (
                  filteredItems
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((item, index) => 
                      <TableRow 
                        key={item.id}
                        item={item} 
                        index={index} 
                        totalItems={filteredItems.length}
                        onItemClick={handleItemClick}
                      />
                    )
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT - ACTIVE TAB */}
        {activeTab === "active" && (
          <div>
            <div 
              className="rounded-lg overflow-hidden"
              style={{ 
                background: "#FFFFFF",
                border: "1.5px solid #9333EA20",
                position: "relative"
              }}
            >
              {renderTableHeader()}
              <div style={{ position: "relative", overflow: "visible" }}>
                {active.length === 0 ? (
                  renderEmptyState("No pending inquiries")
                ) : (
                  active.map((item, index) => 
                    <TableRow 
                      key={item.id}
                      item={item} 
                      index={index} 
                      totalItems={active.length}
                      onItemClick={handleItemClick}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT - PENDING TAB */}
        {activeTab === "pending" && (
          <div>
            <div 
              className="rounded-lg overflow-hidden"
              style={{ 
                background: "#FFFFFF",
                border: "1.5px solid #C88A2B20",
                position: "relative"
              }}
            >
              {renderTableHeader()}
              <div style={{ position: "relative", overflow: "visible" }}>
                {pending.length === 0 ? (
                  renderEmptyState("No pending quotations")
                ) : (
                  pending.map((item, index) => 
                    <TableRow 
                      key={item.id}
                      item={item} 
                      index={index} 
                      totalItems={pending.length}
                      onItemClick={handleItemClick}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT - COMPLETED TAB */}
        {activeTab === "completed" && (
          <div>
            <div 
              className="rounded-lg overflow-hidden"
              style={{ 
                background: "#FFFFFF",
                border: "1px solid var(--neuron-ui-border)",
                position: "relative"
              }}
            >
              {renderTableHeader()}
              <div style={{ position: "relative", overflow: "visible" }}>
                {completed.length === 0 ? (
                  renderEmptyState("No completed quotations")
                ) : (
                  completed.map((item, index) => 
                    <TableRow 
                      key={item.id}
                      item={item} 
                      index={index} 
                      totalItems={completed.length}
                      onItemClick={handleItemClick}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}