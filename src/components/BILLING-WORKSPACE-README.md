# Billing Workspace - JJB OS

## Overview

The Billing Workspace is a comprehensive billing management system integrated into the Bookings detail view. It allows users to create, view, and manage billings that match the official Conforme Cargo Express invoice and Statement of Account (SOA) formats.

## Location

**File:** `/components/BillingWorkspace.tsx`  
**Integration:** Used in `/components/BookingFullView.tsx` under the "Billings" tab

## Features

### 1. Billing List
- Displays all billings linked to a specific booking
- Columns: Billing No., Date, Description/Service, Amount, Status, Actions
- Empty state when no billings exist
- Click "View" to open billing details
- Kebab menu for additional actions (Download Excel, Print SOA, Post to Accounting)

### 2. Create Billing Modal
Users can create a new billing with:

#### Section A: Billing Header Fields (2-column layout)
**Left Column:**
- Name / Client (prefilled from booking, disabled)
- Address (editable)
- Business Style (optional)
- TIN (optional)

**Right Column:**
- Date (default: today, date picker)
- Terms (Cash, 7 days, 30 days, 60 days)
- Billing No. (auto-generated: `BIL-{YYYY}-{#####}`)
- Booking Ref (prefilled from booking, disabled)

#### Section B: Line Items Table
Matches the official invoice paper columns:
- **QTY** - Quantity (numeric, 64px wide)
- **UNIT** - Unit type (text, 72px wide, e.g., "job", "box")
- **ARTICLES** - Description (multiline, flexible width)
- **UNIT PRICE** - Price per unit (numeric, right-aligned, 120px)
- **AMOUNT** - Total (auto-calculated: QTY × UNIT PRICE, read-only, 120px)

Features:
- Initial: 3 rows
- Add more rows with "+ Add line item" button
- Delete rows with trash icon
- Automatic amount calculation
- Totals section showing "TOTAL AMOUNT DUE"

#### Section C: Accounting Linkage
- Accounting Entry No. (auto-generated: `ACC-{YYYY}-{#####}`)
- Cost Center / Company (dropdown)
- Note: "Billing will be posted to Accounting after approval."

### 3. View/Manage Billing Modal
Same form as create mode, with additional action buttons:

**Action Buttons:**
1. **Download Excel Invoice**
   - Exports to official JJB Excel layout
   - Maps: Client name → Name, Address → Address, Line items → Particular charges, etc.
   - Includes bank details footer (BDO, CONFORME CARGO EXPRESS account info)

2. **Print to SOA Paper**
   - Opens print-ready layout
   - Aligned to pre-printed "STATEMENT OF ACCOUNT" form
   - Helper text reminds users to load SOA paper and set margins

3. **Post to Accounting**
   - Marks billing as "Posted"
   - Locks all editing fields
   - Billing remains viewable and printable

### 4. Status Management
**Three status states:**
- **Draft** - Light blue pill, editable
- **Ready to print** - Green pill, set when "Save & Generate Invoice" is clicked
- **Posted** - Gray pill, locked from editing, linked to accounting

## Field Mapping Reference

### Excel Invoice Mapping
```
formData.clientName      → Name
formData.clientAddress   → Address
formData.date           → Date
booking.destination      → Destination (from booking data)
booking.commodity       → Commodity (from booking data)
booking.measurement     → Measurement (from booking data)
lineItems[].articles    → Particular charges
lineItems[].amount      → Amount
totalAmount             → Grand total
Static bank details     → Footer (BDO, Account: CONFORME CARGO EXPRESS, etc.)
```

### SOA Paper Mapping
Fields are positioned to match the pre-printed "CONFORME CARGO EXPRESS - STATEMENT OF ACCOUNT" form:
```
Name         → Client name field position
Address      → Address field position
Date         → Date field position
Terms        → Terms field position
Business Style → Business Style field position
TIN          → TIN field position
QTY column   → QTY column on form
UNIT column  → UNIT column on form
ARTICLES     → ARTICLES column on form
UNIT PRICE   → UNIT PRICE column on form
AMOUNT       → AMOUNT column on form
TOTAL AMOUNT DUE → Total field at bottom right
```

## Usage in BookingFullView

```tsx
import { BillingWorkspace } from "./BillingWorkspace";

// Inside the Billings tab:
<BillingWorkspace
  booking={booking}
  billings={mockBillings}
  onCreateBilling={(billing) => {
    // Handle billing creation
  }}
  onUpdateBilling={(id, updates) => {
    // Handle billing updates
  }}
  onDeleteBilling={(id) => {
    // Handle billing deletion
  }}
  onDownloadExcel={(billing) => {
    // Generate and download Excel invoice
  }}
  onPrintSOA={(billing) => {
    // Open print preview aligned to SOA paper
  }}
  onPostToAccounting={(billing) => {
    // Post billing to accounting system
  }}
/>
```

## Design System Compliance

- **Colors:** Navy #0A1D4D, Orange #F25C05
- **Border radius:** 16px for cards, 8px for inputs
- **Spacing:** 16-20px between sections
- **Typography:** Inter font, progressive negative tracking
- **Status pills:** Rounded, light background, colored text
- **Buttons:** Orange primary, ghost/outline secondary
- **Table:** Header with uppercase 11px labels, alternating hover states

## Future Enhancements

1. **Real API integration** - Replace mock data with actual backend calls
2. **PDF generation** - Add PDF export alongside Excel
3. **Email functionality** - Send invoices directly to clients
4. **Multi-currency support** - Handle USD, EUR, etc.
5. **Recurring billings** - Template-based billing for repeat customers
6. **Batch operations** - Post multiple billings at once
7. **Approval workflow** - Add approval steps before posting
8. **Full responsive design** - Enhanced mobile/tablet layouts

## Printing Notes

When printing to SOA paper:
- Load pre-printed "STATEMENT OF ACCOUNT" form into printer
- Set printer margins to 0
- Turn off "Fit to page" option
- Use portrait orientation
- Ensure field alignment matches the pre-printed form

## Related Files

- `/components/BillingWorkspace.tsx` - Main component
- `/components/BookingFullView.tsx` - Integration point
- Future: `/utils/invoice-generator.ts` - Excel/PDF generation logic
- Future: `/utils/soa-printer.ts` - SOA print layout logic
