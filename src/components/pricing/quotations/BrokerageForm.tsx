import { SimpleDropdown } from "../../bd/SimpleDropdown";

interface BrokerageData {
  subType: 'standard' | 'all-inclusive' | 'non-regular';
  typeOfEntry?: string;
  pod?: string;
  mode?: string;
  cargoType?: string;
  commodity?: string;
  deliveryAddress?: string;
  countryOfOrigin?: string;
  preferentialTreatment?: string;
  psic?: string;
  aeo?: string;
  customsValue?: string;
}

interface BrokerageFormProps {
  data?: BrokerageData;
  onChange: (data: BrokerageData) => void;
}

const subTypes = ["Standard", "All Inclusive", "Non-regular"];
const entryTypes = ["Formal Entry", "Informal Entry", "Home Consumption"];
const modes = ["Air", "Ocean", "Land"];
const cargoTypes = ["FCL", "LCL", "Loose"];
const yesNoOptions = ["Yes", "No"];

export function BrokerageForm({ data, onChange }: BrokerageFormProps) {
  const currentData = data || {
    subType: 'standard',
    typeOfEntry: '',
    pod: '',
    mode: '',
    cargoType: '',
    commodity: '',
    deliveryAddress: '',
  };

  const updateField = (field: string, value: string) => {
    onChange({ ...currentData, [field]: value });
  };

  const handleSubTypeChange = (value: string) => {
    const subTypeMap: { [key: string]: 'standard' | 'all-inclusive' | 'non-regular' } = {
      'Standard': 'standard',
      'All Inclusive': 'all-inclusive',
      'Non-regular': 'non-regular',
    };
    onChange({ ...currentData, subType: subTypeMap[value] });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Sub-type Selection */}
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
          Brokerage Type <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <SimpleDropdown
          options={subTypes}
          value={
            currentData.subType === 'standard'
              ? 'Standard'
              : currentData.subType === 'all-inclusive'
              ? 'All Inclusive'
              : 'Non-regular'
          }
          onChange={handleSubTypeChange}
          placeholder="Select brokerage type"
        />
      </div>

      {/* Standard Fields */}
      {currentData.subType === 'standard' && (
        <>
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
                Type of Entry
              </label>
              <SimpleDropdown
                options={entryTypes}
                value={currentData.typeOfEntry || ""}
                onChange={(value) => updateField("typeOfEntry", value)}
                placeholder="Select entry type"
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
        </>
      )}

      {/* All Inclusive Fields */}
      {currentData.subType === 'all-inclusive' && (
        <>
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
                Type of Entry
              </label>
              <SimpleDropdown
                options={entryTypes}
                value={currentData.typeOfEntry || ""}
                onChange={(value) => updateField("typeOfEntry", value)}
                placeholder="Select entry type"
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
                Country of Origin
              </label>
              <input
                type="text"
                value={currentData.countryOfOrigin || ""}
                onChange={(e) => updateField("countryOfOrigin", e.target.value)}
                placeholder="Enter country"
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
                Preferential Treatment
              </label>
              <SimpleDropdown
                options={yesNoOptions}
                value={currentData.preferentialTreatment || ""}
                onChange={(value) => updateField("preferentialTreatment", value)}
                placeholder="Select option"
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
                PSIC
              </label>
              <input
                type="text"
                value={currentData.psic || ""}
                onChange={(e) => updateField("psic", e.target.value)}
                placeholder="Enter PSIC"
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
                AEO
              </label>
              <SimpleDropdown
                options={yesNoOptions}
                value={currentData.aeo || ""}
                onChange={(value) => updateField("aeo", value)}
                placeholder="Select option"
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
                Customs Value
              </label>
              <input
                type="text"
                value={currentData.customsValue || ""}
                onChange={(e) => updateField("customsValue", e.target.value)}
                placeholder="Enter value"
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
        </>
      )}

      {/* Non-regular Fields */}
      {currentData.subType === 'non-regular' && (
        <>
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
                Mode
              </label>
              <SimpleDropdown
                options={modes}
                value={currentData.mode || ""}
                onChange={(value) => updateField("mode", value)}
                placeholder="Select mode"
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
        </>
      )}
    </div>
  );
}