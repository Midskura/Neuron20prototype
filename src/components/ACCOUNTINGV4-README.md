# AccountingV4 - Lean Reporting-Ready Accounting Module

## Overview
AccountingV4 is a complete refactor of the Accounting module optimized for JJB's reporting requirements. It removes the separate Accounts screen and focuses on a lean, table-first approach for non-technical accounting staff.

## Three Main Tabs

### 1. Entries Tab
- **Month Navigator**: Navigate between months with count pills showing Entries, Bookings, and Approvals
- **Filters Bar**: Search, Company, Type, Category, Status, and Refresh
- **Full-Width Table** with columns:
  - Date
  - Category
  - Booking / Job No.
  - Type (Revenue/Expense/Transfer badge)
  - Company
  - Payment Channel (replaces Accounts - Cash, Petty Cash, BPI, BDO, GCash)
  - Amount
  - Status (Posted / Pending approval)
- **Entry File Sheet**: Right-side sheet with two-column layout
  - Left: General entry info (Type, Date, Company, Payment Channel, Amount, Category, Reference No., Description, Linked Booking)
  - Right: Status & Audit, Quick Profit Summary

#### Sales/Job Profit Fields (Revenue Only)
When Entry Type = Revenue, a special collapsible section appears with:
- Job No. / Job Date
- Billing No.
- Particulars
- Itemized Cost
- Expenses
- Admin Cost % (default 3)
- Collected Amount
- Collected Date (optional, for receivables)
- Toggle: "Show in Sales Profit Report"

These fields feed directly into the Sales Profit report.

### 2. Categories Tab
- Simple table to control how entries are grouped in reports
- Columns: Category Name, Type (Revenue/Expense), Company, Active (toggle)
- "+ New Category" button for quick category creation

### 3. Reports Tab
- **Three Report Types** (pill selectors):
  1. **Sales Profit**: Matches the Excel layout from the photo
  2. **Receivables**: Shows unpaid invoices with collection dates
  3. **Category Summary**: Grouped entries by category

- **Filters Bar**: Period, Company, Source (Bookings/Entries/Both)
- **Action Buttons**: Preview, Export to Excel, Print

## Report Features

### Sales Profit Report
- **Arial font** enforced throughout to match Excel aesthetic
- Color-coded columns:
  - Expenses columns: light red/pink background
  - Collected Amount: light blue/teal background
  - Gross Profit: light green background
- Legend section with CRT, MOB, PLT, OC, PCKS chips
- Summary box with:
  - PROFIT
  - LESS: COMMISSION
  - TOTAL PROFIT  
  - LESS: 10% COMMISSION FOR STAFF
  - TOTAL GROSS PROFIT
- Signature block: Prepared by / Reviewed by / Approved by

### Receivables Report
- Company logo and address header
- Table showing: Company Name, Amount, Check No./Cash, Invoice Amount, Collected Date
- Unpaid rows highlighted in light orange
- Arial font throughout

### Category Summary Report
- Clean table grouped by category
- Columns: Category, Revenue, Expense, Net
- Total row at bottom
- Arial font, professional print layout

## Print/Export Behavior
- All reports use **Arial font family** to match Excel aesthetic
- Print button triggers window.print() with proper print styles
- Export to Excel shows success toast
- Fake A4 frame in modal overlay simulates actual printing
- Letter spacing of +0.5% on numeric cells mimics Excel's cell spacing

## Key Design Decisions

1. **Removed Accounts Screen**: Payment Channel dropdown replaces the complex Accounts/Ledger concept
2. **Table-First Approach**: All data visible at a glance, drill-down on click
3. **Arial Typography**: All print/export views use Arial to perfectly match Excel documents
4. **Sales Profit Fields**: Only shown for Revenue entries, kept in a highlighted green section
5. **Status-Based Actions**: Post to Accounting button only shows for Pending entries

## Usage

```tsx
import AccountingV4 from "./components/AccountingV4";

function App() {
  return <AccountingV4 />;
}
```

AccountingV4 is self-contained with mock data and doesn't require any props.

## Files Modified
- `/components/AccountingV4.tsx` - New component (created)
- `/App.tsx` - Updated to use AccountingV4 instead of AccountingV3

## Next Steps
1. Add import statement: `import AccountingV4 from "./components/AccountingV4";` to App.tsx (line ~13)
2. Connect to real data sources (currently using mock data)
3. Implement actual Excel export functionality
4. Add more robust validation for financial fields
5. Integrate with existing booking system for linked bookings

## Design Compliance
- ✅ Navy blue (#0A1D4D) and orange (#F25C05) color scheme
- ✅ Inter typography with progressive negative tracking
- ✅ 24px Lucide icons (flat style)
- ✅ Rounded corners (8-12px)
- ✅ 8px spacing scale
- ✅ 1400px max-width content area
- ✅ Consistent status badges and pills
- ✅ Arial font for all Excel-style reports
