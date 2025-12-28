# Dynamic Quotation Form System

## Overview
The new quotation builder (QuotationBuilderV3) implements a dynamic, service-driven form that expands based on the services selected by the user. This provides a more intuitive and organized way to create quotations with multiple services.

## Architecture

### Component Structure
```
QuotationBuilderV3 (Main Container)
├── GeneralDetailsSection (Always visible)
│   ├── Customer Selection
│   ├── Service Selection (Multi-select chips)
│   ├── Date, Credit Terms, Validity
│   └── Vendor Management
│
├── Service Forms (Dynamically rendered based on selected services)
│   ├── BrokerageServiceForm
│   │   ├── Standard
│   │   ├── All-Inclusive
│   │   └── Non-Regular
│   ├── ForwardingServiceForm
│   ├── TruckingServiceForm
│   ├── MarineInsuranceServiceForm
│   └── OthersServiceForm
│
├── ChargeCategoriesSection (Pricing)
└── FinancialSummaryPanel (Right sidebar)
```

## General Details Section

### Fields (Always Visible)
- **Select Customer** (Dropdown) - Required
- **Select Service/s** (Multi-select chips) - Required
  - Brokerage
  - Forwarding
  - Trucking
  - Marine Insurance
  - Others
- **Date** - Required
- **Credit Terms** - Optional (e.g., "Net 30", "COD")
- **Validity** - Optional (e.g., "7 days", "30 days")
- **Vendors** - Optional list with Add/Remove functionality
  - Type: Overseas Agent / Local Agent / Subcontractor
  - Name

## Service-Specific Forms

### 1. Brokerage Service Form
First, user selects one of three types:
- **Standard**
- **All-Inclusive**
- **Non-Regular**

#### Standard Brokerage Fields
- Type of Entry (Checkboxes: Consumption, Warehousing, PEZA)
- POD (Dropdown: NAIA, MICP, POM)
- Mode (Dropdown: FCL, LCL, AIR, Multi-modal)
- Cargo Type (Dropdown: Dry, Reefer, Breakbulk, RORO)
- Commodity Description
- Delivery Address

#### All-Inclusive Brokerage Fields
- Commodity Description
- Country of Origin
- Preferential Treatment (Dropdown: Form E, Form D, Form AI, Form AK, Form JP)
- POD (Dropdown: NAIA, MICP, POM)
- Cargo Type (Dropdown: Dry, Reefer, Breakbulk, RORO)
- Delivery Address
- Mode (Dropdown: FCL, LCL, AIR, Multi-modal)
  - **If FCL**: 20ft, 40ft, 45ft, QTY
  - **If LCL**: GWT, DIMS
  - **If AIR**: GWT, CWT

#### Non-Regular Brokerage Fields
- Type of Entry (Dropdown: Consumption, Warehousing, PEZA)
- POD (Dropdown: NAIA, MICP, POM)
- Mode (Dropdown: FCL, LCL, AIR, Multi-modal)
  - **If FCL**: 20ft, 40ft, 45ft, QTY
  - **If LCL**: GWT, DIMS
  - **If AIR**: GWT, CWT
- Cargo Type (Dropdown: Dry, Reefer, Breakbulk, RORO)
- Commodity Description
- Delivery Address

### 2. Forwarding Service Form

#### Base Fields
- **Incoterms** (Dropdown: EXW, FOB, CFR, CIF, FCA, CPT, CIP, DAP, DDU, DDP)
- Cargo Type (Dropdown: Dry, Reefer, Breakbulk, RORO)
- Cargo Nature (Dropdown: General Cargo, Dangerous Goods (DG), Perishables, Valuables, Temperature Controlled)
- Commodity Description
- Delivery Address
- AOL/POL (Airport/Port of Loading)
- AOD/POD (Airport/Port of Discharge)
- Mode (Dropdown: FCL, LCL, AIR, Multi-modal)

#### Conditional Mode Fields
- **If FCL**: 20ft, 40ft, 45ft, QTY
- **If LCL**: GWT, DIMS
- **If AIR**: GWT, CWT

#### Conditional Incoterm Fields
- **If EXW**: Collection Address (highlighted section)
- **If EXW/FOB/FCA**: Carrier/Airline, Transit Time, Route, Stackable (Yes/No)
- **If DAP/DDU/DDP**: Delivery Address (highlighted section)

### 3. Trucking Service Form

#### Fields
- Pull Out (Location)
- **Delivery Address** - Required
- **Truck Type** (Dropdown: 4W, 6W, 10W, 20ft, 40ft, 45ft) - Required
- Quantity (Number input)
- Delivery Instructions (Textarea)

### 4. Marine Insurance Service Form

#### Fields
- **Commodity Description** - Required
- HS Code
- **AOL/POL** - Required
- **AOD/POD** - Required
- **Invoice Value** - Required (USD input)

### 5. Others Service Form

#### Fields
- **Service Description** (Textarea) - Required

## Vendor Management

Users can add multiple vendors at any time:

### Add Vendor Interface
1. Click "Add Vendor" button
2. Select vendor type: Overseas Agent / Local Agent / Subcontractor
3. Enter vendor name
4. Click "Add"

### Vendor Display
- Shows as cards with vendor name and type
- Each card has a remove (X) button
- Empty state shown when no vendors added

## Form Behavior

### Dynamic Rendering
- Service forms only appear when their service is selected in the General Details section
- Multiple service forms can be visible simultaneously
- Removing a service from selection hides its form but preserves the data (can be restored if re-selected)

### Conditional Fields
- Mode-specific fields (FCL/LCL/AIR) appear in highlighted sections
- Incoterm-specific fields appear based on the selected incoterm
- Visual highlighting differentiates conditional sections

### Validation
Form is valid when:
- Customer is selected
- At least one service is selected
- Date is provided
- At least one charge category exists (in pricing section)

### Save Actions

#### Save as Draft
- Saves quotation with status "Ongoing"
- All fields are optional (can be incomplete)
- Returns to quotation list

#### Submit for Approval
- Saves quotation with status "Waiting Approval"
- Requires form validation to pass
- Quotation is finalized and ready for management approval

## Design System Compliance

### Colors
- **Primary Green**: `var(--neuron-brand-green)` (#12332B)
- **Teal Green**: `var(--neuron-brand-teal)` (#0F766E)
- **Borders**: `var(--neuron-ui-border)`
- **Backgrounds**: White (#FFFFFF), Light Gray (#F8FBFB, #F9FAFB)

### Visual Elements
- **No Shadows**: Uses stroke borders only
- **Padding**: Consistent 32px 48px for sections
- **Border Radius**: 6-8px for cards and inputs
- **Typography**: 13-16px for body, 24px for headers

### Interactive Elements
- **Service Chips**: Toggle selection with teal background when active
- **Buttons**: Clear visual hierarchy (Cancel → Draft → Submit)
- **Conditional Sections**: Highlighted backgrounds to indicate context

## Usage Example

```tsx
import { QuotationBuilderV3 } from "./quotations/QuotationBuilderV3";

<QuotationBuilderV3
  onClose={() => console.log("Close")}
  onSave={(quotation) => console.log("Save", quotation)}
  initialData={existingQuotation} // Optional
  mode="create" // or "edit"
  customerData={customer} // Optional pre-fill
/>
```

## File Structure

```
/components/pricing/quotations/
├── QuotationBuilderV3.tsx           # Main container
├── GeneralDetailsSection.tsx         # Customer, services, date, vendors
├── BrokerageServiceForm.tsx         # Brokerage with 3 types
├── ForwardingServiceForm.tsx        # Forwarding with conditionals
├── TruckingServiceForm.tsx          # Trucking
├── MarineInsuranceServiceForm.tsx   # Marine Insurance
├── OthersServiceForm.tsx            # Others
├── ChargeCategoriesSection.tsx      # Pricing (existing)
└── FinancialSummaryPanel.tsx        # Financial summary (existing)
```

## Future Enhancements

### Potential Improvements
1. **Auto-population**: Automatically suggest charges based on selected services
2. **Service Templates**: Pre-configured service combinations for common scenarios
3. **Vendor Suggestions**: Smart vendor recommendations based on service type
4. **Field Dependencies**: Smarter field hiding/showing based on combinations
5. **Validation Messages**: Inline validation with helpful error messages
6. **Save Progress**: Auto-save drafts to prevent data loss
7. **Copy from Previous**: Quick-start from a previous quotation

### Data Integration
- Connect to customer database for live customer search
- Vendor database integration for vendor selection
- Service templates from configuration
- Historical data for smart suggestions

## Migration Notes

### From Old QuotationBuilder
The previous `QuotationBuilder` component has been replaced with `QuotationBuilderV3`. Key differences:

1. **Service Selection**: Now multi-select chips instead of checkboxes
2. **Dynamic Forms**: Service-specific forms appear/disappear based on selection
3. **Vendor Management**: Integrated into general details instead of separate section
4. **Conditional Logic**: More sophisticated field showing/hiding
5. **Better Organization**: Clearer visual hierarchy and grouping

### Backward Compatibility
Both builders use the same `QuotationNew` type, ensuring data compatibility. Existing quotations can be opened in the new builder without modification.
