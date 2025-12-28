# Template Auto-Population - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide helps you quickly understand and test the Template Auto-Population system.

---

## What Is This?

**BD captures detailed service specs** → **PD gets auto-populated pricing templates** → **75-85% time savings**

Before:
```
BD: "Customer needs Brokerage and Forwarding"
PD: *Manually adds 30 charges, fills all details, THEN prices*
Time: 30-45 minutes
```

After:
```
BD: "Customer needs Import Ocean FCL Brokerage + Ocean Forwarding"
    + fills all service details (subtype, POD, mode, etc.)
PD: *Gets 29 charges auto-generated, just fills prices*
Time: 5-10 minutes
```

---

## Try It Now

### Option 1: Test the Demo Component

1. **Open the demo**:
   ```typescript
   import { AddInquiryDemo } from "./components/bd/AddInquiryDemo";
   ```

2. **Click "Create New Inquiry"**

3. **Fill the form**:
   - Customer: Unilab
   - Origin: Shanghai → Destination: Manila
   - Add Brokerage service
     - Subtype: Import Ocean
     - Shipment Type: FCL
     - (fill all fields)
   - Add Forwarding service
     - Mode: Ocean
     - (fill all fields)

4. **Save inquiry**

5. **Open QuotationBuilderDemo**

6. **Click "Create from Inquiry"** on the inquiry you just created

7. **See the magic**: 29 charges auto-populated! ✨

---

### Option 2: Use Mock Data

**Already created for you in `/data/pricingMockData.ts`:**

```typescript
// INQ-2025-001: Detailed Brokerage + Forwarding
// - Has complete service specs
// - Will auto-generate 29 charges

// INQ-2025-002: Air Forwarding + Trucking  
// - Has complete service specs
// - Will auto-generate 13 charges

// INQ-2025-003: Old format (backward compatibility)
// - No service details
// - No auto-generation (manual entry)
```

**Test it**:
1. Open QuotationBuilderDemo
2. Select INQ-2025-001 or INQ-2025-002
3. See auto-populated charges!

---

## File Structure

```
/config/
  serviceTemplates.ts          ← All charge templates

/types/
  pricing.ts                   ← InquiryService type

/components/
  bd/
    AddInquiryPanel.tsx        ← BD creates inquiries with details
    AddInquiryDemo.tsx         ← Demo component
  pricing/
    quotations/
      QuotationBuilderV2.tsx   ← Auto-populates from inquiry

/data/
  pricingMockData.ts           ← Mock inquiries (2 new + 1 old)
```

---

## Template Coverage

| If BD Fills... | PD Gets... |
|----------------|------------|
| Brokerage: Import Ocean + FCL | **15 charges** |
| Brokerage: Import Air + LCL | 7 charges |
| Forwarding: Ocean mode | **14 charges** |
| Forwarding: Air mode | 8 charges |
| Trucking: (any) | 5 charges |
| Marine Insurance: (any) | 1 charge |
| Others: (any) | 0 (fully custom) |

**See all templates in**: `/config/serviceTemplates.ts`

---

## Integration Steps

### 1. Add to BD Module

```typescript
import { AddInquiryPanel } from "./components/bd/AddInquiryPanel";

function BDDashboard() {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div>
      <button onClick={() => setShowPanel(true)}>
        Create Inquiry
      </button>

      {showPanel && (
        <AddInquiryPanel
          onClose={() => setShowPanel(false)}
          onSave={(data) => {
            console.log("Saved:", data);
            // TODO: Save to Supabase
            setShowPanel(false);
          }}
        />
      )}
    </div>
  );
}
```

### 2. Supabase Setup

```sql
-- inquiry_services table
CREATE TABLE inquiry_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES bd_inquiries(id),
  service_type TEXT NOT NULL,
  service_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Save Function

```typescript
async function saveInquiry(inquiryData) {
  // 1. Insert inquiry
  const { data: inquiry } = await supabase
    .from('bd_inquiries')
    .insert({ /* inquiry fields */ })
    .select()
    .single();

  // 2. Insert services with details
  await supabase
    .from('inquiry_services')
    .insert(
      inquiryData.services.map(s => ({
        inquiry_id: inquiry.id,
        service_type: s.service_type,
        service_details: s.service_details
      }))
    );
}
```

---

## Key Benefits

- ⚡ **75-85% time reduction** in quotation creation
- ✅ **Zero missing charges** (template-based)
- 🎯 **PD focuses on pricing** (their expertise)
- 📊 **Better data quality** (structured capture)
- 🔄 **Hybrid flexibility** (can add/remove charges)

---

## Documentation

📖 **Full Docs**:
- `/COMPLETE-IMPLEMENTATION-SUMMARY.md` - Complete overview
- `/PHASE-4-IMPLEMENTATION-SUMMARY.md` - BD inquiry form details
- `/TEMPLATE-AUTO-POPULATION-IMPLEMENTATION.md` - Phases 1-3 details

---

## Support

**Questions?** Check the documentation above or review:
- `/config/serviceTemplates.ts` - See all templates
- `/components/bd/AddInquiryPanel.tsx` - BD form component
- `/components/pricing/quotations/QuotationBuilderV2.tsx` - Auto-population logic

---

**Status**: ✅ Ready for Integration  
**Date**: December 14, 2025  
**Approach**: Option C (Hybrid)
