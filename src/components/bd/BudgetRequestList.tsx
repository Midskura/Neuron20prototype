import { useState, useMemo, useEffect } from "react";
import { Plus, Search, ChevronDown, ChevronRight, Circle, SlidersHorizontal, X } from "lucide-react";
import { PhilippinePeso } from "../icons/PhilippinePeso";
import { AddRequestForPaymentPanel } from "../accounting/AddRequestForPaymentPanel";
import { BudgetRequestDetailPanel } from "./BudgetRequestDetailPanel";
import { SimpleDropdown } from "./SimpleDropdown";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import type { EVoucher } from "../../types/evoucher";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from "../ui/toast-utils";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function BudgetRequestList() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilterTab, setQuickFilterTab] = useState<QuickFilterTab>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [customerFilter, setCustomerFilter] = useState<string[]>([]);
  const [requestorFilter, setRequestorFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("date-newest");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [vendorFilter, setVendorFilter] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [budgetRequests, setBudgetRequests] = useState<EVoucher[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EVoucher | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Current user (in real app, get from auth context)
  const currentUserId = "user001";

  // Extract unique values for filters
  const categories = useMemo(() => 
    Array.from(new Set(budgetRequests.map(r => r.sub_category).filter(Boolean)))
  , [budgetRequests]);

  const customers = useMemo(() => 
    Array.from(new Set(budgetRequests.map(r => r.customer_name).filter(Boolean)))
  , [budgetRequests]);

  const requestors = useMemo(() => 
    Array.from(new Set(budgetRequests.map(r => r.requestor_name)))
  , [budgetRequests]);

  const vendors = useMemo(() => 
    Array.from(new Set(budgetRequests.map(r => r.vendor_name).filter(Boolean)))
  , [budgetRequests]);

  // Date filtering helper
  const isWithinDateRange = (dateStr: string, range: DateRangeFilter): boolean => {
    const date = new Date(dateStr);
    const today = new Date("2024-12-12"); // Using your current date
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    switch (range) {
      case "all":
        return true;
      case "today":
        return date >= startOfToday;
      case "this-week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return date >= startOfWeek;
      }
      case "this-month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return date >= startOfMonth;
      }
      case "this-quarter": {
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
        return date >= startOfQuarter;
      }
      case "last-30-days": {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return date >= thirtyDaysAgo;
      }
      default:
        return true;
    }
  };

  // Filter and sort logic
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = budgetRequests.filter(request => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.voucher_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.customer_name && request.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Quick filter tabs
      let matchesQuickFilter = true;
      switch (quickFilterTab) {
        case "my-requests":
          matchesQuickFilter = request.requestor_id === currentUserId;
          break;
        case "this-week":
          matchesQuickFilter = isWithinDateRange(request.request_date, "this-week");
          break;
        case "this-month":
          matchesQuickFilter = isWithinDateRange(request.request_date, "this-month");
          break;
        case "needs-attention":
          matchesQuickFilter = request.status === "Submitted" || request.status === "Under Review";
          break;
      }

      // Date range filter
      const matchesDateRange = dateRangeFilter === "all" || isWithinDateRange(request.request_date, dateRangeFilter);

      // Category filter
      const matchesCategory = categoryFilter.length === 0 || (request.sub_category && categoryFilter.includes(request.sub_category));

      // Customer filter
      const matchesCustomer = customerFilter.length === 0 || (request.customer_name && customerFilter.includes(request.customer_name));

      // Requestor filter
      const matchesRequestor = requestorFilter.length === 0 || requestorFilter.includes(request.requestor_name);

      // Vendor filter
      const matchesVendor = vendorFilter.length === 0 || (request.vendor_name && vendorFilter.includes(request.vendor_name));

      return matchesSearch && matchesQuickFilter && matchesDateRange && matchesCategory && 
             matchesCustomer && matchesRequestor && matchesVendor;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "date-newest":
          return new Date(b.request_date).getTime() - new Date(a.request_date).getTime();
        case "date-oldest":
          return new Date(a.request_date).getTime() - new Date(b.request_date).getTime();
        case "amount-highest":
          return b.amount - a.amount;
        case "amount-lowest":
          return a.amount - b.amount;
        case "status":
          return a.status.localeCompare(b.status);
        case "requestor":
          return a.requestor_name.localeCompare(b.requestor_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [budgetRequests, searchQuery, quickFilterTab, dateRangeFilter, categoryFilter, customerFilter, requestorFilter, vendorFilter, sortOption, currentUserId]);

  // Group requests by status
  const groupedRequests = useMemo(() => {
    const groups: Record<string, EVoucher[]> = {
      "Under Review": [],
      "Submitted": [],
      "Approved": [],
      "Rejected": [],
      "Draft": []
    };

    filteredAndSortedRequests.forEach(request => {
      if (groups[request.status]) {
        groups[request.status].push(request);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([_, requests]) => requests.length > 0);
  }, [filteredAndSortedRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return { bg: "#E8F5F3", color: "#0F766E", iconColor: "#0F766E" };
      case "Rejected":
        return { bg: "#FFE5E5", color: "#C94F3D", iconColor: "#C94F3D" };
      case "Under Review":
        return { bg: "#FEF3E7", color: "#C88A2B", iconColor: "#C88A2B" };
      case "Submitted":
        return { bg: "#E0E7FF", color: "#4F46E5", iconColor: "#4F46E5" };
      case "Draft":
        return { bg: "#F3F4F6", color: "#6B7280", iconColor: "#6B7280" };
      default:
        return { bg: "#F3F4F6", color: "#6B7A76", iconColor: "#6B7A76" };
    }
  };

  const toggleGroup = (status: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(status)) {
      newCollapsed.delete(status);
    } else {
      newCollapsed.add(status);
    }
    setCollapsedGroups(newCollapsed);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setQuickFilterTab("all");
    setDateRangeFilter("all");
    setCategoryFilter([]);
    setCustomerFilter([]);
    setRequestorFilter([]);
    setVendorFilter([]);
    setSortOption("date-newest");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (quickFilterTab !== "all") count++;
    if (dateRangeFilter !== "all") count++;
    if (categoryFilter.length > 0) count++;
    if (customerFilter.length > 0) count++;
    if (requestorFilter.length > 0) count++;
    if (vendorFilter.length > 0) count++;
    return count;
  }, [quickFilterTab, dateRangeFilter, categoryFilter, customerFilter, requestorFilter, vendorFilter]);

  useEffect(() => {
    const fetchBudgetRequests = async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': publicAnonKey
          },
          body: JSON.stringify({
            "function": "get_budget_requests",
            "data": {
              "requestor_id": currentUserId
            }
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setBudgetRequests(data.data);
      } catch (error) {
        toast.error('Failed to fetch budget requests');
        console.error('Error fetching budget requests:', error);
      }
    };

    fetchBudgetRequests();
  }, [currentUserId]);

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        background: "#FFFFFF",
      }}
    >
      {/* Header Section */}
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
            <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#12332B", marginBottom: "4px", letterSpacing: "-1.2px" }}>
              Budget Requests
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              Manage and track budget requests for business development activities
            </p>
          </div>
          <button
            className="neuron-btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
            }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            New Request
          </button>
        </div>

        {/* Quick Filter Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "16px",
          borderBottom: "1px solid var(--neuron-ui-border)",
          paddingBottom: "0px"
        }}>
          {[
            { id: "all" as QuickFilterTab, label: "All Requests" },
            { id: "my-requests" as QuickFilterTab, label: "My Requests" },
            { id: "this-week" as QuickFilterTab, label: "This Week" },
            { id: "this-month" as QuickFilterTab, label: "This Month" },
            { id: "needs-attention" as QuickFilterTab, label: "Needs Attention" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setQuickFilterTab(tab.id)}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: quickFilterTab === tab.id ? "#0F766E" : "#667085",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: quickFilterTab === tab.id ? "2px solid #0F766E" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (quickFilterTab !== tab.id) {
                  e.currentTarget.style.color = "#12332B";
                }
              }}
              onMouseLeave={(e) => {
                if (quickFilterTab !== tab.id) {
                  e.currentTarget.style.color = "#667085";
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
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
              placeholder="Search by title, ID, customer, or requester..."
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
            <SimpleDropdown
              value={dateRangeFilter}
              onChange={(value) => setDateRangeFilter(value as DateRangeFilter)}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "this-week", label: "This Week" },
                { value: "this-month", label: "This Month" },
                { value: "this-quarter", label: "This Quarter" },
                { value: "last-30-days", label: "Last 30 Days" },
              ]}
              placeholder="Date Range"
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: "0 1 200px" }}>
            <MultiSelectDropdown
              values={categoryFilter}
              onChange={setCategoryFilter}
              options={categories}
              placeholder="All Categories"
            />
          </div>

          {/* Customer Filter */}
          <div style={{ flex: "0 1 200px" }}>
            <MultiSelectDropdown
              values={customerFilter}
              onChange={setCustomerFilter}
              options={customers}
              placeholder="All Customers"
            />
          </div>

          {/* Sort */}
          <div style={{ flex: "0 1 180px" }}>
            <SimpleDropdown
              value={sortOption}
              onChange={(value) => setSortOption(value as SortOption)}
              options={[
                { value: "date-newest", label: "Date (Newest)" },
                { value: "date-oldest", label: "Date (Oldest)" },
                { value: "amount-highest", label: "Amount (High)" },
                { value: "amount-lowest", label: "Amount (Low)" },
                { value: "status", label: "Status" },
                { value: "requestor", label: "Requestor (A-Z)" },
              ]}
              placeholder="Sort by"
            />
          </div>

          {/* More Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: showAdvancedFilters ? "#0F766E" : "#667085",
              backgroundColor: showAdvancedFilters ? "#E8F5F3" : "#FFFFFF",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!showAdvancedFilters) {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }
            }}
            onMouseLeave={(e) => {
              if (!showAdvancedFilters) {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }
            }}
          >
            <SlidersHorizontal size={16} />
            More Filters
          </button>

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
                color: "#C94F3D",
                backgroundColor: "#FFE5E5",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FFD1D1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFE5E5";
              }}
            >
              <X size={16} />
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div style={{ 
            marginTop: "16px", 
            padding: "16px", 
            backgroundColor: "#F9FAFB",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "8px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px"
          }}>
            <MultiSelectDropdown
              label="Requestor"
              values={requestorFilter}
              onChange={setRequestorFilter}
              options={requestors}
              placeholder="All Requestors"
            />
            <MultiSelectDropdown
              label="Vendor/Supplier"
              values={vendorFilter}
              onChange={setVendorFilter}
              options={vendors}
              placeholder="All Vendors"
            />
          </div>
        )}
      </div>

      {/* Grouped Table View */}
      <div className="flex-1 overflow-auto" style={{ padding: "24px 48px" }}>
        {filteredAndSortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <PhilippinePeso size={48} style={{ color: "#667085", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "16px", color: "#667085", marginBottom: "8px" }}>
              No budget requests found
            </p>
            <p style={{ fontSize: "14px", color: "#98A2B3" }}>
              {activeFilterCount > 0 || searchQuery
                ? "Try adjusting your filters or search query" 
                : "Create your first budget request to get started"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {groupedRequests.map(([status, requests]) => {
              const statusStyle = getStatusColor(status);
              const isCollapsed = collapsedGroups.has(status);
              
              return (
                <div key={status}>
                  {/* Group Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                      cursor: "pointer",
                      padding: "8px 0",
                    }}
                    onClick={() => toggleGroup(status)}
                  >
                    {isCollapsed ? <ChevronRight size={18} style={{ color: "#667085" }} /> : <ChevronDown size={18} style={{ color: "#667085" }} />}
                    <Circle size={10} fill={statusStyle.iconColor} style={{ color: statusStyle.iconColor }} />
                    <h3 style={{ 
                      fontSize: "13px", 
                      fontWeight: 600, 
                      color: "#12332B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      margin: 0
                    }}>
                      {status} ({requests.length})
                    </h3>
                  </div>

                  {/* Table */}
                  {!isCollapsed && (
                    <div style={{ 
                      border: "1px solid var(--neuron-ui-border)", 
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#FFFFFF"
                    }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid var(--neuron-ui-border)" }}>
                            <th style={{ 
                              padding: "12px 16px", 
                              textAlign: "left", 
                              fontSize: "11px", 
                              fontWeight: 600, 
                              color: "#667085",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              width: "30%"
                            }}>
                              REQUEST
                            </th>
                            <th style={{ 
                              padding: "12px 16px", 
                              textAlign: "left", 
                              fontSize: "11px", 
                              fontWeight: 600, 
                              color: "#667085",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              width: "20%"
                            }}>
                              CATEGORY
                            </th>
                            <th style={{ 
                              padding: "12px 16px", 
                              textAlign: "left", 
                              fontSize: "11px", 
                              fontWeight: 600, 
                              color: "#667085",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              width: "15%"
                            }}>
                              REQUESTOR
                            </th>
                            <th style={{ 
                              padding: "12px 16px", 
                              textAlign: "left", 
                              fontSize: "11px", 
                              fontWeight: 600, 
                              color: "#667085",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              width: "12%"
                            }}>
                              DATE
                            </th>
                            <th style={{ 
                              padding: "12px 16px", 
                              textAlign: "right", 
                              fontSize: "11px", 
                              fontWeight: 600, 
                              color: "#667085",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              width: "15%"
                            }}>
                              AMOUNT
                            </th>
                            <th style={{ 
                              padding: "12px 16px", 
                              textAlign: "center", 
                              fontSize: "11px", 
                              fontWeight: 600, 
                              color: "#667085",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              width: "8%"
                            }}>
                              STATUS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.map((request, index) => (
                            <tr
                              key={request.id}
                              style={{
                                borderBottom: index < requests.length - 1 ? "1px solid var(--neuron-ui-border)" : "none",
                                cursor: "pointer",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#F9FAFB";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#FFFFFF";
                              }}
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailPanel(true);
                              }}
                            >
                              {/* Request */}
                              <td style={{ padding: "16px" }}>
                                <div style={{ fontWeight: 600, fontSize: "14px", color: "#12332B", marginBottom: "4px" }}>
                                  {request.description}
                                </div>
                                <div style={{ fontSize: "12px", color: "#667085" }}>
                                  {request.voucher_number} • {request.purpose}
                                </div>
                                {request.customer_name && (
                                  <div style={{ fontSize: "12px", color: "#0F766E", fontWeight: 500, marginTop: "4px" }}>
                                    → {request.customer_name}
                                  </div>
                                )}
                              </td>

                              {/* Category */}
                              <td style={{ padding: "16px" }}>
                                <div style={{ fontSize: "13px", color: "#12332B" }}>
                                  {request.sub_category}
                                </div>
                              </td>

                              {/* Requestor */}
                              <td style={{ padding: "16px" }}>
                                <div style={{ fontSize: "13px", color: "#12332B" }}>
                                  {request.requestor_name}
                                </div>
                              </td>

                              {/* Date */}
                              <td style={{ padding: "16px" }}>
                                <div style={{ fontSize: "13px", color: "#667085" }}>
                                  {new Date(request.request_date).toLocaleDateString('en-PH', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </div>
                              </td>

                              {/* Amount */}
                              <td style={{ padding: "16px", textAlign: "right" }}>
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "flex-end",
                                  fontSize: "14px", 
                                  fontWeight: 600, 
                                  color: "#12332B" 
                                }}>
                                  <PhilippinePeso size={14} style={{ marginRight: "4px" }} />
                                  {request.amount.toLocaleString()}
                                </div>
                              </td>

                              {/* Status Badge */}
                              <td style={{ padding: "16px", textAlign: "center" }}>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.color,
                                    display: "inline-block",
                                  }}
                                >
                                  {request.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Budget Request Panel */}
      <AddRequestForPaymentPanel
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(data) => {
          // Create new EVoucher object from form data
          const newRequest: EVoucher = {
            id: `ev${String(budgetRequests.length + 1).padStart(3, '0')}`,
            voucher_number: data.evrnNumber,
            requestor_id: "user001", // In real app, get from auth context
            requestor_name: data.requestor,
            request_date: data.date,
            expense_category: data.expenseCategory,
            sub_category: data.subCategory,
            amount: data.totalAmount,
            currency: "PHP",
            purpose: data.requestName,
            description: data.requestName,
            vendor_name: data.vendor,
            status: data.status,
            project_number: data.projectNumber,
            payment_method: data.preferredPayment,
            credit_terms: data.creditTerms,
            payment_schedule: data.paymentSchedule,
            notes: data.notes,
            line_items: data.lineItems,
            approvers: [],
            workflow_history: [
              {
                id: `wh${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: data.status,
                user_name: data.requestor,
                user_role: "BD",
                action: data.status === "Submitted" ? "Submitted for approval" : "Saved as draft"
              }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Add to the beginning of the list (most recent first)
          setBudgetRequests([newRequest, ...budgetRequests]);
          setShowCreateModal(false);
        }}
        onSaveDraft={(data) => {
          // Create new EVoucher object with Draft status
          const newDraft: EVoucher = {
            id: `ev${String(budgetRequests.length + 1).padStart(3, '0')}`,
            voucher_number: data.evrnNumber,
            requestor_id: "user001",
            requestor_name: data.requestor,
            request_date: data.date,
            expense_category: data.expenseCategory,
            sub_category: data.subCategory,
            amount: data.totalAmount,
            currency: "PHP",
            purpose: data.requestName,
            description: data.requestName,
            vendor_name: data.vendor,
            status: "Draft",
            project_number: data.projectNumber,
            payment_method: data.preferredPayment,
            credit_terms: data.creditTerms,
            payment_schedule: data.paymentSchedule,
            notes: data.notes,
            line_items: data.lineItems,
            approvers: [],
            workflow_history: [
              {
                id: `wh${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: "Draft",
                user_name: data.requestor,
                user_role: "BD",
                action: "Saved as draft"
              }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Add to the beginning of the list
          setBudgetRequests([newDraft, ...budgetRequests]);
          setShowCreateModal(false);
        }}
      />

      {/* Budget Request Detail Panel */}
      <BudgetRequestDetailPanel
        isOpen={showDetailPanel}
        onClose={() => setShowDetailPanel(false)}
        request={selectedRequest}
      />
    </div>
  );
}