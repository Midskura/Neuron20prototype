import { useState } from "react";
import { ArrowLeft, MoreVertical, Lock, Edit3, Clock, ChevronRight } from "lucide-react";
import type { OthersBooking, ExecutionStatus } from "../../types/operations";
import { BillingsTab } from "./shared/BillingsTab";
import { ExpensesTab } from "./shared/ExpensesTab";
import { BookingCommentsTab } from "../shared/BookingCommentsTab";

interface OthersBookingDetailsProps {
  booking: OthersBooking;
  onBack: () => void;
  onUpdate: () => void;
  currentUser?: { name: string; email: string; department: string } | null;
}

type DetailTab = "booking-info" | "billings" | "expenses" | "comments";

const STATUS_COLORS: Record<ExecutionStatus, string> = {
  "Draft": "bg-gray-100 text-gray-700 border-gray-300",
  "Confirmed": "bg-blue-50 text-blue-700 border-blue-300",
  "In Progress": "bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/30",
  "Pending": "bg-amber-50 text-amber-700 border-amber-300",
  "On Hold": "bg-orange-50 text-orange-700 border-orange-300",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-300",
  "Cancelled": "bg-red-50 text-red-700 border-red-300",
};

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

const initialActivityLog: ActivityLogEntry[] = [
  {
    id: "init-1",
    timestamp: new Date(),
    user: "System",
    action: "created"
  },
];

// NOTE: All fields are now editable regardless of status since changes are tracked in activity log
function isFieldLocked(fieldName: string, status: ExecutionStatus): { locked: boolean; reason: string } {
  // All fields are editable - changes will be tracked in the activity log
  return { locked: false, reason: "" };
}

export function OthersBookingDetails({
  booking,
  onBack,
  onUpdate,
  currentUser
}: OthersBookingDetailsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("booking-info");
  const [showTimeline, setShowTimeline] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(initialActivityLog);
  const [editedBooking, setEditedBooking] = useState<OthersBooking>(booking);

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
            Back to Others Bookings
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
        <button
          onClick={() => setActiveTab("comments")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "comments" ? "2px solid #0F766E" : "2px solid transparent",
            color: activeTab === "comments" ? "#0F766E" : "#667085",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
        >
          Comments
        </button>
      </div>

      {/* Content with Timeline Sidebar */}
      <div style={{ 
        flex: 1,
        overflow: "hidden",
        display: "flex"
      }}>
        <div style={{ 
          flex: showTimeline ? "0 0 65%" : "1",
          overflow: "auto",
          transition: "flex 0.3s ease"
        }}>
          {activeTab === "booking-info" && (
            <BookingInformationTab
              booking={editedBooking}
              onBookingUpdated={onUpdate}
              addActivity={addActivity}
              setEditedBooking={setEditedBooking}
            />
          )}
          {activeTab === "billings" && (
            <BillingsTab
              bookingId={booking.bookingId}
              bookingType="others"
              currentUser={currentUser}
            />
          )}
          {activeTab === "expenses" && (
            <ExpensesTab
              bookingId={booking.bookingId}
              bookingType="others"
              currentUser={currentUser}
            />
          )}
          {activeTab === "comments" && (
            <BookingCommentsTab
              bookingId={booking.bookingId}
              currentUserId={currentUser?.email || "unknown"}
              currentUserName={currentUser?.name || "Unknown User"}
              currentUserDepartment={currentUser?.department || "Operations"}
            />
          )}
        </div>

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
        <div style={{
          position: "absolute",
          left: "15px",
          top: "0",
          bottom: "0",
          width: "2px",
          backgroundColor: "#E5E7EB"
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activities.map((activity) => (
            <div key={activity.id} style={{ position: "relative", paddingLeft: "40px" }}>
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

              <div style={{
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                padding: "12px 16px"
              }}>
                <div style={{
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)",
                  marginBottom: "6px"
                }}>
                  {activity.timestamp.toLocaleString()}
                </div>

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

                <div style={{
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)",
                  marginTop: "8px"
                }}>
                  by {activity.user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Locked Field Component
function LockedField({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
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
          position: "relative",
          padding: "10px 14px",
          backgroundColor: isEmpty ? "white" : "#FAFBFC",
          border: `1px solid ${isEmpty && required ? "#FCD34D" : "#E5E7EB"}`,
          borderRadius: "6px",
          fontSize: "14px",
          color: isEmpty ? "#9CA3AF" : "var(--neuron-ink-primary)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          minHeight: type === "textarea" ? "80px" : "42px"
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
        {/* Removed "✓ Saved" indicator */}
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
  booking: OthersBooking;
  onBookingUpdated: () => void;
  addActivity: (fieldName: string, oldValue: string, newValue: string) => void;
  setEditedBooking: (booking: OthersBooking) => void;
}) {
  
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="accountHandler"
              label="Account Handler"
              value={booking.accountHandler || ""}
              status={booking.status}
              placeholder="Assign handler..."
              onSave={(value) => {
                onBookingUpdated();
                addActivity("Account Handler", booking.accountHandler || "", value);
                setEditedBooking({ ...booking, accountHandler: value });
              }}
            />
            <LockedField 
              label="Service/s" 
              value={booking.service || ""}
            />
            <LockedField 
              label="Quotation Reference" 
              value={booking.quotationReferenceNumber || ""}
            />
          </div>
        </div>

        <div style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#F0F9FF",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#0369A1"
        }}>
          <strong>Click any field to edit</strong>
        </div>
      </div>

      {/* Service Details Section */}
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
          Service Details
        </h2>

        <div style={{ display: "grid", gap: "20px" }}>
          <div>
            <EditableField
              fieldName="serviceDescription"
              label="Service Description"
              value={booking.serviceDescription || ""}
              type="textarea"
              status={booking.status}
              placeholder="Describe the service being provided..."
              onSave={(value) => {
                onBookingUpdated();
                addActivity("Service Description", booking.serviceDescription || "", value);
                setEditedBooking({ ...booking, serviceDescription: value });
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="deliveryAddress"
              label="Delivery Address"
              value={booking.deliveryAddress || ""}
              type="textarea"
              status={booking.status}
              placeholder="Enter delivery address..."
              onSave={(value) => {
                onBookingUpdated();
                addActivity("Delivery Address", booking.deliveryAddress || "", value);
                setEditedBooking({ ...booking, deliveryAddress: value });
              }}
            />
            <EditableField
              fieldName="specialRequirements"
              label="Special Requirements"
              value={booking.specialRequirements || ""}
              type="textarea"
              status={booking.status}
              placeholder="Enter any special requirements..."
              onSave={(value) => {
                onBookingUpdated();
                addActivity("Special Requirements", booking.specialRequirements || "", value);
                setEditedBooking({ ...booking, specialRequirements: value });
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <EditableField
              fieldName="requestedDate"
              label="Requested Date"
              value={booking.requestedDate || ""}
              type="date"
              status={booking.status}
              onSave={(value) => {
                onBookingUpdated();
                addActivity("Requested Date", booking.requestedDate || "", value);
                setEditedBooking({ ...booking, requestedDate: value });
              }}
            />
            <EditableField
              fieldName="completionDate"
              label="Completion Date"
              value={booking.completionDate || ""}
              type="date"
              status={booking.status}
              onSave={(value) => {
                onBookingUpdated();
                addActivity("Completion Date", booking.completionDate || "", value);
                setEditedBooking({ ...booking, completionDate: value });
              }}
            />
          </div>
        </div>
      </div>

      {/* Additional Notes Section */}
      {booking.notes && (
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          padding: "24px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--neuron-brand-green)",
            marginBottom: "20px"
          }}>
            Additional Notes
          </h2>

          <div style={{ display: "grid", gap: "20px" }}>
            <EditableField
              fieldName="notes"
              label="Notes"
              value={booking.notes}
              type="textarea"
              status={booking.status}
              placeholder="Enter additional notes..."
              onSave={(value) => {
                onBookingUpdated();
                addActivity("Notes", booking.notes || "", value);
                setEditedBooking({ ...booking, notes: value });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}