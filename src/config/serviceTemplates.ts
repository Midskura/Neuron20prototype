import { QuotationChargeCategory, QuotationLineItemNew } from "../types/pricing";
import { calculateQuantity } from "../utils/quantityCalculations";

/**
 * SERVICE CHARGE TEMPLATES
 * 
 * Defines default charge line items that auto-populate when a service is selected.
 * PD only needs to fill in prices and vendors - not manually add each charge.
 */

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Creates a blank line item template
 */
function createLineItem(
  description: string, 
  remarks: string = "PER SHIPMENT",
  cargoDetails?: any
): QuotationLineItemNew {
  const quantity = cargoDetails 
    ? calculateQuantity(remarks, cargoDetails) 
    : 1;

  return {
    id: generateId(),
    description,
    price: 0,
    currency: "USD",
    quantity,
    forex_rate: 1.0,
    is_taxed: false,
    remarks,
    amount: 0
  };
}

/**
 * FORWARDING SERVICE TEMPLATE
 * Includes origin charges, freight, and destination charges
 */
export function getForwardingTemplate(
  movement: "IMPORT" | "EXPORT",
  category: "SEA FREIGHT" | "AIR FREIGHT" | "LAND FREIGHT"
): QuotationChargeCategory[] {
  const categories: QuotationChargeCategory[] = [];

  // FREIGHT CHARGES (main category)
  if (category === "SEA FREIGHT") {
    categories.push({
      id: generateId(),
      name: "SEA FREIGHT",
      line_items: [
        createLineItem("O/F", "PER W/M"),
        createLineItem("CFS", "PER BL"),
        createLineItem("LCL CHARGES", "PER SET"),
        createLineItem("FUEL SURCHARGE", "PER W/M"),
      ],
      subtotal: 0
    });
  } else if (category === "AIR FREIGHT") {
    categories.push({
      id: generateId(),
      name: "AIR FREIGHT",
      line_items: [
        createLineItem("AIR FREIGHT", "PER KG"),
        createLineItem("FUEL SURCHARGE", "PER KG"),
        createLineItem("SECURITY SURCHARGE", "PER AWB"),
      ],
      subtotal: 0
    });
  } else if (category === "LAND FREIGHT") {
    categories.push({
      id: generateId(),
      name: "LAND FREIGHT",
      line_items: [
        createLineItem("LAND FREIGHT", "PER SHIPMENT"),
      ],
      subtotal: 0
    });
  }

  // ORIGIN LOCAL CHARGES
  if (movement === "EXPORT") {
    categories.push({
      id: generateId(),
      name: "ORIGIN LOCAL CHARGES",
      line_items: [
        createLineItem("PICK UP", "PER SHIPMENT"),
        createLineItem("HANDLING", "PER SHIPMENT"),
        createLineItem("DOCUMENTATION", "PER BL"),
        createLineItem("VGM", "PER CONTAINER"),
      ],
      subtotal: 0
    });
  }

  // DESTINATION LOCAL CHARGES
  if (movement === "IMPORT") {
    categories.push({
      id: generateId(),
      name: "DESTINATION LOCAL CHARGES",
      line_items: [
        createLineItem("HANDLING", "PER SHIPMENT"),
        createLineItem("ARRASTRE", "PER W/M"),
        createLineItem("WHARFAGE", "PER W/M"),
        createLineItem("DOCUMENTATION", "PER BL"),
      ],
      subtotal: 0
    });
  }

  return categories;
}

/**
 * BROKERAGE SERVICE TEMPLATE
 * Customs clearance and related charges
 */
export function getBrokerageTemplate(
  movement: "IMPORT" | "EXPORT"
): QuotationChargeCategory[] {
  const categories: QuotationChargeCategory[] = [];

  if (movement === "IMPORT") {
    categories.push({
      id: generateId(),
      name: "BROKERAGE CHARGES",
      line_items: [
        createLineItem("ENTRY PROCESSING", "PER ENTRY"),
        createLineItem("CUSTOMS CLEARANCE", "PER SHIPMENT"),
        createLineItem("BROKERAGE FEE", "PER SHIPMENT"),
        createLineItem("PERMIT FEE", "PER PERMIT"),
      ],
      subtotal: 0
    });

    categories.push({
      id: generateId(),
      name: "REIMBURSABLE CHARGES",
      line_items: [
        createLineItem("BOC E2M", "PER ENTRY"),
        createLineItem("PROCESSING FEE", "PER ENTRY"),
        createLineItem("VAT", "12%"),
        createLineItem("CONTAINER SEAL", "PER CONTAINER"),
      ],
      subtotal: 0
    });
  } else {
    // EXPORT Brokerage
    categories.push({
      id: generateId(),
      name: "BROKERAGE CHARGES",
      line_items: [
        createLineItem("EXPORT CLEARANCE", "PER SHIPMENT"),
        createLineItem("DOCUMENTATION", "PER BL"),
      ],
      subtotal: 0
    });
  }

  return categories;
}

/**
 * TRUCKING SERVICE TEMPLATE
 * Domestic trucking and delivery
 */
export function getTruckingTemplate(): QuotationChargeCategory[] {
  return [
    {
      id: generateId(),
      name: "TRUCKING CHARGES",
      line_items: [
        createLineItem("TRUCKING", "PER TRIP"),
        createLineItem("WAITING TIME", "PER HOUR"),
        createLineItem("HELPER", "PER TRIP"),
      ],
      subtotal: 0
    }
  ];
}

/**
 * MARINE INSURANCE SERVICE TEMPLATE
 */
export function getMarineInsuranceTemplate(): QuotationChargeCategory[] {
  return [
    {
      id: generateId(),
      name: "INSURANCE CHARGES",
      line_items: [
        createLineItem("MARINE INSURANCE PREMIUM", "% OF INVOICE VALUE"),
        createLineItem("DOCUMENTATION", "PER POLICY"),
      ],
      subtotal: 0
    }
  ];
}

/**
 * OTHERS SERVICE TEMPLATE
 * Generic charges for custom services
 */
export function getOthersTemplate(): QuotationChargeCategory[] {
  return [
    {
      id: generateId(),
      name: "OTHER CHARGES",
      line_items: [
        createLineItem("MISCELLANEOUS", "PER SHIPMENT"),
      ],
      subtotal: 0
    }
  ];
}

/**
 * MAIN TEMPLATE GENERATOR
 * Combines templates based on selected services
 */
export function generateChargesFromServices(
  services: string[],
  movement: "IMPORT" | "EXPORT",
  category: "SEA FREIGHT" | "AIR FREIGHT" | "LAND FREIGHT"
): QuotationChargeCategory[] {
  let allCategories: QuotationChargeCategory[] = [];

  // Process each selected service
  services.forEach(service => {
    switch (service) {
      case "FORWARDING":
        allCategories = mergeCategories(allCategories, getForwardingTemplate(movement, category));
        break;
      case "BROKERAGE":
        allCategories = mergeCategories(allCategories, getBrokerageTemplate(movement));
        break;
      case "TRUCKING":
        allCategories = mergeCategories(allCategories, getTruckingTemplate());
        break;
      case "MARINE INSURANCE":
        allCategories = mergeCategories(allCategories, getMarineInsuranceTemplate());
        break;
      case "OTHERS":
        allCategories = mergeCategories(allCategories, getOthersTemplate());
        break;
    }
  });

  return allCategories;
}

/**
 * Merge categories intelligently
 * If a category with the same name exists, merge line items
 * Otherwise, add as new category
 */
function mergeCategories(
  existing: QuotationChargeCategory[],
  newCategories: QuotationChargeCategory[]
): QuotationChargeCategory[] {
  const result = [...existing];

  newCategories.forEach(newCat => {
    const existingCat = result.find(cat => cat.name === newCat.name);
    
    if (existingCat) {
      // Merge line items, avoiding duplicates
      newCat.line_items.forEach(newItem => {
        const duplicate = existingCat.line_items.find(
          item => item.description === newItem.description && item.remarks === newItem.remarks
        );
        if (!duplicate) {
          existingCat.line_items.push(newItem);
        }
      });
    } else {
      // Add new category
      result.push(newCat);
    }
  });

  return result;
}