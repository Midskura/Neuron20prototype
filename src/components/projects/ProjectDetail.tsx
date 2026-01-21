import { useState } from "react";
import { ArrowLeft, MoreVertical, Edit3, Copy, Archive, Trash2, FileText } from "lucide-react";
import { CommentsTab } from "../shared/CommentsTab";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { ProjectBookingsTab } from "./ProjectBookingsTab";
import { ProjectExpensesTab } from "./ProjectExpensesTab";
import { ProjectAttachmentsTab } from "./ProjectAttachmentsTab";
import type { Project } from "../../types/pricing";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "../ui/toast-utils";

type ProjectTab = "overview" | "bookings" | "expenses" | "attachments" | "comments";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdate: () => void;
  currentUser?: { 
    id: string;
    name: string; 
    email: string; 
    department: string;
  } | null;
  department: "BD" | "Operations";
  onCreateTicket?: (entity: { type: string; id: string; name: string }) => void;
}

export function ProjectDetail({ 
  project, 
  onBack, 
  onUpdate, 
  currentUser,
  department,
  onCreateTicket
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const currentUserId = currentUser?.id || "user-123";
  const currentUserName = currentUser?.name || "John Doe";
  const currentUserDepartment = currentUser?.department || "BD";

  // BD and PD users see the actions menu (not Operations)
  const showActions = department === "BD";

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

  // Handle viewing a booking from the Overview tab
  const handleViewBooking = (bookingId: string, serviceType: string) => {
    setSelectedBookingId(bookingId);
    setActiveTab("bookings");
  };

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    
    try {
      const response = await fetch(`${API_URL}/projects/${project.id}/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          bookingId: `PROJECT-${project.project_number}`,
          bookingType: "forwarding"
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate invoice");
      }

      toast.success(`Invoice ${result.data.billingId} generated successfully!`);
      console.log("Generated invoice:", result.data);
      
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate invoice");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleEdit = () => {
    console.log("Edit project:", project.project_number);
    alert("Edit functionality coming soon!");
  };

  const handleDuplicate = () => {
    console.log("Duplicating project:", project.project_number);
    alert(`📋 Project ${project.project_number} has been duplicated!`);
    setShowActionsMenu(false);
  };

  const handleArchive = () => {
    console.log("Archiving project:", project.project_number);
    alert(`📦 Project ${project.project_number} has been archived!`);
    setShowActionsMenu(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete project ${project.project_number}?`)) {
      console.log("Deleting project:", project.project_number);
      alert(`🗑️ Project ${project.project_number} has been deleted!`);
      setShowActionsMenu(false);
      onBack();
    }
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
            Back to Projects
          </button>
          
          <h1 style={{ 
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            marginBottom: "4px"
          }}>
            {project.quotation_name || project.project_number}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--neuron-ink-muted)", margin: 0 }}>
            {project.project_number}
          </p>
        </div>

        {/* Actions Menu - Only for BD & PD */}
        {showActions && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px",
                backgroundColor: "white",
                border: "1.5px solid #D1D5DB",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-green)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#D1D5DB";
              }}
            >
              <MoreVertical size={18} color="var(--neuron-ink-secondary)" />
            </button>

            {showActionsMenu && (
              <>
                <div 
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10
                  }}
                  onClick={() => setShowActionsMenu(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    minWidth: "180px",
                    zIndex: 20,
                    overflow: "hidden"
                  }}
                >
                  <button
                    onClick={() => {
                      handleEdit();
                      setShowActionsMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Edit3 size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                    Edit Project
                  </button>
                  {project.charge_categories && project.charge_categories.length > 0 && (
                    <button
                      onClick={() => {
                        handleGenerateInvoice();
                        setShowActionsMenu(false);
                      }}
                      disabled={isGeneratingInvoice}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        cursor: isGeneratingInvoice ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        color: "var(--neuron-ink-primary)",
                        transition: "background-color 0.15s ease",
                        opacity: isGeneratingInvoice ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isGeneratingInvoice) {
                          e.currentTarget.style.backgroundColor = "#F9FAFB";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <FileText size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                      {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
                    </button>
                  )}
                  <button
                    onClick={handleDuplicate}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Copy size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                    Duplicate Project
                  </button>
                  <button
                    onClick={handleArchive}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Archive size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                    Archive Project
                  </button>
                  <div style={{ height: "1px", backgroundColor: "#E5E7EB", margin: "4px 0" }} />
                  <button
                    onClick={handleDelete}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      fontSize: "14px",
                      color: "#DC2626",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEF2F2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Trash2 size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "24px",
        padding: "0 48px",
        borderBottom: "1px solid #E5E7EB"
      }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "overview" ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
            color: activeTab === "overview" ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "overview") {
              e.currentTarget.style.color = "var(--neuron-ink-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "overview") {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "bookings" ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
            color: activeTab === "bookings" ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "bookings") {
              e.currentTarget.style.color = "var(--neuron-ink-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "bookings") {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }
          }}
        >
          Bookings
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "expenses" ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
            color: activeTab === "expenses" ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "expenses") {
              e.currentTarget.style.color = "var(--neuron-ink-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "expenses") {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }
          }}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab("attachments")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "attachments" ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
            color: activeTab === "attachments" ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "attachments") {
              e.currentTarget.style.color = "var(--neuron-ink-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "attachments") {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }
          }}
        >
          Attachments
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "comments" ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
            color: activeTab === "comments" ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "comments") {
              e.currentTarget.style.color = "var(--neuron-ink-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "comments") {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }
          }}
        >
          Comments
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeTab === "overview" && (
          <ProjectOverviewTab 
            project={project} 
            currentUser={currentUser}
            onUpdate={onUpdate}
            onViewBooking={handleViewBooking}
          />
        )}
        {activeTab === "bookings" && (
          <ProjectBookingsTab 
            project={project} 
            currentUser={currentUser}
            selectedBookingId={selectedBookingId}
          />
        )}
        {activeTab === "expenses" && (
          <ProjectExpensesTab 
            project={project} 
            currentUser={currentUser}
          />
        )}
        {activeTab === "attachments" && (
          <ProjectAttachmentsTab 
            project={project} 
            currentUser={currentUser}
          />
        )}
        {activeTab === "comments" && (
          <CommentsTab 
            inquiryId={project.quotation_id}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserDepartment={currentUserDepartment}
          />
        )}
      </div>
    </div>
  );
}