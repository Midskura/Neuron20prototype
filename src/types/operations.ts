// ==================== STATUS TYPES ====================

export type ExecutionStatus = 
  | "Draft"
  | "Confirmed"
  | "In Progress"
  | "Pending"
  | "On Hold"
  | "Completed"
  | "Cancelled";

// ==================== SERVICE TYPES ====================

export type ServiceType = 
  | "Forwarding" 
  | "Brokerage" 
  | "Trucking" 
  | "Marine Insurance" 
  | "Others";

// ==================== CLIENT HANDLER PREFERENCES ====================

export interface ClientHandlerPreference {
  id: string;
  customer_id: string;
  service_type: ServiceType;
  preferred_manager_id: string;
  preferred_manager_name: string;
  preferred_supervisor_id: string;
  preferred_supervisor_name: string;
  preferred_handler_id: string;
  preferred_handler_name: string;
  created_at: string;
  updated_at: string;
}

// ==================== FORWARDING BOOKING ====================

export interface ForwardingBooking {
  bookingId: string;
  projectNumber?: string; // Optional reference for autofill
  createdAt: string;
  updatedAt: string;

  // General Information
  customerName: string;
  accountOwner: string;
  accountHandler: string;
  services: string[];
  subServices: string[];
  typeOfEntry: string;
  mode: "FCL" | "LCL" | "AIR";
  cargoType: string;
  stackability?: string;
  deliveryAddress: string;
  quotationReferenceNumber: string;
  status: ExecutionStatus;

  // Team Assignments (new architecture)
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  assigned_supervisor_id?: string;
  assigned_supervisor_name?: string;
  assigned_handler_id?: string;
  assigned_handler_name?: string;

  // Expected Volume
  qty20ft?: string;
  qty40ft?: string;
  qty45ft?: string;
  volumeGrossWeight?: string;
  volumeDimensions?: string;
  volumeChargeableWeight?: string;

  // Status-dependent fields
  pendingReason?: string;
  completionDate?: string;
  cancellationReason?: string;
  cancelledDate?: string;

  // Shipment Information
  consignee: string;
  shipper: string;
  mblMawb: string;
  hblHawb: string;
  registryNumber: string;
  carrier: string;
  aolPol: string;
  aodPod: string;
  forwarder: string;
  commodityDescription: string;
  countryOfOrigin: string;
  preferentialTreatment: string;
  grossWeight: string;
  dimensions: string;
  eta: string;

  // FCL-specific fields
  containerNumbers?: string[];
  containerDeposit?: boolean;
  emptyReturn?: string;
  detDemValidity?: string;
  storageValidity?: string;
  croAvailability?: string;

  // LCL/AIR-specific fields
  warehouseLocation?: string;
}

// ==================== BROKERAGE BOOKING ====================

export interface BrokerageBooking {
  bookingId: string;
  projectNumber?: string; // Optional reference for autofill
  createdAt: string;
  updatedAt: string;

  // General Information
  customerName: string;
  accountOwner?: string;
  accountHandler?: string;
  service?: string; // Service/s
  incoterms?: string;
  mode?: string;
  cargoType?: string;
  cargoNature?: string;
  quotationReferenceNumber?: string;
  status: ExecutionStatus;

  // Team Assignments (new architecture)
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  assigned_supervisor_id?: string;
  assigned_supervisor_name?: string;
  assigned_handler_id?: string;
  assigned_handler_name?: string;

  // Shipment Information
  consignee?: string;
  shipper?: string;
  mblMawb?: string;
  hblHawb?: string;
  registryNumber?: string;
  carrier?: string;
  aolPol?: string;
  aodPod?: string;
  pod?: string; // Port of Discharge (from service specs)
  forwarder?: string;
  commodityDescription?: string;
  grossWeight?: string;
  dimensions?: string;
  taggingTime?: string;
  etd?: string;
  etb?: string;
  eta?: string;

  // FCL Information
  containerNumbers?: string;
  containerDeposit?: string;
  detDem?: string;
}

// ==================== TRUCKING BOOKING ====================

export interface TruckingBooking {
  bookingId: string;
  projectNumber?: string;
  createdAt: string;
  updatedAt: string;

  // General Information
  customerName: string;
  accountOwner?: string;
  accountHandler?: string;
  service?: string;
  truckType?: string;
  mode?: string;
  preferredDeliveryDate?: string;
  quotationReferenceNumber?: string;
  status: ExecutionStatus;

  // Team Assignments (new architecture)
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  assigned_supervisor_id?: string;
  assigned_supervisor_name?: string;
  assigned_handler_id?: string;
  assigned_handler_name?: string;

  // Shipment Information
  consignee?: string;
  driver?: string;
  helper?: string;
  vehicleReferenceNumber?: string;
  pullOut?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  dateDelivered?: string;

  // FCL Information
  tabsBooking?: string;
  emptyReturn?: string;
  cyFee?: string;
  eirAvailability?: string;
  earlyGateIn?: string;
  detDemValidity?: string;
  storageValidity?: string;
  shippingLine?: string;
}

// ==================== MARINE INSURANCE BOOKING ====================

export interface MarineInsuranceBooking {
  bookingId: string;
  projectNumber?: string;
  createdAt: string;
  updatedAt: string;

  // General Information
  customerName: string;
  accountOwner?: string;
  accountHandler?: string;
  service?: string;
  quotationReferenceNumber?: string;
  status: ExecutionStatus;

  // Team Assignments (new architecture)
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  assigned_supervisor_id?: string;
  assigned_supervisor_name?: string;
  assigned_handler_id?: string;
  assigned_handler_name?: string;

  // Policy Information
  policyNumber?: string;
  insuranceCompany?: string;
  insuredValue?: string;
  currency?: string;
  coverageType?: string;
  effectiveDate?: string;
  expiryDate?: string;

  // Shipment Information
  commodityDescription?: string;
  hsCode?: string;
  invoiceNumber?: string;
  invoiceValue?: string;
  packagingType?: string;
  numberOfPackages?: string;
  grossWeight?: string;
  dimensions?: string;

  // Route Information
  aol?: string; // Airport/Port of Loading
  pol?: string; // Port of Loading
  aod?: string; // Airport/Port of Discharge
  pod?: string; // Port of Discharge
  vesselVoyage?: string;
  mode?: string;

  // Additional Information
  specialConditions?: string;
  remarks?: string;
}

// ==================== OTHERS BOOKING ====================

export interface OthersBooking {
  bookingId: string;
  projectNumber?: string;
  createdAt: string;
  updatedAt: string;

  // General Information
  customerName: string;
  accountOwner?: string;
  accountHandler?: string;
  service?: string;
  serviceDescription?: string;
  quotationReferenceNumber?: string;
  status: ExecutionStatus;

  // Team Assignments (new architecture)
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  assigned_supervisor_id?: string;
  assigned_supervisor_name?: string;
  assigned_handler_id?: string;
  assigned_handler_name?: string;

  // Service Details
  deliveryAddress?: string;
  requestedDate?: string;
  completionDate?: string;
  specialRequirements?: string;

  // Additional Information
  notes?: string;
  attachments?: string[];
}

// ==================== BILLINGS ====================

export interface BillingLineItem {
  description: string;
  price: number;
  quantity: number;
  unit?: string;
  amount: number;
  remarks?: string;
}

export interface BillingChargeCategory {
  categoryName: string;
  lineItems: BillingLineItem[];
  subtotal: number;
}

export interface Billing {
  billingId: string;
  bookingId: string;
  bookingType: "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";
  createdAt: string;
  updatedAt: string;

  // Source tracking
  source?: "project" | "manual";
  projectNumber?: string;
  quotationNumber?: string;

  // Detailed structure (for project billings)
  chargeCategories?: BillingChargeCategory[];

  // Legacy fields (for manual billings or backward compat)
  description: string;
  amount: number;
  currency: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  status: "Pending" | "Invoiced" | "Paid";
  paymentDate?: string;
  notes?: string;
}

// ==================== EXPENSES ====================

export interface ExpenseLineItem {
  description: string;
  buyingPrice: number;
  quantity: number;
  unit?: string;
  amount: number;
  vendorId?: string;
  vendorName?: string;
  remarks?: string;
}

export interface ExpenseChargeCategory {
  categoryName: string;
  lineItems: ExpenseLineItem[];
  subtotal: number;
}

export interface Expense {
  expenseId: string;
  bookingId: string;
  bookingType: "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";
  createdAt: string;
  updatedAt: string;

  // Source tracking
  source?: "project" | "manual";
  projectNumber?: string;
  quotationNumber?: string;

  // Detailed structure (for project expenses)
  chargeCategories?: ExpenseChargeCategory[];

  // Legacy fields (for manual expenses or backward compat)
  description: string;
  amount: number;
  currency: string;
  vendor?: string;
  expenseDate?: string;
  category?: string;
  status: "Pending" | "Approved" | "Paid";
  notes?: string;
}