export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  customer_id?: string;     // Link to Customer.id for proper relationships
  status: "Customer" | "MQL" | "Lead" | "Prospect";
  last_activity: string;
  created_date: string;
  updated_at: string;
  notes?: string;
  quotations?: any[]; // For detail view
}

// PD-specific minimal contact type (names only, no sensitive info)
export interface PDContact {
  id: string;
  name: string;
  company: string;
  customer_id?: string;
}