import { X, Truck, Package, MapPin } from "lucide-react";
import { useState } from "react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "../ui/toast-utils";
import { CustomDropdown } from "../bd/CustomDropdown";

interface CreateTruckingBookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingData?: any) => void; // Updated to accept optional booking data
}

export function CreateTruckingBookingPanel({
  isOpen,
  onClose,
  onSuccess,
}: CreateTruckingBookingPanelProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    accountOwner: "",
    accountHandler: "",
    service: "",
    truckType: "",
    mode: "",
    preferredDeliveryDate: "",
    quotationReferenceNumber: "",
    status: "Draft",
    consignee: "",
    driver: "",
    helper: "",
    vehicleReferenceNumber: "",
    pullOut: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    dateDelivered: "",
    tabsBooking: "",
    emptyReturn: "",
    cyFee: "No",
    eirAvailability: "",
    earlyGateIn: "No",
    detDemValidity: "",
    storageValidity: "",
    shippingLine: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName) {
      toast.error("Customer Name is required");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/trucking-bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create trucking booking");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Trucking booking created successfully");
        onSuccess(result.data); // Pass the booking data
        onClose();
      } else {
        toast.error("Failed to create booking: " + result.error);
      }
    } catch (error) {
      console.error("Error creating trucking booking:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.customerName.trim() !== "";

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
                <Truck size={20} style={{ color: "#0F766E" }} />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B" }}>
                New Trucking Booking
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
            Create a new trucking booking for inland transportation
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-12 py-8">
          <form onSubmit={handleSubmit} id="create-trucking-form">
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
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
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
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
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
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Service
                    </label>
                    <input
                      type="text"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      placeholder="e.g., Container Delivery"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Truck Type
                    </label>
                    <input
                      type="text"
                      name="truckType"
                      value={formData.truckType}
                      onChange={handleChange}
                      placeholder="e.g., 10-wheeler, Wing van"
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
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Mode
                    </label>
                    <input
                      type="text"
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      placeholder="e.g., FCL, LCL"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      name="preferredDeliveryDate"
                      value={formData.preferredDeliveryDate}
                      onChange={handleChange}
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
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
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

            {/* Delivery Details */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Delivery Details
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
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Driver
                    </label>
                    <input
                      type="text"
                      name="driver"
                      value={formData.driver}
                      onChange={handleChange}
                      placeholder="Driver name"
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
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Helper
                    </label>
                    <input
                      type="text"
                      name="helper"
                      value={formData.helper}
                      onChange={handleChange}
                      placeholder="Helper name"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Vehicle Reference Number
                    </label>
                    <input
                      type="text"
                      name="vehicleReferenceNumber"
                      value={formData.vehicleReferenceNumber}
                      onChange={handleChange}
                      placeholder="Vehicle reference"
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
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Pull Out Location
                  </label>
                  <input
                    type="text"
                    name="pullOut"
                    value={formData.pullOut}
                    onChange={handleChange}
                    placeholder="Pull out location"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
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
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Delivery Instructions
                  </label>
                  <textarea
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Special delivery instructions"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--neuron-ink-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Date Delivered
                  </label>
                  <input
                    type="date"
                    name="dateDelivered"
                    value={formData.dateDelivered}
                    onChange={handleChange}
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

            {/* FCL Additional Details */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={16} style={{ color: "#0F766E" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Additional Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      TABS Booking
                    </label>
                    <input
                      type="text"
                      name="tabsBooking"
                      value={formData.tabsBooking}
                      onChange={handleChange}
                      placeholder="TABS booking reference"
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Empty Return
                    </label>
                    <input
                      type="text"
                      name="emptyReturn"
                      value={formData.emptyReturn}
                      onChange={handleChange}
                      placeholder="Empty return location"
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
                  <CustomDropdown
                    label="CY Fee"
                    value={formData.cyFee}
                    onChange={(value) => handleChange({ target: { name: "cyFee", value } } as any)}
                    options={[
                      { value: "No", label: "No" },
                      { value: "Yes", label: "Yes" },
                    ]}
                    placeholder="Select..."
                    fullWidth
                  />

                  <CustomDropdown
                    label="Early Gate In"
                    value={formData.earlyGateIn}
                    onChange={(value) => handleChange({ target: { name: "earlyGateIn", value } } as any)}
                    options={[
                      { value: "No", label: "No" },
                      { value: "Yes", label: "Yes" },
                    ]}
                    placeholder="Select..."
                    fullWidth
                  />
                </div>

                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    EIR Availability
                  </label>
                  <input
                    type="date"
                    name="eirAvailability"
                    value={formData.eirAvailability}
                    onChange={handleChange}
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
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Det/Dem Validity
                    </label>
                    <input
                      type="date"
                      name="detDemValidity"
                      value={formData.detDemValidity}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Storage Validity
                    </label>
                    <input
                      type="date"
                      name="storageValidity"
                      value={formData.storageValidity}
                      onChange={handleChange}
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
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Shipping Line
                  </label>
                  <input
                    type="text"
                    name="shippingLine"
                    value={formData.shippingLine}
                    onChange={handleChange}
                    placeholder="Shipping line name"
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
            form="create-trucking-form"
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
            <Truck size={16} />
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </div>
    </>
  );
}
