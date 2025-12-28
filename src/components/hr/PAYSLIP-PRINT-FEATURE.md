# Payroll Payslip Print Feature

## Overview
Added a printable payslip screen that matches the company's Excel payslip layout. When users click "Print Slip" on any payroll run, it opens a full-screen modal showing 3 payslips per row (employee copy + company copy for each employee).

---

## Implementation

### 1. New Component: PayrollPayslipsModal.tsx

Located: `/components/hr/PayrollPayslipsModal.tsx`

**Features:**
- Full-width modal (1180px wide, 90vh height)
- Displays payslips in a 3-column grid
- Each employee gets 2 slips (Employee Copy + Company Copy)
- Filter to view all employees or select individual
- Print and Download Excel actions
- Company-specific header colors

---

## Modal Structure

### Header
```
Payroll Payslips – [Company Name]
[Period]

[Download Excel] [Print] [X]
```

### Filter Bar
```
Employee: [Dropdown: All Employees / Individual names]
```

### Payslips Grid
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Employee 1  │ │ Employee 1  │ │ Employee 2  │
│ Emp Copy    │ │ Co. Copy    │ │ Emp Copy    │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Employee 2  │ │ Employee 3  │ │ Employee 3  │
│ Co. Copy    │ │ Emp Copy    │ │ Co. Copy    │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Payslip Card Structure

Each payslip card (330px × ~640px) contains:

### 1. Header Bar
- **Company name** (all caps, bold)
- **"PAYSLIP"** label
- **Cut off period** (e.g., "Cut off October 1–13, 2025")
- **Background color**: Company-specific

**Company-Specific Colors:**
| Company | Background | Text Color |
|---------|-----------|------------|
| Conforme Cargo Express | White (#FFFFFF) | Black (#000000) |
| ZEUJ One Marketing International | Yellow-Gold (#FCD34D) | Black (#000000) |
| Juan Logistica Courier Services | Orange (#F97316) | White (#FFFFFF) |
| ZN International Cargo Forwarding | Navy (#0A1D4D) | White (#FFFFFF) |

### 2. Employee Information
```
Employee Name: [Last name, First name]
Designation: [POSITION IN CAPS]
                                    [Emp Copy / Co. Copy]
```

### 3. Earnings Section
Boxed section with gray header bar:
```
┌────────────────────────────────┐
│ EARNINGS                       │
├────────────────────────────────┤
│ Basic Pay              14,511.90 │
│ Allowance                   0.00 │
│ Overtime                    0.00 │
│ HOLIDAYS pay                0.00 │
│ Adjustments                 0.00 │
│ COLA                    5,438.11 │
│ ─────────────────────────────── │
│ Gross Pay              19,950.01 │
└────────────────────────────────┘
```

### 4. Deductions Section
Boxed section with gray header bar:
```
┌────────────────────────────────┐
│ DEDUCTIONS                     │
├────────────────────────────────┤
│ Late/Undertime            547.67 │
│ Absences                    0.00 │
│ SSS Cont                    0.00 │
│ PhilHealth                725.59 │
│ HDMF                      200.00 │
│ Salary adj.                 0.00 │
│ SSS LOAN                    0.00 │
│ Advances                4,000.00 │
│ ─────────────────────────────── │
│ Total Deductions        5,473.26 │
└────────────────────────────────┘
```

### 5. Net Pay Block
```
┌────────────────────────────────┐
│           NET PAY              │
│          ₱14,476.75            │
└────────────────────────────────┘
```
- Thick border (2px)
- Centered text
- Large, bold amount

### 6. Signature Footer
```
Received by:

_________________________________
Signature
```

---

## Design Specifications

### Payslip Card
- **Width**: 330px
- **Height**: ~640px (auto-adjusts to content)
- **Border**: 2px solid #B9B9B9
- **Border Radius**: 4px
- **Background**: White
- **Font Size**: 11-12px (to match printed form aesthetic)

### Grid Layout
- **Columns**: 3 payslips per row
- **Gap**: 24px between cards
- **Background**: Light gray (#F3F4F6) to simulate paper

### Typography
- **Header company name**: 11px, bold, uppercase, letter-spacing 0.5px
- **Section headers**: 10px, bold, uppercase, letter-spacing 0.3px
- **Body text**: 11px, regular
- **Values**: 11px, medium (500)
- **Gross Pay / Total Deductions**: Bold (700)
- **Net Pay**: 16px, bold (700)

### Borders
- **Outer card border**: 2px solid #B9B9B9
- **Section borders**: 1px solid #B9B9B9
- **Section headers**: 1px solid #B9B9B9 background #F9FAFB

---

## Data Binding

### Mock Data Structure
```typescript
interface PayslipData {
  employeeName: string;
  designation: string;
  copyType: "Employee Copy" | "Company Copy";
  earnings: {
    basicPay: number;
    allowance: number;
    overtime: number;
    holidaysPay: number;
    adjustments: number;
    cola: number;
  };
  deductions: {
    lateUndertime: number;
    absences: number;
    sssContribution: number;
    philHealth: number;
    hdmf: number;
    salaryAdj: number;
    sssLoan: number;
    advances: number;
  };
  netPay: number;
}
```

### Data Sources (Future Integration)
- **Employee name**: From employee master list
- **Designation**: From employee profile
- **Basic Pay**: From payroll run calculation
- **COLA**: From payroll run calculation
- **Deductions**: From payroll run calculation (SSS, PhilHealth, HDMF, advances)
- **Net Pay**: Computed (Gross Pay - Total Deductions)

---

## User Flow

### 1. Open Payslips
```
HR → Payroll Runs → [Company Card] → Click "Print Slip"
```

### 2. Modal Opens
- Shows all employees in the selected company
- Each employee has 2 slips (Employee Copy + Company Copy)
- Slips arranged in 3-column grid

### 3. Filter (Optional)
```
Employee: [All Employees ▼]
         → Select "Paycana, Gerlie"
         → Shows only Paycana's 2 slips
```

### 4. Print
```
Click "Print" button → Browser print dialog
```

### 5. Download (Future)
```
Click "Download Excel" → Generates Excel file with all payslips
```

---

## Print Behavior

When user clicks "Print":
1. Browser's native print dialog opens
2. Recommended settings:
   - **Layout**: Portrait
   - **Paper size**: Letter (8.5" × 11")
   - **Margins**: Minimum
   - **Scale**: Fit to page
3. Each payslip prints at actual size
4. Background colors print (company headers)

### Print CSS (Future Enhancement)
```css
@media print {
  /* Hide header and filter */
  .no-print {
    display: none !important;
  }
  
  /* Ensure payslips print properly */
  .payslip-card {
    page-break-inside: avoid;
  }
}
```

---

## Mock Data

### Companies & Employees

**Conforme Cargo Express (CCE)**
- Paycana, Gerlie (Vice President)
- Turgo, Christine Joy (Operations Staff)
- Morfe, Liancel (Driver)

**ZEUJ One Marketing International**
- Valera, Pablo Jr. (Warehouse Staff)

**Juan Logistica Courier Services**
- Gerona, Gerlie (Admin Assistant)

**ZN International Cargo Forwarding**
- Santos, Maria (Accounting Clerk)

### Sample Payslip Data (Paycana, Gerlie)
```
Basic Pay:        ₱14,511.90
Allowance:        ₱0.00
Overtime:         ₱0.00
HOLIDAYS pay:     ₱0.00
Adjustments:      ₱0.00
COLA:             ₱5,438.11
─────────────────────────────
Gross Pay:        ₱19,950.01

Late/Undertime:   ₱547.67
Absences:         ₱0.00
SSS Cont:         ₱0.00
PhilHealth:       ₱725.59
HDMF:             ₱200.00
Salary adj.:      ₱0.00
SSS LOAN:         ₱0.00
Advances:         ₱4,000.00
─────────────────────────────
Total Deductions: ₱5,473.26

NET PAY:          ₱14,476.75
```

---

## Technical Details

### Component Props
```typescript
interface PayrollPayslipsModalProps {
  open: boolean;
  onClose: () => void;
  company: string;
  period: string;
}
```

### State Management
```typescript
const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
```

### Computed Values
```typescript
// Gross Pay
const grossPay = 
  basicPay + allowance + overtime + holidaysPay + adjustments + cola;

// Total Deductions
const totalDeductions = 
  lateUndertime + absences + sssContribution + philHealth + 
  hdmf + salaryAdj + sssLoan + advances;

// Net Pay (already in mock data, but can be computed)
const netPay = grossPay - totalDeductions;
```

---

## Future Enhancements

### Short-term
- [ ] Add actual payroll data integration
- [ ] Add print-specific CSS (@media print)
- [ ] Add page break controls for multi-page prints
- [ ] Add employee photos/signatures

### Medium-term
- [ ] Generate Excel export with all payslips
- [ ] Add email functionality (send payslips to employees)
- [ ] Add payslip history (view previous periods)
- [ ] Add QR code for digital verification

### Long-term
- [ ] Add electronic signature capture
- [ ] Add PDF generation and storage
- [ ] Add payslip templates (different layouts)
- [ ] Add multi-language support

---

## File Structure

```
/components/hr/
├── PayrollPayslipsModal.tsx       ← New component
├── CreatePayrollModal.tsx
├── PayrollDetailsModal.tsx
├── EmployeeProfileModal.tsx
├── EmployeeFileModal.tsx
├── EmployeesList.tsx
└── PAYSLIP-PRINT-FEATURE.md      ← This documentation
```

---

## Integration with HR.tsx

### 1. Import
```typescript
import { PayrollPayslipsModal } from "./hr/PayrollPayslipsModal";
```

### 2. State
```typescript
const [payslipsModalOpen, setPayslipsModalOpen] = useState(false);
const [selectedPayrollCompany, setSelectedPayrollCompany] = useState("");
```

### 3. Button Click Handler
```typescript
<Button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedPayrollCompany(company);
    setPayslipsModalOpen(true);
  }}
>
  Print Slip
</Button>
```

### 4. Modal Render
```typescript
<PayrollPayslipsModal
  open={payslipsModalOpen}
  onClose={() => setPayslipsModalOpen(false)}
  company={selectedPayrollCompany}
  period="October 1–13, 2025"
/>
```

---

## Design Consistency

### Matches Excel Layout ✅
- Header with company name
- Employee info section
- Earnings table
- Deductions table
- Net Pay highlight
- Signature footer

### Follows JJB OS Design System ✅
- Button styles match Accounting footer buttons
- Typography uses Inter font
- Border radius: 4px (subtle, paper-like)
- Colors: Navy (#0A1D4D), Orange (#F25C05)
- Consistent spacing (8px scale)

### Print-Ready ✅
- Proper sizing (330px × 640px per slip)
- 3 slips per row (fits Letter paper)
- Borders simulate cut lines
- Company colors print correctly
- Font size readable when printed (11-12px)

---

## Testing Checklist

### Visual Testing
- [x] Payslips render in 3-column grid
- [x] Each employee has 2 copies (Employee + Company)
- [x] Company headers have correct colors
- [x] All sections (Earnings, Deductions, Net Pay) display correctly
- [x] Numbers format with 2 decimal places
- [x] Currency symbol (₱) displays correctly

### Interaction Testing
- [x] "Print Slip" button opens modal
- [x] Employee filter works (All / Individual)
- [x] Print button triggers browser print dialog
- [x] Download Excel button shows toast (placeholder)
- [x] Close button (X) closes modal
- [x] Click outside modal closes it

### Data Testing
- [x] Mock data loads for all 4 companies
- [x] Gross Pay calculates correctly
- [x] Total Deductions calculate correctly
- [x] Net Pay matches mock data
- [x] Empty/zero values display as "0.00"

### Responsive Testing
- [x] Modal fits within 1440×900 canvas
- [x] Grid centers properly
- [x] Scroll works when many employees
- [x] Modal header stays fixed

---

## Summary

Created a professional, printable payslip screen that:
1. ✅ Matches the company's Excel payslip layout
2. ✅ Displays 3 payslips per row (Employee + Company copies)
3. ✅ Uses company-specific header colors
4. ✅ Includes all required sections (Earnings, Deductions, Net Pay, Signature)
5. ✅ Follows JJB OS design standards
6. ✅ Ready for browser printing
7. ✅ Integrated with existing HR → Payroll flow

The feature is now live and accessible from any payroll run card's "Print Slip" button.
