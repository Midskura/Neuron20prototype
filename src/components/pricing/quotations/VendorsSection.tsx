import { useState } from "react";
import { Plus, X } from "lucide-react";
import { FormSelect } from "./FormSelect";

// Mock vendor masterlist - will be replaced with actual data later
const VENDOR_MASTERLIST = [
  { value: "maersk-line", label: "Maersk Line" },
  { value: "msc", label: "Mediterranean Shipping Company (MSC)" },
  { value: "cma-cgm", label: "CMA CGM" },
  { value: "hapag-lloyd", label: "Hapag-Lloyd" },
  { value: "ocean-network", label: "Ocean Network Express (ONE)" },
  { value: "evergreen", label: "Evergreen Line" },
  { value: "cosco", label: "COSCO Shipping" },
  { value: "yang-ming", label: "Yang Ming" },
  { value: "dhl-global", label: "DHL Global Forwarding" },
  { value: "kuehne-nagel", label: "Kuehne + Nagel" },
  { value: "db-schenker", label: "DB Schenker" },
  { value: "dsv", label: "DSV" },
  { value: "geodis", label: "GEODIS" },
  { value: "nippon-express", label: "Nippon Express" },
  { value: "panalpina", label: "Panalpina" },
  { value: "fedex-trade", label: "FedEx Trade Networks" }
];

interface Vendor {
  id: string;
  type: "Overseas Agent" | "Local Agent" | "Subcontractor";
  name: string;
}

interface VendorsSectionProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
}

export function VendorsSection({ vendors, setVendors }: VendorsSectionProps) {
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorType, setNewVendorType] = useState<"Overseas Agent" | "Local Agent" | "Subcontractor">("Overseas Agent");
  const [newVendorName, setNewVendorName] = useState("");
  const [isAddVendorHovered, setIsAddVendorHovered] = useState(false);

  const handleAddVendor = () => {
    if (newVendorName.trim()) {
      // Find the vendor label from the masterlist
      const selectedVendor = VENDOR_MASTERLIST.find(v => v.value === newVendorName);
      const vendorDisplayName = selectedVendor ? selectedVendor.label : newVendorName;
      
      const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        type: newVendorType,
        name: vendorDisplayName
      };
      setVendors([...vendors, newVendor]);
      setNewVendorName("");
      setShowAddVendor(false);
    }
  };

  const handleRemoveVendor = (vendorId: string) => {
    setVendors(vendors.filter(v => v.id !== vendorId));
  };

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid var(--neuron-ui-border)",
      borderRadius: "8px",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--neuron-brand-green)",
          margin: 0
        }}>
          Vendors
        </h2>
        <button
          type="button"
          onClick={() => setShowAddVendor(!showAddVendor)}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--neuron-brand-teal)",
            backgroundColor: "white",
            border: "1px solid var(--neuron-brand-teal)",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#E8F5F3";
            setIsAddVendorHovered(true);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            setIsAddVendorHovered(false);
          }}
        >
          <Plus size={14} />
          Add Vendor
        </button>
      </div>

      {/* Add Vendor Form */}
      {showAddVendor && (
        <div style={{
          padding: "16px",
          backgroundColor: "#F8FBFB",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "6px",
          marginBottom: "12px"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "6px"
              }}>
                Type
              </label>
              <FormSelect
                value={newVendorType}
                onChange={(value) => setNewVendorType(value as any)}
                options={[
                  { value: "Overseas Agent", label: "Overseas Agent" },
                  { value: "Local Agent", label: "Local Agent" },
                  { value: "Subcontractor", label: "Subcontractor" }
                ]}
                placeholder="Select type..."
              />
            </div>

            <div>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "6px"
              }}>
                Vendor Name
              </label>
              <FormSelect
                value={newVendorName}
                onChange={(value) => setNewVendorName(value)}
                options={VENDOR_MASTERLIST}
                placeholder="Select vendor..."
              />
            </div>

            <button
              type="button"
              onClick={handleAddVendor}
              disabled={!newVendorName.trim()}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 500,
                color: "white",
                backgroundColor: newVendorName.trim() ? "#0F766E" : "#D1D5DB",
                border: "none",
                borderRadius: "6px",
                cursor: newVendorName.trim() ? "pointer" : "not-allowed"
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Vendors List */}
      {vendors.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {vendors.map(vendor => (
            <div
              key={vendor.id}
              style={{
                padding: "12px",
                backgroundColor: "#F8FBFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-base)" }}>
                  {vendor.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", marginTop: "2px" }}>
                  {vendor.type}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveVendor(vendor.id)}
                style={{
                  padding: "6px",
                  color: "var(--neuron-ink-muted)",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEE2E2";
                  e.currentTarget.style.color = "#DC2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--neuron-ink-muted)";
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {vendors.length === 0 && !showAddVendor && (
        <div style={{
          padding: "24px",
          textAlign: "center",
          color: "var(--neuron-ink-muted)",
          fontSize: "13px",
          backgroundColor: "#F8FBFB",
          border: "1px dashed var(--neuron-ui-border)",
          borderRadius: "6px"
        }}>
          No vendors added yet
        </div>
      )}
    </div>
  );
}