# Accounting Module - Desktop ERP Layout

This document describes the refactored Accounting module with top-focused navigation following modern ERP design patterns.

## Architecture Overview

The Accounting module now follows a **desktop-first ERP layout** with three distinct navigation layers:

1. **Global App Bar** (Top-level navigation)
2. **Command Bar** (Persistent accounting controls)
3. **Module Navigation** (Section tabs with icons)

---

## 1. Global App Bar

Located at the very top of the application, maintained by the existing `TopNav` component.

### Navigation Items
```
Dashboard • Bookings • Clients • Accounting
```

### Design Specs
- **Height**: 72px
- **Background**: Navy blue (#0A1D4D)
- **Text**: White
- **Position**: Fixed top

---

## 2. Command Bar

**Component**: `/components/accounting/CommandBar.tsx`

Persistent horizontal bar that appears under the Global App Bar when in the Accounting section.

### Layout Structure
```
[Company Switcher]* [Date Range] [Search] (spacer) [+ New Entry]
```

### Components

#### Company Switcher (Required)
- **Component**: `CompanySwitcher.tsx`
- **Width**: 200px
- **Icon**: Building2 (Lucide)
- **Required**: Yes - Company must be selected on all Accounting pages
- **Options**: JJB Group, JJB Subsidiary, JJB Logistics

#### Date Range Picker
- **Width**: 240px
- **Icon**: Calendar (Lucide)
- **Format**: "MMM d, yyyy - MMM d, yyyy"
- **Default**: No selection
- **Calendar**: 2-month view

#### Search Input
- **Width**: Flexible (max 400px)
- **Icon**: Search (Lucide, left side)
- **Placeholder**: "Search entries..."
- **Position**: Left-aligned search icon with padding

#### New Entry Button
- **Color**: Orange (#F25C05)
- **Icon**: Plus (Lucide)
- **Label**: "New Entry"
- **Position**: Right-aligned

### Design Specs
- **Height**: 64px (16px spacing top/bottom)
- **Background**: White
- **Border**: Bottom border (#E5E7EB)
- **Max Width**: 1200px centered
- **Padding**: 24px horizontal
- **Gap**: 12px between elements

---

## 3. Module Navigation

**Component**: `/components/accounting/ModuleNavigation.tsx`

Secondary top navigation using icon tabs with underline indicator.

### Tabs

| Tab | Icon | Route |
|-----|------|-------|
| Entries | FileText | `entries` |
| Approvals | CheckSquare | `approvals` |
| Accounts | Wallet | `accounts` |
| Categories | FolderTree | `categories` |
| Import/Export | ArrowUpDown | `import-export` |
| Clients Ledger | Users | `clients` |

### Interaction States

#### Active Tab
- **Text Color**: Orange (#F25C05)
- **Border**: 2px bottom border, Orange (#F25C05)
- **Font Weight**: Medium (500)

#### Inactive Tab
- **Text Color**: Gray (#6B7280)
- **Border**: None
- **Hover**: Text color changes to (#374151)

### Design Specs
- **Height**: 48px
- **Background**: White
- **Border**: Bottom border (#E5E7EB)
- **Max Width**: 1200px centered
- **Padding**: 24px horizontal
- **Tab Padding**: 16px horizontal
- **Gap**: Icon to label = 8px
- **Font Size**: 14px
- **Icon Size**: 16px (w-4 h-4)

---

## Layout Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ Global App Bar (Dashboard • Bookings • Clients...  │ 72px
├─────────────────────────────────────────────────────┤
│ Command Bar [Company] [Date] [Search] ... [+ New]  │ 64px
├─────────────────────────────────────────────────────┤
│ Module Nav  Entries | Approvals | Accounts | ...   │ 48px
├─────────────────────────────────────────────────────┤
│                                                     │
│  Page Content (max-width 1200px, padding 24px)     │
│                                                     │
│  • No KPI tiles                                     │
│  • No charts                                        │
│  • Clean table-focused layout                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Canvas & Grid System

### Canvas Specifications
- **Width**: 1440px (viewport)
- **Height**: Auto (scroll)
- **Max Content Width**: 1200px (centered)
- **Page Padding**: 24px horizontal

### Grid System
- **Columns**: 12
- **Column Width**: 80px
- **Gutters**: 24px
- **Spacing Scale**: 8px increments

### Calculation
```
(80px × 12) + (24px × 11) = 960px + 264px = 1224px
With 24px padding on each side: 1224px + 48px = 1272px
Fits within 1440px viewport with margin
```

---

## Typography

Following the Inter font system with SF-like negative tracking:

| Element | Size / Line Height | Weight | Usage |
|---------|-------------------|--------|-------|
| H1 | 24px / 32px | Medium | Page titles |
| H2 | 20px / 28px | Medium | Section headers |
| Body | 14px / 20px | Regular | Main content |
| Label | 12px / 16px | Regular | Form labels, metadata |

---

## Semantic Colors

### Text Colors (CSS Variables)
```css
--text-revenue: #16a34a    /* green-600 */
--text-expense: #dc2626    /* red-600 */
--text-transfer: #374151   /* neutral-700 */
```

### Usage
- **Revenue amounts**: Green text
- **Expense amounts**: Red text
- **Transfer amounts**: Neutral gray text
- **Profit (positive)**: Green text
- **Loss (negative)**: Red text

---

## Component Standards

### Tables
- **Min Row Height**: 48px
- **Border**: 1px solid var(--border)
- **Border Radius**: var(--radius-sm) = 8px
- **Header Background**: #F9FAFB
- **Hover State**: bg-[#F9FAFB]

### Cards
- **Padding**: 16px
- **Border Radius**: var(--radius-sm) = 8px
- **Border**: 1px solid #E5E7EB

### Buttons
- **Primary**: bg-[#F25C05], Orange
- **Secondary**: Outline with border
- **Ghost**: No background, text only
- **Height**: 40px (h-10)
- **Border Radius**: var(--radius-sm) = 8px

### Form Inputs
- **Height**: 40px (h-10)
- **Border**: 1px solid #E5E7EB
- **Border Radius**: var(--radius-sm) = 8px
- **Font Size**: 14px

---

## Removed Elements

The following elements have been **removed** from the Accounting module:

❌ KPI tiles (Total Revenue, Total Expenses, etc.)
❌ Net Profit cards
❌ Charts and graphs
❌ Dashboard-style metrics
❌ Summary cards with icons

The module now focuses on:

✅ Clean, table-centric data views
✅ Efficient filtering and search
✅ Streamlined approval workflows
✅ ERP-style navigation
✅ Command-based actions

---

## State Management

### Global State (in AccountingV2)
```typescript
const [activeTab, setActiveTab] = useState("entries");
const [company, setCompany] = useState("jjb");
const [dateRange, setDateRange] = useState({});
const [searchQuery, setSearchQuery] = useState("");
```

### Persistent Filters
The Command Bar state (company, date range, search) persists across all module tabs.

### Page-Specific State
Each page component manages its own local state (filters, modals, etc.)

---

## Auto Layout

All components use Auto Layout (Flexbox/Grid) principles:

- **Flex containers** for rows and responsive spacing
- **Grid** for equal-width columns
- **Gap** instead of margins for spacing
- **Min-height** instead of fixed heights
- **Overflow** handling for tables and content

---

## Integration Points

### Parent Component
`AccountingV2` is the main container that:
1. Renders the Command Bar
2. Renders the Module Navigation
3. Manages routing between module pages
4. Passes shared state and callbacks to child pages

### Child Pages
Each module page:
- Receives necessary props from parent
- Renders its own page title (H1 + description)
- Manages page-specific state
- Uses reusable components from `/shared`

### Data Flow
```
App.tsx
  └─> AccountingV2
      ├─> CommandBar (shared state)
      ├─> ModuleNavigation (routing)
      └─> Page Components
          ├─> EntriesPage
          ├─> ApprovalsPage
          ├─> AccountsPage
          ├─> CategoriesPage
          ├─> ImportExportPage
          └─> ClientsLedgerPage
```

---

## Responsive Behavior

While the design is **desktop-first**, the layout gracefully handles different viewport widths:

- **1440px+**: Full width with centered content
- **1200px-1440px**: Content fills viewport with padding
- **< 1200px**: Horizontal scroll if needed (desktop-optimized)

Mobile responsiveness can be added in future iterations if needed.

---

## File Structure

```
/components/accounting/
├── AccountingV2.tsx          # Main container
├── CommandBar.tsx            # Persistent command controls
├── CompanySwitcher.tsx       # Company dropdown
├── ModuleNavigation.tsx      # Icon tabs with underline
├── EntriesPage.tsx           # All entries table
├── ApprovalsPage.tsx         # Pending approvals
├── AccountsPage.tsx          # Chart of accounts
├── CategoriesPage.tsx        # Category management
├── ImportExportPage.tsx      # Data import/export
├── ClientsLedgerPage.tsx     # Client financials
├── ComponentsDemo.tsx        # Component showcase
└── shared/                   # Reusable components
    ├── FilterBarSticky.tsx
    ├── TableAccountingEntries.tsx
    ├── BadgeType.tsx
    ├── ModalNewEntry.tsx
    ├── RowApprovalActions.tsx
    ├── CardAccount.tsx
    ├── ListCategories.tsx
    ├── ImportPreviewTable.tsx
    └── index.tsx
```

---

## Developer Handoff

### To implement a new accounting page:

1. Create page component in `/components/accounting/`
2. Add page to `renderContent()` switch in `AccountingV2.tsx`
3. Add tab to `ModuleNavigation.tsx` tabs array
4. Follow layout pattern:
   ```tsx
   export function NewPage() {
     return (
       <>
         <div className="mb-6">
           <h1 className="text-[#0A1D4D] mb-2">Page Title</h1>
           <p className="text-[14px] text-[#6B7280] leading-[20px]">
             Page description
           </p>
         </div>
         {/* Page content */}
       </>
     );
   }
   ```

### To add a command bar action:

1. Add state to `AccountingV2.tsx`
2. Pass handler to `CommandBar.tsx`
3. Add UI element in command bar layout
4. Handle action in page components

---

## Performance Considerations

- Command Bar renders once and persists
- Module Navigation uses simple state switching (no route changes)
- Page content only renders active tab
- Large tables should implement virtualization if needed
- Date picker uses lazy loading

---

## Accessibility

- All tabs have proper ARIA labels
- Keyboard navigation supported (Tab, Arrow keys)
- Focus indicators on all interactive elements
- Semantic HTML structure (nav, main, section)
- Color contrast meets WCAG AA standards

---

## Summary

The refactored Accounting module delivers a **modern desktop ERP experience** with:

✅ Top-focused navigation (no sidebar)
✅ Persistent command bar with essential controls
✅ Icon-based tabs with underline indicator
✅ Clean, table-centric layout
✅ 12-column grid system (80px columns, 24px gutters)
✅ Semantic color coding for financial data
✅ Consistent typography and spacing
✅ Component-based architecture
✅ Auto Layout throughout
✅ No KPI tiles or charts

The design prioritizes **data density**, **efficient workflows**, and **enterprise-grade usability**.
