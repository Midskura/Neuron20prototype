# Quotation Module - Complete User Flow

## Overview

The Quotation Module in Neuron OS is part of the **Pricing Department's** workflow and implements the **relay race pattern** where Business Development (BD) creates inquiries that are handed off to Pricing for quotation creation.

---

## Module Structure

### Entry Points (Routes)
- `pricing-contacts` → Contacts list (read-only from BD)
- `pricing-customers` → Customers list (read-only from BD)
- **`pricing-quotations`** → Main quotations workflow ⭐
- `pricing-projects` → Approved quotations handed to Operations
- `pricing-vendors` → Network partners management
- `pricing-reports` → Pricing analytics

### Main Component
**`/components/Pricing.tsx`** - Container with view switching

---

## Complete User Flow: Quotations

### 📋 **STEP 1: Quotations List View**

**Component**: `QuotationsList.tsx`

#### What Users See:
- **Unified Table**: Shows both Inquiries (from BD) and Quotations together
- **Columns**:
  - Icon (Inquiry/Quotation indicator)
  - Number (INQ-YYYY-### or QN-YYYY-###)
  - Customer Name
  - Service Types (icons with badge if multiple)
  - Origin → Destination
  - Total Amount
  - Status Badge
  - Date Created

#### Status Categories:
**Inquiries** (Purple badge):
- Pending
- In Progress
- Quoted
- Declined

**Quotations** (Color-coded):
- Draft (gray) - 🆕 V2 feature
- Ongoing (amber)
- Waiting Approval (orange)
- Approved (green)
- Disapproved (red)
- Cancelled (gray)

#### Filters Available:
- Status filter (All, Inquiry, Ongoing, Waiting Approval, Approved, Disapproved, Cancelled)
- Service type multi-select (Brokerage, Forwarding, Trucking, Marine Insurance, Others)
- Search (by number, customer, origin, destination)

#### Actions:
1. **Click on Inquiry Row** → Inquiry detail panel (right side)
2. **Click on Quotation Row** → Go to Quotation Detail view
3. **"+ Create Quotation" button** → Create standalone quotation
4. **"Create Quotation" from Inquiry** → Convert inquiry to quotation (relay race)

---

### 🔄 **STEP 2A: Create from Inquiry (Relay Race Pattern)**

**Flow**: `QuotationsList` → Click Inquiry → Inquiry Panel → "Create Quotation" button

#### Inquiry Detail Panel:
- Shows inquiry details:
  - Inquiry number
  - Customer info (name, contact person)
  - Services requested
  - Origin → Destination
  - Cargo description
  - Weight/Volume estimates
  - Incoterms
  - Status
  - Created by, assigned to
  - Notes

- **Action Button**: "Create Quotation" (green button)
  - Calls `onConvertInquiry(inquiry)`
  - Sets `selectedInquiry` state
  - Opens QuotationBuilderV2

#### What Gets Pre-populated:
✅ **Inquiry Reference**: Displayed prominently at top  
✅ **Customer**: Auto-loaded, read-only (from inquiry)  
✅ **Services**: Pre-selected based on inquiry  
✅ **Service Details**: Origin, destination, cargo info inherited  

---

### 🆕 **STEP 2B: Create Standalone Quotation**

**Flow**: `QuotationsList` → "+ Create Quotation" button (top right)

#### Differences from Inquiry-based:
- No inquiry reference
- Customer must be selected manually
- Services must be selected from scratch
- All fields start empty

---

### ✏️ **STEP 3: Quotation Builder V2**

**Component**: `QuotationBuilderV2.tsx`

#### Header Section:
- Back arrow → Returns to list
- Title: "Create New Quotation" or "Edit Quotation"
- Description: Shows inquiry number if from relay race

#### **Section 01: BASIC INFORMATION**

**Fields**:
- **Quotation Name*** (text input)
  - Example: "ACM-2024-001 - Brokerage & Forwarding Services"
  - User-defined descriptive title
  
- **Quotation Number** (auto-generated, display only)
  - Format: `QN-YYYY-###`
  - Sequential numbering
  
- **Customer*** (dropdown or inherited display)
  - If from inquiry: Read-only display (gray background)
  - If standalone: Dropdown from customer database
  
- **Credit Terms*** (dropdown)
  - Options: COD, Net 15, Net 30, Net 45, Net 60
  
- **Validity*** (dropdown)
  - Options: 7 days, 15 days, 30 days, 60 days, 90 days
  
- **Currency** (dropdown)
  - Default: PHP
  - Options: PHP, USD, EUR

#### **Section 02: SERVICES & PRICING**

##### Service Selection Pills:
- Brokerage
- Forwarding
- Trucking
- Marine Insurance
- Others

**If from inquiry**: Services pre-selected and slightly disabled (can add more, can't remove)

##### For Each Selected Service (Accordion):

**Service Header**:
- Expand/collapse chevron
- Service icon + name
- Subtotal badge (if pricing added)

**Service Details Form** (type-specific):

---

###### **Brokerage Details**:
- Subtype* (dropdown): Import Air, Import Ocean, Export Air, Export Ocean
- Shipment Type* (dropdown): FCL, LCL, Consolidation, Break Bulk
- Type of Entry (text)
- POD - Port of Discharge (text)
- Mode (dropdown): Air, Ocean, Land
- Cargo Type (dropdown): General, Perishable, Hazardous, Fragile, High Value
- Commodity (text)
- Declared Value (₱) (number)
- Delivery Address (text)
- Country of Origin (text)
- Preferential Treatment (text): e.g., "ASEAN", "FTA"
- PSIC (text)
- AEO (dropdown): Yes, No

---

###### **Forwarding Details**:
- Incoterms* (dropdown): EXW, FOB, CIF, FCA, CPT, CIP, DAP, DPU, DDP
- Cargo Type* (dropdown): General, Perishable, Hazardous, Fragile, High Value
- Mode* (dropdown): Air, Ocean, Land
- Commodity* (text)
- AOL - Airport of Loading (text)
- POL - Port of Loading* (text)
- AOD - Airport of Discharge (text)
- POD - Port of Discharge* (text)
- Delivery Address (text)

---

###### **Trucking Details**:
- Pull Out Location (text)
- Truck Type* (dropdown): 10W, Closed Van, Open Truck, Refrigerated, Flatbed, Wing Van, AW, DW, 2W, 3W, 4Br
- Delivery Address* (text)
- Delivery Instructions (textarea)

---

###### **Marine Insurance Details**:
- Commodity Description* (text)
- HS Code (text)
- Invoice Value (₱)* (number)
- AOL (text)
- POL* (text)
- AOD (text)
- POD* (text)

---

###### **Others Details**:
- Service Description* (textarea)

---

##### **Pricing Breakdown** (6 Categories, Collapsible):

**Header**: ₱ PRICING BREAKDOWN

###### **Category 1: Freight**
Collapsible section with:
- Category header (expand/collapse)
- Item count badge
- Category subtotal

**Line Items Table**:
| Charge Type ▼ | Description | Qty | Unit ▼ | Selling ₱ | Vendor ▼ | Buying ₱ | Total ₱ | ✕ |
|---------------|-------------|-----|---------|-----------|----------|----------|---------|---|

**Charge Type Options**:
- Air Freight
- Ocean Freight
- Freight Surcharge
- Fuel Surcharge

**Add Charge Button**: "+ Add Charge"

---

###### **Category 2: Origin Local Charges**

**Charge Type Options**:
- Pick Up
- Handling
- Documentation
- VGM
- Palletization
- Strapping
- Fumigation
- Cold Storage

---

###### **Category 3: Destination Local Charges**

**Charge Type Options**:
- Brokerage Fee
- Handling
- Arrastre
- Wharfage
- Container Deposit
- Documentation
- Delivery

---

###### **Category 4: Reimbursable Charges**

**Charge Type Options**:
- Airway Bill
- Bill of Lading
- Handling Fee
- TEUS
- Porterage
- Container Yard Charges

---

###### **Category 5: Brokerage Charges**

**Charge Type Options**:
- Entry
- Clearance
- Permit
- Processing Fee
- VAT

---

###### **Category 6: Other Charges**

**Charge Type Options**:
- Insurance Premium
- Storage
- Demurrage
- Detention
- Miscellaneous

---

##### Line Item Interaction:

**Adding a Line Item**:
1. Click "+ Add Charge" under category
2. New row appears in table
3. Select Charge Type from dropdown
4. Optional: Add description
5. Enter quantity (number)
6. Select unit (dropdown): per shipment, per container, per CBM, per kg, per entry, per BL, per truck, per pallet, lump sum
7. Enter selling price (₱)
8. **Optional Vendor Assignment**:
   - Select vendor from dropdown
   - Shows: `{company_name} ({type})`
   - Types: Overseas Agent, Local Agent, Subcontractor
9. **If vendor assigned**: Buying price field appears (yellow background)
   - Enter buying price (cost from vendor)
   - Implicit margin: `selling_price - buying_price`
10. Line total auto-calculates: `quantity × selling_price`

**Removing a Line Item**:
- Click ✕ button on right side of row
- Confirms removal (no modal)
- Category subtotal updates

**Calculations**:
- Line Total = `quantity × selling_price`
- Category Subtotal = Sum of all line totals in category
- Service Subtotal = Sum of all category subtotals
- Quotation Total = Sum of all service subtotals

---

#### **Section 03: SUMMARY**

Displays:
- Each service with subtotal
- Grand Total (₱)
- All totals in green badges

---

### 💾 **STEP 4: Saving**

**Footer Actions** (sticky at bottom):

1. **"Cancel" button** (left)
   - Returns to list without saving
   - No confirmation modal (TODO: Add "unsaved changes" warning)

2. **"Save as Draft" button** (center)
   - Saves quotation with status: **Draft**
   - Can edit later
   - Not submitted for approval
   - Shows in list with gray badge

3. **"Generate Quotation" button** (right, green)
   - Saves quotation with status: **Ongoing**
   - Submits to workflow
   - Shows in list with amber badge
   - If from inquiry: Updates inquiry status to "Quoted"

**Data Saved**:
```typescript
{
  quotation_number: "QN-2025-042",
  quotation_name: "User-defined title",
  inquiry_id: "inq-123" (if from relay race),
  customer_id: "cust-2",
  customer_name: "Unilab",
  credit_terms: "Net 30",
  validity: "30 days",
  currency: "PHP",
  services: [
    {
      service_type: "Brokerage",
      service_details: { ... },
      line_items: [
        {
          category: "Freight",
          charge_type: "Ocean Freight",
          quantity: 1,
          unit: "per shipment",
          selling_price: 45000,
          buying_price: 38000,
          vendor_id: "v-maersk",
          line_total: 45000
        },
        // ... more line items
      ],
      subtotal: 85000
    },
    // ... more services
  ],
  subtotal: 205000,
  total: 205000,
  status: "Draft" or "Ongoing",
  created_by: "user-id",
  created_at: "2025-12-13T10:00:00"
}
```

---

### 👁️ **STEP 5: View Quotation Detail**

**Component**: `QuotationDetail.tsx`

**Flow**: Click quotation row in list → View detail

#### What's Shown:
- Quotation number and name
- Customer information
- Status badge
- Services breakdown
- All line items organized by category
- Vendor assignments
- Totals at all levels
- Created by, created date
- If approved: Approved by, date
- If disapproved: Reason

#### Actions Available:
- **Edit** (if status = Draft or Ongoing)
  - Opens QuotationBuilderV2 in edit mode
  - Pre-populates all fields
  
- **Submit for Approval** (if status = Ongoing)
  - Changes status to "Waiting Approval"
  
- **Approve** (if status = Waiting Approval, and user is manager)
  - Changes status to "Approved"
  - Creates Project (handover to Operations)
  
- **Disapprove** (if status = Waiting Approval, and user is manager)
  - Shows modal for reason
  - Changes status to "Disapproved"
  
- **Cancel** (if status != Approved)
  - Changes status to "Cancelled"

---

### 📦 **STEP 6: Projects (Handover to Operations)**

**Flow**: Approved quotation → Automatically creates Project

**Component**: `ProjectsList.tsx`, `ProjectDetail.tsx`

#### Project Statuses:
- **Pending Handover** - Documents being prepared
- **In Handover** - Ops briefing in progress
- **Handed Over** - Complete, ops has taken over

#### Handover Checklist:
- ☑ Documents prepared
- ☑ Customer notified
- ☑ Operations briefed
- ☑ Vendors confirmed

#### Project Contains:
- All quotation data (read-only)
- Assigned ops team member
- Handover notes for operations
- Customer special instructions
- Handover timeline (SLA: 48 hours from approval)

---

## Navigation Map

```
App.tsx (Route: pricing-quotations)
    ↓
Pricing.tsx (view="quotations")
    ↓
┌─────────────────────────────────────────┐
│ QuotationsList.tsx (list view)          │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Unified Table:                  │   │
│ │ - Inquiries (purple)            │   │
│ │ - Quotations (color-coded)      │   │
│ └─────────────────────────────────┘   │
│                                         │
│ Actions:                                │
│ [+ Create Quotation]                    │
│ Click Inquiry → Inquiry Panel →        │
│   [Create Quotation from Inquiry]       │
│ Click Quotation → Go to Detail          │
└─────────────────────────────────────────┘
              ↓                    ↓
     (Create Flow)          (View Flow)
              ↓                    ↓
┌─────────────────────────┐  ┌──────────────────────┐
│ CreateQuotation.tsx     │  │ QuotationDetail.tsx  │
│   ↓                     │  │                      │
│ QuotationBuilderV2.tsx  │  │ Shows all details    │
│                         │  │                      │
│ 01 - Basic Info         │  │ Actions:             │
│ 02 - Services & Pricing │  │ - Edit               │
│ 03 - Summary            │  │ - Approve            │
│                         │  │ - Disapprove         │
│ [Save Draft] [Generate] │  │ - Cancel             │
└─────────────────────────┘  └──────────────────────┘
              ↓                            ↓
       Saves to DB               (If Approved)
              ↓                            ↓
       Back to List           Creates Project (Operations)
```

---

## State Management

### Pricing.tsx States:
```typescript
view: "quotations" | "contacts" | "customers" | "projects" | "vendors" | "reports"
subView: "list" | "detail" | "create"
selectedInquiry: Inquiry | null (for relay race)
selectedQuotation: Quotation | null (for viewing)
selectedProject: Project | null
```

### QuotationBuilderV2.tsx States:
```typescript
inquiry: Inquiry | null (loaded from inquiryId)
customer: Customer | null (loaded from inquiry)
quotationNumber: string (auto-generated)
quotationName: string
creditTerms: string
validity: string
selectedServices: ServiceType[]
quotationServices: QuotationService[] (contains details + line items)
expandedServices: ServiceType[]
```

---

## Data Flow (Relay Race)

```
Business Development Module
         ↓
    Create Inquiry
         ↓
  [Inquiry: INQ-2025-123]
  Customer: Unilab
  Services: Forwarding, Brokerage
  Origin: Shanghai
  Destination: Manila
         ↓
  Status: "Pending" → Assigned to Pricing Officer
         ↓
═══════════════════════════════════════
    HAND-OFF TO PRICING MODULE
═══════════════════════════════════════
         ↓
Pricing sees inquiry in list (purple badge)
         ↓
Clicks inquiry → Views details
         ↓
"Create Quotation" button
         ↓
QuotationBuilderV2 opens with:
  ✓ Inquiry reference displayed
  ✓ Customer pre-loaded
  ✓ Services pre-selected
  ✓ Origin/destination inherited
         ↓
Pricing fills:
  - Quotation name
  - Credit terms, validity
  - Service-specific details
  - Pricing line items
  - Vendor assignments
  - Buying/selling prices
         ↓
Saves as "Ongoing"
         ↓
  [Quotation: QN-2025-042]
  Status: "Ongoing"
         ↓
Inquiry status updates: "Quoted"
         ↓
Manager approves quotation
         ↓
  Status: "Approved"
         ↓
═══════════════════════════════════════
    HAND-OFF TO OPERATIONS MODULE
═══════════════════════════════════════
         ↓
  [Project: PROJ-2025-042]
  Status: "Pending Handover"
         ↓
Pricing completes handover checklist
         ↓
Operations takes over shipment
```

---

## Key Features Summary

### ✅ Implemented in V2:
- **Relay Race Pattern**: BD Inquiry → Pricing Quotation → Ops Project
- **Auto-numbering**: Sequential QN-YYYY-### format
- **Quotation Naming**: User-defined descriptive titles
- **Service-Specific Pricing**: Each service has details + breakdown
- **6 Pricing Categories**: Organized by charge type
- **Vendor Integration**: Link vendors to line items
- **Buying/Selling Prices**: Margin tracking per line item
- **Predefined Charge Types**: Dropdown lists per category
- **Draft Saving**: Save work in progress
- **Real-time Calculations**: All levels (line, category, service, total)
- **Philippine Peso Icon**: Localized branding
- **Neuron Design System**: Deep green accents, stroke borders

### 🔜 Planned Enhancements:
- Duplicate line items
- Bulk import (CSV/Excel)
- Service templates
- Price history
- Margin warnings
- PDF generation
- Email to customer
- Version control (revisions)
- Approval workflow notifications

---

**Last Updated**: December 13, 2025  
**Module Owner**: Pricing Department  
**Status**: ✅ V2 Complete, Ready for Supabase Integration
