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
      const response = await fetch(`${API_URL}/users?department=BD`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        cache: 'no-store',
      });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        console.log('[ContactsListWithFilters] Fetched users:', result.data.length);
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
        console.log('[ContactsListWithFilters] Fetched activities:', result.data.length);
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
      // Transform BD Contact format to backend Contact format
      // BD Contact has: company_id, first_name, last_name, lifecycle_stage, lead_status
      // Backend Contact needs: customer_id, company (name), name, status
      
      let transformedData = contactData;
      
      // If data has company_id (from AddContactPanel), transform it
      if (contactData.company_id) {
        // Find the company name from customers state
        const customer = customers.find(c => c.id === contactData.company_id);
        
        transformedData = {
          name: `${contactData.first_name || ''} ${contactData.last_name || ''}`.trim(),
          email: contactData.email || contactData.mobile_number || '',
          phone: contactData.mobile_number || contactData.phone || '',
          company: customer?.company_name || '',
          customer_id: contactData.company_id, // Save customer_id for proper relationship
          status: contactData.lifecycle_stage === "Lead" ? "Lead" : 
                  contactData.lifecycle_stage === "MQL" ? "MQL" :
                  contactData.lifecycle_stage === "SQL" ? "Prospect" :
                  contactData.lifecycle_stage === "Customer" ? "Customer" : "Lead",
          notes: contactData.notes || '',
        };
      }
      
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
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(newContactsProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(newContactsProgress) }}
                >
                  <Users size={20} style={{ color: getProgressColor(newContactsProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: newContactsTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {newContactsTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(newContactsTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {newContactsAdded}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {newContactsQuota}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                New Contacts Added
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(newContactsProgress, 100)}%`,
                    backgroundColor: getProgressColor(newContactsProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(newContactsProgress), marginTop: "4px" }}>
                {Math.round(newContactsProgress)}% to quota
              </div>
            </div>

            {/* Calls Made */}
            <div 
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(callsProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(callsProgress) }}
                >
                  <Phone size={20} style={{ color: getProgressColor(callsProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: callsTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {callsTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(callsTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {callsMade}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {callsQuota}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                Calls Made
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(callsProgress, 100)}%`,
                    backgroundColor: getProgressColor(callsProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(callsProgress), marginTop: "4px" }}>
                {Math.round(callsProgress)}% to quota
              </div>
            </div>

            {/* Emails Sent */}
            <div 
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(emailsProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(emailsProgress) }}
                >
                  <Mail size={20} style={{ color: getProgressColor(emailsProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: emailsTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {emailsTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(emailsTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {emailsSent}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {emailsQuota}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                Emails Sent
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(emailsProgress, 100)}%`,
                    backgroundColor: getProgressColor(emailsProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(emailsProgress), marginTop: "4px" }}>
                {Math.round(emailsProgress)}% to quota
              </div>
            </div>

            {/* Meetings Booked */}
            <div 
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${getProgressColor(meetingsProgress)}20`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getProgressBgColor(meetingsProgress) }}
                >
                  <UserCheck size={20} style={{ color: getProgressColor(meetingsProgress) }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: "11px", color: meetingsTrend >= 0 ? "#0F766E" : "#C94F3D" }}>
                  {meetingsTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>{Math.abs(meetingsTrend)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#12332B" }}>
                  {meetingsBooked}
                </span>
                <span style={{ fontSize: "16px", color: "#667085" }}>
                  / {meetingsQuota}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
                Meetings Booked
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden" 
                style={{ height: "6px", backgroundColor: "#F3F4F6" }}
              >
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(meetingsProgress, 100)}%`,
                    backgroundColor: getProgressColor(meetingsProgress),
                    transition: "width 0.3s ease"
                  }} 
                />
              </div>
              <div style={{ fontSize: "11px", color: getProgressColor(meetingsProgress), marginTop: "4px" }}>
                {Math.round(meetingsProgress)}% to quota
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
              placeholder="Search contacts..."
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

          {/* BD sees filters, PD does not */}
          {userDepartment === "BD" && (
            <>
              <CustomDropdown
                label="STAGE"
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

              <CustomDropdown
                label="STATUS"
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
            className="grid grid-cols-[48px_minmax(220px,1fr)_minmax(180px,220px)_minmax(140px,180px)_minmax(140px,180px)_40px] gap-4 px-6 py-3 border-b sticky top-0 z-10" 
            style={{ 
              backgroundColor: "var(--neuron-bg-page)",
              borderColor: "var(--neuron-ui-divider)"
            }}
          >
            <div></div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Contact</div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Company</div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Status</div>
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>Last Activity</div>
            <div></div>
          </div>

          {/* Table Body */}
          <div className="divide-y" style={{ borderColor: "var(--neuron-ui-divider)" }}>
            {filteredContacts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <UserCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
                <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">No contacts found</h3>
                <p style={{ color: "var(--neuron-ink-muted)" }}>
                  {isLoading ? "Loading contacts..." : "Add your first contact to get started"}
                </p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const lifecycle = mapStatusToLifecycle(contact.status);
                
                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      // Convert BackendContact to BD Contact format for onViewContact
                      const bdContact: any = {
                        id: contact.id,
                        first_name: contact.name.split(' ')[0] || contact.name,
                        last_name: contact.name.split(' ').slice(1).join(' ') || '',
                        email: contact.email,
                        mobile_number: contact.phone,
                        company_id: contact.id, // Use contact id as company id for now
                        lifecycle_stage: lifecycle,
                        lead_status: "Connected" as LeadStatus,
                        job_title: "",
                        owner_id: "",
                        created_at: contact.created_date,
                        updated_at: contact.updated_at
                      };
                      onViewContact(bdContact);
                    }}
                    className="grid grid-cols-[48px_minmax(220px,1fr)_minmax(180px,220px)_minmax(140px,180px)_minmax(140px,180px)_40px] gap-4 px-6 py-4 cursor-pointer transition-colors items-center"
                    style={{ backgroundColor: "#FFFFFF" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    {/* Avatar - Person Icon */}
                    <div>
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: "var(--neuron-bg-page)",
                          color: "var(--neuron-ink-muted)"
                        }}
                      >
                        <UserCircle size={24} />
                      </div>
                    </div>

                    {/* Contact Info (Name, Email, Phone) */}
                    <div className="flex flex-col gap-1">
                      <div className="text-[13px] font-medium" style={{ color: "var(--neuron-ink-primary)" }}>
                        {contact.name}
                      </div>
                      {/* BD sees email and phone, PD sees nothing */}
                      {userDepartment === "BD" && (
                        <>
                          <div className="flex items-center gap-1 text-[12px]" style={{ color: "var(--neuron-ink-muted)" }}>
                            <Mail size={12} />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[12px]" style={{ color: "var(--neuron-ink-muted)" }}>
                            <Phone size={12} />
                            <span>{formatPhoneNumber(contact.phone)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-[11px] font-medium"
                        style={{ 
                          backgroundColor: "var(--neuron-bg-page)",
                          color: "var(--neuron-ink-muted)"
                        }}
                      >
                        <Building2 size={14} />
                      </div>
                      <span className="text-[13px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                        {contact.company}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col gap-1.5">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white w-fit"
                        style={{ backgroundColor: getLifecycleStageColor(lifecycle) }}
                      >
                        {contact.status}
                      </span>
                    </div>

                    {/* Last Activity */}
                    <div className="text-[12px]" style={{ color: "var(--neuron-ink-muted)" }}>
                      {formatDate(contact.last_activity)}
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