# Philippine Peso Icon Update

## Overview

All dollar sign ($) icons have been replaced with the Philippine Peso (₱) SVG icon throughout the Quotation Builder V2 to maintain brand consistency and localization for the Philippine market.

## Changes Made

### Icon Replacement

**Removed**: `DollarSign` from lucide-react  
**Added**: `PhilippinePeso` custom SVG component

### Files Updated

1. **`/components/pricing/quotations/PricingBreakdown.tsx`**
   - **Before**: `import { DollarSign } from "lucide-react"`
   - **After**: `import { PhilippinePeso } from "../../icons/PhilippinePeso"`
   - **Usage**: Header for "PRICING BREAKDOWN" section

2. **`/components/pricing/quotations/BrokerageFormV2.tsx`**
   - Removed unused `DollarSign` import
   - No visual changes (wasn't being used)

3. **`/components/pricing/quotations/MarineInsuranceFormV2.tsx`**
   - Removed unused `DollarSign` import
   - No visual changes (wasn't being used)

## Philippine Peso Icon Details

### SVG Source
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
     fill="none" stroke="currentColor" stroke-width="2" 
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 11H4"/>
  <path d="M20 7H4"/>
  <path d="M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7"/>
</svg>
```

### Component Location
`/components/icons/PhilippinePeso.tsx`

### Component Interface
```typescript
interface PhilippinePesoProps {
  size?: number;        // Default: 24
  className?: string;   // Optional CSS classes
  style?: React.CSSProperties;  // Inline styles
}
```

### Usage Example
```tsx
import { PhilippinePeso } from "../../icons/PhilippinePeso";

<PhilippinePeso size={16} style={{ color: "#0F766E" }} />
```

## Visual Impact

### Before
```
💵 PRICING BREAKDOWN
```

### After
```
₱ PRICING BREAKDOWN
```

## Benefits

### 1. **Brand Localization**
- ✅ Specifically designed for Philippine market
- ✅ Uses local currency symbol
- ✅ Reduces cognitive load for Filipino users

### 2. **Visual Consistency**
- ✅ Matches the peso symbol used throughout the app (₱)
- ✅ Consistent with Neuron OS branding
- ✅ Professional appearance

### 3. **Accessibility**
- ✅ Clear currency indication
- ✅ Recognizable symbol for target audience
- ✅ Proper sizing with `currentColor` (inherits text color)

## Implementation Details

### Icon Properties
- **Scalable**: Accepts size prop for different contexts
- **Color Adaptive**: Uses `currentColor` to match surrounding text
- **Consistent Styling**: Matches lucide-react icon style (stroke-based)
- **Accessible**: Same viewBox and attributes as lucide icons

### Where It's Used

1. **PricingBreakdown Component**
   - Section header: "PRICING BREAKDOWN"
   - Size: 16px
   - Color: Inherits from parent (var(--neuron-brand-green))
   - Context: Above the 6 pricing categories

### Integration with Design System

The Philippine Peso icon follows the same pattern as lucide-react icons:
- ✅ SVG-based (scalable)
- ✅ Stroke rendering (not fill)
- ✅ Consistent stroke-width: 2
- ✅ Round line caps and joins
- ✅ 24x24 viewBox standard
- ✅ currentColor for dynamic coloring

## Testing Checklist

- [x] Icon renders correctly in PricingBreakdown
- [x] Size prop works (16px in current usage)
- [x] Color inherits correctly from parent styles
- [x] No console errors or warnings
- [x] Matches design system aesthetics
- [x] Accessible to screen readers (decorative, paired with text)

## Future Considerations

### Other Places to Apply Philippine Peso Icon

Consider replacing dollar signs in:
- [ ] Price input fields labels
- [ ] Financial summary tables
- [ ] Invoice displays
- [ ] Payment forms
- [ ] Revenue/expense reports
- [ ] Dashboard financial widgets

### Currency Formatting

Ensure all monetary displays use Philippine Peso format:
```typescript
// Correct
₱45,000.00

// Not
$45,000.00
USD 45,000
```

## Rollback Plan

If needed, reverting is simple:

```typescript
// Change from:
import { PhilippinePeso } from "../../icons/PhilippinePeso";
<PhilippinePeso size={16} />

// Back to:
import { DollarSign } from "lucide-react";
<DollarSign size={16} />
```

---

**Status**: ✅ Complete  
**Date**: December 13, 2025  
**Impact**: Visual only, no functional changes  
**Breaking Changes**: None
