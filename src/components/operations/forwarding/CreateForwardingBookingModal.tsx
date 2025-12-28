import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import type { ForwardingBooking, ExecutionStatus } from "../../../types/operations";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "../../ui/toast-utils";

interface CreateForwardingBookingModalProps {
  onClose: () => void;
  onBookingCreated: () => void;
  currentUser?: { name: string; email: string; department: string } | null;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function CreateForwardingBookingModal({
  onClose,
  onBookingCreated,
  currentUser
}: CreateForwardingBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingNumber, setBookingNumber] = useState(""); // Empty for auto-generation, editable
  const [projectNumber, setProjectNumber] = useState("");
  
  // General Information
  const [customerName, setCustomerName] = useState("");
  const [accountOwner, setAccountOwner] = useState(currentUser?.name || "");
  const [accountHandler, setAccountHandler] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [subServices, setSubServices] = useState<string[]>([]);
  const [typeOfEntry, setTypeOfEntry] = useState("");
  const [mode, setMode] = useState<"FCL" | "LCL" | "AIR">("FCL");
  const [cargoType, setCargoType] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [quotationReferenceNumber, setQuotationReferenceNumber] = useState("");
  const [status, setStatus] = useState<ExecutionStatus>("Draft");

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

  const handleAutofill = () => {
    if (!projectNumber) {
      toast.error("Please enter a Project Number first");
      return;
    }
    
    // Future implementation: fetch project data and populate fields
    toast.info("Autofill will be available once Project data is expanded");
  };

  const validateForm = () => {
    if (!customerName) {
      toast.error("Customer Name is required");
      return false;
    }

    // Status-dependent validation
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
      const bookingData: Partial<ForwardingBooking> = {
        bookingId: bookingNumber || undefined, // Server will generate if empty
        projectNumber: projectNumber || undefined,
        customerName,
        accountOwner,
        accountHandler,
        services,
        subServices,
        typeOfEntry,
        mode,
        cargoType,
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
        // FCL fields
        containerNumbers: mode === "FCL" ? containerNumbers.split(",").map(c => c.trim()).filter(Boolean) : undefined,
        containerDeposit: mode === "FCL" ? containerDeposit : undefined,
        emptyReturn: mode === "FCL" ? emptyReturn : undefined,
        detDemValidity: mode === "FCL" ? detDemValidity : undefined,
        storageValidity: mode === "FCL" ? storageValidity : undefined,
        croAvailability: mode === "FCL" ? croAvailability : undefined,
        // LCL/AIR fields
        warehouseLocation: (mode === "LCL" || mode === "AIR") ? warehouseLocation : undefined,
      };

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
        toast.success(`Forwarding booking ${result.data.bookingId} created successfully`);
        onBookingCreated();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#12332B]/10">
          <h2 className="text-[#12332B]">Create Forwarding Booking</h2>
          <button
            onClick={onClose}
            className="text-[#12332B]/40 hover:text-[#12332B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          {/* Project Reference */}
          <div className="mb-8 p-4 bg-[#0F766E]/5 rounded-lg border border-[#0F766E]/20">
            <label className="block text-[#12332B] mb-2">
              Project Reference (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                placeholder="Enter Project Number to autofill"
                className="flex-1 px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
              <button
                type="button"
                onClick={handleAutofill}
                className="px-4 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#0F766E]/90 transition-colors"
              >
                Autofill
              </button>
            </div>
            <p className="text-xs text-[#12332B]/60 mt-2">
              Enter a project number to autofill booking details, or leave blank to enter manually.
            </p>
          </div>

          {/* Booking Number */}
          <div className="mb-6">
            <label className="block text-[#12332B] mb-2">
              Booking Number (Auto-generated)
            </label>
            <input
              type="text"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              placeholder="Leave blank for auto-generation or enter custom"
              className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
            <p className="text-xs text-[#12332B]/60 mt-1">
              Leave blank to auto-generate (e.g., FWD-2025-001) or enter a custom booking number
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#12332B]/10 my-6"></div>

          {/* General Information */}
          <div className="mb-6">
            <h3 className="text-[#12332B] mb-4">📌 General Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Account Owner
                </label>
                <input
                  type="text"
                  value={accountOwner}
                  onChange={(e) => setAccountOwner(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Account Handler
                </label>
                <input
                  type="text"
                  value={accountHandler}
                  onChange={(e) => setAccountHandler(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "FCL" | "LCL" | "AIR")}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                >
                  <option value="FCL">FCL</option>
                  <option value="LCL">LCL</option>
                  <option value="AIR">AIR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Type of Entry
                </label>
                <input
                  type="text"
                  value={typeOfEntry}
                  onChange={(e) => setTypeOfEntry(e.target.value)}
                  placeholder="e.g., Import, Export"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Cargo Type
                </label>
                <input
                  type="text"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  placeholder="e.g., General, Hazardous"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[#12332B]/80 mb-2">
                Delivery Address
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Quotation Reference Number
                </label>
                <input
                  type="text"
                  value={quotationReferenceNumber}
                  onChange={(e) => setQuotationReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExecutionStatus)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
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

            {/* Status-dependent fields */}
            {status === "Pending" && (
              <div className="mb-4">
                <label className="block text-[#12332B]/80 mb-2">
                  Pending Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={pendingReason}
                  onChange={(e) => setPendingReason(e.target.value)}
                  rows={2}
                  placeholder="Explain why this booking is pending..."
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            )}

            {status === "Completed" && (
              <div className="mb-4">
                <label className="block text-[#12332B]/80 mb-2">
                  Completion Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            )}

            {status === "Cancelled" && (
              <>
                <div className="mb-4">
                  <label className="block text-[#12332B]/80 mb-2">
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={2}
                    placeholder="Explain why this booking was cancelled..."
                    className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#12332B]/80 mb-2">
                    Cancelled Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={cancelledDate}
                    onChange={(e) => setCancelledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#12332B]/10 my-6"></div>

          {/* Shipment Information */}
          <div className="mb-6">
            <h3 className="text-[#12332B] mb-4">🚢 Shipment Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Consignee
                </label>
                <input
                  type="text"
                  value={consignee}
                  onChange={(e) => setConsignee(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Shipper
                </label>
                <input
                  type="text"
                  value={shipper}
                  onChange={(e) => setShipper(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  MBL/MAWB
                </label>
                <input
                  type="text"
                  value={mblMawb}
                  onChange={(e) => setMblMawb(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  HBL/HAWB (If any)
                </label>
                <input
                  type="text"
                  value={hblHawb}
                  onChange={(e) => setHblHawb(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Registry Number
                </label>
                <input
                  type="text"
                  value={registryNumber}
                  onChange={(e) => setRegistryNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Carrier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  AOL/POL
                </label>
                <input
                  type="text"
                  value={aolPol}
                  onChange={(e) => setAolPol(e.target.value)}
                  placeholder="Airport/Port of Loading"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  AOD/POD
                </label>
                <input
                  type="text"
                  value={aodPod}
                  onChange={(e) => setAodPod(e.target.value)}
                  placeholder="Airport/Port of Discharge"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Forwarder (If any)
                </label>
                <input
                  type="text"
                  value={forwarder}
                  onChange={(e) => setForwarder(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[#12332B]/80 mb-2">
                Commodity Description
              </label>
              <textarea
                value={commodityDescription}
                onChange={(e) => setCommodityDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Preferential Treatment
                </label>
                <input
                  type="text"
                  value={preferentialTreatment}
                  onChange={(e) => setPreferentialTreatment(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Gross Weight
                </label>
                <input
                  type="text"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="e.g., 1000 kg"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g., 10x5x3 m"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#12332B]/80 mb-2">
                ETA (Estimated Time of Arrival)
              </label>
              <input
                type="date"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>
          </div>

          {/* Conditional: FCL Fields */}
          {mode === "FCL" && (
            <>
              <div className="border-t border-[#12332B]/10 my-6"></div>
              <div className="mb-6">
                <h3 className="text-[#12332B] mb-4">📦 Container Details (FCL)</h3>
                
                <div className="mb-4">
                  <label className="block text-[#12332B]/80 mb-2">
                    Container Number/s
                  </label>
                  <input
                    type="text"
                    value={containerNumbers}
                    onChange={(e) => setContainerNumbers(e.target.value)}
                    placeholder="Comma-separated (e.g., ABCD1234567, EFGH7654321)"
                    className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="containerDeposit"
                    checked={containerDeposit}
                    onChange={(e) => setContainerDeposit(e.target.checked)}
                    className="w-4 h-4 text-[#0F766E] border-[#12332B]/20 rounded focus:ring-2 focus:ring-[#0F766E]/20"
                  />
                  <label htmlFor="containerDeposit" className="text-[#12332B]/80">
                    Container Deposit
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#12332B]/80 mb-2">
                      Empty Return
                    </label>
                    <input
                      type="text"
                      value={emptyReturn}
                      onChange={(e) => setEmptyReturn(e.target.value)}
                      className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#12332B]/80 mb-2">
                      Det/Dem Validity
                    </label>
                    <input
                      type="date"
                      value={detDemValidity}
                      onChange={(e) => setDetDemValidity(e.target.value)}
                      className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#12332B]/80 mb-2">
                      Storage Validity
                    </label>
                    <input
                      type="date"
                      value={storageValidity}
                      onChange={(e) => setStorageValidity(e.target.value)}
                      className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#12332B]/80 mb-2">
                      CRO Availability
                    </label>
                    <input
                      type="date"
                      value={croAvailability}
                      onChange={(e) => setCroAvailability(e.target.value)}
                      className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Conditional: LCL/AIR Fields */}
          {(mode === "LCL" || mode === "AIR") && (
            <>
              <div className="border-t border-[#12332B]/10 my-6"></div>
              <div className="mb-6">
                <h3 className="text-[#12332B] mb-4">📍 Warehouse Details ({mode})</h3>
                
                <div>
                  <label className="block text-[#12332B]/80 mb-2">
                    Warehouse Location
                  </label>
                  <input
                    type="text"
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#12332B]/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[#12332B] hover:bg-[#12332B]/5 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#0F766E]/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
