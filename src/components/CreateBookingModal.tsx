import { useState } from "react";
import { X, Package } from "lucide-react";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: {
    client: string;
    pickup: string;
    dropoff: string;
    deliveryDate: string;
    driver: string;
    vehicle: string;
    notes: string;
  }) => void;
}

export function CreateBookingModal({ isOpen, onClose, onSubmit }: CreateBookingModalProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    billTo: "",
    clientAddress: "",
    company: "JJB Main",
    bookingRef: "",
    notes: "",
    pickupLocation: "",
    dropoffLocation: "",
    deliveryDate: "",
    commodity: "",
    measurement: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.pickupLocation || !formData.dropoffLocation || !formData.deliveryDate) {
      return;
    }

    onSubmit({
      client: formData.clientName,
      pickup: formData.pickupLocation,
      dropoff: formData.dropoffLocation,
      deliveryDate: formData.deliveryDate,
      driver: "",
      vehicle: "",
      notes: formData.notes,
    });
    
    // Reset form
    setFormData({
      clientName: "",
      billTo: "",
      clientAddress: "",
      company: "JJB Main",
      bookingRef: "",
      notes: "",
      pickupLocation: "",
      dropoffLocation: "",
      deliveryDate: "",
      commodity: "",
      measurement: "",
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          maxWidth: "920px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid #E5E9F0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#12332B", marginBottom: "4px" }}>
              Create Booking
            </h2>
            <p style={{ fontSize: "13px", color: "#667085" }}>
              This booking will be linked to a tracking number
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "#667085",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div
          style={{
            padding: "32px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "32px" }}>
              {/* Left Column - Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Client Name & Delivery Date */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Client Name
                    </label>
                    <input
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Enter client name"
                      required
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      required
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    />
                  </div>
                </div>

                {/* Bill To / Attention To */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Bill To / Attention To
                  </label>
                  <input
                    value={formData.billTo}
                    onChange={(e) => setFormData({ ...formData, billTo: e.target.value })}
                    placeholder="e.g., Mr. Sandesh Mhatre"
                    style={{
                      height: "40px",
                      padding: "0 12px",
                      fontSize: "14px",
                      border: "1px solid #E5E9F0",
                      borderRadius: "8px",
                      background: "#FFFFFF",
                      outline: "none",
                      color: "#12332B",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E9F0";
                    }}
                  />
                  <p style={{ fontSize: "11px", color: "#667085", marginTop: "4px" }}>
                    This name will appear on the TDA / invoice header
                  </p>
                </div>

                {/* Client Address & Company */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Client Address / Location
                    </label>
                    <input
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      placeholder="e.g., MAHARASHTRA, INDIA"
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Company
                    </label>
                    <select
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    >
                      <option value="JJB Main">JJB Main</option>
                      <option value="JJB Express">JJB Express</option>
                      <option value="JJB Logistics">JJB Logistics</option>
                    </select>
                  </div>
                </div>

                {/* Pickup & Dropoff Locations */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Pickup Location
                    </label>
                    <input
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      placeholder="Enter pickup location"
                      required
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Dropoff Location
                    </label>
                    <input
                      value={formData.dropoffLocation}
                      onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                      placeholder="Enter dropoff location"
                      required
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    />
                  </div>
                </div>

                {/* Booking Reference */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Booking Ref
                  </label>
                  <input
                    value={formData.bookingRef}
                    onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                    placeholder="Select booking"
                    style={{
                      height: "40px",
                      padding: "0 12px",
                      fontSize: "14px",
                      border: "1px solid #E5E9F0",
                      borderRadius: "8px",
                      background: "#FFFFFF",
                      outline: "none",
                      color: "#12332B",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E9F0";
                    }}
                  />
                </div>

                {/* Commodity & Measurement */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Commodity
                    </label>
                    <input
                      value={formData.commodity}
                      onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                      placeholder="e.g., Personal Household Items"
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                      Measurement
                    </label>
                    <input
                      value={formData.measurement}
                      onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                      placeholder="e.g., 10 bxs"
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        fontSize: "14px",
                        border: "1px solid #E5E9F0",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        outline: "none",
                        color: "#12332B",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E9F0";
                      }}
                    />
                  </div>
                </div>

                {/* Notes / Remarks */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 500, color: "#12332B" }}>
                    Notes / Remarks <span style={{ fontSize: "11px", color: "#667085", fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Kindly make check payable to CONFORME CARGO EXPRESS"
                    rows={3}
                    style={{
                      padding: "12px",
                      fontSize: "14px",
                      border: "1px solid #E5E9F0",
                      borderRadius: "8px",
                      background: "#FFFFFF",
                      outline: "none",
                      color: "#12332B",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E9F0";
                    }}
                  />
                </div>
              </div>

              {/* Right Column - Summary */}
              <div
                style={{
                  background: "#F9FAFB",
                  borderRadius: "12px",
                  padding: "20px",
                  height: "fit-content",
                  position: "sticky",
                  top: 0,
                }}
              >
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", marginBottom: "16px" }}>
                  Booking Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#667085", marginBottom: "4px" }}>Client</div>
                    <div style={{ fontSize: "13px", color: "#12332B", fontWeight: 500 }}>
                      {formData.clientName || "—"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#667085", marginBottom: "4px" }}>Date</div>
                    <div style={{ fontSize: "13px", color: "#12332B", fontWeight: 500 }}>
                      {formData.deliveryDate ? new Date(formData.deliveryDate).toLocaleDateString() : "—"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#667085", marginBottom: "4px" }}>Linked Booking</div>
                    <div style={{ fontSize: "13px", color: "#12332B", fontWeight: 500 }}>
                      {formData.bookingRef || "—"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#667085", marginBottom: "4px" }}>Company</div>
                    <div style={{ fontSize: "13px", color: "#12332B", fontWeight: 500 }}>
                      {formData.company || "—"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#667085", marginBottom: "4px" }}>Route</div>
                    <div style={{ fontSize: "13px", color: "#12332B", fontWeight: 500 }}>
                      {formData.pickupLocation && formData.dropoffLocation
                        ? `${formData.pickupLocation} → ${formData.dropoffLocation}`
                        : "—"}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #E5E9F0", paddingTop: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#667085", marginBottom: "4px" }}>Total Amount</div>
                  <div style={{ fontSize: "24px", fontWeight: 600, color: "#0F766E" }}>
                    ₱0.00
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Actions */}
        <div
          style={{
            padding: "20px 32px",
            borderTop: "1px solid #E5E9F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              height: "40px",
              padding: "0 16px",
              borderRadius: "8px",
              border: "none",
              background: "#FFFFFF",
              color: "#667085",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Save as Draft
          </button>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "8px",
                border: "1px solid #E5E9F0",
                background: "#FFFFFF",
                color: "#12332B",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              style={{
                height: "40px",
                padding: "0 24px",
                borderRadius: "8px",
                border: "none",
                background: "#0F766E",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(15, 118, 110, 0.2)",
              }}
            >
              <Package size={16} />
              Create Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
