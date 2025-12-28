import { SimpleDropdown } from "../../bd/SimpleDropdown";

interface TruckingData {
  pullOut?: string;
  deliveryAddress?: string;
  truckType?: string;
  deliveryInstructions?: string;
}

interface TruckingFormProps {
  data?: TruckingData;
  onChange: (data: TruckingData) => void;
}

const truckTypes = [
  "10-Wheeler Closed Van",
  "6-Wheeler Closed Van",
  "4-Wheeler Closed Van",
  "Wing Van",
  "Flatbed",
  "Lowbed",
];

export function TruckingForm({ data, onChange }: TruckingFormProps) {
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
            Pull Out
          </label>
          <input
            type="text"
            value={currentData.pullOut || ""}
            onChange={(e) => updateField("pullOut", e.target.value)}
            placeholder="Pick-up location"
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
            Truck Type
          </label>
          <SimpleDropdown
            options={truckTypes}
            value={currentData.truckType || ""}
            onChange={(value) => updateField("truckType", value)}
            placeholder="Select truck type"
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
          Delivery Instructions
        </label>
        <textarea
          value={currentData.deliveryInstructions || ""}
          onChange={(e) => updateField("deliveryInstructions", e.target.value)}
          placeholder="Any special instructions..."
          rows={3}
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
