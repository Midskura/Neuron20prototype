import { Package } from "lucide-react";

interface CargoDetailsSectionProps {
  commodity: string;
  setCommodity: (value: string) => void;
  volume: string;
  setVolume: (value: string) => void;
  grossWeight: number;
  setGrossWeight: (value: number) => void;
  chargeableWeight: number;
  setChargeableWeight: (value: number) => void;
  dimensions: string;
  setDimensions: (value: string) => void;
  polAol: string;
  setPolAol: (value: string) => void;
  podAod: string;
  setPodAod: (value: string) => void;
}

export function CargoDetailsSection({
  commodity,
  setCommodity,
  volume,
  setVolume,
  grossWeight,
  setGrossWeight,
  chargeableWeight,
  setChargeableWeight,
  dimensions,
  setDimensions,
  polAol,
  setPolAol,
  podAod,
  setPodAod
}: CargoDetailsSectionProps) {
  
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
            <Package size={16} style={{ color: "var(--neuron-brand-green)" }} />
            <h3 style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neuron-ink-primary)",
              margin: 0
            }}>
              CARGO DETAILS
            </h3>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          <div style={{ display: "grid", gap: "16px" }}>
            
            {/* Commodity */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--neuron-ink-primary)"
              }}>
                Commodity *
              </label>
              <input
                type="text"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="e.g., Pharmaceutical Products, Electronics, Garments"
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

            {/* POL/AOL & POD/AOD */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  POL / AOL *
                </label>
                <input
                  type="text"
                  value={polAol}
                  onChange={(e) => setPolAol(e.target.value)}
                  placeholder="e.g., Shanghai, China"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "14px",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    backgroundColor: "white"
                  }}
                />
                <span style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)"
                }}>
                  Port/Airport of Loading
                </span>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  POD / AOD *
                </label>
                <input
                  type="text"
                  value={podAod}
                  onChange={(e) => setPodAod(e.target.value)}
                  placeholder="e.g., Manila, Philippines"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "14px",
                    border: "1px solid var(--neuron-ui-border)",
                    borderRadius: "6px",
                    backgroundColor: "white"
                  }}
                />
                <span style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)"
                }}>
                  Port/Airport of Discharge
                </span>
              </div>
            </div>

            {/* Volume & Dimensions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Volume
                </label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="e.g., 10 CBM"
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
                  Dimensions (DIMS)
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g., 120x80x100 cm"
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

            {/* Gross Weight & Chargeable Weight */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Gross Weight (GWT)
                </label>
                <input
                  type="number"
                  value={grossWeight || ""}
                  onChange={(e) => setGrossWeight(Number(e.target.value))}
                  placeholder="0.00"
                  step="0.01"
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
                <span style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)"
                }}>
                  in KG
                </span>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--neuron-ink-primary)"
                }}>
                  Chargeable Weight (CWT)
                </label>
                <input
                  type="number"
                  value={chargeableWeight || ""}
                  onChange={(e) => setChargeableWeight(Number(e.target.value))}
                  placeholder="0.00"
                  step="0.01"
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
                <span style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "var(--neuron-ink-muted)"
                }}>
                  in KG
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}