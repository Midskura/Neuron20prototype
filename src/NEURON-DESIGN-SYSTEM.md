# Neuron Design System Migration

## Overview
This document tracks the migration from JJB Operating System to the anonymized **Neuron Operations OS** design system.

## ✅ Completed

### 1. Global Design Tokens (styles/globals.css)
Added Neuron design tokens to CSS variables:

**Backgrounds:**
- `--neuron-bg-page: #F7FAF8` - Page background
- `--neuron-bg-elevated: #FFFFFF` - Cards, modals, elevated surfaces

**Ink (Text Colors):**
- `--neuron-ink-primary: #12332B` - Primary text, headings
- `--neuron-ink-secondary: #2E5147` - Body text
- `--neuron-ink-muted: #6B7A76` - Meta text, labels

**Brand Colors:**
- `--neuron-brand-green: #237F66` - Primary brand, CTAs
- `--neuron-brand-green-600: #1E6D59` - Hover state
- `--neuron-brand-green-100: #E8F2EE` - Light backgrounds, pills

**Accent:**
- `--neuron-accent-terracotta: #B06A4F` - Secondary highlights

**UI Colors:**
- `--neuron-ui-border: #E5ECE9` - Borders
- `--neuron-ui-divider: #EEF3F1` - Dividers

**States:**
- `--neuron-state-hover: #F1F6F4` - Hover backgrounds
- `--neuron-state-selected: #E4EFEA` - Selected items

**Semantic:**
- `--neuron-semantic-success: #2B8A6E` - Success states
- `--neuron-semantic-warn: #C88A2B` - Warning states
- `--neuron-semantic-danger: #C94F3D` - Error states

**Elevations:**
- `--elevation-1: 0 1px 2px 0 rgba(16, 24, 20, 0.04)` - Subtle shadow
- `--elevation-2: 0 2px 8px 0 rgba(16, 24, 20, 0.06)` - Card shadow

**Radius:**
- `--neuron-radius-s: 6px` - Small elements
- `--neuron-radius-m: 10px` - Medium elements
- `--neuron-radius-l: 14px` - Large cards, modals

### 2. Core Components Created

#### `/components/NeuronSidebar.tsx` ✅
- Left sidebar navigation (272px width)
- 4-dot "neural flower" logo
- Search input
- Navigation items with icons (20px Lucide icons)
- Active state with green left indicator
- User profile in footer
- Hover states with smooth transitions (120ms ease-out)

#### `/components/Dashboard.tsx` ✅
- Beautiful hero strip with gradient background
- Personalized greeting
- Quick KPI chips in hero
- 4 KPI cards with trend indicators
- Bookings chart placeholder (8 columns)
- Top clients list (4 columns)
- Recent activity feed
- All using Neuron design tokens

#### `/components/NeuronButton.tsx` ✅
- Three variants: `primary`, `secondary`, `ghost`
- Three sizes: `sm` (32px), `md` (40px), `lg` (48px)
- Loading state with spinner
- Icon support
- Smooth hover transitions (120ms ease-out)
- Focus ring (2px outline at 40% opacity)
- Disabled state

#### `/components/NeuronStatusPill.tsx` ✅
- Five variants: `success`, `warning`, `danger`, `neutral`, `info`
- Two sizes: `sm` (24px), `md` (32px)
- Uses Neuron semantic colors
- Rounded corners (14px radius)

#### `/components/NeuronCard.tsx` ✅
- Three padding options: `sm`, `md`, `lg`
- Two elevation levels: `1`, `2`
- White background with border
- 14px border radius
- Flexible styling via style prop

#### `/components/PageHeader.tsx` ✅ (Updated)
- H1 styling: 24px/600/-0.005em
- Subtitle: 14px body text
- Actions slot for buttons
- Uses Neuron ink colors

### 3. Layout Migration

#### `/components/Layout.tsx` ✅ (Replaced TopNav)
- Now uses `NeuronSidebar` instead of `TopNav`
- Horizontal flex layout: Sidebar (272px) + Content (flex-1)
- Page background uses `--neuron-bg-page`
- Removed legacy role-based logic

#### `/App.tsx` ✅ (Updated)
- Added `Dashboard` import
- Changed default page to `"dashboard"`
- Updated `Page` type to include `"dashboard"`
- Added Dashboard rendering case
- Updated Layout props (removed userRole/onLogout)
- Updated currentUser to include email for sidebar

### 4. Typography System
Already established in globals.css:
- **Display/32:** 32px/40px/Semibold/-1.5% tracking
- **H1/24:** 24px/32px/Semibold/-1.0% tracking  
- **H2/20:** 20px/28px/Semibold/-0.5% tracking
- **Body/16:** 16px/24px/Regular/0% tracking
- **Body/14:** 14px/20px/Regular/0% tracking
- **UI/12:** 12px/16px/Medium/+0.2% tracking

Uses Inter font family with SF Pro Display-like negative tracking for headings.

### 5. Icon System
- Using **Lucide React** icons throughout
- Sizes: 16px (pills/rows), 20px (sidebar), 24px (headers)
- Colors: `--neuron-ink-muted` (default), `--neuron-brand-green` (active)

### 6. Grid & Spacing
- **Max-width:** 1200px for content areas
- **Grid:** 12-column system, 24px gutters
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32 (multiples of 4/8)
- **Page padding:** 32px

## 🚧 To Do

### 1. Anonymize Branding
- [ ] Search and replace all "JJB" references with neutral text
- [ ] Update demo client names in mock data to "Acme Retail", "Northport Foods", etc.
- [ ] Remove any company logos/watermarks
- [ ] Update app title to "Operations OS" in chrome

### 2. Update Existing Pages

#### Bookings Module
- [ ] Update `Bookings.tsx` to use Neuron components
- [ ] Replace status pills with `NeuronStatusPill`
- [ ] Update table styles (56px rows, zebra hover)
- [ ] Replace filter pills with Neuron styles
- [ ] Update action buttons to `NeuronButton`
- [ ] Use `PageHeader` component

#### Clients Module
- [ ] Update `Clients.tsx` with Neuron design
- [ ] Update `ClientFullView.tsx` styles
- [ ] Replace cards with `NeuronCard`
- [ ] Update buttons to `NeuronButton`

#### Accounting Module
- [ ] Update all AccountingV* components
- [ ] Replace color scheme (navy/orange → green/terracotta)
- [ ] Update status pills
- [ ] Update table styles
- [ ] Use Neuron semantic colors for revenue/expense

#### Reports Module
- [ ] Update `ReportsModule.tsx`
- [ ] Replace KPI cards with Neuron styling
- [ ] Update chart colors to green palette
- [ ] Update filter controls

#### HR Module
- [ ] Update `HR.tsx` with Neuron design
- [ ] Replace payroll icons
- [ ] Update employee cards
- [ ] Update status indicators

#### Admin/Settings
- [ ] Update `Admin.tsx` with Neuron styling

### 3. Component Library Updates

#### Shared Components to Update
- [ ] `BookingFullView.tsx` - Neuron colors and spacing
- [ ] `CreateBooking.tsx` - Form styling
- [ ] `ExpenseFileView.tsx` - File view styling
- [ ] Modal components - Neuron borders and shadows
- [ ] Form inputs - Neuron focus states
- [ ] Dropdowns - Neuron styling
- [ ] Date pickers - Neuron styling

### 4. Table Standardization
Create `NeuronTable` component with:
- [ ] 56px row height
- [ ] Zebra striping on hover (`--neuron-state-hover`)
- [ ] Border color: `--neuron-ui-border`
- [ ] Header: 12px uppercase Medium, `--neuron-ink-muted`
- [ ] Body: 14px Regular, `--neuron-ink-secondary`
- [ ] Tabular numerals for numbers

### 5. Motion & Interactions
- [ ] Verify all transitions use 120ms ease-out
- [ ] Add focus rings (2px `--neuron-brand-green-600` @ 40% opacity)
- [ ] Hover states consistently use `--neuron-state-hover`
- [ ] Button press states (slight scale/shadow)

### 6. Responsive Behavior
- [ ] Ensure sidebar is fixed at 272px
- [ ] Content area scrolls independently
- [ ] Cards respect 1200px max-width
- [ ] Grid system works on all pages

### 7. Documentation
- [ ] Update component library docs
- [ ] Create Storybook/demo page
- [ ] Document color usage guidelines
- [ ] Create migration guide for developers

## Design Principles

### Color Usage
- **Primary CTA:** Always `--neuron-brand-green`
- **Hover:** `--neuron-brand-green-600`
- **Success:** `--neuron-semantic-success` (green)
- **Warning:** `--neuron-semantic-warn` (amber)
- **Danger:** `--neuron-semantic-danger` (red)
- **Neutral badges:** `--neuron-brand-green-100` background
- **Accent (sparingly):** `--neuron-accent-terracotta` for highlights only

### Typography
- **Never** use Tailwind font size/weight classes unless user requests
- Use inline styles with design token variables
- Headers: Negative letter-spacing for tighter appearance
- Body: 0% tracking
- Small UI: +0.2% tracking for readability

### Spacing
- Use 8px grid for all spacing
- Cards: 16-20px padding
- Page margins: 32px
- Gaps between elements: 12-24px (multiples of 4)

### Borders & Shadows
- Standard border: 1px solid `--neuron-ui-border`
- Dividers: `--neuron-ui-divider` (lighter)
- Cards: `--elevation-1` shadow
- Modals: `--elevation-2` shadow
- Radius: Use `--neuron-radius-l` for most elements (14px)

## Quality Checklist
- [ ] All text uses `--neuron-ink-*` colors
- [ ] All backgrounds use `--neuron-bg-*`
- [ ] All buttons use `NeuronButton` or Neuron colors
- [ ] All status indicators use semantic colors
- [ ] All cards have proper elevation
- [ ] All hover states work correctly
- [ ] Focus states are visible (accessibility)
- [ ] Motion is smooth (120ms transitions)
- [ ] Grid system respected (1200px max-width)
- [ ] No JJB branding remains
- [ ] Inter font loads correctly
- [ ] Icons are consistent sizes
- [ ] Tabular numerals on numbers

## Migration Strategy

### Phase 1: Foundation ✅
- [x] Add design tokens
- [x] Create core components (Sidebar, Dashboard, Button, Card, Pill)
- [x] Update Layout and App.tsx
- [x] Test navigation and basic flow

### Phase 2: Module Updates (Next)
1. Start with Bookings (most used)
2. Then Clients
3. Then Accounting
4. Then Reports & HR
5. Finally Admin

### Phase 3: Polish
- Fine-tune spacing and alignment
- Add loading states
- Optimize performance
- Test across browsers
- Accessibility audit

### Phase 4: Launch
- Remove all legacy code
- Clean up unused components
- Final QA pass
- Deploy

## Notes
- Legacy CSS variables maintained for backwards compatibility
- Gradual migration - old and new can coexist
- Test each module thoroughly before moving to next
- User feedback loop important for UX refinements
