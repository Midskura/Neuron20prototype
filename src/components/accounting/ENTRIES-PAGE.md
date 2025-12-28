# Accounting / Entries (Top-Nav) - Complete Implementation

This document describes the fully implemented Entries page with top-nav layout, keyboard shortcuts, and interactive features.

---

## 📋 Overview

The Entries page is a complete, standalone accounting module that showcases the new desktop-first ERP layout with:
- ✅ Persistent CommandBarAccounting
- ✅ TabsAccounting navigation
- ✅ Sticky FilterBarSticky
- ✅ Table with footer totals
- ✅ Empty state handling
- ✅ Keyboard navigation
- ✅ Modal for create/edit
- ✅ Drawer for entry details

**File**: `/components/accounting/EntriesPageNew.tsx`

---

## 🎨 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ CommandBarAccounting (56px)                                 │
│ [Company*] [Date Range] [Search...] (spacer) [+ New Entry] │
├─────────────────────────────────────────────────────────────┤
│ TabsAccounting (44px)                                       │
│ [Entries] Approvals Accounts Categories Clients Import     │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐   │
│ │ FilterBarSticky (56px, sticky)                        │   │
│ │ [Booking] [Client] [Company] [Type] [Account] [...]  │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │                                                        │   │
│ │ Table.Entries (scrollable)                            │   │
│ │ ┌────────┬──────────┬────────┬──────┬────────┐       │   │
│ │ │ Date   │ Booking  │ Client │ Type │ Amount │ ...   │   │
│ │ ├────────┼──────────┼────────┼──────┼────────┤       │   │
│ │ │ Oct 20 │ ND-001   │ ABC    │ EXP  │ -5,000 │       │   │
│ │ │ Oct 21 │ ND-002   │ XYZ    │ REV  │+15,000 │       │   │
│ │ └────────┴──────────┴────────┴──────┴────────┘       │   │
│ │                                                        │   │
│ │ Footer Totals:                                        │   │
│ │ Total (2 entries)           Revenue: +₱15,000        │   │
│ │                             Expense:  -₱5,000         │   │
│ │                                                        │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Keyboard Shortcuts: ↑↓ Navigate | Enter View | E Edit...   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Features Implemented

### 1. Header Stack (Persistent)

#### CommandBarAccounting
- **Company Switcher** (required, marked with *)
- **Date Range Picker** (2-month calendar)
- **Search Input** (global search across all fields)
- **New Entry Button** (orange, primary action)

#### TabsAccounting
- Active tab: **Entries** (orange underline)
- Other tabs: Approvals, Accounts, Categories, Clients Ledger, Import/Export
- Icons visible by default

#### FilterBarSticky
- **Sticky positioning** - stays visible on scroll
- **Autocomplete** for Booking No and Client
- **Multi-select** for Company
- **Single-select** for Type, Account, Category, Status, Entered By
- **Date Range** picker
- **Clear Filters** button (resets all except search)

---

### 2. Table.Entries

#### Columns
| Column | Width | Alignment | Features |
|--------|-------|-----------|----------|
| Date | Auto | Left | Format: "Oct 20" |
| Booking No | Auto | Left | Navy blue, medium weight |
| Client | Auto | Left | Gray text |
| Type | Auto | Center | Badge component (Revenue/Expense/Transfer) |
| Amount | Auto | Right | Tabular nums, color-coded (+green, -red) |
| Account | Auto | Left | Gray text |
| Category | Auto | Left | Shows "—" if empty |
| Note | 200px max | Left | Truncated with ellipsis |
| Status | Auto | Left | Badge (Pending/Approved/Rejected) |

#### Row States
- **Default**: White background
- **Hover**: Light gray background (#F9FAFB)
- **Selected** (keyboard): Orange tint (#FFF7ED)
- **Cursor**: Pointer on all rows

#### Footer Totals
- **Position**: Table footer (sticky)
- **Calculation**: Based on **filtered entries only**
- **Display**: 
  - Revenue: Green, with `+` prefix
  - Expense: Red, with `-` prefix
  - Transfer: Gray, no prefix
- **Format**: Tabular nums, comma separator

---

### 3. Empty State

#### When No Entries Exist
```
┌─────────────────────────────────┐
│         [Inbox Icon]            │
│                                 │
│      No entries found           │
│  Add your first entry to start  │
│                                 │
│      [+ New Entry Button]       │
└─────────────────────────────────┘
```

#### When Filters Return No Results
```
┌─────────────────────────────────┐
│         [Inbox Icon]            │
│                                 │
│      No entries found           │
│  No entries match your filters. │
│      Try adjusting them.        │
│                                 │
│      [Clear Filters Button]     │
└─────────────────────────────────┘
```

---

### 4. Interactions

#### + New Entry Button
- **Location**: CommandBar (top right)
- **Action**: Opens `ModalNewEntry`
- **Style**: Orange (#F25C05), primary button
- **Icon**: Plus (Lucide)

#### Save → Insert Row
- **Validation**: Amount, Company, Account required
- **Action**: Creates new entry with status "Pending"
- **Insert Position**: **Top of table** (most recent first)
- **Modal**: Closes automatically
- **Form**: Resets to default values

#### Row Click → Drawer
- **Trigger**: Click anywhere on row
- **Action**: Opens `DrawerEntryDetails` from right
- **Content**: Full entry details with large amount display
- **Actions**: Edit, Approve, Reject, Delete (based on status)

#### Edit → Reopen Modal Prefilled
- **Trigger**: 
  1. Click "Edit" in drawer
  2. Press `E` key when row selected
- **Action**: Opens `ModalNewEntry` with pre-filled data
- **Title**: Changes to "Edit Entry"
- **Save**: Updates existing entry instead of creating new

---

### 5. Keyboard Navigation

#### Arrow Keys (↑↓)
- **ArrowDown**: Move selection down one row
- **ArrowUp**: Move selection up one row
- **Visual**: Selected row has orange tint background
- **Bounds**: Stops at first/last row
- **Auto-scroll**: Follows selection (browser default)

#### Enter
- **Action**: Opens drawer for selected entry
- **Same as**: Clicking the row

#### E (Edit)
- **Condition**: Entry must be "Pending"
- **Action**: Opens modal pre-filled with entry data
- **Drawer**: Closes if open

#### A (Approve)
- **Condition**: Entry must be "Pending"
- **Action**: Changes status to "Approved"
- **Visual**: Badge updates, row color changes
- **No confirmation**: Immediate action

#### R (Reject)
- **Condition**: Entry must be "Pending"
- **Action**: Changes status to "Rejected"
- **Visual**: Badge updates to red
- **No confirmation**: Immediate action

#### Delete
- **Condition**: Entry must be "Pending"
- **Action**: Deletes entry after confirmation
- **Confirmation**: Browser alert "Are you sure?"
- **Selection**: Clears after delete

#### Keyboard Shortcuts Disabled When:
- Modal is open
- Drawer is open
- Input field is focused
- Textarea is focused

---

## 🎯 Component Integration

### ModalNewEntry
```tsx
<ModalNewEntry
  open={isNewEntryOpen}
  onOpenChange={setIsNewEntryOpen}
  onSave={handleSaveEntry}
  initialData={editingEntry ? {
    type: editingEntry.type,
    amount: editingEntry.amount.toString(),
    date: new Date(editingEntry.date),
    company: "jjb",
    account: editingEntry.account,
    category: editingEntry.category,
    client: editingEntry.client,
    bookingNo: editingEntry.bookingNo,
    note: editingEntry.note,
  } : undefined}
  companyOptions={[...]}
  accountOptions={[...]}
  categoryOptions={[...]}
  clientOptions={[...]}
  bookingOptions={[...]}
/>
```

**Features**:
- Two-column layout
- Segmented control for type (Revenue/Expense/Transfer)
- Required fields marked with red asterisk
- Validation errors shown inline
- Save & New button (optional)
- Attachment upload support

### DrawerEntryDetails
```tsx
<DrawerEntryDetails
  open={isDrawerOpen}
  onOpenChange={setIsDrawerOpen}
  entry={selectedEntry}
  onEdit={handleEdit}
  onApprove={handleApprove}
  onReject={handleReject}
  onDelete={handleDelete}
/>
```

**Features**:
- Slides in from right
- Large amount display at top
- Details grid with icons
- Conditional action buttons (based on status)
- Edit, Approve, Reject buttons for Pending
- Delete button with confirmation
- Download attachment button (if present)

---

## 📊 State Management

### Global State
```typescript
const [company, setCompany] = useState("jjb");
const [dateRange, setDateRange] = useState({});
const [searchQuery, setSearchQuery] = useState("");
const [activeTab, setActiveTab] = useState("entries");
```

### Filter State
```typescript
const [filters, setFilters] = useState({
  bookingNo: "",
  client: "",
  company: [],
  type: "",
  account: "",
  category: "",
  dateRange: {},
  status: "all",
  enteredBy: "",
});
```

### Modal/Drawer State
```typescript
const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [selectedEntry, setSelectedEntry] = useState(null);
const [editingEntry, setEditingEntry] = useState(null);
```

### Keyboard Navigation State
```typescript
const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
```

### Data State
```typescript
const [entries, setEntries] = useState<AccountingEntry[]>([...]);
```

---

## 🔄 Data Flow

### Create Entry
1. User clicks "+ New Entry" button
2. `isNewEntryOpen` → `true`, `editingEntry` → `null`
3. Modal opens with empty form
4. User fills form and clicks "Save"
5. `handleSaveEntry()` creates new entry
6. Entry inserted at **top** of `entries` array
7. Status set to "Pending"
8. Modal closes, table updates

### Edit Entry
1. User clicks row or presses Enter
2. Drawer opens with entry details
3. User clicks "Edit" or presses `E`
4. `editingEntry` → current entry
5. Modal opens with pre-filled form
6. User updates and clicks "Save"
7. `handleSaveEntry()` updates existing entry
8. Entry replaced in array
9. Modal closes, table updates

### Approve/Reject
1. User selects row with keyboard
2. Presses `A` (approve) or `R` (reject)
3. Entry status updated immediately
4. Table re-renders with new badge

### Delete
1. User selects pending entry
2. Presses `Delete` key
3. Confirmation dialog appears
4. If confirmed, entry removed from array
5. Selection cleared

### Filter
1. User changes filter field
2. `filteredEntries` recalculates
3. Table shows only matching entries
4. Footer totals update for filtered set
5. If no matches, empty state shows

---

## 🎨 Styling Details

### Colors
- **Navy**: `#0A1D4D` (headings, booking numbers)
- **Orange**: `#F25C05` (primary actions, active states)
- **Gray**: `#6B7280` (secondary text)
- **Revenue**: `var(--text-revenue)` (green-600)
- **Expense**: `var(--text-expense)` (red-600)

### Typography
- **Font**: Inter with SF-like tracking
- **Sizes**: 12px (labels), 14px (body), 20px (form amounts), 32px (drawer amount)
- **Weights**: Regular (400), Medium (500)

### Spacing
- **Command Bar**: Height 56px, gap 12px, padding 12px
- **Tabs**: Height 44px, padding 12px
- **Filter Bar**: Height 56px, gap 12px, padding 12px
- **Content**: Padding 24px (px-6 py-6)
- **Max Width**: 1200px

### Border Radius
- **xs**: 6px (badges, tags)
- **sm**: 8px (inputs, buttons, cards)
- **md**: 12px (modals, panels)

---

## ♿ Accessibility

### Keyboard Support
- ✅ Full keyboard navigation (no mouse required)
- ✅ Visual focus indicators (orange row highlight)
- ✅ Escape key closes modals and drawers
- ✅ Tab navigation through form fields
- ✅ Enter key submits forms

### Screen Readers
- ✅ Semantic HTML (table, button, dialog)
- ✅ ARIA labels on icons
- ✅ Status announcements (form errors, actions)
- ✅ Proper heading hierarchy

### Visual
- ✅ Color contrast meets WCAG AA
- ✅ Required fields marked with asterisk
- ✅ Error messages in red
- ✅ Hover states on interactive elements

---

## 🚀 Usage Example

```tsx
import { EntriesPageNew } from "./components/accounting/EntriesPageNew";

export function AccountingModule() {
  return <EntriesPageNew />;
}
```

**Note**: EntriesPageNew is a complete, standalone page. It includes its own:
- CommandBarAccounting
- TabsAccounting  
- FilterBarSticky
- Content area

Do not wrap it in additional layout components.

---

## 🧪 Testing Checklist

### Layout
- [ ] Command bar persists (doesn't scroll)
- [ ] Tabs persist (doesn't scroll)
- [ ] Filter bar is sticky (scrolls then sticks)
- [ ] Content area scrolls independently
- [ ] Max-width 1200px applied
- [ ] Padding 24px on content

### Interactions
- [ ] + New Entry opens modal
- [ ] Save creates entry at top
- [ ] Row click opens drawer
- [ ] Edit button opens modal with data
- [ ] Approve changes status
- [ ] Reject changes status
- [ ] Delete removes entry

### Keyboard
- [ ] Arrow Down selects next row
- [ ] Arrow Up selects previous row
- [ ] Enter opens drawer
- [ ] E opens edit modal (pending only)
- [ ] A approves entry (pending only)
- [ ] R rejects entry (pending only)
- [ ] Delete removes entry (pending only)
- [ ] Shortcuts disabled in modal/drawer

### Filters
- [ ] Booking No autocomplete works
- [ ] Client autocomplete works
- [ ] Company multi-select works
- [ ] Status filter updates table
- [ ] Clear Filters resets all
- [ ] Footer totals match filtered data

### Empty State
- [ ] Shows "No entries" when array empty
- [ ] Shows "No matches" when filters return empty
- [ ] Button text changes appropriately
- [ ] Icon displays correctly

---

## 📦 Related Components

- **CommandBarAccounting**: `/components/accounting/shared/CommandBarAccounting.tsx`
- **TabsAccounting**: `/components/accounting/shared/TabsAccounting.tsx`
- **FilterBarSticky**: `/components/accounting/shared/FilterBarSticky.tsx`
- **ModalNewEntry**: `/components/accounting/shared/ModalNewEntry.tsx`
- **DrawerEntryDetails**: `/components/accounting/shared/DrawerEntryDetails.tsx`
- **BadgeType**: `/components/accounting/shared/BadgeType.tsx`
- **TableAccountingEntries**: `/components/accounting/shared/TableAccountingEntries.tsx`

---

## 📚 Documentation

- **Quick Start**: [QUICK-START.md](./QUICK-START.md)
- **New Components**: [NEW-COMPONENTS.md](./NEW-COMPONENTS.md)
- **Component Library**: [COMPONENTS.md](./COMPONENTS.md)
- **ERP Layout**: [ERP-LAYOUT.md](./ERP-LAYOUT.md)

---

## ✨ Summary

The Entries page demonstrates the complete desktop-first ERP workflow:

✅ **Top-Nav Layout** - CommandBar → Tabs → Sticky Filters → Content  
✅ **Keyboard Navigation** - Full arrow/hotkey support  
✅ **CRUD Operations** - Create, Read, Update, Delete with modals/drawers  
✅ **Smart Filtering** - Autocomplete, multi-select, live totals  
✅ **Empty States** - Contextual messages and actions  
✅ **Responsive Tables** - Footer totals, truncated notes, color-coded amounts  
✅ **Accessibility** - Keyboard-first, semantic HTML, WCAG AA compliant  

**Perfect for**: Enterprise accounting workflows, desktop-first SaaS applications, YC-ready logistics platforms.
