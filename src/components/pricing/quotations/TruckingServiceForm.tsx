import { FormSelect } from "./FormSelect";

interface TruckingFormData {
  pullOut?: string;
  deliveryAddress?: string;
  truckType?: string;
  qty?: number;
  deliveryInstructions?: string;
}

interface TruckingServiceFormProps {
  data: TruckingFormData;
  onChange: (data: TruckingFormData) => void;
}

export function TruckingServiceForm({ data, onChange }: TruckingServiceFormProps) {
  const updateField = (field: keyof TruckingFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid var(--neuron-ui-border)",
      borderRadius: "8px",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h2 style={{
        fontSize: "16px",
        fontWeight: 600,
        color: "var(--neuron-brand-green)",
        marginBottom: "20px"
      }}>
        Trucking Service
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Pull Out & Delivery Address */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-base)",
              marginBottom: "8px"
            }}>
              Pull Out
            </label>
            <input
              type="text"
              value={data.pullOut || ""}
              onChange={(e) => updateField("pullOut", e.target.value)}
              placeholder="Enter pull out location"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--neuron-ink-base)",
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
              }}
            />
          </div>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-base)",
              marginBottom: "8px"
            }}>
              Delivery Address *
            </label>
            <input
              type="text"
              value={data.deliveryAddress || ""}
              onChange={(e) => updateField("deliveryAddress", e.target.value)}
              placeholder="Enter delivery address"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--neuron-ink-base)",
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
              }}
            />
          </div>
        </div>

        {/* Truck Type & Quantity */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-base)",
              marginBottom: "8px"
            }}>
              Truck Type *
            </label>
            <FormSelect
              value={data.truckType || ""}
              onChange={(value) => updateField("truckType", value)}
              options={[
                { value: "4W", label: "4W" },
                { value: "6W", label: "6W" },
                { value: "10W", label: "10W" },
                { value: "20ft", label: "20ft" },
                { value: "40ft", label: "40ft" },
                { value: "45ft", label: "45ft" }
              ]}
              placeholder="Select truck type..."
            />
          </div>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-base)",
              marginBottom: "8px"
            }}>
              Quantity
            </label>
            <input
              type="number"
              value={data.qty || ""}
              onChange={(e) => updateField("qty", parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--neuron-ink-base)",
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
              }}
            />
          </div>
        </div>

        {/* Delivery Instructions */}
        <div>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-base)",
            marginBottom: "8px"
          }}>
            Delivery Instructions
          </label>
          <textarea
            value={data.deliveryInstructions || ""}
            onChange={(e) => updateField("deliveryInstructions", e.target.value)}
            placeholder="Enter any special delivery instructions..."
            rows={4}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "13px",
              color: "var(--neuron-ink-base)",
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "6px",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              transition: "border-color 0.15s ease"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
            }}
          />
        </div>
      </div>
    </div>
  );
}
