import { X, FileCheck, Package, FileText, Users, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "../ui/toast-utils";
import { TeamAssignmentForm, type TeamAssignment } from "../pricing/TeamAssignmentForm";
import type { User } from "../../hooks/useUser";
import { CustomDropdown } from "../bd/CustomDropdown";

// Brokerage Booking Form Data Interface
interface BrokerageBookingFormData {
  // New: Brokerage Type
  brokerageType: "Standard" | "All-Inclusive" | "Non-Regular" | "";
  
  // General Information
  customerName: string;
  accountOwner: string;
  accountHandler: string;
  customsEntryType: string;
  assessmentType: string;
  releaseType: string;
  declarationType: string;
  quotationReferenceNumber: string;
  projectNumber?: string;
  status: string;
  
  // Entry Details
  consignee: string;
  accountNumber: string;
  registryNumber: string;
  mblMawb: string;
  hblHawb: string;
  invoiceNumber: string;
  invoiceValue: string;
  shipmentOrigin: string;
  entryNumber: string;
  releaseDate: string;
  deliveryAddress: string;
  broker: string;
  commodityDescription: string;
  hsCode: string;
  dutyRate: string;
  vatRate: string;
  otherCharges: string;
  remarks: string;
  
  // New: Quotation Builder fields
  pod?: string;
  mode?: string;
  cargoType?: string;
  countryOfOrigin?: string;
  preferentialTreatment?: string;
  
  // Team assignments (for Pricing module)
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  assigned_supervisor_id?: string;
  assigned_supervisor_name?: string;
  assigned_handler_id?: string;
  assigned_handler_name?: string;
}

interface CreateBrokerageBookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingData?: any) => void; // Updated to accept optional booking data
  prefillData?: Partial<BrokerageBookingFormData>; // NEW: For auto-fill from project
  source?: "operations" | "pricing"; // NEW: Indicates where the panel is being used
  customerId?: string; // NEW: For team assignment
  serviceType?: string; // NEW: For team assignment
  currentUser?: User | null; // NEW: Current user for team assignment
}

export function CreateBrokerageBookingPanel({
  isOpen,
  onClose,
  onSuccess,
  prefillData,
  source = "operations",
  customerId,
  serviceType = "Brokerage",
  currentUser,
}: CreateBrokerageBookingPanelProps) {
  const [loading, setLoading] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [teamAssignment, setTeamAssignment] = useState<TeamAssignment | null>(null);
  
  // Initialize form data with prefill if provided
  const [formData, setFormData] = useState<BrokerageBookingFormData>({
    brokerageType: "",
    customerName: "",
    accountOwner: "",
    accountHandler: "",
    customsEntryType: "",
    assessmentType: "",
    releaseType: "",
    declarationType: "",
    quotationReferenceNumber: "",
    status: "Draft",
    consignee: "",
    accountNumber: "",
    registryNumber: "",
    mblMawb: "",
    hblHawb: "",
    invoiceNumber: "",
    invoiceValue: "",
    shipmentOrigin: "",
    entryNumber: "",
    releaseDate: "",
    deliveryAddress: "",
    broker: "",
    commodityDescription: "",
    hsCode: "",
    dutyRate: "",
    vatRate: "",
    otherCharges: "",
    remarks: "",
    pod: "",
    mode: "",
    cargoType: "",
    countryOfOrigin: "",
    preferentialTreatment: "",
  });

  // Apply prefill data when component mounts or prefillData changes
  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        ...prefillData,
      }));
    }
  }, [prefillData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrokerageTypeChange = (type: "Standard" | "All-Inclusive" | "Non-Regular") => {
    setFormData((prev) => ({ ...prev, brokerageType: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName) {
      toast.error("Customer Name is required");
      return;
    }

    // If from Pricing module, require team assignments
    if (source === "pricing" && !teamAssignment) {
      toast.error("Please complete team assignments");
      return;
    }
    
    setLoading(true);

    try {
      // Prepare submission data
      const submissionData = { ...formData };
      
      // Add team assignments if from Pricing
      if (source === "pricing" && teamAssignment) {
        submissionData.assigned_manager_id = teamAssignment.manager.id;
        submissionData.assigned_manager_name = teamAssignment.manager.name;
        submissionData.assigned_supervisor_id = teamAssignment.supervisor?.id;
        submissionData.assigned_supervisor_name = teamAssignment.supervisor?.name;
        submissionData.assigned_handler_id = teamAssignment.handler?.id;
        submissionData.assigned_handler_name = teamAssignment.handler?.name;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/brokerage-bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create brokerage booking");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Brokerage booking created successfully");
        
        // Save team preference if requested and from Pricing
        if (source === "pricing" && teamAssignment?.saveAsDefault && customerId) {
          try {
            await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/client-handler-preferences`,
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
        
        onSuccess(result.data); // Pass the booking data
        onClose();
      } else {
        toast.error("Failed to create booking: " + result.error);
      }
    } catch (error) {
      console.error("Error creating brokerage booking:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.customerName.trim() !== "" && 
    (source === "operations" || (source === "pricing" && teamAssignment !== null));
  
  // Helper function to check if a field is pre-filled
  const isPrefilled = (fieldName: keyof BrokerageBookingFormData): boolean => {
    return prefillData ? prefillData[fieldName] !== undefined : false;
  };
  
  // Helper function to get input style with prefill indication
  const getInputStyle = (fieldName: keyof BrokerageBookingFormData) => {
    const baseStyle = {
      border: "1px solid var(--neuron-ui-border)",
      color: "var(--neuron-ink-primary)",
    };
    
    if (isPrefilled(fieldName)) {
      return {
        ...baseStyle,
        backgroundColor: "#F0FDF4", // Light green for pre-filled fields
      };
    }
    
    return {
      ...baseStyle,
      backgroundColor: "#FFFFFF",
    };
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black z-40"
        onClick={onClose}
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
                <FileCheck size={20} style={{ color: "#0F766E" }} />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B" }}>
                New Brokerage Booking
              </h2>
            </div>
            <button
              onClick={onClose}
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
            {source === "pricing" 
              ? "Create a new brokerage booking from project specifications" 
              : "Create a new customs brokerage entry booking"}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-12 py-8">
          <form onSubmit={handleSubmit} id="create-brokerage-form">
            {/* Brokerage Type Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Brokerage Type
                </h3>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {["Standard", "All-Inclusive", "Non-Regular"].map(type => {
                  const isSelected = formData.brokerageType === type;
                  const isHovered = hoveredType === type;
                  
                  let backgroundColor = "white";
                  let borderColor = "var(--neuron-ui-border)";
                  let textColor = "var(--neuron-ink-base)";
                  
                  if (isSelected) {
                    backgroundColor = "#0F766E";
                    borderColor = "#0F766E";
                    textColor = "white";
                  } else if (isHovered) {
                    backgroundColor = "#F8FBFB";
                    borderColor = "#0F766E";
                  }
                  
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleBrokerageTypeChange(type as any)}
                      onMouseEnter={() => setHoveredType(type)}
                      onMouseLeave={() => setHoveredType(null)}
                      style={{
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: textColor,
                        backgroundColor: backgroundColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        flex: 1
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
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
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Customer Name <span style={{ color: "#C94F3D" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                    style={getInputStyle("customerName")}
                  />
                </div>

                {formData.projectNumber && (
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Project Number
                    </label>
                    <input
                      type="text"
                      name="projectNumber"
                      value={formData.projectNumber}
                      onChange={handleChange}
                      placeholder="Project reference"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("projectNumber")}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Account Owner
                    </label>
                    <input
                      type="text"
                      name="accountOwner"
                      value={formData.accountOwner}
                      onChange={handleChange}
                      placeholder="Account owner"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("accountOwner")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Account Handler
                    </label>
                    <input
                      type="text"
                      name="accountHandler"
                      value={formData.accountHandler}
                      onChange={handleChange}
                      placeholder="Account handler"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("accountHandler")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Customs Entry Type
                    </label>
                    <input
                      type="text"
                      name="customsEntryType"
                      value={formData.customsEntryType}
                      onChange={handleChange}
                      placeholder="e.g., Formal, Informal"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("customsEntryType")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Assessment Type
                    </label>
                    <input
                      type="text"
                      name="assessmentType"
                      value={formData.assessmentType}
                      onChange={handleChange}
                      placeholder="e.g., Green, Yellow, Red"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("assessmentType")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Release Type
                    </label>
                    <input
                      type="text"
                      name="releaseType"
                      value={formData.releaseType}
                      onChange={handleChange}
                      placeholder="e.g., Full, Partial"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("releaseType")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Declaration Type
                    </label>
                    <input
                      type="text"
                      name="declarationType"
                      value={formData.declarationType}
                      onChange={handleChange}
                      placeholder="e.g., Import, Export"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("declarationType")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Quotation Reference
                    </label>
                    <input
                      type="text"
                      name="quotationReferenceNumber"
                      value={formData.quotationReferenceNumber}
                      onChange={handleChange}
                      placeholder="Quotation reference"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("quotationReferenceNumber")}
                    />
                  </div>

                  <CustomDropdown
                    label="Status"
                    value={formData.status}
                    onChange={(value) => handleChange({ target: { name: "status", value } } as any)}
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
            </div>

            {/* Shipment Details - Conditional based on Brokerage Type */}
            {formData.brokerageType && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={16} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Shipment Details
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* POD */}
                  <div className="grid grid-cols-2 gap-4">
                    <CustomDropdown
                      label="POD (Port of Discharge)"
                      value={formData.pod}
                      onChange={(value) => handleChange({ target: { name: "pod", value } } as any)}
                      options={[
                        { value: "NAIA", label: "NAIA" },
                        { value: "MICP", label: "MICP" },
                        { value: "POM", label: "POM" },
                      ]}
                      placeholder="Select POD..."
                      fullWidth
                    />

                    <CustomDropdown
                      label="Mode"
                      value={formData.mode}
                      onChange={(value) => handleChange({ target: { name: "mode", value } } as any)}
                      options={[
                        { value: "FCL", label: "FCL" },
                        { value: "LCL", label: "LCL" },
                        { value: "AIR", label: "AIR" },
                        { value: "Multi-modal", label: "Multi-modal" },
                      ]}
                      placeholder="Select Mode..."
                      fullWidth
                    />
                  </div>

                  {/* Cargo Type */}
                  <CustomDropdown
                    label="Cargo Type"
                    value={formData.cargoType}
                    onChange={(value) => handleChange({ target: { name: "cargoType", value } } as any)}
                    options={[
                      { value: "Dry", label: "Dry" },
                      { value: "Reefer", label: "Reefer" },
                      { value: "Breakbulk", label: "Breakbulk" },
                      { value: "RORO", label: "RORO" },
                    ]}
                    placeholder="Select Cargo Type..."
                    fullWidth
                  />

                  {/* All-Inclusive Specific Fields */}
                  {formData.brokerageType === "All-Inclusive" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                            Country of Origin
                          </label>
                          <input
                            type="text"
                            name="countryOfOrigin"
                            value={formData.countryOfOrigin}
                            onChange={handleChange}
                            placeholder="Enter country of origin"
                            className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                            style={getInputStyle("countryOfOrigin")}
                          />
                        </div>

                        <CustomDropdown
                          label="Preferential Treatment"
                          value={formData.preferentialTreatment}
                          onChange={(value) => handleChange({ target: { name: "preferentialTreatment", value } } as any)}
                          options={[
                            { value: "Form E", label: "Form E" },
                            { value: "Form D", label: "Form D" },
                            { value: "Form AI", label: "Form AI" },
                            { value: "Form AK", label: "Form AK" },
                            { value: "Form JP", label: "Form JP" },
                          ]}
                          placeholder="Select treatment..."
                          fullWidth
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Entry Details */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Entry Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Consignee
                    </label>
                    <input
                      type="text"
                      name="consignee"
                      value={formData.consignee}
                      onChange={handleChange}
                      placeholder="Consignee name"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("consignee")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Account number"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("accountNumber")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Registry Number
                    </label>
                    <input
                      type="text"
                      name="registryNumber"
                      value={formData.registryNumber}
                      onChange={handleChange}
                      placeholder="Registry number"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("registryNumber")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Entry Number
                    </label>
                    <input
                      type="text"
                      name="entryNumber"
                      value={formData.entryNumber}
                      onChange={handleChange}
                      placeholder="Entry number"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("entryNumber")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      MBL/MAWB
                    </label>
                    <input
                      type="text"
                      name="mblMawb"
                      value={formData.mblMawb}
                      onChange={handleChange}
                      placeholder="Master bill of lading"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("mblMawb")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      HBL/HAWB
                    </label>
                    <input
                      type="text"
                      name="hblHawb"
                      value={formData.hblHawb}
                      onChange={handleChange}
                      placeholder="House bill of lading"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("hblHawb")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      placeholder="Invoice number"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("invoiceNumber")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Invoice Value
                    </label>
                    <input
                      type="text"
                      name="invoiceValue"
                      value={formData.invoiceValue}
                      onChange={handleChange}
                      placeholder="e.g., USD 50,000"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("invoiceValue")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Shipment Origin
                    </label>
                    <input
                      type="text"
                      name="shipmentOrigin"
                      value={formData.shipmentOrigin}
                      onChange={handleChange}
                      placeholder="Origin country"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("shipmentOrigin")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Release Date
                    </label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("releaseDate")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Broker
                    </label>
                    <input
                      type="text"
                      name="broker"
                      value={formData.broker}
                      onChange={handleChange}
                      placeholder="Broker name"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("broker")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Delivery Address
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Enter delivery address"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                    style={getInputStyle("deliveryAddress")}
                  />
                </div>
              </div>
            </div>

            {/* Commodity & Charges */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Commodity & Charges
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Commodity Description
                  </label>
                  <textarea
                    name="commodityDescription"
                    value={formData.commodityDescription}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Describe the commodity"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                    style={getInputStyle("commodityDescription")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      HS Code
                    </label>
                    <input
                      type="text"
                      name="hsCode"
                      value={formData.hsCode}
                      onChange={handleChange}
                      placeholder="Harmonized System code"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("hsCode")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Duty Rate
                    </label>
                    <input
                      type="text"
                      name="dutyRate"
                      value={formData.dutyRate}
                      onChange={handleChange}
                      placeholder="e.g., 5%"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("dutyRate")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      VAT Rate
                    </label>
                    <input
                      type="text"
                      name="vatRate"
                      value={formData.vatRate}
                      onChange={handleChange}
                      placeholder="e.g., 12%"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("vatRate")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Other Charges
                    </label>
                    <input
                      type="text"
                      name="otherCharges"
                      value={formData.otherCharges}
                      onChange={handleChange}
                      placeholder="Other charges"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={getInputStyle("otherCharges")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Additional notes or remarks"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                    style={getInputStyle("remarks")}
                  />
                </div>
              </div>
            </div>

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
            onClick={onClose}
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
            form="create-brokerage-form"
            disabled={!isFormValid || loading}
            className="px-6 py-2.5 rounded-lg transition-all flex items-center gap-2"
            style={{
              backgroundColor: isFormValid && !loading ? "#0F766E" : "#D1D5DB",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: isFormValid && !loading ? "pointer" : "not-allowed",
              opacity: isFormValid && !loading ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (isFormValid && !loading) {
                e.currentTarget.style.backgroundColor = "#0D6560";
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid && !loading) {
                e.currentTarget.style.backgroundColor = "#0F766E";
              }
            }}
          >
            <FileCheck size={16} />
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </div>
    </>
  );
}