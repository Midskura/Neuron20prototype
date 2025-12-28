// E-Voucher System Types

export type EVoucherStatus = 
  | "Draft"           // Initial creation
  | "Submitted"       // Submitted to Accounting
  | "Under Review"    // Accounting reviewing
  | "Approved"        // Accounting approved and categorized
  | "Rejected"        // Accounting rejected
  | "Processing"      // Payment processing
  | "Disbursed"       // Payment completed
  | "Recorded"        // Recorded in books
  | "Audited";        // Final audit complete

// GL Account Categories for Financial Statements
export type GLCategory = 
  | "Revenue"         // Income Statement - Revenue
  | "Cost of Sales"   // Income Statement - COGS
  | "Operating Expenses" // Income Statement - OpEx
  | "Assets"          // Balance Sheet - Assets
  | "Liabilities"     // Balance Sheet - Liabilities
  | "Equity";         // Balance Sheet - Equity

// Sub-categories mapped to specific GL accounts
export type GLSubCategory = {
  // Revenue sub-categories
  Revenue: 
    | "Brokerage Income"
    | "Forwarding Income"
    | "Trucking Income"
    | "Warehousing Income"
    | "Documentation Fees"
    | "Other Service Income";
  
  // Cost of Sales sub-categories
  "Cost of Sales":
    | "Brokerage Costs"
    | "Forwarding Costs"
    | "Trucking Costs"
    | "Warehousing Costs"
    | "Port Charges"
    | "Customs Duties";
  
  // Operating Expenses sub-categories
  "Operating Expenses":
    | "Salaries & Wages"
    | "Office Rent"
    | "Utilities"
    | "Marketing & Advertising"
    | "Travel & Entertainment"
    | "Office Supplies"
    | "Professional Fees"
    | "Telecommunications"
    | "Depreciation"
    | "Miscellaneous";
  
  // Assets sub-categories
  Assets:
    | "Cash & Cash Equivalents"
    | "Accounts Receivable"
    | "Inventory"
    | "Prepaid Expenses"
    | "Property & Equipment"
    | "Other Assets";
  
  // Liabilities sub-categories
  Liabilities:
    | "Accounts Payable"
    | "Accrued Expenses"
    | "Loans Payable"
    | "Other Liabilities";
  
  // Equity sub-categories
  Equity:
    | "Capital"
    | "Retained Earnings"
    | "Drawings";
};

export type PaymentMethod = "Cash" | "Bank Transfer" | "Check" | "Credit Card" | "Online Payment";

export type PaymentType = "Full" | "Partial";

export type LiquidationStatus = "Yes" | "No" | "Pending";

export interface EVoucherApprover {
  id: string;
  name: string;
  role: string;
  approved_at?: string;
  remarks?: string;
}

export interface EVoucherWorkflowHistory {
  id: string;
  timestamp: string;
  status: EVoucherStatus;
  user_name: string;
  user_role: string;
  action: string;
  remarks?: string;
}

export interface EVoucher {
  id: string;
  voucher_number: string; // e.g., EVRN-2025-001 or BR-001
  
  // Request Details
  requestor_id: string;
  requestor_name: string;
  requestor_department?: string; // BD, Operations, HR, etc.
  request_date: string;
  
  // Transaction Information (filled by requestor)
  amount: number;
  currency: string;
  purpose: string;
  description?: string;
  
  // GL Categorization (filled by Accounting during approval)
  gl_category?: GLCategory;
  gl_sub_category?: string; // Varies based on gl_category
  
  // Linking
  project_number?: string; // Booking ID
  customer_id?: string;
  customer_name?: string;
  budget_request_id?: string;
  budget_request_number?: string;
  
  // Vendor Information (filled by requestor)
  vendor_id?: string;
  vendor_name: string;
  vendor_contact?: string;
  
  // Payment Terms (filled by requestor)
  credit_terms?: string;
  due_date?: string;
  payment_method?: PaymentMethod;
  payment_type?: PaymentType;
  
  // Approval Flow
  status: EVoucherStatus;
  current_approver_id?: string;
  current_approver_name?: string;
  approvers: EVoucherApprover[];
  
  // Treasury/Disbursement
  disbursement_officer_id?: string;
  disbursement_officer_name?: string;
  disbursement_date?: string;
  liquidation_status?: LiquidationStatus;
  source_of_funds?: string;
  
  // Accounting
  recorded_by_id?: string;
  recorded_by_name?: string;
  recorded_date?: string;
  
  // Audit
  audited_by_id?: string;
  audited_by_name?: string;
  audited_date?: string;
  pre_audit_remarks?: string;
  
  // Attachments & History
  attachments?: string[];
  workflow_history: EVoucherWorkflowHistory[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface EVoucherFilters {
  status?: EVoucherStatus | "all";
  gl_category?: GLCategory | "all";
  date_from?: string;
  date_to?: string;
  requestor_id?: string;
  customer_id?: string;
  search?: string;
}