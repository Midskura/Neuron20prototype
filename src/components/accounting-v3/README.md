# Accounting V3 - MyMoney-Style Entry Manager

Complete refactor of the Accounting module as a lean entry manager inspired by MyMoney.

---

## 📋 Overview

**Goal**: Strip reports and rebuild as a lean entry manager focused on:
- Simple entry tracking with date grouping
- Account and category management
- No KPIs, charts, or totals
- Clean, modern interface

---

## 🎯 Key Changes from V2

### Removed
- ❌ KPI tiles (Revenue, Expenses, Net Profit)
- ❌ Charts and graphs
- ❌ Footer totals in tables
- ❌ Approvals tab
- ❌ Financials tab  
- ❌ Reports tab
- ❌ CSV Export
- ❌ Pending items section
- ❌ Complex filter bar

### Added
- ✅ Month navigator (← October 2025 →)
- ✅ Count pills (Entries • 12, Bookings • 8)
- ✅ Date-grouped vertical list
- ✅ Numeric keypad in entry sheet
- ✅ Hover actions (View, Duplicate, Post/Draft, Delete)
- ✅ Floating + button
- ✅ Simplified 3-tab layout
- ✅ Company-grouped accounts
- ✅ Income/Expense category sections

---

## 🏗️ Architecture

### Components

```
/components/accounting-v3/
├── MonthNavigator.tsx          # ← Month Year →
├── CountPills.tsx              # Entries • 12, Bookings • 8
├── FilterGroup.tsx             # Compact filters with type-ahead
├── EntriesList.tsx             # Date-grouped vertical list
├── EntrySheet.tsx              # Right drawer with keypad
├── NumericKeypad.tsx           # Calculator-style input
├── AccountsScreen.tsx          # Grouped by company
├── CategoriesScreen.tsx        # Income/Expense sections
└── README.md                   # This file

/components/
└── AccountingV3.tsx            # Main component
```

---

## 📐 Layout Specifications

### Grid System
- **12 columns**
- **24px gutters**
- **Max-width**: 1280px
- **Page padding**: 24px

### Typography
- **Page title**: h2 (existing site font)
- **Body**: body-md for lists
- **Amounts**: Tabular nums, 16px

### Buttons
- **ShadCN defaults** throughout
- **Floating +**: 56px circle, bottom-right

---

## 🎨 UI Components

### 1. Entries Screen

#### Header Row
```
┌────────────────────────────────────────────────────────────────┐
│ ← October 2025 →   Entries • 12  Bookings • 8   [Filters...]  │
└────────────────────────────────────────────────────────────────┘
```

**Left**: Month Navigator  
**Center**: Count Pills (neutral gray background)  
**Right**: Filter Group (never pushes other items)

#### Filters
- **Booking No**: Type-ahead with suggestions
- **Company**: Multi-select checkbox popover
- **Type**: Revenue, Expense, Transfer
- **Account**: Single-select
- **Category**: Single-select
- **Status**: Posted, Draft
- **Clear Filters**: Right-aligned button

#### List Items
```
┌────────────────────────────────────────────────────────────────┐
│ Mon, Oct 24                                                    │
├────────────────────────────────────────────────────────────────┤
│  ⚫  Fuel                                              -₱5,000 │
│     Cash • JJB Group                                           │
│     Booking ND-2025-001 • Diesel for long haul                │
│                                                                │
│  ⚫  Transport Services                              +₱15,000 │
│     Bank - BPI • JJB Group                                     │
│     Booking ND-2025-002 • Payment for delivery                │
└────────────────────────────────────────────────────────────────┘
```

**Anatomy**:
- Leading circular icon (category color)
- **Title**: Category name (14px, navy)
- **Sub**: Account • Company (12px, gray)
- **Second line**: Booking {bookingNo} • {note} (12px, gray)
- **Amount**: Right-aligned, red (expense) or green (revenue)

**Hover Actions** (appears on row hover):
- 👁️ View
- 📋 Duplicate
- ✓/✗ Post/Draft toggle
- 🗑️ Delete

#### Empty States
```
No entries this month
→ "No entries. Add one with +"

Zero results after filter
→ "No matches. Clear filters."
```

#### Floating Action Button
- **Position**: Fixed, bottom-right, 24px margin
- **Size**: 56px circle
- **Icon**: Plus
- **Action**: Opens Entry Sheet

---

### 2. Entry Sheet

**Type**: Right drawer (desktop), full-screen (mobile)

#### Header
```
┌─────────────────────────────────────────────────────────────┐
│ New Entry / Edit Entry                                   ✕  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Revenue] [Expense] [Transfer]  ← Segmented control     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Amount with Keypad
```
┌──────────────────────┐
│        5,000         │  ← Display
├──────────────────────┤
│  7  8  9  ÷          │
│  4  5  6  ×          │
│  1  2  3  -          │
│  0  .  =  +          │
├──────────────────────┤
│ [Clear]  [Delete]    │
└──────────────────────┘
```

**Features**:
- Calculator-style keypad
- Live evaluation (5+3×2 = 11)
- Result writes to Amount field
- Toggle to text input

#### Fields (in order)
1. **Company** (required, select)
2. **Booking No** (required, type-ahead)
3. **Account** (select)
4. **Category** (select, based on type)
5. **Date/Time** (date picker)
6. **Note** (textarea)
7. **Attachments** (dropzone)
8. **Tax** (toggle, optional)

#### Validation
```
⚠️ Booking No and Company are required.
```

#### Footer Buttons
```
[Delete]                    [Save as Draft] [Post]
 (left)                              (right)
```

**Delete**: Only shown when editing  
**Save as Draft**: Gray outline  
**Post**: Navy solid

---

### 3. Accounts Screen

#### Header
```
Manage your accounts and balances        [+ Add Account]
```

#### Grouped by Company
```
JJB Group
┌─────────────────────────────────────────────────────────┐
│ Cash                                   ₱50,000     ⋮    │
│ Default                                                 │
│                                                         │
│ Bank - BPI                            ₱120,000     ⋮    │
└─────────────────────────────────────────────────────────┘

JJB Subsidiary
┌─────────────────────────────────────────────────────────┐
│ Cash                                   ₱25,000     ⋮    │
└─────────────────────────────────────────────────────────┘
```

**Row**:
- Account name (left)
- Balance (right, tabular nums)
- Ellipsis menu (⋮)

**Menu Actions**:
- Set as Default
- Rename
- Archive (red)

#### Add Account Dialog
```
┌─────────────────────────────────────┐
│ Add Account                      ✕  │
├─────────────────────────────────────┤
│ Account Name: [e.g. Cash, Bank]    │
│ Company: [Select company]          │
│ Opening Balance: [0.00]            │
├─────────────────────────────────────┤
│        [Cancel]  [Add Account]     │
└─────────────────────────────────────┘
```

---

### 4. Categories Screen

#### Two Sections
```
Income Categories                    [+ Add Income Category]
┌─────────────────────────────────────────────────────────┐
│ ⚫ Transport Services                              ⋮    │
│ ⚫ Consulting Fees                                 ⋮    │
└─────────────────────────────────────────────────────────┘

Expense Categories                   [+ Add Expense Category]
┌─────────────────────────────────────────────────────────┐
│ 🔴 Fuel                                            ⋮    │
│ 🟠 Toll Fees                                       ⋮    │
│ 🟡 Maintenance                                     ⋮    │
└─────────────────────────────────────────────────────────┘
```

**Row**:
- Colored circular icon (left)
- Category name
- Ellipsis menu (⋮)

**Menu Actions**:
- Rename
- Merge into…
- Archive (red)

#### Add Category Dialog
```
┌─────────────────────────────────────┐
│ Add Income Category              ✕  │
├─────────────────────────────────────┤
│ Category Name: [e.g. Fuel]         │
│ Color: [⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫]            │
│        15 preset colors            │
├─────────────────────────────────────┤
│        [Cancel]  [Add Category]    │
└─────────────────────────────────────┘
```

---

## 🔄 Interactions

### Entries List
✅ **Scroll Position**: Maintained when opening/closing Entry Sheet  
✅ **Filter Persistence**: Filters stay active when switching tabs and returning  
✅ **Post Action**: Instantly updates badge "Status: Posted"  
✅ **Hover Actions**: Smooth transition, appears above row  

### Entry Sheet
✅ **Debounced**: Filters debounce at 300ms  
✅ **Type-ahead**: Shows up to 5 booking suggestions  
✅ **Multi-select**: Company uses checkbox popover  
✅ **Keypad**: Evaluates expressions in real-time  

### Accounts & Categories
✅ **Inline Edit**: Rename via prompt dialog  
✅ **Confirmation**: Delete/Archive requires confirmation  
✅ **Instant Feedback**: Changes reflect immediately  

---

## 📊 State Management

### Global State
```typescript
const [activeTab, setActiveTab] = useState<"entries" | "accounts" | "categories">("entries");
const [currentDate, setCurrentDate] = useState(new Date());
const [filters, setFilters] = useState({
  bookingNo: "",
  company: [],
  type: "all",
  account: "all",
  category: "all",
  status: "all",
});
```

### Data State
```typescript
const [entries, setEntries] = useState<Entry[]>([]);
const [accounts, setAccounts] = useState<Account[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
```

### UI State
```typescript
const [isEntrySheetOpen, setIsEntrySheetOpen] = useState(false);
const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
```

---

## 🎨 Visual Style

### Colors
- **Navy**: #0A1D4D (primary actions, headings)
- **Gray**: #F9FAFB (pill backgrounds)
- **Green**: #10B981 (revenue amounts)
- **Red**: #EF4444 (expense amounts)
- **Category Colors**: 15 preset options

### Spacing
- **Row gap**: 8px (list items)
- **Section gap**: 24px (date groups)
- **Padding**: 16px (list items), 24px (page)

### Typography
- **Amounts**: Tabular nums, right-aligned
- **Dates**: 12px, gray
- **Categories**: 14px, navy
- **Notes**: 12px, gray, truncated

---

## 🚀 Usage

```tsx
import { AccountingV3 } from "./components/AccountingV3";

// In your app
<AccountingV3 />
```

That's it! No props required. All data is managed internally.

---

## 📱 Mobile Considerations

### Entry Sheet
- Desktop: Right drawer (540px width)
- Mobile: Full-screen sheet
- Keypad: Same on both (responsive grid)

### Filters
- Desktop: Horizontal row
- Mobile: Stack vertically (flex-wrap)

### Floating +
- Position: Fixed bottom-right on all screens
- Always visible, never conflicts

---

## 🧪 Testing Checklist

### Entries
- [ ] Month navigation works (← →)
- [ ] Count pills update on filter
- [ ] Type-ahead shows suggestions
- [ ] Multi-select company works
- [ ] Clear filters resets all
- [ ] Hover actions appear smoothly
- [ ] View opens sheet with data
- [ ] Duplicate creates new draft
- [ ] Post/Draft toggle instant
- [ ] Delete confirms and removes
- [ ] Floating + opens empty sheet
- [ ] Empty state shows correct message

### Entry Sheet
- [ ] Segmented control changes type
- [ ] Keypad evaluates expressions
- [ ] Toggle to text input works
- [ ] Required fields validated
- [ ] Category filtered by type
- [ ] Date picker works
- [ ] Attachments upload (UI only)
- [ ] Tax toggle works
- [ ] Save as Draft creates draft
- [ ] Post creates posted entry
- [ ] Delete removes (edit mode only)

### Accounts
- [ ] Grouped by company
- [ ] Set default works
- [ ] Rename updates name
- [ ] Archive removes account
- [ ] Add Account dialog works
- [ ] Opening balance sets balance

### Categories
- [ ] Income/Expense sections separate
- [ ] Color picker works
- [ ] Rename updates name
- [ ] Archive removes category
- [ ] Add dialogs work for both types

---

## 🎉 Summary

**Accounting V3** is a complete rewrite focused on:

✨ **Simplicity** - No charts, totals, or KPIs  
✨ **Entry Management** - Date-grouped list with quick actions  
✨ **Modern UX** - MyMoney-style interface  
✨ **Clean Layout** - 12-col grid, 1280px max-width  
✨ **Keyboard Calculator** - Numeric keypad in entry sheet  
✨ **Responsive** - Works on desktop and mobile  

**Perfect for**: Lean accounting workflows, personal finance style, focused entry tracking.

**Status**: ✅ Complete and Ready
