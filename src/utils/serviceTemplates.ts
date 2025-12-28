import type { InquiryService, QuotationChargeCategory, QuotationLineItemNew } from "../types/pricing";

/**
 * Service Template Engine
 * Converts inquiry services into auto-generated charge categories with line items
 * PD only needs to fill in prices and vendors
 */

// Generate unique IDs
const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Brokerage Service Templates
 */
function generateBrokerageCharges(service: InquiryService): QuotationChargeCategory[] {
  const details = service.service_details as any;
  const subtype = details.subtype || "Import Ocean";
  const shipmentType = details.shipment_type || "FCL";
  
  const categories: QuotationChargeCategory[] = [];
  
  // BROKERAGE CHARGES
  const brokerageItems: QuotationLineItemNew[] = [
    {
      id: generateId(),
      description: "Customs Brokerage Fee",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Entry",
      amount: 0
    },
    {
      id: generateId(),
      description: "Entry Processing",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Entry",
      amount: 0
    },
    {
      id: generateId(),
      description: "Documentation Fee",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Entry",
      amount: 0
    }
  ];
  
  // Add FDA permit processing if pharmaceutical
  if (details.commodity?.toLowerCase().includes("pharmaceutical")) {
    brokerageItems.push({
      id: generateId(),
      description: "FDA Permit Processing",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Entry",
      amount: 0
    });
  }
  
  categories.push({
    id: generateId(),
    category_name: "BROKERAGE CHARGES",
    line_items: brokerageItems,
    subtotal: 0
  });
  
  // DESTINATION LOCAL CHARGES (often included with brokerage)
  const destLocalItems: QuotationLineItemNew[] = [
    {
      id: generateId(),
      description: "Arrastre",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    },
    {
      id: generateId(),
      description: "Wharfage",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    }
  ];
  
  if (details.delivery_address) {
    destLocalItems.push({
      id: generateId(),
      description: "Delivery to Address",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    });
  }
  
  categories.push({
    id: generateId(),
    category_name: "DESTINATION LOCAL CHARGES",
    line_items: destLocalItems,
    subtotal: 0
  });
  
  return categories;
}

/**
 * Forwarding Service Templates
 */
function generateForwardingCharges(service: InquiryService): QuotationChargeCategory[] {
  const details = service.service_details as any;
  const mode = details.mode || "Ocean";
  const shipmentType = details.shipment_type || "FCL";
  
  const categories: QuotationChargeCategory[] = [];
  
  // FREIGHT CHARGES
  let freightCategoryName = "SEA FREIGHT";
  let freightDescription = "Ocean Freight";
  let freightUnit = "Per Container";
  
  if (mode === "Air") {
    freightCategoryName = "AIR FREIGHT";
    freightDescription = "Air Freight";
    freightUnit = "Per KG";
  } else if (mode === "Land") {
    freightCategoryName = "LAND FREIGHT";
    freightDescription = "Land Freight";
    freightUnit = "Per Shipment";
  }
  
  // Add express service note if air and pharmaceutical/perishable
  if (mode === "Air" && (details.commodity?.toLowerCase().includes("pharmaceutical") || 
      details.cargo_type === "Perishable")) {
    freightDescription += " - Express Service";
  }
  
  categories.push({
    id: generateId(),
    category_name: freightCategoryName,
    line_items: [
      {
        id: generateId(),
        description: freightDescription,
        price: 0,
        currency: "USD",
        quantity: 1,
        forex_rate: 56.25, // Default PHP forex rate
        is_taxed: false,
        remarks: freightUnit,
        amount: 0
      }
    ],
    subtotal: 0
  });
  
  // ORIGIN LOCAL CHARGES
  const originItems: QuotationLineItemNew[] = [
    {
      id: generateId(),
      description: `Port Handling - ${details.pol || "Origin"}`,
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    },
    {
      id: generateId(),
      description: "Documentation Fee",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    }
  ];
  
  // Add VGM for ocean shipments
  if (mode === "Ocean") {
    originItems.push({
      id: generateId(),
      description: "VGM (Verified Gross Mass)",
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Container",
      amount: 0
    });
  }
  
  // Add cold storage for temperature-controlled
  if (details.commodity?.toLowerCase().includes("temperature") || 
      details.commodity?.toLowerCase().includes("pharmaceutical") ||
      details.commodity?.toLowerCase().includes("perishable")) {
    originItems.push({
      id: generateId(),
      description: `Cold Storage Handling - ${details.pol || "Origin"}`,
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    });
  }
  
  categories.push({
    id: generateId(),
    category_name: "ORIGIN LOCAL CHARGES",
    line_items: originItems,
    subtotal: 0
  });
  
  // DESTINATION LOCAL CHARGES
  const destItems: QuotationLineItemNew[] = [
    {
      id: generateId(),
      description: `Port Handling - ${details.pod || "Destination"}`,
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    }
  ];
  
  // Add cold storage for temperature-controlled
  if (details.commodity?.toLowerCase().includes("temperature") || 
      details.commodity?.toLowerCase().includes("pharmaceutical") ||
      details.commodity?.toLowerCase().includes("perishable")) {
    destItems.push({
      id: generateId(),
      description: `Cold Storage Handling - ${details.pod || "Destination"}`,
      price: 0,
      currency: "PHP",
      quantity: 1,
      forex_rate: 1,
      is_taxed: true,
      remarks: "Per Shipment",
      amount: 0
    });
  }
  
  categories.push({
    id: generateId(),
    category_name: "DESTINATION LOCAL CHARGES",
    line_items: destItems,
    subtotal: 0
  });
  
  return categories;
}

/**
 * Trucking Service Templates
 */
function generateTruckingCharges(service: InquiryService): QuotationChargeCategory[] {
  const details = service.service_details as any;
  const truckType = details.truck_type || "Closed Van";
  
  return [
    {
      id: generateId(),
      category_name: "DESTINATION LOCAL CHARGES",
      line_items: [
        {
          id: generateId(),
          description: `Trucking - ${truckType}`,
          price: 0,
          currency: "PHP",
          quantity: 1,
          forex_rate: 1,
          is_taxed: true,
          remarks: "Per Trip",
          amount: 0
        }
      ],
      subtotal: 0
    }
  ];
}

/**
 * Marine Insurance Service Templates
 */
function generateMarineInsuranceCharges(service: InquiryService): QuotationChargeCategory[] {
  const details = service.service_details as any;
  
  return [
    {
      id: generateId(),
      category_name: "OTHER CHARGES",
      line_items: [
        {
          id: generateId(),
          description: "Marine Insurance Premium",
          price: 0,
          currency: "PHP",
          quantity: 1,
          forex_rate: 1,
          is_taxed: false,
          remarks: "Per Shipment",
          amount: 0
        }
      ],
      subtotal: 0
    }
  ];
}

/**
 * Others Service Templates
 */
function generateOthersCharges(service: InquiryService): QuotationChargeCategory[] {
  const details = service.service_details as any;
  
  return [
    {
      id: generateId(),
      category_name: "OTHER CHARGES",
      line_items: [
        {
          id: generateId(),
          description: details.service_description || "Additional Service",
          price: 0,
          currency: "PHP",
          quantity: 1,
          forex_rate: 1,
          is_taxed: true,
          remarks: "Per Service",
          amount: 0
        }
      ],
      subtotal: 0
    }
  ];
}

/**
 * Main Template Engine - Converts inquiry services to charge categories
 */
export function generateChargeCategoriesFromInquiry(
  inquiryServices: InquiryService[]
): QuotationChargeCategory[] {
  const allCategories: QuotationChargeCategory[] = [];
  
  for (const service of inquiryServices) {
    let serviceCategories: QuotationChargeCategory[] = [];
    
    switch (service.service_type) {
      case "Brokerage":
        serviceCategories = generateBrokerageCharges(service);
        break;
      case "Forwarding":
        serviceCategories = generateForwardingCharges(service);
        break;
      case "Trucking":
        serviceCategories = generateTruckingCharges(service);
        break;
      case "Marine Insurance":
        serviceCategories = generateMarineInsuranceCharges(service);
        break;
      case "Others":
        serviceCategories = generateOthersCharges(service);
        break;
    }
    
    allCategories.push(...serviceCategories);
  }
  
  // Merge categories with the same name
  const mergedCategories: Record<string, QuotationChargeCategory> = {};
  
  for (const category of allCategories) {
    if (mergedCategories[category.category_name]) {
      // Merge line items
      mergedCategories[category.category_name].line_items.push(...category.line_items);
    } else {
      mergedCategories[category.category_name] = category;
    }
  }
  
  return Object.values(mergedCategories);
}
