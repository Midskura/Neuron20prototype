// ============================================
// PRICING MODULE TYPES
// ============================================

// Unified status for quotation lifecycle (replaces separate InquiryStatus and QuotationStatus)
export type QuotationStatus = 
  | "Draft"                // BD is still editing the inquiry
  | "Pending Pricing"      // BD submitted to PD, waiting for pricing
  | "Priced"              // PD finished pricing, ready for BD to send to client
  | "Sent to Client"      // BD sent quotation to client
  | "Accepted by Client"  // Client accepted the quotation
  | "Rejected by Client"  // Client rejected the quotation
  | "Needs Revision"      // Client wants pricing revision
  | "Converted to Project" // Quotation converted to project (terminal state)
  | "Disapproved"         // Management disapproved
  | "Cancelled";          // Cancelled

export type ProjectStatus = "Active" | "Completed";
export type ServiceType = "Brokerage" | "Forwarding" | "Trucking" | "Marine Insurance" | "Others";
export type BrokerageMode = "Standard" | "All Inclusive" | "Non-regular";
export type BrokerageSubtype = "Import Air" | "Import Ocean" | "Export Air" | "Export Ocean";
export type Incoterm = "EXW" | "FOB" | "CIF" | "FCA" | "CPT" | "CIP" | "DAP" | "DPU" | "DDP";
export type TruckType = "10W" | "Closed Van" | "Open Truck" | "Refrigerated" | "Flatbed" | "Wing Van" | "AW" | "DW" | "2W" | "3W" | "4Br";
export type ChargeCategory = "Freight Charges" | "Origin Local Charges" | "Destination Local Charges" | "Reimbursable Charges" | "Brokerage Charges" | "Customs Duty & VAT" | "Other Charges";
export type VendorType = "Overseas Agent" | "Local Agent" | "Subcontractor";
export type ShipmentType = "FCL" | "LCL" | "Consolidation" | "Break Bulk";
export type CargoType = "General" | "Perishable" | "Hazardous" | "Fragile" | "High Value";
export type Mode = "Air" | "Ocean" | "Land";

// ============================================
// SERVICE DETAILS (Metadata per service type)
// ============================================

export interface BrokerageDetails {
  subtype: BrokerageSubtype;
  shipment_type: ShipmentType;
  type_of_entry?: string;
  pod?: string;
  mode?: Mode;
  cargo_type?: CargoType;
  commodity?: string;
  declared_value?: number;
  delivery_address?: string;
  country_of_origin?: string;
  preferential_treatment?: string;
  psic?: string;
  aeo?: string;
}

export interface ForwardingDetails {
  incoterms: Incoterm;
  cargo_type: CargoType;
  commodity: string;
  delivery_address?: string;
  mode: Mode;
  aol?: string;
  pol: string;
  aod?: string;
  pod: string;
}

export interface TruckingDetails {
  pull_out?: string;
  delivery_address: string;
  truck_type: TruckType;
  delivery_instructions?: string;
}

export interface MarineInsuranceDetails {
  commodity_description: string;
  hs_code?: string;
  aol?: string;
  pol: string;
  aod?: string;
  pod: string;
  invoice_value: number;
}

export interface OthersDetails {
  service_description: string;
}

// Service specification with detailed metadata
export interface InquiryService {
  service_type: ServiceType;
  service_details: BrokerageDetails | ForwardingDetails | TruckingDetails | MarineInsuranceDetails | OthersDetails | Record<string, any>;
  total_quoted_price?: number; // Optional: Total quoted price for this service
}

// ============================================
// QUOTATION LINE ITEMS
// ============================================

export interface QuotationLineItem {
  id: string;
  quotation_service_id: string;
  category: ChargeCategory;
  charge_type: string; // From predefined list per category
  description?: string; // Optional custom description
  quantity: number;
  unit: string; // "per shipment", "per CBM", "per container", etc.
  selling_price: number;
  buying_price?: number; // Only if vendor assigned
  vendor_id?: string; // Link to vendor if applicable
  line_total: number; // calculated: quantity × selling_price
}

// ============================================
// QUOTATION SERVICES (Junction with details)
// ============================================

export interface QuotationService {
  id: string;
  quotation_id: string;
  service_type: ServiceType;
  service_subtype?: string; // e.g., "Import Air" for Brokerage
  service_details: BrokerageDetails | ForwardingDetails | TruckingDetails | MarineInsuranceDetails | OthersDetails;
  line_items: QuotationLineItem[];
  subtotal: number; // calculated from line items
}

// ============================================
// QUOTATION (Legacy)
// ============================================

export interface Quotation {
  id: string;
  quotation_number: string;
  quotation_name: string; // User-defined descriptive name
  inquiry_id?: string; // Link back to BD inquiry (relay race pattern)
  customer_id: string;
  customer_name: string;
  contact_person?: string;
  contact_email?: string;
  
  // Financial
  credit_terms: string; // e.g., "Net 30", "Net 45", "COD"
  validity: string; // e.g., "7 days", "15 days", "30 days"
  valid_until?: string; // Calculated date
  currency: string; // e.g., "PHP", "USD"
  
  // Services with details and pricing
  services: QuotationService[];
  
  // Totals
  subtotal: number;
  tax?: number;
  total: number;
  
  // Workflow
  status: QuotationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  disapproved_by?: string;
  disapproved_at?: string;
  disapproval_reason?: string;
  notes?: string;
}

// ============================================
// PREDEFINED CHARGE TYPES PER CATEGORY
// ============================================

export const CHARGE_TYPES: Record<ChargeCategory, string[]> = {
  "Freight Charges": [
    "Ocean Freight",
    "Air Freight",
  ],
  "Origin Local Charges": [
    "Pick up fee",
    "CFS",
    "CUS",
    "DOCS",
    "Handling Fee",
    "FE Fee",
    "THC",
    "BL Fee",
    "MBL Surrender Fee",
    "Seal",
    "IRF",
    "Customs Clearance",
    "Export Customs Fee",
    "Add Broker",
    "Gate Permission Receipt",
    "Special Form A/I, C/O",
  ],
  "Destination Local Charges": [
    "Turn Over Fee",
    "LCL Charges",
    "Documentation Fee",
    "THC",
    "CIC",
    "CRS",
    "BL Fee",
    "Breakbulk Fee (BBF)",
    "Equipment Examination Charge (EEC)",
    "Import Release Fee (IRF)",
    "Empty Control Charge (ECC)",
    "Peak Season Surcharge (PSS)",
    "Container Handling Charge (CHC)",
  ],
  "Reimbursable Charges": [
    "Warehouse Charges",
    "Arrastre & Wharfage Due",
  ],
  "Brokerage Charges": [
    "Documentation Fee",
    "Processing Fee",
    "Brokerage Fee",
    "Handling",
  ],
  "Customs Duty & VAT": [
    "Duties & Taxes",
  ],
  "Other Charges": [
    "Insurance Premium",
    "Storage",
    "Demurrage",
    "Detention",
    "Miscellaneous"
  ]
};

// ============================================
// VENDOR (NETWORK PARTNERS)
// ============================================

export interface Vendor {
  id: string;
  type: VendorType;
  company_name: string;
  country: string;
  territory?: string;
  wca_number?: string; // For Overseas Agents
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  services_offered: ServiceType[];
  total_shipments: number;
  created_at: string;
  notes?: string;
}

// ============================================
// PROJECT (Accepted Quotations - Handover to Operations)
// ============================================

export interface Project {
  id: string;
  project_number: string; // PROJ-2025-001
  quotation_id: string;
  quotation_number: string;
  quotation_name?: string; // ✨ NEW - Inherited from quotation
  quotation?: QuotationNew; // Full quotation object for reference
  
  // Customer information
  customer_id: string;
  customer_name: string;
  contact_person_id?: string;
  contact_person_name?: string;
  
  // Services and pricing (inherited from quotation)
  services: string[]; // ["FORWARDING", "BROKERAGE"]
  services_metadata?: InquiryService[]; // Detailed service specifications
  charge_categories?: QuotationChargeCategory[]; // Full pricing from quotation
  currency: string;
  total: number;
  
  // Shipment details (inherited from quotation)
  movement?: string; // "IMPORT" | "EXPORT"
  category?: string; // "SEA FREIGHT" | "AIR FREIGHT"
  shipment_type?: string; // "FCL" | "LCL" | "Consolidation" | "Break Bulk"
  pol_aol?: string; // Port/Airport of Loading
  pod_aod?: string; // Port/Airport of Discharge
  commodity?: string;
  incoterm?: string;
  carrier?: string;
  transit_days?: number;
  
  // Cargo Details
  volume?: string;
  volume_cbm?: number; // ✨ NEW
  volume_containers?: string; // ✨ NEW - e.g., "2x40' HC"
  volume_packages?: number; // ✨ NEW
  gross_weight?: number;
  chargeable_weight?: number;
  dimensions?: string;
  cargo_type?: string; // "General Cargo" | "Perishable" | "Hazardous" | "Fragile" | "High Value"
  stackability?: "Stackable" | "Non-Stackable" | "Fragile"; // ✨ NEW
  collection_address?: string;
  
  // Project-specific fields (filled by BD)
  client_po_number?: string;
  client_po_date?: string;
  shipment_ready_date?: string;
  requested_etd?: string;
  actual_etd?: string;
  eta?: string;
  actual_delivery_date?: string;
  special_instructions?: string;
  
  // Status and Tracking
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  booking_status?: string; // "No Bookings Yet" | "Partially Booked" | "Fully Booked"
  linkedBookings?: Array<{
    bookingId: string;
    bookingNumber: string;
    serviceType: string;
    status: string;
    createdAt: string;
    createdBy?: string;
    totalExpenses?: number; // Sum of all expenses for this booking
  }>;
  
  // Ownership
  bd_owner_user_id: string;
  bd_owner_user_name: string;
  bd_owner_email?: string;
  ops_assigned_user_id: string | null;
  ops_assigned_user_name: string | null;
  
  // Timeline
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

// ============================================
// PRICING USER (for assignments)
// ============================================

export interface PricingUser {
  id: string;
  name: string;
  email: string;
  role: "Pricing Officer" | "Pricing Manager";
}

// ============================================
// NEW QUOTATION SYSTEM (Category-based with Multi-currency & Tax)
// ============================================

/**
 * Line Item in the new quotation system
 * Supports multi-currency, forex conversion, and tax handling
 */
export interface QuotationLineItemNew {
  id: string;
  description: string;        // "O/F", "CFS", "LCL CHARGES"
  price: number;             // Base price (40.00)
  currency: string;          // "USD", "PHP", "EUR"
  quantity: number;          // 3.68
  unit?: string;             // "W/M", "B/L", "Set", "Shipment", "Container"
  forex_rate: number;        // 1.0 (or actual conversion rate)
  is_taxed: boolean;         // true if VAT applies to this item
  remarks: string;           // "PER W/M", "PER BL", "PER SET"
  amount: number;            // Calculated: price × quantity × forex_rate
  
  // Optional (for cost tracking)
  buying_price?: number;
  vendor_id?: string;
  buying_amount?: number;
}

/**
 * Charge Category group
 * Groups related charges together with subtotal
 */
export interface QuotationChargeCategory {
  id: string;
  category_name: string;     // "SEA FREIGHT", "ORIGIN LOCAL CHARGES"
  name?: string;             // Backward compatibility alias
  line_items: QuotationLineItemNew[];
  subtotal: number;          // Auto-calculated sum of line_items amounts
}

/**
 * Financial summary for quotation
 * Handles tax calculation and grand total
 */
export interface FinancialSummary {
  subtotal_non_taxed: number;   // Sum of non-taxed items
  subtotal_taxed: number;        // Sum of taxed items (before tax)
  tax_rate: number;              // e.g., 0.12 for 12% VAT
  tax_amount: number;            // subtotal_taxed × tax_rate
  other_charges: number;         // Any additional charges
  grand_total: number;           // sum of all + tax
}

/**
 * New Quotation Document
 * Category-based structure matching the actual quotation format
 * This is the UNIFIED structure - "Inquiry" is just a quotation with status "Inquiry"
 */
export interface QuotationNew {
  id: string;
  
  // Header
  quote_number: string;          // "IQ25120034"
  quotation_name?: string;       // Optional user-defined name
  created_date: string;
  valid_until: string;
  customer_id: string;
  customer_name: string;
  customer_company?: string;
  customer_organization?: string;
  contact_person_id?: string;    // Link to Contact.id for proper relationships
  contact_person_name?: string;  // Contact person display name
  
  // Shipment Details
  movement: "IMPORT" | "EXPORT";
  category: "SEA FREIGHT" | "AIR FREIGHT" | "LAND FREIGHT";
  shipment_freight: "LCL" | "FCL" | "CONSOLIDATION" | "BREAK BULK";
  services: string[];            // ["FORWARDING", "BROKERAGE"]
  services_metadata?: InquiryService[]; // Optional detailed service specifications (used when status = "Inquiry")
  incoterm: string;
  carrier: string;               // "TBA" or actual carrier
  transit_days?: number;
  collection_address?: string;
  
  // Cargo Details
  commodity: string;
  volume?: string;
  gross_weight?: number;         // GWT
  chargeable_weight?: number;    // CWT
  dimensions?: string;           // DIMS
  pol_aol: string;              // Port/Airport of Loading
  pod_aod: string;              // Port/Airport of Discharge
  
  // Pricing (Category-based)
  charge_categories: QuotationChargeCategory[];
  
  // Financial Summary
  currency: string;              // "USD", "PHP"
  financial_summary: FinancialSummary;
  
  // Terms & Approval
  terms_and_conditions?: string[];
  credit_terms?: string;         // "Net 30", "Net 45"
  validity_period?: string;      // "15 days", "30 days"
  prepared_by?: string;
  prepared_by_title?: string;
  approved_by?: string;
  customer_signatory?: string;
  
  // Metadata
  status: QuotationStatus;
  inquiry_id?: string;           // Link to original inquiry (deprecated - same document now)
  assigned_to?: string;          // PD user assigned (when status = "Inquiry")
  disapproval_reason?: string;   // Reason for disapproval (when status = "Disapproved")
  
  // Project Conversion (set when converted to project)
  project_id?: string;           // Link to created project
  project_number?: string;       // Project number (e.g., "PROJ-2025-001")
  converted_to_project_at?: string; // Timestamp of conversion
  
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

// Backward compatibility alias - Inquiry is now just a QuotationNew with status "Inquiry"
export type Inquiry = QuotationNew;

// ============================================
// MOVEMENT & FREIGHT CATEGORY TYPES
// ============================================

export type Movement = "IMPORT" | "EXPORT";
export type FreightCategory = "SEA FREIGHT" | "AIR FREIGHT" | "LAND FREIGHT";
export type ShipmentFreight = "LCL" | "FCL" | "CONSOLIDATION" | "BREAK BULK";