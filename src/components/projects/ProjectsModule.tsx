import { useState, useEffect } from "react";
import { ProjectsList } from "./ProjectsList";
import { ProjectDetail } from "./ProjectDetail";
import type { Project } from "../../types/pricing";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "../ui/toast-utils";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export type ProjectsView = "list" | "detail";

interface ProjectsModuleProps {
  currentUser?: { 
    id: string;
    name: string; 
    email: string; 
    department: string;
  } | null;
  onCreateTicket?: (entity: { type: string; id: string; name: string }) => void;
}

export function ProjectsModule({ currentUser, onCreateTicket }: ProjectsModuleProps) {
  const [view, setView] = useState<ProjectsView>("list");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch projects from backend
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching projects from:', `${API_URL}/projects`);
      
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Projects fetch result:', result);
      
      if (result.success) {
        setProjects(result.data);
        console.log(`Fetched ${result.data.length} projects`);
      } else {
        console.error('Error fetching projects:', result.error);
        toast.error("Error loading projects", result.error);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Unable to connect to server");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView("detail");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedProject(null);
  };

  const handleProjectUpdated = async () => {
    console.log('🔄 handleProjectUpdated called - Refreshing project data...');
    
    // Refresh the project data
    await fetchProjects();
    
    // If we're viewing a specific project, update it with fresh data
    if (selectedProject) {
      console.log(`🔍 Fetching fresh data for project ${selectedProject.project_number}...`);
      try {
        const response = await fetch(`${API_URL}/projects/${selectedProject.id}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Successfully refreshed project:', {
              projectNumber: result.data.project_number,
              linkedBookingsCount: result.data.linkedBookings?.length || 0,
              linkedBookings: result.data.linkedBookings,
              bookingStatus: result.data.booking_status
            });
            setSelectedProject(result.data);
            console.log('✓ Refreshed selected project with latest data');
          }
        } else {
          console.error('Failed to fetch project:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error refreshing selected project:', error);
      }
    } else {
      console.log('ℹ️ No selected project to refresh');
    }
  };

  // Use the current user's department to determine which tabs to show
  // BD and Pricing users see: Overview, Specifications, Pricing, Bookings, Activity, Comments
  // Operations users see: Overview, Services & Bookings, Activity
  const department = (
    currentUser?.department === "BD" || 
    currentUser?.department === "Business Development" ||
    currentUser?.department === "Pricing"
  ) ? "BD" : "Operations";
  
  console.log("ProjectsModule - Department:", department, "- User:", currentUser?.department);

  return (
    <div className="h-full bg-white">
      {view === "list" && (
        <ProjectsList
          projects={projects}
          onSelectProject={handleSelectProject}
          isLoading={isLoading}
          currentUser={currentUser}
          department={department}
        />
      )}

      {view === "detail" && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackToList}
          onUpdate={handleProjectUpdated}
          currentUser={currentUser}
          department={department}
          onCreateTicket={onCreateTicket}
        />
      )}
    </div>
  );
}