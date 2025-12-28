# Billing Modal Refactor - Excel-Based Layout

## Overview

The Create Billing modal has been refactored from an SOA-based 5-column table format to a simpler, Excel-based layout that matches the actual JJB invoice spreadsheet. This makes data entry more intuitive for users who are familiar with the printed invoice format.

## Key Changes

### 1. Modal Container
- **Width**: Increased from 1200px to 1320px
- **Padding**: 24px top, 28px sides, 20px bottom
- **Structure**: Fixed header + scrollable content + sticky footer

### 2. Simplified Data Model

**Before (SOA-based):**
```typescript
interface BillingLineItem {
  id: string;
  qty: number;
  unit: string;
  articles: string;
  unitPrice: number;
  amount: number;
}
```

**After (Excel-based):**
```typescript
interface BillingLineItem {
  id: string;
  description: string;
  amount: number;
}
```

**Removed fields:**
- `businessStyle`
- `tin`
- `terms`
- `accountingEntryNo`
- `costCenter`

**Added fields:**
- `notes` - For payment instructions
- `destination` - Cargo destination
- `commodity` - Type of goods
- `measurement` - Quantity/size

### 3. New Layout Structure

The form is now organized into 3 clear sections that mirror the Excel invoice:

#### Section A: Billing & Client Information (2-column grid)
**Left Column:**
- Client Name (prefilled, disabled)
- Client Address / Location (editable)

**Right Column:**
- Billing Date (date picker, default = today)
- Billing No. (auto-generated, disabled)
- Booking Ref (prefilled, disabled)

**Full Width:**
- Notes / Remarks (optional) - e.g., "Kindly make check payable to CONFORME CARGO EXPRESS"

#### Section B: Details of Cargo (3-field row in card)
- **Destination** - e.g., "Manila, Philippines"
- **Commodity** - e.g., "Personal Household Items"
- **Measurement** - e.g., "10 bxs"

Styled as a card with light background to distinguish from other sections.

Helper text: "These fields will appear under 'Details of Cargo' in the invoice."

#### Section C: Particular Charges (2-column list)
Replaced the 5-column SOA table with a simple 2-column layout:
- **Description/Particular** (col-span-8 in edit mode, flexible in view) - multiline textarea
- **Amount** (col-span-3 in edit mode, 180px in view) - numeric input with ₱ symbol

Features:
- Pre-filled with common charge: "Door-door rate (Pickup, Freight, Permits/Lodgement & Customs Formalities)"
- "+ Add charge" button to add more lines
- Delete button for each line (disabled if only 1 line remains)
- Vertical spacing: 12-14px between rows

**Grand Total:**
- Right-aligned below charges
- Bold border on top (2px, navy color)
- 18px bold text
- Auto-calculates sum of all charges

#### Payment Details Footer
Static, read-only block with bank information:
- Bank Name: BDO
- Account Name: CONFORME CARGO EXPRESS
- Account No.: 0014-8803-0454
- Branch: SM City Sucat A
- Swift Code: BNORPHMM

Styled with light background (#FAFBFC) to indicate it's informational.

### 4. Field Mapping Reference

**Excel Invoice → Form Fields:**
```
Client name (top-left)          → Client Name
Location line                   → Client Address / Location
Date (top-right)                → Billing Date
Billing No.                     → Billing No.

Details of Cargo section:
  Destination                   → Destination
  Commodity                     → Commodity
  Measurement                   → Measurement

Particular Charges table:
  Description (left column)     → lineItems[].description
  Amount (right column)         → lineItems[].amount

GRAND TOTAL                     → Auto-calculated sum

Payment instructions            → Payment Details (static)
```

**SOA Paper Generation (System-side):**
When exporting to SOA / paper format, the system will auto-generate:
- QTY = 1
- UNIT = "job"
- ARTICLES = Concatenation of cargo details + first particular charge
- UNIT PRICE = amount
- AMOUNT = amount

Users don't need to see these intermediate fields in the modal.

### 5. UX Improvements

**Before:**
- Users had to think in accounting terms (QTY, UNIT, UNIT PRICE)
- 5-column table with horizontal scrolling on smaller screens
- Fields that didn't match what appears on the invoice
- Accounting-specific fields (cost center, entry no.) mixed with billing data

**After:**
- Users only see what actually appears on the invoice
- Natural 2-column layout: description + amount
- No horizontal scrolling
- Excel-to-form mapping is 1:1
- Cleaner separation of concerns (billing data vs. accounting data)

### 6. Visual Consistency

**Maintained:**
- JJB OS colors: Navy text (#0A1D4D), Orange primary (#F25C05)
- 16px border radius for cards
- 44px input height
- Inter typography
- Consistent spacing (8px scale)

**New:**
- Wider modal (1320px) for better layout
- Card-style "Details of Cargo" section for visual hierarchy
- Muted footer block for payment details
- Thicker grand total border to match Excel emphasis

### 7. Responsive Behavior

- **Desktop (1366px+)**: Full 1320px width, 2-column grid
- **Tablet (1024-1365px)**: 1100px width, still 2-column
- **Mobile (<1024px)**: 95vw width, stacks to 1-column
- **Charges in view mode**: Responsive grid that adapts from 2-column to stacked

### 8. Default Data

Pre-filled example charge:
```typescript
{
  id: "1",
  description: "Door-door rate (Pickup, Freight, Permits/Lodgement & Customs Formalities)",
  amount: 82500,
}
```

Default notes:
```
"Kindly make check payable to CONFORME CARGO EXPRESS"
```

### 9. Footer Actions

**Height**: 76px (up from previous 56px for better touch targets)
**Buttons**:
- Left: Cancel (ghost)
- Middle: Save as Draft (outline)
- Right: Save & Generate Invoice (orange primary, 600 weight)

Sticky positioning keeps actions visible while content scrolls.

### 10. View Mode

When viewing an existing billing (`mode="view"`):
- Action buttons appear at top: Download Excel, Print to SOA, Post to Accounting
- All form fields become read-only
- Delete charge buttons hidden
- Grid layout adjusts to remove delete column space
- "Posted" status badge shown if applicable

### 11. Benefits

1. **Faster data entry** - Only encode what's on the invoice
2. **Less cognitive load** - No need to translate between SOA and Excel formats
3. **Better mobile UX** - Simpler layout adapts better to smaller screens
4. **Clearer purpose** - Modal visually reads as "filling the Excel" not "filling an accounting schema"
5. **Easier maintenance** - Fewer fields = less validation, less state management
6. **Future-proof** - Excel → SOA transformation happens server-side, can be changed without UI updates

## Migration Notes

### Breaking Changes
- `lineItems` structure changed from 5 fields to 2 fields
- Removed `businessStyle`, `tin`, `terms`, `accountingEntryNo`, `costCenter` from Billing interface
- Added `notes`, `destination`, `commodity`, `measurement` to Billing interface

### Data Migration
Existing billings with old structure will need to be transformed:
```typescript
// Old structure → New structure
{
  qty: 1,
  unit: "job",
  articles: "Door-door rate...",
  unitPrice: 82500,
  amount: 82500
}
→
{
  description: "Door-door rate...",
  amount: 82500
}
```

### Backend Requirements
When implementing the actual API:
1. Accept the simplified billing structure from frontend
2. Store cargo details (destination, commodity, measurement) in billing record
3. Generate SOA format server-side when needed:
   - Auto-set QTY=1, UNIT="job"
   - Concatenate cargo details into ARTICLES field
   - Copy amount to both UNIT_PRICE and AMOUNT
4. Store static bank details in config, not per-billing

## Files Modified

- `/components/BillingWorkspace.tsx` - Complete modal refactor
- `/components/BookingFullView.tsx` - Updated mock billings data

## Testing Checklist

- [ ] Modal opens at correct width (1320px on desktop)
- [ ] All sections render correctly
- [ ] Cargo details card shows with proper styling
- [ ] Charges can be added/removed
- [ ] Grand total calculates correctly
- [ ] Payment details footer is read-only
- [ ] Save as Draft creates draft billing
- [ ] Save & Generate Invoice creates ready-to-print billing
- [ ] View mode shows action buttons at top
- [ ] View mode disables all form fields
- [ ] Responsive layout works on tablet/mobile
- [ ] No horizontal scrolling at any viewport size
