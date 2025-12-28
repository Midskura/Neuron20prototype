# Accounting Module - Reusable Components

This document provides comprehensive documentation for all reusable accounting components.

## Component Overview

All components are located in `/components/accounting/shared/` and follow the JJB OS design system:
- **Font**: Inter with SF-like tracking
- **Border Radius**: xs=6px, sm=8px, md=12px
- **Spacing**: 8px scale
- **Colors**: Navy (#0A1D4D), Orange (#F25C05)
- **Semantic Colors**: Revenue (green-600), Expense (red-600), Transfer (neutral-700)

## 📌 NEW Components

**See [NEW-COMPONENTS.md](./NEW-COMPONENTS.md) for detailed documentation on:**
- **CommandBarAccounting** - Persistent command bar with loading/disabled states
- **TabsAccounting** - Tab navigation with icons and disabled support
- **FilterBarSticky (Enhanced)** - Advanced filtering with autocomplete and variants

---

## 1. FilterBar.Sticky

Horizontal auto-layout filter bar with sticky positioning.

### Usage
```tsx
import { FilterBarSticky } from "./components/accounting/shared";

<FilterBarSticky
  bookingNo={bookingNo}
  client={client}
  type={type}
  status="Pending"
  onBookingNoChange={setBookingNo}
  onClientChange={setClient}
  onTypeChange={setType}
  onStatusChange={setStatus}
  onClearFilters={handleClear}
  typeOptions={[
    { value: "revenue", label: "Revenue" },
    { value: "expense", label: "Expense" },
  ]}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bookingNo` | `string` | `""` | Current booking number filter value |
| `client` | `string` | `""` | Current client filter value |
| `company` | `string` | `""` | Current company filter value |
| `type` | `string` | `""` | Current type filter value |
| `accounts` | `string[]` | `[]` | Selected account IDs |
| `categories` | `string[]` | `[]` | Selected category IDs |
| `dateRange` | `{from?: Date; to?: Date}` | - | Selected date range |
| `status` | `string` | `"Pending"` | Current status filter |
| `enteredBy` | `string` | `""` | Current user filter |
| `onClearFilters` | `() => void` | - | Clear all filters callback |

### Design Specs
- **Height**: 56px
- **Gap**: 12px (between filter components)
- **Padding**: 12px
- **Position**: Sticky, top: 0
- **Background**: White with bottom border

---

## 2. Table.AccountingEntries

Specialized table for accounting entries with all required columns.

### Usage
```tsx
import { TableAccountingEntries, AccountingEntry } from "./components/accounting/shared";

const entries: AccountingEntry[] = [
  {
    id: "1",
    bookingNo: "ND-2025-0021",
    client: "ABC Corp",
    type: "expense",
    amount: 5000,
    account: "Cash",
    category: "Fuel",
    date: "2025-10-20",
    note: "Long note that will be truncated...",
    status: "Approved",
  },
];

<TableAccountingEntries
  entries={entries}
  onView={(id) => console.log(id)}
  onEdit={(id) => console.log(id)}
  zebra={false}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entries` | `AccountingEntry[]` | **required** | Array of entry objects |
| `onView` | `(id: string) => void` | - | View entry callback |
| `onEdit` | `(id: string) => void` | - | Edit entry callback |
| `zebra` | `boolean` | `false` | Enable zebra striping |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string` | - | Error message to display |
| `emptyMessage` | `string` | `"No entries found"` | Empty state message |

### Design Specs
- **Row Height**: 48px minimum
- **Columns**: Booking No, Client, Type, Amount (right-aligned), Account, Category, Date, Note (truncated), Status, Actions
- **Note Cell**: Truncates with tooltip on hover
- **Amount Cell**: Color-coded by type (revenue=green, expense=red, transfer=neutral)

---

## 3. Badge.Type

Type badges with semantic colors.

### Usage
```tsx
import { BadgeType } from "./components/accounting/shared";

<BadgeType type="revenue" />
<BadgeType type="expense" />
<BadgeType type="transfer" />
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"revenue" \| "expense" \| "transfer"` | **required** | Entry type |
| `className` | `string` | `""` | Additional CSS classes |

### Variants
- **Revenue**: Green background, green text, green border
- **Expense**: Red background, red text, red border
- **Transfer**: Gray background, gray text, gray border

---

## 4. Modal.NewEntry

800px modal for creating new accounting entries with validation.

### Usage
```tsx
import { ModalNewEntry } from "./components/accounting/shared";

<ModalNewEntry
  open={isOpen}
  onOpenChange={setIsOpen}
  onSave={(data) => console.log(data)}
  onSaveAndNew={(data) => console.log(data)}
  companyOptions={companies}
  accountOptions={accounts}
  categoryOptions={categories}
  clientOptions={clients}
  bookingOptions={bookings}
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | ✓ | Modal open state |
| `onOpenChange` | `(open: boolean) => void` | ✓ | State change callback |
| `onSave` | `(data: FormData) => void` | ✓ | Save callback |
| `onSaveAndNew` | `(data: FormData) => void` | - | Save & New callback |
| `companyOptions` | `Array<{value, label}>` | - | Company dropdown options |
| `accountOptions` | `Array<{value, label}>` | - | Account dropdown options |
| `categoryOptions` | `Array<{value, label}>` | - | Category dropdown options |
| `clientOptions` | `Array<{value, label}>` | - | Client autocomplete options |
| `bookingOptions` | `Array<{value, label}>` | - | Booking autocomplete options |

### Design Specs
- **Width**: 800px
- **Layout**: Two-column form with 24px gap
- **Header**: Segmented control for Revenue/Expense/Transfer
- **Validation**: Inline error messages, blocking banner if no client/booking
- **Fields**:
  - **Left**: Amount (XL input), Date, Company*, Account*, Category* (not for Transfer)
  - **Right**: Client, Booking No, Target Account (Transfer only), Note, Attachment

---

## 5. Row.ApprovalActions

Approval/reject buttons with optional comment modals.

### Usage
```tsx
import { RowApprovalActions } from "./components/accounting/shared";

<RowApprovalActions
  onApprove={(comment) => console.log(comment)}
  onReject={(comment) => console.log(comment)}
  requireComment={false}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onApprove` | `(comment?: string) => void` | **required** | Approve callback |
| `onReject` | `(comment?: string) => void` | **required** | Reject callback |
| `requireComment` | `boolean` | `false` | Make comment required |
| `approveLabel` | `string` | `"Approve"` | Approve button text |
| `rejectLabel` | `string` | `"Reject"` | Reject button text |

### Behavior
- **Quick Approve**: If `requireComment=false`, approves immediately
- **Approve Modal**: Opens if `requireComment=true` or user clicks with modifier
- **Reject Modal**: Always opens to collect reason

---

## 6. Card.Account

Account card with kebab menu and balance display.

### Usage
```tsx
import { CardAccount, Account } from "./components/accounting/shared";

const account: Account = {
  id: "1",
  name: "Cash on Hand",
  type: "Asset",
  balance: 150000,
  code: "1000",
};

<CardAccount
  account={account}
  onEdit={(id) => console.log(id)}
  onDelete={(id) => console.log(id)}
  onArchive={(id) => console.log(id)}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `account` | `Account` | **required** | Account object |
| `onEdit` | `(id: string) => void` | - | Edit callback |
| `onDelete` | `(id: string) => void` | - | Delete callback |
| `onArchive` | `(id: string) => void` | - | Archive callback |
| `loading` | `boolean` | `false` | Show skeleton state |

### Design Specs
- **Balance**: Shows "Approved only" balance
- **Color Coding**: Revenue=green, Expense=red, Other=neutral
- **Menu**: Kebab menu with Edit, Archive, Delete options

---

## 7. List.Categories

Side-by-side category lists with parent relationships.

### Usage
```tsx
import { ListCategories, Category } from "./components/accounting/shared";

<ListCategories
  revenueCategories={revenueList}
  expenseCategories={expenseList}
  onEdit={(id) => console.log(id)}
  onDelete={(id) => console.log(id)}
  onAddRevenue={() => console.log("Add")}
  onAddExpense={() => console.log("Add")}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `revenueCategories` | `Category[]` | **required** | Revenue categories |
| `expenseCategories` | `Category[]` | **required** | Expense categories |
| `onEdit` | `(id: string) => void` | - | Edit callback |
| `onDelete` | `(id: string) => void` | - | Delete callback |
| `onAddRevenue` | `() => void` | - | Add revenue category |
| `onAddExpense` | `() => void` | - | Add expense category |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string` | - | Error message |

### Design Specs
- **Layout**: Two-column grid (1fr 1fr)
- **Each Row**: Name, Parent (if exists), Actions (kebab menu)
- **Actions**: Visible on hover

---

## 8. ImportPreviewTable

Import preview table with validation and commit button.

### Usage
```tsx
import { ImportPreviewTable, ImportRow } from "./components/accounting/shared";

const rows: ImportRow[] = [
  {
    line: 1,
    parsed: { date: "2025-10-20", amount: "5000", ... },
    status: "valid",
  },
  {
    line: 2,
    parsed: { ... },
    status: "error",
    error: "Missing required field: account",
  },
];

<ImportPreviewTable
  rows={rows}
  onCommit={() => console.log("Commit")}
  onCancel={() => console.log("Cancel")}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `ImportRow[]` | **required** | Parsed import rows |
| `onCommit` | `() => void` | **required** | Commit callback |
| `onCancel` | `() => void` | **required** | Cancel callback |
| `loading` | `boolean` | `false` | Show loading during commit |

### Design Specs
- **Columns**: Line, Date, Booking, Client, Type, Amount, Account, Category, Status, Error
- **Status Icons**: Valid (green check), Warning (orange triangle), Error (red circle)
- **Commit Button**: Disabled if any blocking errors exist
- **Summary Bar**: Shows count of valid, warnings, and errors

---

## State Variants

All components support the following states via props:

- **`loading`**: Shows skeleton or loading indicator
- **`error`**: Displays error state with message
- **`empty`**: Custom empty state message (where applicable)

## Import Path

```tsx
// Individual imports
import { FilterBarSticky } from "./components/accounting/shared/FilterBarSticky";

// Bulk import from index
import {
  FilterBarSticky,
  TableAccountingEntries,
  BadgeType,
  ModalNewEntry,
  RowApprovalActions,
  CardAccount,
  ListCategories,
  ImportPreviewTable,
} from "./components/accounting/shared";
```

## Demo

View all components in action:
```tsx
import { ComponentsDemo } from "./components/accounting/ComponentsDemo";
```

This demo page showcases all components with interactive examples and prop configurations.
