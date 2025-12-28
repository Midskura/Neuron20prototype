import { SimpleDropdown } from "../../bd/SimpleDropdown";

interface ForwardingData {
  incoterms?: string;
  cargoType?: string;
  commodity?: string;
  deliveryAddress?: string;
  mode?: string;
  pol?: string;
  pod?: string;
}

interface ForwardingFormProps {
  data?: ForwardingData;
  onChange: (data: ForwardingData) => void;
}

const incotermsOptions = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"];
const modes = ["Air", "Ocean", "Land"];
const cargoTypes = ["FCL", "LCL", "Loose", "Break Bulk"];

export function ForwardingForm({ data, onChange }: ForwardingFormProps) {
  const currentData = data || {};

  const updateField = (field: string, value: string) => {
    onChange({ ...currentData, [field]: value });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "12px",
              color: "var(--neuron-ink-primary)",
              fontWeight: 500,
            }}
          >
            Incoterms
          </label>
          <SimpleDropdown
            options={incotermsOptions}
            value={currentData.incoterms || ""}
            onChange={(value) => updateField("incoterms", value)}
            placeholder="Select incoterms"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "12px",
              color: "var(--neuron-ink-primary)",
              fontWeight: 500,
            }}
          >
            Cargo Type
          </label>
          <SimpleDropdown
            options={cargoTypes}
            value={currentData.cargoType || ""}
            onChange={(value) => updateField("cargoType", value)}
            placeholder="Select cargo type"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "12px",
              color: "var(--neuron-ink-primary)",
              fontWeight: 500,
            }}
          >
            Mode
          </label>
          <SimpleDropdown
            options={modes}
            value={currentData.mode || ""}
            onChange={(value) => updateField("mode", value)}
            placeholder="Select mode"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "12px",
              color: "var(--neuron-ink-primary)",
              fontWeight: 500,
            }}
          >
            POL
          </label>
          <input
            type="text"
            value={currentData.pol || ""}
            onChange={(e) => updateField("pol", e.target.value)}
            placeholder="Port of Loading"
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--neuron-ui-border)",
              fontSize: "13px",
              color: "var(--neuron-ink-primary)",
              backgroundColor: "white",
            }}
          />
        </div>
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            color: "var(--neuron-ink-primary)",
            fontWeight: 500,
          }}
        >
          POD
        </label>
        <input
          type="text"
          value={currentData.pod || ""}
          onChange={(e) => updateField("pod", e.target.value)}
          placeholder="Port of Discharge"
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid var(--neuron-ui-border)",
            fontSize: "13px",
            color: "var(--neuron-ink-primary)",
            backgroundColor: "white",
          }}
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            color: "var(--neuron-ink-primary)",
            fontWeight: 500,
          }}
        >
          Commodity
        </label>
        <input
          type="text"
          value={currentData.commodity || ""}
          onChange={(e) => updateField("commodity", e.target.value)}
          placeholder="Enter commodity description"
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid var(--neuron-ui-border)",
            fontSize: "13px",
            color: "var(--neuron-ink-primary)",
            backgroundColor: "white",
          }}
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            color: "var(--neuron-ink-primary)",
            fontWeight: 500,
          }}
        >
          Delivery Address
        </label>
        <textarea
          value={currentData.deliveryAddress || ""}
          onChange={(e) => updateField("deliveryAddress", e.target.value)}
          placeholder="Enter delivery address"
          rows={2}
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid var(--neuron-ui-border)",
            fontSize: "13px",
            color: "var(--neuron-ink-primary)",
            backgroundColor: "white",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}
