# Design System Alignment - All Modules

## Overview
This document outlines the design system updates needed to ensure all modules (Dashboard, Clients, Bookings, Accounting, Reports, HR, Admin) follow consistent styling matching the Bookings reference design.

## Design System Standards

### 1. Page Header Pattern
**Structure:**
```tsx
<div style={{
  padding: "32px 32px 24px 32px",
  borderBottom: "1px solid var(--neuron-ui-border)",
  background: "var(--neuron-bg-page)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start"
}}>
  <div>
    <h1 style={{
      fontSize: "28px",
      fontWeight: 600,
      color: "var(--neuron-ink-primary)",
      lineHeight: "36px",
      marginBottom: "4px"
    }}>Page Title</h1>
    <p style={{
      fontSize: "14px",
      color: "var(--neuron-ink-muted)",
      lineHeight: "20px"
    }}>Page subtitle/description</p>
  </div>
  <ActionButton />
</div>
```

### 2. Primary Action Button
```tsx
<button style={{
  background: "var(--neuron-brand-green)",
  color: "white",
  height: "40px",
  paddingLeft: "16px",
  paddingRight: "16px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px"
}}>
  <Plus size={16} />
  Action Label
</button>
```

### 3. KPI Card Pattern
```tsx
<div style={{
  flex: 1,
  background: "transparent",
  borderRadius: "12px",
  border: "1px solid var(--neuron-ui-border)",
  padding: "12px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "6px"
}}>
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <Icon size={14} style={{ color: "var(--neuron-ink-muted)" }} />
    <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--neuron-ink-muted)" }}>
      LABEL
    </span>
  </div>
  <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--neuron-brand-green)", lineHeight: "1.2" }}>
    96
  </div>
  <div style={{ fontSize: "11px", color: "var(--neuron-ink-muted)" }}>
    Subtext description
  </div>
</div>
```

### 4. Table Header Pattern
```tsx
<th style={{
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--neuron-ink-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  borderBottom: "1px solid var(--neuron-ui-border)"
}}>
  COLUMN HEADER
</th>
```

### 5. Table Row Pattern
```tsx
<tr style={{
  borderBottom: "1px solid var(--neuron-ui-divider)",
  transition: "background 120ms ease-out"
}}
onMouseEnter={(e) => e.currentTarget.style.background = "var(--neuron-state-hover)"}
onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
>
  <td style={{
    padding: "16px",
    fontSize: "13px",
    color: "var(--neuron-ink-secondary)"
  }}>Cell content</td>
</tr>
```

### 6. Status Pill Pattern
```tsx
<div style={{
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 500,
  backgroundColor: "#E8F2EE", // Success variant
  color: "#0F766E"
}}>
  Status Label
</div>
```

**Status Colors:**
- Success: `bg: #E8F2EE, text: #0F766E`
- Warning: `bg: #FFF3E0, text: #F25C05`
- Danger: `bg: #FEE2E2, text: #EF4444`
- Neutral: `bg: #F3F4F6, text: #6B7280`

### 7. Search/Filter Bar Pattern
```tsx
<div style={{
  display: "flex",
  gap: "12px",
  padding: "16px 24px",
  borderBottom: "1px solid var(--neuron-ui-border)"
}}>
  <div style={{ flex: 1, position: "relative" }}>
    <Search size={16} style={{
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--neuron-ink-muted)"
    }} />
    <input
      placeholder="Search..."
      style={{
        width: "100%",
        height: "40px",
        paddingLeft: "40px",
        paddingRight: "12px",
        border: "1px solid var(--neuron-ui-border)",
        borderRadius: "8px",
        fontSize: "14px"
      }}
    />
  </div>
  {/* Filter dropdowns, Export button, etc. */}
</div>
```

### 8. Main Content Container
```tsx
<div style={{
  padding: "24px 32px",
  background: "var(--neuron-bg-page)",
  flex: 1,
  overflowY: "auto"
}}>
  {/* Page content */}
</div>
```

### 9. Card/Panel Pattern
```tsx
<div style={{
  background: "var(--neuron-bg-elevated)",
  border: "1px solid var(--neuron-ui-border)",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "var(--elevation-1)"
}}>
  <h3 style={{
    fontSize: "16px",
    fontWeight: 600,
    color: "var(--neuron-ink-primary)",
    marginBottom: "16px"
  }}>Section Title</h3>
  {/* Content */}
</div>
```

## Module-Specific Updates

### Dashboard
- ✅ Already uses KPI cards correctly
- ✅ Good visual hierarchy
- Keep the gradient banner as unique element
- Ensure all tables follow table pattern above

### Clients
- Update header to match pattern
- Change action button from orange `#F25C05` to green `var(--neuron-brand-green)`
- Ensure table headers use uppercase 11px muted text
- Verify status pills match color scheme

### Bookings
- ✅ Reference design - already correct
- No changes needed

### Accounting
- Update page header to match pattern
- Ensure tabs styling is consistent
- Update table headers to uppercase pattern
- Check KPI cards match spec

### Reports
- Update page header structure
- Ensure filter bar matches pattern
- Update chart cards to use consistent borders/padding
- Verify KPI metrics use correct typography

### HR
- Update page header
- Ensure tab styling is consistent
- Update table headers to match pattern
- Employee cards should use consistent styling

### Admin/Settings
- Update page header
- Use consistent tab styling
- Update all table headers
- Ensure form inputs match design system

## Color Tokens Reference

```css
--neuron-bg-page: #FAFBFC
--neuron-bg-elevated: #FFFFFF
--neuron-ui-border: #E5E9F0
--neuron-ui-divider: #EDF0F3
--neuron-ink-primary: #0A1D4D
--neuron-ink-secondary: #475569
--neuron-ink-muted: #94A3B8
--neuron-brand-green: #0F766E
--neuron-brand-green-100: #E8F2EE
--neuron-state-hover: rgba(15, 118, 110, 0.04)
--neuron-state-selected: rgba(15, 118, 110, 0.08)
--neuron-semantic-success: #10b981
--neuron-semantic-warn: #F59E0B
--neuron-semantic-danger: #EF4444
```

## Typography Standards

### Do NOT use Tailwind classes for:
- Font sizes (use inline `fontSize` instead)
- Font weights (use inline `fontWeight` instead)
- Line heights (use inline `lineHeight` instead)

### Standard Font Sizes:
- Page Title: 28px / 600 / 36px line-height
- Section Title: 16px / 600 / 24px line-height
- Body Text: 14px / 400 / 20px line-height
- Table Header: 11px / 600 / uppercase / 0.5px letter-spacing
- Table Cell: 13px / 400
- Small Text: 12px / 400
- Tiny Text: 11px / 400

## Spacing Standards
- Page padding: 32px
- Section padding: 24px
- Card padding: 24px (lg), 16px (md), 12px (sm)
- Gap between sections: 24px
- Gap between elements: 12px-16px
- Gap between related items: 8px

## Implementation Priority
1. **High**: Page headers, action buttons (consistent CTAs)
2. **High**: Table headers and styling
3. **Medium**: KPI cards where applicable
4. **Medium**: Status pills
5. **Low**: Fine-tuning spacing and borders

## Component to Use
- Use `<NeuronPageHeader>` component for all page headers
- Use `<NeuronCard>` for elevated panels
- Use `<NeuronStatusPill>` for status indicators
- Use design tokens from `globals.css`

## Testing Checklist
- [ ] All page titles are 28px/600
- [ ] All subtitles are 14px muted
- [ ] All action buttons use green brand color
- [ ] All table headers are 11px uppercase with 0.5px letter-spacing
- [ ] All status pills use correct color variants
- [ ] Hover states work on interactive elements
- [ ] Spacing is consistent (32px page, 24px sections, 16px cards)
- [ ] No Tailwind typography classes used
