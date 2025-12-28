import { Calculator, DollarSign } from "lucide-react";
import type { FinancialSummary } from "../../../types/pricing";

interface FinancialSummaryPanelProps {
  financialSummary: FinancialSummary;
  currency: string;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  otherCharges: number;
  setOtherCharges: (amount: number) => void;
}

export function FinancialSummaryPanel({
  financialSummary,
  currency,
  taxRate,
  setTaxRate,
  otherCharges,
  setOtherCharges
}: FinancialSummaryPanelProps) {
  
  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  return (
    <div style={{
      border: "1px solid var(--neuron-ui-border)",
      borderRadius: "8px",
      backgroundColor: "white",
      overflow: "hidden",
      marginBottom: "24px"
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        backgroundColor: "#F8FBFB"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Calculator size={16} style={{ color: "var(--neuron-brand-green)" }} />
          <h3 style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            margin: 0
          }}>
            FINANCIAL SUMMARY
          </h3>
        </div>
      </div>

      {/* Summary Content */}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "grid", gap: "12px" }}>
          
          {/* Non-Taxed Subtotal */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            backgroundColor: "#F9FAFB",
            borderRadius: "6px"
          }}>
            <span style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--neuron-ink-secondary)"
            }}>
              Subtotal (Non-Taxed)
            </span>
            <span style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neuron-ink-primary)"
            }}>
              {currency} {formatAmount(financialSummary.subtotal_non_taxed)}
            </span>
          </div>

          {/* Taxed Subtotal */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            backgroundColor: "#F9FAFB",
            borderRadius: "6px"
          }}>
            <span style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--neuron-ink-secondary)"
            }}>
              Subtotal (Taxable)
            </span>
            <span style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neuron-ink-primary)"
            }}>
              {currency} {formatAmount(financialSummary.subtotal_taxed)}
            </span>
          </div>

          {/* Tax Rate Control */}
          <div style={{
            padding: "12px",
            backgroundColor: "#FEF3C7",
            border: "1px solid #F59E0B",
            borderRadius: "6px"
          }}>
            <label style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#92400E",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Tax Rate (%)
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="number"
                value={taxRate * 100}
                onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                step="0.01"
                min="0"
                max="100"
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "1px solid #F59E0B",
                  borderRadius: "4px",
                  backgroundColor: "white"
                }}
              />
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#92400E"
              }}>
                %
              </span>
            </div>
            <div style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#92400E"
            }}>
              Tax Amount: {currency} {formatAmount(financialSummary.tax_amount)}
            </div>
          </div>

          {/* Other Charges */}
          <div style={{
            padding: "12px",
            backgroundColor: "#F9FAFB",
            borderRadius: "6px"
          }}>
            <label style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--neuron-ink-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Other Charges
            </label>
            <input
              type="number"
              value={otherCharges || ""}
              onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              style={{
                width: "100%",
                padding: "6px 10px",
                fontSize: "14px",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "4px",
                backgroundColor: "white"
              }}
            />
          </div>

          {/* Divider */}
          <div style={{
            height: "2px",
            backgroundColor: "var(--neuron-ui-border)",
            margin: "8px 0"
          }} />

          {/* Grand Total */}
          <div style={{
            padding: "16px",
            backgroundColor: "#E8F5F3",
            border: "2px solid var(--neuron-brand-green)",
            borderRadius: "6px"
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--neuron-ink-secondary)",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              GRAND TOTAL
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--neuron-brand-green)",
              lineHeight: 1
            }}>
              {currency} {formatAmount(financialSummary.grand_total)}
            </div>
          </div>

          {/* Breakdown Info */}
          <div style={{
            padding: "12px",
            backgroundColor: "#F9FAFB",
            borderRadius: "6px",
            fontSize: "11px",
            color: "var(--neuron-ink-muted)"
          }}>
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Non-Taxed:</span>
                <span>{formatAmount(financialSummary.subtotal_non_taxed)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Taxable:</span>
                <span>{formatAmount(financialSummary.subtotal_taxed)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span>{formatAmount(financialSummary.tax_amount)}</span>
              </div>
              {otherCharges > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Other:</span>
                  <span>{formatAmount(otherCharges)}</span>
                </div>
              )}
              <div style={{
                height: "1px",
                backgroundColor: "var(--neuron-ui-border)",
                margin: "4px 0"
              }} />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 600,
                color: "var(--neuron-ink-primary)"
              }}>
                <span>Total:</span>
                <span>{formatAmount(financialSummary.grand_total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Info Footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--neuron-ui-border)",
        backgroundColor: "#FFFBEB",
        fontSize: "11px",
        color: "#92400E",
        lineHeight: 1.5
      }}>
        <strong>Note:</strong> Mark line items as "Taxed" to include them in tax calculation. 
        Tax rate can be adjusted above.
      </div>
    </div>
  );
}