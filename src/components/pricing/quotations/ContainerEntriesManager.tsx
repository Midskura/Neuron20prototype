import { Plus, Trash2 } from "lucide-react";
import { FormSelect } from "./FormSelect";

interface ContainerEntry {
  id: string;
  type: "20ft" | "40ft" | "45ft" | "";
  qty: number;
}

interface ContainerEntriesManagerProps {
  containers: ContainerEntry[];
  onChange: (containers: ContainerEntry[]) => void;
}

export function ContainerEntriesManager({ containers, onChange }: ContainerEntriesManagerProps) {
  const addContainer = () => {
    const newContainer: ContainerEntry = {
      id: `container-${Date.now()}`,
      type: "",
      qty: 0
    };
    onChange([...containers, newContainer]);
  };

  const updateContainer = (id: string, field: keyof ContainerEntry, value: any) => {
    onChange(
      containers.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const removeContainer = (id: string) => {
    onChange(containers.filter(c => c.id !== id));
  };

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
      }}>
        <label style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--neuron-ink-base)"
        }}>
          Container Types & Quantities
        </label>
        <button
          type="button"
          onClick={addContainer}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--neuron-brand-teal)",
            backgroundColor: "#F0FDF9",
            border: "1px solid var(--neuron-brand-teal)",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Plus size={14} />
          Add Container
        </button>
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        {containers.length === 0 ? (
          <div style={{
            padding: "24px",
            backgroundColor: "#F8FBFB",
            border: "1px dashed var(--neuron-ui-border)",
            borderRadius: "6px",
            textAlign: "center",
            color: "var(--neuron-ink-muted)",
            fontSize: "13px"
          }}>
            No containers added. Click "Add Container" to get started.
          </div>
        ) : (
          containers.map((container) => (
            <div
              key={container.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 40px",
                gap: "12px",
                padding: "12px",
                backgroundColor: "#F8FBFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                alignItems: "center"
              }}
            >
              {/* Container Type */}
              <div>
                <FormSelect
                  value={container.type}
                  onChange={(value) => updateContainer(container.id, "type", value as "20ft" | "40ft" | "45ft" | "")}
                  options={[
                    { value: "20ft", label: "20ft Container" },
                    { value: "40ft", label: "40ft Container" },
                    { value: "45ft", label: "45ft Container" }
                  ]}
                  placeholder="Select container type..."
                />
              </div>

              {/* Quantity */}
              <div>
                <input
                  type="number"
                  value={container.qty || ""}
                  onChange={(e) => updateContainer(container.id, "qty", parseInt(e.target.value) || 0)}
                  placeholder="QTY"
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

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeContainer(container.id)}
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  border: "1px solid #FCA5A5",
                  borderRadius: "6px",
                  color: "#DC2626",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEE2E2";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
