// Unified Accounting Module Types for Neuron OS

// ==================== COMMON TYPES ====================

export type TransactionStatus = "pending" | "posted" | "void" | "draft";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "overdue";

// ==================== EXPENSE TYPES ====================

export interface Expense {
  id: string;
  
  // E-Voucher Link (REQUIRED - all expenses come from E-Vouchers)
  evoucher_id: string;
  evoucher_number: string; // EVRN-YYYY-XXX
  
  // Core Expense Info
  date: string; // ISO date
  vendor: string;
  category: string; // e.g., "Operating Expenses"
  sub_category: string; // e.g., "Office Rent"
  amount: number;
  currency: string; // Default: PHP
  description: string;
  
  // Project/Customer Link
  project_number?: string;
  customer_name?: string;
  
  // Requestor Info
  requestor_id: string;
  requestor_name: string;
  
  // Posting Info
  posted_by: string; // User ID who posted from E-Voucher
  posted_by_name: string;
  posted_at: string; // ISO timestamp
  
  // Status
  status: TransactionStatus; // Always "posted" when created
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ==================== COLLECTION TYPES ====================

export interface Collection {
  id: string;
  
  // E-Voucher Link (REQUIRED)
  evoucher_id: string;
  evoucher_number: string; // EVRN-YYYY-XXX
  
  // Collection Info
  collection_date: string; // ISO date
  customer_id: string;
  customer_name: string;
  amount: number;
  currency: string; // Default: PHP
  payment_method: string; // Cash, Bank Transfer, Check, etc.
  reference_number?: string; // Check number, transfer reference, etc.
  
  // Project/Invoice Link
  project_number?: string;
  invoice_number?: string;
  
  // Description
  description: string;
  notes?: string;
  
  // Received By
  received_by: string; // User ID
  received_by_name: string;
  
  // Posting Info
  posted_by: string;
  posted_by_name: string;
  posted_at: string;
  
  // Status
  status: TransactionStatus; // Always "posted" when created
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ==================== BILLING TYPES ====================

export interface Billing {
  id: string;
  
  // E-Voucher Link (REQUIRED)
  evoucher_id: string;
  evoucher_number: string; // EVRN-YYYY-XXX
  
  // Invoice Info
  invoice_number: string; // Auto-generated: INV-YYYY-XXX
  invoice_date: string; // ISO date
  due_date: string; // ISO date
  
  // Customer Info
  customer_id: string;
  customer_name: string;
  customer_address?: string;
  customer_contact?: string;
  
  // Project/Booking Link
  project_number?: string;
  booking_id?: string;
  
  // Billing Details
  line_items: BillingLineItem[];
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency: string; // Default: PHP
  
  // Payment Info
  payment_terms?: string; // e.g., "Net 30"
  payment_status: PaymentStatus;
  amount_paid: number;
  amount_due: number;
  
  // Description
  description: string;
  notes?: string;
  
  // Created By
  created_by: string;
  created_by_name: string;
  
  // Posting Info
  posted_by: string;
  posted_by_name: string;
  posted_at: string;
  
  // Status
  status: TransactionStatus; // Always "posted" when created
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface BillingLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

// ==================== LEDGER TYPES ====================

export interface LedgerEntry {
  id: string;
  entry_type: "expense" | "collection" | "billing"; // Which module
  reference_id: string; // ID of expense/collection/billing
  evoucher_id: string;
  evoucher_number: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  customer_name?: string;
  vendor_name?: string;
  project_number?: string;
  created_at: string;
}

// ==================== API RESPONSE TYPES ====================

export interface AccountingAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AccountingListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  filtered?: number;
}

// ==================== FILTER TYPES ====================

export interface ExpenseFilters {
  date_from?: string;
  date_to?: string;
  category?: string;
  vendor?: string;
  project_number?: string;
  search?: string;
}

export interface CollectionFilters {
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  payment_method?: string;
  project_number?: string;
  search?: string;
}

export interface BillingFilters {
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  payment_status?: PaymentStatus | "all";
  project_number?: string;
  search?: string;
}
