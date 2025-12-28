# JJB OS – Reporting Module

## Overview

A comprehensive reporting page built with a consistent design system following strict design tokens and 8-pt spacing.

### Key Features

- **Dynamic Date Controls**: Calendar pop-ups for date selection with Day/Week/Month/Custom presets
- **Data Simulation**: Automatically swaps KPI and summary data based on selected period
- **Interactive UI**: Calendar popovers, preset pills, company selector
- **Period-Based Variants**: Simulated data for different time ranges (day, week, month, custom)

## Design System

### Color Styles

```typescript
Ink/900: #0F172A  // Primary text, headings
Ink/700: #1F2937  // Secondary text
Ink/500: #6B7280  // Muted text, icons
Ink/300: #D1D5DB  // Borders
Ink/100: #F3F4F6  // Backgrounds

Brand/400: #FF6A00  // Primary brand color
Success/500: #16A34A  // Success states, revenue
Danger/500: #DC2626  // Error states, expenses
```

### Typography Styles

```typescript
Display/24/700  // Main headings (24px, bold)
Title/18/700    // Section titles (18px, bold)
Body/14/500     // Body text (14px, medium)
Meta/12/500     // Small text (12px, medium)
Mono/12/500     // Monospaced numbers (12px, tabular-nums)
```

### Effects

```typescript
Card/Shadow: 0px 4px 16px rgba(15, 23, 42, 0.08)
```

### Spacing System (8-pt)

```typescript
xs:  8px   // 1 unit
sm:  16px  // 2 units
md:  24px  // 3 units
lg:  32px  // 4 units
xl:  40px  // 5 units
xxl: 48px  // 6 units
```

### Layout

- Desktop frame: 1440px
- Content max-width: 1200px
- Border radius: 12px (cards), 8px (buttons), 6px (chips)

## Components

### 1. ReportingPage.tsx
Main page component with all sections and layout. Manages period state and displays dynamic data based on selected date range.

**State Management:**
- `preset`: Current period preset (day/week/month/custom)
- `dateFrom`: Start date
- `dateTo`: End date
- `currentData`: Period-specific data from `periodData[preset]`

**Sections:**
- A. KPI Row (4 cards) - Dynamic values based on period
- B. Revenue & Expense Overview (2 donut charts)
- C. Trends (1 line chart)
- D. Top Clients & Expenses (tabbed table)
- E. Booking Performance (detailed table)
- F. Status Summary (4 stat cards) - Dynamic delivery rate

### 2. KPICard.tsx
Metric display card with icon, value, and delta.

**Props:**
```typescript
{
  label: string;        // "Total Revenue"
  value: string;        // "₱9,800,000"
  delta: number;        // 12.5
  deltaLabel: string;   // "+12.5% vs prev"
  icon: ElementType;    // DollarSign
  iconColor: string;    // colors.success[500]
  isLoading?: boolean;
  onClick?: () => void;
}
```

### 3. ChartCard.tsx
Chart container with title and subtitle.

**Types:**
- `donut` - Pie chart with center label and legend
- `line` - Time-series line chart

**Props:**
```typescript
{
  title: string;
  subtitle: string;
  type: 'donut' | 'line';
  data: any[];
  isLoading?: boolean;
}
```

### 4. DataTable.tsx
Reusable table component with optional totals row.

**Props:**
```typescript
{
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  showTotal?: boolean;
  totalRow?: any;
  onRowClick?: (row: any) => void;
}
```

### 5. DateControlsCard.tsx
Single-row date controls card with preset pills, calendar pop-ups, and action buttons.

**Features:**
- **Preset Pills**: Day/Week/Month/Custom with active state
- **Calendar Pop-ups**: Click-to-open date pickers using shadcn Calendar + Popover
- **Date Fields**: Formatted display (DD/MM/YYYY) with calendar icons
- **Company Selector**: Dropdown for company filtering
- **Actions**: Apply (primary blue) and Export (outline) buttons

**Props:**
```typescript
{
  onApply: () => void;
  onExport: () => void;
  isLoading?: boolean;
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  dateFrom: Date;
  dateTo: Date;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
}
```

**Behavior:**
- Clicking a preset pill auto-fills dates and updates data
- Clicking a date field opens calendar popover
- Selecting a date from calendar sets preset to 'custom'
- Calendar closes automatically after selection

### 6. design-tokens.ts
Centralized design system constants.

**Exports:**
- `colors` - Color palette
- `typography` - Text styles
- `effects` - Shadows and effects
- `spacing` - 8-pt spacing scale
- `layout` - Layout constants

### 7. mock-data.ts
Sample data for all sections, including period-based data variants.

**Period Data Variants:**
- `periodData`: Record of data for each period type (day/week/month/custom)
- Each period includes: totalRevenue, totalExpenses, netProfit, profitMargin, deltas, avgTicket, bookingsThisPeriod, deliveryRate

**Static Datasets:**
- `revenueBreakdown` - 5 categories
- `expenseBreakdown` - 6 categories
- `monthlyTrends` - 10 months
- `topClients` - 5 clients
- `topExpenseCategories` - 5 categories
- `bookingPerformance` - 10 bookings
- `statusCounts` - 4 metrics

**Period Data Example:**
```typescript
periodData.month = {
  totalRevenue: 9800000,
  totalExpenses: 7400000,
  netProfit: 2400000,
  profitMargin: 24.5,
  deltaRevenue: 12.5,
  deltaExpenses: -8.3,
  deltaProfit: 24.7,
  deltaMargin: 3.2,
  avgTicket: 185714,
  bookingsThisPeriod: 412,
  deliveryRate: 97.2,
}
```

## File Structure

```
/components/reporting/
├── ReportingPage.tsx        # Main page with state management
├── ReportingHeader.tsx      # Clean title/subtitle/divider
├── DateControlsCard.tsx     # Date controls with calendar pop-ups
├── KPICard.tsx              # Metric cards
├── ChartCard.tsx            # Chart containers
├── TimeSeriesCard.tsx       # Line chart cards
├── DataTable.tsx            # Table component
├── design-tokens.ts         # Design system
├── mock-data.ts             # Sample data + period variants
└── README.md                # This file
```

## Usage

```tsx
import { ReportingPage } from './components/reporting/ReportingPage';

// In App.tsx
{currentPage === "reports" && (
  <ReportingPage />
)}
```

## Layout Architecture

The page uses proper flex-based scroll:

```tsx
// Layout.tsx
<div className="h-screen flex flex-col">
  <TopNav />
  <main className="flex-1 min-h-0 overflow-hidden">
    {children}
  </main>
</div>

// ReportingPage.tsx
<div className="h-full overflow-y-auto overflow-x-clip">
  <div className="sticky top-0 z-30">TopBar + Filters</div>
  <div className="max-w-[1200px] mx-auto px-6 py-6">
    {/* All sections */}
  </div>
</div>
```

**Critical Rules:**
1. Layout main: `flex-1 min-h-0 overflow-hidden`
2. Page root: `h-full overflow-y-auto`
3. Sticky elements outside scroll container
4. Background color: `#F3F4F6` (Ink/100)

## Data Format

### KPI Data
```typescript
{
  value: number;
  delta: number;
  deltaLabel: string;
}
```

### Chart Data (Donut)
```typescript
{
  name: string;
  value: number;
  color: string;
}[]
```

### Chart Data (Line)
```typescript
{
  month: string;
  revenue: number;
  expenses: number;
}[]
```

### Table Data
```typescript
{
  [key: string]: string | number;
}[]
```

## Loading States

All components support `isLoading` prop:
- **KPICard**: Skeleton for icon, label, value, delta
- **ChartCard**: Title + chart skeleton
- **DataTable**: 5 row skeletons
- **FilterBar**: Apply button shows spinner

## Customization

### Adding New Sections

1. Create mock data in `mock-data.ts`
2. Add section to `ReportingPage.tsx`
3. Use existing components or create new ones
4. Follow 8-pt spacing system
5. Use design tokens for colors and typography

### Connecting Real Data

Replace mock data imports with API calls:

```typescript
const [data, setData] = useState(null);

const handleApplyFilters = async () => {
  setIsLoading(true);
  const response = await fetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify(filters)
  });
  const result = await response.json();
  setData(result);
  setIsLoading(false);
};
```

## Design Tokens Reference

### Colors

```css
/* Ink Scale */
--ink-900: #0F172A;
--ink-700: #1F2937;
--ink-500: #6B7280;
--ink-300: #D1D5DB;
--ink-100: #F3F4F6;

/* Brand & States */
--brand-400: #FF6A00;
--success-500: #16A34A;
--danger-500: #DC2626;

/* Chart Extended */
--chart-blue: #3B82F6;
--chart-purple: #8B5CF6;
--chart-yellow: #F59E0B;
--chart-teal: #14B8A6;
```

### Typography

```css
/* Display */
font-size: 24px;
font-weight: 700;
line-height: 1.2;

/* Title */
font-size: 18px;
font-weight: 700;
line-height: 1.4;

/* Body */
font-size: 14px;
font-weight: 500;
line-height: 1.5;

/* Meta */
font-size: 12px;
font-weight: 500;
line-height: 1.4;

/* Mono */
font-size: 12px;
font-weight: 500;
line-height: 1.4;
font-family: ui-monospace, monospace;
font-variant-numeric: tabular-nums;
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `recharts` - Charts
- `lucide-react` - Icons
- `@radix-ui` (via shadcn/ui) - Tabs, Select
- shadcn/ui components: Button, Card, Table, Skeleton

## Performance

- Lazy loading: Not implemented (all data loads on mount)
- Memoization: Charts re-render on data change
- Virtual scrolling: Not needed (tables < 100 rows)

## Accessibility

- All text meets WCAA AA contrast ratios
- Icons have proper sizing (minimum 16px)
- Interactive elements have proper focus states
- Tables use semantic HTML
- Loading states announce to screen readers

## Future Enhancements

1. **Export**
   - CSV/XLSX download
   - PDF generation
   - Scheduled reports

2. **Filters**
   - Custom date range picker
   - Multiple company selection
   - Status filters

3. **Drill-Down**
   - Click KPI → Navigate to detail
   - Click table row → Open modal
   - Click chart segment → Filter view

4. **Responsive**
   - Mobile layout (stack cards)
   - Tablet layout (2-column grid)
   - Horizontal scroll for tables

## Version

v1.0.0 - Initial Release

## Credits

Design System: JJB OS Design Tokens  
Implementation: Figma Make  
Date: October 27, 2025
