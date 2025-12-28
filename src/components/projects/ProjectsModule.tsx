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
    // Refresh the project data
    await fetchProjects();
    
    // If we're viewing a specific project, update it with fresh data
    if (selectedProject) {
      try {
        const response = await fetch(`${API_URL}/projects/${selectedProject.id}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setSelectedProject(result.data);
            console.log('✓ Refreshed selected project with latest data');
          }
        }
      } catch (error) {
        console.error('Error refreshing selected project:', error);
      }
    }
  };

  // ALWAYS show Operations view in the unified Projects module
  // Department restrictions removed since BD has access to Operations anyway
  const department = "Operations";
  
  console.log("ProjectsModule - Unified view always shows Operations tabs (Service Bookings)");

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