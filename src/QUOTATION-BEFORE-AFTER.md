# Quotation Builder: Before vs After

## Architecture Comparison

### BEFORE (Old Structure)

```
QuotationBuilder
├── Basic Information
│   ├── Customer (manual selection)
│   ├── Date
│   ├── Credit Terms
│   ├── Validity
│   └── Vendors (text fields)
│
├── Service Selection (checkboxes)
│   └── Show/hide detail forms
│
├── Service Details
│   ├── Brokerage Form (basic fields)
│   ├── Forwarding Form (basic fields)
│   ├── Trucking Form (basic fields)
│   ├── Marine Insurance Form (basic fields)
│   └── Others Form (basic fields)
│
└── Cost Breakdown (single flat section)
    ├── Freight
    ├── Origin Local Charges
    ├── Destination Local Charges
    ├── Reimbursable Charges
    ├── Brokerage Charges
    └── Customs Duty/VAT
```

**Issues:**
- ❌ No connection to BD Inquiries (relay race broken)
- ❌ Services treated as checkboxes with separate costs
- ❌ Single cost breakdown not linked to services
- ❌ No vendor entity integration
- ❌ No buying/selling price separation
- ❌ Vendors as text fields (not linked entities)
- ❌ No margin tracking

---

### AFTER (New Structure)

```
QuotationBuilderV2
├── Inquiry Reference (if from relay race)
│   └── Shows: Inquiry #, Customer, Route, Cargo
│
├── Quotation Header
│   ├── Auto-generated Quotation Number (QN-2025-###)
│   └── Quotation Name (user-defined title)
│
├── 01 - BASIC INFORMATION
│   ├── Customer (inherited from inquiry, read-only)
│   ├── Credit Terms (dropdown)
│   ├── Validity (dropdown)
│   └── Currency (dropdown)
│
├── 02 - SERVICES & PRICING
│   ├── Service Selection Pills
│   │   └── Pre-selected from inquiry
│   │
│   └── For Each Selected Service (accordion)
│       │
│       ├── Service Details Form (type-specific)
│       │   ├── Brokerage: Subtype, Shipment Type, POD, Mode, etc.
│       │   ├── Forwarding: Incoterms, Cargo Type, Routes (AOL/POL/AOD/POD)
│       │   ├── Trucking: Truck Type, Pickup, Delivery, Instructions
│       │   ├── Marine Insurance: Commodity, HS Code, Invoice Value, Routes
│       │   └── Others: Service Description
│       │
│       └── Pricing Breakdown (6 categories, collapsible)
│           │
│           ├── Freight
│           │   └── Line Items: [Charge Type | Description | Qty | Unit | Selling ₱ | Vendor | Buying ₱]
│           │
│           ├── Origin Local Charges
│           │   └── Line Items: [...]
│           │
│           ├── Destination Local Charges
│           │   └── Line Items: [...]
│           │
│           ├── Reimbursable Charges
│           │   └── Line Items: [...]
│           │
│           ├── Brokerage Charges
│           │   └── Line Items: [...]
│           │
│           └── Other Charges
│               └── Line Items: [...]
│
└── 03 - SUMMARY
    ├── Service Subtotals (all services)
    └── Grand Total
```

**Improvements:**
- ✅ Relay race pattern (BD → Pricing)
- ✅ Services contain both details AND pricing
- ✅ 6 organized pricing categories per service
- ✅ Vendor entity integration
- ✅ Buying/selling price separation
- ✅ Margin tracking per line item
- ✅ Real-time calculations at all levels
- ✅ Draft saving capability

---

## Data Structure Comparison

### BEFORE

```typescript
QuotationData {
  quotationNumber: string;
  quotationName: string;
  customer: string;  // Just text
  date: string;
  creditTerms: string;
  validity: string;
  vendors: {
    overseasAgent?: string;  // Text, not linked
    localAgent?: string;
    subcontractor?: string;
  };
  selectedServices: string[];
  serviceDetails: {
    brokerage?: { ... };
    forwarding?: { ... };
    // Separate from costs!
  };
  costBreakdown: {  // Single breakdown for ALL services
    freight: LineItem[];
    originLocalCharges: LineItem[];
    // No link to which service these belong to!
  };
}

LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  buyingPrice?: number;  // Optional, not linked to vendor
  sellingPrice: number;
  amount: number;
}
```

**Problems:**
- Service details and costs are separate
- One cost breakdown for all services (confusing)
- No vendor entity relationships
- No service-specific pricing
- Can't tell which costs belong to which service

---

### AFTER

```typescript
Quotation {
  id: string;
  quotation_number: string;        // Auto-generated
  quotation_name: string;          // User-defined
  inquiry_id?: string;             // ✅ Relay race link
  customer_id: string;             // ✅ Entity ID
  customer_name: string;
  credit_terms: string;
  validity: string;
  currency: string;
  
  services: QuotationService[];    // ✅ Array of services with details + pricing
  
  subtotal: number;
  total: number;
  status: QuotationStatus;         // Draft, Ongoing, Approved, etc.
  // ... workflow fields
}

QuotationService {
  id: string;
  quotation_id: string;
  service_type: ServiceType;       // Brokerage, Forwarding, etc.
  service_subtype?: string;        // Import Air, Import Ocean, etc.
  
  service_details: {               // ✅ Type-specific metadata
    // BrokerageDetails | ForwardingDetails | etc.
  };
  
  line_items: QuotationLineItem[]; // ✅ Pricing directly linked to service
  subtotal: number;                // ✅ Service-level subtotal
}

QuotationLineItem {
  id: string;
  quotation_service_id: string;    // ✅ Clear parent relationship
  category: ChargeCategory;        // ✅ One of 6 categories
  charge_type: string;             // ✅ From predefined list
  description?: string;
  quantity: number;
  unit: string;
  
  selling_price: number;           // ✅ Revenue
  buying_price?: number;           // ✅ Cost (if vendor assigned)
  vendor_id?: string;              // ✅ Linked vendor entity
  
  line_total: number;              // ✅ Auto-calculated
}
```

**Benefits:**
- Services are self-contained (details + pricing together)
- Clear parent-child relationships
- Vendor integration with margin tracking
- Supports multi-service quotations
- Each service independently calculated

---

## Workflow Comparison

### BEFORE

```
User manually creates quotation
   ↓
Selects customer from scratch
   ↓
Selects services (no context)
   ↓
Fills details for each service
   ↓
Adds costs in flat breakdown
   ↓
(Confusing which costs → which service)
   ↓
Submits quotation
```

**Pain Points:**
- No context from BD inquiry
- Manual data re-entry (customer, services, routes)
- Pricing not organized by service
- No draft saving
- No margin tracking

---

### AFTER (Relay Race)

```
BD creates Inquiry
   ↓
   [Inquiry INQ-2025-123]
   Customer: Unilab
   Services: Forwarding, Brokerage
   Route: Shanghai → Manila
   ↓
Pricing receives notification
   ↓
Click "Create Quotation" from inquiry
   ↓
QuotationBuilder opens with:
   ✅ Inquiry reference shown
   ✅ Customer pre-loaded
   ✅ Services pre-selected
   ↓
Pricing Department:
   1. Names quotation (descriptive title)
   2. Sets credit terms & validity
   3. For each service:
      a. Fills service-specific details
      b. Adds pricing line items (6 categories)
      c. Assigns vendors where needed
      d. Sets buying/selling prices
   4. Reviews summary with totals
   5. Saves as Draft OR Generates Quotation
   ↓
   [Draft saved - can edit later]
   OR
   [Quotation QN-2025-042 created]
   ↓
Inquiry status → "Quoted"
```

**Improvements:**
- ✅ Context preserved from BD
- ✅ No re-entering customer/services
- ✅ Service-specific pricing
- ✅ Draft capability
- ✅ Margin tracking with vendors
- ✅ Clear workflow progression

---

## Pricing UI Comparison

### BEFORE: Flat Cost Breakdown

```
┌─────────────────────────────────────┐
│ COST BREAKDOWN                      │
├─────────────────────────────────────┤
│                                     │
│ Freight                             │
│ [+ Add Item]                        │
│                                     │
│ Origin Local Charges                │
│ [+ Add Item]                        │
│                                     │
│ Destination Local Charges           │
│ [+ Add Item]                        │
│                                     │
│ Reimbursable Charges                │
│ [+ Add Item]                        │
│                                     │
│ Brokerage Charges                   │
│ [+ Add Item]                        │
│                                     │
│ Customs Duty/VAT                    │
│ [+ Add Item]                        │
│                                     │
│ TOTAL: ₱0.00                        │
└─────────────────────────────────────┘
```

**Issues:**
- All services share one breakdown
- No way to see per-service costs
- No vendor assignment
- No buying/selling price separation
- Confusing for multi-service quotations

---

### AFTER: Service-Specific Breakdown

```
┌─────────────────────────────────────┐
│ 02 - SERVICES & PRICING             │
├─────────────────────────────────────┤
│                                     │
│ [✓ Brokerage] [✓ Forwarding]       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ▼ Brokerage          ₱85,000    │ │
│ ├─────────────────────────────────┤ │
│ │ SERVICE DETAILS                 │ │
│ │ Subtype: Import Ocean           │ │
│ │ Shipment Type: FCL              │ │
│ │ POD: Manila South Harbor        │ │
│ │ ... (more fields)               │ │
│ │                                 │ │
│ │ PRICING BREAKDOWN               │ │
│ │                                 │ │
│ │ ▼ Freight               ₱45,000 │ │
│ │   [Charge][Desc][Qty][Unit]... │ │
│ │   Ocean Freight | 1 | per ship │ │
│ │   Selling: ₱45,000              │ │
│ │   Vendor: Maersk (Overseas)     │ │
│ │   Buying: ₱38,000               │ │
│ │   [+ Add Charge]                │ │
│ │                                 │ │
│ │ ▶ Origin Local Charges          │ │
│ │ ▶ Destination Local Charges     │ │
│ │ ▼ Brokerage Charges     ₱25,000 │ │
│ │   Entry | 1 | per entry        │ │
│ │   Selling: ₱15,000              │ │
│ │   [No vendor]                   │ │
│ │   Clearance | 1 | per entry     │ │
│ │   Selling: ₱10,000              │ │
│ │   [+ Add Charge]                │ │
│ │                                 │ │
│ │ ▶ Reimbursable Charges          │ │
│ │ ▶ Other Charges                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ▼ Forwarding        ₱120,000    │ │
│ ├─────────────────────────────────┤ │
│ │ SERVICE DETAILS                 │ │
│ │ Incoterms: CIF                  │ │
│ │ Mode: Ocean                     │ │
│ │ POL: Shanghai | POD: Manila     │ │
│ │ ... (more fields)               │ │
│ │                                 │ │
│ │ PRICING BREAKDOWN               │ │
│ │ ▼ Freight              ₱80,000  │ │
│ │   ... (line items)              │ │
│ │ ▼ Origin Local Charges ₱25,000  │ │
│ │   ... (line items)              │ │
│ │ ▼ Destination Local    ₱15,000  │ │
│ │   ... (line items)              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 03 - SUMMARY                        │
├─────────────────────────────────────┤
│ Brokerage                   ₱85,000 │
│ Forwarding                 ₱120,000 │
│ ────────────────────────────────────│
│ TOTAL                      ₱205,000 │
└─────────────────────────────────────┘
```

**Improvements:**
- ✅ Each service has its own pricing section
- ✅ Collapsible categories (manage complexity)
- ✅ Vendor assignment per line item
- ✅ Buying/selling prices visible
- ✅ Margins implicitly tracked
- ✅ Clear service subtotals
- ✅ Organized grand total

---

## Line Item Comparison

### BEFORE

```typescript
// Single line item row:
Description | Qty | Unit | Buying ₱ | Selling ₱ | Amount ₱

"Ocean freight" | 1 | shipment | 38000 | 45000 | 45000
```

**Missing:**
- Which service does this belong to?
- What category? (Freight? Brokerage?)
- Which vendor? (Just a price, no link)
- What type of charge specifically?

---

### AFTER

```typescript
// Comprehensive line item:
Charge Type ▼ | Description | Qty | Unit ▼ | Selling ₱ | Vendor ▼ | Buying ₱ | Total ₱

"Ocean Freight" | "Shanghai to Manila" | 1 | "per shipment" | 45000 | "Maersk (Overseas Agent)" | 38000 | 45000
```

**Added Value:**
- ✅ **Charge Type**: Predefined from category list
- ✅ **Vendor Dropdown**: Linked entity (company name + type)
- ✅ **Conditional Buying Price**: Only if vendor assigned
- ✅ **Auto-calculated Total**: `qty × selling_price`
- ✅ **Clear Parent**: Belongs to specific service + category

**Margin Visibility:**
```
Selling:  ₱45,000
Buying:   ₱38,000 (yellow highlight)
─────────────────
Margin:    ₱7,000 (implicit, can be calculated)
```

---

## Key Differences Summary

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| **Inquiry Link** | None | ✅ inquiry_id reference |
| **Customer** | Manual selection | ✅ Inherited from inquiry |
| **Services** | Checkboxes (no structure) | ✅ QuotationService array |
| **Service Details** | Separate from pricing | ✅ Embedded with pricing |
| **Cost Breakdown** | Single flat list | ✅ Per-service, 6 categories |
| **Vendor Integration** | Text fields | ✅ Linked entities |
| **Pricing Model** | Single price per item | ✅ Buying + Selling prices |
| **Margin Tracking** | None | ✅ Per line item |
| **Draft Saving** | No | ✅ Yes (Draft status) |
| **Auto-numbering** | Random | ✅ Sequential (QN-2025-###) |
| **Quotation Naming** | No | ✅ User-defined title |
| **Calculations** | Manual | ✅ Real-time, all levels |
| **UI Organization** | Flat, confusing | ✅ Accordion, clear hierarchy |
| **Predefined Charges** | No | ✅ Yes, per category |
| **Units** | Limited | ✅ Comprehensive list |

---

## Migration Example

### Convert Old Quotation Data

```typescript
// OLD FORMAT
const oldQuotation = {
  quotationNumber: "QT-202512-042",
  quotationName: "Unilab Pharma Shipment",
  customer: "Unilab",
  selectedServices: ["brokerage", "forwarding"],
  serviceDetails: {
    brokerage: { subType: "all-inclusive", mode: "ocean" },
    forwarding: { incoterms: "CIF", mode: "ocean" }
  },
  costBreakdown: {
    freight: [
      { description: "Ocean freight", quantity: 1, unit: "shipment", sellingPrice: 45000, amount: 45000 }
    ],
    brokerageCharges: [
      { description: "Entry", quantity: 1, unit: "entry", sellingPrice: 15000, amount: 15000 }
    ]
  }
};

// NEW FORMAT
const newQuotation = {
  quotation_number: "QN-2025-042",
  quotation_name: "Unilab Pharma Shipment",
  inquiry_id: "inq-123",              // ✅ Added
  customer_id: "cust-2",              // ✅ Entity ID
  customer_name: "Unilab",
  services: [
    {
      id: "qs-1",
      service_type: "Brokerage",
      service_subtype: "Import Ocean", // ✅ More specific
      service_details: {
        subtype: "Import Ocean",
        shipment_type: "FCL",
        mode: "Ocean",
        // ... all brokerage fields
      },
      line_items: [
        {
          category: "Brokerage Charges",  // ✅ Categorized
          charge_type: "Entry",           // ✅ Predefined type
          quantity: 1,
          unit: "per entry",
          selling_price: 15000,
          buying_price: undefined,
          vendor_id: undefined,
          line_total: 15000
        }
      ],
      subtotal: 15000
    },
    {
      id: "qs-2",
      service_type: "Forwarding",
      service_details: {
        incoterms: "CIF",
        cargo_type: "Pharmaceutical",
        mode: "Ocean",
        pol: "Shanghai Port",
        pod: "Manila South Harbor"
        // ... all forwarding fields
      },
      line_items: [
        {
          category: "Freight",
          charge_type: "Ocean Freight",
          description: "Shanghai to Manila",
          quantity: 1,
          unit: "per shipment",
          selling_price: 45000,
          buying_price: 38000,          // ✅ Cost tracked
          vendor_id: "v-maersk",        // ✅ Vendor linked
          line_total: 45000
        }
      ],
      subtotal: 45000
    }
  ],
  subtotal: 60000,
  total: 60000,
  status: "Ongoing"
};
```

---

**Conclusion**: The V2 refactor transforms the Quotation Builder from a simple form into a **comprehensive business tool** that properly implements the relay race pattern, tracks margins, integrates with vendors, and provides clear organization for complex multi-service quotations.
