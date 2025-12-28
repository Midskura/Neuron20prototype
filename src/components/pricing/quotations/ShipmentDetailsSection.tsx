import { Ship } from "lucide-react";
import { SimpleDropdown } from "../../bd/SimpleDropdown";

interface ShipmentDetailsSectionProps {
  movement: "IMPORT" | "EXPORT";
  setMovement: (value: "IMPORT" | "EXPORT") => void;
  category: "SEA FREIGHT" | "AIR FREIGHT" | "LAND FREIGHT";
  setCategory: (value: "SEA FREIGHT" | "AIR FREIGHT" | "LAND FREIGHT") => void;
  shipmentFreight: "LCL" | "FCL" | "CONSOLIDATION" | "BREAK BULK";
  setShipmentFreight: (value: "LCL" | "FCL" | "CONSOLIDATION" | "BREAK BULK") => void;
  services: string[];
  setServices: (value: string[]) => void;
  incoterm: string;
  setIncoterm: (value: string) => void;
  carrier: string;
  setCarrier: (value: string) => void;
  transitDays: number;
  setTransitDays: (value: number) => void;
  collectionAddress: string;
  setCollectionAddress: (value: string) => void;
}

export function ShipmentDetailsSection({
  movement,
  setMovement,
  category,
  setCategory,
  shipmentFreight,
  setShipmentFreight,
  services,
  setServices,
  incoterm,
  setIncoterm,
  carrier,
  setCarrier,
  transitDays,
  setTransitDays,
  collectionAddress,
  setCollectionAddress
}: ShipmentDetailsSectionProps) {
  
  const serviceOptions = ["FORWARDING", "BROKERAGE", "TRUCKING", "MARINE INSURANCE", "OTHERS"];
  
  const toggleService = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter(s => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  return (
    <section style={{ marginBottom: "32px" }}>
      <div style={{
        border: "1px solid var(--neuron-ui-border)",
        borderLeft: "3px solid var(--neuron-brand-green)",
        borderRadius: "8px",
        backgroundColor: "white",
        overflow: "visible"
      }}>
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--neuron-ui-border)",
          backgroundColor: "#F8FBFB",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Ship size={16} style={{ color: "var(--neuron-brand-green)" }} />
            <h3 style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neuron-ink-primary)",
              margin: 0
            }}>
              SHIPMENT DETAILS
            </h3>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          <div style={{ display: "grid", gap: "16px" }}>
            
            {/* Movement & Category */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Movement *
                </label>
                <SimpleDropdown
                  value={movement}
                  onChange={(value) => setMovement(value as "IMPORT" | "EXPORT")}
                  options={["IMPORT", "EXPORT"]}
                  placeholder="Select movement"
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Category *
                </label>
                <SimpleDropdown
                  value={category}
                  onChange={(value) => setCategory(value as "SEA FREIGHT" | "AIR FREIGHT" | "LAND FREIGHT")}
                  options={["SEA FREIGHT", "AIR FREIGHT", "LAND FREIGHT"]}
                  placeholder="Select category"
                />
              </div>
            </div>

            {/* Shipment Freight & Incoterm */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Shipment Freight *
                </label>
                <SimpleDropdown
                  value={shipmentFreight}
                  onChange={(value) => setShipmentFreight(value as any)}
                  options={["LCL", "FCL", "CONSOLIDATION", "BREAK BULK"]}
                  placeholder="Select type"
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Incoterm
                </label>
                <SimpleDropdown
                  value={incoterm}
                  onChange={setIncoterm}
                  options={["EXW", "FOB", "CIF", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP"]}
                  placeholder="Select incoterm"
                />
              </div>
            </div>

            {/* Services (Multi-select) */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--neuron-ink-primary)"
              }}>
                Services
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {serviceOptions.map(service => {
                  const isSelected = services.includes(service);
                  return (
                    <button
                      key={service}
                      onClick={() => toggleService(service)}
                      type="button"
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? "white" : "var(--neuron-ink-secondary)",
                        backgroundColor: isSelected ? "#0F766E" : "white",
                        border: isSelected ? "2px solid #0F766E" : "1px solid var(--neuron-ui-border)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#0F766E";
                          e.currentTarget.style.backgroundColor = "#F0FDFA";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                          e.currentTarget.style.backgroundColor = "white";
                        }
                      }}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
              {services.length > 0 && (
                <div style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)"
                }}>
                  Selected: {services.join(", ")}
                </div>
              )}
            </div>

            {/* Carrier & Transit Days */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: "12px" }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Carrier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., Maersk Line, TBA"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "14px",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    backgroundColor: "white"
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Transit Days
                </label>
                <input
                  type="number"
                  value={transitDays || ""}
                  onChange={(e) => setTransitDays(Number(e.target.value))}
                  placeholder="7"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "14px",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    backgroundColor: "white"
                  }}
                />
              </div>
            </div>

            {/* Collection Address */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--neuron-ink-primary)"
              }}>
                Collection Address
              </label>
              <textarea
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
                placeholder="Full pickup/collection address"
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  resize: "vertical"
                }}
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}