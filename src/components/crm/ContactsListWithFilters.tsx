import { useState, useEffect } from "react";
import { Search, Plus, Phone, Mail, Building2, UserCircle, MoreHorizontal, Users, TrendingUp, UserCheck, Activity, ArrowUp, ArrowDown } from "lucide-react";
import type { Contact, LifecycleStage, LeadStatus } from "../../types/bd";
import type { Contact as BackendContact } from "../../types/contact";
import { CustomDropdown } from "../bd/CustomDropdown";
import { AddContactPanel } from "../bd/AddContactPanel";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface ContactsListWithFiltersProps {
  userDepartment: "BD" | "PD";
  onViewContact: (contact: Contact) => void;
}

export function ContactsListWithFilters({ userDepartment, onViewContact }: ContactsListWithFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleStage | "All">("All");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contacts, setContacts] = useState<BackendContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

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
      const response = await fetch(`${API_URL}/users?department=Business%20Development`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUsers(result.data);
          console.log('[ContactsListWithFilters] Fetched users:', result.data.length);
        } else {
          console.warn("Failed to fetch users:", result.error);
          setUsers([]);
        }
      } else {
        console.warn(`Error fetching users: ${response.status}`);
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
      
      if (!response.ok) {
        console.error(`HTTP error fetching activities! status: ${response.status}`);
        setActivities([]);
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
        console.log('[ContactsListWithFilters] Fetched activities:', result.data.length);
      } else {
        console.error("Failed to fetch activities:", result.error);
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      // Silently fail - set empty array
      setActivities([]);
    }
  };

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        cache: 'no-store',
      });
      const result = await response.json();
      if (result.success) {
        setCustomers(result.data);
        console.log('[ContactsListWithFilters] Fetched customers:', result.data.length);
      } else {
        console.error("Failed to fetch customers:", result.error);
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  // Fetch contacts from backend
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      // Pass role to backend for data filtering
      params.append("role", userDepartment);
      // Add cache-busting parameter to prevent browser caching
      params.append("_t", Date.now().toString());
      
      const url = `${API_URL}/contacts?${params.toString()}`;
      console.log('[ContactsListWithFilters] Fetching contacts from:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        cache: 'no-store', // Disable browser caching
      });

      const result = await response.json();
      console.log('[ContactsListWithFilters] Fetch result:', result);
      console.log('[ContactsListWithFilters] Number of contacts fetched:', result.data?.length || 0);
      
      if (result.success) {
        setContacts(result.data);
        console.log('[ContactsListWithFilters] Set contacts state to:', result.data);
      } else {
        console.error("Failed to fetch contacts:", result.error);
        setContacts([]); // Clear contacts on error
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]); // Clear contacts on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchContacts();
    fetchUsers();
    fetchActivities();
    fetchCustomers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchContacts();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveContact = async (contactData: any) => {
    try {
      // AddContactPanel sends: first_name, last_name, title, email, phone, customer_id,
      //   owner_id, lifecycle_stage, lead_status, notes
      // These map directly to the backend POST /contacts handler field names.
      const customerId = contactData.customer_id || contactData.company_id || null;
      const customer = customers.find((c: any) => c.id === customerId);

      const transformedData = {
        first_name: contactData.first_name || null,
        last_name: contactData.last_name || null,
        title: contactData.title || null,
        email: contactData.email || null,
        phone: contactData.phone || contactData.mobile_number || null,
        customer_id: customerId,
        company: customer?.name || customer?.company_name || '',
        owner_id: contactData.owner_id || null,
        lifecycle_stage: contactData.lifecycle_stage || "Lead",
        lead_status: contactData.lead_status || "New",
        notes: contactData.notes || null,
      };
      
      const response = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();
      if (result.success) {
        await fetchContacts(); // Refresh list
        setIsAddContactOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  };

  // Map backend status to lifecycle stage
  const mapStatusToLifecycle = (status: string): LifecycleStage => {
    switch (status) {
      case "Customer": return "Customer";
      case "MQL": return "MQL";
      case "Prospect": return "SQL";
      case "Lead": return "Lead";
      default: return "Lead";
    }
  };

  // Filter contacts - now using backend contacts
  const filteredContacts = contacts.filter(contact => {
    // Search is already handled by backend
    const lifecycle = mapStatusToLifecycle(contact.status);
    const matchesLifecycle = lifecycleFilter === "All" || lifecycle === lifecycleFilter;
    
    return matchesLifecycle;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    return phone || "—";
  };

  const getLifecycleStageColor = (stage: LifecycleStage) => {
    switch (stage) {
      case "Lead":
        return "#C88A2B";
      case "MQL":
        return "#6B7A76";
      case "SQL":
        return "#C94F3D";
      case "Customer":
        return "#0F766E";
      default:
        return "#0F766E";
    }
  };

  // Calculate KPIs with Quotas
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // New Contacts Added this month
  const newContactsAdded = contacts.filter(contact => {
    const createdDate = new Date(contact.created_date);
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
  }).length;
  const newContactsQuota = 25;
  const newContactsProgress = (newContactsAdded / newContactsQuota) * 100;
  const newContactsTrend = 15; // +15% vs last month (mock data)
  
  // Calls Made this month - now from backend activities
  const callsMade = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activity.activity_type === "Call Logged" && 
           activityDate.getMonth() === currentMonth && 
           activityDate.getFullYear() === currentYear;
  }).length;
  const callsQuota = 100;
  const callsProgress = (callsMade / callsQuota) * 100;
  const callsTrend = -8; // -8% vs last month (mock data)
  
  // Emails Sent this month - now from backend activities
  const emailsSent = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activity.activity_type === "Email Logged" && 
           activityDate.getMonth() === currentMonth && 
           activityDate.getFullYear() === currentYear;
  }).length;
  const emailsQuota = 150;
  const emailsProgress = (emailsSent / emailsQuota) * 100;
  const emailsTrend = 22; // +22% vs last month (mock data)
  
  // Meetings Booked this month - now from backend activities
  const meetingsBooked = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activity.activity_type === "Meeting Logged" && 
           activityDate.getMonth() === currentMonth && 
           activityDate.getFullYear() === currentYear;
  }).length;
  const meetingsQuota = 20;
  const meetingsProgress = (meetingsBooked / meetingsQuota) * 100;
  const meetingsTrend = 10; // +10% vs last month (mock data)
  
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
              Contacts
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              {userDepartment === "BD" 
                ? "Manage all customer and lead contacts" 
                : "View contacts and check inquiries"}
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
              onClick={() => setIsAddContactOpen(true)}
            >
              <Plus size={20} />
              Add Contact
            </button>
          )}
        </div>

        {/* KPI Section */}
        {permissions.showKPIs && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* New Contacts Added */}
            <div 
              className="p-5 rounded-xl" 
              style={{ 
                border: "1.5px solid var(--neuron-ui-border)",
                backgroundColor: "#FFFFFF" 
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#E8F5F3" }}>
                  <Users size={18} style={{ color: "#0F766E" }} />
                </div>
                <div className="flex items-center gap-1">
                  {newContactsTrend > 0 ? (
                    <ArrowUp size={14} style={{ color: "#0F766E" }} />
                  ) : (
                    <ArrowDown size={14} style={{ color: "#C94F3D" }} />
                  )}
                  <span className="text-xs" style={{ color: newContactsTrend > 0 ? "#0F766E" : "#C94F3D" }}>
                    {Math.abs(newContactsTrend)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--neuron-ink-muted)" }}>New Contacts Added</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl" style={{ color: "var(--neuron-ink-primary)" }}>{newContactsAdded}</span>
                  <span className="text-xs mb-1" style={{ color: "var(--neuron-ink-muted)" }}>/ {newContactsQuota}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: getProgressBgColor(newContactsProgress) }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(newContactsProgress, 100)}%`,
                      backgroundColor: getProgressColor(newContactsProgress)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Calls Made */}
            <div 
              className="p-5 rounded-xl" 
              style={{ 
                border: "1.5px solid var(--neuron-ui-border)",
                backgroundColor: "#FFFFFF" 
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#E8F5F3" }}>
                  <Phone size={18} style={{ color: "#0F766E" }} />
                </div>
                <div className="flex items-center gap-1">
                  {callsTrend > 0 ? (
                    <ArrowUp size={14} style={{ color: "#0F766E" }} />
                  ) : (
                    <ArrowDown size={14} style={{ color: "#C94F3D" }} />
                  )}
                  <span className="text-xs" style={{ color: callsTrend > 0 ? "#0F766E" : "#C94F3D" }}>
                    {Math.abs(callsTrend)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--neuron-ink-muted)" }}>Calls Made</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl" style={{ color: "var(--neuron-ink-primary)" }}>{callsMade}</span>
                  <span className="text-xs mb-1" style={{ color: "var(--neuron-ink-muted)" }}>/ {callsQuota}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: getProgressBgColor(callsProgress) }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(callsProgress, 100)}%`,
                      backgroundColor: getProgressColor(callsProgress)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Emails Sent */}
            <div 
              className="p-5 rounded-xl" 
              style={{ 
                border: "1.5px solid var(--neuron-ui-border)",
                backgroundColor: "#FFFFFF" 
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#E8F5F3" }}>
                  <Mail size={18} style={{ color: "#0F766E" }} />
                </div>
                <div className="flex items-center gap-1">
                  {emailsTrend > 0 ? (
                    <ArrowUp size={14} style={{ color: "#0F766E" }} />
                  ) : (
                    <ArrowDown size={14} style={{ color: "#C94F3D" }} />
                  )}
                  <span className="text-xs" style={{ color: emailsTrend > 0 ? "#0F766E" : "#C94F3D" }}>
                    {Math.abs(emailsTrend)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--neuron-ink-muted)" }}>Emails Sent</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl" style={{ color: "var(--neuron-ink-primary)" }}>{emailsSent}</span>
                  <span className="text-xs mb-1" style={{ color: "var(--neuron-ink-muted)" }}>/ {emailsQuota}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: getProgressBgColor(emailsProgress) }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(emailsProgress, 100)}%`,
                      backgroundColor: getProgressColor(emailsProgress)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Meetings Booked */}
            <div 
              className="p-5 rounded-xl" 
              style={{ 
                border: "1.5px solid var(--neuron-ui-border)",
                backgroundColor: "#FFFFFF" 
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#E8F5F3" }}>
                  <UserCheck size={18} style={{ color: "#0F766E" }} />
                </div>
                <div className="flex items-center gap-1">
                  {meetingsTrend > 0 ? (
                    <ArrowUp size={14} style={{ color: "#0F766E" }} />
                  ) : (
                    <ArrowDown size={14} style={{ color: "#C94F3D" }} />
                  )}
                  <span className="text-xs" style={{ color: meetingsTrend > 0 ? "#0F766E" : "#C94F3D" }}>
                    {Math.abs(meetingsTrend)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--neuron-ink-muted)" }}>Meetings Booked</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl" style={{ color: "var(--neuron-ink-primary)" }}>{meetingsBooked}</span>
                  <span className="text-xs mb-1" style={{ color: "var(--neuron-ink-muted)" }}>/ {meetingsQuota}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: getProgressBgColor(meetingsProgress) }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(meetingsProgress, 100)}%`,
                      backgroundColor: getProgressColor(meetingsProgress)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--neuron-ink-muted)" }} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
              style={{
                border: "1.5px solid var(--neuron-ui-border)",
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

          {/* BD sees filters, PD does not */}
          {userDepartment === "BD" && (
            <>
              <div style={{ minWidth: "140px" }}>
                <CustomDropdown
                  value={lifecycleFilter}
                  onChange={(value) => setLifecycleFilter(value as LifecycleStage | "All")}
                  options={[
                    { value: "All", label: "All Stages" },
                    { value: "Lead", label: "Lead" },
                    { value: "MQL", label: "MQL" },
                    { value: "SQL", label: "SQL" },
                    { value: "Customer", label: "Customer" }
                  ]}
                />
              </div>

              <div style={{ minWidth: "160px" }}>
                <CustomDropdown
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as LeadStatus | "All")}
                  options={[
                    { value: "All", label: "All Statuses" },
                    { value: "New", label: "New" },
                    { value: "Open", label: "Open" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Unqualified", label: "Unqualified" },
                    { value: "Attempted to contact", label: "Attempted to contact" },
                    { value: "Connected", label: "Connected" },
                    { value: "Bad timing", label: "Bad Timing" }
                  ]}
                />
              </div>
            </>
          )}

          {permissions.showOwnerFilter && (
            <div style={{ minWidth: "140px" }}>
              <CustomDropdown
                value={ownerFilter}
                onChange={(value) => setOwnerFilter(value)}
                options={[
                  { value: "All", label: "All Owners" },
                  ...users.map(user => ({ value: user.id, label: user.name }))
                ]}
              />
            </div>
          )}
        </div>

        {/* Contacts Table */}
        <div style={{ 
          border: "1.5px solid var(--neuron-ui-border)", 
          borderRadius: "16px", 
          overflow: "hidden",
          backgroundColor: "#FFFFFF"
        }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--neuron-ui-border)" }}>
                <th className="text-left px-4 py-3 text-xs" style={{ color: "var(--neuron-ink-muted)", backgroundColor: "#FAFBFB" }}>CONTACT</th>
                <th className="text-left px-4 py-3 text-xs" style={{ color: "var(--neuron-ink-muted)", backgroundColor: "#FAFBFB" }}>COMPANY</th>
                <th className="text-left px-4 py-3 text-xs" style={{ color: "var(--neuron-ink-muted)", backgroundColor: "#FAFBFB" }}>PHONE</th>
                <th className="text-left px-4 py-3 text-xs" style={{ color: "var(--neuron-ink-muted)", backgroundColor: "#FAFBFB" }}>EMAIL</th>
                <th className="text-left px-4 py-3 text-xs" style={{ color: "var(--neuron-ink-muted)", backgroundColor: "#FAFBFB" }}>STAGE</th>
                <th className="text-left px-4 py-3 text-xs" style={{ color: "var(--neuron-ink-muted)", backgroundColor: "#FAFBFB" }}>LAST ACTIVITY</th>
                <th className="text-center px-4 py-3 text-xs" style={{ color: "var(--neuron-ink-muted)", backgroundColor: "#FAFBFB" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: "var(--neuron-ink-muted)" }}>
                    Loading contacts...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: "var(--neuron-ink-muted)" }}>
                    No contacts found
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const lifecycle = mapStatusToLifecycle(contact.status);
                  return (
                    <tr 
                      key={contact.id} 
                      className="cursor-pointer hover:bg-[#FAFBFB] transition-colors"
                      style={{ borderBottom: "1px solid var(--neuron-ui-border)" }}
                      onClick={() => onViewContact(contact as any)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#E8F5F3", color: "#0F766E" }}
                          >
                            <UserCircle size={16} />
                          </div>
                          <span className="text-[13px]" style={{ color: "var(--neuron-ink-primary)" }}>
                            {`${contact.first_name || ''} ${contact.last_name || ''}`.trim()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                          <span className="text-[13px]" style={{ color: "var(--neuron-ink-primary)" }}>{contact.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--neuron-ink-primary)" }}>
                        {formatPhoneNumber(contact.phone)}
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--neuron-ink-primary)" }}>
                        {contact.email}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 rounded text-xs"
                          style={{ 
                            backgroundColor: `${getLifecycleStageColor(lifecycle)}15`,
                            color: getLifecycleStageColor(lifecycle)
                          }}
                        >
                          {lifecycle}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--neuron-ink-muted)" }}>
                        {contact.last_activity ? formatDate(contact.last_activity) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          className="p-1 rounded hover:bg-[#E8F5F3] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Panel - Only for BD */}
      {permissions.canCreate && (
        <AddContactPanel
          isOpen={isAddContactOpen}
          onSave={handleSaveContact}
          onClose={() => setIsAddContactOpen(false)}
        />
      )}
    </div>
  );
}