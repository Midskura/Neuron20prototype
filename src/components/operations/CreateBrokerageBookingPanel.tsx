import { X, FileCheck, Package, FileText } from "lucide-react";
import { useState } from "react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "../ui/toast-utils";

interface CreateBrokerageBookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBrokerageBookingPanel({
  isOpen,
  onClose,
  onSuccess,
}: CreateBrokerageBookingPanelProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/brokerage-bookings`,
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
        throw new Error("Failed to create brokerage booking");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Brokerage booking created successfully");
        onSuccess();
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
            Create a new customs brokerage entry booking
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-12 py-8">
          <form onSubmit={handleSubmit} id="create-brokerage-form">
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
                      Customs Entry Type
                    </label>
                    <input
                      type="text"
                      name="customsEntryType"
                      value={formData.customsEntryType}
                      onChange={handleChange}
                      placeholder="e.g., Formal, Informal"
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
                      Assessment Type
                    </label>
                    <input
                      type="text"
                      name="assessmentType"
                      value={formData.assessmentType}
                      onChange={handleChange}
                      placeholder="e.g., Green, Yellow, Red"
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
                      Release Type
                    </label>
                    <input
                      type="text"
                      name="releaseType"
                      value={formData.releaseType}
                      onChange={handleChange}
                      placeholder="e.g., Full, Partial"
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
                      Declaration Type
                    </label>
                    <input
                      type="text"
                      name="declarationType"
                      value={formData.declarationType}
                      onChange={handleChange}
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

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px]"
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

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
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--neuron-ink-primary)",
                      }}
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
                      Registry Number
                    </label>
                    <input
                      type="text"
                      name="registryNumber"
                      value={formData.registryNumber}
                      onChange={handleChange}
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
                      MBL/MAWB
                    </label>
                    <input
                      type="text"
                      name="mblMawb"
                      value={formData.mblMawb}
                      onChange={handleChange}
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
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      placeholder="Invoice number"
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
                      Invoice Value
                    </label>
                    <input
                      type="text"
                      name="invoiceValue"
                      value={formData.invoiceValue}
                      onChange={handleChange}
                      placeholder="e.g., USD 50,000"
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
                      Shipment Origin
                    </label>
                    <input
                      type="text"
                      name="shipmentOrigin"
                      value={formData.shipmentOrigin}
                      onChange={handleChange}
                      placeholder="Origin country"
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
                      Release Date
                    </label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
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
                      Broker
                    </label>
                    <input
                      type="text"
                      name="broker"
                      value={formData.broker}
                      onChange={handleChange}
                      placeholder="Broker name"
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
                      HS Code
                    </label>
                    <input
                      type="text"
                      name="hsCode"
                      value={formData.hsCode}
                      onChange={handleChange}
                      placeholder="Harmonized System code"
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
                      Duty Rate
                    </label>
                    <input
                      type="text"
                      name="dutyRate"
                      value={formData.dutyRate}
                      onChange={handleChange}
                      placeholder="e.g., 5%"
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
                      VAT Rate
                    </label>
                    <input
                      type="text"
                      name="vatRate"
                      value={formData.vatRate}
                      onChange={handleChange}
                      placeholder="e.g., 12%"
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
                      Other Charges
                    </label>
                    <input
                      type="text"
                      name="otherCharges"
                      value={formData.otherCharges}
                      onChange={handleChange}
                      placeholder="Other charges"
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
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Additional notes or remarks"
                    className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 text-[13px] resize-none"
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
