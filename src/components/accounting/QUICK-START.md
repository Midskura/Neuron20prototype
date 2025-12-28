# Quick Start Guide - New Accounting Components

Three new specialized components have been created for the Accounting module. This guide shows you how to use them together.

---

## 🚀 Quick Implementation

### 1. Import Components

```tsx
import { 
  CommandBarAccounting, 
  TabsAccounting, 
  FilterBarSticky,
  AccountingTabValue 
} from "./components/accounting/shared";
```

### 2. Setup State

```tsx
function AccountingModule() {
  // Command Bar state (global to all tabs)
  const [company, setCompany] = useState("jjb");
  const [dateRange, setDateRange] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<AccountingTabValue>("entries");
  
  // Filter state (varies by page)
  const [filters, setFilters] = useState({
    bookingNo: "",
    client: "",
    company: [],
    type: "",
    status: "Pending",
  });
}
```

### 3. Build Layout

```tsx
return (
  <div className="h-full flex flex-col bg-white overflow-hidden">
    {/* 1. Command Bar - Height: 56px */}
    <CommandBarAccounting
      company={company}
      onCompanyChange={setCompany}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewEntry={() => handleNewEntry()}
    />

    {/* 2. Tabs Navigation - Height: 44px */}
    <TabsAccounting
      active={activeTab}
      onTabChange={setActiveTab}
      showIcons={true}
    />

    {/* 3. Scrollable Content Area */}
    <div className="flex-1 overflow-y-auto">
      {/* 4. Sticky Filter Bar - Height: 56px */}
      <FilterBarSticky
        bookingNo={filters.bookingNo}
        onBookingNoChange={(value) => 
          setFilters({ ...filters, bookingNo: value })
        }
        status={filters.status}
        onStatusChange={(value) => 
          setFilters({ ...filters, status: value })
        }
        variant={activeTab === "approvals" ? "locked-status" : "default"}
        bookingNoOptions={bookingNumbers}
        clientOptions={clientNames}
      />

      {/* 5. Page Content - Max-width 1200px, Padding 24px */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {renderPageContent()}
      </div>
    </div>
  </div>
);
```

---

## 📐 Layout Structure

```
┌────────────────────────────────────────────────────────┐
│ CommandBar (56px) - Orange button, required company   │
├────────────────────────────────────────────────────────┤
│ Tabs (44px) - Underline indicator, icons optional     │
├────────────────────────────────────────────────────────┤
│ ╔════════════════════════════════════════════════════╗ │
│ ║ FilterBar (56px, sticky) - Autocomplete, multi    ║ │
│ ╠════════════════════════════════════════════════════╣ │
│ ║                                                    ║ │
│ ║ Page Content (scrollable)                         ║ │
│ ║ Max-width: 1200px, Padding: 24px                  ║ │
│ ║                                                    ║ │
│ ╚════════════════════════════════════════════════════╝ │
└────────────────────────────────────────────────────────┘
```

---

## 💡 Common Patterns

### Pattern 1: Entries Page (Default)

```tsx
<CommandBarAccounting company={company} onCompanyChange={setCompany} />
<TabsAccounting active="entries" onTabChange={setActiveTab} />
<FilterBarSticky 
  variant="default" 
  status={filters.status}
  onStatusChange={handleStatusChange}
/>
```

**Use Case**: General entries list with all filter options

---

### Pattern 2: Approvals Page (Locked Status)

```tsx
<CommandBarAccounting company={company} onCompanyChange={setCompany} />
<TabsAccounting active="approvals" onTabChange={setActiveTab} />
<FilterBarSticky 
  variant="locked-status" 
  status="Pending"
  onStatusChange={() => {}}  // No-op, status locked
/>
```

**Use Case**: Approvals queue where status must always be "Pending"

---

### Pattern 3: Compact Filter (Accounts/Categories)

```tsx
<CommandBarAccounting company={company} onCompanyChange={setCompany} />
<TabsAccounting active="accounts" onTabChange={setActiveTab} />
<FilterBarSticky 
  variant="compact"
  // Only pass essential filters
  type={filters.type}
  onTypeChange={handleTypeChange}
/>
```

**Use Case**: Simpler pages that don't need all filter options

---

### Pattern 4: Loading State

```tsx
<CommandBarAccounting 
  company={company} 
  onCompanyChange={setCompany}
  loading={true}  // Shows spinner, disables controls
/>
<TabsAccounting active="entries" onTabChange={setActiveTab} />
```

**Use Case**: During data fetch or async operations

---

### Pattern 5: Disabled Tabs

```tsx
<CommandBarAccounting company={company} onCompanyChange={setCompany} />
<TabsAccounting 
  active="entries" 
  onTabChange={setActiveTab}
  disabled={["import-export", "clients"]}  // Grays out these tabs
/>
```

**Use Case**: Feature flags or permissions-based access

---

## 🎨 Styling Specifications

### CommandBar
- **Height**: 56px
- **Padding**: 12px horizontal
- **Gap**: 12px
- **Company Width**: 200px (required, marked with *)
- **Date Range Width**: 240px
- **Search**: Flexible (max 400px)
- **Button**: Orange (#F25C05)

### Tabs
- **Height**: 44px
- **Padding**: 12px horizontal (per tab: 16px)
- **Icon Size**: 16px (w-4 h-4)
- **Font Size**: 14px
- **Active Indicator**: 2px orange underline

### FilterBar
- **Height**: 56px
- **Padding**: 12px horizontal (default), 8px (compact)
- **Gap**: 12px (default), 8px (compact)
- **Field Width**: 140px (default), 120px (compact)
- **Date Range Width**: 180px (default), 160px (compact)

---

## 🔧 Advanced Features

### Autocomplete

```tsx
<FilterBarSticky
  bookingNo={bookingNo}
  onBookingNoChange={setBookingNo}
  bookingNoOptions={[
    "ND-2025-001",
    "ND-2025-002",
    "ND-2025-003"
  ]}
  clientOptions={[
    "ABC Corp",
    "XYZ Inc",
    "Demo Client"
  ]}
/>
```

**Features**:
- Shows up to 5 suggestions
- Filters on partial match (case-insensitive)
- Click to select
- Auto-closes on outside click

---

### Multi-Select Company

```tsx
<FilterBarSticky
  company={["jjb", "subsidiary"]}  // Array
  onCompanyChange={setCompanyArray}
  companyOptions={[
    { value: "jjb", label: "JJB Group" },
    { value: "subsidiary", label: "JJB Subsidiary" },
    { value: "logistics", label: "JJB Logistics" },
  ]}
/>
```

**Features**:
- Checkbox popover
- Shows count: "2 Companies"
- Orange checkmarks when selected
- Returns array of selected values

---

### Date Range

```tsx
<CommandBarAccounting
  dateRange={{ from: new Date(), to: new Date() }}
  onDateRangeChange={(range) => {
    console.log(range);  // { from?: Date, to?: Date }
  }}
/>
```

**Features**:
- 2-month calendar view
- Auto-closes when both dates selected
- Formatted display: "Oct 1, 2025 - Oct 31, 2025"
- Clear by passing empty object: `{}`

---

## 📦 Props Quick Reference

### CommandBarAccounting

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `company` | `string` | ✅ | - |
| `onCompanyChange` | `(value: string) => void` | ✅ | - |
| `dateRange` | `{from?: Date, to?: Date}` | ❌ | `{}` |
| `onDateRangeChange` | `(range) => void` | ❌ | - |
| `searchQuery` | `string` | ❌ | `""` |
| `onSearchChange` | `(query: string) => void` | ❌ | - |
| `onNewEntry` | `() => void` | ❌ | - |
| `loading` | `boolean` | ❌ | `false` |
| `disabled` | `boolean` | ❌ | `false` |

### TabsAccounting

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `active` | `AccountingTabValue` | ✅ | - |
| `onTabChange` | `(tab) => void` | ✅ | - |
| `disabled` | `AccountingTabValue[]` | ❌ | `[]` |
| `showIcons` | `boolean` | ❌ | `true` |

### FilterBarSticky

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `bookingNo` | `string` | ❌ | `""` |
| `client` | `string` | ❌ | `""` |
| `company` | `string[]` | ❌ | `[]` |
| `type` | `string` | ❌ | `""` |
| `status` | `string` | ❌ | `"Pending"` |
| `variant` | `"default" \| "compact" \| "locked-status"` | ❌ | `"default"` |
| `bookingNoOptions` | `string[]` | ❌ | `[]` |
| `clientOptions` | `string[]` | ❌ | `[]` |
| `onClearFilters` | `() => void` | ❌ | - |

---

## 🧪 Testing in Demo

Visit the **Components** tab in AccountingV2 to see live demos of all three components with interactive examples.

**Demo includes**:
- ✅ CommandBar with loading toggle
- ✅ Tabs with disabled states
- ✅ FilterBar with all three variants
- ✅ State visualization

---

## 📚 Full Documentation

- **Detailed Guide**: [NEW-COMPONENTS.md](./NEW-COMPONENTS.md)
- **Component Library**: [COMPONENTS.md](./COMPONENTS.md)
- **ERP Layout**: [ERP-LAYOUT.md](./ERP-LAYOUT.md)
- **Hierarchy**: [HIERARCHY.md](./HIERARCHY.md)

---

## ✅ Checklist

When implementing these components, ensure:

- [ ] CommandBar receives required `company` prop
- [ ] Company switcher has red asterisk (*) indicating required
- [ ] Tabs have proper `active` state
- [ ] FilterBar variant matches page intent
- [ ] Autocomplete options provided for Booking No and Client
- [ ] Multi-select company returns array, not string
- [ ] Date range format is `{from?: Date, to?: Date}`
- [ ] Loading/disabled states handled gracefully
- [ ] Clear Filters respects locked-status variant
- [ ] All heights match spec (56px, 44px, 56px)
- [ ] Max-width 1200px applied to content areas
- [ ] Proper overflow handling (flex-1 overflow-y-auto)

---

**Happy coding!** 🚀
