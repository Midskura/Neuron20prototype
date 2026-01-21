# Quotation Builder V2 - Complete Refactor

## Overview

The Quotation Builder has been completely refactored to align with the actual database schema and business workflow. It now follows the **relay race pattern** where BD creates Inquiries that get passed to the Pricing Department for conversion into Quotations.

## Key Changes

### 1. **Relay Race Integration**
- **Before**: Quotation Builder started from scratch
- **Now**: Starts from BD Inquiry, inherits customer and service selections
- Inquiry reference displayed prominently
- Customer data pre-populated (read-only from inquiry)

### 2. **New Data Structure**

#### Services as Line Items
- Each service type (Brokerage, Forwarding, Trucking, Marine Insurance, Others) contains:
  - **Service Details**: Type-specific metadata forms
  - **Pricing Breakdown**: Line items across 6 categories

#### 6 Pricing Categories
1. **Freight**: Air Freight, Ocean Freight
2. **Origin Local Charges**: Pick Up, Handling, Documentation, VGM, etc.
3. **Destination Local Charges**: Brokerage Fee, Handling, Arrastre, Wharfage, etc.
4. **Reimbursable Charges**: Airway Bill, Bill of Lading, Handling Fee, etc.
5. **Brokerage Charges**: Entry, Clearance, Permit, Processing Fee, VAT
6. **Other Charges**: Insurance Premium, Storage, Demurrage, Detention

### 3. **Vendor Integration**
- Vendors are **entities** (Overseas Agent, Local Agent, Subcontractor)
- Each line item can be linked to a vendor
- When vendor is assigned:
  - **Buying Price**: What vendor charges (cost)
  - **Selling Price**: What you charge customer (revenue with markup)
- Margin tracking per line item

### 4. **Service Detail Forms**

Each form component is self-contained:
- Number inputs with min/max constraints
- Dropdowns use **CustomDropdown with icons** for consistency

#### Brokerage
- Subtype (Import Air, Import Ocean, Export Air, Export Ocean)
- Shipment Type (FCL, LCL, Consolidation, Break Bulk)
- Type of Entry, POD, Mode, Cargo Type
- Commodity, Declared Value
- Delivery Address, Country of Origin
- Preferential Treatment, PSIC, AEO

#### Forwarding
- Incoterms (EXW, FOB, CIF, FCA, CPT, CIP, DAP, DPU, DDP)
- Cargo Type, Mode
- Commodity, Delivery Address
- AOL, POL, AOD, POD

#### Trucking
- Pull Out Location
- Truck Type (10W, Closed Van, Refrigerated, Wing Van, AW, DW, 2W, 3W, 4Br)
- Delivery Address
- Delivery Instructions

#### Marine Insurance
- Commodity Description, HS Code
- AOL, POL, AOD, POD
- Invoice Value

#### Others
- Service Description (free text)

## Technical Implementation

### New Components

1. **QuotationBuilderV2.tsx**
   - Main container component
   - Accepts `inquiryId` prop
   - Fetches inquiry and customer data
   - Manages quotation state
   - Auto-generates quotation numbers (QN-YYYY-###)

2. **PricingBreakdown.tsx**
   - Handles all 6 pricing categories
   - Collapsible category sections
   - Line item management (add, edit, remove)
   - Predefined charge types per category
   - Vendor assignment with buying/selling prices
   - Real-time category and service subtotals

3. **Service Detail Forms V2**
   - `BrokerageFormV2.tsx`
   - `ForwardingFormV2.tsx`
   - `TruckingFormV2.tsx`
   - `MarineInsuranceFormV2.tsx`
   - `OthersFormV2.tsx`

### Updated Types (`/types/pricing.ts`)

```typescript
// New detailed service types
export interface BrokerageDetails { ... }
export interface ForwardingDetails { ... }
export interface TruckingDetails { ... }
export interface MarineInsuranceDetails { ... }
export interface OthersDetails { ... }

// New line item structure
export interface QuotationLineItem {
  id: string;
  quotation_service_id: string;
  category: ChargeCategory;
  charge_type: string;
  description?: string;
  quantity: number;
  unit: string;
  selling_price: number;
  buying_price?: number; // Only if vendor assigned
  vendor_id?: string;
  line_total: number;
}

// Quotation services with details
export interface QuotationService {
  id: string;
  quotation_id: string;
  service_type: ServiceType;
  service_subtype?: string;
  service_details: BrokerageDetails | ForwardingDetails | ...;
  line_items: QuotationLineItem[];
  subtotal: number;
}

// Updated quotation structure
export interface Quotation {
  id: string;
  quotation_number: string;
  quotation_name: string;
  inquiry_id?: string; // Link to BD inquiry
  customer_id: string;
  customer_name: string;
  credit_terms: string;
  validity: string;
  currency: string;
  services: QuotationService[];
  subtotal: number;
  total: number;
  status: QuotationStatus; // Added "Draft"
  // ... timestamps and workflow fields
}

// Predefined charge types
export const CHARGE_TYPES: Record<ChargeCategory, string[]> = { ... }
```

### Database Schema (Supabase)

```sql
-- quotations table
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_number TEXT UNIQUE NOT NULL,
  quotation_name TEXT NOT NULL,
  inquiry_id UUID REFERENCES bd_inquiries(id),
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  credit_terms TEXT,
  validity TEXT,
  valid_until TIMESTAMP,
  currency TEXT DEFAULT 'PHP',
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2),
  total DECIMAL(12, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('Draft', 'Ongoing', 'Waiting Approval', 'Approved', 'Disapproved', 'Cancelled')),
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMP,
  disapproved_by UUID,
  disapproved_at TIMESTAMP,
  disapproval_reason TEXT
);

-- quotation_services table (junction with details)
CREATE TABLE quotation_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_subtype TEXT,
  service_details JSONB NOT NULL,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- quotation_line_items table
CREATE TABLE quotation_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_service_id UUID REFERENCES quotation_services(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  charge_type TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  buying_price DECIMAL(12, 2),
  vendor_id UUID REFERENCES vendors(id),
  line_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quotations_inquiry ON quotations(inquiry_id);
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotation_services_quotation ON quotation_services(quotation_id);
CREATE INDEX idx_quotation_line_items_service ON quotation_line_items(quotation_service_id);
CREATE INDEX idx_quotation_line_items_vendor ON quotation_line_items(vendor_id);
```

## User Flow

### 1. Starting from Inquiry (Relay Race)
```
BD creates inquiry → Pricing receives notification → 
Click "Create Quotation" from inquiry → 
QuotationBuilder opens with inquiry data pre-loaded
```

### 2. Quotation Creation Flow
```
1. Quotation auto-numbered (QN-2025-042)
2. User enters Quotation Name
3. Customer inherited from inquiry (read-only)
4. Set credit terms, validity, currency
5. Services pre-selected from inquiry (can add more)
6. For each service:
   a. Fill service-specific details
   b. Add pricing line items across 6 categories
   c. Assign vendors where applicable
   d. Set buying/selling prices
7. Review summary with totals
8. Save as Draft or Generate Quotation
```

### 3. Line Item Pricing
```
For each category:
1. Click "Add Charge"
2. Select charge type (predefined list)
3. Optional: Add description
4. Enter quantity and unit
5. Enter selling price
6. Optional: Assign vendor
7. If vendor assigned: Enter buying price
8. Line total auto-calculated
```

## UI Features

### Visual Hierarchy
- **Section Numbering**: 01, 02, 03 for Basic Info, Services, Summary
- **Collapsible Sections**: Expand/collapse service details and pricing categories
- **Auto-expand**: Categories expand when adding first item
- **Visual Feedback**: Service subtotals displayed in category headers

### Form Validation
- Required fields marked with *
- Read-only fields for inherited data
- Number inputs with min/max constraints
- Dropdowns use **CustomDropdown with icons** for consistency

### Real-time Calculations
- Line item totals: `quantity × selling_price`
- Category subtotals: Sum of line items
- Service subtotals: Sum of all categories
- Quotation total: Sum of all services

### Vendor Integration
- Dropdown shows: `{company_name} ({type})`
- Buying price field only appears when vendor selected
- Yellow highlight for buying price (cost awareness)
- Margin implicit: `selling_price - buying_price`

## Status Workflow

### Quotation Statuses
1. **Draft** - Work in progress, not submitted
2. **Ongoing** - Submitted, under internal review
3. **Waiting Approval** - Pending manager approval
4. **Approved** - Ready to send to customer
5. **Disapproved** - Rejected (with reason)
6. **Cancelled** - No longer active

### Actions
- **Save as Draft**: Preserves work, can edit later
- **Generate Quotation**: Submits for workflow (status: Ongoing)

## Future Enhancements

### Phase 2
- [ ] Duplicate line items
- [ ] Bulk import line items (CSV/Excel)
- [ ] Service templates (save common configurations)
- [ ] Price history tracking
- [ ] Margin warnings (if selling < buying)

### Phase 3
- [ ] Multi-currency support with exchange rates
- [ ] PDF quotation generation
- [ ] Email quotation to customer
- [ ] Version control (revisions)
- [ ] Approval workflow notifications

### Phase 4
- [ ] Comparison view (multiple quotations)
- [ ] AI-powered price suggestions
- [ ] Competitor analysis
- [ ] Profitability analytics per quotation

## Migration Notes

### From Old to New Structure
```typescript
// Old structure
quotationData.serviceDetails.brokerage = { subType, mode, ... }
quotationData.costBreakdown.freight = [lineItems]

// New structure
quotationServices = [
  {
    service_type: "Brokerage",
    service_details: { subtype, mode, ... },
    line_items: [
      { category: "Freight", ... },
      { category: "Origin Local Charges", ... }
    ]
  }
]
```

### Backward Compatibility
- Old quotations remain viewable
- Migration script needed to convert old data
- Keep both QuotationBuilder and QuotationBuilderV2 during transition

## Testing Checklist

- [ ] Create quotation from inquiry (with pre-populated data)
- [ ] Create quotation standalone (without inquiry)
- [ ] Add/remove services
- [ ] Add/remove line items
- [ ] Assign/unassign vendors
- [ ] Calculate totals correctly
- [ ] Save as draft (preserves all data)
- [ ] Generate quotation (changes status)
- [ ] Expand/collapse categories
- [ ] Validation on required fields
- [ ] Dropdown consistency throughout

## Key Files

```
/types/pricing.ts                                    # Updated type definitions
/components/pricing/quotations/QuotationBuilderV2.tsx   # Main builder
/components/pricing/quotations/PricingBreakdown.tsx     # Line item management
/components/pricing/quotations/BrokerageFormV2.tsx      # Service forms
/components/pricing/quotations/ForwardingFormV2.tsx
/components/pricing/quotations/TruckingFormV2.tsx
/components/pricing/quotations/MarineInsuranceFormV2.tsx
/components/pricing/quotations/OthersFormV2.tsx
/components/pricing/CreateQuotation.tsx              # Entry point
/data/pricingMockData.ts                             # Mock data with vendors
```

## Design System Compliance

✅ **Neuron-style Design**
- Deep green (#12332B) and teal green (#0F766E) accents
- Pure white backgrounds
- Stroke borders (no shadows)
- Consistent padding (32px 48px)
- **CustomDropdown with icons** for all form selectors

✅ **Typography**
- Section headers: 16px, 600 weight
- Form labels: 11-12px, 500 weight
- Input text: 13px
- Button text: 13px, 600 weight

✅ **Layout**
- Grid-based forms (3 columns)
- Proper spacing and visual hierarchy
- Collapsible sections for complexity management
- Fixed footer with actions

---

**Status**: ✅ Implementation Complete  
**Last Updated**: December 13, 2025  
**Version**: 2.0.0