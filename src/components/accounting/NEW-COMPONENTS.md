# New Accounting Components Documentation

This document describes the three new specialized components created for the Accounting module: `CommandBarAccounting`, `TabsAccounting`, and the enhanced `FilterBarSticky`.

---

## 1. CommandBarAccounting

**Path**: `/components/accounting/shared/CommandBarAccounting.tsx`

A persistent command bar that appears at the top of all Accounting pages, providing global controls for company selection, date filtering, search, and creating new entries.

### Design Specifications

- **Height**: 56px
- **Padding**: 12px horizontal
- **Gap**: 12px between elements
- **Background**: White
- **Border**: Bottom border (#E5E7EB)
- **Max Width**: 1200px (centered)

### Layout Structure

```
[Company Switcher*] [Date Range] [Search...] (spacer) [+ New Entry]
```

### Props Interface

```typescript
interface CommandBarAccountingProps {
  company: string;                              // Required: Selected company value
  onCompanyChange: (value: string) => void;     // Handler for company selection
  dateRange?: { from?: Date; to?: Date };       // Optional date range
  onDateRangeChange?: (range) => void;          // Handler for date range changes
  searchQuery?: string;                         // Search input value
  onSearchChange?: (query: string) => void;     // Handler for search input
  onNewEntry?: () => void;                      // Handler for New Entry button
  companyOptions?: Array<{                      // Company dropdown options
    value: string; 
    label: string;
  }>;
  loading?: boolean;                            // Show loading state
  disabled?: boolean;                           // Disable all controls
  className?: string;                           // Additional CSS classes
}
```

### Features

- **Company Switcher** (Required)
  - 200px width
  - Building2 icon
  - Red asterisk (*) to indicate required field
  - Disabled when loading or disabled prop is true

- **Date Range Picker**
  - 240px width
  - Calendar icon
  - 2-month calendar view
  - Auto-closes when both dates selected
  - Displays formatted date range

- **Search Input**
  - Flexible width (max 400px)
  - Search icon on left
  - Placeholder: "Search entries..."
  - Full-text search capability

- **New Entry Button**
  - Orange (#F25C05) primary button
  - Plus icon
  - Shows loading spinner when loading prop is true
  - Positioned on right side with spacer

### Variant Props

- **loading** (boolean): 
  - When `true`: Shows spinner in New Entry button, disables all controls
  - When `false`: Normal state (default)

- **disabled** (boolean):
  - When `true`: Disables all controls without loading indicator
  - When `false`: Normal state (default)

### Usage Example

```tsx
import { CommandBarAccounting } from "./components/accounting/shared";

function AccountingPage() {
  const [company, setCompany] = useState("jjb");
  const [dateRange, setDateRange] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <CommandBarAccounting
        company={company}
        onCompanyChange={setCompany}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewEntry={() => console.log("Create new entry")}
        companyOptions={[
          { value: "jjb", label: "JJB Group" },
          { value: "subsidiary", label: "JJB Subsidiary" },
          { value: "logistics", label: "JJB Logistics" },
        ]}
        loading={isLoading}
        disabled={false}
      />
    </div>
  );
}
```

---

## 2. TabsAccounting

**Path**: `/components/accounting/shared/TabsAccounting.tsx`

Specialized tab navigation for the Accounting module with icon support and underline indicator.

### Design Specifications

- **Width**: 100% (full width)
- **Height**: 44px
- **Background**: White
- **Border**: Bottom border (#E5E7EB)
- **Max Width**: 1200px (centered)
- **Indicator**: 2px orange underline for active tab

### Available Tabs

| Tab Value | Label | Icon |
|-----------|-------|------|
| `entries` | Entries | FileText |
| `approvals` | Approvals | CheckSquare |
| `accounts` | Accounts | Wallet |
| `categories` | Categories | FolderTree |
| `clients` | Clients Ledger | Users |
| `import-export` | Import/Export | ArrowUpDown |

### Props Interface

```typescript
type AccountingTabValue = 
  | "entries" 
  | "approvals" 
  | "accounts" 
  | "categories" 
  | "import-export" 
  | "clients";

interface TabsAccountingProps {
  active: AccountingTabValue;                   // Currently active tab
  onTabChange: (tab: AccountingTabValue) => void; // Handler for tab changes
  disabled?: AccountingTabValue[];              // Array of disabled tabs
  showIcons?: boolean;                          // Show/hide icons (default: true)
  className?: string;                           // Additional CSS classes
}
```

### Tab States

#### Active Tab
- **Text Color**: Orange (#F25C05)
- **Border**: 2px bottom border, Orange (#F25C05)
- **Font Weight**: Medium (500)

#### Inactive Tab
- **Text Color**: Gray (#6B7280)
- **Border**: None
- **Hover**: Text color changes to (#374151)
- **Cursor**: Pointer

#### Disabled Tab
- **Text Color**: Light gray (#D1D5DB)
- **Border**: None
- **Cursor**: Not allowed
- **Non-interactive**: Cannot be clicked

### Variant Props

- **disabled** (array): 
  - Array of tab values to disable
  - Example: `["import-export", "clients"]`
  - Default: `[]` (none disabled)

- **showIcons** (boolean):
  - When `true`: Shows icons next to labels (default)
  - When `false`: Shows labels only

### Usage Example

```tsx
import { TabsAccounting, AccountingTabValue } from "./components/accounting/shared";

function AccountingModule() {
  const [activeTab, setActiveTab] = useState<AccountingTabValue>("entries");

  return (
    <div>
      <TabsAccounting
        active={activeTab}
        onTabChange={setActiveTab}
        disabled={["import-export"]}
        showIcons={true}
      />
      {/* Page content based on activeTab */}
    </div>
  );
}
```

---

## 3. FilterBarSticky (Enhanced)

**Path**: `/components/accounting/shared/FilterBarSticky.tsx`

A comprehensive filter bar that sticks below the tabs, providing advanced filtering capabilities with autocomplete, multi-select, and variant modes.

### Design Specifications

- **Height**: 56px
- **Padding**: 12px horizontal (default) or 8px (compact)
- **Gap**: 12px (default) or 8px (compact)
- **Position**: Sticky
- **Background**: White
- **Border**: Bottom border (#E5E7EB)
- **Z-index**: 10

### Filter Fields

| Field | Type | Width | Features |
|-------|------|-------|----------|
| Booking No | Input | 140px | Autocomplete with suggestions |
| Client | Input | 140px | Autocomplete with suggestions |
| Company | Multi-select | 140px | Checkbox popover, shows count |
| Type | Select | 140px | Dropdown (Revenue/Expense/Transfer) |
| Account | Select | 140px | Optional, dropdown |
| Category | Select | 140px | Optional, dropdown |
| Date Range | Date picker | 180px | 2-month calendar |
| Status | Select | 140px | Dropdown, can be locked |
| Entered By | Select | 140px | Optional, dropdown |
| Clear Filters | Button | Auto | Ghost button with X icon |

### Props Interface

```typescript
type FilterBarVariant = "default" | "compact" | "locked-status";

interface FilterBarStickyProps {
  // Values
  bookingNo?: string;
  client?: string;
  company?: string[];                           // Multi-select
  type?: string;
  account?: string;
  category?: string;
  dateRange?: { from?: Date; to?: Date };
  status?: string;                              // Default: "Pending"
  enteredBy?: string;
  
  // Change handlers
  onBookingNoChange?: (value: string) => void;
  onClientChange?: (value: string) => void;
  onCompanyChange?: (values: string[]) => void; // Array for multi-select
  onTypeChange?: (value: string) => void;
  onAccountChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onDateRangeChange?: (range) => void;
  onStatusChange?: (value: string) => void;
  onEnteredByChange?: (value: string) => void;
  onClearFilters?: () => void;
  
  // Options for selects
  bookingNoOptions?: string[];                  // For autocomplete
  clientOptions?: string[];                     // For autocomplete
  companyOptions?: Array<{ value: string; label: string }>;
  typeOptions?: Array<{ value: string; label: string }>;
  accountOptions?: Array<{ value: string; label: string }>;
  categoryOptions?: Array<{ value: string; label: string }>;
  statusOptions?: Array<{ value: string; label: string }>;
  userOptions?: Array<{ value: string; label: string }>;
  
  // Variant and styling
  variant?: FilterBarVariant;
  className?: string;
}
```

### Variants

#### 1. Default Variant
```tsx
<FilterBarSticky variant="default" />
```
- Standard spacing (gap: 12px, padding: 12px)
- Field width: 140px
- Date range width: 180px
- All fields enabled and interactive

#### 2. Compact Variant
```tsx
<FilterBarSticky variant="compact" />
```
- Reduced spacing (gap: 8px, padding: 8px)
- Field width: 120px
- Date range width: 160px
- Optimized for dense layouts

#### 3. Locked Status Variant
```tsx
<FilterBarSticky variant="locked-status" status="Pending" />
```
- Standard spacing
- Status field is **locked** and cannot be changed
- Status field has gray background (#F9FAFB)
- Clear Filters button will not reset status
- Use case: Approvals page where status must remain "Pending"

### Autocomplete Features

#### Booking No Autocomplete
- Shows dropdown with up to 5 matching suggestions
- Filters based on partial match (case-insensitive)
- Suggestions appear on focus and typing
- Click suggestion to auto-fill
- Closes when clicking outside

#### Client Autocomplete
- Same behavior as Booking No
- Filters client list based on input
- Shows matching clients in dropdown
- Click to select

### Multi-Select Company

- Opens popover with checkbox list
- Shows count: "2 Companies" or "1 Company"
- Checkboxes use orange (#F25C05) when selected
- Click item to toggle selection
- Updates parent state with array of values

### Usage Examples

#### Basic Usage (Default)
```tsx
import { FilterBarSticky } from "./components/accounting/shared";

function EntriesPage() {
  const [filters, setFilters] = useState({
    bookingNo: "",
    client: "",
    company: [],
    type: "",
    status: "Pending",
  });

  return (
    <FilterBarSticky
      bookingNo={filters.bookingNo}
      onBookingNoChange={(value) => 
        setFilters({ ...filters, bookingNo: value })
      }
      client={filters.client}
      onClientChange={(value) => 
        setFilters({ ...filters, client: value })
      }
      company={filters.company}
      onCompanyChange={(values) => 
        setFilters({ ...filters, company: values })
      }
      type={filters.type}
      onTypeChange={(value) => 
        setFilters({ ...filters, type: value })
      }
      status={filters.status}
      onStatusChange={(value) => 
        setFilters({ ...filters, status: value })
      }
      bookingNoOptions={["ND-2025-001", "ND-2025-002", "ND-2025-003"]}
      clientOptions={["ABC Corp", "XYZ Inc", "Demo Client"]}
      companyOptions={[
        { value: "jjb", label: "JJB Group" },
        { value: "sub", label: "Subsidiary" },
      ]}
      variant="default"
    />
  );
}
```

#### Compact Mode
```tsx
<FilterBarSticky
  variant="compact"
  // ... other props
/>
```

#### Locked Status Mode (Approvals Page)
```tsx
<FilterBarSticky
  variant="locked-status"
  status="Pending"
  onStatusChange={() => {}}  // No-op, status is locked
  // ... other props
/>
```

#### With All Optional Fields
```tsx
<FilterBarSticky
  // ... basic props
  account={filters.account}
  onAccountChange={handleAccountChange}
  category={filters.category}
  onCategoryChange={handleCategoryChange}
  enteredBy={filters.enteredBy}
  onEnteredByChange={handleEnteredByChange}
  accountOptions={accountsList}
  categoryOptions={categoriesList}
  userOptions={usersList}
/>
```

---

## Integration Pattern

Here's how to use all three components together in a complete Accounting page:

```tsx
import { 
  CommandBarAccounting, 
  TabsAccounting, 
  FilterBarSticky,
  AccountingTabValue 
} from "./components/accounting/shared";

export function AccountingModule() {
  // Global state
  const [company, setCompany] = useState("jjb");
  const [dateRange, setDateRange] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<AccountingTabValue>("entries");
  
  // Filter state
  const [filters, setFilters] = useState({
    bookingNo: "",
    client: "",
    company: [],
    type: "",
    status: "Pending",
  });

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Command Bar - Persistent global controls */}
      <CommandBarAccounting
        company={company}
        onCompanyChange={setCompany}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewEntry={() => console.log("New entry")}
      />

      {/* Module Navigation - Tab switching */}
      <TabsAccounting
        active={activeTab}
        onTabChange={setActiveTab}
        showIcons={true}
      />

      {/* Page Content with Sticky Filter Bar */}
      <div className="flex-1 overflow-y-auto">
        <FilterBarSticky
          bookingNo={filters.bookingNo}
          onBookingNoChange={(value) => 
            setFilters({ ...filters, bookingNo: value })
          }
          client={filters.client}
          onClientChange={(value) => 
            setFilters({ ...filters, client: value })
          }
          status={filters.status}
          onStatusChange={(value) => 
            setFilters({ ...filters, status: value })
          }
          variant={activeTab === "approvals" ? "locked-status" : "default"}
        />

        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Page content based on activeTab */}
          {activeTab === "entries" && <EntriesContent filters={filters} />}
          {activeTab === "approvals" && <ApprovalsContent filters={filters} />}
          {/* ... other tabs */}
        </div>
      </div>
    </div>
  );
}
```

---

## Responsive Behavior

All three components follow the desktop-first design:

- **1440px+**: Full width with max-content 1200px centered
- **1200px-1440px**: Content adapts to viewport
- **< 1200px**: Horizontal scroll if needed (filters may wrap)

---

## Accessibility

- All interactive elements have proper focus states
- Keyboard navigation supported (Tab, Arrow keys, Enter, Escape)
- Select dropdowns use native accessibility features
- Color contrast meets WCAG AA standards
- Required fields marked with visual indicator (*)
- Disabled states clearly indicated

---

## Performance Considerations

- **Autocomplete**: Limits suggestions to 5 items to prevent DOM bloat
- **Multi-select**: Uses controlled checkboxes for instant feedback
- **Date picker**: Lazy-loaded calendar component
- **Filter state**: Debounce search input for API calls (implement in parent)
- **Sticky positioning**: Uses CSS `position: sticky` for smooth scrolling

---

## Common Use Cases

### 1. Entries Page
```tsx
<CommandBarAccounting company={company} onCompanyChange={setCompany} />
<TabsAccounting active="entries" onTabChange={setActiveTab} />
<FilterBarSticky variant="default" status="all" />
```

### 2. Approvals Page (Locked to Pending)
```tsx
<CommandBarAccounting company={company} onCompanyChange={setCompany} />
<TabsAccounting active="approvals" onTabChange={setActiveTab} />
<FilterBarSticky variant="locked-status" status="Pending" />
```

### 3. Accounts Page (Compact, No Status Filter)
```tsx
<CommandBarAccounting company={company} onCompanyChange={setCompany} />
<TabsAccounting active="accounts" onTabChange={setActiveTab} />
<FilterBarSticky 
  variant="compact" 
  // Don't pass status props if not needed
/>
```

### 4. Loading State
```tsx
<CommandBarAccounting 
  company={company} 
  onCompanyChange={setCompany}
  loading={true}  // Disables all controls and shows spinner
/>
```

### 5. Disabled State (Read-Only Mode)
```tsx
<CommandBarAccounting 
  company={company} 
  onCompanyChange={setCompany}
  disabled={true}  // Disables all controls without spinner
/>
<TabsAccounting 
  active="entries" 
  onTabChange={setActiveTab}
  disabled={["import-export", "clients"]}  // Disable specific tabs
/>
```

---

## Summary

These three components work together to create a cohesive, desktop-first ERP experience:

✅ **CommandBarAccounting**: Persistent global controls with loading/disabled states
✅ **TabsAccounting**: Clean tab navigation with icons and disabled states
✅ **FilterBarSticky**: Advanced filtering with autocomplete, multi-select, and variants

All components follow the design system:
- 8px spacing scale
- Inter typography
- Navy/Orange color scheme
- Consistent border radius tokens
- Proper Auto Layout
- Desktop-optimized dimensions
