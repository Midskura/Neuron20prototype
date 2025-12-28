import { useState } from "react";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../types/pricing";
import { CreateBookingFromProjectModal } from "./CreateBookingFromProjectModal";

interface ProjectBookingsTabProps {
  project: Project;
  currentUser?: { 
    id: string;
    name: string; 
    email: string; 
    department: string;
  } | null;
  onUpdate: () => void;
}

export function ProjectBookingsTab({ project, currentUser, onUpdate }: ProjectBookingsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const navigate = useNavigate();

  const servicesMetadata = project.services_metadata || [];
  const linkedBookings = project.linkedBookings || [];

  const handleCreateBooking = (service: any) => {
    setSelectedService(service);
    setIsCreateModalOpen(true);
  };

  const navigateToBooking = (booking: any) => {
    // Map service type to route
    const serviceTypeMap: Record<string, string> = {
      "Forwarding": "/operations/forwarding",
      "Brokerage": "/operations/brokerage",
      "Trucking": "/operations/trucking",
      "Marine Insurance": "/operations/marine-insurance",
      "Others": "/operations/others"
    };

    const route = serviceTypeMap[booking.serviceType];
    if (route) {
      // Navigate to the service workstation - implement detail view later
      navigate(route);
    }
  };

  return (
    <div style={{ 
      flex: 1,
      overflow: "auto"
    }}>
      {/* Main Content Area */}
      <div style={{ 
        padding: "32px 48px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        
        {/* Header Section */}
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
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <FileText size={18} />
            Service Bookings
          </h2>
          <p style={{ 
            fontSize: "13px", 
            color: "var(--neuron-ink-muted)",
            margin: 0
          }}>
            Create service bookings from this project's specifications
          </p>
        </div>

        {/* Services Available for Booking */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "24px"
        }}>
          <h3 style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            marginBottom: "16px"
          }}>
            Available Services
          </h3>

          {servicesMetadata.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {servicesMetadata.map((service, idx) => {
                // Check if this service has already been booked
                const isBooked = linkedBookings.some(b => 
                  b.serviceType === service.service_type
                );

                return (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      background: isBooked ? "#F0FDF4" : "#F9FAFB",
                      border: `1px solid ${isBooked ? "#86EFAC" : "var(--neuron-ui-border)"}`,
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--neuron-ink-primary)",
                        marginBottom: "4px"
                      }}>
                        {service.service_type}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: "var(--neuron-ink-muted)"
                      }}>
                        {service.service_type === "Forwarding" && (
                          <>
                            {service.service_details.mode} • {service.service_details.cargo_type}
                            {service.service_details.pol && ` • ${service.service_details.pol} → ${service.service_details.pod}`}
                          </>
                        )}
                        {service.service_type === "Brokerage" && (
                          <>
                            {service.service_details.subtype} • {service.service_details.type_of_entry}
                          </>
                        )}
                        {service.service_type === "Trucking" && (
                          <>
                            {service.service_details.truck_type}
                          </>
                        )}
                        {service.service_type === "Marine Insurance" && (
                          <>
                            {service.service_details.commodity_description}
                          </>
                        )}
                        {service.service_type === "Others" && (
                          <>
                            {service.service_details.service_description?.substring(0, 100)}...
                          </>
                        )}
                      </div>
                    </div>

                    {isBooked ? (
                      <div style={{
                        padding: "8px 16px",
                        background: "#10B981",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 600,
                        borderRadius: "6px"
                      }}>
                        ✓ Booked
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCreateBooking(service)}
                        style={{
                          padding: "8px 16px",
                          background: "#0F766E",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#0D6560";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#0F766E";
                        }}
                      >
                        <Plus size={16} />
                        Create Booking
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "32px",
              color: "var(--neuron-ink-muted)",
              fontSize: "14px"
            }}>
              No service specifications available for this project
            </div>
          )}
        </div>

        {/* Linked Bookings */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          padding: "24px"
        }}>
          <h3 style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            marginBottom: "16px"
          }}>
            Created Bookings ({linkedBookings.length})
          </h3>

          {linkedBookings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {linkedBookings.map((booking, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "16px",
                    background: "#F9FAFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-primary)",
                      marginBottom: "4px"
                    }}>
                      {booking.bookingNumber}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "var(--neuron-ink-muted)"
                    }}>
                      {booking.serviceType} • Created {new Date(booking.createdAt).toLocaleDateString()}
                      {booking.createdBy && ` by ${booking.createdBy}`}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--neuron-ink-secondary)",
                      padding: "6px 12px",
                      background: "white",
                      border: "1px solid var(--neuron-ui-border)",
                      borderRadius: "4px"
                    }}>
                      {booking.status}
                    </div>
                    
                    <button
                      onClick={() => navigateToBooking(booking)}
                      style={{
                        padding: "8px 12px",
                        background: "white",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F3F4F6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      View
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "32px",
              color: "var(--neuron-ink-muted)",
              fontSize: "14px"
            }}>
              No bookings have been created yet. Use the "Create Booking" buttons above to get started.
            </div>
          )}
        </div>
      </div>

      {/* Create Booking Modal */}
      {isCreateModalOpen && selectedService && (
        <CreateBookingFromProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedService(null);
          }}
          project={project}
          service={selectedService}
          currentUser={currentUser}
          onSuccess={() => {
            onUpdate();
            setIsCreateModalOpen(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}