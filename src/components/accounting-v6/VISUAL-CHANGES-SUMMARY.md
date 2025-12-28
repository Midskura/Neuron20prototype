# Accounting Module Visual Changes Summary

## Header Section

### Before ❌
```
┌─────────────────────────────────────────────────────────────┐
│ Accounting                                    [+ New Billing]│
│ Log all money in and money out...                           │
│ Open Accounting Reports ▾                                    │
│                                                              │
│ [Billings] [Collections] [Expenses]                         │
└─────────────────────────────────────────────────────────────┘
```

### After ✅
```
┌─────────────────────────────────────────────────────────────┐
│ Accounting                                    [+ New Billing]│
│ Log all money in and money out across companies and bookings│
│                                                              │
│ [Billings] [Collections] [Expenses]                         │
└─────────────────────────────────────────────────────────────┘
```

**Changes:**
- Removed "Open Accounting Reports ▾" link
- Cleaner, more focused header
- Pill navbar immediately follows subtitle

---

## Table Interaction

### Before ❌
```
┌──────────────────────────────────────────────────────────────┐
│ Invoice Date │ Invoice No.  │ Booking No.      │ Client ... │
├──────────────┼──────────────┼──────────────────┼────────────┤
│ Oct 15       │ [IN-2025-001]│ [FCL-IMP-00012] →│ Shoe Mart..│
│ Oct 18       │ [IN-2025-002]│ [LCL-EXP-00045] →│ Global Tech│
└──────────────┴──────────────┴──────────────────┴────────────┘
```
- Only invoice number and booking number were clickable (blue buttons)
- No visual feedback on row hover
- No way to access full billing details directly

### After ✅
```
┌──────────────────────────────────────────────────────────────┐
│ Invoice Date │ Invoice No.  │ Booking No.      │ Client ... │
├──────────────┼──────────────┼──────────────────┼────────────┤
│░Oct 15       │ IN-2025-001  │ FCL-IMP-00012 →  │ Shoe Mart..│ ← Entire row clickable
│ Oct 18       │ IN-2025-002  │ LCL-EXP-00045 →  │ Global Tech│
└──────────────┴──────────────┴──────────────────┴────────────┘
   ↑ Light gray background on hover (#F5F6FA)
```
- **Entire row is clickable** - click anywhere to open file
- **Hover state**: Light gray background with smooth transition
- **Cursor changes** to pointer on hover
- Invoice numbers still visually blue, booking numbers blue with arrow
- Clicking row opens full Billing/Collection/Expense file view

---

## File View Modals (NEW)

### Billing File View
```
┌─────────────────────────────────────────────────────────────┐
│ Billing: IN-2025-001                        [Paid]      [X] │
│ Linked to Booking: FCL-IMP-00012-SEA                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────┐ ┌──────────────────────┐  │
│ │ Billing & Client Information│ │ Billing Summary      │  │
│ │                             │ │                      │  │
│ │ • Client Name               │ │ Client: Shoe Mart... │  │
│ │ • Billing Date              │ │ Date: Oct 15         │  │
│ │ • Billing No.               │ │ Booking: FCL-IMP...  │  │
│ │ • Booking Ref               │ │ Status: [Paid]       │  │
│ │ • Company                   │ │                      │  │
│ │ • Bill To / Attention To    │ │ ──────────────────   │  │
│ │                             │ │ Billed: ₱125,000     │  │
│ │ Particulars:                │ │ Collected: ₱125,000  │  │
│ │ [Ocean Freight + Handling]  │ │ Balance: ₱0          │  │
│ │                             │ │                      │  │
│ │ Itemized Charges:           │ │ ──────────────────   │  │
│ │ ┌─────────────────────────┐ │ │                      │  │
│ │ │Item │Desc      │Amount  │ │ │ [Download Excel]     │  │
│ │ │Ocean│Shanghai..│₱125,000│ │ │ [Print to SOA]       │  │
│ │ └─────────────────────────┘ │ │ [Post to Accounting] │  │
│ └─────────────────────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Collection File View
```
┌─────────────────────────────────────────────────────────────┐
│ Collection: OR-2025-001          [Fully Applied]        [X] │
│ Collection Date: Oct 20                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────┐ ┌──────────────────────┐  │
│ │ Collection Details          │ │ Collection Summary   │  │
│ │                             │ │                      │  │
│ │ • OR / Receipt No.          │ │ Client: Shoe Mart... │  │
│ │ • Collection Date           │ │ Date: Oct 20         │  │
│ │ • Client                    │ │ Method: Check        │  │
│ │ • Company                   │ │                      │  │
│ │ • Payment Method            │ │ ──────────────────   │  │
│ │ • Check No. / Bank Ref      │ │ Total Received:      │  │
│ │                             │ │ ₱75,000 (large)      │  │
│ │ Applied To Invoices:        │ │                      │  │
│ │ ┌─────────────────────────┐ │ │ Total Applied:       │  │
│ │ │Inv#│Booking│Applied│Rem│ │ │ ₱75,000              │  │
│ │ │IN..│FCL-...│₱45,000│₱0 │ │ │ Unapplied: ₱0        │  │
│ │ │IN..│LCL-...│₱30,000│₱15│ │ │                      │  │
│ │ └─────────────────────────┘ │ │ ──────────────────   │  │
│ └─────────────────────────────┘ │ [Apply to Invoice]   │  │
│                                  │ [Print OR]           │  │
│                                  │ [Download Excel]     │  │
│                                  │ [Post to Accounting] │  │
│                                  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Expense File View
```
┌─────────────────────────────────────────────────────────────┐
│ Expense / Request for Payment                 [Pending] [X] │
│ Linked to Booking: FCL-IMP-00012-SEA                        │
├─────────────────────────────────────────────────────────────┤
│ [Forwarding][Operation][Brokerage][Trucking]...             │ ← Category tabs
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Expense Details                                       │  │
│ │ • Expense No.  • Date  • Company                     │  │
│ │ • For the account of: [Vendor Name]                  │  │
│ │ • Payment Channel                                     │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Particular Line Items                    [+ Add Line] │  │
│ │ ┌──────────────────────────────────────────────────┐ │  │
│ │ │Particular│Description        │Amount  │[Delete]  │ │  │
│ │ │Ocean Fr..│Shanghai to Manila │₱45,000 │   [x]    │ │  │
│ │ │Customs...│Import duties...   │₱15,000 │   [x]    │ │  │
│ │ └──────────────────────────────────────────────────┘ │  │
│ │                              Subtotal: ₱60,000       │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │Prepared │ │Noted By │ │Approved │                        │
│ │By: Juan │ │Maria... │ │   —     │                        │
│ │[Submit] │ │[Pending]│ │[Await]  │                        │
│ └─────────┘ └─────────┘ └─────────┘                        │
│                                                              │
│               [Print] [Download] [Save Draft] [Post to Acct]│
└─────────────────────────────────────────────────────────────┘
```

---

## Interaction Flow

### Before ❌
```
User Journey (Billing):
1. View table
2. Click invoice number link → Opens small modal or inline edit?
3. Limited actions available
4. Need to navigate multiple times to see full context
```

### After ✅
```
User Journey (Billing):
1. View table with all billings
2. Hover over row → See visual feedback (light gray bg)
3. Click anywhere on row → Full Billing File opens
4. See complete context:
   - All billing details
   - Client information
   - Itemized charges
   - Financial summary
   - Linked booking (clickable)
5. Perform actions:
   - Download Excel
   - Print invoice
   - Post to accounting
   - Save as draft
6. Click X or outside → Back to table
```

---

## Design Consistency

### Colors Used

**Status Pills:**
- **Paid/Posted/Fully Applied**: `#E8F5E9` bg, `#10b981` text
- **Partial/Partially Applied**: `#FEF3C7` bg, `#F59E0B` text
- **Draft/Unapplied**: `#F3F4F6` bg, `#6B7280` text
- **Pending**: `#FEF3C7` bg, `#F59E0B` text

**Interactive Elements:**
- **Row hover**: `#F5F6FA` (same as Bookings)
- **Primary action**: `#F25C05` → `#E55304` hover
- **Link blue**: `#0F5EFE`
- **Borders**: `#E6E9F0`

### Typography Hierarchy
- **Modal title**: 20px, weight 600, `#0A1D4D`
- **Section headers**: 16px, weight 600, `#0A1D4D`
- **Subsection headers**: 14px, weight 600, `#0A1D4D`
- **Labels**: 11px, uppercase, tracking-wide, `#6B7280`
- **Body text**: 13-14px, `#1F2937` or `#0A1D4D`
- **Large amounts**: 20-24px, weight 700

### Spacing System
- **Modal padding**: 24-32px
- **Card padding**: 24px
- **Inner card padding**: 16-24px
- **Grid gaps**: 24px (outer), 16px (inner)
- **Field gaps**: 24px
- **Button spacing**: 12px between

---

## Benefits

### User Experience
✅ **Faster navigation** - One click to see full details
✅ **Better context** - All information in one view
✅ **Consistent UX** - Matches Bookings, Clients modules
✅ **Visual feedback** - Clear hover states
✅ **Larger click targets** - Entire row vs small button

### Developer Experience
✅ **Modular components** - Easy to maintain
✅ **Reusable patterns** - Same modal structure
✅ **Type safety** - Full TypeScript support
✅ **Extensible** - Easy to add new actions

### Design System
✅ **Consistent colors** - Same palette across modules
✅ **Consistent spacing** - 8px grid system
✅ **Consistent typography** - Same font sizes/weights
✅ **Consistent interactions** - Same hover/click patterns
✅ **Consistent components** - Shadcn UI throughout

---

## Next Steps

### Short-term Enhancements
- [ ] Add keyboard shortcuts (Esc to close, ← → to navigate)
- [ ] Add "Previous/Next" navigation in file views
- [ ] Implement actual booking navigation
- [ ] Add loading states

### Medium-term Enhancements
- [ ] Add edit mode to file views
- [ ] Implement inline field editing
- [ ] Add document attachments
- [ ] Add comment/note sections

### Long-term Enhancements
- [ ] Add print preview
- [ ] Add email functionality
- [ ] Add bulk actions (select multiple rows)
- [ ] Add export to PDF
- [ ] Add audit trail/history
