// Predefined charge items organized by category
export const CHARGE_ITEMS_BY_CATEGORY: Record<string, string[]> = {
  // Freight
  "Freight": [
    "Air Freight",
    "Ocean Freight",
    "Others",
  ],

  // Origin Local Charges
  "Origin Local Charges": [
    "Pick up",
    "Export Clearance",
    "Others",
  ],

  // Destination Local Charges
  "Destination Local Charges": [
    "Breakbulk Fee",
    "Handling",
    "Others",
  ],

  // Reimbursable Charges
  "Reimbursable Charges": [
    "Arrastre",
    "Wharfage",
    "Others",
  ],

  // Brokerage Charges
  "Brokerage Charges": [
    "Documentation",
    "Clearance",
    "Others",
  ],

  // Customs Duty & VAT
  "Customs Duty & VAT": [
    "Others",
  ],
};

// Helper function to get charge items for a category
export function getChargeItemsForCategory(categoryName: string): string[] {
  return CHARGE_ITEMS_BY_CATEGORY[categoryName] || [];
}

// Available charge categories (fixed list)
export const AVAILABLE_CHARGE_CATEGORIES = [
  "Freight",
  "Origin Local Charges",
  "Destination Local Charges",
  "Reimbursable Charges",
  "Brokerage Charges",
  "Customs Duty & VAT",
];
