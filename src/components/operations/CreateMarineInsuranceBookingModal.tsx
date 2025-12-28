import { useState } from "react";
import { X } from "lucide-react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface CreateMarineInsuranceBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMarineInsuranceBookingModal({
  onClose,
  onSuccess,
}: CreateMarineInsuranceBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // General Information
    customerName: "",
    accountOwner: "",
    accountHandler: "",
    service: "",
    quotationReferenceNumber: "",
    status: "Draft",
    // Policy Information
    consignee: "",
    shipper: "",
    blAwbNumber: "",
    carrier: "",
    commodityDescription: "",
    hsCode: "",
    aolPol: "",
    aodPod: "",
    etd: "",
    eta: "",
    amountInsured: "",
    insurer: "",
    dateIssued: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/marine-insurance-bookings`,
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
        throw new Error("Failed to create marine insurance booking");
      }

      const result = await response.json();
      if (result.success) {
        onSuccess();
      } else {
        console.error("Error creating marine insurance booking:", result.error);
        alert("Failed to create booking: " + result.error);
      }
    } catch (error) {
      console.error("Error creating marine insurance booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }} onClick={onClose}>
      <div style={{ backgroundColor: "var(--neuron-bg-elevated)", borderRadius: "12px", width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid var(--neuron-ui-border)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--neuron-ui-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--neuron-ink-primary)", margin: 0 }}>Create Marine Insurance Booking</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--neuron-ink-muted)", borderRadius: "6px" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {/* General Information */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>General Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Customer Name <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Account Owner</label>
                  <input type="text" name="accountOwner" value={formData.accountOwner} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Account Handler</label>
                  <input type="text" name="accountHandler" value={formData.accountHandler} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Service/s</label>
                  <input type="text" name="service" value={formData.service} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Quotation Reference Number</label>
                  <input type="text" name="quotationReferenceNumber" value={formData.quotationReferenceNumber} onChange={handleChange} placeholder="Link to Pricing module" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }}>
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

            {/* Policy Information */}
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Policy Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Consignee</label>
                  <input type="text" name="consignee" value={formData.consignee} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Shipper</label>
                  <input type="text" name="shipper" value={formData.shipper} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>BL/AWB Number</label>
                  <input type="text" name="blAwbNumber" value={formData.blAwbNumber} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Carrier</label>
                  <input type="text" name="carrier" value={formData.carrier} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Commodity Description</label>
                  <textarea name="commodityDescription" value={formData.commodityDescription} onChange={handleChange} rows={2} style={{ width: "100%", padding: "12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>HS Code/s</label>
                  <input type="text" name="hsCode" value={formData.hsCode} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>AOL/POL</label>
                  <input type="text" name="aolPol" value={formData.aolPol} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>AOD/POD</label>
                  <input type="text" name="aodPod" value={formData.aodPod} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>ETD</label>
                  <input type="date" name="etd" value={formData.etd} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>ETA</label>
                  <input type="date" name="eta" value={formData.eta} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Amount Insured</label>
                  <input type="text" name="amountInsured" value={formData.amountInsured} onChange={handleChange} placeholder="e.g. PHP 1,000,000" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Insurer</label>
                  <input type="text" name="insurer" value={formData.insurer} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Date Issued</label>
                  <input type="date" name="dateIssued" value={formData.dateIssued} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "24px", borderTop: "1px solid var(--neuron-ui-border)", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ height: "40px", paddingLeft: "20px", paddingRight: "20px", fontSize: "14px", fontWeight: 600, color: "var(--neuron-ink-secondary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ height: "40px", paddingLeft: "20px", paddingRight: "20px", fontSize: "14px", fontWeight: 600, color: "white", backgroundColor: loading ? "#94A3B8" : "var(--neuron-brand-green)", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Creating..." : "Create Booking"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
