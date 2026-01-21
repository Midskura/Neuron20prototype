import { X, Package, Ship, Box, Warehouse, Link as LinkIcon, Users } from "lucide-react";
import { useState, useEffect } from "react";
import type { ForwardingBooking, ExecutionStatus } from "../../../types/operations";
import type { Project } from "../../../types/pricing";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "../../ui/toast-utils";
import { ProjectAutofillSection } from "../shared/ProjectAutofillSection";
import { ServicesMultiSelect } from "../shared/ServicesMultiSelect";
import { autofillForwardingFromProject, linkBookingToProject } from "../../../utils/projectAutofill";
import { TeamAssignmentForm, type TeamAssignment } from "../../pricing/TeamAssignmentForm";
import type { User } from "../../../hooks/useUser";
import { CustomDropdown } from "../../bd/CustomDropdown";

interface CreateForwardingBookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (bookingData?: any) => void; // Updated to accept optional booking data
  currentUser?: { id?: string; name: string; email: string; department: string } | null;
  prefillData?: any; // NEW: For auto-fill from project
  source?: "operations" | "pricing"; // NEW: Indicates where the panel is being used
  customerId?: string; // NEW: For team assignment
  serviceType?: string; // NEW: For team assignment
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function CreateForwardingBookingPanel({
  isOpen,
  onClose,
  onBookingCreated,
  currentUser,
  prefillData,
  source = "operations",
  customerId,
  serviceType = "Forwarding",
}: CreateForwardingBookingPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [fetchedProject, setFetchedProject] = useState<Project | null>(null);
  const [teamAssignment, setTeamAssignment] = useState<TeamAssignment | null>(null);
  
  // General Information
  const [customerName, setCustomerName] = useState("");
  const [accountOwner, setAccountOwner] = useState(currentUser?.name || "");
  const [accountHandler, setAccountHandler] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [subServices, setSubServices] = useState<string[]>([]);
  const [mode, setMode] = useState<"FCL" | "LCL" | "AIR">("FCL");
  const [typeOfEntry, setTypeOfEntry] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [stackability, setStackability] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [quotationReferenceNumber, setQuotationReferenceNumber] = useState("");
  const [status, setStatus] = useState<ExecutionStatus>("Draft");
  
  // Expected Volume
  const [qty20ft, setQty20ft] = useState("");
  const [qty40ft, setQty40ft] = useState("");
  const [qty45ft, setQty45ft] = useState("");
  const [volumeGrossWeight, setVolumeGrossWeight] = useState("");
  const [volumeDimensions, setVolumeDimensions] = useState("");
  const [volumeChargeableWeight, setVolumeChargeableWeight] = useState("");

  // Status-dependent fields
  const [pendingReason, setPendingReason] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelledDate, setCancelledDate] = useState("");

  // Shipment Information
  const [consignee, setConsignee] = useState("");
  const [shipper, setShipper] = useState("");
  const [mblMawb, setMblMawb] = useState("");
  const [hblHawb, setHblHawb] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [aolPol, setAolPol] = useState("");
  const [aodPod, setAodPod] = useState("");
  const [forwarder, setForwarder] = useState("");
  const [commodityDescription, setCommodityDescription] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [preferentialTreatment, setPreferentialTreatment] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [eta, setEta] = useState("");

  // FCL-specific
  const [containerNumbers, setContainerNumbers] = useState("");
  const [containerDeposit, setContainerDeposit] = useState(false);
  const [emptyReturn, setEmptyReturn] = useState("");
  const [detDemValidity, setDetDemValidity] = useState("");
  const [storageValidity, setStorageValidity] = useState("");
  const [croAvailability, setCroAvailability] = useState("");

  // LCL/AIR-specific
  const [warehouseLocation, setWarehouseLocation] = useState("");

  // Apply prefill data when component mounts or prefillData changes
  useEffect(() => {
    if (prefillData && source === "pricing") {
      // Auto-populate fields from prefillData
      if (prefillData.customerName) setCustomerName(prefillData.customerName);
      if (prefillData.projectNumber) setProjectNumber(prefillData.projectNumber);
      if (prefillData.quotationReferenceNumber) setQuotationReferenceNumber(prefillData.quotationReferenceNumber);
      if (prefillData.commodityDescription) setCommodityDescription(prefillData.commodityDescription);
      if (prefillData.deliveryAddress) setDeliveryAddress(prefillData.deliveryAddress);
      if (prefillData.aolPol) setAolPol(prefillData.aolPol);
      if (prefillData.aodPod) setAodPod(prefillData.aodPod);
      if (prefillData.cargoType) setCargoType(prefillData.cargoType);
      if (prefillData.mode) setMode(prefillData.mode as "FCL" | "LCL" | "AIR");
    }
  }, [prefillData, source]);

  const handleProjectAutofill = (project: Project) => {
    setFetchedProject(project);
    
    // Autofill fields from project
    const autofilled = autofillForwardingFromProject(project);
    
    setCustomerName(autofilled.customerName || "");
    setQuotationReferenceNumber(autofilled.quotationReferenceNumber || "");
    setCommodityDescription(autofilled.commodityDescription || "");
    setDeliveryAddress(autofilled.deliveryAddress || "");
    setAolPol(autofilled.aolPol || "");
    setAodPod(autofilled.aodPod || "");
    
    if (autofilled.cargoType) {
      setCargoType(autofilled.cargoType);
    }
    
    if (autofilled.mode) {
      setMode(autofilled.mode as "FCL" | "LCL" | "AIR");
    }
    
    toast.success(`Autofilled from project ${project.project_number}`);
  };

  const validateForm = () => {
    if (!customerName) {
      toast.error("Customer Name is required");
      return false;
    }

    // If from Pricing module, require team assignments
    if (source === "pricing" && !teamAssignment) {
      toast.error("Please complete team assignments");
      return false;
    }

    if (status === "Pending" && !pendingReason) {
      toast.error("Pending Reason is required for Pending status");
      return false;
    }
    if (status === "Completed" && !completionDate) {
      toast.error("Completion Date is required for Completed status");
      return false;
    }
    if (status === "Cancelled") {
      if (!cancellationReason) {
        toast.error("Cancellation Reason is required for Cancelled status");
        return false;
      }
      if (!cancelledDate) {
        toast.error("Cancelled Date is required for Cancelled status");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData: Partial<ForwardingBooking> & {
        assigned_manager_id?: string;
        assigned_manager_name?: string;
        assigned_supervisor_id?: string;
        assigned_supervisor_name?: string;
        assigned_handler_id?: string;
        assigned_handler_name?: string;
      } = {
        bookingId: bookingNumber || undefined,
        projectNumber: projectNumber || undefined,
        customerName,
        accountOwner,
        accountHandler,
        services,
        subServices,
        typeOfEntry,
        mode,
        cargoType,
        stackability,
        deliveryAddress,
        quotationReferenceNumber,
        status,
        pendingReason: status === "Pending" ? pendingReason : undefined,
        completionDate: status === "Completed" ? completionDate : undefined,
        cancellationReason: status === "Cancelled" ? cancellationReason : undefined,
        cancelledDate: status === "Cancelled" ? cancelledDate : undefined,
        consignee,
        shipper,
        mblMawb,
        hblHawb,
        registryNumber,
        carrier,
        aolPol,
        aodPod,
        forwarder,
        commodityDescription,
        countryOfOrigin,
        preferentialTreatment,
        grossWeight,
        dimensions,
        eta,
        containerNumbers: mode === "FCL" ? containerNumbers.split(",").map(c => c.trim()).filter(Boolean) : undefined,
        containerDeposit: mode === "FCL" ? containerDeposit : undefined,
        emptyReturn: mode === "FCL" ? emptyReturn : undefined,
        detDemValidity: mode === "FCL" ? detDemValidity : undefined,
        storageValidity: mode === "FCL" ? storageValidity : undefined,
        croAvailability: mode === "FCL" ? croAvailability : undefined,
        warehouseLocation: (mode === "LCL" || mode === "AIR") ? warehouseLocation : undefined,
        qty20ft: mode === "FCL" ? qty20ft : undefined,
        qty40ft: mode === "FCL" ? qty40ft : undefined,
        qty45ft: mode === "FCL" ? qty45ft : undefined,
        volumeGrossWeight: mode === "FCL" ? volumeGrossWeight : undefined,
        volumeDimensions: mode === "FCL" ? volumeDimensions : undefined,
        volumeChargeableWeight: mode === "FCL" ? volumeChargeableWeight : undefined,
      };

      // Add team assignments if from Pricing
      if (source === "pricing" && teamAssignment) {
        bookingData.assigned_manager_id = teamAssignment.manager.id;
        bookingData.assigned_manager_name = teamAssignment.manager.name;
        bookingData.assigned_supervisor_id = teamAssignment.supervisor?.id;
        bookingData.assigned_supervisor_name = teamAssignment.supervisor?.name;
        bookingData.assigned_handler_id = teamAssignment.handler?.id;
        bookingData.assigned_handler_name = teamAssignment.handler?.name;
      }

      const response = await fetch(`${API_URL}/forwarding-bookings`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        const createdBooking = result.data;
        
        // If linked to a project, create bidirectional link
        if (fetchedProject && projectNumber) {
          try {
            await linkBookingToProject(
              fetchedProject.id,
              createdBooking.bookingId,
              createdBooking.bookingId, // Use bookingId as the booking number
              "Forwarding",
              createdBooking.status,
              projectId,
              publicAnonKey
            );
            console.log(`Linked booking ${createdBooking.bookingId} to project ${projectNumber}`);
          } catch (linkError) {
            console.error("Error linking booking to project:", linkError);
            // Don't fail the whole operation, just log it
          }
        }
        
        // Save team preference if requested and from Pricing
        if (source === "pricing" && teamAssignment?.saveAsDefault && customerId) {
          try {
            await fetch(
              `${API_URL}/client-handler-preferences`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${publicAnonKey}`,
                },
                body: JSON.stringify({
                  client_id: customerId,
                  service_type: serviceType,
                  preferred_supervisor_id: teamAssignment.supervisor?.id,
                  preferred_handler_id: teamAssignment.handler?.id,
                }),
              }
            );
          } catch (error) {
            console.error("Error saving team preference:", error);
          }
        }
        
        toast.success(`Forwarding booking ${createdBooking.bookingId} created successfully`);
        onBookingCreated(createdBooking); // Pass the booking data
        onClose();
      } else {
        toast.error("Error creating booking: " + result.error);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Unable to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const isFormValid = customerName.trim() !== "" && 
    (source === "operations" || (source === "pricing" && teamAssignment !== null));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black z-40"
        onClick={handleClose}
        style={{
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(18, 51, 43, 0.15)"
        }}
      />

      {/* Side Panel */}
      <div
        className="fixed right-0 top-0 h-full w-[680px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in"
        style={{
          borderLeft: "1px solid var(--neuron-ui-border)",
        }}
      >
        {/* Header */}
        <div
          className="px-12 py-8 border-b"
          style={{
            borderColor: "var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#E8F2EE" }}
              >
                <Ship size={20} style={{ color: "#0F766E" }} />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B" }}>
                New Forwarding Booking
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                color: "var(--neuron-ink-muted)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={20} />
            </button>
          </div>
          <p style={{ fontSize: "14px", color: "#667085" }}>
            Create a new freight forwarding booking for shipment management
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-12 py-8">
          <form onSubmit={handleSubmit} id="create-forwarding-form">
            {/* Project Reference - Autofill Section - Only show when from Operations */}
            {source === "operations" && (
              <ProjectAutofillSection
                projectNumber={projectNumber}
                onProjectNumberChange={setProjectNumber}
                onAutofill={handleProjectAutofill}
                serviceType="Forwarding"
              />
            )}

            {/* Booking Number */}
            <div className="mb-8">
              <label
                className="block mb-1.5"
                style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
              >
                Booking Number (Auto-generated)
              </label>
              <input
                type="text"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                placeholder="Leave blank for auto-generation or enter custom"
                className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                style={{
                  border: "1px solid var(--neuron-ui-border)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--neuron-ink-primary)",
                }}
              />
              <p className="text-xs mt-1" style={{ color: "#667085" }}>
                Leave blank to auto-generate (e.g., FWD-2025-001) or enter a custom booking number
              </p>
            </div>

            {/* General Information */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  General Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="block mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                  >
                    Customer Name <span style={{ color: "#C94F3D" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Account Owner
                    </label>
                    <input
                      type="text"
                      value={accountOwner}
                      onChange={(e) => setAccountOwner(e.target.value)}
                      placeholder="Account owner"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Account Handler
                    </label>
                    <input
                      type="text"
                      value={accountHandler}
                      onChange={(e) => setAccountHandler(e.target.value)}
                      placeholder="Account handler"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                {/* Services/Sub-services Multi-select */}
                <div className="grid grid-cols-2 gap-4">
                  <ServicesMultiSelect
                    label="Services"
                    selectedServices={services}
                    onServicesChange={setServices}
                    availableServices={[
                      "Freight Forwarding",
                      "Documentation",
                      "Cargo Insurance",
                      "Port Handling",
                      "Custom Clearance",
                    ]}
                    placeholder="Select services..."
                  />
                  
                  <ServicesMultiSelect
                    label="Sub-services"
                    selectedServices={subServices}
                    onServicesChange={setSubServices}
                    availableServices={[
                      "Door-to-Door",
                      "Port-to-Port",
                      "Warehouse Storage",
                      "Container Stuffing",
                      "Palletization",
                    ]}
                    placeholder="Select sub-services..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CustomDropdown
                    label="Mode"
                    value={mode}
                    onChange={(value) => setMode(value as "FCL" | "LCL" | "AIR")}
                    options={[
                      { value: "FCL", label: "FCL" },
                      { value: "LCL", label: "LCL" },
                      { value: "AIR", label: "AIR" },
                    ]}
                    placeholder="Select Mode..."
                    fullWidth
                  />

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Type of Entry
                    </label>
                    <input
                      type="text"
                      value={typeOfEntry}
                      onChange={(e) => setTypeOfEntry(e.target.value)}
                      placeholder="e.g., Import, Export"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                  >
                    Cargo Type
                  </label>
                  <input
                    type="text"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    placeholder="e.g., General, Hazardous"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                  >
                    Stackability
                  </label>
                  <input
                    type="text"
                    value={stackability}
                    onChange={(e) => setStackability(e.target.value)}
                    placeholder="e.g., Stackable, Non-Stackable"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                  >
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    placeholder="Enter delivery address"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Quotation Reference
                    </label>
                    <input
                      type="text"
                      value={quotationReferenceNumber}
                      onChange={(e) => setQuotationReferenceNumber(e.target.value)}
                      placeholder="Quotation reference number"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <CustomDropdown
                      label="Status"
                      value={status}
                      onChange={(value) => setStatus(value as ExecutionStatus)}
                      options={[
                        { value: "Draft", label: "Draft" },
                        { value: "Confirmed", label: "Confirmed" },
                        { value: "In Progress", label: "In Progress" },
                        { value: "Pending", label: "Pending" },
                        { value: "On Hold", label: "On Hold" },
                        { value: "Completed", label: "Completed" },
                        { value: "Cancelled", label: "Cancelled" },
                      ]}
                      placeholder="Select Status..."
                      fullWidth
                    />
                  </div>
                </div>

                {/* Status-dependent fields */}
                {status === "Pending" && (
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Pending Reason <span style={{ color: "#C94F3D" }}>*</span>
                    </label>
                    <textarea
                      required
                      value={pendingReason}
                      onChange={(e) => setPendingReason(e.target.value)}
                      rows={2}
                      placeholder="Explain why this booking is pending..."
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                )}

                {status === "Completed" && (
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Completion Date <span style={{ color: "#C94F3D" }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                )}

                {status === "Cancelled" && (
                  <>
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Cancellation Reason <span style={{ color: "#C94F3D" }}>*</span>
                      </label>
                      <textarea
                        required
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        rows={2}
                        placeholder="Explain why this booking was cancelled..."
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Cancelled Date <span style={{ color: "#C94F3D" }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={cancelledDate}
                        onChange={(e) => setCancelledDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Expected Volume */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Box size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Expected Volume
                </h3>
              </div>

              <div className="space-y-4">
                {mode === "FCL" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        20ft Quantity
                      </label>
                      <input
                        type="text"
                        value={qty20ft}
                        onChange={(e) => setQty20ft(e.target.value)}
                        placeholder="e.g., 2"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        40ft Quantity
                      </label>
                      <input
                        type="text"
                        value={qty40ft}
                        onChange={(e) => setQty40ft(e.target.value)}
                        placeholder="e.g., 1"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        45ft Quantity
                      </label>
                      <input
                        type="text"
                        value={qty45ft}
                        onChange={(e) => setQty45ft(e.target.value)}
                        placeholder="e.g., 0"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {(mode === "LCL" || mode === "AIR") && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Gross Weight (kg)
                      </label>
                      <input
                        type="text"
                        value={volumeGrossWeight}
                        onChange={(e) => setVolumeGrossWeight(e.target.value)}
                        placeholder="e.g., 1000"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        {mode === "LCL" ? "Dimensions (CBM)" : "Chargeable Weight (kg)"}
                      </label>
                      <input
                        type="text"
                        value={mode === "LCL" ? volumeDimensions : volumeChargeableWeight}
                        onChange={(e) => mode === "LCL" ? setVolumeDimensions(e.target.value) : setVolumeChargeableWeight(e.target.value)}
                        placeholder={mode === "LCL" ? "e.g., 10" : "e.g., 1200"}
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipment Information */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Ship size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Shipment Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Consignee
                    </label>
                    <input
                      type="text"
                      value={consignee}
                      onChange={(e) => setConsignee(e.target.value)}
                      placeholder="Consignee name"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Shipper
                    </label>
                    <input
                      type="text"
                      value={shipper}
                      onChange={(e) => setShipper(e.target.value)}
                      placeholder="Shipper name"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      MBL/MAWB
                    </label>
                    <input
                      type="text"
                      value={mblMawb}
                      onChange={(e) => setMblMawb(e.target.value)}
                      placeholder="Master bill of lading"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      HBL/HAWB
                    </label>
                    <input
                      type="text"
                      value={hblHawb}
                      onChange={(e) => setHblHawb(e.target.value)}
                      placeholder="House bill of lading"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Registry Number
                    </label>
                    <input
                      type="text"
                      value={registryNumber}
                      onChange={(e) => setRegistryNumber(e.target.value)}
                      placeholder="Registry number"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Carrier
                    </label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="Carrier name"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      AOL/POL
                    </label>
                    <input
                      type="text"
                      value={aolPol}
                      onChange={(e) => setAolPol(e.target.value)}
                      placeholder="Airport/Port of Loading"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      AOD/POD
                    </label>
                    <input
                      type="text"
                      value={aodPod}
                      onChange={(e) => setAodPod(e.target.value)}
                      placeholder="Airport/Port of Discharge"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Forwarder
                    </label>
                    <input
                      type="text"
                      value={forwarder}
                      onChange={(e) => setForwarder(e.target.value)}
                      placeholder="Forwarder name"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      value={countryOfOrigin}
                      onChange={(e) => setCountryOfOrigin(e.target.value)}
                      placeholder="Country of origin"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                  >
                    Commodity Description
                  </label>
                  <textarea
                    value={commodityDescription}
                    onChange={(e) => setCommodityDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe the commodity"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Preferential Treatment
                    </label>
                    <input
                      type="text"
                      value={preferentialTreatment}
                      onChange={(e) => setPreferentialTreatment(e.target.value)}
                      placeholder="e.g., GSP"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Gross Weight
                    </label>
                    <input
                      type="text"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(e.target.value)}
                      placeholder="e.g., 1000 kg"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g., 10x5x3 m"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                  >
                    ETA (Estimated Time of Arrival)
                  </label>
                  <input
                    type="date"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* FCL Container Details */}
            {mode === "FCL" && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Box size={16} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Container Details (FCL)
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                    >
                      Container Number/s
                    </label>
                    <input
                      type="text"
                      value={containerNumbers}
                      onChange={(e) => setContainerNumbers(e.target.value)}
                      placeholder="Comma-separated (e.g., ABCD1234567, EFGH7654321)"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="containerDeposit"
                      checked={containerDeposit}
                      onChange={(e) => setContainerDeposit(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor="containerDeposit"
                      style={{ fontSize: "13px", fontWeight: 500, color: "#12332B", cursor: "pointer" }}
                    >
                      Container Deposit Required
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Empty Return
                      </label>
                      <input
                        type="text"
                        value={emptyReturn}
                        onChange={(e) => setEmptyReturn(e.target.value)}
                        placeholder="Empty return location"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Det/Dem Validity
                      </label>
                      <input
                        type="date"
                        value={detDemValidity}
                        onChange={(e) => setDetDemValidity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Storage Validity
                      </label>
                      <input
                        type="date"
                        value={storageValidity}
                        onChange={(e) => setStorageValidity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        CRO Availability
                      </label>
                      <input
                        type="date"
                        value={croAvailability}
                        onChange={(e) => setCroAvailability(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        20ft Quantity
                      </label>
                      <input
                        type="text"
                        value={qty20ft}
                        onChange={(e) => setQty20ft(e.target.value)}
                        placeholder="e.g., 2"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        40ft Quantity
                      </label>
                      <input
                        type="text"
                        value={qty40ft}
                        onChange={(e) => setQty40ft(e.target.value)}
                        placeholder="e.g., 1"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        45ft Quantity
                      </label>
                      <input
                        type="text"
                        value={qty45ft}
                        onChange={(e) => setQty45ft(e.target.value)}
                        placeholder="e.g., 0"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Volume Gross Weight
                      </label>
                      <input
                        type="text"
                        value={volumeGrossWeight}
                        onChange={(e) => setVolumeGrossWeight(e.target.value)}
                        placeholder="e.g., 1000 kg"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Volume Dimensions
                      </label>
                      <input
                        type="text"
                        value={volumeDimensions}
                        onChange={(e) => setVolumeDimensions(e.target.value)}
                        placeholder="e.g., 10x5x3 m"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                      >
                        Volume Chargeable Weight
                      </label>
                      <input
                        type="text"
                        value={volumeChargeableWeight}
                        onChange={(e) => setVolumeChargeableWeight(e.target.value)}
                        placeholder="e.g., 1000 kg"
                        className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                        style={{
                          border: "1px solid var(--neuron-ui-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--neuron-ink-primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LCL/AIR Warehouse Details */}
            {(mode === "LCL" || mode === "AIR") && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Warehouse size={16} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Warehouse Details ({mode})
                  </h3>
                </div>

                <div>
                  <label
                    className="block mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}
                  >
                    Warehouse Location
                  </label>
                  <input
                    type="text"
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                    placeholder="Warehouse location"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Team Assignment - Only show when from Pricing */}
            {source === "pricing" && customerId && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Team Assignment
                  </h3>
                </div>
                
                <div style={{
                  padding: "20px",
                  backgroundColor: "#F9FAFB",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "8px"
                }}>
                  <TeamAssignmentForm
                    serviceType={serviceType as any}
                    customerId={customerId}
                    onChange={setTeamAssignment}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div
          className="px-12 py-6 border-t flex items-center justify-end gap-3"
          style={{
            borderColor: "var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 rounded-lg transition-colors"
            style={{
              border: "1px solid var(--neuron-ui-border)",
              backgroundColor: "#FFFFFF",
              color: "var(--neuron-ink-secondary)",
              fontSize: "14px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--neuron-state-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-forwarding-form"
            disabled={!isFormValid || isSubmitting}
            className="px-6 py-2.5 rounded-lg transition-all flex items-center gap-2"
            style={{
              backgroundColor: isFormValid && !isSubmitting ? "#0F766E" : "#D1D5DB",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: isFormValid && !isSubmitting ? "pointer" : "not-allowed",
              opacity: isFormValid && !isSubmitting ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (isFormValid && !isSubmitting) {
                e.currentTarget.style.backgroundColor = "#0D6560";
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid && !isSubmitting) {
                e.currentTarget.style.backgroundColor = "#0F766E";
              }
            }}
          >
            <Ship size={16} />
            {isSubmitting ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </div>
    </>
  );
}