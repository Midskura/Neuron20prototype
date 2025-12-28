import { useState } from "react";
import { ArrowLeft, MoreVertical, Lock, Edit3, Clock, ChevronRight, User } from "lucide-react";
import type { ForwardingBooking, ExecutionStatus } from "../../../types/operations";
import { BillingsTab } from "../shared/BillingsTab";
import { ExpensesTab } from "../shared/ExpensesTab";

interface ForwardingBookingDetailsProps {
  booking: ForwardingBooking;
  onBack: () => void;
  onBookingUpdated: () => void;
  currentUser?: { name: string; email: string; department: string } | null;
}

type DetailTab = "booking-info" | "billings" | "expenses";

const STATUS_COLORS: Record<ExecutionStatus, string> = {
  "Draft": "bg-gray-100 text-gray-700 border-gray-300",
  "Confirmed": "bg-blue-50 text-blue-700 border-blue-300",
  "In Progress": "bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/30",
  "Pending": "bg-amber-50 text-amber-700 border-amber-300",
  "On Hold": "bg-orange-50 text-orange-700 border-orange-300",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-300",
  "Cancelled": "bg-red-50 text-red-700 border-red-300",
};

// Activity Timeline Data Structure
interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: "field_updated" | "status_changed" | "created" | "note_added";
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  statusFrom?: ExecutionStatus;
  statusTo?: ExecutionStatus;
  note?: string;
}

// Initial mock activity data - starting point
const initialActivityLog: ActivityLogEntry[] = [
  {
    id: "init-1",
    timestamp: new Date("2024-12-22T16:45:00"),
    user: "System",
    action: "created"
  },
];

// Field locking rules based on status
function isFieldLocked(fieldName: string, status: ExecutionStatus): { locked: boolean; reason: string } {
  // Completed bookings - lock all operational fields
  if (status === "Completed") {
    const operationalFields = [
      "accountHandler", "typeOfEntry", "cargoType", "deliveryAddress",
      "consignee", "shipper", "mblMawb", "hblHawb", "registryNumber",
      "carrier", "forwarder", "countryOfOrigin", "aolPol", "aodPod",
      "eta", "grossWeight", "dimensions", "commodityDescription",
      "preferentialTreatment", "warehouseLocation"
    ];
    
    if (operationalFields.includes(fieldName)) {
      return { locked: true, reason: "This field is locked because the booking is Completed" };
    }
  }

  // Cancelled bookings - lock everything
  if (status === "Cancelled") {
    return { locked: true, reason: "This field is locked because the booking is Cancelled" };
  }

  // In Progress - lock routing and carrier information
  if (status === "In Progress") {
    const routingFields = ["aolPol", "aodPod", "carrier", "forwarder"];
    if (routingFields.includes(fieldName)) {
      return { locked: true, reason: "This field is locked because the booking is In Progress" };
    }
  }

  // Confirmed - lock customer-facing fields
  if (status === "Confirmed" || status === "In Progress") {
    const customerFields = ["deliveryAddress", "cargoType", "typeOfEntry"];
    if (customerFields.includes(fieldName)) {
      return { locked: true, reason: "This field is locked because the booking is Confirmed" };
    }
  }

  return { locked: false, reason: "" };
}

export function ForwardingBookingDetails({
  booking,
  onBack,
  onBookingUpdated,
  currentUser
}: ForwardingBookingDetailsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("booking-info");
  const [showTimeline, setShowTimeline] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(initialActivityLog);
  
  // Local state to track edited booking values
  const [editedBooking, setEditedBooking] = useState<ForwardingBooking>(booking);

  // Function to add new activity
  const addActivity = (
    fieldName: string,
    oldValue: string,
    newValue: string
  ) => {
    const newActivity: ActivityLogEntry = {
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      user: currentUser?.name || "Current User",
      action: "field_updated",
      fieldName,
      oldValue,
      newValue
    };

    setActivityLog(prev => [newActivity, ...prev]);
  };

  return (
    <div style={{ 
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}>
      {/* Header Bar */}
      <div style={{
        padding: "20px 48px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        backgroundColor: "#F8FBFB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: "var(--neuron-ink-secondary)",
              cursor: "pointer",
              fontSize: "13px",
              marginBottom: "12px",
              padding: "0"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--neuron-brand-green)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }}
          >
            <ArrowLeft size={16} />
            Back to Forwarding Bookings
          </button>
          
          <h1 style={{ 
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            marginBottom: "4px"
          }}>
            {booking.customerName}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--neuron-ink-muted)", margin: 0 }}>
            {booking.bookingId}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Activity Timeline Button */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: showTimeline ? "#E8F2EE" : "white",
              border: `1.5px solid ${showTimeline ? "#0F766E" : "var(--neuron-ui-border)"}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: showTimeline ? "#0F766E" : "var(--neuron-ink-secondary)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (!showTimeline) {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }
            }}
            onMouseLeave={(e) => {
              if (!showTimeline) {
                e.currentTarget.style.backgroundColor = "white";
              }
            }}
          >
            <Clock size={16} />
            Activity
          </button>

          {/* Status Badge */}
          <div style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            backgroundColor: booking.status === "Draft" ? "#F3F4F6" : 
                           booking.status === "In Progress" ? "#E8F2EE" :
                           booking.status === "Completed" ? "#D1FAE5" :
                           booking.status === "Cancelled" ? "#FEE2E2" : "#FFF3E0",
            color: booking.status === "Draft" ? "#6B7280" :
                   booking.status === "In Progress" ? "#0F766E" :
                   booking.status === "Completed" ? "#10B981" :
                   booking.status === "Cancelled" ? "#EF4444" : "#F59E0B",
            border: `1px solid ${booking.status === "Draft" ? "#E5E7EB" : 
                                 booking.status === "In Progress" ? "#0F766E33" :
                                 booking.status === "Completed" ? "#10B98133" :
                                 booking.status === "Cancelled" ? "#EF444433" : "#F59E0B33"}`
          }}>
            {booking.status}
          </div>

          {/* Kebab Menu */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              backgroundColor: "white",
              border: "1.5px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        padding: "0 48px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        backgroundColor: "white",
        display: "flex",
        gap: "32px"
      }}>
        <button
          onClick={() => setActiveTab("booking-info")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "booking-info" ? "2px solid #0F766E" : "2px solid transparent",
            color: activeTab === "booking-info" ? "#0F766E" : "#667085",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
        >
          Booking Information
        </button>
        <button
          onClick={() => setActiveTab("billings")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "billings" ? "2px solid #0F766E" : "2px solid transparent",
            color: activeTab === "billings" ? "#0F766E" : "#667085",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
        >
          Billings
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "expenses" ? "2px solid #0F766E" : "2px solid transparent",
            color: activeTab === "expenses" ? "#0F766E" : "#667085",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
        >
          Expenses
        </button>
      </div>

      {/* Content with Timeline Sidebar */}
      <div style={{ 
        flex: 1,
        overflow: "hidden",
        display: "flex"
      }}>
        {/* Main Content */}
        <div style={{ 
          flex: showTimeline ? "0 0 65%" : "1",
          overflow: "auto",
          transition: "flex 0.3s ease"
        }}>
          {activeTab === "booking-info" && (
            <BookingInformationTab
              booking={editedBooking}
              onBookingUpdated={onBookingUpdated}
              addActivity={addActivity}
              setEditedBooking={setEditedBooking}
            />
          )}
          {activeTab === "billings" && (
            <BillingsTab
              bookingId={booking.bookingId}
              bookingType="forwarding"
              currentUser={currentUser}
            />
          )}
          {activeTab === "expenses" && (
            <ExpensesTab
              bookingId={booking.bookingId}
              bookingType="forwarding"
              currentUser={currentUser}
            />
          )}
        </div>

        {/* Timeline Sidebar */}
        {showTimeline && (
          <div style={{
            flex: "0 0 35%",
            borderLeft: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FAFBFC",
            overflow: "auto"
          }}>
            <ActivityTimeline activities={activityLog} />
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Timeline Component
function ActivityTimeline({ activities }: { activities: ActivityLogEntry[] }) {
  return (
    <div style={{ padding: "24px" }}>
      <h3 style={{
        fontSize: "16px",
        fontWeight: 600,
        color: "var(--neuron-brand-green)",
        marginBottom: "20px"
      }}>
        Activity Timeline
      </h3>

      <div style={{ position: "relative" }}>
        {/* Timeline Line */}
        <div style={{
          position: "absolute",
          left: "15px",
          top: "0",
          bottom: "0",
          width: "2px",
          backgroundColor: "#E5E7EB"
        }} />

        {/* Activity Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activities.map((activity, index) => (
            <div key={activity.id} style={{ position: "relative", paddingLeft: "40px" }}>
              {/* Timeline Dot */}
              <div style={{
                position: "absolute",
                left: "8px",
                top: "4px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: activity.action === "status_changed" ? "#0F766E" :
                               activity.action === "created" ? "#6B7280" :
                               activity.action === "field_updated" ? "#3B82F6" : "#F59E0B",
                border: "3px solid #FAFBFC"
              }} />

              {/* Activity Content */}
              <div style={{
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                padding: "12px 16px"
              }}>
                {/* Timestamp */}
                <div style={{
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)",
                  marginBottom: "6px"
                }}>
                  {activity.timestamp.toLocaleString()}
                </div>

                {/* Action Description */}
                {activity.action === "field_updated" && (
                  <div>
                    <div style={{
                      fontSize: "13px",
                      color: "var(--neuron-ink-base)",
                      marginBottom: "4px"
                    }}>
                      <span style={{ fontWeight: 600 }}>{activity.fieldName}</span> updated
                    </div>
                    {activity.oldValue && activity.newValue && (
                      <div style={{
                        fontSize: "12px",
                        color: "var(--neuron-ink-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "6px"
                      }}>
                        <span style={{
                          padding: "2px 8px",
                          backgroundColor: "#FEE2E2",
                          borderRadius: "4px",
                          textDecoration: "line-through",
                          color: "#EF4444"
                        }}>
                          {activity.oldValue || "(empty)"}
                        </span>
                        <ChevronRight size={12} />
                        <span style={{
                          padding: "2px 8px",
                          backgroundColor: "#D1FAE5",
                          borderRadius: "4px",
                          color: "#10B981"
                        }}>
                          {activity.newValue}
                        </span>
                      </div>
                    )}
                    {!activity.oldValue && activity.newValue && (
                      <div style={{
                        fontSize: "12px",
                        color: "var(--neuron-ink-secondary)",
                        marginTop: "6px"
                      }}>
                        Set to: <span style={{
                          padding: "2px 8px",
                          backgroundColor: "#D1FAE5",
                          borderRadius: "4px",
                          color: "#10B981",
                          fontWeight: 500
                        }}>
                          {activity.newValue}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {activity.action === "status_changed" && (
                  <div>
                    <div style={{
                      fontSize: "13px",
                      color: "var(--neuron-ink-base)",
                      marginBottom: "6px"
                    }}>
                      Status changed
                    </div>
                    <div style={{
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span style={{
                        padding: "4px 10px",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "4px",
                        color: "#6B7280",
                        fontSize: "11px",
                        fontWeight: 500
                      }}>
                        {activity.statusFrom}
                      </span>
                      <ChevronRight size={12} />
                      <span style={{
                        padding: "4px 10px",
                        backgroundColor: "#E8F2EE",
                        borderRadius: "4px",
                        color: "#0F766E",
                        fontSize: "11px",
                        fontWeight: 500
                      }}>
                        {activity.statusTo}
                      </span>
                    </div>
                  </div>
                )}

                {activity.action === "created" && (
                  <div style={{
                    fontSize: "13px",
                    color: "var(--neuron-ink-base)"
                  }}>
                    Booking created
                  </div>
                )}

                {/* User */}
                <div style={{
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)",
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <User size={10} />
                  {activity.user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reusable Field Components
interface LockedFieldProps {
  label: string;
  value: string;
  tooltip?: string;
}

function LockedField({ label, value, tooltip = "This field is locked because it's inherited from the Project" }: LockedFieldProps) {
  return (
    <div>
      <label style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--neuron-ink-base)",
        marginBottom: "8px"
      }}>
        {label}
        <Lock size={12} color="#9CA3AF" title={tooltip} style={{ cursor: "help" }} />
      </label>
      <div style={{
        padding: "10px 14px",
        backgroundColor: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: "6px",
        fontSize: "14px",
        color: "#6B7280",
        cursor: "not-allowed"
      }}>
        {value || "—"}
      </div>
    </div>
  );
}

interface EditableFieldProps {
  fieldName: string;
  label: string;
  value: string;
  type?: "text" | "date" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  status: ExecutionStatus;
  onSave?: (value: string) => void;
}

function EditableField({ 
  fieldName,
  label, 
  value, 
  type = "text", 
  options = [],
  required = false,
  placeholder = "Click to add...",
  status,
  onSave
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const lockStatus = isFieldLocked(fieldName, status);
  const isEmpty = !value || value.trim() === "";

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (onSave) {
      onSave(editValue);
    }
    
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditing(false);
    
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  // If field is locked by status, show as locked field
  if (lockStatus.locked) {
    return (
      <div>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--neuron-ink-base)",
          marginBottom: "8px"
        }}>
          {label}
          {required && <span style={{ color: "#EF4444" }}>*</span>}
          <Lock size={12} color="#9CA3AF" title={lockStatus.reason} style={{ cursor: "help" }} />
        </label>
        <div style={{
          padding: "10px 14px",
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: "6px",
          fontSize: "14px",
          color: "#6B7280",
          cursor: "not-allowed"
        }}>
          {value || "—"}
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <label style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--neuron-ink-base)",
          marginBottom: "8px"
        }}>
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
        <div style={{ position: "relative" }}>
          {type === "textarea" ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              autoFocus
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "white",
                border: "2px solid #0F766E",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--neuron-ink-primary)",
                outline: "none",
                resize: "vertical"
              }}
            />
          ) : type === "select" ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "white",
                border: "2px solid #0F766E",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--neuron-ink-primary)",
                outline: "none"
              }}
            >
              <option value="">Select...</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "white",
                border: "2px solid #0F766E",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--neuron-ink-primary)",
                outline: "none"
              }}
            />
          )}
          {isSaving && (
            <span style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "#0F766E"
            }}>
              Saving...
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--neuron-ink-base)",
        marginBottom: "8px"
      }}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      <div
        onClick={() => setIsEditing(true)}
        style={{
          padding: "10px 14px",
          backgroundColor: isEmpty ? "white" : "#FAFBFC",
          border: isEmpty && required ? "2px dashed #FCD34D" : isEmpty ? "2px dashed #E5E7EB" : "1px solid #E5E7EB",
          borderRadius: "6px",
          fontSize: "14px",
          color: isEmpty ? "#9CA3AF" : "var(--neuron-ink-primary)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          minHeight: type === "textarea" ? "80px" : "auto"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#0F766E";
          e.currentTarget.style.backgroundColor = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isEmpty && required ? "#FCD34D" : "#E5E7EB";
          e.currentTarget.style.backgroundColor = isEmpty ? "white" : "#FAFBFC";
        }}
      >
        {isEmpty ? (
          <span style={{ color: "#9CA3AF" }}>{placeholder}</span>
        ) : type === "date" && value ? (
          new Date(value).toLocaleDateString()
        ) : (
          value
        )}
        {!isEmpty && (
          <Edit3 
            size={14} 
            style={{ 
              position: "absolute", 
              right: "14px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "#9CA3AF",
              opacity: 0
            }}
            className="edit-icon"
          />
        )}
        {saveSuccess && (
          <span style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "12px",
            color: "#10B981"
          }}>
            ✓ Saved
          </span>
        )}
      </div>
      <style>{`
        div:hover .edit-icon {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

// Booking Information Tab Component
function BookingInformationTab({
  booking,
  onBookingUpdated,
  addActivity,
  setEditedBooking
}: {
  booking: ForwardingBooking;
  onBookingUpdated: () => void;
  addActivity: (fieldName: string, oldValue: string, newValue: string) => void;
  setEditedBooking: (booking: ForwardingBooking) => void;
}) {
  
  // Helper to format field names for activity log
  const formatFieldName = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      accountHandler: "Account Handler",
      typeOfEntry: "Type of Entry",
      cargoType: "Cargo Type",
      deliveryAddress: "Delivery Address",
      consignee: "Consignee",
      shipper: "Shipper",
      mblMawb: "MBL/MAWB",
      hblHawb: "HBL/HAWB",
      registryNumber: "Registry Number",
      carrier: "Carrier",
      forwarder: "Forwarder",
      countryOfOrigin: "Country of Origin",
      aolPol: "AOL/POL",
      aodPod: "AOD/POD",
      eta: "ETA",
      grossWeight: "Gross Weight",
      dimensions: "Dimensions",
      commodityDescription: "Commodity Description",
      preferentialTreatment: "Preferential Treatment",
      warehouseLocation: "Warehouse Location"
    };
    return fieldLabels[fieldName] || fieldName;
  };
  
  return (
    <div style={{ 
      padding: "32px 48px",
      maxWidth: "1400px",
      margin: "0 auto"
    }}>
      
      {/* General Information Section */}
      <div style={{
        backgroundColor: "white",
        border: "1px solid var(--neuron-ui-border)",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--neuron-brand-green)",
            margin: 0
          }}>
            General Information
          </h2>
          <span style={{
            fontSize: "12px",
            color: "var(--neuron-ink-muted)"
          }}>
            Last updated by {booking.accountHandler || "System"}, {new Date(booking.updatedAt).toLocaleString()}
          </span>
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          {/* Row 1: Customer Name, Account Owner */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <LockedField 
              label="Customer Name" 
              value={booking.customerName}
            />
            <LockedField 
              label="Account Owner" 
              value={booking.accountOwner || ""}
            />
          </div>

          {/* Row 2: Account Handler, Mode, Type of Entry */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="accountHandler"
              label="Account Handler"
              value={booking.accountHandler || ""}
              status={booking.status}
              placeholder="Assign handler..."
              onSave={(value) => {
                console.log("Saving Account Handler:", value);
                onBookingUpdated();
                addActivity("accountHandler", booking.accountHandler || "", value);
                setEditedBooking(prev => ({ ...prev, accountHandler: value }));
              }}
            />
            <LockedField 
              label="Mode" 
              value={booking.mode}
            />
            <EditableField
              fieldName="typeOfEntry"
              label="Type of Entry"
              value={booking.typeOfEntry || ""}
              status={booking.status}
              placeholder="Enter type..."
              onSave={(value) => {
                console.log("Saving Type of Entry:", value);
                onBookingUpdated();
                addActivity("typeOfEntry", booking.typeOfEntry || "", value);
                setEditedBooking(prev => ({ ...prev, typeOfEntry: value }));
              }}
            />
          </div>

          {/* Row 3: Cargo Type, Quotation Reference, Project Number */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="cargoType"
              label="Cargo Type"
              value={booking.cargoType || ""}
              status={booking.status}
              placeholder="Enter cargo type..."
              onSave={(value) => {
                console.log("Saving Cargo Type:", value);
                onBookingUpdated();
                addActivity("cargoType", booking.cargoType || "", value);
                setEditedBooking(prev => ({ ...prev, cargoType: value }));
              }}
            />
            <LockedField 
              label="Quotation Reference" 
              value={booking.quotationReferenceNumber || ""}
            />
            {booking.projectNumber && (
              <LockedField 
                label="Project Number" 
                value={booking.projectNumber}
              />
            )}
          </div>

          {/* Row 4: Delivery Address */}
          <EditableField
            fieldName="deliveryAddress"
            label="Delivery Address"
            value={booking.deliveryAddress || ""}
            type="textarea"
            status={booking.status}
            placeholder="Enter delivery address..."
            onSave={(value) => {
              console.log("Saving Delivery Address:", value);
              onBookingUpdated();
              addActivity("deliveryAddress", booking.deliveryAddress || "", value);
              setEditedBooking(prev => ({ ...prev, deliveryAddress: value }));
            }}
          />
        </div>

        {/* Status-dependent fields */}
        {booking.status === "Pending" && booking.pendingReason && (
          <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#FFF3E0", border: "1px solid #F59E0B33", borderRadius: "8px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#F59E0B", marginBottom: "8px" }}>
              Pending Reason
            </label>
            <p style={{ fontSize: "14px", color: "#F59E0B", margin: 0 }}>{booking.pendingReason}</p>
          </div>
        )}
        {booking.status === "Cancelled" && (
          <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#FEE2E2", border: "1px solid #EF444433", borderRadius: "8px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#EF4444", marginBottom: "8px" }}>
              Cancellation Reason
            </label>
            <p style={{ fontSize: "14px", color: "#EF4444", margin: "0 0 12px" }}>{booking.cancellationReason}</p>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#EF4444", marginBottom: "8px" }}>
              Cancelled Date
            </label>
            <p style={{ fontSize: "14px", color: "#EF4444", margin: 0 }}>
              {booking.cancelledDate ? new Date(booking.cancelledDate).toLocaleDateString() : "—"}
            </p>
          </div>
        )}
      </div>

      {/* Shipment Information Section */}
      <div style={{
        backgroundColor: "white",
        border: "1px solid var(--neuron-ui-border)",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--neuron-brand-green)",
            margin: 0
          }}>
            Shipment Information
          </h2>
          <span style={{
            fontSize: "12px",
            color: "var(--neuron-ink-muted)"
          }}>
            {booking.status === "Completed" ? "All fields locked" : "Click any field to edit"}
          </span>
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          {/* Row 1: Consignee, Shipper */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="consignee"
              label="Consignee"
              value={booking.consignee || ""}
              status={booking.status}
              placeholder="Click to add consignee..."
              required
              onSave={(value) => {
                console.log("Saving Consignee:", value);
                onBookingUpdated();
                addActivity("consignee", booking.consignee || "", value);
                setEditedBooking(prev => ({ ...prev, consignee: value }));
              }}
            />
            <EditableField
              fieldName="shipper"
              label="Shipper"
              value={booking.shipper || ""}
              status={booking.status}
              placeholder="Click to add shipper..."
              required
              onSave={(value) => {
                console.log("Saving Shipper:", value);
                onBookingUpdated();
                addActivity("shipper", booking.shipper || "", value);
                setEditedBooking(prev => ({ ...prev, shipper: value }));
              }}
            />
          </div>

          {/* Row 2: MBL/MAWB, HBL/HAWB, Registry Number */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="mblMawb"
              label="MBL/MAWB"
              value={booking.mblMawb || ""}
              status={booking.status}
              placeholder="Enter MBL/MAWB..."
              onSave={(value) => {
                console.log("Saving MBL/MAWB:", value);
                onBookingUpdated();
                addActivity("mblMawb", booking.mblMawb || "", value);
                setEditedBooking(prev => ({ ...prev, mblMawb: value }));
              }}
            />
            <EditableField
              fieldName="hblHawb"
              label="HBL/HAWB"
              value={booking.hblHawb || ""}
              status={booking.status}
              placeholder="Enter HBL/HAWB..."
              onSave={(value) => {
                console.log("Saving HBL/HAWB:", value);
                onBookingUpdated();
                addActivity("hblHawb", booking.hblHawb || "", value);
                setEditedBooking(prev => ({ ...prev, hblHawb: value }));
              }}
            />
            <EditableField
              fieldName="registryNumber"
              label="Registry Number"
              value={booking.registryNumber || ""}
              status={booking.status}
              placeholder="Enter registry number..."
              onSave={(value) => {
                console.log("Saving Registry Number:", value);
                onBookingUpdated();
                addActivity("registryNumber", booking.registryNumber || "", value);
                setEditedBooking(prev => ({ ...prev, registryNumber: value }));
              }}
            />
          </div>

          {/* Row 3: Carrier, Forwarder, Country of Origin */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="carrier"
              label="Carrier"
              value={booking.carrier || ""}
              status={booking.status}
              placeholder="Enter carrier..."
              onSave={(value) => {
                console.log("Saving Carrier:", value);
                onBookingUpdated();
                addActivity("carrier", booking.carrier || "", value);
                setEditedBooking(prev => ({ ...prev, carrier: value }));
              }}
            />
            <EditableField
              fieldName="forwarder"
              label="Forwarder"
              value={booking.forwarder || ""}
              status={booking.status}
              placeholder="Enter forwarder..."
              onSave={(value) => {
                console.log("Saving Forwarder:", value);
                onBookingUpdated();
                addActivity("forwarder", booking.forwarder || "", value);
                setEditedBooking(prev => ({ ...prev, forwarder: value }));
              }}
            />
            <EditableField
              fieldName="countryOfOrigin"
              label="Country of Origin"
              value={booking.countryOfOrigin || ""}
              status={booking.status}
              placeholder="Enter country..."
              onSave={(value) => {
                console.log("Saving Country of Origin:", value);
                onBookingUpdated();
                addActivity("countryOfOrigin", booking.countryOfOrigin || "", value);
                setEditedBooking(prev => ({ ...prev, countryOfOrigin: value }));
              }}
            />
          </div>

          {/* Row 4: AOL/POL, AOD/POD, ETA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="aolPol"
              label="AOL/POL"
              value={booking.aolPol || ""}
              status={booking.status}
              placeholder="Enter airport/port of loading..."
              onSave={(value) => {
                console.log("Saving AOL/POL:", value);
                onBookingUpdated();
                addActivity("aolPol", booking.aolPol || "", value);
                setEditedBooking(prev => ({ ...prev, aolPol: value }));
              }}
            />
            <EditableField
              fieldName="aodPod"
              label="AOD/POD"
              value={booking.aodPod || ""}
              status={booking.status}
              placeholder="Enter airport/port of discharge..."
              onSave={(value) => {
                console.log("Saving AOD/POD:", value);
                onBookingUpdated();
                addActivity("aodPod", booking.aodPod || "", value);
                setEditedBooking(prev => ({ ...prev, aodPod: value }));
              }}
            />
            <EditableField
              fieldName="eta"
              label="ETA"
              value={booking.eta ? new Date(booking.eta).toISOString().split('T')[0] : ""}
              type="date"
              status={booking.status}
              placeholder="Set ETA..."
              onSave={(value) => {
                console.log("Saving ETA:", value);
                onBookingUpdated();
                addActivity("eta", booking.eta || "", value);
                setEditedBooking(prev => ({ ...prev, eta: value }));
              }}
            />
          </div>

          {/* Row 5: Gross Weight, Dimensions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="grossWeight"
              label="Gross Weight"
              value={booking.grossWeight || ""}
              status={booking.status}
              placeholder="Enter weight (e.g., 1000 kg)..."
              onSave={(value) => {
                console.log("Saving Gross Weight:", value);
                onBookingUpdated();
                addActivity("grossWeight", booking.grossWeight || "", value);
                setEditedBooking(prev => ({ ...prev, grossWeight: value }));
              }}
            />
            <EditableField
              fieldName="dimensions"
              label="Dimensions"
              value={booking.dimensions || ""}
              status={booking.status}
              placeholder="Enter dimensions (e.g., 120x80x100 cm)..."
              onSave={(value) => {
                console.log("Saving Dimensions:", value);
                onBookingUpdated();
                addActivity("dimensions", booking.dimensions || "", value);
                setEditedBooking(prev => ({ ...prev, dimensions: value }));
              }}
            />
          </div>

          {/* Row 6: Commodity Description */}
          <EditableField
            fieldName="commodityDescription"
            label="Commodity Description"
            value={booking.commodityDescription || ""}
            type="textarea"
            status={booking.status}
            placeholder="Enter detailed commodity description..."
            onSave={(value) => {
              console.log("Saving Commodity Description:", value);
              onBookingUpdated();
              addActivity("commodityDescription", booking.commodityDescription || "", value);
              setEditedBooking(prev => ({ ...prev, commodityDescription: value }));
            }}
          />

          {/* Preferential Treatment */}
          <EditableField
            fieldName="preferentialTreatment"
            label="Preferential Treatment"
            value={booking.preferentialTreatment || ""}
            status={booking.status}
            placeholder="Enter preferential treatment details..."
            onSave={(value) => {
              console.log("Saving Preferential Treatment:", value);
              onBookingUpdated();
              addActivity("preferentialTreatment", booking.preferentialTreatment || "", value);
              setEditedBooking(prev => ({ ...prev, preferentialTreatment: value }));
            }}
          />
        </div>
      </div>

      {/* Container Details (FCL only) */}
      {booking.mode === "FCL" && (
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--neuron-brand-green)",
            marginBottom: "20px"
          }}>
            Container Details
          </h2>

          <div style={{ display: "grid", gap: "20px" }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Container Numbers
              </label>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#FAFBFC",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--neuron-ink-primary)"
              }}>
                {booking.containerNumbers && booking.containerNumbers.length > 0
                  ? booking.containerNumbers.join(", ")
                  : "—"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  Det/Dem Validity
                </label>
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#FAFBFC",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "var(--neuron-ink-primary)"
                }}>
                  {booking.detDemValidity ? new Date(booking.detDemValidity).toLocaleDateString() : "—"}
                </div>
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  Storage Validity
                </label>
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#FAFBFC",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "var(--neuron-ink-primary)"
                }}>
                  {booking.storageValidity ? new Date(booking.storageValidity).toLocaleDateString() : "—"}
                </div>
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  CRO Availability
                </label>
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#FAFBFC",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "var(--neuron-ink-primary)"
                }}>
                  {booking.croAvailability ? new Date(booking.croAvailability).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  Container Deposit
                </label>
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#FAFBFC",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "var(--neuron-ink-primary)"
                }}>
                  {booking.containerDeposit ? "Yes" : "No"}
                </div>
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  Empty Return
                </label>
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#FAFBFC",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "var(--neuron-ink-primary)"
                }}>
                  {booking.emptyReturn || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Details (LCL/AIR only) */}
      {(booking.mode === "LCL" || booking.mode === "AIR") && (
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--neuron-brand-green)",
            marginBottom: "20px"
          }}>
            Warehouse Details
          </h2>

          <EditableField
            fieldName="warehouseLocation"
            label="Warehouse Location"
            value={booking.warehouseLocation || ""}
            status={booking.status}
            placeholder="Enter warehouse location..."
            onSave={(value) => {
              console.log("Saving Warehouse Location:", value);
              onBookingUpdated();
              addActivity("warehouseLocation", booking.warehouseLocation || "", value);
              setEditedBooking(prev => ({ ...prev, warehouseLocation: value }));
            }}
          />
        </div>
      )}
    </div>
  );
}