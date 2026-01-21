import { ArrowLeft, Building2, MapPin, Briefcase, Edit, Users, Plus, Mail, Phone, User, CheckCircle, Clock, AlertCircle, Calendar, Paperclip, Upload, MessageSquare, Send, FileText, MessageCircle, Linkedin, StickyNote } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Customer, Contact, Industry, CustomerStatus, Task, Activity } from "../../types/bd";
import type { QuotationNew } from "../../types/pricing";
import { CustomDropdown } from "./CustomDropdown";
import { TaskDetailInline } from "./TaskDetailInline";
import { ActivityDetailInline } from "./ActivityDetailInline";
import { AddContactPanel } from "./AddContactPanel";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "../ui/toast-utils";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onCreateInquiry?: (customer: Customer) => void;
  onViewInquiry?: (inquiryId: string) => void;
}

interface Comment {
  id: string;
  user_name: string;
  user_department: "BD" | "Pricing";
  message: string;
  created_at: string;
}

// Mock comments for demo
const mockComments: Comment[] = [
  {
    id: "cm1",
    user_name: "Maria Santos",
    user_department: "BD",
    message: "This customer is requesting volume pricing for Q1 2025. Can we prepare a special rate card?",
    created_at: "2025-12-09T14:30:00"
  },
  {
    id: "cm2",
    user_name: "Juan Dela Cruz",
    user_department: "Pricing",
    message: "Sure! I'll prepare tiered pricing based on monthly volume. What's their expected monthly CBM?",
    created_at: "2025-12-09T15:15:00"
  },
  {
    id: "cm3",
    user_name: "Maria Santos",
    user_department: "BD",
    message: "They mentioned around 200-250 CBM per month. Mostly retail goods from China.",
    created_at: "2025-12-09T16:00:00"
  }
];

export function CustomerDetail({ customer, onBack, onCreateInquiry, onViewInquiry }: CustomerDetailProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"contacts" | "activities" | "tasks" | "inquiries" | "comments">("contacts");
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: "Call",
    customer_id: customer.id
  });
  const [activityAttachments, setActivityAttachments] = useState<File[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: "Call",
    priority: "Medium",
    status: "Pending",
    customer_id: customer.id
  });
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [quotations, setQuotations] = useState<QuotationNew[]>([]);
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isAddContactPanelOpen, setIsAddContactPanelOpen] = useState(false);

  // Fetch full customer details including quotations and contacts from backend
  const fetchCustomerDetails = async () => {
    setIsLoadingQuotations(true);
    setIsLoadingContacts(true);
    try {
      console.log(`Fetching customer details for: ${customer.id} (${customer.name || customer.company_name})`);
      
      const response = await fetch(`${API_URL}/customers/${customer.id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Customer details response:', result);
      
      if (result.success && result.data) {
        if (result.data.quotations) {
          setQuotations(result.data.quotations);
          console.log(`✅ Fetched ${result.data.quotations.length} quotations for customer ${customer.name || customer.company_name}:`, result.data.quotations);
        } else {
          console.log(`No quotations field in response for customer ${customer.name || customer.company_name}`);
          setQuotations([]);
        }
        
        if (result.data.contacts) {
          setContacts(result.data.contacts);
          console.log(`✅ Fetched ${result.data.contacts.length} contacts for customer ${customer.name || customer.company_name}:`, result.data.contacts);
        } else {
          console.log(`No contacts field in response for customer ${customer.name || customer.company_name}`);
          setContacts([]);
        }
      } else {
        console.error('Error fetching customer details:', result.error);
        setQuotations([]);
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setQuotations([]);
      setContacts([]);
    } finally {
      setIsLoadingQuotations(false);
      setIsLoadingContacts(false);
    }
  };

  // Fetch activities for this customer
  const fetchActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await fetch(`${API_URL}/activities?customer_id=${customer.id}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.error(`HTTP error fetching activities! status: ${response.status}`);
        setActivities([]);
        setIsLoadingActivities(false);
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      } else {
        console.error("Failed to fetch activities:", result.error);
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      // Silently fail - set empty array
      setActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Fetch tasks for this customer
  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await fetch(`${API_URL}/tasks?customer_id=${customer.id}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        cache: 'no-store',
      });
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Create new task
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.due_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const taskToCreate = {
        ...newTask,
        customer_id: customer.id,
        owner_id: customer.owner_id || 'user-1', // Use customer's owner or default
        status: 'Pending'
      };

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskToCreate)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Task created successfully');
        setIsCreatingTask(false);
        setNewTask({
          type: "Call",
          priority: "Medium",
          status: "Pending",
          customer_id: customer.id
        });
        fetchTasks(); // Refresh the tasks list
      } else {
        toast.error('Error creating task: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Unable to create task. Please try again.');
    }
  };

  // Fetch users for lookups
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        cache: 'no-store',
      });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch customer details when component mounts or customer changes
  useEffect(() => {
    fetchCustomerDetails();
    fetchActivities();
    fetchTasks();
    fetchUsers();
  }, [customer.id]);

  // Get all contacts for this customer (now from backend state)
  const getCustomerContacts = () => {
    return contacts;
  };

  // Get all activities for this customer
  const getCustomerActivities = () => {
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get all tasks for this customer
  const getCustomerTasks = () => {
    return tasks.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  };

  // Get all inquiries for this customer
  const getCustomerInquiries = () => {
    return quotations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const getOwnerName = (ownerId: string) => {
    const owner = users.find(u => u.id === ownerId);
    return owner?.name || "—";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCommentDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      // TODO: Add comment to database
      console.log("New comment:", newComment);
      setNewComment("");
    }
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case "Active": return "#0F766E";
      case "Prospect": return "#C88A2B";
      case "Inactive": return "#6B7A76";
      default: return "#6B7A76";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "#0F766E";
      case "Ongoing": return "#C88A2B";
      case "Pending": return "#6B7A76";
      case "Cancelled": return "#C94F3D";
      default: return "#6B7A76";
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "#C94F3D";
      case "Medium": return "#C88A2B";
      case "Low": return "#6B7A76";
      default: return "#6B7A76";
    }
  };

  const handleSave = () => {
    // In real app, this would save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    setIsEditing(false);
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

  // Generate a consistent color for company logo
  const getCompanyLogoColor = (companyName: string) => {
    if (!companyName) return '#0F766E';
    const colors = [
      '#0F766E', '#2B8A6E', '#237F66', '#1E6D59',
      '#C88A2B', '#6B7A76', '#C94F3D'
    ];
    const index = companyName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const customerContacts = getCustomerContacts();
  const inquiries = getCustomerInquiries();
  const logoColor = getCompanyLogoColor(customer.name || customer.company_name || '');

  return (
    <div 
      className="h-full flex flex-col overflow-auto"
      style={{
        background: "#FFFFFF",
      }}
    >
      {/* Back Button - Top Left */}
      <div style={{ padding: "32px 48px 24px 48px" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] transition-colors"
          style={{ color: "#0F766E" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#0D6560";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#0F766E";
          }}
        >
          <ArrowLeft size={16} />
          Back to Customers
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 overflow-auto" style={{ padding: "0 48px 48px 48px" }}>
        <div className="grid grid-cols-[35%_1fr] gap-8 h-full">
          {/* Left Column - Customer Profile Card */}
          <div>
            <div 
              className="rounded-lg p-6"
              style={{
                border: "1px solid var(--neuron-ui-border)",
                backgroundColor: "#FFFFFF"
              }}
            >
              {/* Profile Header */}
              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--neuron-ui-divider)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div 
                      className="rounded-lg flex-shrink-0 flex items-center justify-center text-[20px] font-semibold"
                      style={{
                        width: "64px",
                        height: "64px",
                        backgroundColor: `${logoColor}15`,
                        color: logoColor,
                        border: `2px solid ${logoColor}30`
                      }}
                    >
                      {getCompanyInitials(customer.name || customer.company_name || '')}
                    </div>

                    {/* Company Name & Status */}
                    <div className="flex-1 min-w-0">
                      <h2 
                        className="text-[20px] font-semibold mb-2 break-words"
                        style={{ color: "var(--neuron-ink-primary)" }}
                      >
                        {customer.name || customer.company_name}
                      </h2>
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white"
                        style={{ backgroundColor: getStatusColor(customer.status) }}
                      >
                        {customer.status}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 rounded-lg transition-colors flex-shrink-0"
                    style={{ 
                      color: "var(--neuron-ink-muted)",
                      backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>

              {/* Customer Details */}
              {!isEditing ? (
                <div className="space-y-5">
                  {/* Industry */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>
                        Industry
                      </label>
                    </div>
                    <p className="text-[13px] pl-6" style={{ color: "var(--neuron-ink-primary)" }}>
                      {customer.industry}
                    </p>
                  </div>

                  {/* Registered Address */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>
                        Registered Address
                      </label>
                    </div>
                    <p className="text-[13px] pl-6" style={{ color: "var(--neuron-ink-primary)" }}>
                      {customer.registered_address}
                    </p>
                  </div>

                  {/* Lead Source */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>
                        Lead Source
                      </label>
                    </div>
                    <p className="text-[13px] pl-6" style={{ color: "var(--neuron-ink-primary)" }}>
                      {customer.lead_source}
                    </p>
                  </div>

                  {/* Owner */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>
                        Account Owner
                      </label>
                    </div>
                    <p className="text-[13px] pl-6" style={{ color: "var(--neuron-ink-primary)" }}>
                      {getOwnerName(customer.owner_id)}
                    </p>
                  </div>

                  {/* Contact Count */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>
                        Total Contacts
                      </label>
                    </div>
                    <p className="text-[13px] pl-6" style={{ color: "var(--neuron-ink-primary)" }}>
                      {customerContacts.length} {customerContacts.length === 1 ? 'contact' : 'contacts'}
                    </p>
                  </div>

                  {/* Created Date */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>
                        Created
                      </label>
                    </div>
                    <p className="text-[13px] pl-6" style={{ color: "var(--neuron-ink-primary)" }}>
                      {formatDate(customer.created_at)}
                    </p>
                  </div>

                  {/* Notes */}
                  {customer.notes && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                        <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--neuron-ink-muted)" }}>
                          Notes
                        </label>
                      </div>
                      <p className="text-[13px] pl-6 whitespace-pre-wrap" style={{ color: "var(--neuron-ink-primary)" }}>
                        {customer.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--neuron-ink-muted)" }}>
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editedCustomer.name || editedCustomer.company_name}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value, company_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none focus:ring-2"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)"
                      }}
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--neuron-ink-muted)" }}>
                      Industry
                    </label>
                    <select
                      value={editedCustomer.industry}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, industry: e.target.value as Industry })}
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none focus:ring-2"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)"
                      }}
                    >
                      <option value="Garments">Garments</option>
                      <option value="Automobile">Automobile</option>
                      <option value="Energy">Energy</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Heavy Equipment">Heavy Equipment</option>
                      <option value="Construction">Construction</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Pharmaceutical">Pharmaceutical</option>
                      <option value="IT">IT</option>
                      <option value="Electronics">Electronics</option>
                      <option value="General Merchandise">General Merchandise</option>
                    </select>
                  </div>

                  {/* Registered Address */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--neuron-ink-muted)" }}>
                      Registered Address
                    </label>
                    <textarea
                      value={editedCustomer.registered_address}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, registered_address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none focus:ring-2 resize-none"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)"
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--neuron-ink-muted)" }}>
                      Status
                    </label>
                    <select
                      value={editedCustomer.status}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, status: e.target.value as CustomerStatus })}
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none focus:ring-2"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)"
                      }}
                    >
                      <option value="Prospect">Prospect</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Lead Source */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--neuron-ink-muted)" }}>
                      Lead Source
                    </label>
                    <input
                      type="text"
                      value={editedCustomer.lead_source}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, lead_source: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none focus:ring-2"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)"
                      }}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--neuron-ink-muted)" }}>
                      Notes
                    </label>
                    <textarea
                      value={editedCustomer.notes || ''}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, notes: e.target.value })}
                      rows={3}
                      placeholder="Additional information about the customer..."
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none focus:ring-2 resize-none"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)"
                      }}
                    />
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors"
                      style={{ backgroundColor: "#0F766E" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0D6560";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#0F766E";
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        color: "var(--neuron-ink-secondary)",
                        backgroundColor: "#FFFFFF"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tabs for Contacts, Activities, Tasks */}
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex items-center gap-6 mb-6" style={{ borderBottom: "1px solid var(--neuron-ui-divider)" }}>
              <button
                onClick={() => setActiveTab("contacts")}
                className="px-1 pb-3 text-[13px] font-medium transition-colors relative"
                style={{
                  color: activeTab === "contacts" ? "#0F766E" : "#667085"
                }}
              >
                Contacts
                {activeTab === "contacts" && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "#0F766E" }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className="px-1 pb-3 text-[13px] font-medium transition-colors relative"
                style={{
                  color: activeTab === "activities" ? "#0F766E" : "#667085"
                }}
              >
                Activities
                {activeTab === "activities" && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "#0F766E" }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className="px-1 pb-3 text-[13px] font-medium transition-colors relative"
                style={{
                  color: activeTab === "tasks" ? "#0F766E" : "#667085"
                }}
              >
                Tasks
                {activeTab === "tasks" && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "#0F766E" }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className="px-1 pb-3 text-[13px] font-medium transition-colors relative"
                style={{
                  color: activeTab === "inquiries" ? "#0F766E" : "#667085"
                }}
              >
                Inquiries
                {activeTab === "inquiries" && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "#0F766E" }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className="px-1 pb-3 text-[13px] font-medium transition-colors relative"
                style={{
                  color: activeTab === "comments" ? "#0F766E" : "#667085"
                }}
              >
                Comments
                {activeTab === "comments" && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "#0F766E" }}
                  />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {/* Contacts Tab */}
              {activeTab === "contacts" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                      Contact List
                    </h3>
                    <button
                      onClick={() => setIsAddContactPanelOpen(true)}
                      className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: "#0F766E",
                        color: "#FFFFFF"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0D6560";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#0F766E";
                      }}
                    >
                      Add Contact
                    </button>
                  </div>

                  {isLoadingContacts ? (
                    <div className="text-center py-12">
                      <p className="text-[14px]" style={{ color: "#667085" }}>Loading contacts...</p>
                    </div>
                  ) : customerContacts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[14px]" style={{ color: "#667085" }}>No contacts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerContacts.map(contact => {
                        // Backend Contact format: name, email, phone, company, status
                        // Display name as-is (already combined first + last name)
                        const displayName = contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
                        const displayEmail = contact.email;
                        const displayPhone = contact.phone || contact.mobile_number;
                        const displayStatus = contact.status || contact.lifecycle_stage;
                        
                        return (
                        <div
                          key={contact.id}
                          className="p-4 rounded-lg cursor-pointer transition-all"
                          style={{
                            border: "1px solid var(--neuron-ui-border)",
                            backgroundColor: "#FFFFFF"
                          }}
                          onClick={() => navigate(`/bd/contacts/${contact.id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#F9FAFB";
                            e.currentTarget.style.borderColor = "#0F766E";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#FFFFFF";
                            e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                          }}
                        >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: Avatar and Contact Info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Avatar */}
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: "#F3F4F6",
                                border: "1px solid var(--neuron-ui-divider)"
                              }}
                            >
                              <User size={18} style={{ color: "#9CA3AF" }} />
                            </div>

                            {/* Contact Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[13px] font-medium mb-1" style={{ color: "var(--neuron-ink-primary)" }}>
                                {displayName}
                              </h4>
                              {contact.job_title && (
                                <p className="text-[12px] mb-2" style={{ color: "var(--neuron-ink-muted)" }}>
                                  {contact.job_title}
                                </p>
                              )}
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                                  <Mail size={12} style={{ color: "var(--neuron-ink-muted)" }} />
                                  <span className="truncate">{displayEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                                  <Phone size={12} style={{ color: "var(--neuron-ink-muted)" }} />
                                  {displayPhone}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Status Badge */}
                          <div className="flex-shrink-0">
                            <span 
                              className="text-[10px] px-2 py-0.5 rounded text-white font-medium"
                              style={{ 
                                backgroundColor: displayStatus === "Customer" ? "#0F766E" : 
                                                displayStatus === "Lead" ? "#C88A2B" : 
                                                displayStatus === "MQL" ? "#6B7A76" :
                                                displayStatus === "Prospect" ? "#C94F3D" : "#6B7A76"
                              }}
                            >
                              {displayStatus}
                            </span>
                          </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Activities Tab */}
              {activeTab === "activities" && (
                <div>
                  {isLoggingActivity ? (
                    /* Log Activity Form */
                    <div>
                      <div className="mb-6">
                        <button
                          onClick={() => {
                            setIsLoggingActivity(false);
                            setNewActivity({
                              type: "Call",
                              customer_id: customer.id
                            });
                            setActivityAttachments([]);
                          }}
                          className="flex items-center gap-2 text-[13px] transition-colors mb-4"
                          style={{ color: "#0F766E" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#0D6560";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#0F766E";
                          }}
                        >
                          <ArrowLeft size={16} />
                          Back to Activities
                        </button>

                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "24px" }}>
                          Log Activity
                        </h3>

                        <div 
                          className="p-6 rounded-xl"
                          style={{ 
                            border: "1px solid var(--neuron-ui-border)",
                            backgroundColor: "#FAFAFA"
                          }}
                        >
                          <div className="space-y-6">
                            {/* Activity Name */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Activity Name *
                              </label>
                              <input
                                type="text"
                                value={newActivity.title || ""}
                                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                placeholder="Enter activity name..."
                                className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#12332B"
                                }}
                              />
                            </div>

                            {/* Activity Description */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Activity Description *
                              </label>
                              <textarea
                                value={newActivity.description || ""}
                                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                placeholder="What did you do? (e.g., Called client to discuss Q1 forecast)"
                                className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                                rows={4}
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#12332B"
                                }}
                              />
                            </div>

                            {/* Type */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Type *
                              </label>
                              <CustomDropdown
                                options={[
                                  { value: "Call", label: "Call", icon: <Phone size={16} /> },
                                  { value: "Email", label: "Email", icon: <Mail size={16} /> },
                                  { value: "Meeting", label: "Meeting", icon: <Users size={16} /> },
                                  { value: "SMS", label: "SMS", icon: <Send size={16} /> },
                                  { value: "Viber", label: "Viber", icon: <MessageCircle size={16} /> },
                                  { value: "WhatsApp", label: "WhatsApp", icon: <MessageSquare size={16} /> },
                                  { value: "WeChat", label: "WeChat", icon: <MessageSquare size={16} /> },
                                  { value: "LinkedIn", label: "LinkedIn", icon: <Linkedin size={16} /> },
                                  { value: "Note", label: "Note", icon: <StickyNote size={16} /> },
                                  { value: "Marketing Email", label: "Marketing Email", icon: <MessageSquare size={16} /> }
                                ]}
                                value={newActivity.type || "Call"}
                                onChange={(value) => setNewActivity({ ...newActivity, type: value })}
                              />
                            </div>

                            {/* Date/Time */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Activity Date & Time *
                              </label>
                              <input
                                type="datetime-local"
                                value={newActivity.date ? new Date(newActivity.date).toISOString().slice(0, 16) : ""}
                                onChange={(e) => setNewActivity({ ...newActivity, date: new Date(e.target.value).toISOString() })}
                                className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#12332B"
                                }}
                              />
                            </div>

                            {/* Contact Selection */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Related Contact (Optional)
                              </label>
                              <select
                                value={newActivity.contact_id || ""}
                                onChange={(e) => setNewActivity({ ...newActivity, contact_id: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#12332B"
                                }}
                              >
                                <option value="">Select a contact...</option>
                                {customerContacts.map(contact => (
                                  <option key={contact.id} value={contact.id}>
                                    {contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Attachments */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Attachments (Optional)
                              </label>
                              <div 
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
                                style={{ borderColor: "var(--neuron-ui-border)", backgroundColor: "#FFFFFF" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "#0F766E";
                                  e.currentTarget.style.backgroundColor = "#E8F5F3";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                }}
                              >
                                <Upload size={24} className="mx-auto mb-2" style={{ color: "#667085" }} />
                                <p className="text-[13px]" style={{ color: "#667085" }}>
                                  Click to upload or drag and drop files
                                </p>
                              </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium text-white transition-colors"
                                style={{ backgroundColor: "#0F766E" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#0D6560";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#0F766E";
                                }}
                              >
                                Log Activity
                              </button>
                              <button
                                onClick={() => {
                                  setIsLoggingActivity(false);
                                  setNewActivity({
                                    type: "Call",
                                    customer_id: customer.id
                                  });
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  color: "var(--neuron-ink-secondary)",
                                  backgroundColor: "#FFFFFF"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !selectedActivity ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                          Activity Timeline
                        </h3>
                        <button
                          onClick={() => {
                            setIsLoggingActivity(true);
                            setSelectedActivity(null);
                          }}
                          className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                          style={{
                            backgroundColor: "#0F766E",
                            color: "#FFFFFF"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#0D6560";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#0F766E";
                          }}
                        >
                          Log Activity
                        </button>
                      </div>

                      {activities.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-[14px]" style={{ color: "#667085" }}>No activities yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activities.map(activity => {
                            const activityContact = contacts.find(c => c.id === activity.contact_id);
                            
                            return (
                              <div
                                key={activity.id}
                                onClick={() => {
                                  // Always show activity detail view when clicking an activity
                                  setSelectedActivity(activity);
                                }}
                                className="p-4 rounded-lg cursor-pointer transition-all"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                                  e.currentTarget.style.borderColor = "#0F766E";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                  e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                                }}
                              >
                              <div className="flex items-start gap-3">
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: "#E8F5F3" }}
                                >
                                  <CheckCircle size={14} style={{ color: "#0F766E" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-[13px] font-medium" style={{ color: "var(--neuron-ink-primary)" }}>
                                      {activity.type}
                                    </h4>
                                    <span className="text-[11px]" style={{ color: "var(--neuron-ink-muted)" }}>
                                      {formatDateTime(activity.date)}
                                    </span>
                                  </div>
                                  {activityContact && (
                                    <p className="text-[12px] mb-1" style={{ color: "var(--neuron-ink-muted)" }}>
                                      with {activityContact.first_name} {activityContact.last_name}
                                    </p>
                                  )}
                                  <p className="text-[13px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                                    {activity.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  // Activity Detail View
                  <ActivityDetailInline
                    activity={selectedActivity}
                    onBack={() => setSelectedActivity(null)}
                    onUpdate={async () => {
                      // Refresh activities list
                      await fetchActivities();
                      setSelectedActivity(null);
                    }}
                    onDelete={async () => {
                      // Refresh activities list and go back
                      await fetchActivities();
                      setSelectedActivity(null);
                    }}
                    contactInfo={selectedActivity.contact_id ? contacts.find(c => c.id === selectedActivity.contact_id) : null}
                    customerInfo={customer}
                    userName={selectedActivity.user_id ? users.find(u => u.id === selectedActivity.user_id)?.name : undefined}
                  />
                )}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
                <div>
                  {!selectedTask && !isCreatingTask ? (
                    /* Task List */
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                          Tasks
                        </h3>
                        <button
                          onClick={() => {
                            setIsCreatingTask(true);
                            setSelectedTask(null);
                          }}
                          className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                          style={{
                            backgroundColor: "#0F766E",
                            color: "#FFFFFF"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#0D6560";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#0F766E";
                          }}
                        >
                          Create Task
                        </button>
                      </div>

                      {tasks.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-[14px]" style={{ color: "#667085" }}>No tasks yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tasks.map(task => {
                            const taskContact = contacts.find(c => c.id === task.contact_id);
                            
                            return (
                              <div
                                key={task.id}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setEditedTask(task);
                                  setIsEditingTask(false);
                                }}
                                className="p-4 rounded-lg cursor-pointer transition-all"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                                  e.currentTarget.style.borderColor = "#0F766E";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                  e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ 
                                      backgroundColor: task.status === "Completed" ? "#E8F5F3" : 
                                                     task.status === "Cancelled" ? "#FFE5E5" : "#FEF3E7"
                                    }}
                                  >
                                    {task.status === "Completed" ? (
                                      <CheckCircle size={14} style={{ color: "#0F766E" }} />
                                    ) : task.status === "Cancelled" ? (
                                      <AlertCircle size={14} style={{ color: "#C94F3D" }} />
                                    ) : (
                                      <Clock size={14} style={{ color: "#C88A2B" }} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="text-[13px] font-medium" style={{ color: "var(--neuron-ink-primary)" }}>
                                        {task.title}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className="text-[10px] px-2 py-0.5 rounded text-white font-medium"
                                          style={{ backgroundColor: getTaskPriorityColor(task.priority) }}
                                        >
                                          {task.priority}
                                        </span>
                                        <span 
                                          className="text-[10px] px-2 py-0.5 rounded text-white font-medium"
                                          style={{ backgroundColor: getTaskStatusColor(task.status) }}
                                        >
                                          {task.status}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2 text-[12px]" style={{ color: "var(--neuron-ink-muted)" }}>
                                      <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {formatDate(task.due_date)}
                                      </span>
                                      <span>•</span>
                                      <span>{task.type}</span>
                                      {taskContact && (
                                        <>
                                          <span>•</span>
                                          <span>{taskContact.first_name} {taskContact.last_name}</span>
                                        </>
                                      )}
                                    </div>
                                    {task.remarks && (
                                      <p className="text-[13px]" style={{ color: "var(--neuron-ink-secondary)" }}>
                                        {task.remarks}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : isCreatingTask ? (
                    /* Create Task Form */
                    <div>
                      <div className="mb-6">
                        <button
                          onClick={() => {
                            setIsCreatingTask(false);
                            setNewTask({
                              type: "Call",
                              priority: "Medium",
                              status: "Pending",
                              customer_id: customer.id
                            });
                          }}
                          className="flex items-center gap-2 text-[13px] transition-colors mb-4"
                          style={{ color: "#0F766E" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#0D6560";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#0F766E";
                          }}
                        >
                          <ArrowLeft size={16} />
                          Back to Tasks
                        </button>

                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", marginBottom: "24px" }}>
                          Create Task
                        </h3>

                        <div 
                          className="p-6 rounded-xl"
                          style={{ 
                            border: "1px solid var(--neuron-ui-border)",
                            backgroundColor: "#FAFAFA"
                          }}
                        >
                          <div className="space-y-6">
                            {/* Task Title */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Task Title *
                              </label>
                              <input
                                type="text"
                                value={newTask.title || ""}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="Enter task title..."
                                className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#12332B"
                                }}
                              />
                            </div>

                            {/* Type */}
                            <div>
                              <CustomDropdown
                                label="TYPE"
                                value={newTask.type || "Call"}
                                onChange={(value) => setNewTask({ ...newTask, type: value })}
                                options={[
                                  { value: "To-do", label: "To-do" },
                                  { value: "Call", label: "Call" },
                                  { value: "Email", label: "Email" },
                                  { value: "Meeting", label: "Meeting" },
                                  { value: "SMS", label: "SMS" },
                                  { value: "Viber", label: "Viber" },
                                  { value: "WhatsApp", label: "WhatsApp" },
                                  { value: "WeChat", label: "WeChat" },
                                  { value: "LinkedIn", label: "LinkedIn" },
                                  { value: "Marketing Email", label: "Marketing Email" }
                                ]}
                              />
                            </div>

                            {/* Due Date */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Due Date *
                              </label>
                              <input
                                type="date"
                                value={newTask.due_date || ""}
                                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#12332B"
                                }}
                              />
                            </div>

                            {/* Priority */}
                            <div>
                              <CustomDropdown
                                label="PRIORITY"
                                value={newTask.priority || "Medium"}
                                onChange={(value) => setNewTask({ ...newTask, priority: value as any })}
                                options={[
                                  { value: "Low", label: "Low" },
                                  { value: "Medium", label: "Medium" },
                                  { value: "High", label: "High" }
                                ]}
                              />
                            </div>

                            {/* Contact Selection */}
                            <div>
                              <CustomDropdown
                                label="RELATED CONTACT (OPTIONAL)"
                                value={newTask.contact_id || ""}
                                onChange={(value) => setNewTask({ ...newTask, contact_id: value })}
                                options={[
                                  { value: "", label: "Select a contact..." },
                                  ...customerContacts.map(contact => ({
                                    value: contact.id,
                                    label: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`
                                  }))
                                ]}
                                placeholder="Select a contact..."
                              />
                            </div>

                            {/* Remarks */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Remarks (Optional)
                              </label>
                              <textarea
                                value={newTask.remarks || ""}
                                onChange={(e) => setNewTask({ ...newTask, remarks: e.target.value })}
                                placeholder="Add any additional notes..."
                                className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                                rows={3}
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#12332B"
                                }}
                              />
                            </div>

                            {/* Attachments */}
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "#667085" }}>
                                Attachments (Optional)
                              </label>
                              <div 
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
                                style={{ borderColor: "var(--neuron-ui-border)", backgroundColor: "#FFFFFF" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "#0F766E";
                                  e.currentTarget.style.backgroundColor = "#E8F5F3";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                }}
                              >
                                <Upload size={24} className="mx-auto mb-2" style={{ color: "#667085" }} />
                                <p className="text-[13px]" style={{ color: "#667085" }}>
                                  Click to upload or drag and drop files
                                </p>
                              </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={handleCreateTask}
                                className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium text-white transition-colors"
                                style={{ backgroundColor: "#0F766E" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#0D6560";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#0F766E";
                                }}
                              >
                                Create Task
                              </button>
                              <button
                                onClick={() => {
                                  setIsCreatingTask(false);
                                  setNewTask({
                                    type: "Call",
                                    priority: "Medium",
                                    status: "Pending",
                                    customer_id: customer.id
                                  });
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                                style={{
                                  border: "1px solid var(--neuron-ui-border)",
                                  color: "var(--neuron-ink-secondary)",
                                  backgroundColor: "#FFFFFF"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedTask ? (
                    // Task Detail View
                    <TaskDetailInline
                      task={selectedTask}
                      onBack={() => {
                        setSelectedTask(null);
                        setEditedTask(null);
                        setIsEditingTask(false);
                      }}
                      customers={customer ? [customer] : []}
                      contacts={contacts}
                    />
                  ) : null}
                </div>
            )}

            {/* Inquiries Tab */}
            {activeTab === "inquiries" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                    Inquiries
                  </h3>
                  {onCreateInquiry && (
                    <button
                      onClick={() => onCreateInquiry(customer)}
                      className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2"
                      style={{
                        backgroundColor: "#0F766E",
                        color: "#FFFFFF"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0D6560";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#0F766E";
                      }}
                    >
                      <Plus size={16} />
                      Create Inquiry
                    </button>
                  )}
                </div>

                {isLoadingQuotations ? (
                  <div className="text-center py-12">
                    <p className="text-[14px]" style={{ color: "#667085" }}>Loading inquiries...</p>
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} style={{ color: "#D1D5DB", margin: "0 auto 16px" }} />
                    <p className="text-[14px]" style={{ color: "#667085" }}>No inquiries yet</p>
                    <p className="text-[12px] mt-2" style={{ color: "#9CA3AF" }}>
                      Inquiries from E-Quotation system will appear here
                    </p>
                  </div>
                ) : (
                  <div 
                    className="rounded-lg overflow-hidden"
                    style={{ 
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF"
                    }}
                  >
                    {/* Table Header */}
                    <div 
                      className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_0.8fr_0.8fr] gap-4 px-4 py-3"
                      style={{ 
                        backgroundColor: "#F9FAFB",
                        borderBottom: "1px solid var(--neuron-ui-divider)"
                      }}
                    >
                      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6B7A76" }}>
                        Inquiry #
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6B7A76" }}>
                        Services
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6B7A76" }}>
                        Movement
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6B7A76" }}>
                        Route
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6B7A76" }}>
                        Status
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6B7A76" }}>
                        Created
                      </div>
                    </div>

                    {/* Table Rows */}
                    <div>
                      {inquiries.map(inquiry => {
                        // Status badge styling
                        const getStatusStyle = (status: string) => {
                          const statusStyles: Record<string, { bg: string; text: string }> = {
                            'Draft': { bg: '#F3F4F6', text: '#6B7280' },
                            'Pending Pricing': { bg: '#FEF3C7', text: '#92400E' },
                            'Quoted': { bg: '#DBEAFE', text: '#1E40AF' },
                            'Sent': { bg: '#E0E7FF', text: '#4338CA' },
                            'pending': { bg: '#FEF3C7', text: '#92400E' },
                            'draft': { bg: '#F3F4F6', text: '#6B7280' }
                          };
                          return statusStyles[status] || { bg: '#F3F4F6', text: '#6B7280' };
                        };

                        const statusStyle = getStatusStyle(inquiry.status);

                        return (
                          <div
                            key={inquiry.id}
                            className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_0.8fr_0.8fr] gap-4 px-4 py-4 cursor-pointer transition-colors"
                            style={{ borderBottom: "1px solid var(--neuron-ui-divider)" }}
                            onClick={() => onViewInquiry && onViewInquiry(inquiry.id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#F9FAFB";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#FFFFFF";
                            }}
                          >
                            {/* Inquiry Number */}
                            <div>
                              <div className="text-[13px] font-medium mb-0.5" style={{ color: "#12332B" }}>
                                {inquiry.quotation_name || inquiry.quote_number}
                              </div>
                              <div className="text-[12px]" style={{ color: "#667085" }}>
                                {inquiry.quote_number}
                              </div>
                            </div>

                            {/* Services */}
                            <div className="text-[12px]" style={{ color: "#344054" }}>
                              {inquiry.services.join(", ")}
                            </div>

                            {/* Movement */}
                            <div className="text-[12px]" style={{ color: "#344054" }}>
                              {inquiry.movement}
                            </div>

                            {/* Route */}
                            <div className="text-[12px]" style={{ color: "#344054" }}>
                              {inquiry.pol_aol} → {inquiry.pod_aod}
                            </div>

                            {/* Status */}
                            <div>
                              <span 
                                className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                                style={{
                                  backgroundColor: statusStyle.bg,
                                  color: statusStyle.text
                                }}
                              >
                                {inquiry.status}
                              </span>
                            </div>

                            {/* Created Date */}
                            <div className="text-[12px]" style={{ color: "#667085" }}>
                              {formatDate(inquiry.created_at)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div>
                {/* Comments List */}
                <div className="space-y-4 mb-6">
                  {mockComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-lg"
                      style={{
                        background: comment.user_department === "BD" 
                          ? "#E8F5F3" 
                          : "var(--neuron-bg-card)",
                        border: comment.user_department === "BD"
                          ? "1.5px solid #0F766E"
                          : "1.5px solid var(--neuron-ui-border)",
                        marginLeft: comment.user_department === "BD" ? "40px" : "0",
                        marginRight: comment.user_department === "Pricing" ? "40px" : "0"
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ 
                          fontSize: "13px", 
                          fontWeight: 600, 
                          color: comment.user_department === "BD" 
                            ? "var(--neuron-brand-green)" 
                            : "var(--neuron-ink-primary)" 
                        }}>
                          {comment.user_name}
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded text-[11px]"
                          style={{ 
                            background: comment.user_department === "BD" ? "#0F766E" : "#6B7A76",
                            color: "#FFFFFF",
                            fontWeight: 500
                          }}
                        >
                          {comment.user_department}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--neuron-ink-muted)" }}>
                          {formatCommentDateTime(comment.created_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--neuron-ink-secondary)" }}>
                        {comment.message}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div 
                  className="sticky bottom-0 p-4 rounded-lg"
                  style={{
                    background: "var(--neuron-bg-card)",
                    border: "1.5px solid var(--neuron-ui-border)"
                  }}
                >
                  <div className="flex gap-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment for Pricing team..."
                      rows={3}
                      className="flex-1 px-3 py-2 rounded-lg resize-none"
                      style={{
                        border: "1.5px solid var(--neuron-ui-border)",
                        background: "var(--neuron-bg-input)",
                        color: "var(--neuron-ink-primary)",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{
                        background: newComment.trim() ? "#0F766E" : "#E5E7EB",
                        color: newComment.trim() ? "#FFFFFF" : "#9CA3AF",
                        border: "none",
                        cursor: newComment.trim() ? "pointer" : "not-allowed",
                        height: "fit-content"
                      }}
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Panel */}
      <AddContactPanel
        isOpen={isAddContactPanelOpen}
        onClose={() => setIsAddContactPanelOpen(false)}
        prefilledCustomerId={customer.id}
        prefilledCustomerName={customer.company_name || customer.name}
        onSave={async (contactData) => {
          try {
            console.log('[CustomerDetail] Creating contact for customer:', customer.id);
            // Pre-populate customer_id with this customer
            const newContactData = {
              ...contactData,
              customer_id: customer.id, // Set the current customer as the company
            };
            
            const response = await fetch(`${API_URL}/contacts`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newContactData),
            });
            
            const result = await response.json();
            
            if (result.success) {
              console.log('✅ Contact created successfully:', result.data);
              // Refresh contacts list
              fetchCustomerDetails();
            } else {
              console.error('❌ Failed to create contact:', result.error);
            }
          } catch (error) {
            console.error('❌ Error creating contact:', error);
          }
        }}
      />
    </div>
  );
}