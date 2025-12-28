# Accounting Module: List-to-File View Update

## Overview
Updated the Accounting module (AccountingV8) to behave like the Bookings module, where clicking a list row opens a full file view for that entry. This provides a more intuitive, unified UX across the JJB OS application.

## Changes Implemented

### 1. Header Cleanup ✅
**Removed:**
- "Open Accounting Reports ▾" link under the Accounting title

**Updated Header:**
- Title: "Accounting"
- Subtitle: "Log all money in and money out across companies and bookings."
- Then immediately the pill navbar (Billings / Collections / Expenses)
- No extra links or buttons in header area

### 2. Clickable Table Rows ✅

**All three tables (Billings, Collections, Expenses) now have:**
- `onClick` handler that opens the file view for that entry
- `cursor-pointer` class for visual feedback
- `hover:bg-[#F5F6FA]` hover state (matching Bookings module)
- `transition-colors` for smooth hover animation

**Changed:**
- Removed individual button elements for invoice/receipt numbers
- Now entire row is clickable
- Links to bookings remain visually blue but are now `<span>` elements inside the clickable row

### 3. New File View Components Created ✅

#### A. BillingFileView.tsx (Already existed, manually edited by user)
**Location:** `/components/accounting-v6/BillingFileView.tsx`

**Features:**
- Full-page modal (1200px width, 90vh max-height)
- Header with Billing No., linked booking (blue clickable link), status pill, close button
- Two-column layout:
  - **Left (flex-2):** Billing & Client Information
    - Client Name, Billing Date, Billing No., Booking Ref, Company, Bill To/Attention To
    - Particulars/Cargo Details (textarea)
    - Itemized Charges table (Item, Description, Amount)
  - **Right (flex-1):** Billing Summary
    - Client, Date, Linked Booking, Status
    - Financial summary (Billed Amount, Collected, Balance)
    - Action buttons:
      - Download Excel Invoice
      - Print to SOA Paper
      - Post to Accounting (if Draft)
      - Save as Draft (if not Paid)

**Status Styles:**
- Draft: Gray (#F3F4F6 bg, #6B7280 text)
- Posted: Green (#E8F5E9 bg, #10b981 text)
- Paid: Green (#E8F5E9 bg, #10b981 text)
- Partial: Yellow (#FEF3C7 bg, #F59E0B text)

#### B. CollectionFileView.tsx (NEW)
**Location:** `/components/accounting-v6/CollectionFileView.tsx`

**Features:**
- Full-page modal (1200px width, 90vh max-height)
- Header with OR/Receipt No., collection date, status pill, close button
- Two-column layout:
  - **Left (flex-2):** Collection Details
    - OR/Receipt No., Collection Date, Client, Company
    - Payment Method, Check No./Bank Ref
    - Applied To Invoices table:
      - Invoice No., Booking No. (clickable), Amount Applied, Remaining
      - Shows which invoices this collection was applied to
  - **Right (flex-1):** Collection Summary
    - Client Name, Collection Date, Payment Method
    - Total Received (large, green)
    - Total Applied
    - Unapplied Balance (yellow if > 0, green if 0)
    - Action buttons:
      - Apply to Invoice (orange primary)
      - Print OR
      - Download Excel
      - Post to Accounting

**Status Styles:**
- Fully Applied: Green (#E8F5E9 bg, #10b981 text)
- Partially Applied: Yellow (#FEF3C7 bg, #F59E0B text)
- Unapplied: Gray (#F3F4F6 bg, #6B7280 text)

#### C. ExpenseFileView.tsx (NEW)
**Location:** `/components/accounting-v6/ExpenseFileView.tsx`

**Features:**
- Full-page modal (1200px width, 90vh max-height)
- Header with "Expense / Request for Payment", linked booking, status pill, close button
- Category tabs (pill style matching Reports/Accounting navbar):
  - Forwarding, Operation, Brokerage, Trucking, Warehouse, Admin, Accounting, Others
- Content sections:
  - **Expense Details Card:**
    - Expense No., Date, Company
    - For the account of (payee/vendor)
    - Payment Channel
  - **Particular Line Items Card:**
    - Add Line button
    - Grid layout: Particular, Description, Amount, Delete
    - Subtotal calculation at bottom
  - **Approval Cards (3 columns):**
    - Prepared By (with status: Submitted)
    - Noted By (with status: Pending/Approved/Rejected)
    - Approved By (with status: Awaiting/Approved/Rejected)
  - **Action Buttons (bottom right):**
    - Print
    - Download Excel
    - Save as Draft (if Draft status)
    - Post to Accounting (orange primary)

**Status Styles:**
- Draft: Gray (#F3F4F6 bg, #6B7280 text, label: "Draft")
- Unpaid: Yellow (#FEF3C7 bg, #F59E0B text, label: "Pending")
- Paid: Green (#E8F5E9 bg, #10b981 text, label: "Approved")

### 4. State Management ✅

**Added to AccountingV8.tsx:**
```typescript
// File view states
const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
```

**Row Click Handlers:**
- Billings: `onClick={() => setSelectedBilling(billing)}`
- Collections: `onClick={() => setSelectedCollection(collection)}`
- Expenses: `onClick={() => setSelectedExpense(expense)}`

**Close Handlers:**
- All file views: `onClose={() => setSelected[Type](null)}`

**Booking Link Handlers:**
- All file views have `onOpenBooking` callback
- Currently shows toast: `toast.info('Opening booking: ${bookingNo}')`
- In real implementation, would navigate to BookingFullView

### 5. Visual Consistency ✅

**All file views follow JJB OS design system:**
- Card borders: `#E6E9F0`
- Background: `#FFFFFF`
- Headers: `#0A1D4D`
- Input height: `44px` (h-11)
- Action buttons: Orange primary `#F26A21` → `#E55304` hover
- Border radius: `24px` for modal, `16px` for cards, `12px` for smaller cards
- Rounded buttons: `rounded-full` or `rounded-lg`
- Font sizes: 20px (title), 16px (section headers), 14px (labels), 13px (body), 11px (captions)
- Shadows: `shadow-2xl` for modals
- Status pills: `px-3 py-1.5 rounded-full text-[11px]` with color-coded backgrounds

**Hover States:**
- Table rows: `hover:bg-[#F5F6FA]` (matching Bookings)
- Buttons: Standard JJB button hover states

### 6. Imports Added ✅

**AccountingV8.tsx:**
```typescript
import { BillingFileView } from "./accounting-v6/BillingFileView";
import { CollectionFileView } from "./accounting-v6/CollectionFileView";
import { ExpenseFileView } from "./accounting-v6/ExpenseFileView";
```

**Removed:**
```typescript
ChevronDown // from lucide-react (no longer needed)
```

## Component Structure

### Billing File View Flow
1. User clicks any Billing row in table
2. `selectedBilling` state is set
3. `<BillingFileView>` renders with modal overlay
4. User can:
   - View all billing details
   - Click linked booking to open booking file
   - Download/print invoice
   - Post to accounting or save as draft
5. Click X or outside modal to close

### Collection File View Flow
1. User clicks any Collection row in table
2. `selectedCollection` state is set
3. `<CollectionFileView>` renders with modal overlay
4. User can:
   - View collection details
   - See which invoices it was applied to
   - Click invoice booking numbers to open bookings
   - Apply to new invoices
   - Print OR, download Excel, post to accounting
5. Click X or outside modal to close

### Expense File View Flow
1. User clicks any Expense row in table
2. `selectedExpense` state is set
3. `<ExpenseFileView>` renders with modal overlay
4. User can:
   - View expense details
   - Switch between category tabs
   - See line items and approval status
   - Click linked booking to open booking file
   - Print, download, save draft, or post to accounting
5. Click X or outside modal to close

## Design Tokens Used

### Colors
- Primary Navy: `#0A1D4D`
- Primary Orange: `#F26A21`, `#F25C05`, `#E55304`
- Blue Link: `#0F5EFE`
- Gray Text: `#6B7280`, `#94A3B8`, `#9CA3AF`
- Dark Text: `#1F2937`, `#0A1D4D`, `#0F172A`
- Border Gray: `#E6E9F0`, `#E5E7EB`, `#D1D5DB`
- Background Gray: `#F9FAFB`, `#FAFBFC`, `#F3F4F6`, `#F5F6FA`
- Success Green: `#10b981`, `#0E8A4E`, `#E8F5E9`
- Warning Yellow: `#F59E0B`, `#FEF3C7`
- Error Red: `#EF4444`, `#B42318`

### Spacing
- Modal padding: `32px`
- Card padding: `24px` (header), `32px` (content), `6px` (inner cards)
- Grid gaps: `6px` (field grid)
- Section gaps: `6px` (between cards), `8px` (between sections)

### Typography
- Page title: 20px, weight 600
- Section headers: 16px, weight 600
- Subsection headers: 14px, weight 600
- Body text: 13-14px, weight 400-500
- Labels: 11px, uppercase, tracking-wide, weight 600
- Captions: 10-11px

## Files Modified

1. **`/components/AccountingV8.tsx`**
   - Removed "Open Accounting Reports" link
   - Added file view state management
   - Made all table rows clickable
   - Added hover states to rows
   - Imported file view components
   - Rendered file views conditionally

2. **`/components/accounting-v6/BillingFileView.tsx`**
   - (Manually edited by user - already complete)

3. **`/components/accounting-v6/CollectionFileView.tsx`**
   - Created new component

4. **`/components/accounting-v6/ExpenseFileView.tsx`**
   - Created new component

## Testing Checklist

- [x] Header shows title and subtitle only (no extra links)
- [x] Pill navbar displays correctly
- [x] Billing rows are clickable with hover state
- [x] Collection rows are clickable with hover state
- [x] Expense rows are clickable with hover state
- [x] Clicking Billing row opens BillingFileView
- [x] Clicking Collection row opens CollectionFileView
- [x] Clicking Expense row opens ExpenseFileView
- [x] All file views show correct data
- [x] Close buttons work on all file views
- [x] Booking links in file views trigger toast (ready for navigation)
- [x] Status pills show correct colors
- [x] All action buttons are present
- [x] Layout matches JJB OS design system
- [x] Responsive behavior works (modal max-width 95vw)

## Benefits

1. **Unified UX**: Accounting now matches Bookings behavior
2. **Better Information Architecture**: Full context for each entry
3. **Fewer Clicks**: Direct access to detailed views
4. **Improved Scannability**: Entire row is clickable target
5. **Visual Consistency**: All modules feel cohesive
6. **Future-Ready**: Easy to add more actions to file views

## Future Enhancements

- Add edit mode to file views
- Implement actual booking navigation
- Add document attachments to file views
- Implement inline editing for certain fields
- Add keyboard shortcuts (Esc to close, ← → to navigate between entries)
- Add "Previous/Next" navigation within file views
- Implement print preview functionality
- Add email functionality to send invoices/receipts
