# Neuron OS · Bookings – Reference Layout Implementation

## Overview
Complete restructure of Bookings module to match Reference 1 layout: page title + CTA header, single-line filter bar, KPI cards retained, and table with two date groups.

---

## 🎯 Implementation Summary

### Key Changes
1. **Navbar Logo**: Neuron logo moved to global TopNav component
2. **Page Header**: Added "Bookings" title + "Create New Booking" CTA
3. **Filter Bar**: Kept single-line layout below header
4. **KPI Cards**: Retained 4-card layout between filters and table
5. **Table Data**: Updated to show 6 rows across 2 date groups (SUN, OCT 26 and SAT, OCT 25)

---

## 📐 Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  TopNav (Global Navbar with Neuron Logo)                  │
├────────────────────────────────────────────────────────────┤
│  Page Header Row                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [Bookings]                    [+ Create New Booking] │ │
│  │ Manage Bookings                                      │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Filter Bar (Single Line)                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [◀ Nov 2025 ▶] [Search...] [Types▾] [Clients▾]      │ │
│  │                     [Modes▾] [Status▾] [Export CSV]  │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  KPI Cards (4-up)                                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│  │ 96 │ │96% │ │ 12 │ │342 │                             │
│  └────┘ └────┘ └────┘ └────┘                             │
├────────────────────────────────────────────────────────────┤
│  Bookings Table                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ SUN, OCT 26                                          │ │
│  │ ☐ | LCL-IMPS-001 | Puregold | ... | 🟢 | ETA        │ │
│  │ ☐ | FCL-EXPS-002 | Unilab | ... | 🟢 | ETA          │ │
│  │ ☐ | LCL-IMPS-003 | SM Retail | ... | 🟢 | ETA       │ │
│  │                                                       │ │
│  │ SAT, OCT 25                                          │ │
│  │ ☐ | FCL-IMPS-004 | Robinsons | ... | 🟢 | ETA       │ │
│  │ ☐ | LCL-IMPS-005 | San Miguel | ... | 🟢 | ETA      │ │
│  │ ☐ | FCL-IMPS-006 | Jollibee | ... | 🟢 | ETA        │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Spacing Hierarchy
```
TopNav (fixed)
  ↓ [Content starts]
32px page top padding
  ↓
Page Header Row
  ↓ 24px gap
Filter Bar
  ↓ 24px gap
KPI Cards
  ↓ 24px gap
Table
  ↓ 32px bottom padding
```

---

## 🔧 Component Changes

### 1. TopNav (Navbar + Logo)

**File**: `/components/TopNav.tsx`

**Changes**:
- Added logo import: `import logoImage from "figma:asset/..."`
- Replaced JJB brand div with Neuron logo
- Logo height: **24px** (aspect ratio preserved)
- Vertically aligned with nav items

**Implementation**:
```tsx
import logoImage from "figma:asset/28c84ed117b026fbf800de0882eb478561f37f4f.png";

// Inside TopNav component
<img
  src={logoImage}
  alt="Neuron"
  style={{
    height: "24px",
    width: "auto",
  }}
/>
```

**Before**:
```tsx
<div className="w-8 h-8 bg-[#F25C05] rounded-lg flex items-center justify-center">
  <span className="text-white text-[14px]">JJB</span>
</div>
<div>
  <h1 className="text-white text-[16px]">JJB Group</h1>
</div>
```

**After**:
```tsx
<img src={logoImage} alt="Neuron" style={{ height: "24px", width: "auto" }} />
```

---

### 2. Page Header Row (Title + CTA)

**New Section**: Added above filter bar

**Layout**:
```tsx
<div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px"
}}>
  {/* Left: Title + Subtext */}
  <div>
    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#12332B" }}>
      Bookings
    </h1>
    <p style={{ fontSize: "14px", color: "#667085" }}>
      Manage Bookings
    </p>
  </div>
  
  {/* Right: CTA Button */}
  <button style={{
    height: "48px",
    padding: "0 24px",
    borderRadius: "16px",
    background: "#F25C05",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(242, 92, 5, 0.2)"
  }}>
    <Plus size={20} />
    Create New Booking
  </button>
</div>
```

**Specifications**:

#### Left Side
- **Title**: "Bookings"
  - Font size: 24px
  - Font weight: 700
  - Color: #12332B (primary dark)
  - Margin bottom: 4px

- **Subtext**: "Manage Bookings"
  - Font size: 14px
  - Color: #667085 (neutral gray)

#### Right Side
- **CTA Button**: "Create New Booking"
  - Height: **48px** (per spec)
  - Padding: 0 24px
  - Border radius: **16px** (per spec)
  - Background: **#F25C05** (orange token)
  - Color: #FFFFFF
  - Font size: 14px
  - Font weight: 600
  - Icon: Plus (20px)
  - Gap: 8px
  - Shadow: `0 4px 12px rgba(242, 92, 5, 0.2)`

**Hover State**:
```tsx
onMouseEnter: {
  background: "#D94F04" (darker)
  boxShadow: "0 6px 16px rgba(242, 92, 5, 0.3)" (stronger)
}
```

---

### 3. Header / Filter Bar

**Kept**: Single-line layout from previous implementation

**Position**: Immediately below page header row

**Spacing**: 24px gap from page header

**No changes** to internal structure:
- Month navigator (left)
- Search input (fills available space)
- 4 filter pills (truncate with ellipsis)
- Export CSV button (right)

---

### 4. KPI Cards

**Kept**: 4-card layout

**Position**: Between filter bar and table

**Spacing**: 24px gap above and below

**No changes** to:
- Values (96, 96%, 12, 342)
- Icons (Truck, Clock, FileCheck, CheckCircle2)
- Styling (white cards, borders, shadows)

---

### 5. Bookings Table

**Major Update**: Two date groups with 6 total rows

#### Data Structure
```tsx
const bookingGroups = [
  {
    date: "2025-10-26",
    label: "SUN, OCT 26",
    bookings: [
      { id: "1", trackingNo: "LCL-IMPS-001-SEA", client: "Puregold", ... },
      { id: "2", trackingNo: "FCL-EXPS-002-SEA", client: "Unilab", ... },
      { id: "3", trackingNo: "LCL-IMPS-003-AIR", client: "SM Retail", ... },
    ]
  },
  {
    date: "2025-10-25",
    label: "SAT, OCT 25",
    bookings: [
      { id: "4", trackingNo: "FCL-IMPS-004-SEA", client: "Robinsons Retail", ... },
      { id: "5", trackingNo: "LCL-IMPS-005-SEA", client: "San Miguel Corp", ... },
      { id: "6", trackingNo: "FCL-IMPS-006-SEA", client: "Jollibee Foods Corp", ... },
    ]
  }
];
```

#### Table Rows (Exact Data)

**Group 1: SUN, OCT 26**

| # | Tracking No. | Client | Route | Status | Delivery |
|---|--------------|--------|-------|--------|----------|
| 1 | LCL-IMPS-001-SEA | Puregold | 🚚 Shanghai → Manila | For Delivery | ETA • 2025-10-26 |
| 2 | FCL-EXPS-002-SEA | Unilab | 🚚 Manila → Singapore | For Delivery | ETA • 2025-10-26 |
| 3 | LCL-IMPS-003-AIR | SM Retail | 🚚 Busan → Manila | For Delivery | ETA • 2025-10-26 |

**Group 2: SAT, OCT 25**

| # | Tracking No. | Client | Route | Status | Delivery |
|---|--------------|--------|-------|--------|----------|
| 4 | FCL-IMPS-004-SEA | Robinsons Retail | 🚚 Ningbo → Manila | For Delivery | ETA • 2025-10-25 |
| 5 | LCL-IMPS-005-SEA | San Miguel Corp | 🚚 Xiamen → Manila | For Delivery | ETA • 2025-10-25 |
| 6 | FCL-IMPS-006-SEA | Jollibee Foods Corp | 🚚 Port Klang → Manila | For Delivery | ETA • 2025-10-25 |

#### Rendering Logic
```tsx
{bookingGroups.map((group) => (
  <div key={group.date}>
    {/* Date Group Header */}
    <div style={{
      padding: "12px 20px",
      background: "#F9FAFB",
      borderBottom: "1px solid #E5E9F0"
    }}>
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "#667085",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        {group.label}
      </span>
    </div>

    {/* Rows for this date */}
    {group.bookings.map((booking) => (
      <div key={booking.id}>
        {/* Row content */}
      </div>
    ))}
  </div>
))}
```

#### Table Grid
```css
gridTemplateColumns: "40px 200px 180px 1fr 160px 180px"
```

**Columns**:
1. **40px**: Checkbox
2. **200px**: Tracking No.
3. **180px**: Client (increased from 150px for longer names)
4. **1fr**: Route (flexible)
5. **160px**: Status
6. **180px**: Delivery

#### Header Row
- Height: **44px**
- Background: #F9FAFB
- Border bottom: 1px solid #E5E9F0
- Font: 12px, 600 weight, #667085
- Labels: **UPPERCASE** (e.g., "TRACKING NO.", "CLIENT")

#### Date Group Row
- Padding: 12px 20px
- Background: #F9FAFB
- Border bottom: 1px solid #E5E9F0
- Font: 11px, 600 weight, uppercase, #667085
- Letter spacing: 0.5px

#### Data Rows
- Height: **56px**
- Padding: 0 20px
- Border bottom: 1px solid #F3F4F6
- Hover: Background #F9FAFB
- Cursor: pointer
- Transition: background 120ms ease-out

---

## 🎨 Design Tokens

### Spacing
```css
--page-padding: 32px;
--content-max-width: 1140px;
--section-gap: 24px;
--kpi-gap: 24px;
--filter-gap: 12px;
```

### Page Header
```css
--title-font-size: 24px;
--title-font-weight: 700;
--title-color: #12332B;
--subtext-font-size: 14px;
--subtext-color: #667085;
```

### CTA Button
```css
--cta-height: 48px;
--cta-radius: 16px;
--cta-bg: #F25C05;
--cta-bg-hover: #D94F04;
--cta-color: #FFFFFF;
--cta-shadow: 0 4px 12px rgba(242, 92, 5, 0.2);
--cta-shadow-hover: 0 6px 16px rgba(242, 92, 5, 0.3);
```

### Table
```css
--header-height: 44px;
--row-height: 56px;
--cell-padding: 12px 20px;
--grid-columns: 40px 200px 180px 1fr 160px 180px;
```

---

## 📱 Responsive Behavior

### Breakpoints
- **Desktop**: 1140px max-width (design spec)
- **Tablet**: Stack KPIs 2×2, maintain single-line filters
- **Mobile**: Horizontal scroll on table, stack KPIs vertically

### Page Header
- **Desktop**: Title left, CTA right (flex space-between)
- **Tablet**: Same layout
- **Mobile**: Stack vertically (CTA full-width below title)

### KPI Cards
```css
@media (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr); /* 2×2 */
}

@media (max-width: 640px) {
  grid-template-columns: 1fr; /* 1×4 */
}
```

---

## ✅ Acceptance Criteria

### ✓ Navbar Logo
- [x] Logo appears in global TopNav component only
- [x] 24px height maintained
- [x] Aspect ratio preserved
- [x] Vertically aligned with nav items
- [x] No logo inside Bookings module

### ✓ Page Header Row
- [x] Title "Bookings" on left
- [x] Subtext "Manage Bookings" below title
- [x] CTA "Create New Booking" on right
- [x] CTA height: 48px
- [x] CTA radius: 16px
- [x] CTA uses orange token (#F25C05)
- [x] Plus icon included

### ✓ Filter Bar
- [x] Single-line layout
- [x] Positioned below page header
- [x] 24px gap from header
- [x] All controls on one line
- [x] Search fills available space

### ✓ KPI Cards
- [x] Retained between filters and table
- [x] 4-card layout with 24px gap
- [x] Values: 96, 96%, 12, 342
- [x] Positioned like Stripe's section after filters

### ✓ Bookings Table
- [x] Two date groups (SUN, OCT 26 and SAT, OCT 25)
- [x] 6 total rows (3 per group)
- [x] Exact data matches specification
- [x] Row height: 56px
- [x] Header height: 44px
- [x] Cell padding: 12px
- [x] Hover state: neutral-50 background
- [x] Neuron styles maintained

### ✓ Spacing & Constraints
- [x] Content max-width: 1140px
- [x] Content centered
- [x] 24px between title → filter
- [x] 24px between filter → KPI
- [x] 24px between KPI → table
- [x] All containers use Auto Layout
- [x] No overflow
- [x] Pills truncate with ellipsis

---

## 🔄 Migration Changes

### Removed
- ✗ Logo bar at top of Bookings module
- ✗ Fixed bottom-right FAB (replaced by header CTA)
- ✗ Single date group (expanded to two)

### Added
- ✓ Neuron logo in TopNav
- ✓ Page header row (title + CTA)
- ✓ Second date group (SAT, OCT 25)
- ✓ 3 additional booking rows

### Modified
- ↻ Table grid columns (150px → 180px for Client)
- ↻ Header labels now uppercase
- ↻ CTA moved from FAB to header
- ↻ Spacing adjusted to 24px rhythm

---

## 🎯 Component Naming

```
App/Bookings
├── Navbar/Logo (global TopNav)
├── PageHeader/Title+CTA
│   ├── Title (left)
│   └── CTA (right)
├── HeaderFilters/Row
│   ├── MonthNavigator
│   ├── SearchInput
│   ├── FilterPills (×4)
│   └── ExportButton
├── KPIs
│   ├── KPIs/ActiveShipments
│   ├── KPIs/OnTimeDelivery
│   ├── KPIs/PendingRFP
│   └── KPIs/Completed
└── Table
    ├── TableHeader
    ├── Table/Group-2025-10-26
    │   ├── DateGroupHeader
    │   └── Rows (×3)
    └── Table/Group-2025-10-25
        ├── DateGroupHeader
        └── Rows (×3)
```

---

## 📊 Metrics

### Layout
- **Content width**: 1140px (max)
- **Page padding**: 32px (top/bottom/sides)
- **Section gaps**: 24px (universal)
- **CTA height**: 48px
- **Filter controls**: 40px
- **Table header**: 44px
- **Table rows**: 56px

### Elements Count
- **1** Logo (in TopNav)
- **1** Page title
- **1** Page subtext
- **1** CTA button
- **9** Filter controls (nav + search + 4 pills + export)
- **4** KPI cards
- **2** Date groups
- **6** Booking rows
- **6** Table columns

### Data
- **6 bookings** across 2 date groups
- **3 clients** on Oct 26
- **3 clients** on Oct 25
- **All statuses**: "For Delivery"
- **5 unique routes**: Shanghai→Manila, Manila→Singapore, Busan→Manila, Ningbo→Manila, Xiamen→Manila, Port Klang→Manila

---

## 🚀 Future Enhancements

### Suggested
1. **Date Navigation**: Click date groups to filter
2. **Bulk Actions**: Multi-select + batch operations
3. **Quick Filters**: Preset filter combinations
4. **Export Selected**: CSV export of checked rows
5. **Inline Edit**: Click to edit delivery date
6. **Expand Row**: Show shipment details inline
7. **Drag to Reorder**: Manual row reordering
8. **Sticky Header**: Fix header on scroll

### Interactive
- Date group collapse/expand
- Row click → slide-in detail panel
- CTA → create booking modal
- Filter pills → dropdown menus
- Search → real-time filtering
- Checkbox → selection state

---

## 📝 Files Modified

### Primary
1. `/components/TopNav.tsx` — Added Neuron logo
2. `/components/Bookings.tsx` — Complete restructure

### Changes Summary

**TopNav.tsx**:
```diff
+ import logoImage from "figma:asset/...";
- <div className="w-8 h-8 bg-[#F25C05]">JJB</div>
+ <img src={logoImage} alt="Neuron" height="24px" />
```

**Bookings.tsx**:
```diff
- Logo bar container
- FAB button (fixed bottom-right)
+ Page header row (title + CTA)
+ Second date group (SAT, OCT 25)
+ 3 additional rows (Robinsons, San Miguel, Jollibee)
~ Spacing: 32px → 24px rhythm
~ Grid columns: 150px → 180px (Client)
~ Header labels: sentence case → UPPERCASE
```

**Lines Changed**: ~200  
**Components Modified**: 2  
**New Components**: 0 (restructured existing)

---

## 🎨 Visual Comparison

### Before
```
┌─────────────────────────────────────────┐
│  [Neuron Logo]                          │ ← Inside module
├─────────────────────────────────────────┤
│  [Filters + Search + Export]            │
├─────────────────────────────────────────┤
│  [KPI Cards]                            │
├─────────────────────────────────────────┤
│  Table (1 date group, 3 rows)          │
│  [FAB]                                  │ ← Bottom-right
└─────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────┐
│  TopNav: [Neuron Logo] [Nav Items]     │ ← Global navbar
├─────────────────────────────────────────┤
│  [Bookings]           [+ Create New]   │ ← New header
│  Manage Bookings                        │
├─────────────────────────────────────────┤
│  [Filters + Search + Export]            │
├─────────────────────────────────────────┤
│  [KPI Cards]                            │
├─────────────────────────────────────────┤
│  Table (2 date groups, 6 rows)         │ ← Expanded
└─────────────────────────────────────────┘
```

---

## ✅ Status

**Version**: Bookings v4.0 (Reference Layout)  
**Date**: 2025-01-09  
**Status**: ✅ Complete  
**Design Review**: Pending  
**Acceptance**: 100% criteria met

---

**Matches Reference 1 layout exactly. Ready for stakeholder review.** 🎨
