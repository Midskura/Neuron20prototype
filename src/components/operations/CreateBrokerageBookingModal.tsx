import { useState } from "react";
import { X } from "lucide-react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface CreateBrokerageBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBrokerageBookingModal({ onClose, onSuccess }: CreateBrokerageBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // General Information
    customerName: "", accountOwner: "", accountHandler: "", service: "", incoterms: "", mode: "", cargoType: "", cargoNature: "", quotationReferenceNumber: "", status: "Draft",
    // Shipment Information
    consignee: "", shipper: "", mblMawb: "", hblHawb: "", registryNumber: "", carrier: "", aolPol: "", aodPod: "", forwarder: "", commodityDescription: "", grossWeight: "", dimensions: "", taggingTime: "", etd: "", etb: "", eta: "",
    // FCL Fields
    containerNumbers: "", containerDeposit: "No", detDem: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c142e950/brokerage-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create brokerage booking");
      const result = await response.json();
      if (result.success) onSuccess();
      else { console.error("Error creating brokerage booking:", result.error); alert("Failed to create booking: " + result.error); }
    } catch (error) {
      console.error("Error creating brokerage booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }} onClick={onClose}>
      <div style={{ backgroundColor: "var(--neuron-bg-elevated)", borderRadius: "12px", width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid var(--neuron-ui-border)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--neuron-ui-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--neuron-ink-primary)", margin: 0 }}>Create Brokerage Booking</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--neuron-ink-muted)", borderRadius: "6px" }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {/* General Information */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>General Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Customer Name <span style={{ color: "#EF4444" }}>*</span></label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Account Owner</label><input type="text" name="accountOwner" value={formData.accountOwner} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Account Handler</label><input type="text" name="accountHandler" value={formData.accountHandler} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Service/s</label><input type="text" name="service" value={formData.service} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Incoterms</label><input type="text" name="incoterms" value={formData.incoterms} onChange={handleChange} placeholder="e.g. CIF, FOB, EXW" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Mode</label><input type="text" name="mode" value={formData.mode} onChange={handleChange} placeholder="Sea, Air" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Cargo Type</label><input type="text" name="cargoType" value={formData.cargoType} onChange={handleChange} placeholder="FCL, LCL, Bulk" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Cargo Nature</label><input type="text" name="cargoNature" value={formData.cargoNature} onChange={handleChange} placeholder="General, Hazardous, Perishable" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Quotation Reference Number</label><input type="text" name="quotationReferenceNumber" value={formData.quotationReferenceNumber} onChange={handleChange} placeholder="Link to Pricing module" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Status</label><select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }}>{["Draft", "Confirmed", "In Progress", "Pending", "On Hold", "Completed", "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
            </div>

            {/* Shipment Information */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Shipment Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Consignee</label><input type="text" name="consignee" value={formData.consignee} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Shipper</label><input type="text" name="shipper" value={formData.shipper} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>MBL/MAWB</label><input type="text" name="mblMawb" value={formData.mblMawb} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>HBL/HAWB (If any)</label><input type="text" name="hblHawb" value={formData.hblHawb} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Registry Number</label><input type="text" name="registryNumber" value={formData.registryNumber} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Carrier</label><input type="text" name="carrier" value={formData.carrier} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>AOL/POL</label><input type="text" name="aolPol" value={formData.aolPol} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>AOD/POD</label><input type="text" name="aodPod" value={formData.aodPod} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Forwarder (If any)</label><input type="text" name="forwarder" value={formData.forwarder} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div style={{ gridColumn: "1 / -1" }}><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Commodity Description</label><textarea name="commodityDescription" value={formData.commodityDescription} onChange={handleChange} rows={2} style={{ width: "100%", padding: "12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none", resize: "vertical", fontFamily: "inherit" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Gross Weight</label><input type="text" name="grossWeight" value={formData.grossWeight} onChange={handleChange} placeholder="e.g. 1000 kg" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Dimensions</label><input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="L x W x H" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Tagging Time</label><input type="datetime-local" name="taggingTime" value={formData.taggingTime} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>ETD</label><input type="date" name="etd" value={formData.etd} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>ETB</label><input type="date" name="etb" value={formData.etb} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>ETA</label><input type="date" name="eta" value={formData.eta} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
              </div>
            </div>

            {/* FCL Information */}
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>FCL Information (Optional)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Container Number/s</label><input type="text" name="containerNumbers" value={formData.containerNumbers} onChange={handleChange} placeholder="Comma-separated" style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Container Deposit</label><select name="containerDeposit" value={formData.containerDeposit} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                <div><label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-secondary)", marginBottom: "6px" }}>Det/Dem</label><input type="text" name="detDem" value={formData.detDem} onChange={handleChange} style={{ width: "100%", height: "40px", padding: "0 12px", fontSize: "14px", color: "var(--neuron-ink-primary)", backgroundColor: "var(--neuron-bg-page)", border: "1px solid var(--neuron-ui-border)", borderRadius: "8px", outline: "none" }} /></div>
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
