# Billing Inline Editor Update - Bill To & Editable Payment Details

## Overview

Updated the Billings tab inline editor to allow users to (1) specify the exact person the Statement of Account will be issued to via a "Bill To / Attention To" field, and (2) edit payment details instead of viewing a fixed, read-only block.

## Key Changes

### 1. New Field: Bill To / Attention To

**Location**: Billing & Client Information card (top-left section)

**Field Details**:
- **Label**: "Bill To / Attention To"
- **Type**: Text input (editable)
- **Placeholder**: "e.g., Mr. Sandesh Mhatre"
- **Helper Text**: "This name will appear on the SOA / invoice header." (12px, muted)
- **Position**: Directly under "Client Name" field

**Purpose**:
- Separates the company name (Client Name) from the specific person receiving the invoice
- Client Name = company/account name (disabled, prefilled)
- Bill To = specific person or department contact (editable)

**Field Order in Card**:
1. Client Name (disabled)
2. **Bill To / Attention To (editable)** ← NEW
3. Client Address / Location (editable)
4. Billing Date (editable)
5. Billing No. (disabled, auto-generated)
6. Booking Ref (disabled, auto-filled)
7. Notes / Remarks (optional, editable)

### 2. Editable Payment Details

**Location**: Payment Details card (bottom-left section, after Particular Charges)

**Changed From**: Read-only static text display  
**Changed To**: Editable 2-column form

**Fields** (all editable text inputs):
1. **Bank Name**
   - Default: "BDO"
   - Placeholder: "e.g., BDO"
   
2. **Account Name**
   - Default: "CONFORME CARGO EXPRESS"
   - Placeholder: "e.g., CONFORME CARGO EXPRESS"
   
3. **Account No.**
   - Default: "0014-8803-0454"
   - Placeholder: "e.g., 0014-8803-0454"
   
4. **Branch**
   - Default: "SM City Sucat A"
   - Placeholder: "e.g., SM City Sucat A"
   
5. **Swift Code**
   - Default: "BNORPHMM"
   - Placeholder: "e.g., BNORPHMM"

**Layout**:
- 2 columns on desktop (md and up)
- Single column on mobile
- Standard 44px input height
- 16px border radius
- Consistent spacing with other form sections

**Helper Text**: "These will appear in the printed invoice." (bottom of card)

**Styling**:
- Changed from `bg-[#FAFBFC]` (muted background) to white background
- Now matches other editable card sections
- Title remains: "PAYMENT DETAILS" (15px, semibold)
- Same padding as other cards (p-6)

### 3. Updated Data Structure

**Billing Interface Changes**:

```typescript
interface Billing {
  id: string;
  billingNo: string;
  date: string;
  description: string;
  amount: number;
  status: "Draft" | "Ready to print" | "Posted";
  clientName: string;
  billTo?: string;                    // ← NEW
  clientAddress: string;
  bookingRef: string;
  notes?: string;
  destination?: string;
  commodity?: string;
  measurement?: string;
  lineItems: BillingLineItem[];
  paymentDetails?: {                  // ← NEW
    bankName: string;
    accountName: string;
    accountNo: string;
    branch: string;
    swiftCode: string;
  };
}
```

**Default Values**:

```typescript
{
  billTo: "",
  paymentDetails: {
    bankName: "BDO",
    accountName: "CONFORME CARGO EXPRESS",
    accountNo: "0014-8803-0454",
    branch: "SM City Sucat A",
    swiftCode: "BNORPHMM",
  }
}
```

### 4. Billing Summary Enhancement

**Right Column - Billing Summary Card**:

Added conditional display of Bill To field under Client Name:

```
Client Name
└─ Puregold
   Attn: Mr. Sandesh Mhatre  ← Shows when billTo is filled
```

**Display Format**:
- Primary line: Client Name (13px, semibold)
- Secondary line: "Attn: [billTo]" (12px, muted color #64748B)
- Only shows if `billTo` has a value

### 5. Data Mapping Reference

**For Excel/Invoice Export**:

| Field | Maps To |
|-------|---------|
| `clientName` | Company/Account name line |
| `billTo` | Personal contact line / Attention line |
| `clientAddress` | Address/location line |
| `paymentDetails.bankName` | Bank name in payment section |
| `paymentDetails.accountName` | Account holder name |
| `paymentDetails.accountNo` | Account number |
| `paymentDetails.branch` | Bank branch |
| `paymentDetails.swiftCode` | International wire code |

**Invoice Header Example**:
```
Puregold                           ← clientName
Attn: Mr. Sandesh Mhatre          ← billTo
MAHARASHTRA, INDIA                ← clientAddress
```

**Payment Instructions Section**:
```
Bank Name:     [paymentDetails.bankName]
Account Name:  [paymentDetails.accountName]
Account No.:   [paymentDetails.accountNo]
Branch:        [paymentDetails.branch]
Swift Code:    [paymentDetails.swiftCode]
```

### 6. Use Cases

**Bill To Field**:
- Billing to specific department: "Accounting Dept. – Ms. Dela Cruz"
- Billing to specific person: "Mr. Sandesh Mhatre"
- Billing to role: "Finance Manager"
- Leave empty if no specific contact needed

**Editable Payment Details**:
- Override for different bank accounts (e.g., special client arrangements)
- Update for seasonal accounts or promotions
- Change for different entities within the company group
- Correct outdated information without code changes

### 7. Responsive Behavior

**Desktop (md and up)**:
- Bill To field: Left column, full width
- Payment Details: 2-column grid (3 fields in first row, 2 in second)

**Mobile (below md)**:
- Bill To field: Full width, stacked
- Payment Details: Single column, all fields stacked

**Consistent Heights**:
- All inputs: 44px
- Helper text: 12px with proper spacing (mt-1.5 / mt-5)

### 8. View Mode Behavior

When viewing an existing billing (`mode="view"`):
- Bill To field becomes read-only (disabled)
- Payment Details fields become read-only (disabled)
- All fields maintain the same layout
- Summary card shows Bill To if present

### 9. Files Modified

**Updated**:
- `/components/BillingWorkspace.tsx` - Added billTo field and editable payment details
- `/components/BookingFullView.tsx` - Updated mockBillings data structure

**Changes**:
1. Added `billTo` and `paymentDetails` to Billing interface
2. Added Bill To input field in Billing & Client Information card
3. Converted Payment Details from static display to editable form
4. Updated Billing Summary to show Bill To conditionally
5. Updated default form data to include new fields
6. Updated mock data example

### 10. Benefits

**Bill To Field**:
- More precise invoicing to specific individuals
- Better tracking of who approved/received billing
- Clearer paper trail for accounting
- Supports departmental billing workflows

**Editable Payment Details**:
- Flexibility for multi-account scenarios
- Easy updates without code deployment
- Support for different banking arrangements per client
- Override capability for special cases
- Future-proof for company structure changes

### 11. Migration Notes

**Existing Billings**:
- `billTo` is optional - existing billings work without it
- `paymentDetails` is optional - falls back to defaults if missing
- No breaking changes to existing data

**Backend Considerations**:
- Store `billTo` as nullable string
- Store `paymentDetails` as JSON object or separate table
- Validate payment details format on save
- Include both fields in Excel/SOA generation logic

### 12. Testing Checklist

- [ ] Bill To field appears after Client Name
- [ ] Bill To helper text shows correctly
- [ ] Bill To can be left empty (optional)
- [ ] Bill To appears in Billing Summary when filled
- [ ] Payment Details shows as editable form
- [ ] All 5 payment fields can be edited
- [ ] Payment Details defaults populate correctly
- [ ] Payment Details saves with billing
- [ ] View mode disables Bill To field
- [ ] View mode disables Payment Details fields
- [ ] Responsive layout works (2-col → 1-col)
- [ ] Form submission includes new fields
- [ ] Mock data loads correctly with new structure

### 13. Design Consistency

**Maintained**:
- JJB OS visual language (navy blue, orange accents, white cards)
- 44px input height standard
- 16px card border radius
- Consistent label styling (13px, #6B7280, semibold 500)
- Consistent helper text styling (11-12px, #64748B/#9CA3AF)
- 2-column grid pattern for forms
- Proper spacing scale (gap-x-6, gap-y-5)

**Visual Hierarchy**:
- Section titles: 15px, #0A1D4D, semibold 600
- Field labels: 13px, #6B7280, medium 500
- Helper text: 11-12px, muted colors
- Input text: 13px
- Clear distinction between editable and read-only fields (gray background for disabled)

## Summary

The inline billing editor now provides:
1. A dedicated "Bill To / Attention To" field for specifying the exact recipient
2. Fully editable payment details with sensible defaults
3. Enhanced Billing Summary that shows the attention line when present
4. Complete flexibility for different banking and billing scenarios
5. Maintains the document-like editing experience with no modals
