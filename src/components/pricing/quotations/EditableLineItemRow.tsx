import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { QuotationLineItemNew } from "../../../types/pricing";
import { ChargeItemDropdown } from "./ChargeItemDropdown";

interface EditableLineItemRowProps {
  item: QuotationLineItemNew;
  categoryId: string;
  categoryName: string;
  onUpdate: (categoryId: string, itemId: string, lineItem: Omit<QuotationLineItemNew, "id" | "amount">) => void;
  onDelete: (categoryId: string, lineItemId: string) => void;
}

interface EditableFieldProps {
  value: string | number;
  type?: "text" | "number";
  align?: "left" | "right" | "center";
  step?: string;
  onSave: (value: string | number) => void;
}

function EditableCell({ value, type = "text", align = "left", step, onSave }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (type === "number") {
      onSave(parseFloat(editValue.toString()) || 0);
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        step={step}
        style={{
          width: "100%",
          padding: "8px 10px",
          fontSize: "13px",
          border: "1px solid #D1D5DB",
          borderRadius: "4px",
          backgroundColor: "white",
          textAlign: align,
          outline: "none",
          fontFamily: "inherit",
          color: "var(--neuron-ink-primary)",
          MozAppearance: "textfield"
        }}
        className="no-spinners"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        padding: "8px 10px",
        cursor: "text",
        textAlign: align,
        minHeight: "20px"
      }}
    >
      {type === "number" ? Number(value).toFixed(2) : value}
    </div>
  );
}

interface EditableSelectProps {
  value: string;
  options: string[];
  onSave: (value: string) => void;
}

function EditableSelectCell({ value, options, onSave }: EditableSelectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (newValue: string) => {
    onSave(newValue);
    setIsEditing(false);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        style={{
          width: "100%",
          padding: "8px 10px",
          fontSize: "11px",
          border: "1px solid #D1D5DB",
          borderRadius: "4px",
          backgroundColor: "white",
          outline: "none",
          cursor: "pointer",
          fontFamily: "inherit"
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        padding: "8px 10px",
        cursor: "pointer",
        textAlign: "center",
        fontSize: "11px",
        minHeight: "20px"
      }}
    >
      {value}
    </div>
  );
}

interface EditableCheckboxProps {
  value: boolean;
  onSave: (value: boolean) => void;
}

function EditableCheckboxCell({ value, onSave }: EditableCheckboxProps) {
  return (
    <div
      onClick={() => onSave(!value)}
      style={{
        padding: "8px 10px",
        cursor: "pointer",
        textAlign: "center",
        minHeight: "20px"
      }}
    >
      {value ? "✓" : "—"}
    </div>
  );
}

interface EditableChargeItemProps {
  categoryName: string;
  value: string;
  onSave: (value: string) => void;
}

function EditableChargeItemCell({ categoryName, value, onSave }: EditableChargeItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div onBlur={() => setIsEditing(false)}>
        <ChargeItemDropdown
          categoryName={categoryName}
          value={value}
          onChange={(newValue) => {
            onSave(newValue);
            setIsEditing(false);
          }}
          hasStartedEditing={false}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        padding: "8px 10px",
        cursor: "text",
        textAlign: "left",
        minHeight: "20px"
      }}
    >
      {value}
    </div>
  );
}

export function EditableLineItemRow({ item, categoryId, categoryName, onUpdate, onDelete }: EditableLineItemRowProps) {
  const [localItem, setLocalItem] = useState({
    description: item.description,
    price: item.price,
    currency: item.currency,
    quantity: item.quantity,
    forex_rate: item.forex_rate,
    is_taxed: item.is_taxed,
    remarks: item.remarks
  });

  const handleFieldUpdate = (field: keyof typeof localItem, value: any) => {
    const updated = { ...localItem, [field]: value };
    setLocalItem(updated);
    onUpdate(categoryId, item.id, updated);
  };

  // Calculate amount
  const calculatedAmount = localItem.price * localItem.quantity * localItem.forex_rate;

  return (
    <tr style={{ 
      borderBottom: "1px solid #F3F4F6",
      backgroundColor: "white"
    }}>
      {/* Description */}
      <td style={{ padding: "4px", color: "var(--neuron-ink-primary)", overflow: "visible" }}>
        <EditableChargeItemCell
          categoryName={categoryName}
          value={localItem.description}
          onSave={(value) => handleFieldUpdate("description", value)}
        />
      </td>

      {/* Price */}
      <td style={{ padding: "4px" }}>
        <EditableCell
          value={localItem.price}
          type="number"
          align="right"
          step="0.01"
          onSave={(value) => handleFieldUpdate("price", value)}
        />
      </td>

      {/* Currency */}
      <td style={{ padding: "4px" }}>
        <EditableSelectCell
          value={localItem.currency}
          options={["USD", "PHP", "EUR", "CNY"]}
          onSave={(value) => handleFieldUpdate("currency", value)}
        />
      </td>

      {/* Quantity */}
      <td style={{ padding: "4px" }}>
        <EditableCell
          value={localItem.quantity}
          type="number"
          align="right"
          step="1"
          onSave={(value) => handleFieldUpdate("quantity", value)}
        />
      </td>

      {/* Forex Rate */}
      <td style={{ padding: "4px" }}>
        <EditableCell
          value={localItem.forex_rate}
          type="number"
          align="right"
          step="0.01"
          onSave={(value) => handleFieldUpdate("forex_rate", value)}
        />
      </td>

      {/* Taxed */}
      <td style={{ padding: "4px" }}>
        <EditableCheckboxCell
          value={localItem.is_taxed}
          onSave={(value) => handleFieldUpdate("is_taxed", value)}
        />
      </td>

      {/* Remarks */}
      <td style={{ padding: "4px", color: "var(--neuron-ink-secondary)", fontSize: "11px" }}>
        <EditableCell
          value={localItem.remarks}
          type="text"
          align="left"
          onSave={(value) => handleFieldUpdate("remarks", value)}
        />
      </td>

      {/* Amount (Read-only, calculated) */}
      <td style={{ 
        padding: "10px 12px", 
        textAlign: "right", 
        fontWeight: 600, 
        color: "var(--neuron-brand-green)",
        fontSize: "12px"
      }}>
        {calculatedAmount.toFixed(2)}
      </td>

      {/* Actions */}
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            onClick={() => onDelete(categoryId, item.id)}
            title="Delete"
            style={{
              padding: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#DC2626",
              opacity: 0.6,
              transition: "opacity 0.15s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.6";
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}