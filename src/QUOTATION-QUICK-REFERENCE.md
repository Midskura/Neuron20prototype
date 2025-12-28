# Quotation Module - Quick Reference

## 🎯 Purpose
Convert BD Inquiries into detailed Quotations with pricing breakdown and vendor management.

---

## 🚀 Quick Start

### For Pricing Officers:

1. **Navigate**: Sidebar → Pricing → Quotations
2. **See**: List of Inquiries (purple) + Quotations (color-coded)
3. **Create from Inquiry**:
   - Click inquiry row
   - Click "Create Quotation" button
   - Builder opens with customer/services pre-filled
4. **Fill Details**:
   - Name the quotation
   - Set credit terms & validity
   - Complete service details
   - Add pricing line items
   - Assign vendors
5. **Save**: Draft or Generate

---

## 📊 Status Workflow

```
Inquiry (Purple)
    ↓ Create Quotation
Draft (Gray)
    ↓ Generate
Ongoing (Amber)
    ↓ Submit
Waiting Approval (Orange)
    ↓ Manager Review
Approved (Green) ──→ Project (Ops Handover)
    OR
Disapproved (Red)
```

---

## 🏗️ Quotation Structure

```
Quotation
├── 01 BASIC INFO
│   ├── Quotation Name*
│   ├── Customer* (from inquiry)
│   ├── Credit Terms*
│   └── Validity*
│
├── 02 SERVICES & PRICING
│   ├── Service 1 (e.g., Brokerage)
│   │   ├── Service Details
│   │   │   ├── Subtype, Mode, POD, etc.
│   │   │   └── Cargo info, Delivery
│   │   │
│   │   └── Pricing (6 Categories)
│   │       ├── Freight
│   │       ├── Origin Local Charges
│   │       ├── Destination Local Charges
│   │       ├── Reimbursable Charges
│   │       ├── Brokerage Charges
│   │       └── Other Charges
│   │
│   ├── Service 2 (e.g., Forwarding)
│   │   ├── Service Details
│   │   └── Pricing (6 Categories)
│   │
│   └── ... more services
│
└── 03 SUMMARY
    ├── Service Subtotals
    └── Grand Total
```

---

## 💰 Pricing Line Item

Each line item includes:

| Field | Description | Example |
|-------|-------------|---------|
| **Charge Type** | Predefined from category | "Ocean Freight" |
| **Description** | Optional details | "Shanghai to Manila" |
| **Quantity** | Number | 1 |
| **Unit** | How it's measured | "per shipment" |
| **Selling ₱** | What you charge customer | ₱45,000 |
| **Vendor** | Who provides service | Maersk (Overseas Agent) |
| **Buying ₱** | What vendor charges you | ₱38,000 |
| **Total** | Auto-calculated | ₱45,000 |

**Margin** = Selling - Buying = ₱7,000 (tracked implicitly)

---

## 📋 Service Types & Required Fields

### 🏛️ Brokerage
**Required**: Subtype, Shipment Type  
**Key Fields**: POD, Mode, Cargo Type, Commodity, Declared Value  
**Optional**: Country of Origin, PSIC, AEO

### 🚢 Forwarding
**Required**: Incoterms, Cargo Type, Mode, Commodity, POL, POD  
**Optional**: AOL, AOD, Delivery Address

### 🚛 Trucking
**Required**: Truck Type, Delivery Address  
**Optional**: Pull Out Location, Delivery Instructions

### 🛡️ Marine Insurance
**Required**: Commodity Description, Invoice Value, POL, POD  
**Optional**: HS Code, AOL, AOD

### 📦 Others
**Required**: Service Description (free text)

---

## 🏷️ Charge Categories

### 1. Freight
- Air Freight, Ocean Freight
- Freight Surcharge, Fuel Surcharge

### 2. Origin Local Charges
- Pick Up, Handling, Documentation
- VGM, Palletization, Strapping
- Fumigation, Cold Storage

### 3. Destination Local Charges
- Brokerage Fee, Handling
- Arrastre, Wharfage
- Container Deposit, Documentation, Delivery

### 4. Reimbursable Charges
- Airway Bill, Bill of Lading
- Handling Fee, TEUS
- Porterage, Container Yard Charges

### 5. Brokerage Charges
- Entry, Clearance, Permit
- Processing Fee, VAT

### 6. Other Charges
- Insurance Premium, Storage
- Demurrage, Detention, Miscellaneous

---

## 🔢 Auto-Numbering

- **Quotations**: `QN-YYYY-###` (e.g., QN-2025-042)
- Sequential per year
- Auto-generated on creation

---

## 🤝 Vendor Assignment

**Vendor Types**:
- **Overseas Agent** - Foreign partners (e.g., Maersk)
- **Local Agent** - Philippine partners (e.g., Manila Port Services)
- **Subcontractor** - Local service providers (e.g., Trucking companies)

**When to Assign**:
- Line items sourced from external vendors
- Need to track cost vs revenue
- Want margin visibility

**How It Works**:
1. Select vendor from dropdown
2. Buying price field appears (yellow)
3. Enter what vendor charges you
4. Selling price = what you charge customer
5. System tracks margin: `Selling - Buying`

---

## ⚡ Quick Actions

### In List View:
- **Filter by Status** - Show only specific statuses
- **Filter by Service** - Multi-select (Brokerage, Forwarding, etc.)
- **Search** - By number, customer, origin, destination
- **Click Inquiry** - View details in side panel
- **Click Quotation** - Go to detail view
- **+ Create** - Start new standalone quotation

### In Builder:
- **Expand/Collapse** - Click service headers or category headers
- **Add Line Item** - Click "+ Add Charge" under category
- **Remove Line Item** - Click ✕ on row
- **Assign Vendor** - Select from dropdown on line item
- **Save Draft** - Save without submitting (can edit later)
- **Generate** - Submit to workflow (status: Ongoing)

### In Detail View:
- **Edit** - Opens builder (if Draft or Ongoing)
- **Submit** - Send to manager (if Ongoing)
- **Approve** - Accept quotation (if manager, Waiting Approval)
- **Disapprove** - Reject with reason (if manager)
- **Cancel** - Mark as cancelled

---

## 🎨 Visual Indicators

### Status Colors:
- 🟣 **Purple** - Inquiry
- ⚪ **Gray** - Draft, Cancelled
- 🟡 **Amber** - Ongoing
- 🟠 **Orange** - Waiting Approval
- 🟢 **Green** - Approved
- 🔴 **Red** - Disapproved

### Other Indicators:
- **Yellow Background** - Buying price (cost awareness)
- **Green Badges** - Totals and subtotals
- **+# Badge** - Multiple services indicator
- **Section Numbers** - 01, 02, 03 for visual hierarchy

---

## 🔐 Permissions

### Pricing Officer:
- ✅ Create quotations from inquiries
- ✅ Save as draft
- ✅ Generate quotations (status: Ongoing)
- ✅ Submit for approval
- ❌ Approve/disapprove

### Pricing Manager:
- ✅ All Pricing Officer permissions
- ✅ **Approve quotations**
- ✅ **Disapprove quotations** (with reason)
- ✅ View all quotations

---

## 💡 Best Practices

### Quotation Naming:
✅ **Good**: "UNILAB-2025-001 - Ocean Import Pharma Products"  
❌ **Bad**: "Quotation 1", "Test"

**Pattern**: `{Customer}-{Year}-{Sequence} - {Brief Description}`

### Service Details:
- Fill all required fields (marked with *)
- Be specific in commodity descriptions
- Include delivery addresses for logistics planning
- Use proper incoterms for forwarding

### Pricing:
- **Always assign vendors** for third-party services
- Set **buying prices** to track margins
- Use consistent **charge types** (from dropdown)
- Add **descriptions** for clarity
- Double-check **quantities and units**

### Workflow:
1. Start as **Draft** if unsure
2. Complete all details before **Generating**
3. Review totals before submission
4. Add notes for special requirements
5. Submit to manager when confident

---

## 🐛 Troubleshooting

### "Can't save quotation"
- Check all required fields (marked with *)
- Ensure at least one service selected
- Verify at least one line item added
- Check selling prices are > 0

### "Vendor dropdown not showing buying price"
- Make sure vendor is selected
- Buying price only appears when vendor assigned

### "Services pre-selected and can't remove"
- When creating from inquiry, services are inherited
- You can ADD more services
- Contact support if wrong services in inquiry

### "Total not calculating"
- Check line item quantities and prices
- Ensure numbers (not text) in price fields
- Refresh page if persistent

---

## 📞 Support

**For technical issues**: IT Support  
**For pricing questions**: Pricing Manager  
**For inquiry issues**: BD Department  
**For vendor questions**: Vendor Management

---

## 🔑 Keyboard Shortcuts

_(Coming soon in future update)_

- `Ctrl + S` - Save draft
- `Ctrl + Enter` - Generate quotation
- `Esc` - Cancel/close
- `Tab` - Navigate fields
- `Enter` - Confirm actions

---

## 📱 Mobile Access

Currently optimized for **desktop use only**.  
Mobile version planned for future release.

---

**Version**: 2.0.0  
**Last Updated**: December 13, 2025  
**Module**: Pricing - Quotations
