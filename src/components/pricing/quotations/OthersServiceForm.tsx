interface OthersFormData {
  serviceDescription?: string;
}

interface OthersServiceFormProps {
  data: OthersFormData;
  onChange: (data: OthersFormData) => void;
}

export function OthersServiceForm({ data, onChange }: OthersServiceFormProps) {
  const updateField = (field: keyof OthersFormData, value: any) => {
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
        Other Services
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Service Description */}
        <div>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-base)",
            marginBottom: "8px"
          }}>
            Service Description *
          </label>
          <textarea
            value={data.serviceDescription || ""}
            onChange={(e) => updateField("serviceDescription", e.target.value)}
            placeholder="Describe the service you need..."
            rows={6}
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
