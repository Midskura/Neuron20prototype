import { ProjectsModule } from "../projects/ProjectsModule";

interface ProjectsListProps {
  currentUser?: { 
    id: string;
    name: string; 
    email: string; 
    department: string;
  } | null;
  onCreateTicket?: (entity: { type: string; id: string; name: string }) => void;
}

export function ProjectsList({ currentUser, onCreateTicket }: ProjectsListProps) {
  return (
    <ProjectsModule 
      currentUser={currentUser}
      onCreateTicket={onCreateTicket}
    />
  );
}
