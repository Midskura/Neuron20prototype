# Quotation Builder V2 - Refactor Summary

## What Was Done

### 1. Updated Type System (`/types/pricing.ts`)
✅ Added detailed service type interfaces:
- `BrokerageDetails` - All brokerage-specific fields
- `ForwardingDetails` - Forwarding with incoterms, routes
- `TruckingDetails` - Truck type, delivery info
- `MarineInsuranceDetails` - Insurance-specific data
- `OthersDetails` - Free-form service description

✅ Restructured quotation line items:
- Added `buying_price` and `selling_price`
- Added `vendor_id` link to vendor entities
- Added `line_total` calculated field
- Grouped by 6 categories (not just generic breakdown)

✅ Added predefined charge types:
- `CHARGE_TYPES` constant with lists per category
- Freight, Origin/Destination Local, Reimbursable, Brokerage, Other

✅ Updated quotation structure:
- Added `quotation_name` (user-defined title)
- Added `inquiry_id` link (relay race pattern)
- Changed `services` from simple array to `QuotationService[]`
- Each service contains details + line_items
- Added "Draft" status

### 2. Created New Components

#### `/components/pricing/quotations/QuotationBuilderV2.tsx`
The main refactored builder with:
- **Inquiry Integration**: Accepts `inquiryId` prop, fetches and displays inquiry reference
- **Customer Inheritance**: Auto-loads customer from inquiry (read-only display)
- **Auto-numbering**: Generates QN-YYYY-### format
- **Service Management**: Select services with accordion-style details
- **Real-time Totals**: Calculates and displays totals at service and quotation level
- **Draft/Final Saving**: Two save options with different statuses
- **Philippine Peso Icon**: Uses custom SVG icon instead of generic dollar sign

#### `/components/pricing/quotations/PricingBreakdown.tsx`
Comprehensive pricing management:
- **6 Category Sections**: Collapsible category containers
- **Line Item Table**: Full CRUD for charges within each category
- **Vendor Assignment**: Dropdown to link vendors to line items
- **Buying/Selling Prices**: Conditional buying price field (only if vendor assigned)
- **Predefined Charge Types**: Dropdown filtered by category
- **Units**: Flexible unit selection (per shipment, per CBM, per kg, etc.)
- **Auto-calculations**: Line totals, category subtotals
- **Add/Remove**: Easy line item management
- **Philippine Peso Icon**: Custom ₱ icon for branding consistency

#### Service Detail Forms (V2)
All using **CustomDropdown with icons** for consistency:

**`BrokerageFormV2.tsx`**
- Subtype selection (Import Air, Import Ocean, Export Air, Export Ocean)
- Shipment type (FCL, LCL, Consolidation, Break Bulk)
- Comprehensive fields: POD, mode, cargo type, commodity, declared value
- Regulatory fields: Country of origin, preferential treatment, PSIC, AEO

**`ForwardingFormV2.tsx`**
- Incoterms dropdown (EXW, FOB, CIF, FCA, CPT, CIP, DAP, DPU, DDP)
- Cargo type and mode selection
- Route fields: AOL, POL, AOD, POD
- Commodity and delivery address

**`TruckingFormV2.tsx`**
- Comprehensive truck type options (10W, Closed Van, Refrigerated, Wing Van, AW, DW, 2W, 3W, 4Br)
- Pull out and delivery locations
- Delivery instructions (textarea)

**`MarineInsuranceFormV2.tsx`**
- Commodity description and HS code
- Route fields: AOL, POL, AOD, POD
- Invoice value (required for premium calculation)

**`OthersFormV2.tsx`**
- Simple free-form service description

### 3. Updated Integration

**`/components/pricing/CreateQuotation.tsx`**
- Now uses `QuotationBuilderV2`
- Passes `inquiryId` from inquiry data
- Ready for Supabase integration (commented TODO)

### 4. Documentation

**`/components/pricing/QUOTATION-BUILDER-V2-REFACTOR.md`**
Comprehensive documentation including:
- Business context and workflow
- Technical implementation details
- Database schema (SQL)
- User flow diagrams
- UI features and validation
- Status workflow
- Future enhancements roadmap
- Migration notes
- Testing checklist

## Business Logic Implemented

### Relay Race Pattern
✅ BD creates Inquiries → Pricing creates Quotations from Inquiries
✅ Inquiry data pre-populates quotation (customer, services, routes)
✅ Inquiry reference displayed prominently
✅ Customer is inherited (not re-selectable)

### Services as Line Items
✅ Each service has:
  - Service-specific metadata (detail forms)
  - Pricing breakdown across 6 categories
  - Multiple line items per category
  - Subtotal calculation

### Vendor Integration
✅ Vendors are entities (not just text)
✅ 3 vendor types: Overseas Agent, Local Agent, Subcontractor
✅ Line items can be linked to vendors
✅ Buying price (cost) + Selling price (revenue) model
✅ Implicit margin tracking: `selling_price - buying_price`

### Pricing Categories (6)
1. **Freight** - Air/Ocean freight charges
2. **Origin Local Charges** - Pick up, handling, documentation at origin
3. **Destination Local Charges** - Handling, arrastre, wharfage at destination
4. **Reimbursable Charges** - AWB, B/L, and other pass-through costs
5. **Brokerage Charges** - Entry, clearance, permits, VAT
6. **Other Charges** - Insurance, storage, demurrage, detention

### Predefined Charge Types
✅ Each category has specific charge types
✅ Dropdown shows relevant charges per category
✅ Reduces data entry errors
✅ Maintains consistency across quotations

## UI/UX Improvements

### Visual Hierarchy
✅ **Section Numbering**: 01, 02, 03 for clear progression
✅ **Collapsible Sections**: Reduce cognitive load
✅ **Service Pills**: Visual service selection
✅ **Category Accordion**: Organized pricing breakdown
✅ **Color Coding**: 
  - Green badges for totals
  - Yellow background for buying prices (cost awareness)
  - Status-specific colors

### Neuron Design System Compliance
✅ Deep green (#12332B) and teal green (#0F766E) accents
✅ Pure white backgrounds
✅ Stroke borders (no shadows)
✅ Consistent padding (32px 48px for main areas)
✅ **CustomDropdown with icons** for all form selectors
✅ Proper typography (no font size/weight overrides unless specified)

### User Experience
✅ **Auto-expand**: Services expand when selected, categories when first item added
✅ **Real-time Calculations**: Totals update immediately
✅ **Conditional Fields**: Buying price only shows when vendor assigned
✅ **Clear Actions**: Draft vs Generate with distinct styling
✅ **Validation**: Required fields marked with *
✅ **Placeholder Text**: Helpful examples in inputs

## Database Schema

```
quotations
├── id, quotation_number, quotation_name
├── inquiry_id (FK → bd_inquiries)
├── customer_id, customer_name
├── credit_terms, validity, currency
├── subtotal, tax, total
├── status, notes
└── created_by, created_at, updated_at, approved_by, approved_at

quotation_services (junction + details)
├── id, quotation_id (FK)
├── service_type, service_subtype
├── service_details (JSONB)
└── subtotal

quotation_line_items
├── id, quotation_service_id (FK)
├── category, charge_type, description
├── quantity, unit
├── selling_price, buying_price
├── vendor_id (FK → vendors)
└── line_total
```

## What's Ready

✅ **Frontend Complete**: All components built and styled
✅ **Type System**: Fully typed with TypeScript
✅ **Mock Data**: Works with existing mock data
✅ **Design System**: Follows Neuron style guide
✅ **Documentation**: Comprehensive guides written

## What's Next (Supabase Integration)

### Phase 1: Database Setup
```sql
-- Create tables (schema provided in documentation)
-- Set up RLS policies
-- Create functions for auto-numbering
-- Add triggers for updated_at timestamps
```

### Phase 2: API Integration
```typescript
// Implement Supabase queries:
- createQuotation()
- updateQuotation()
- getQuotationsByInquiry()
- getQuotationById()
- deleteQuotation()
```

### Phase 3: Real-time Features
```typescript
// Add Supabase realtime subscriptions:
- Listen to quotation status changes
- Notify when inquiry receives quotation
- Update UI when vendor data changes
```

## Migration Path

### Option 1: Parallel Run
- Keep old QuotationBuilder for existing quotations
- Use QuotationBuilderV2 for new quotations
- Migrate data gradually

### Option 2: Full Migration
- Create migration script to convert old format
- Update all existing quotations
- Switch to V2 completely
- Remove old builder

### Recommended: Option 1
- Less risky
- Allows testing in production
- Users can transition gradually
- Rollback is easier

## Testing Required

### Functional Tests
- [ ] Create quotation from inquiry
- [ ] Create quotation standalone
- [ ] Add multiple services
- [ ] Add line items to all categories
- [ ] Assign vendors
- [ ] Calculate totals (all levels)
- [ ] Save as draft
- [ ] Generate quotation
- [ ] Edit draft quotation

### Integration Tests
- [ ] Fetch inquiry data correctly
- [ ] Load customer data correctly
- [ ] Load vendor list correctly
- [ ] Save to database (when Supabase integrated)
- [ ] Update inquiry status when quotation created

### UI Tests
- [ ] All dropdowns work
- [ ] Collapsible sections work
- [ ] Add/remove line items
- [ ] Number inputs handle decimals
- [ ] Validation shows on required fields
- [ ] Responsive layout

### Edge Cases
- [ ] Empty line items (prevent submission)
- [ ] Missing required service details
- [ ] Vendor assigned but no buying price
- [ ] Large numbers (display formatting)
- [ ] Long text in descriptions (overflow handling)

## Files Changed/Created

### New Files (8)
```
/components/pricing/quotations/QuotationBuilderV2.tsx
/components/pricing/quotations/PricingBreakdown.tsx
/components/pricing/quotations/BrokerageFormV2.tsx
/components/pricing/quotations/ForwardingFormV2.tsx
/components/pricing/quotations/TruckingFormV2.tsx
/components/pricing/quotations/MarineInsuranceFormV2.tsx
/components/pricing/quotations/OthersFormV2.tsx
/components/pricing/QUOTATION-BUILDER-V2-REFACTOR.md
```

### Modified Files (2)
```
/types/pricing.ts                          # Updated type definitions
/components/pricing/CreateQuotation.tsx    # Uses QuotationBuilderV2
```

## Performance Considerations

### Optimization Done
✅ Collapsible sections (render only when expanded)
✅ Efficient state updates (granular, not full re-renders)
✅ Calculated fields (not stored, computed on the fly)

### Future Optimizations
- [ ] Lazy load vendor list (if very large)
- [ ] Debounce line item calculations
- [ ] Virtual scrolling for large line item lists
- [ ] Memoize expensive calculations

## Security Considerations

### Frontend Validation
✅ Required field checks
✅ Number input constraints (min, max, step)
✅ Type safety with TypeScript

### Backend Required (Supabase)
- [ ] Row Level Security policies
- [ ] User permissions (who can create/edit)
- [ ] Data validation on server
- [ ] Audit logging for changes
- [ ] API rate limiting

## Accessibility

### Implemented
✅ Semantic HTML structure
✅ Keyboard navigation for buttons
✅ Clear labels for all inputs
✅ Visual hierarchy with headings

### To Improve
- [ ] ARIA labels for complex interactions
- [ ] Screen reader announcements
- [ ] Focus management in modals
- [ ] High contrast mode support

---

**Implementation Status**: ✅ **COMPLETE**  
**Ready for**: Integration Testing → Supabase Integration → Production Deployment  
**Estimated Integration Time**: 2-3 days (Supabase setup + testing)  
**Date**: December 13, 2025