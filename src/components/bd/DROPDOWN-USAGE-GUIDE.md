# Dropdown Component Usage Guide

## Standard Dropdown: CustomDropdown

**CustomDropdown** is the **ONLY** dropdown component to use in Neuron OS. SimpleDropdown has been removed from the codebase.

### Import

```typescript
import { CustomDropdown } from "./bd/CustomDropdown";
```

### Basic Usage

```tsx
<CustomDropdown
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
  ]}
  placeholder="Select an option"
/>
```

### With Icons (Recommended)

Icons provide visual context and improve UX:

```tsx
import { Phone, Mail, Users } from "lucide-react";

<CustomDropdown
  value={activityType}
  onChange={(value) => setActivityType(value)}
  options={[
    { value: "Call", label: "Call", icon: <Phone size={16} /> },
    { value: "Email", label: "Email", icon: <Mail size={16} /> },
    { value: "Meeting", label: "Meeting", icon: <Users size={16} /> }
  ]}
  placeholder="Select activity type"
/>
```

### With Integrated Label

```tsx
<CustomDropdown
  label="Customer"
  value={customerId}
  onChange={setCustomerId}
  options={customers.map(c => ({ 
    value: c.id, 
    label: c.name, 
    icon: <Building2 size={16} /> 
  }))}
  placeholder="Select customer"
/>
```

### With Helper Text

```tsx
<CustomDropdown
  label="Priority"
  value={priority}
  onChange={setPriority}
  options={[
    { value: "Low", label: "Low", icon: <Flag size={16} style={{ color: "#10B981" }} /> },
    { value: "Medium", label: "Medium", icon: <Flag size={16} style={{ color: "#F59E0B" }} /> },
    { value: "High", label: "High", icon: <Flag size={16} style={{ color: "#EF4444" }} /> }
  ]}
  helperText="Set the urgency level for this task"
/>
```

### With Disabled State

```tsx
<CustomDropdown
  label="Department"
  value={department}
  onChange={setDepartment}
  options={departments}
  disabled={isLoading}
  placeholder="Loading departments..."
/>
```

### With Disabled Options

```tsx
<CustomDropdown
  value={serviceType}
  onChange={setServiceType}
  options={[
    { value: "brokerage", label: "Brokerage", icon: <FileText size={16} /> },
    { value: "forwarding", label: "Forwarding", icon: <Ship size={16} />, disabled: true },
    { value: "trucking", label: "Trucking", icon: <Truck size={16} /> }
  ]}
  placeholder="Select service"
/>
```

## Icon Guidelines

### Common Icons by Category

**Communication:**
- Phone: `<Phone size={16} />`
- Email: `<Mail size={16} />`
- Meeting: `<Users size={16} />`
- Message: `<MessageSquare size={16} />`

**Transportation:**
- Air: `<Plane size={16} />`
- Ocean: `<Ship size={16} />`
- Land: `<Truck size={16} />`

**Business:**
- Customer/Company: `<Building2 size={16} />`
- Contact/User: `<User size={16} />`
- Document: `<FileText size={16} />`

**Status/Priority:**
- Flag (colored): `<Flag size={16} style={{ color: "#EF4444" }} />`
- Check: `<CheckCircle2 size={16} />`
- Alert: `<AlertTriangle size={16} />`

**Actions:**
- Calendar: `<Calendar size={16} />`
- Tag: `<Tag size={16} />`
- Credit Card: `<CreditCard size={16} />`

### Icon Size

Always use `size={16}` for consistency across all dropdowns.

### Icon Colors

Use inline styles for color-coding when needed:
```tsx
{ value: "High", label: "High", icon: <Flag size={16} style={{ color: "#EF4444" }} /> }
```

## Full Props Interface

```typescript
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}
```

## Migration from Arrays

If you have old string arrays, convert them to object format:

**Before (deprecated):**
```tsx
options={["Option 1", "Option 2", "Option 3"]}
```

**After (correct):**
```tsx
options={[
  { value: "Option 1", label: "Option 1" },
  { value: "Option 2", label: "Option 2" },
  { value: "Option 3", label: "Option 3" }
]}
```

**With mapping:**
```tsx
options={stringArray.map(item => ({ value: item, label: item }))}
```

## Do NOT Use

❌ **SimpleDropdown** - This component has been removed
❌ **String arrays** - Always use object format with value/label
❌ **Native `<select>`** - Use CustomDropdown for consistency

## Need Multi-Select?

Use the dedicated multi-select component:
```tsx
import { MultiSelectDropdown } from "./bd/MultiSelectDropdown";
```

## Need Grouped Options?

Use the grouped dropdown component:
```tsx
import { GroupedDropdown } from "./bd/GroupedDropdown";
```

---

**Last Updated:** January 13, 2026  
**Standard Component:** CustomDropdown  
**Migration Complete:** All 56+ instances migrated ✅
