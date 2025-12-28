import { useState } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { ProjectOverviewTab } from "../bd/ProjectOverviewTab";
import { ServiceSpecificationsTab } from "../bd/ServiceSpecificationsTab";
import { PricingBreakdownTab } from "../bd/PricingBreakdownTab";
import { ActivityTab } from "../bd/ActivityTab";
import { ServicesAndBookingsTab } from "./ServicesAndBookingsTab";
import type { Project } from "../../types/pricing";

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
  // BD sees: Overview, Service Specs, Pricing, Activity
  // Operations sees: Overview, Services & Bookings, Activity
  const bdTabs = ["overview", "specifications", "pricing", "activity"] as const;
  const operationsTabs = ["overview", "services", "activity"] as const;
  
  type BDTab = typeof bdTabs[number];
  type OperationsTab = typeof operationsTabs[number];
  type Tab = BDTab | OperationsTab;

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs = department === "BD" ? bdTabs : operationsTabs;
  
  console.log("ProjectDetail - Department:", department, "- Showing tabs:", tabs);

  const getTabLabel = (tab: Tab) => {
    switch (tab) {
      case "overview": return "Overview";
      case "specifications": return "Service Specifications";
      case "pricing": return "Pricing Breakdown";
      case "services": return "Services & Bookings";
      case "activity": return "Activity & Team";
      default: return tab;
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#F9FAFB"
    }}>
      {/* Header */}
      <div style={{
        background: "white",
        borderBottom: "1px solid var(--neuron-ui-border)",
        padding: "20px 48px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={onBack}
              style={{
                background: "transparent",
                border: "none",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#6B7280",
                borderRadius: "6px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div>
              <h1 style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--neuron-ink-primary)",
                marginBottom: "4px"
              }}>
                {project.quotation_name || project.project_number}
              </h1>
              <p style={{
                fontSize: "13px",
                color: "var(--neuron-ink-muted)",
                margin: 0
              }}>
                {project.project_number} • From Quotation {project.quotation_number}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {department === "BD" && (
              <div style={{
                fontSize: "13px",
                color: "var(--neuron-ink-muted)",
                padding: "8px 16px",
                background: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px"
              }}>
                <span style={{ fontWeight: 500 }}>Ops Assigned:</span>{" "}
                {project.ops_assigned_user_name || "Unassigned"}
              </div>
            )}
            
            {department === "Operations" && (
              <div style={{
                fontSize: "13px",
                color: "var(--neuron-ink-muted)",
                padding: "8px 16px",
                background: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px"
              }}>
                <span style={{ fontWeight: 500 }}>BD Owner:</span>{" "}
                {project.bd_owner_user_name || "—"}
              </div>
            )}

            <button
              style={{
                background: "transparent",
                border: "none",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#6B7280",
                borderRadius: "6px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "4px",
          marginTop: "20px",
          borderBottom: "1px solid var(--neuron-ui-border)"
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 20px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #0F766E" : "2px solid transparent",
                color: activeTab === tab ? "#0F766E" : "#6B7280",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: "-1px"
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = "#12332B";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = "#6B7280";
                }
              }}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeTab === "overview" && (
          <ProjectOverviewTab 
            project={project} 
            currentUser={currentUser}
            onCreateTicket={onCreateTicket}
          />
        )}
        
        {activeTab === "specifications" && (
          <ServiceSpecificationsTab project={project} />
        )}
        
        {activeTab === "pricing" && department === "BD" && (
          <PricingBreakdownTab project={project} />
        )}
        
        {activeTab === "services" && department === "Operations" && (
          <ServicesAndBookingsTab 
            project={project} 
            currentUser={currentUser}
            onUpdate={onUpdate}
          />
        )}
        
        {activeTab === "activity" && (
          <ActivityTab project={project} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}