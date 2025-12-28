# HR Profile List View Refactor

## Overview
Refactored the HR → Profile screen from Excel-style gridded view to a grouped list view with Employee File modal for detailed information. The list maintains exact Excel ordering by company.

## Components Created

### 1. EmployeesList.tsx
**Purpose:** Displays employees grouped by company in a clean table-style list

**Features:**
- Company-based grouping with sticky section headers
- Exact Excel ordering: CCE → ZEUJ → JUAN → ZN INT.
- Simplified columns: Name, Position, Date Hired, Contact, Action
- Avatar circles with initials
- Company filter maintains internal Excel order (no re-sorting)
- Scrollable within 640px max-height container
- Hover states on rows
- Click entire row or "View file" button to open detail modal

**Data Structure:**
- 4 company groups
- CCE: 6 employees (Paycana, Valera, Turgo, Balagt, Javier, Arciga)
- ZEUJ: 2 employees
- JUAN: 2 employees
- ZN INT.: 3 employees

**Styling:**
- JJB table style (not raw Excel cells)
- White cards with rounded corners
- Gray section headers with sticky positioning
- Company colors used only on pills, not backgrounds

### 2. EmployeeFileModal.tsx
**Purpose:** Full employee detail view with tabbed interface

**Modal Layout:**
- Width: 920px
- Centered with dark backdrop (40% opacity)
- JJB modal style matching Bookings/Accounting modals

**Header Section:**
- Employee name (20px, bold)
- Company pill (colored badge)
- Edit button (blue, rounded)
- Close button (X icon)

**Employee Info Block:**
- Designation
- Date Hired / Regularization
- Employee ID
- Displayed in 3-column grid on gray background

**Tabs:**

#### Tab 1: Personal Info
2-column form layout:
- Last name
- First name
- Middle name
- Birthdate
- Email (clickable mailto link, blue underline)
- Contact number
- Address (full width)

All fields disabled (read-only) with gray background

#### Tab 2: Employment & Payroll
Fields:
- Company (dropdown, disabled)
- Designation
- Rate type (Monthly/Daily dropdown)
- Status (Active/Separated dropdown)
- Date hired / Regularization
- Notes (textarea)
- "Included in Payroll?" toggle switch

#### Tab 3: Emergency & Government IDs
Two sections:

**In Case of Emergency:**
- Emergency Contact Name (full width)
- Relationship
- Emergency Contact No.

**Government IDs:**
- SSS Number (blue background: #DBEAFE)
- PhilHealth Number (green background: #D1FAE5)
- Pag-IBIG Number (light red background: #FEE2E2)
  - Shows "Missing in roster" warning chip if empty
  - Bright red cell (#FCA5A5) for missing values
- TIN Number (white background)

**Sync Note:**
Blue info box: "Values synced from Excel roster 2025. HR can complete missing IDs here."

## Integration with HR.tsx

### State Added:
```typescript
const [employeeFileOpen, setEmployeeFileOpen] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRowData | null>(null);
```

### Companies Array Updated:
Changed from abbreviations (CCE, ZEUJ, etc.) to full names:
- "Conforme Cargo Express"
- "ZEUJ One Marketing International"
- "Juan Logistica Courier Services"
- "ZN International Cargo Forwarding"

### Company Colors Updated:
Softer pastel colors matching the modal design:
- CCE: Yellow-beige (#FEF3C7)
- ZEUJ: Light blue (#DBEAFE)
- JUAN: Light orange (#FED7AA)
- ZN INT.: Light indigo (#E0E7FF)

### Profile Section Replaced:
Old: `<EmployeeRosterExcel />` (Excel-style grid)
New: `<EmployeesList />` (grouped list view)

### Modal Integration:
EmployeeFileModal conditionally renders when:
- `employeeFileOpen` is true
- `selectedEmployee` is not null
- Clicking row or "View file" button sets both states

## Filtering Behavior

### Company Filter:
- "All Companies" shows all 4 sections in Excel order
- Selecting specific company shows only that section
- **Does NOT re-sort by name or date**
- **Does NOT re-group by other criteria**
- Maintains exact Excel ordering within each company

### Status Filter:
- Currently not implemented in list view
- All employees shown are "Active"
- Can be added later if needed

## Developer Notes

Updated note in HR.tsx:
```
Employee list ordering: List is ordered according to master Excel: CCE → ZEUJ → JUAN → ZN INT. 
Do not auto-sort by name or date. HR expects this exact order. Company filter maintains internal Excel order.
```

## Data Fidelity

All employee data from Excel roster 2025 preserved:
- Names (including typos like "BALAGT, JAKE")
- Regularization dates
- Employee IDs (format: CCE-087-XXXXX, etc.)
- Email addresses (working mailto links)
- Phone numbers
- Emergency contacts
- Government ID numbers
- Missing Pag-IBIG highlighted in UI

## Design Consistency

Follows JJB OS enterprise SaaS aesthetic:
- Navy blue (#0A1D4D) for headings
- Orange (#F25C05) for active tab indicators
- Clean white backgrounds
- Subtle shadows and borders
- Rounded corners (20px for cards, 24px for modals)
- Inter typography
- Consistent 8px spacing scale
- Lucide icons (User, Clock, DollarSign)

## Future Enhancements (Not Implemented)

The modal structure supports future additions:
- Upload 201 files tab
- Attach SSS E1/HDMF documents
- Add benefits/insurance section
- Salary/rate management
- Leave balance tracking
- Edit mode for all fields
- Photo upload for avatar
- Export individual employee record
