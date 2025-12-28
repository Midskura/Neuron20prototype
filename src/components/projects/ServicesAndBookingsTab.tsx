import { useState } from "react";
import { Plus, Clipboard, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project, InquiryService } from "../../types/pricing";
import { CreateBookingFromProjectModal } from "./CreateBookingFromProjectModal";
import { ForwardingSpecsDisplay } from "../bd/service-displays/ForwardingSpecsDisplay";
import { BrokerageSpecsDisplay } from "../bd/service-displays/BrokerageSpecsDisplay";
import { TruckingSpecsDisplay } from "../bd/service-displays/TruckingSpecsDisplay";
import { MarineInsuranceSpecsDisplay } from "../bd/service-displays/MarineInsuranceSpecsDisplay";
import { OthersSpecsDisplay } from "../bd/service-displays/OthersSpecsDisplay";

interface ServicesAndBookingsTabProps {
  project: Project;
  currentUser?: { 
    id: string;
    name: string; 
    email: string; 
    department: string;
  } | null;
  onUpdate: () => void;
}

export function ServicesAndBookingsTab({ project, currentUser, onUpdate }: ServicesAndBookingsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  const servicesMetadata = project.services_metadata || [];
  const linkedBookings = project.linkedBookings || [];

  const handleCreateBooking = (service: any) => {
    setSelectedService(service);
    setIsCreateModalOpen(true);
  };

  const toggleServiceExpanded = (index: number) => {
    setExpandedServices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
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
      // Navigate with state to open the specific booking
      navigate(route, { 
        state: { 
          openBookingId: booking.bookingNumber 
        } 
      });
    }
  };

  // Get bookings for a specific service
  const getBookingsForService = (serviceType: string) => {
    return linkedBookings.filter(b => b.serviceType === serviceType);
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
            <Clipboard size={18} />
            Services & Bookings
          </h2>
          <p style={{ 
            fontSize: "13px", 
            color: "var(--neuron-ink-muted)",
            margin: 0
          }}>
            Service specifications from Quotation {project.quotation_number} and their operational bookings
          </p>
        </div>

        {servicesMetadata.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {servicesMetadata.map((service, idx) => {
              const isExpanded = expandedServices[idx] ?? true; // Default to expanded
              const bookingsForService = getBookingsForService(service.service_type);
              const hasBookings = bookingsForService.length > 0;

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  {/* Service Header - Collapsible */}
                  <div
                    style={{
                      padding: "20px 24px",
                      backgroundColor: "#F8FBFB",
                      borderBottom: isExpanded ? "1px solid var(--neuron-ui-border)" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                    onClick={() => toggleServiceExpanded(idx)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "var(--neuron-brand-green)",
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
                              {service.service_details.service_description?.substring(0, 80)}
                              {service.service_details.service_description?.length > 80 ? "..." : ""}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bookings count badge */}
                      <div style={{
                        padding: "4px 12px",
                        backgroundColor: hasBookings ? "#E8F4F3" : "#F3F4F6",
                        border: `1px solid ${hasBookings ? "var(--neuron-brand-green)" : "#D1D5DB"}`,
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: hasBookings ? "var(--neuron-brand-green)" : "#6B7280"
                      }}>
                        {bookingsForService.length} {bookingsForService.length === 1 ? "Booking" : "Bookings"}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateBooking(service);
                      }}
                      style={{
                        padding: "8px 16px",
                        background: "var(--neuron-brand-green)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginLeft: "16px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#0D5F58";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--neuron-brand-green)";
                      }}
                    >
                      <Plus size={16} />
                      Create Booking
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div>
                      {/* Service Specification Details */}
                      <div style={{ padding: "24px" }}>
                        <div style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--neuron-ink-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <div style={{
                            width: "4px",
                            height: "16px",
                            backgroundColor: "var(--neuron-brand-green)",
                            borderRadius: "2px"
                          }} />
                          Service Specification
                        </div>
                        
                        {/* Render service-specific display component without outer card wrapper */}
                        <div style={{
                          padding: "20px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                          borderRadius: "6px"
                        }}>
                          <ServiceSpecificationDisplay service={service} />
                        </div>
                      </div>

                      {/* Associated Bookings */}
                      {hasBookings && (
                        <div style={{
                          padding: "0 24px 24px 24px"
                        }}>
                          <div style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--neuron-ink-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            <div style={{
                              width: "4px",
                              height: "16px",
                              backgroundColor: "#10B981",
                              borderRadius: "2px"
                            }} />
                            Associated Bookings ({bookingsForService.length})
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {bookingsForService.map((booking, bookingIdx) => (
                              <div
                                key={bookingIdx}
                                style={{
                                  padding: "16px",
                                  background: "#F0FDF4",
                                  border: "1px solid #86EFAC",
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
                                    {booking.bookingNumber}
                                  </div>
                                  <div style={{
                                    fontSize: "13px",
                                    color: "var(--neuron-ink-muted)"
                                  }}>
                                    Status: {booking.status || "Active"} • Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "—"}
                                  </div>
                                </div>

                                <button
                                  onClick={() => navigateToBooking(booking)}
                                  style={{
                                    padding: "8px 16px",
                                    background: "white",
                                    color: "#10B981",
                                    border: "1px solid #10B981",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#10B981";
                                    e.currentTarget.style.color = "white";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "white";
                                    e.currentTarget.style.color = "#10B981";
                                  }}
                                >
                                  View Details
                                  <ExternalLink size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No bookings message */}
                      {!hasBookings && (
                        <div style={{
                          padding: "0 24px 24px 24px"
                        }}>
                          <div style={{
                            padding: "24px",
                            backgroundColor: "#F9FAFB",
                            border: "1px dashed var(--neuron-ui-border)",
                            borderRadius: "6px",
                            textAlign: "center"
                          }}>
                            <p style={{
                              fontSize: "13px",
                              color: "var(--neuron-ink-muted)",
                              margin: 0
                            }}>
                              No bookings created yet. Click "Create Booking" to start.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: "white",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "8px",
            padding: "48px 24px",
            textAlign: "center"
          }}>
            <p style={{ 
              fontSize: "14px",
              color: "var(--neuron-ink-muted)",
              marginBottom: "8px"
            }}>
              No service specifications available
            </p>
            <p style={{ 
              fontSize: "13px",
              color: "#9CA3AF",
              margin: 0
            }}>
              Service specifications are inherited from Quotation {project.quotation_number}
            </p>
          </div>
        )}
      </div>

      {/* Create Booking Modal */}
      {isCreateModalOpen && selectedService && (
        <CreateBookingFromProjectModal
          isOpen={isCreateModalOpen}
          project={project}
          service={selectedService}
          currentUser={currentUser}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            setSelectedService(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

// Helper component to render service-specific specification displays
function ServiceSpecificationDisplay({ service }: { service: InquiryService }) {
  switch (service.service_type) {
    case "Forwarding":
      return <ForwardingSpecsDisplay details={service.service_details as any} />;
    case "Brokerage":
      return <BrokerageSpecsDisplay details={service.service_details as any} />;
    case "Trucking":
      return <TruckingSpecsDisplay details={service.service_details as any} />;
    case "Marine Insurance":
      return <MarineInsuranceSpecsDisplay details={service.service_details as any} />;
    case "Others":
      return <OthersSpecsDisplay details={service.service_details as any} />;
    default:
      return null;
  }
}