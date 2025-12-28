import { useState } from "react";
import type { QuotationLineItemNew } from "../../../types/pricing";
import { ChargeItemDropdown } from "./ChargeItemDropdown";

interface NewLineItemRowProps {
  categoryId: string;
  categoryName: string;
  defaultCurrency: string;
  onAdd: (categoryId: string, lineItem: Omit<QuotationLineItemNew, "id" | "amount">) => void;
}

export function NewLineItemRow({ categoryId, categoryName, defaultCurrency, onAdd }: NewLineItemRowProps) {
  const [newItem, setNewItem] = useState({
    description: "",
    price: 0,
    currency: defaultCurrency,
    quantity: 1,
    forex_rate: 1.0,
    is_taxed: false,
    remarks: ""
  });

  const [hasStartedEditing, setHasStartedEditing] = useState(false);

  const handleFieldChange = (field: keyof typeof newItem, value: any) => {
    if (!hasStartedEditing && (field === "description" || field === "price")) {
      setHasStartedEditing(true);
    }
    setNewItem({ ...newItem, [field]: value });
  };

  const handleSave = () => {
    if (newItem.description.trim()) {
      onAdd(categoryId, newItem);
      // Reset the form
      setNewItem({
        description: "",
        price: 0,
        currency: defaultCurrency,
        quantity: 1,
        forex_rate: 1.0,
        is_taxed: false,
        remarks: ""
      });
      setHasStartedEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newItem.description.trim()) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewItem({
        description: "",
        price: 0,
        currency: defaultCurrency,
        quantity: 1,
        forex_rate: 1.0,
        is_taxed: false,
        remarks: ""
      });
      setHasStartedEditing(false);
    }
  };

  const calculatedAmount = newItem.price * newItem.quantity * newItem.forex_rate;

  return (
    <tr style={{ 
      borderBottom: "1px solid #F3F4F6",
      backgroundColor: hasStartedEditing ? "#FFFBEB" : "white"
    }}>
      {/* Description */}
      <td style={{ padding: "4px", overflow: "visible" }}>
        <ChargeItemDropdown
          categoryName={categoryName}
          value={newItem.description}
          onChange={(value) => handleFieldChange("description", value)}
          onKeyDown={handleKeyDown}
          hasStartedEditing={hasStartedEditing}
          inputId={`new-item-${categoryId}`}
        />
      </td>

      {/* Price */}
      <td style={{ padding: "4px" }}>
        <input
          type="number"
          value={newItem.price}
          onChange={(e) => handleFieldChange("price", parseFloat(e.target.value) || 0)}
          onKeyDown={handleKeyDown}
          step="0.01"
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "13px",
            border: hasStartedEditing ? "1px solid #F59E0B" : "1px solid #E5E7EB",
            borderRadius: "4px",
            backgroundColor: "white",
            textAlign: "right",
            outline: "none",
            fontFamily: "inherit",
            color: "var(--neuron-ink-primary)",
            MozAppearance: "textfield"
          }}
          className="no-spinners"
        />
      </td>

      {/* Currency */}
      <td style={{ padding: "4px" }}>
        <select
          value={newItem.currency}
          onChange={(e) => handleFieldChange("currency", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "11px",
            border: hasStartedEditing ? "1px solid #F59E0B" : "1px solid #E5E7EB",
            borderRadius: "4px",
            backgroundColor: "white",
            outline: "none",
            cursor: "pointer",
            fontFamily: "inherit"
          }}
        >
          <option value="USD">USD</option>
          <option value="PHP">PHP</option>
          <option value="EUR">EUR</option>
          <option value="CNY">CNY</option>
        </select>
      </td>

      {/* Quantity */}
      <td style={{ padding: "4px" }}>
        <input
          type="number"
          value={newItem.quantity}
          onChange={(e) => handleFieldChange("quantity", parseFloat(e.target.value) || 0)}
          onKeyDown={handleKeyDown}
          step="1"
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "13px",
            border: hasStartedEditing ? "1px solid #F59E0B" : "1px solid #E5E7EB",
            borderRadius: "4px",
            backgroundColor: "white",
            textAlign: "right",
            outline: "none",
            fontFamily: "inherit",
            color: "var(--neuron-ink-primary)",
            MozAppearance: "textfield"
          }}
          className="no-spinners"
        />
      </td>

      {/* Forex Rate */}
      <td style={{ padding: "4px" }}>
        <input
          type="number"
          value={newItem.forex_rate}
          onChange={(e) => handleFieldChange("forex_rate", parseFloat(e.target.value) || 0)}
          onKeyDown={handleKeyDown}
          step="0.01"
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "13px",
            border: hasStartedEditing ? "1px solid #F59E0B" : "1px solid #E5E7EB",
            borderRadius: "4px",
            backgroundColor: "white",
            textAlign: "right",
            outline: "none",
            fontFamily: "inherit",
            color: "var(--neuron-ink-primary)",
            MozAppearance: "textfield"
          }}
          className="no-spinners"
        />
      </td>

      {/* Taxed */}
      <td style={{ padding: "4px" }}>
        <div
          onClick={() => handleFieldChange("is_taxed", !newItem.is_taxed)}
          style={{
            padding: "8px 10px",
            cursor: "pointer",
            textAlign: "center",
            minHeight: "20px",
            border: hasStartedEditing ? "1px solid #F59E0B" : "1px solid #E5E7EB",
            borderRadius: "4px",
            backgroundColor: "white"
          }}
        >
          {newItem.is_taxed ? "✓" : "—"}
        </div>
      </td>

      {/* Remarks */}
      <td style={{ padding: "4px" }}>
        <input
          type="text"
          value={newItem.remarks}
          onChange={(e) => handleFieldChange("remarks", e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Remarks..."
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "11px",
            border: hasStartedEditing ? "1px solid #F59E0B" : "1px solid #E5E7EB",
            borderRadius: "4px",
            backgroundColor: "white",
            outline: "none",
            fontFamily: "inherit",
            color: "var(--neuron-ink-secondary)"
          }}
        />
      </td>

      {/* Amount (Calculated) */}
      <td style={{ 
        padding: "10px 12px", 
        textAlign: "right", 
        fontWeight: 600, 
        color: hasStartedEditing ? "#92400E" : "var(--neuron-ink-muted)",
        fontSize: "12px"
      }}>
        {calculatedAmount.toFixed(2)}
      </td>

      {/* Actions - Empty cell for alignment */}
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
      </td>
    </tr>
  );
}