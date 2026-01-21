import { Search, Plus, FileText, Briefcase, Ship, Shield, Truck, ChevronDown, SlidersHorizontal, Calendar, CircleDot, Building2 } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import type { QuotationNew } from "../../types/pricing";
import { CustomDropdown } from "../bd/CustomDropdown";

// Default column widths
const DEFAULT_COLUMN_WIDTHS = {
  icon: 40,
  name: 220,
  customer: 220,
  services: 120,
  total: 100,
  date: 95,
  status: 115
};

// Minimum column widths to prevent collapse
const MIN_COLUMN_WIDTHS = {
  icon: 40,
  name: 150,
  customer: 140,
  services: 90,
  total: 80,
  date: 80,
  status: 90
};

interface QuotationsListWithFiltersProps {
  onViewItem: (item: QuotationNew) => void;
  onCreateQuotation: () => void;
  quotations?: QuotationNew[];
  isLoading?: boolean;
  userDepartment?: "BD" | "PD";
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
    case "Quotation": return "#8B5CF6";
    case "Approved": return "#10B981";
    case "Disapproved": return "#EF4444";
    case "Cancelled": return "#6B7280";
    default: return "#6B7280";
  }
};

// Status badge background color
const getStatusBgColor = (status: string): string => {
  switch (status) {
    case "Draft": return "#F3F4F6";
    case "Pending Pricing": return "#FEF3C7";
    case "Quotation": return "#EDE9FE";
    case "Approved": return "#D1FAE5";
    case "Disapproved": return "#FEE2E2";
    case "Cancelled": return "#F3F4F6";
    default: return "#F3F4F6";
  }
};

interface QuotationTableRowProps {
  item: QuotationNew;
  index: number;
  totalItems: number;
  onItemClick: (item: QuotationNew) => void;
  gridTemplateColumns: string;
  showStatus?: boolean;
}

function QuotationTableRow({ item, index, totalItems, onItemClick, gridTemplateColumns, showStatus }: QuotationTableRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
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

  const handleNameMouseEnter = () => {
    if (nameRef.current) {
      const rect = nameRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
      setShowNameTooltip(true);
    }
  };

  // Calculate total (sum of all line items)
  const total = item.charge_categories?.reduce((sum, category) => {
    const categoryTotal = category.line_items?.reduce((lineSum, lineItem) => {
      return lineSum + (lineItem.total || 0);
    }, 0) || 0;
    return sum + categoryTotal;
  }, 0) || 0;

  return (
    <div
      className="grid transition-colors cursor-pointer"
      style={{ 
        gridTemplateColumns: gridTemplateColumns,
        gap: "12px",
        padding: "10px 16px",
        borderBottom: "none",
        backgroundColor: index % 2 === 0 ? "white" : "#FAFBFC",
        position: "relative"
      }}
      onClick={() => onItemClick(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#F3F4F6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#FAFBFC";
      }}
    >
      {/* Icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FileText size={16} style={{ color: "#0F766E" }} />
      </div>

      {/* Quotation Name with Hover Tooltip and Ellipsis */}
      <div 
        ref={nameRef}
        style={{ display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}
        onMouseEnter={handleNameMouseEnter}
        onMouseLeave={() => setShowNameTooltip(false)}
      >
        <span style={{ 
          fontSize: "13px", 
          color: "#111827",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: 500
        }}>
          {item.quotation_name || "Untitled"}
        </span>
        <span style={{ 
          fontSize: "12px", 
          color: "#9CA3AF",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginTop: "2px"
        }}>
          {item.quote_number}
        </span>
      </div>

      {/* Tooltip for Quote Name */}
      {showNameTooltip && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#1F2937",
            color: "white",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
        >
          {item.quotation_name || "Untitled"}
        </div>
      )}

      {/* Customer */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "#6B7280" }}>
          {item.customer_name || "—"}
        </span>
      </div>

      {/* Service Types */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        {item.services.map((service, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center" }}>
            {getServiceIcon(service)}
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{
          fontSize: "13px",
          color: total > 0 ? "#111827" : "#9CA3AF"
        }}>
          {item.currency} {total > 0 ? total.toLocaleString() : "0"}
        </span>
      </div>

      {/* Date */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "#6B7280" }}>
          {formatDate(item.created_date)}
        </span>
      </div>

      {/* Status */}
      {showStatus && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontSize: "13px",
              color: getStatusColor(item.status),
              backgroundColor: getStatusBgColor(item.status),
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: 500
            }}
          >
            {item.status}
          </span>
        </div>
      )}
    </div>
  );
}

export function QuotationsListWithFilters({ onViewItem, onCreateQuotation, quotations, isLoading, userDepartment }: QuotationsListWithFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [workflowTab, setWorkflowTab] = useState<"Inquiries" | "Quotations" | "Completed">("Inquiries");
  
  // Column width state
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  // Load saved column widths from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quotations-column-widths');
    if (saved) {
      try {
        setColumnWidths(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved column widths');
      }
    }
  }, []);

  // Save column widths to localStorage
  const saveColumnWidths = (widths: typeof DEFAULT_COLUMN_WIDTHS) => {
    localStorage.setItem('quotations-column-widths', JSON.stringify(widths));
  };

  // Start resize
  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizingColumn(column);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[column as keyof typeof columnWidths];
  };

  // Handle resize
  useEffect(() => {
    if (!isResizing || !resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(
        MIN_COLUMN_WIDTHS[resizingColumn as keyof typeof MIN_COLUMN_WIDTHS],
        resizeStartWidth.current + diff
      );
      
      setColumnWidths(prev => {
        const updated = { ...prev, [resizingColumn]: newWidth };
        return updated;
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      saveColumnWidths(columnWidths);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizingColumn, columnWidths]);

  // Build grid template columns string
  const showStatus = userDepartment === "BD";
  const gridTemplateColumns = showStatus 
    ? `${columnWidths.icon}px ${columnWidths.name}px ${columnWidths.customer}px ${columnWidths.services}px ${columnWidths.total}px ${columnWidths.date}px ${columnWidths.status}px`
    : `${columnWidths.icon}px ${columnWidths.name}px ${columnWidths.customer}px ${columnWidths.services}px ${columnWidths.total}px ${columnWidths.date}px`;

  // Get unique customers and services for filters
  const uniqueCustomers = useMemo(() => {
    const customers = new Set((quotations || []).map(q => q.customer_name).filter(Boolean));
    return ["All Customers", ...Array.from(customers)];
  }, [quotations]);

  const uniqueServices = useMemo(() => {
    const services = new Set((quotations || []).flatMap(q => q.services));
    return ["All Services", ...Array.from(services)];
  }, [quotations]);

  // Filter quotations
  const filteredQuotations = useMemo(() => {
    let filtered = quotations || [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "All Statuses") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Service filter
    if (serviceFilter !== "All Services") {
      filtered = filtered.filter(item => item.services.includes(serviceFilter));
    }

    // Customer filter
    if (customerFilter !== "All Customers") {
      filtered = filtered.filter(item => item.customer_name === customerFilter);
    }

    // Workflow tab filter
    if (workflowTab === "Inquiries") {
      // Unpriced quotations (Draft + Pending Pricing + Needs Revision)
      filtered = filtered.filter(item => 
        item.status === "Draft" || 
        item.status === "Pending Pricing" ||
        item.status === "Needs Revision"
      );
    } else if (workflowTab === "Quotations") {
      // Priced quotations being negotiated
      filtered = filtered.filter(item => 
        item.status === "Priced" || 
        item.status === "Sent to Client"
      );
    } else if (workflowTab === "Completed") {
      // Accepted or disapproved
      filtered = filtered.filter(item => 
        item.status === "Accepted by Client" || 
        item.status === "Rejected by Client" ||
        item.status === "Disapproved" || 
        item.status === "Cancelled" ||
        item.status === "Converted to Project"
      );
    }

    return filtered;
  }, [quotations, searchQuery, statusFilter, serviceFilter, customerFilter, workflowTab]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const all = quotations || [];
    return {
      Inquiries: all.filter(q => 
        q.status === "Draft" || 
        q.status === "Pending Pricing" ||
        q.status === "Needs Revision"
      ).length,
      Quotations: all.filter(q => 
        q.status === "Priced" || 
        q.status === "Sent to Client"
      ).length,
      Completed: all.filter(q => 
        q.status === "Accepted by Client" || 
        q.status === "Rejected by Client" ||
        q.status === "Disapproved" || 
        q.status === "Cancelled" ||
        q.status === "Converted to Project"
      ).length
    };
  }, [quotations]);

  // Conditional text based on department
  const headerTitle = showStatus ? "Inquiries" : "Quotations";
  const headerSubtitle = showStatus 
    ? "Create and manage customer inquiries" 
    : "Manage quotations from BD";
  const buttonText = showStatus ? "Create Inquiry" : "Create Quotation";
  const searchPlaceholder = showStatus ? "Search inquiries..." : "Search quotations...";

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100%",
      backgroundColor: "white"
    }}>
      {/* Header Section */}
      <div style={{ 
        padding: "32px 48px 24px 48px",
        borderBottom: "1px solid var(--neuron-ui-border)"
      }}>
        {/* Title and Create Button */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          marginBottom: "24px"
        }}>
          <div>
            <h1 style={{ 
              fontSize: "32px",
              fontWeight: 600,
              color: "#12332B",
              marginBottom: "4px",
              letterSpacing: "-1.2px"
            }}>
              {headerTitle}
            </h1>
            <p style={{ 
              fontSize: "14px",
              color: "#667085",
              margin: 0
            }}>
              {headerSubtitle}
            </p>
          </div>
          
          <button
            onClick={onCreateQuotation}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "var(--neuron-brand-green)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0F544A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
            }}
          >
            <Plus size={18} />
            {buttonText}
          </button>
        </div>

        {/* Search Bar - Full Width */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
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
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#12332B",
              backgroundColor: "#FFFFFF",
            }}
          />
        </div>

        {/* Filters Row - All Filters on One Line */}
        <div style={{ 
          display: "flex",
          gap: "4px",
          marginBottom: "20px"
        }}>
          {/* Date Filter */}
          <div style={{ minWidth: "120px" }}>
            <CustomDropdown
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                { value: "All Time", label: "All Time", icon: <Calendar size={16} /> },
                { value: "Today", label: "Today", icon: <Calendar size={16} /> },
                { value: "This Week", label: "This Week", icon: <Calendar size={16} /> },
                { value: "This Month", label: "This Month", icon: <Calendar size={16} /> },
                { value: "This Quarter", label: "This Quarter", icon: <Calendar size={16} /> }
              ]}
              placeholder="Select time period"
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: "140px" }}>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "All Statuses", label: "All Statuses", icon: <CircleDot size={16} /> },
                { value: "Draft", label: "Draft", icon: <CircleDot size={16} style={{ color: "#6B7280" }} /> },
                { value: "Pending Pricing", label: "Pending Pricing", icon: <CircleDot size={16} style={{ color: "#F59E0B" }} /> },
                { value: "Quotation", label: "Quotation", icon: <CircleDot size={16} style={{ color: "#8B5CF6" }} /> },
                { value: "Approved", label: "Approved", icon: <CircleDot size={16} style={{ color: "#10B981" }} /> },
                { value: "Disapproved", label: "Disapproved", icon: <CircleDot size={16} style={{ color: "#EF4444" }} /> },
                { value: "Cancelled", label: "Cancelled", icon: <CircleDot size={16} style={{ color: "#6B7280" }} /> }
              ]}
              placeholder="Select status"
            />
          </div>

          {/* Service Filter */}
          <div style={{ minWidth: "140px" }}>
            <CustomDropdown
              value={serviceFilter}
              onChange={setServiceFilter}
              options={uniqueServices.map(service => {
                if (service === "All Services") return { value: service, label: service, icon: <Briefcase size={16} /> };
                if (service === "Brokerage") return { value: service, label: service, icon: <Briefcase size={16} style={{ color: "#0F766E" }} /> };
                if (service === "Forwarding") return { value: service, label: service, icon: <Ship size={16} style={{ color: "#0F766E" }} /> };
                if (service === "Marine Insurance") return { value: service, label: service, icon: <Shield size={16} style={{ color: "#0F766E" }} /> };
                if (service === "Trucking") return { value: service, label: service, icon: <Truck size={16} style={{ color: "#0F766E" }} /> };
                return { value: service, label: service, icon: <FileText size={16} style={{ color: "#0F766E" }} /> };
              })}
              placeholder="Select service"
            />
          </div>

          {/* Customer Filter */}
          <div style={{ minWidth: "150px" }}>
            <CustomDropdown
              value={customerFilter}
              onChange={setCustomerFilter}
              options={uniqueCustomers.map(customer => ({
                value: customer,
                label: customer,
                icon: customer === "All Customers" ? <Building2 size={16} /> : <Building2 size={16} style={{ color: "#0F766E" }} />
              }))}
              placeholder="Select customer"
            />
          </div>
        </div>

        {/* Workflow Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "24px"
        }}>
          {(["Inquiries", "Quotations", "Completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setWorkflowTab(tab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 4px",
                background: "none",
                border: "none",
                borderBottom: workflowTab === tab ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
                fontSize: "14px",
                fontWeight: 600,
                color: workflowTab === tab ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: "0"
              }}
              onMouseEnter={(e) => {
                if (workflowTab !== tab) {
                  e.currentTarget.style.color = "var(--neuron-ink-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (workflowTab !== tab) {
                  e.currentTarget.style.color = "var(--neuron-ink-secondary)";
                }
              }}
            >
              {tab === "Inquiries" && <SlidersHorizontal size={16} />}
              {tab === "Quotations" && <FileText size={16} />}
              {tab === "Completed" && <FileText size={16} />}
              {tab}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  backgroundColor: workflowTab === tab ? "#E8F4F3" : "#F3F4F6",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: workflowTab === tab ? "var(--neuron-brand-green)" : "var(--neuron-ink-muted)"
                }}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 48px" }}>
        {isLoading ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            padding: "60px 20px",
            color: "var(--neuron-ink-muted)"
          }}>
            Loading quotations...
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center",
            padding: "60px 20px",
            color: "var(--neuron-ink-muted)"
          }}>
            <FileText size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
            <p style={{ fontSize: "16px", fontWeight: 500 }}>No quotations found</p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ 
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "white"
          }}>
            {/* Table Header */}
            <div 
              style={{ 
                position: "relative",
                display: "grid",
                gridTemplateColumns: gridTemplateColumns,
                gap: "12px",
                padding: "0 16px",
                backgroundColor: "transparent",
                borderBottom: "1px solid #E5E7EB",
                fontSize: "10px",
                fontWeight: 600,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              <div style={{ padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Icon column - no label */}
              </div>
              <div style={{ padding: "10px 0", display: "flex", alignItems: "center", position: "relative" }}>
                NAME
                <div
                  onMouseDown={(e) => handleResizeStart('name', e)}
                  style={{
                    position: "absolute",
                    right: "-6px",
                    top: 0,
                    bottom: 0,
                    width: "12px",
                    cursor: "col-resize",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(15, 118, 110, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{
                    width: "2px",
                    height: "60%",
                    backgroundColor: resizingColumn === 'name' ? "#0F766E" : "#E5E7EB"
                  }} />
                </div>
              </div>
              <div style={{ padding: "10px 0", display: "flex", alignItems: "center", position: "relative" }}>
                CUSTOMER
                <div
                  onMouseDown={(e) => handleResizeStart('customer', e)}
                  style={{
                    position: "absolute",
                    right: "-6px",
                    top: 0,
                    bottom: 0,
                    width: "12px",
                    cursor: "col-resize",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(15, 118, 110, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{
                    width: "2px",
                    height: "60%",
                    backgroundColor: resizingColumn === 'customer' ? "#0F766E" : "#E5E7EB"
                  }} />
                </div>
              </div>
              <div style={{ padding: "10px 0", display: "flex", alignItems: "center", position: "relative" }}>
                SERVICE TYPES
                <div
                  onMouseDown={(e) => handleResizeStart('services', e)}
                  style={{
                    position: "absolute",
                    right: "-6px",
                    top: 0,
                    bottom: 0,
                    width: "12px",
                    cursor: "col-resize",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(15, 118, 110, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{
                    width: "2px",
                    height: "60%",
                    backgroundColor: resizingColumn === 'services' ? "#0F766E" : "#E5E7EB"
                  }} />
                </div>
              </div>
              <div style={{ padding: "10px 0", display: "flex", alignItems: "center", position: "relative" }}>
                TOTAL
                <div
                  onMouseDown={(e) => handleResizeStart('total', e)}
                  style={{
                    position: "absolute",
                    right: "-6px",
                    top: 0,
                    bottom: 0,
                    width: "12px",
                    cursor: "col-resize",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(15, 118, 110, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{
                    width: "2px",
                    height: "60%",
                    backgroundColor: resizingColumn === 'total' ? "#0F766E" : "#E5E7EB"
                  }} />
                </div>
              </div>
              <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                DATE
              </div>
              {showStatus && (
                <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                  STATUS
                </div>
              )}
            </div>

            {/* Table Rows */}
            {filteredQuotations.map((item, index) => (
              <QuotationTableRow
                key={item.id}
                item={item}
                index={index}
                totalItems={filteredQuotations.length}
                onItemClick={onViewItem}
                gridTemplateColumns={gridTemplateColumns}
                showStatus={showStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}