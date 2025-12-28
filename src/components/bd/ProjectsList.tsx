import { useState } from "react";
import { Project } from "../../types/pricing";
import { NeuronStatusPill } from "../NeuronStatusPill";
import { Search, Briefcase, CheckCircle, Package } from "lucide-react";

interface ProjectsListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateProject?: () => void;
  isLoading?: boolean;
}

export function ProjectsList({ projects, onSelectProject, onCreateProject, isLoading }: ProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  // Grid template constant for alignment - Project Name wider, Customer narrower
  const GRID_COLS = "200px 180px 140px 120px 120px 120px";

  // Get unique values for filters
  const uniqueOwners = Array.from(new Set(projects.map(p => p.bd_owner_user_name).filter(Boolean)));
  const uniqueServices = Array.from(new Set(projects.flatMap(p => p.services || [])));

  // Filter projects based on active tab
  const getFilteredByTab = () => {
    if (activeTab === "active") {
      return projects.filter(p => p.status === "Active");
    }
    if (activeTab === "completed") {
      return projects.filter(p => p.status === "Completed");
    }
    return projects;
  };

  // Apply all filters
  const filteredProjects = getFilteredByTab().filter((project) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        project.project_number.toLowerCase().includes(query) ||
        project.customer_name.toLowerCase().includes(query) ||
        project.quotation_number?.toLowerCase().includes(query) ||
        project.quotation_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Time period filter
    if (timePeriodFilter !== "all") {
      const projectDate = new Date(project.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - projectDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timePeriodFilter === "7days" && daysDiff > 7) return false;
      if (timePeriodFilter === "30days" && daysDiff > 30) return false;
      if (timePeriodFilter === "90days" && daysDiff > 90) return false;
    }
    
    // Status filter
    if (statusFilter !== "all" && project.status !== statusFilter) return false;
    
    // Booking status filter
    if (bookingStatusFilter !== "all") {
      const projectBookingStatus = project.booking_status || "No Bookings Yet";
      if (projectBookingStatus !== bookingStatusFilter) return false;
    }
    
    // Service filter
    if (serviceFilter !== "all") {
      if (!project.services?.includes(serviceFilter)) return false;
    }
    
    // Owner filter
    if (ownerFilter !== "all" && project.bd_owner_user_name !== ownerFilter) return false;
    
    return true;
  });

  // Calculate counts
  const allCount = projects.length;
  const activeCount = projects.filter(p => p.status === "Active").length;
  const completedCount = projects.filter(p => p.status === "Completed").length;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      <div style={{ padding: "32px 48px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: 600, 
              color: "#12332B", 
              marginBottom: "4px",
              letterSpacing: "-1.2px"
            }}>
              Projects
            </h1>
            <p style={{ 
              fontSize: "14px", 
              color: "#667085"
            }}>
              Manage approved quotations ready for handover to Operations
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {onCreateProject && (
              <button
                onClick={onCreateProject}
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
              >
                + New Project
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
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
            placeholder="Search projects by number, customer, or quotation..."
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

        {/* Filter Row */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: "12px",
          marginBottom: "24px"
        }}>
          {/* Time Period Filter */}
          <select
            value={timePeriodFilter}
            onChange={(e) => setTimePeriodFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#12332B",
              backgroundColor: "#FFFFFF",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#12332B",
              backgroundColor: "#FFFFFF",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Booking Status Filter */}
          <select
            value={bookingStatusFilter}
            onChange={(e) => setBookingStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#12332B",
              backgroundColor: "#FFFFFF",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Booking Statuses</option>
            <option value="No Bookings Yet">No Bookings Yet</option>
            <option value="Partially Booked">Partially Booked</option>
            <option value="Fully Booked">Fully Booked</option>
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#12332B",
              backgroundColor: "#FFFFFF",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Services</option>
            {uniqueServices.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#12332B",
              backgroundColor: "#FFFFFF",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Owners</option>
            {uniqueOwners.map(owner => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          borderBottom: "1px solid #E5E7EB",
          marginBottom: "24px"
        }}>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "all" ? "2px solid #0F766E" : "2px solid transparent",
              color: activeTab === "all" ? "#0F766E" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "all") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "all") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <Briefcase size={18} />
            All Projects
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
                background: activeTab === "all" ? "#0F766E" : "#0F766E15",
                color: activeTab === "all" ? "#FFFFFF" : "#0F766E",
                minWidth: "20px",
                textAlign: "center"
              }}
            >
              {allCount}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("active")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "active" ? "2px solid #F59E0B" : "2px solid transparent",
              color: activeTab === "active" ? "#F59E0B" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "active") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "active") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <Package size={18} />
            Active Projects
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
                background: activeTab === "active" ? "#F59E0B" : "#F59E0B15",
                color: activeTab === "active" ? "#FFFFFF" : "#F59E0B",
                minWidth: "20px",
                textAlign: "center"
              }}
            >
              {activeCount}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("completed")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "completed" ? "2px solid #10B981" : "2px solid transparent",
              color: activeTab === "completed" ? "#10B981" : "#667085",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "completed") {
                e.currentTarget.style.color = "#12332B";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "completed") {
                e.currentTarget.style.color = "#667085";
              }
            }}
          >
            <CheckCircle size={18} />
            Completed Projects
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
                background: activeTab === "completed" ? "#10B981" : "#10B98115",
                color: activeTab === "completed" ? "#FFFFFF" : "#10B981",
                minWidth: "20px",
                textAlign: "center"
              }}
            >
              {completedCount}
            </span>
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ 
            padding: "64px", 
            textAlign: "center", 
            color: "#667085",
            fontSize: "14px" 
          }}>
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ 
            padding: "64px", 
            textAlign: "center", 
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            {searchQuery || timePeriodFilter !== "all" || statusFilter !== "all" || bookingStatusFilter !== "all" || serviceFilter !== "all" || ownerFilter !== "all" ? (
              <>
                <div style={{ 
                  fontSize: "16px", 
                  fontWeight: 600,
                  color: "#12332B",
                  marginBottom: "8px" 
                }}>
                  No projects match your filters
                </div>
                <div style={{ 
                  fontSize: "14px",
                  color: "#667085" 
                }}>
                  Try adjusting your search criteria or filters
                </div>
              </>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} style={{ color: "#D1D5DB", margin: "0 auto 16px" }} />
                <p className="text-[14px]" style={{ color: "#667085" }}>No Projects Yet</p>
              </div>
            ) : (
              <>
                <div style={{ 
                  fontSize: "16px", 
                  fontWeight: 600,
                  color: "#12332B",
                  marginBottom: "8px" 
                }}>
                  No {activeTab === "active" ? "active" : "completed"} projects
                </div>
                <div style={{ 
                  fontSize: "14px",
                  color: "#667085" 
                }}>
                  Try viewing a different tab
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ 
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            overflow: "hidden"
          }}>
            {/* Table Header */}
            <div 
              className="grid gap-4 px-6 py-4"
              style={{ 
                gridTemplateColumns: GRID_COLS,
                borderBottom: "1px solid #E5E7EB",
                background: "#F9FAFB"
              }}
            >
              <div style={{ 
                fontSize: "11px",
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Project Name
              </div>
              <div style={{ 
                fontSize: "11px",
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Customer
              </div>
              <div style={{ 
                fontSize: "11px",
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Route
              </div>
              <div style={{ 
                fontSize: "11px",
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Status
              </div>
              <div style={{ 
                fontSize: "11px",
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Booking Status
              </div>
              <div style={{ 
                fontSize: "11px",
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Ops Assigned
              </div>
            </div>

            {/* Table Body */}
            {filteredProjects.map((project, index) => {
              return (
                <div
                  key={project.id}
                  className="grid gap-4 px-6 py-4 transition-colors cursor-pointer"
                  style={{ 
                    gridTemplateColumns: GRID_COLS,
                    borderBottom: index < filteredProjects.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                  onClick={() => onSelectProject(project)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                    {/* Project Icon */}
                    <Package 
                      size={20} 
                      color="#0F766E" 
                      strokeWidth={2}
                      style={{ flexShrink: 0 }}
                    />
                    
                    <div style={{ overflow: "hidden", width: "100%" }}>
                      <div style={{ 
                        fontSize: "13px", 
                        fontWeight: 600, 
                        color: "#12332B",
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {project.quotation_name || project.project_number}
                      </div>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#6B7280",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {project.project_number}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                    <div style={{ 
                      fontSize: "13px", 
                      color: "#12332B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%"
                    }}>
                      {project.customer_name}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                    <div style={{ 
                      fontSize: "13px", 
                      color: "#6B7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%"
                    }}>
                      {project.pol_aol || "—"} → {project.pod_aod || "—"}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <NeuronStatusPill status={project.status} size="sm" />
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                    <div style={{ 
                      fontSize: "13px", 
                      color: "#6B7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%"
                    }}>
                      {project.booking_status || "No Bookings Yet"}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                    <div style={{ 
                      fontSize: "13px", 
                      color: "#6B7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%"
                    }}>
                      {project.ops_assigned_user_name || "Unassigned"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}