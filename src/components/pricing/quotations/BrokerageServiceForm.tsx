import { FormSelect } from "./FormSelect";
import { FormCheckbox } from "./FormCheckbox";
import { ContainerEntriesManager } from "./ContainerEntriesManager";
import { useState } from "react";

interface ContainerEntry {
  id: string;
  type: "20ft" | "40ft" | "45ft" | "";
  qty: number;
}

interface BrokerageFormData {
  brokerageType: "Standard" | "All-Inclusive" | "Non-Regular" | "";
  
  // Standard & Non-Regular
  typeOfEntry?: string;
  consumption?: boolean;
  warehousing?: boolean;
  peza?: boolean;
  
  // Common fields
  pod?: string;
  mode?: string;
  cargoType?: string;
  commodityDescription?: string;
  deliveryAddress?: string;
  
  // FCL fields - NEW: Using containers array
  containers?: ContainerEntry[];
  // Legacy fields for backward compatibility
  fclContainerType?: "20ft" | "40ft" | "45ft" | "";
  fclQty?: number;
  
  // LCL fields
  lclGwt?: string;
  lclDims?: string;
  
  // AIR fields
  airGwt?: string;
  airCwt?: string;
  
  // All-Inclusive specific
  countryOfOrigin?: string;
  preferentialTreatment?: string;
}

interface BrokerageServiceFormProps {
  data: BrokerageFormData;
  onChange: (data: BrokerageFormData) => void;
}

export function BrokerageServiceForm({ data, onChange }: BrokerageServiceFormProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const updateField = (field: keyof BrokerageFormData, value: any) => {
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
        Brokerage Service
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Brokerage Type Selection */}
        <div>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-base)",
            marginBottom: "8px"
          }}>
            Brokerage Type *
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["Standard", "All-Inclusive", "Non-Regular"].map(type => {
              const isSelected = data.brokerageType === type;
              const isHovered = hoveredType === type;
              
              // Compute styles based on state
              let backgroundColor = "white";
              let borderColor = "var(--neuron-ui-border)";
              let textColor = "var(--neuron-ink-base)";
              
              if (isSelected) {
                backgroundColor = "#0F766E";
                borderColor = "#0F766E";
                textColor = "white";
              } else if (isHovered) {
                backgroundColor = "#F8FBFB";
                borderColor = "#0F766E";
              }
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("brokerageType", type)}
                  onMouseEnter={() => setHoveredType(type)}
                  onMouseLeave={() => setHoveredType(null)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: textColor,
                    backgroundColor: backgroundColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Standard Brokerage Fields */}
        {data.brokerageType === "Standard" && (
          <>
            {/* Type of Entry */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Type of Entry
              </label>
              <div style={{ display: "flex", gap: "16px" }}>
                <FormCheckbox
                  checked={data.consumption || false}
                  onChange={(checked) => updateField("consumption", checked)}
                  label="Consumption"
                />
                <FormCheckbox
                  checked={data.warehousing || false}
                  onChange={(checked) => updateField("warehousing", checked)}
                  label="Warehousing"
                />
                <FormCheckbox
                  checked={data.peza || false}
                  onChange={(checked) => updateField("peza", checked)}
                  label="PEZA"
                />
              </div>
            </div>

            {/* POD */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                POD
              </label>
              <FormSelect
                value={data.pod || ""}
                onChange={(value) => updateField("pod", value)}
                options={[
                  { value: "NAIA", label: "NAIA" },
                  { value: "MICP", label: "MICP" },
                  { value: "POM", label: "POM" }
                ]}
                placeholder="Select POD..."
              />
            </div>

            {/* Mode */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Mode
              </label>
              <FormSelect
                value={data.mode || ""}
                onChange={(value) => updateField("mode", value)}
                options={[
                  { value: "FCL", label: "FCL" },
                  { value: "LCL", label: "LCL" },
                  { value: "AIR", label: "AIR" },
                  { value: "Multi-modal", label: "Multi-modal" }
                ]}
                placeholder="Select Mode..."
              />
            </div>

            {/* Cargo Type */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Cargo Type
              </label>
              <FormSelect
                value={data.cargoType || ""}
                onChange={(value) => updateField("cargoType", value)}
                options={[
                  { value: "Dry", label: "Dry" },
                  { value: "Reefer", label: "Reefer" },
                  { value: "Breakbulk", label: "Breakbulk" },
                  { value: "RORO", label: "RORO" }
                ]}
                placeholder="Select Cargo Type..."
              />
            </div>

            {/* Commodity Description & Delivery Address */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  Commodity Description
                </label>
                <input
                  type="text"
                  value={data.commodityDescription || ""}
                  onChange={(e) => updateField("commodityDescription", e.target.value)}
                  placeholder="Enter commodity description"
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
                  Delivery Address
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
          </>
        )}

        {/* All-Inclusive Brokerage Fields */}
        {data.brokerageType === "All-Inclusive" && (
          <>
            {/* Commodity Description & Country of Origin */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  Commodity Description
                </label>
                <input
                  type="text"
                  value={data.commodityDescription || ""}
                  onChange={(e) => updateField("commodityDescription", e.target.value)}
                  placeholder="Enter commodity description"
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
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={data.countryOfOrigin || ""}
                  onChange={(e) => updateField("countryOfOrigin", e.target.value)}
                  placeholder="Enter country of origin"
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

            {/* Preferential Treatment */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Preferential Treatment
              </label>
              <FormSelect
                value={data.preferentialTreatment || ""}
                onChange={(value) => updateField("preferentialTreatment", value)}
                options={[
                  { value: "Form E", label: "Form E" },
                  { value: "Form D", label: "Form D" },
                  { value: "Form AI", label: "Form AI" },
                  { value: "Form AK", label: "Form AK" },
                  { value: "Form JP", label: "Form JP" }
                ]}
                placeholder="Select preferential treatment..."
              />
            </div>

            {/* POD, Cargo Type, Delivery Address */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-base)",
                  marginBottom: "8px"
                }}>
                  POD
                </label>
                <FormSelect
                  value={data.pod || ""}
                  onChange={(value) => updateField("pod", value)}
                  options={[
                    { value: "NAIA", label: "NAIA" },
                    { value: "MICP", label: "MICP" },
                    { value: "POM", label: "POM" }
                  ]}
                  placeholder="Select POD..."
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
                  Cargo Type
                </label>
                <FormSelect
                  value={data.cargoType || ""}
                  onChange={(value) => updateField("cargoType", value)}
                  options={[
                    { value: "Dry", label: "Dry" },
                    { value: "Reefer", label: "Reefer" },
                    { value: "Breakbulk", label: "Breakbulk" },
                    { value: "RORO", label: "RORO" }
                  ]}
                  placeholder="Select..."
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
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={data.deliveryAddress || ""}
                  onChange={(e) => updateField("deliveryAddress", e.target.value)}
                  placeholder="Enter address"
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

            {/* Mode */}
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--neuron-ink-base)",
                marginBottom: "8px"
              }}>
                Mode
              </label>
              <FormSelect
                value={data.mode || ""}
                onChange={(value) => updateField("mode", value)}
                options={[
                  { value: "FCL", label: "FCL" },
                  { value: "LCL", label: "LCL" },
                  { value: "AIR", label: "AIR" },
                  { value: "Multi-modal", label: "Multi-modal" }
                ]}
                placeholder="Select Mode..."
              />
            </div>

            {/* Conditional Mode Fields */}
            {data.mode === "FCL" && (
              <div style={{
                padding: "16px",
                backgroundColor: "#F8FBFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px"
              }}>
                <ContainerEntriesManager
                  containers={data.containers || []}
                  onChange={(containers) => updateField("containers", containers)}
                />
              </div>
            )}

            {data.mode === "LCL" && (
              <div style={{
                padding: "16px",
                backgroundColor: "#F8FBFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--neuron-ink-base)",
                      marginBottom: "6px"
                    }}>
                      GWT
                    </label>
                    <input
                      type="text"
                      value={data.lclGwt || ""}
                      onChange={(e) => updateField("lclGwt", e.target.value)}
                      placeholder="Enter GWT"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
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
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--neuron-ink-base)",
                      marginBottom: "6px"
                    }}>
                      DIMS
                    </label>
                    <input
                      type="text"
                      value={data.lclDims || ""}
                      onChange={(e) => updateField("lclDims", e.target.value)}
                      placeholder="Enter dimensions"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
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
              </div>
            )}

            {data.mode === "AIR" && (
              <div style={{
                padding: "16px",
                backgroundColor: "#F8FBFB",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--neuron-ink-base)",
                      marginBottom: "6px"
                    }}>
                      GWT
                    </label>
                    <input
                      type="text"
                      value={data.airGwt || ""}
                      onChange={(e) => updateField("airGwt", e.target.value)}
                      placeholder="Enter GWT"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
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
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--neuron-ink-base)",
                      marginBottom: "6px"
                    }}>
                      CWT
                    </label>
                    <input
                      type="text"
                      value={data.airCwt || ""}
                      onChange={(e) => updateField("airCwt", e.target.value)}
                      placeholder="Enter CWT"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
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
              </div>
            )}
          </>
        )}

        {/* Non-Regular Brokerage Fields */}
        {data.brokerageType === "Non-Regular" && (
          <>
            <div style={{ 
              padding: "20px",
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#92400E"
            }}>
              <strong>Note:</strong> Non-Regular brokerage requires manual quotation. Please contact the operations team for pricing.
            </div>
          </>
        )}
      </div>
    </div>
  );
}