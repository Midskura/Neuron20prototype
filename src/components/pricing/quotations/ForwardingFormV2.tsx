import { Ship, MapPin, Package } from "lucide-react";
import { SimpleDropdown } from "../../bd/SimpleDropdown";
import type { ForwardingDetails, Incoterm, CargoType, Mode } from "../../../types/pricing";

interface ForwardingFormV2Props {
  data: Partial<ForwardingDetails>;
  onChange: (data: Partial<ForwardingDetails>) => void;
}

export function ForwardingFormV2({ data, onChange }: ForwardingFormV2Props) {
  const updateField = (field: keyof ForwardingDetails, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <div style={{
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--neuron-ink-primary)",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        <Ship size={14} style={{ color: "#0F766E" }} />
        SERVICE DETAILS
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px"
      }}>
        {/* Incoterms */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            Incoterms *
          </label>
          <SimpleDropdown
            value={data.incoterms || ""}
            onChange={(value) => updateField('incoterms', value as Incoterm)}
            options={["EXW", "FOB", "CIF", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP"]}
            placeholder="Select incoterms"
          />
        </div>

        {/* Cargo Type */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            Cargo Type *
          </label>
          <SimpleDropdown
            value={data.cargo_type || ""}
            onChange={(value) => updateField('cargo_type', value as CargoType)}
            options={["General", "Perishable", "Hazardous", "Fragile", "High Value"]}
            placeholder="Select cargo type"
          />
        </div>

        {/* Mode */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            Mode *
          </label>
          <SimpleDropdown
            value={data.mode || ""}
            onChange={(value) => updateField('mode', value as Mode)}
            options={["Air", "Ocean", "Land"]}
            placeholder="Select mode"
          />
        </div>

        {/* Commodity */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            Commodity *
          </label>
          <input
            type="text"
            value={data.commodity || ""}
            onChange={(e) => updateField('commodity', e.target.value)}
            placeholder="e.g., Electronic components, Pharmaceutical products"
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "13px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          />
        </div>

        {/* AOL (Airport of Loading) */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            AOL (Airport of Loading)
          </label>
          <input
            type="text"
            value={data.aol || ""}
            onChange={(e) => updateField('aol', e.target.value)}
            placeholder="e.g., PVG (Shanghai)"
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "13px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          />
        </div>

        {/* POL (Port of Loading) */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            POL (Port of Loading) *
          </label>
          <input
            type="text"
            value={data.pol || ""}
            onChange={(e) => updateField('pol', e.target.value)}
            placeholder="e.g., Shanghai Port"
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "13px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          />
        </div>

        {/* AOD (Airport of Discharge) */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            AOD (Airport of Discharge)
          </label>
          <input
            type="text"
            value={data.aod || ""}
            onChange={(e) => updateField('aod', e.target.value)}
            placeholder="e.g., MNL (Manila)"
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "13px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          />
        </div>

        {/* POD (Port of Discharge) */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            POD (Port of Discharge) *
          </label>
          <input
            type="text"
            value={data.pod || ""}
            onChange={(e) => updateField('pod', e.target.value)}
            placeholder="e.g., Manila South Harbor"
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "13px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          />
        </div>

        {/* Delivery Address */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#667085", marginBottom: "4px" }}>
            Delivery Address
          </label>
          <input
            type="text"
            value={data.delivery_address || ""}
            onChange={(e) => updateField('delivery_address', e.target.value)}
            placeholder="Full delivery address"
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "13px",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          />
        </div>
      </div>
    </div>
  );
}
