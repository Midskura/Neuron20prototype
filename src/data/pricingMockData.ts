import type { Inquiry, Quotation, Vendor, PricingUser, Project, QuotationNew } from "../types/pricing";

// ============================================
// PRICING USERS
// ============================================

export const mockPricingUsers: PricingUser[] = [
  {
    id: "pu1",
    name: "Maria Santos",
    email: "maria.santos@neuron.ph",
    role: "Pricing Manager"
  },
  {
    id: "pu2",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@neuron.ph",
    role: "Pricing Officer"
  },
  {
    id: "pu3",
    name: "Ana Reyes",
    email: "ana.reyes@neuron.ph",
    role: "Pricing Officer"
  }
];

// ============================================
// INQUIRIES
// ============================================

export const mockInquiries: Inquiry[] = [];

// ============================================
// QUOTATIONS
// ============================================

export const mockQuotations: Quotation[] = [];

// ============================================
// VENDORS (NETWORK PARTNERS)
// ============================================

export const mockVendors: Vendor[] = [
  // Overseas Agents
  {
    id: "v1",
    type: "Overseas Agent",
    company_name: "Nippon Logistics Co., Ltd.",
    country: "Japan",
    territory: "East Asia",
    wca_number: "WCA-JP-001",
    contact_person: "Hiroshi Tanaka",
    contact_email: "h.tanaka@nipponlogistics.jp",
    contact_phone: "+81 3 1234 5678",
    services_offered: ["Forwarding", "Brokerage"],
    total_shipments: 45,
    created_at: "2024-01-15T10:00:00",
    notes: "Preferred partner for Japan routes"
  },
  {
    id: "v2",
    type: "Overseas Agent",
    company_name: "Shanghai Express Freight",
    country: "China",
    territory: "East Asia",
    wca_number: "WCA-CN-003",
    contact_person: "Li Wei",
    contact_email: "liwei@shanghaiexpress.cn",
    contact_phone: "+86 21 9876 5432",
    services_offered: ["Forwarding", "Brokerage", "Trucking"],
    total_shipments: 128,
    created_at: "2023-08-20T14:30:00",
    notes: "Specialized in pharmaceutical shipments"
  },
  {
    id: "v3",
    type: "Overseas Agent",
    company_name: "Korea Shipping Partners",
    country: "South Korea",
    territory: "East Asia",
    wca_number: "WCA-KR-002",
    contact_person: "Kim Min-jun",
    contact_email: "minjun@koreashipping.kr",
    contact_phone: "+82 2 5555 7777",
    services_offered: ["Forwarding", "Marine Insurance"],
    total_shipments: 67,
    created_at: "2024-03-10T09:15:00"
  },
  // Local Agents
  {
    id: "v4",
    type: "Local Agent",
    company_name: "Manila Cold Chain Solutions",
    country: "Philippines",
    territory: "Metro Manila",
    contact_person: "Carlos Ramos",
    contact_email: "carlos@manilacoldchain.ph",
    contact_phone: "+63 2 8765 4321",
    services_offered: ["Trucking"],
    total_shipments: 89,
    created_at: "2023-11-05T11:45:00",
    notes: "Specialized in temperature-controlled transport"
  },
  {
    id: "v5",
    type: "Local Agent",
    company_name: "Cebu Logistics Hub",
    country: "Philippines",
    territory: "Visayas",
    contact_person: "Maria Santos",
    contact_email: "maria@cebulogistics.ph",
    contact_phone: "+63 32 234 5678",
    services_offered: ["Forwarding", "Trucking"],
    total_shipments: 156,
    created_at: "2023-06-18T15:20:00"
  },
  // Subcontractors
  {
    id: "v6",
    type: "Subcontractor",
    company_name: "Metro Haulers Inc.",
    country: "Philippines",
    territory: "Metro Manila",
    contact_person: "Ramon Torres",
    contact_email: "ramon@metrohaulers.ph",
    contact_phone: "+63 917 888 9999",
    services_offered: ["Trucking"],
    total_shipments: 234,
    created_at: "2023-03-22T08:30:00",
    notes: "Reliable for automotive parts transport"
  },
  {
    id: "v7",
    type: "Subcontractor",
    company_name: "North Luzon Transport Services",
    country: "Philippines",
    territory: "North Luzon",
    contact_person: "Benjamin Garcia",
    contact_email: "ben@northluzontransport.ph",
    contact_phone: "+63 920 111 2222",
    services_offered: ["Trucking"],
    total_shipments: 78,
    created_at: "2024-02-14T13:00:00",
    notes: "Covers Baguio, Pangasinan, La Union routes"
  },
  {
    id: "v8",
    type: "Subcontractor",
    company_name: "Mindanao Express Cargo",
    country: "Philippines",
    territory: "Mindanao",
    contact_person: "Abdul Rahman",
    contact_email: "abdul@mindanaoexpress.ph",
    contact_phone: "+63 82 345 6789",
    services_offered: ["Trucking", "Forwarding"],
    total_shipments: 112,
    created_at: "2023-09-30T10:45:00"
  }
];

// ============================================
// PROJECTS (Accepted Quotations - Handover to Operations)
// ============================================

export const mockProjects: Project[] = [];

// ============================================
// NEW QUOTATIONS (QuotationNew Format)
// Includes both Inquiries (status="Inquiry") and Quotations (status="Quoted"/"Sent"/etc)
// ============================================

export const mockQuotationsNew: QuotationNew[] = [];
