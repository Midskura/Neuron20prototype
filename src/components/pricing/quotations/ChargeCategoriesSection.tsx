import { DollarSign, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { QuotationChargeCategory, QuotationLineItemNew } from "../../../types/pricing";
import { 
  generateCategoryId, 
  generateLineItemId, 
  updateCategorySubtotal,
  calculateLineAmount 
} from "../../../utils/quotationCalculations";
import { CategoryDropdown } from "./CategoryDropdown";
import { UnifiedLineItemRow } from "./UnifiedLineItemRow";

interface ChargeCategoriesSectionProps {
  chargeCategories: QuotationChargeCategory[];
  setChargeCategories: (categories: QuotationChargeCategory[]) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

export function ChargeCategoriesSection({
  chargeCategories,
  setChargeCategories,
  currency,
  setCurrency
}: ChargeCategoriesSectionProps) {
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddCategory, setShowAddCategory] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = (name: string) => {
    const newCategory: QuotationChargeCategory = {
      id: generateCategoryId(),
      name: name,
      line_items: [],
      subtotal: 0
    };
    setChargeCategories([...chargeCategories, newCategory]);
    setShowAddCategory(false);
    // Auto-expand the new category
    const newExpanded = new Set(expandedCategories);
    newExpanded.add(newCategory.id);
    setExpandedCategories(newExpanded);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category and all its line items?")) {
      setChargeCategories(chargeCategories.filter(c => c.id !== categoryId));
    }
  };

  const handleAddLineItem = (categoryId: string, lineItem: Omit<QuotationLineItemNew, "id" | "amount">) => {
    const amount = lineItem.price * lineItem.quantity * lineItem.forex_rate;
    const newLineItem: QuotationLineItemNew = {
      ...lineItem,
      id: generateLineItemId(),
      amount
    };

    const updatedCategories = chargeCategories.map(cat => {
      if (cat.id === categoryId) {
        const updatedCat = {
          ...cat,
          line_items: [...cat.line_items, newLineItem]
        };
        return updateCategorySubtotal(updatedCat);
      }
      return cat;
    });

    setChargeCategories(updatedCategories);
  };

  const handleUpdateLineItem = (categoryId: string, itemId: string, lineItem: Omit<QuotationLineItemNew, "id" | "amount">) => {
    const amount = lineItem.price * lineItem.quantity * lineItem.forex_rate;
    const updatedLineItem: QuotationLineItemNew = {
      ...lineItem,
      id: itemId,
      amount
    };

    const updatedCategories = chargeCategories.map(cat => {
      if (cat.id === categoryId) {
        const updatedCat = {
          ...cat,
          line_items: (cat.line_items || []).map(item => 
            item.id === itemId ? updatedLineItem : item
          )
        };
        return updateCategorySubtotal(updatedCat);
      }
      return cat;
    });

    setChargeCategories(updatedCategories);
  };

  const handleDeleteLineItem = (categoryId: string, lineItemId: string) => {
    if (confirm("Are you sure you want to delete this line item?")) {
      const updatedCategories = chargeCategories.map(cat => {
        if (cat.id === categoryId) {
          const updatedCat = {
            ...cat,
            line_items: (cat.line_items || []).filter(item => item.id !== lineItemId)
          };
          return updateCategorySubtotal(updatedCat);
        }
        return cat;
      });
      setChargeCategories(updatedCategories);
    }
  };

  const handleAddBlankLineItem = (categoryId: string) => {
    const newLineItem: QuotationLineItemNew = {
      id: generateLineItemId(),
      description: "",
      price: 0,
      charge_currency: currency,
      quantity: 1,
      forex_rate: 1,
      taxed: false,
      remarks: "",
      amount: 0
    };

    const updatedCategories = chargeCategories.map(cat => {
      if (cat.id === categoryId) {
        const updatedCat = {
          ...cat,
          line_items: [...(cat.line_items || []), newLineItem]
        };
        return updateCategorySubtotal(updatedCat);
      }
      return cat;
    });

    setChargeCategories(updatedCategories);
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={16} style={{ color: "var(--neuron-brand-green)" }} />
            <h3 style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neuron-ink-primary)",
              margin: 0
            }}>
              CHARGE CATEGORIES & LINE ITEMS
            </h3>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--neuron-ink-primary)",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="USD">USD</option>
              <option value="PHP">PHP</option>
              <option value="EUR">EUR</option>
              <option value="CNY">CNY</option>
            </select>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "white",
                  backgroundColor: "var(--neuron-brand-green)",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Plus size={14} />
                Add Category
              </button>

              {/* Inline Category Dropdown */}
              {showAddCategory && (
                <CategoryDropdown
                  onAdd={handleAddCategory}
                  onClose={() => setShowAddCategory(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "20px", overflow: "visible" }}>
          {chargeCategories.length === 0 ? (
            <div style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--neuron-ink-muted)",
              fontSize: "13px"
            }}>
              <DollarSign size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ margin: 0 }}>No charge categories yet.</p>
              <p style={{ margin: "4px 0 0 0" }}>Click "Add Category" to start building your quotation.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px", overflow: "visible" }}>
              {chargeCategories.map(category => {
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <div
                    key={category.id}
                    style={{
                      border: "1px solid var(--neuron-ui-border)",
                      borderRadius: "6px",
                      overflow: "visible"
                    }}
                  >
                    {/* Category Header */}
                    <div style={{
                      padding: "12px 16px",
                      backgroundColor: "#F9FAFB",
                      borderBottom: isExpanded ? "1px solid var(--neuron-ui-border)" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                        <button
                          onClick={() => toggleCategory(category.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            color: "var(--neuron-ink-secondary)"
                          }}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        
                        <span style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--neuron-ink-primary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px"
                        }}>
                          {category.name}
                        </span>

                        <span style={{
                          fontSize: "11px",
                          color: "var(--neuron-ink-muted)",
                          marginLeft: "8px"
                        }}>
                          ({category.line_items?.length || 0} {(category.line_items?.length || 0) === 1 ? 'item' : 'items'})
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {isExpanded && (
                          <button
                            onClick={() => handleAddBlankLineItem(category.id)}
                            style={{
                              padding: "4px 10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--neuron-brand-green)",
                              backgroundColor: "transparent",
                              border: "1px solid var(--neuron-brand-green)",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Plus size={12} />
                            Add Item
                          </button>
                        )}

                        <span style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--neuron-brand-green)"
                        }}>
                          {currency} {(category.subtotal || 0).toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          style={{
                            padding: "4px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#DC2626",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Line Items Table - Always show when expanded */}
                    {isExpanded && (
                      <div>
                        <table style={{ 
                          width: "100%", 
                          fontSize: "13px", 
                          borderCollapse: "collapse"
                        }}>
                          <thead>
                            <tr style={{ 
                              backgroundColor: "white",
                              borderBottom: "1px solid #E5E7EB"
                            }}>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "left", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px",
                                letterSpacing: "0.3px"
                              }}>Description</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "right", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "100px",
                                letterSpacing: "0.3px"
                              }}>Price</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "center", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "80px",
                                letterSpacing: "0.3px"
                              }}>Currency</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "right", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "80px",
                                letterSpacing: "0.3px"
                              }}>Qty</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "right", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "80px",
                                letterSpacing: "0.3px"
                              }}>Forex</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "center", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "70px",
                                letterSpacing: "0.3px"
                              }}>Taxed</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "left", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "140px",
                                letterSpacing: "0.3px"
                              }}>Remarks</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "right", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "110px",
                                letterSpacing: "0.3px"
                              }}>Amount</th>
                              <th style={{ 
                                padding: "12px 16px", 
                                textAlign: "center", 
                                fontWeight: 500, 
                                color: "#6B7280", 
                                fontSize: "12px", 
                                width: "60px"
                              }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.line_items?.map(item => (
                              <UnifiedLineItemRow
                                key={item.id}
                                item={item}
                                categoryId={category.id}
                                categoryName={category.name}
                                onUpdate={handleUpdateLineItem}
                                onDelete={handleDeleteLineItem}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}