interface OthersData {
  serviceDescription?: string;
}

interface OthersFormProps {
  data?: OthersData;
  onChange: (data: OthersData) => void;
}

export function OthersForm({ data, onChange }: OthersFormProps) {
  const currentData = data || {};

  const updateField = (field: string, value: string) => {
    onChange({ ...currentData, [field]: value });
  };

  return (
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
        Service Description
      </label>
      <textarea
        value={currentData.serviceDescription || ""}
        onChange={(e) => updateField("serviceDescription", e.target.value)}
        placeholder="Describe the additional services required..."
        rows={4}
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
  );
}
