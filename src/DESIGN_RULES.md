# Neuron OS Design Rules

## 🚨 CRITICAL RULES

### NO CENTRAL MODALS (EVER!)
**THIS IS AN ABSOLUTE RULE - NO EXCEPTIONS**

❌ **FORBIDDEN:**
```tsx
// DO NOT create central modals for ANY forms
<div className="fixed inset-0 flex items-center justify-center">
  <div className="bg-white rounded-lg">
    {/* Form content */}
  </div>
</div>
```

✅ **CORRECT:**
```tsx
// ALWAYS use side panels (sliding from right)
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  className="fixed right-0 top-0 h-full w-[920px]"
>
  {/* Form content */}
</motion.div>
```

**Why?** Side panels:
- Keep context visible
- Feel less intrusive
- Are more modern and professional
- Allow users to reference other data while filling forms
- Consistent with enterprise SaaS UX patterns

**⚠️ IMPORTANT:** This applies to ALL modules:
- ✅ Budget Requests - Side panel
- ✅ Expenses - Side panel
- ✅ Collections - Side panel
- ✅ Billings (Accounting) - Side panel
- ✅ Billings (Operations) - Side panel *(Fixed: was central modal)*
- ✅ E-Vouchers - Side panel
- ✅ All other forms - Side panel

---

## ✅ NEURON OS UI STANDARDS

### Design System Colors
- **Deep Green (Primary):** `#12332B`
- **Teal Green (Accent):** `#0F766E`
- **Pure White Background:** `#FFFFFF`
- **Border Color:** `var(--neuron-ui-border)` or `#E5E7EB`

### Layout Standards
- **Padding:** `32px 48px` for main content areas
- **Borders:** Use stroke borders instead of shadows
- **Visual Hierarchy:** Consistent throughout all modules

### Side Panel Standards
- **Position:** Fixed to right side of screen
- **Width:** `100%` with `maxWidth: "800px"` or `"900px"` depending on form complexity
- **Shadow:** `-4px 0 24px rgba(0, 0, 0, 0.1)`
- **Background:** Pure white `#FFFFFF`
- **Z-Index:** `9999` to overlay everything

### Form Structure
All forms should follow this structure:
1. **Header** (with logo, title, close button)
2. **Scrollable Content Area** (form fields grouped by sections)
3. **Fixed Footer** (with action buttons)

---

## 📝 COMPONENT PATTERNS

### E-Voucher Forms
All E-Voucher forms must:
- Open as side panels from the right
- Have consistent formal document layout with logo and E-Voucher Ref No.
- Show voucher type in the document header (REQUEST FOR PAYMENT, EXPENSE VOUCHER, etc.)
- Group fields into logical sections with uppercase headers
- Use consistent spacing and typography
- Have "Save as Draft" and context-appropriate submit buttons in footer

**IMPORTANT: Use the unified AddRequestForPaymentPanel component**
```tsx
// ✅ CORRECT - Unified component with context prop
import { AddRequestForPaymentPanel } from "./components/accounting/AddRequestForPaymentPanel";

<AddRequestForPaymentPanel
  context="bd"  // or "accounting" | "operations" | "collection" | "billing"
  isOpen={isOpen}
  onClose={onClose}
  onSave={onSuccess}
  defaultRequestor={currentUser?.name}
/>
```

**Context Types:**
- `"bd"` → Budget Request (REQUEST FOR PAYMENT header)
- `"accounting"` → Direct Expense (EXPENSE VOUCHER header)
- `"operations"` → Booking Expense (EXPENSE VOUCHER header)
- `"collection"` → Customer Payment (COLLECTION VOUCHER header)
- `"billing"` → Customer Invoice (BILLING VOUCHER header)

**Why unified?**
- Single formal document design across all voucher types
- Context-aware labels, headers, and validation
- Consistent UX and visual hierarchy
- One source of truth for all E-Voucher forms
- Easy to maintain and extend

### Module Integration
- Budget Requests → `AddRequestForPaymentPanel` with `context="bd"`
- Expenses → `AddRequestForPaymentPanel` with `context="accounting"` or `"operations"`
- Collections → `AddRequestForPaymentPanel` with `context="collection"`
- Billings → `AddRequestForPaymentPanel` with `context="billing"`

---

## 🎯 ENFORCEMENT

When creating new components:
1. ❌ If you're centering a modal with `alignItems: "center"` and `justifyContent: "center"` → STOP
2. ✅ Instead, position fixed to the right with a slide-in animation
3. ✅ Reference existing side panels for structure

**This is a hard rule. No exceptions.**

---

## 📚 REFACTORING HISTORY

### E-Voucher Form Consolidation (January 2026)
**Problem:** We initially had 4 separate E-Voucher form components with 90% duplicate code.

**Solution:** Unified all E-Voucher types into the existing `AddRequestForPaymentPanel.tsx` component:
- Extended context prop to support 5 types: `"bd" | "accounting" | "operations" | "collection" | "billing"`
- Context-aware headers, titles, and validation logic
- Single formal document design (logo, date, E-Voucher Ref No.) across all types
- Shared line items, payment details, and workflow integration

**Result:**
- ✅ One component handles all E-Voucher types
- ✅ Consistent formal document design throughout
- ✅ Context-aware behavior and labels
- ✅ Single point of maintenance
- ✅ Easy to add new voucher types (just add new context)

**Migration completed:** All E-Voucher forms now use `AddRequestForPaymentPanel` with appropriate context.