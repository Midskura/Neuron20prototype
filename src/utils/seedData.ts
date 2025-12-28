// Comprehensive 1-Month Seed Data for Neuron OS
// Simulates a real freight forwarding business that's been operating for 30 days

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

// Helper to get dates relative to today
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Helper to format date for created_date fields
const dateOnly = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Generate realistic quotation number
const genQuoteNum = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `IQ${year}${month}${day}${random}`;
};

// Generate realistic project number
let projectCounter = 1;
const genProjectNum = (): string => {
  const num = String(projectCounter++).padStart(3, '0');
  return `PROJ-2025-${num}`;
};

// ==================== CUSTOMERS & CONTACTS ====================

export const CUSTOMERS = [
  // Whale Clients (frequent, high-value)
  {
    id: "cust-001",
    name: "Pacific Electronics Manufacturing Corp.",
    industry: "Electronics Manufacturing",
    address: "Laguna Technopark, Biñan, Laguna",
    contact_email: "procurement@pacificelec.ph",
    contact_phone: "+63 49 511 2345",
    status: "Active",
    created_at: daysAgo(30),
    notes: "Major client - electronics components importer from China and Taiwan. Monthly shipments."
  },
  {
    id: "cust-002",
    name: "Manila Fashion Distributors Inc.",
    industry: "Retail & Distribution",
    address: "Binondo, Manila",
    contact_email: "logistics@manilafashion.com",
    contact_phone: "+63 2 8242 5678",
    status: "Active",
    created_at: daysAgo(28),
    notes: "Regular garment and textile importer. Seasonal peaks during fashion weeks."
  },
  {
    id: "cust-003",
    name: "Cebu Food Products Corporation",
    industry: "Food & Beverage",
    address: "Mandaue City, Cebu",
    contact_email: "imports@cebufood.ph",
    contact_phone: "+63 32 345 6789",
    status: "Active",
    created_at: daysAgo(27),
    notes: "Frozen food and canned goods importer. Temperature-controlled shipments required."
  },
  
  // Regular Clients
  {
    id: "cust-004",
    name: "AutoParts Solutions Philippines",
    industry: "Automotive",
    address: "Valenzuela City, Metro Manila",
    contact_email: "supply@autoparts.ph",
    contact_phone: "+63 2 8292 3456",
    status: "Active",
    created_at: daysAgo(25),
    notes: "Automotive parts and accessories. Mix of air and sea freight."
  },
  {
    id: "cust-005",
    name: "BuildRight Construction Supplies",
    industry: "Construction",
    address: "Pasig City, Metro Manila",
    contact_email: "procurement@buildright.ph",
    contact_phone: "+63 2 8631 4567",
    status: "Active",
    created_at: daysAgo(23),
    notes: "Construction materials and equipment. Heavy/oversized cargo."
  },
  {
    id: "cust-006",
    name: "MedSupply Pharmaceuticals Inc.",
    industry: "Healthcare",
    address: "Makati City, Metro Manila",
    contact_email: "logistics@medsupply.ph",
    contact_phone: "+63 2 8845 6789",
    status: "Active",
    created_at: daysAgo(22),
    notes: "Pharmaceutical products. Requires controlled temperature and customs compliance."
  },
  {
    id: "cust-007",
    name: "Davao Agricultural Trading",
    industry: "Agriculture",
    address: "Davao City",
    contact_email: "exports@davaoag.ph",
    contact_phone: "+63 82 234 5678",
    status: "Active",
    created_at: daysAgo(20),
    notes: "Agricultural machinery and inputs. Mix of import and domestic logistics."
  },
  {
    id: "cust-008",
    name: "TechGadget Retail Chain",
    industry: "Retail",
    address: "Quezon City, Metro Manila",
    contact_email: "import@techgadget.ph",
    contact_phone: "+63 2 8376 7890",
    status: "Active",
    created_at: daysAgo(18),
    notes: "Consumer electronics retailer. Fast-moving inventory from China."
  },
  
  // Occasional Clients
  {
    id: "cust-009",
    name: "Island Furniture Designs",
    industry: "Furniture & Home",
    address: "Las Piñas City, Metro Manila",
    contact_email: "purchasing@islandfurniture.ph",
    contact_phone: "+63 2 8800 1234",
    status: "Active",
    created_at: daysAgo(15),
    notes: "Furniture importer. Occasional large shipments."
  },
  {
    id: "cust-010",
    name: "GreenEnergy Solutions Inc.",
    industry: "Renewable Energy",
    address: "Taguig City, Metro Manila",
    contact_email: "projects@greenenergy.ph",
    contact_phone: "+63 2 8856 2345",
    status: "Active",
    created_at: daysAgo(12),
    notes: "Solar panel and equipment importer. Project-based shipments."
  },
  {
    id: "cust-011",
    name: "PetCare Distribution Corp.",
    industry: "Pet Supplies",
    address: "Parañaque City, Metro Manila",
    contact_email: "imports@petcare.ph",
    contact_phone: "+63 2 8820 3456",
    status: "Active",
    created_at: daysAgo(10),
    notes: "Pet food and accessories. Regular small shipments."
  },
  {
    id: "cust-012",
    name: "PrintPro Industrial Supplies",
    industry: "Printing & Packaging",
    address: "Caloocan City, Metro Manila",
    contact_email: "procurement@printpro.ph",
    contact_phone: "+63 2 8363 4567",
    status: "Active",
    created_at: daysAgo(8),
    notes: "Printing machinery and consumables. Technical equipment handling."
  }
];

export const CONTACTS = [
  // Pacific Electronics (cust-001) - 3 contacts
  { id: "cont-001", customer_id: "cust-001", name: "Robert Chen", position: "Procurement Manager", email: "r.chen@pacificelec.ph", phone: "+63 917 123 4567", is_primary: true },
  { id: "cont-002", customer_id: "cust-001", name: "Anna Lim", position: "Logistics Coordinator", email: "a.lim@pacificelec.ph", phone: "+63 917 234 5678", is_primary: false },
  { id: "cont-003", customer_id: "cust-001", name: "Michael Tan", position: "Supply Chain Director", email: "m.tan@pacificelec.ph", phone: "+63 917 345 6789", is_primary: false },
  
  // Manila Fashion (cust-002) - 2 contacts
  { id: "cont-004", customer_id: "cust-002", name: "Isabel Garcia", position: "Import Manager", email: "i.garcia@manilafashion.com", phone: "+63 918 456 7890", is_primary: true },
  { id: "cont-005", customer_id: "cust-002", name: "Carlos Rivera", position: "Warehouse Supervisor", email: "c.rivera@manilafashion.com", phone: "+63 918 567 8901", is_primary: false },
  
  // Cebu Food (cust-003) - 2 contacts
  { id: "cont-006", customer_id: "cust-003", name: "Maria Santos", position: "Purchasing Head", email: "m.santos@cebufood.ph", phone: "+63 919 678 9012", is_primary: true },
  { id: "cont-007", customer_id: "cust-003", name: "Ramon Uy", position: "Operations Manager", email: "r.uy@cebufood.ph", phone: "+63 919 789 0123", is_primary: false },
  
  // AutoParts (cust-004) - 1 contact
  { id: "cont-008", customer_id: "cust-004", name: "David Wong", position: "Supply Chain Manager", email: "d.wong@autoparts.ph", phone: "+63 920 890 1234", is_primary: true },
  
  // BuildRight (cust-005) - 2 contacts
  { id: "cont-009", customer_id: "cust-005", name: "Jennifer Cruz", position: "Procurement Officer", email: "j.cruz@buildright.ph", phone: "+63 921 901 2345", is_primary: true },
  { id: "cont-010", customer_id: "cust-005", name: "Eduardo Santos", position: "Project Manager", email: "e.santos@buildright.ph", phone: "+63 921 012 3456", is_primary: false },
  
  // MedSupply (cust-006) - 2 contacts
  { id: "cont-011", customer_id: "cust-006", name: "Dr. Patricia Reyes", position: "Import Compliance Officer", email: "p.reyes@medsupply.ph", phone: "+63 922 123 4567", is_primary: true },
  { id: "cont-012", customer_id: "cust-006", name: "Mark Villanueva", position: "Logistics Manager", email: "m.villanueva@medsupply.ph", phone: "+63 922 234 5678", is_primary: false },
  
  // Davao Agricultural (cust-007) - 1 contact
  { id: "cont-013", customer_id: "cust-007", name: "Jose Ramirez", position: "Trading Manager", email: "j.ramirez@davaoag.ph", phone: "+63 923 345 6789", is_primary: true },
  
  // TechGadget (cust-008) - 2 contacts
  { id: "cont-014", customer_id: "cust-008", name: "Karen Lee", position: "Inventory Manager", email: "k.lee@techgadget.ph", phone: "+63 924 456 7890", is_primary: true },
  { id: "cont-015", customer_id: "cust-008", name: "Vincent Go", position: "Buyer", email: "v.go@techgadget.ph", phone: "+63 924 567 8901", is_primary: false },
  
  // Island Furniture (cust-009) - 1 contact
  { id: "cont-016", customer_id: "cust-009", name: "Sophia Martinez", position: "Purchasing Head", email: "s.martinez@islandfurniture.ph", phone: "+63 925 678 9012", is_primary: true },
  
  // GreenEnergy (cust-010) - 1 contact
  { id: "cont-017", customer_id: "cust-010", name: "Thomas Hernandez", position: "Project Coordinator", email: "t.hernandez@greenenergy.ph", phone: "+63 926 789 0123", is_primary: true },
  
  // PetCare (cust-011) - 1 contact
  { id: "cont-018", customer_id: "cust-011", name: "Linda Aquino", position: "Import Coordinator", email: "l.aquino@petcare.ph", phone: "+63 927 890 1234", is_primary: true },
  
  // PrintPro (cust-012) - 1 contact
  { id: "cont-019", customer_id: "cust-012", name: "Benjamin Flores", position: "Operations Head", email: "b.flores@printpro.ph", phone: "+63 928 901 2345", is_primary: true }
];

// ==================== QUOTATIONS ====================

export const QUOTATIONS = [
  // ========== DRAFT (3 quotations - most recent) ==========
  {
    id: "quo-draft-001",
    quote_number: genQuoteNum(2),
    quotation_name: "Electronics Components - Shanghai Import",
    customer_id: "cust-001",
    customer_name: "Pacific Electronics Manufacturing Corp.",
    contact_person_id: "cont-001",
    contact_person_name: "Robert Chen",
    created_date: dateOnly(2),
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    status: "Draft",
    services: ["Forwarding", "Brokerage"],
    services_metadata: [
      {
        service_type: "Forwarding",
        service_details: {
          mode: "Sea",
          incoterms: "FOB",
          cargoType: "General Cargo",
          commodityDescription: "Electronic components and PCBs",
          aolPol: "Shanghai, China",
          aodPod: "Manila, Philippines (MICT)",
          cargoNature: "Dry",
          shipment_freight: "LCL",
          lclGwt: "2,500 kg",
          lclDims: "15 CBM",
          carrierAirline: "COSCO",
          transitTime: "12",
          route: "Shanghai - Manila",
          stackable: "Yes",
          countryOfOrigin: "China",
          preferentialTreatment: "ACFTA"
        }
      },
      {
        service_type: "Brokerage",
        service_details: {
          brokerageType: "Formal Entry",
          typeOfEntry: "Consumption",
          consumption: "Yes",
          warehousing: "No",
          peza: "No",
          pod: "Manila (MICT)",
          mode: "Sea",
          cargoType: "General Cargo",
          commodityDescription: "Electronic components and PCBs",
          lclGwt: "2,500 kg",
          lclDims: "15 CBM",
          countryOfOrigin: "China",
          preferentialTreatment: "ACFTA"
        }
      }
    ],
    movement: "IMPORT",
    category: "SEA FREIGHT",
    shipment_freight: "LCL",
    commodity: "Electronic components and PCBs",
    pol_aol: "Shanghai, China",
    pod_aod: "Manila, Philippines (MICT)",
    incoterm: "FOB",
    carrier: "COSCO",
    transit_days: 12,
    credit_terms: "30 days",
    validity_period: "15 days",
    created_by: "user-bd-001",
    created_by_name: "John Reyes",
    created_by_department: "Business Development"
  },
  
  {
    id: "quo-draft-002",
    quote_number: genQuoteNum(3),
    quotation_name: "Garment Shipment - Ningbo Import",
    customer_id: "cust-002",
    customer_name: "Manila Fashion Distributors Inc.",
    contact_person_id: "cont-004",
    contact_person_name: "Isabel Garcia",
    created_date: dateOnly(3),
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    status: "Draft",
    services: ["Forwarding", "Brokerage", "Trucking"],
    services_metadata: [
      {
        service_type: "Forwarding",
        service_details: {
          mode: "Sea",
          incoterms: "CIF",
          cargoType: "General Cargo",
          commodityDescription: "Ready-made garments and textiles",
          aolPol: "Ningbo, China",
          aodPod: "Manila, Philippines",
          cargoNature: "Dry",
          shipment_freight: "FCL",
          fcl40ft: "2",
          fclQty: 2,
          carrierAirline: "Maersk",
          transitTime: "10",
          route: "Ningbo - Manila",
          stackable: "Yes",
          countryOfOrigin: "China",
          preferentialTreatment: "ACFTA"
        }
      },
      {
        service_type: "Brokerage",
        service_details: {
          brokerageType: "Formal Entry",
          typeOfEntry: "Consumption",
          consumption: "Yes",
          warehousing: "No",
          peza: "No",
          pod: "Manila",
          mode: "Sea",
          cargoType: "General Cargo",
          commodityDescription: "Ready-made garments and textiles",
          fcl40ft: "2",
          fclQty: 2,
          countryOfOrigin: "China",
          preferentialTreatment: "ACFTA"
        }
      },
      {
        service_type: "Trucking",
        service_details: {
          pullOut: "Port of Manila",
          deliveryAddress: "123 Fashion St., Binondo, Manila",
          truckType: "20ft Chassis",
          qty: 2,
          deliveryInstructions: "Deliver to warehouse, contact guard before entry"
        }
      }
    ],
    movement: "IMPORT",
    category: "SEA FREIGHT",
    shipment_freight: "FCL",
    commodity: "Ready-made garments and textiles",
    pol_aol: "Ningbo, China",
    pod_aod: "Manila, Philippines",
    incoterm: "CIF",
    carrier: "Maersk",
    transit_days: 10,
    credit_terms: "45 days",
    validity_period: "20 days",
    created_by: "user-bd-002",
    created_by_name: "Maria Santos",
    created_by_department: "Business Development"
  },

  {
    id: "quo-draft-003",
    quote_number: genQuoteNum(4),
    quotation_name: "Urgent Air Shipment - Medical Supplies",
    customer_id: "cust-006",
    customer_name: "MedSupply Pharmaceuticals Inc.",
    contact_person_id: "cont-011",
    contact_person_name: "Dr. Patricia Reyes",
    created_date: dateOnly(4),
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    status: "Draft",
    services: ["Forwarding", "Brokerage"],
    services_metadata: [
      {
        service_type: "Forwarding",
        service_details: {
          mode: "Air",
          incoterms: "DAP",
          cargoType: "General Cargo",
          commodityDescription: "Pharmaceutical products (temperature controlled)",
          aolPol: "Tokyo, Japan",
          aodPod: "Manila, Philippines (NAIA)",
          cargoNature: "Temperature Controlled",
          shipment_freight: "Air",
          airGwt: "450 kg",
          airCwt: "520 kg",
          carrierAirline: "JAL Cargo",
          transitTime: "2",
          route: "Tokyo - Manila Direct",
          stackable: "No - Handle with care",
          countryOfOrigin: "Japan"
        }
      },
      {
        service_type: "Brokerage",
        service_details: {
          brokerageType: "Formal Entry",
          typeOfEntry: "Consumption",
          consumption: "Yes",
          warehousing: "No",
          peza: "No",
          pod: "Manila (NAIA)",
          mode: "Air",
          cargoType: "General Cargo",
          commodityDescription: "Pharmaceutical products",
          airGwt: "450 kg",
          airCwt: "520 kg",
          countryOfOrigin: "Japan"
        }
      }
    ],
    movement: "IMPORT",
    category: "AIR FREIGHT",
    shipment_freight: "Air",
    commodity: "Pharmaceutical products",
    pol_aol: "Tokyo, Japan",
    pod_aod: "Manila, Philippines (NAIA)",
    incoterm: "DAP",
    carrier: "JAL Cargo",
    transit_days: 2,
    credit_terms: "30 days",
    validity_period: "7 days",
    created_by: "user-bd-003",
    created_by_name: "Carlos Lopez",
    created_by_department: "Business Development"
  },

  // ========== PENDING PRICING (4 quotations) ==========
  {
    id: "quo-pending-001",
    quote_number: genQuoteNum(5),
    quotation_name: "Automotive Parts - Yokohama Import",
    customer_id: "cust-004",
    customer_name: "AutoParts Solutions Philippines",
    contact_person_id: "cont-008",
    contact_person_name: "David Wong",
    created_date: dateOnly(5),
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    submitted_at: daysAgo(5),
    status: "Pending Pricing",
    services: ["Forwarding", "Brokerage"],
    services_metadata: [
      {
        service_type: "Forwarding",
        service_details: {
          mode: "Sea",
          incoterms: "FOB",
          cargoType: "General Cargo",
          commodityDescription: "Automotive spare parts and accessories",
          aolPol: "Yokohama, Japan",
          aodPod: "Manila, Philippines",
          cargoNature: "Dry",
          shipment_freight: "LCL",
          lclGwt: "3,200 kg",
          lclDims: "18 CBM",
          carrierAirline: "ONE",
          transitTime: "8",
          route: "Yokohama - Manila",
          stackable: "Yes",
          countryOfOrigin: "Japan"
        }
      },
      {
        service_type: "Brokerage",
        service_details: {
          brokerageType: "Formal Entry",
          typeOfEntry: "Consumption",
          consumption: "Yes",
          warehousing: "No",
          peza: "No",
          pod: "Manila",
          mode: "Sea",
          cargoType: "General Cargo",
          commodityDescription: "Automotive spare parts and accessories",
          lclGwt: "3,200 kg",
          lclDims: "18 CBM",
          countryOfOrigin: "Japan"
        }
      }
    ],
    movement: "IMPORT",
    category: "SEA FREIGHT",
    shipment_freight: "LCL",
    commodity: "Automotive spare parts and accessories",
    pol_aol: "Yokohama, Japan",
    pod_aod: "Manila, Philippines",
    incoterm: "FOB",
    carrier: "ONE",
    transit_days: 8,
    credit_terms: "30 days",
    validity_period: "15 days",
    created_by: "user-bd-001",
    created_by_name: "John Reyes",
    created_by_department: "Business Development"
  },

  {
    id: "quo-pending-002",
    quote_number: genQuoteNum(6),
    quotation_name: "Construction Equipment - Shanghai",
    customer_id: "cust-005",
    customer_name: "BuildRight Construction Supplies",
    contact_person_id: "cont-009",
    contact_person_name: "Jennifer Cruz",
    created_date: dateOnly(6),
    created_at: daysAgo(6),
    updated_at: daysAgo(6),
    submitted_at: daysAgo(6),
    status: "Pending Pricing",
    services: ["Forwarding", "Brokerage", "Marine Insurance"],
    services_metadata: [
      {
        service_type: "Forwarding",
        service_details: {
          mode: "Sea",
          incoterms: "CFR",
          cargoType: "Heavy Machinery",
          commodityDescription: "Construction machinery and equipment",
          aolPol: "Shanghai, China",
          aodPod: "Manila, Philippines",
          cargoNature: "Heavy/Oversized",
          shipment_freight: "FCL",
          fcl40ft: "3",
          fclQty: 3,
          carrierAirline: "MSC",
          transitTime: "14",
          route: "Shanghai - Manila",
          stackable: "No - Heavy equipment",
          countryOfOrigin: "China"
        }
      },
      {
        service_type: "Brokerage",
        service_details: {
          brokerageType: "Formal Entry",
          typeOfEntry: "Consumption",
          consumption: "Yes",
          warehousing: "No",
          peza: "No",
          pod: "Manila",
          mode: "Sea",
          cargoType: "Heavy Machinery",
          commodityDescription: "Construction machinery and equipment",
          fcl40ft: "3",
          fclQty: 3,
          countryOfOrigin: "China"
        }
      },
      {
        service_type: "Marine Insurance",
        service_details: {
          commodityDescription: "Construction machinery and equipment",
          hsCode: "8429.52",
          aolPol: "Shanghai, China",
          aodPod: "Manila, Philippines",
          invoiceValue: 5800000
        }
      }
    ],
    movement: "IMPORT",
    category: "SEA FREIGHT",
    shipment_freight: "FCL",
    commodity: "Construction machinery and equipment",
    pol_aol: "Shanghai, China",
    pod_aod: "Manila, Philippines",
    incoterm: "CFR",
    carrier: "MSC",
    transit_days: 14,
    credit_terms: "60 days",
    validity_period: "20 days",
    created_by: "user-bd-002",
    created_by_name: "Maria Santos",
    created_by_department: "Business Development"
  },

  {
    id: "quo-pending-003",
    quote_number: genQuoteNum(7),
    quotation_name: "Frozen Food - Los Angeles Import",
    customer_id: "cust-003",
    customer_name: "Cebu Food Products Corporation",
    contact_person_id: "cont-006",
    contact_person_name: "Maria Santos",
    created_date: dateOnly(7),
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
    submitted_at: daysAgo(7),
    status: "Pending Pricing",
    services: ["Forwarding", "Brokerage"],
    services_metadata: [
      {
        service_type: "Forwarding",
        service_details: {
          mode: "Sea",
          incoterms: "CIF",
          cargoType: "Reefer",
          commodityDescription: "Frozen food products",
          aolPol: "Los Angeles, USA",
          aodPod: "Cebu, Philippines",
          cargoNature: "Frozen (-18°C)",
          shipment_freight: "FCL",
          fcl40ft: "2",
          fclQty: 2,
          carrierAirline: "CMA CGM",
          transitTime: "21",
          route: "Los Angeles - Cebu via Manila",
          stackable: "No - Reefer containers",
          countryOfOrigin: "USA"
        }
      },
      {
        service_type: "Brokerage",
        service_details: {
          brokerageType: "Formal Entry",
          typeOfEntry: "Consumption",
          consumption: "Yes",
          warehousing: "No",
          peza: "No",
          pod: "Cebu",
          mode: "Sea",
          cargoType: "Reefer",
          commodityDescription: "Frozen food products",
          fcl40ft: "2",
          fclQty: 2,
          countryOfOrigin: "USA"
        }
      }
    ],
    movement: "IMPORT",
    category: "SEA FREIGHT",
    shipment_freight: "FCL",
    commodity: "Frozen food products",
    pol_aol: "Los Angeles, USA",
    pod_aod: "Cebu, Philippines",
    incoterm: "CIF",
    carrier: "CMA CGM",
    transit_days: 21,
    credit_terms: "45 days",
    validity_period: "15 days",
    created_by: "user-bd-001",
    created_by_name: "John Reyes",
    created_by_department: "Business Development"
  },

  {
    id: "quo-pending-004",
    quote_number: genQuoteNum(7),
    quotation_name: "Solar Panels - Taiwan Import",
    customer_id: "cust-010",
    customer_name: "GreenEnergy Solutions Inc.",
    contact_person_id: "cont-017",
    contact_person_name: "Thomas Hernandez",
    created_date: dateOnly(7),
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
    submitted_at: daysAgo(7),
    status: "Pending Pricing",
    services: ["Forwarding", "Brokerage"],
    services_metadata: [
      {
        service_type: "Forwarding",
        service_details: {
          mode: "Sea",
          incoterms: "FOB",
          cargoType: "General Cargo",
          commodityDescription: "Solar panels and inverters",
          aolPol: "Kaohsiung, Taiwan",
          aodPod: "Manila, Philippines",
          cargoNature: "Fragile - Handle with care",
          shipment_freight: "FCL",
          fcl40ft: "1",
          fclQty: 1,
          carrierAirline: "Evergreen",
          transitTime: "5",
          route: "Kaohsiung - Manila Direct",
          stackable: "No - Fragile",
          countryOfOrigin: "Taiwan"
        }
      },
      {
        service_type: "Brokerage",
        service_details: {
          brokerageType: "Formal Entry",
          typeOfEntry: "Consumption",
          consumption: "Yes",
          warehousing: "No",
          peza: "No",
          pod: "Manila",
          mode: "Sea",
          cargoType: "General Cargo",
          commodityDescription: "Solar panels and inverters",
          fcl40ft: "1",
          fclQty: 1,
          countryOfOrigin: "Taiwan"
        }
      }
    ],
    movement: "IMPORT",
    category: "SEA FREIGHT",
    shipment_freight: "FCL",
    commodity: "Solar panels and inverters",
    pol_aol: "Kaohsiung, Taiwan",
    pod_aod: "Manila, Philippines",
    incoterm: "FOB",
    carrier: "Evergreen",
    transit_days: 5,
    credit_terms: "30 days",
    validity_period: "20 days",
    created_by: "user-bd-003",
    created_by_name: "Carlos Lopez",
    created_by_department: "Business Development"
  }
];

// I'll continue with more quotations and all other data in the next part...
// This is just Part 1 showing the structure

export async function seedAllData() {
  console.log("🌱 Starting comprehensive seed data import...");
  
  try {
    // 1. Seed Customers
    console.log("📦 Seeding customers...");
    for (const customer of CUSTOMERS) {
      await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(customer)
      });
    }
    console.log(`✅ Seeded ${CUSTOMERS.length} customers`);

    // 2. Seed Contacts
    console.log("👥 Seeding contacts...");
    for (const contact of CONTACTS) {
      await fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(contact)
      });
    }
    console.log(`✅ Seeded ${CONTACTS.length} contacts`);

    // 3. Seed Quotations (will add more in continuation)
    console.log("📋 Seeding quotations...");
    for (const quotation of QUOTATIONS) {
      await fetch(`${API_BASE}/quotations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(quotation)
      });
    }
    console.log(`✅ Seeded ${QUOTATIONS.length} quotations`);

    console.log("🎉 Seed data import completed successfully!");
    return { success: true };
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    return { success: false, error };
  }
}