interface MarineInsuranceData {
  commodity?: string;
  hsCode?: string;
  aol?: string;
  pol?: string;
  aod?: string;
  pod?: string;
  invoiceValue?: string;
}

interface MarineInsuranceFormProps {
  data?: MarineInsuranceData;
  onChange: (data: MarineInsuranceData) => void;
}

export function MarineInsuranceForm({ data, onChange }: MarineInsuranceFormProps) {
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
            Commodity
          </label>
          <input
            type="text"
            value={currentData.commodity || ""}
            onChange={(e) => updateField("commodity", e.target.value)}
            placeholder="Enter commodity"
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
            HS Code
          </label>
          <input
            type="text"
            value={currentData.hsCode || ""}
            onChange={(e) => updateField("hsCode", e.target.value)}
            placeholder="Enter HS code"
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
            AOL
          </label>
          <input
            type="text"
            value={currentData.aol || ""}
            onChange={(e) => updateField("aol", e.target.value)}
            placeholder="Airport of Loading"
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
            AOD
          </label>
          <input
            type="text"
            value={currentData.aod || ""}
            onChange={(e) => updateField("aod", e.target.value)}
            placeholder="Airport of Discharge"
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
          Invoice Value
        </label>
        <input
          type="text"
          value={currentData.invoiceValue || ""}
          onChange={(e) => updateField("invoiceValue", e.target.value)}
          placeholder="e.g., USD 10,000.00"
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
  );
}
