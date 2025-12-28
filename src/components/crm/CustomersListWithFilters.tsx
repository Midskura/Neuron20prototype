import { useState, useEffect } from "react";
import { Search, Plus, Building2, Users as UsersIcon, TrendingUp, Briefcase, Target, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import type { Customer, Industry, CustomerStatus } from "../../types/bd";
import { CustomDropdown } from "../bd/CustomDropdown";
import { AddCustomerPanel } from "../bd/AddCustomerPanel";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface CustomersListWithFiltersProps {
  userDepartment: "BD" | "PD";
  onViewCustomer: (customer: Customer) => void;
}

export function CustomersListWithFilters({ userDepartment, onViewCustomer }: CustomersListWithFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<Industry | "All">("All");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "All">("All");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Permissions based on department
  const permissions = {
    canCreate: userDepartment === "BD",
    canEdit: userDepartment === "BD",
    showKPIs: true, // Both BD and PD see KPIs
    showOwnerFilter: userDepartment === "BD",
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users?department=BD`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        cache: 'no-store',
      });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        console.log('[CustomersListWithFilters] Fetched users:', result.data.length);
      } else {
        console.error("Failed to fetch users:", result.error);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  // Fetch activities from backend
  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/activities`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        cache: 'no-store',
      });
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
        console.log('[CustomersListWithFilters] Fetched activities:', result.data.length);
      } else {
        console.error("Failed to fetch activities:", result.error);
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    }
  };

  // Fetch customers from backend
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (industryFilter && industryFilter !== "All") {
        params.append("industry", industryFilter);
      }
      if (statusFilter && statusFilter !== "All") {
        params.append("status", statusFilter);
      }
      // Pass role to backend for data filtering
      params.append("role", userDepartment);
      
      const url = `${API_URL}/customers?${params.toString()}`;
      console.log(`[CustomersListWithFilters] Fetching from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      console.log(`[CustomersListWithFilters] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CustomersListWithFilters] HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`[CustomersListWithFilters] Result:`, result);
      
      if (result.success) {
        setCustomers(result.data);
        console.log(`[CustomersListWithFilters] Set ${result.data.length} customers`);
      } else {
        console.error("[CustomersListWithFilters] Failed to fetch customers:", result.error);
      }
    } catch (error) {
      console.error("[CustomersListWithFilters] Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all contacts for counting
  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/contacts`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAllContacts(result.data);
        console.log(`[CustomersListWithFilters] Fetched ${result.data.length} contacts for counting`);
        if (result.data.length > 0) {
          console.log('[CustomersListWithFilters] Sample contact:', result.data[0]);
        }
      } else {
        console.error('[CustomersListWithFilters] Failed to fetch contacts:', result.error);
      }
    } catch (error) {
      console.error('[CustomersListWithFilters] Error fetching contacts:', error);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCustomers();
    fetchContacts();
    fetchUsers();
    fetchActivities();
  }, []);

  // Debounced search and filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, industryFilter, statusFilter]);

  // Handle save customer
  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(customerData),
      });

      const result = await response.json();
      if (result.success) {
        await fetchCustomers(); // Refresh list
        await fetchContacts(); // Refresh contacts for accurate counts
        setIsAddCustomerOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  };

  // Get contact count for each customer (using backend contacts)
  const getContactCount = (customerId: string, customerName: string): number => {
    const count = allContacts.filter(c => 
      c.customer_id === customerId // ✅ Contacts now correctly use customer_id field
    ).length;
    if (customerId === 'CUST-001') {
      console.log(`[DEBUG] Contact count for ${customerId} (${customerName}):`, count);
      console.log(`[DEBUG] All contacts:`, allContacts.map(c => ({ id: c.id, name: c.name, customer_id: c.customer_id })));
    }
    return count;
  };

  // Get latest activity date for each customer - now from backend
  const getLastActivityDate = (customerId: string): string | null => {
    const customerActivities = activities
      .filter(act => act.customer_id === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return customerActivities.length > 0 ? customerActivities[0].date : null;
  };

  // Filter customers (now for owner only, since backend handles search, industry, status)
  const filteredCustomers = customers.filter(customer => {
    const matchesOwner = ownerFilter === "All" || customer.owner_id === ownerFilter;
    return matchesOwner;
  });

  const getOwnerName = (ownerId: string) => {
    const owner = users.find(u => u.id === ownerId);
    return owner?.name || "—";
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case "Active": return "#0F766E";
      case "Prospect": return "#C88A2B";
      case "Inactive": return "#6B7A76";
      default: return "#6B7A76";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    });
  };

  // Generate company logo (initials from company name)
  const getCompanyInitials = (companyName: string) => {
    if (!companyName) return '??';
    const words = companyName.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return companyName.substring(0, 2).toUpperCase();
  };

  const getCompanyLogoColor = (companyName: string) => {
    if (!companyName) return '#0F766E';
    const colors = [
      '#0F766E', '#2B8A6E', '#237F66', '#1E6D59',
      '#C88A2B', '#6B7A76', '#C94F3D'
    ];
    const index = companyName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate KPIs with Quotas - now from backend data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Total Customers - from backend
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "Active").length;
  const prospectCustomers = customers.filter(c => c.status === "Prospect").length;
  
  // New Customers Added this month - from backend
  const newCustomersAdded = customers.filter(customer => {
    const createdDate = new Date(customer.created_at);
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
  }).length;
  const newCustomersQuota = 10;
  const newCustomersProgress = (newCustomersAdded / newCustomersQuota) * 100;
  const newCustomersTrend = 20; // +20% vs last month (mock data)
  
  // Prospects Converted this month
  const prospectsConverted = 4; // Mock data - would track status changes
  const prospectsQuota = 8;
  const prospectsProgress = (prospectsConverted / prospectsQuota) * 100;
  const prospectsTrend = 12; // +12% vs last month (mock data)
  
  // Active Customers
  const activeCustomersCount = activeCustomers;
  const activeCustomersQuota = 50;
  const activeCustomersProgress = (activeCustomersCount / activeCustomersQuota) * 100;
  const activeCustomersTrend = 8; // +8% vs last month (mock data)
  
  // Total Revenue (mock data - would come from actual bookings)
  const totalRevenue = 2450000; // ₱2.45M
  const revenueQuota = 3000000; // ₱3M
  const revenueProgress = (totalRevenue / revenueQuota) * 100;
  const revenueTrend = -5; // -5% vs last month (mock data)
  
  // Helper function to get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#0F766E"; // Green - on track
    if (progress >= 60) return "#C88A2B"; // Yellow - behind
    return "#C94F3D"; // Red - urgent
  };
  
  // Helper function to get background color
  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return "#E8F5F3"; // Light green
    if (progress >= 60) return "#FEF3E7"; // Light yellow
    return "#FFE5E5"; // Light red
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₱${(amount / 1000000).toFixed(2)}M`;
  };

  return (
    <div 
      className="h-full overflow-auto"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div style={{ padding: "32px 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#12332B", marginBottom: "4px", letterSpacing: "-1.2px" }}>
              Customers
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              {userDepartment === "BD" 
                ? "Manage customer companies and prospects" 
                : "View customer companies and check inquiries"}
            </p>
          </div>
          {permissions.canCreate && (
            <button
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
              onClick={() => setIsAddCustomerOpen(true)}
            >
              <Plus size={20} />
              Add Customer
            </button>
          )}
        </div>

        {/* KPI Section */}
        {permissions.showKPIs && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* New Customers Added */}
            <div 
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(newCustomersProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(newCustomersProgress) }}
                >
                  <Building2 size={20} style={{ color: getProgressColor(newCustomersProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: newCustomersTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {newCustomersTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(newCustomersTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {newCustomersAdded}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {newCustomersQuota}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                New Customers Added
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(newCustomersProgress, 100)}%`,
                    backgroundColor: getProgressColor(newCustomersProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(newCustomersProgress), marginTop: "4px" }}>
                {Math.round(newCustomersProgress)}% to quota
              </div>
            </div>

            {/* Prospects Converted */}
            <div 
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(prospectsProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(prospectsProgress) }}
                >
                  <Target size={20} style={{ color: getProgressColor(prospectsProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: prospectsTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {prospectsTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(prospectsTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {prospectsConverted}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {prospectsQuota}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                Prospects Converted
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(prospectsProgress, 100)}%`,
                    backgroundColor: getProgressColor(prospectsProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(prospectsProgress), marginTop: "4px" }}>
                {Math.round(prospectsProgress)}% to quota
              </div>
            </div>

            {/* Active Customers */}
            <div 
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(activeCustomersProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(activeCustomersProgress) }}
                >
                  <Briefcase size={20} style={{ color: getProgressColor(activeCustomersProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: activeCustomersTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {activeCustomersTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(activeCustomersTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {activeCustomersCount}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {activeCustomersQuota}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                Active Customers
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(activeCustomersProgress, 100)}%`,
                    backgroundColor: getProgressColor(activeCustomersProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(activeCustomersProgress), marginTop: "4px" }}>
                {Math.round(activeCustomersProgress)}% to quota
              </div>
            </div>

            {/* Total Revenue */}
            <div 
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(revenueProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(revenueProgress) }}
                >
                  <TrendingUp size={20} style={{ color: getProgressColor(revenueProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: revenueTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {revenueTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(revenueTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {formatCurrency(totalRevenue)}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {formatCurrency(revenueQuota)}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                Total Revenue (MTD)
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(revenueProgress, 100)}%`,
                    backgroundColor: getProgressColor(revenueProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(revenueProgress), marginTop: "4px" }}>
                {Math.round(revenueProgress)}% to quota
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--neuron-ink-muted)" }} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
              style={{
                border: "1px solid var(--neuron-ui-border)",
                backgroundColor: "#FFFFFF",
                color: "var(--neuron-ink-primary)"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-green)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
              }}
            />
          </div>

          {/* BD sees Industry and Status filters, PD does not */}
          {userDepartment === "BD" && (
            <>
              <CustomDropdown
                label="INDUSTRY"
                value={industryFilter}
                onChange={(value) => setIndustryFilter(value as Industry | "All")}
                options={[
                  { value: "All", label: "All Industries" },
                  { value: "Garments", label: "Garments" },
                  { value: "Automobile", label: "Automobile" },
                  { value: "Energy", label: "Energy" },
                  { value: "Food & Beverage", label: "Food & Beverage" },
                  { value: "Heavy Equipment", label: "Heavy Equipment" },
                  { value: "Construction", label: "Construction" },
                  { value: "Agricultural", label: "Agricultural" },
                  { value: "Pharmaceutical", label: "Pharmaceutical" },
                  { value: "IT", label: "IT" },
                  { value: "Electronics", label: "Electronics" },
                  { value: "General Merchandise", label: "General Merchandise" }
                ]}
              />

              <CustomDropdown
                label="STATUS"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as CustomerStatus | "All")}
                options={[
                  { value: "All", label: "All Statuses" },
                  { value: "Prospect", label: "Prospect" },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" }
                ]}
              />
            </>
          )}

          {permissions.showOwnerFilter && (
            <CustomDropdown
              label="OWNER"
              value={ownerFilter}
              onChange={(value) => setOwnerFilter(value)}
              options={[
                { value: "All", label: "All Owners" },
                ...users.map(user => ({ value: user.id, label: user.name }))
              ]}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-12 pb-6">
        <div className="rounded-[10px] overflow-hidden" style={{ 
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--neuron-ui-border)"
        }}>
          {/* Table Header - Sticky */}
          <div 
            className="grid grid-cols-[40px_minmax(200px,1fr)_minmax(120px,140px)_100px_80px_120px_40px] gap-3 px-6 py-3 border-b sticky top-0 z-10" 
            style={{ 
              backgroundColor: "var(--neuron-bg-page)",
              borderColor: "var(--neuron-ui-divider)"
            }}
          >
            <div></div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Company</div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Industry</div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Status</div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Contacts</div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Last Activity</div>
            <div></div>
          </div>

          {/* Table Body */}
          <div className="divide-y" style={{ borderColor: "var(--neuron-ui-divider)" }}>
            {isLoading ? (
              <div className="px-6 py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
                <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">Loading customers...</h3>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
                <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">No customers found</h3>
                <p style={{ color: "var(--neuron-ink-muted)" }}>Try adjusting your filters or search query</p>
              </div>
            ) : (
              filteredCustomers.map(customer => {
                const lastActivityDate = getLastActivityDate(customer.id);
                const contactCount = getContactCount(customer.id, customer.name || customer.company_name || '');
                const logoColor = getCompanyLogoColor(customer.name || customer.company_name || '');
                
                return (
                  <div
                    key={customer.id}
                    onClick={() => onViewCustomer(customer)}
                    className="grid grid-cols-[40px_minmax(200px,1fr)_minmax(120px,140px)_100px_80px_120px_40px] gap-3 px-6 py-4 cursor-pointer transition-colors items-center"
                    style={{ backgroundColor: "#FFFFFF" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    {/* Company Logo */}
                    <div>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold"
                        style={{ 
                          backgroundColor: `${logoColor}15`,
                          color: logoColor,
                          border: `1px solid ${logoColor}30`
                        }}
                      >
                        {getCompanyInitials(customer.name || customer.company_name || '')}
                      </div>
                    </div>

                    {/* Company Info (Name & Lead Source) */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="text-[13px] font-medium truncate" style={{ color: "var(--neuron-ink-primary)" }}>
                        {customer.name || customer.company_name}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: "var(--neuron-ink-muted)" }}>
                        {customer.lead_source}
                      </div>
                    </div>

                    {/* Industry */}
                    <div className="text-[13px] truncate" style={{ color: "var(--neuron-ink-secondary)" }}>
                      {customer.industry}
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white w-fit"
                        style={{ backgroundColor: getStatusColor(customer.status) }}
                      >
                        {customer.status}
                      </span>
                    </div>

                    {/* Contact Count */}
                    <div className="flex items-center gap-1.5">
                      <UsersIcon size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      <span className="text-[13px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                        {contactCount}
                      </span>
                    </div>

                    {/* Last Activity */}
                    <div className="text-[11px] truncate" style={{ color: "var(--neuron-ink-muted)" }}>
                      {lastActivityDate ? formatDate(lastActivityDate) : "No activity"}
                    </div>

                    {/* Actions Menu */}
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add action menu logic here
                        }}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        style={{ color: "var(--neuron-ink-muted)" }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Customer Panel - Only for BD */}
      {permissions.canCreate && (
        <AddCustomerPanel 
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)} 
          onSave={handleSaveCustomer} 
        />
      )}
    </div>
  );
}