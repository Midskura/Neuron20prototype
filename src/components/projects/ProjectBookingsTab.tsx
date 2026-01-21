import { useState, useEffect } from "react";
import { Eye, FileText, Package, Plus } from "lucide-react";
import type { Project } from "../../types/pricing";
import { ProjectBookingReadOnlyView } from "./ProjectBookingReadOnlyView";
import { CreateBookingFromProjectPanel } from "./CreateBookingFromProjectPanel";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface ProjectBookingsTabProps {
  project: Project;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    department: string;
  } | null;
  selectedBookingId?: string | null;
}

export function ProjectBookingsTab({ project, currentUser, selectedBookingId }: ProjectBookingsTabProps) {
  const [selectedBooking, setSelectedBooking] = useState<{
    bookingId: string;
    bookingType: string;
  } | null>(null);
  const [verifiedBookings, setVerifiedBookings] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasCleanedUp, setHasCleanedUp] = useState(false);
  const [createBookingService, setCreateBookingService] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const linkedBookings = project.linkedBookings || [];
  const servicesMetadata = project.services_metadata || [];
  
  // Auto-open booking if selectedBookingId is provided
  useEffect(() => {
    if (selectedBookingId && !selectedBooking && verifiedBookings.length > 0) {
      // Find the booking in the verified bookings list
      const booking = verifiedBookings.find(b => b.bookingId === selectedBookingId);
      if (booking) {
        const type = booking.bookingType || booking.serviceType || booking.service || "others";
        setSelectedBooking({
          bookingId: selectedBookingId,
          bookingType: type.toLowerCase().replace(' ', '-')
        });
      }
    }
  }, [selectedBookingId, selectedBooking, verifiedBookings]);
  
  // Verify that linked bookings actually exist
  useEffect(() => {
    async function verifyBookings() {
      setIsVerifying(true);
      const verified: any[] = [];
      
      for (const booking of linkedBookings) {
        try {
          // Determine the endpoint based on service type
          const serviceType = booking.serviceType || booking.service;
          let endpoint = "";
          
          switch (serviceType) {
            case "Forwarding":
              endpoint = "forwarding-bookings";
              break;
            case "Brokerage":
              endpoint = "brokerage-bookings";
              break;
            case "Trucking":
              endpoint = "trucking-bookings";
              break;
            case "Marine Insurance":
              endpoint = "marine-insurance-bookings";
              break;
            case "Others":
              endpoint = "others-bookings";
              break;
            default:
              console.warn(`Unknown service type: ${serviceType}`);
              continue;
          }
          
          // Fetch the booking to verify it exists
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/${endpoint}/${booking.bookingId}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              verified.push(booking);
            } else {
              console.warn(`Booking ${booking.bookingId} exists in project but not in database`);
            }
          } else {
            console.warn(`Booking ${booking.bookingId} not found (${response.status})`);
          }
        } catch (error) {
          console.error(`Error verifying booking ${booking.bookingId}:`, error);
        }
      }
      
      setVerifiedBookings(verified);
      setIsVerifying(false);
      
      // If some bookings were removed, clean up the project automatically
      if (verified.length !== linkedBookings.length && !hasCleanedUp) {
        const orphanedCount = linkedBookings.length - verified.length;
        console.warn(
          `⚠️ Found ${orphanedCount} orphaned booking reference(s) in project ${project.project_number}. ` +
          `Only ${verified.length} of ${linkedBookings.length} linked bookings actually exist.`
        );
        
        // Automatically clean up orphaned bookings
        try {
          console.log(`🧹 Automatically cleaning up orphaned bookings from project ${project.project_number}...`);
          const cleanupResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/projects/${project.id}/cleanup-orphaned-bookings`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (cleanupResponse.ok) {
            const result = await cleanupResponse.json();
            console.log(`✅ Cleanup completed:`, result.message, result.details);
            
            // Mark as cleaned up to prevent repeated cleanup calls
            setHasCleanedUp(true);
            
            // Update local state to reflect the cleanup immediately
            // This makes the UI show the empty state without requiring a page refresh
            setVerifiedBookings([]);
          } else {
            console.error('Failed to clean up orphaned bookings:', await cleanupResponse.text());
          }
        } catch (error) {
          console.error('Error during automatic cleanup:', error);
        }
      }
    }
    
    verifyBookings();
  }, [linkedBookings.length, project.project_number, project.id, hasCleanedUp, refreshTrigger]);
  
  // DEBUG: Log the project data to console to help diagnose the booking issue
  console.log('🔍 ProjectBookingsTab Debug:', {
    projectId: project.id,
    projectNumber: project.project_number,
    linkedBookingsCount: linkedBookings.length,
    verifiedBookingsCount: verifiedBookings.length,
    linkedBookings: linkedBookings,
    verifiedBookings: verifiedBookings,
    bookingStatus: project.booking_status,
    isVerifying: isVerifying
  });

  // Get service type label
  const getServiceTypeLabel = (bookingType: string): string => {
    const typeMap: Record<string, string> = {
      forwarding: "Sea/Air Freight Forwarding",
      brokerage: "Customs Brokerage",
      trucking: "Trucking",
      "marine-insurance": "Marine Insurance",
      others: "Others",
    };
    return typeMap[bookingType] || bookingType;
  };

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      Draft: {
        bg: "#F3F4F6",
        text: "#6B7280",
        border: "#E5E7EB",
      },
      Confirmed: {
        bg: "#DBEAFE",
        text: "#1E40AF",
        border: "#93C5FD",
      },
      "In Progress": {
        bg: "#E8F2EE",
        text: "#0F766E",
        border: "#0F766E33",
      },
      Pending: {
        bg: "#FEF3C7",
        text: "#92400E",
        border: "#FCD34D",
      },
      "On Hold": {
        bg: "#FFEDD5",
        text: "#C2410C",
        border: "#FDBA74",
      },
      Completed: {
        bg: "#D1FAE5",
        text: "#10B981",
        border: "#10B98133",
      },
      Cancelled: {
        bg: "#FEE2E2",
        text: "#EF4444",
        border: "#EF444433",
      },
    };

    return (
      statusMap[status] || {
        bg: "#F3F4F6",
        text: "#6B7280",
        border: "#E5E7EB",
      }
    );
  };

  // Group bookings by service type
  const groupedBookings = verifiedBookings.reduce((acc, booking) => {
    // Handle both bookingType and serviceType fields (different data sources may use different names)
    const type =
      (booking as any).bookingType ||
      (booking as any).serviceType ||
      booking.service ||
      "others";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(booking);
    return acc;
  }, {} as Record<string, typeof linkedBookings>);

  // Function to get bookings for a specific service type
  const getBookingsForService = (serviceType: string) => {
    return verifiedBookings.filter(booking => {
      const type =
        (booking as any).bookingType ||
        (booking as any).serviceType ||
        booking.service ||
        "others";
      return type.toLowerCase() === serviceType.toLowerCase();
    });
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 48px",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--neuron-brand-green)",
              marginBottom: "8px",
            }}
          >
            Operational Bookings
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--neuron-ink-muted)",
              margin: 0,
            }}
          >
            View and manage bookings created from this project across all service types.
          </p>
        </div>

        {/* Bento Grid Layout */}
        {servicesMetadata.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
              gap: "20px",
            }}
          >
            {servicesMetadata.map((service, idx) => {
              const serviceType = service.service_type;
              const bookingsForService = getBookingsForService(serviceType);
              const hasBookings = bookingsForService.length > 0;

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#F8FBFB",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "140px",
                  }}
                >
                  {/* Service Header */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: hasBookings
                        ? "1px solid var(--neuron-ui-border)"
                        : "none",
                      backgroundColor: "white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "var(--neuron-brand-green)",
                            marginBottom: "2px",
                          }}
                        >
                          {serviceType}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--neuron-ink-muted)",
                          }}
                        >
                          {bookingsForService.length}{" "}
                          {bookingsForService.length === 1
                            ? "booking"
                            : "bookings"}
                        </div>
                      </div>

                      {/* Bookings count badge */}
                      <div
                        style={{
                          padding: "4px 10px",
                          backgroundColor: hasBookings
                            ? "#E8F4F3"
                            : "#F3F4F6",
                          border: `1px solid ${
                            hasBookings
                              ? "var(--neuron-brand-green)"
                              : "#D1D5DB"
                          }`,
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: hasBookings
                            ? "var(--neuron-brand-green)"
                            : "#6B7280",
                        }}
                      >
                        {bookingsForService.length}
                      </div>
                    </div>
                  </div>

                  {/* Bookings List or Empty State */}
                  <div style={{ flex: 1, padding: "12px" }}>
                    {hasBookings ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {bookingsForService.map((booking) => (
                          <div
                            key={booking.bookingId}
                            onClick={() =>
                              setSelectedBooking({
                                bookingId: booking.bookingId,
                                bookingType: serviceType.toLowerCase().replace(' ', '-'),
                              })
                            }
                            style={{
                              padding: "12px 16px",
                              backgroundColor: "white",
                              border: "1px solid var(--neuron-ui-border)",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--neuron-brand-green)";
                              e.currentTarget.style.boxShadow =
                                "0 0 0 2px rgba(15, 118, 110, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--neuron-ui-border)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "var(--neuron-ink-primary)",
                                marginBottom: "4px",
                              }}
                            >
                              {booking.bookingId}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "var(--neuron-ink-muted)",
                              }}
                            >
                              {booking.customerName ||
                                project.customer_name ||
                                "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "24px 16px",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            margin: "0 0 12px 0",
                          }}
                        >
                          No bookings yet
                        </p>
                        <button
                          onClick={() => setCreateBookingService(service)}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "var(--neuron-brand-green)",
                            border: "1px solid var(--neuron-brand-green)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "white",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#0D5B57";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
                          }}
                        >
                          <Plus size={16} />
                          Create Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "8px",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "var(--neuron-ink-muted)",
                marginBottom: "8px",
              }}
            >
              No services available
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#9CA3AF",
                margin: 0,
              }}
            >
              No service specifications found for this project
            </p>
          </div>
        )}
      </div>

      {/* Booking Detail Drawer */}
      {selectedBooking && (
        <ProjectBookingReadOnlyView
          bookingId={selectedBooking.bookingId}
          bookingType={selectedBooking.bookingType as any}
          onBack={() => setSelectedBooking(null)}
          currentUser={currentUser}
        />
      )}

      {/* Create Booking Panel */}
      {createBookingService && (
        <CreateBookingFromProjectPanel
          isOpen={!!createBookingService}
          onClose={() => setCreateBookingService(null)}
          project={project}
          service={createBookingService}
          currentUser={currentUser}
          onBookingCreated={() => {
            setCreateBookingService(null);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </>
  );
}