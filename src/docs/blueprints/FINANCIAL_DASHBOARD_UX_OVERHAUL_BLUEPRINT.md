# Financial Dashboard UX Overhaul Blueprint

## Overview
7-phase UX overhaul of `FinancialDashboard.tsx` and its zone components, inspired by
Bankio reference analysis but purpose-built for Neuron OS freight-forwarding ERP.

## Affected Files
- `/components/accounting/dashboard/FinancialDashboard.tsx` — main orchestrator
- `/components/accounting/dashboard/VitalSignsStrip.tsx` — Zone 1 KPIs
- `/components/accounting/dashboard/AttentionPanel.tsx` — Zone 6 → promoted to Zone 2
- `/components/accounting/dashboard/RevenueTrendChart.tsx` — Zone 2R chart
- `/components/accounting/dashboard/ServiceProfitability.tsx` — Zone 4L
- `/components/accounting/dashboard/TopCustomers.tsx` — Zone 4R
- `/components/accounting/dashboard/IncomeVsCostBreakdown.tsx` — Zone 5
- `/components/accounting/dashboard/ReceivablesAgingBar.tsx` — Zone 3
- `/components/accounting/dashboard/CashFlowWaterfall.tsx` — Zone 2L chart

## Design Tokens (Neuron OS)
- Deep green: `#12332B`
- Teal accent: `#0F766E`
- Border: `#E5E9F0`
- Muted text: `#667085`
- Card bg: `white`
- Section header bg: `#F8F9FB`

---

## Phase 1: Asymmetric 2+3 KPI Layout with Dark Hero Card ✅ COMPLETE
**Files:** `VitalSignsStrip.tsx`, `FinancialDashboard.tsx`
**Changes:**
- Replace 5-equal-column grid with 2-tier layout
- Top row: 2 hero cards (Net Revenue white, Net Profit dark green `#12332B` bg)
  - 36px values, larger delta badges
- Bottom row: 3 compact cards (Cash Collected, Outstanding AR, Pending Expenses)
  - 22px values, utilitarian style
- Mark first 2 signs as `hero: true` in the data array
- Loading skeleton updated to match new layout

## Phase 2: Move Attention Panel to Zone 2 ✅ COMPLETE
**Files:** `AttentionPanel.tsx`, `FinancialDashboard.tsx`
**Changes:**
- Move `<AttentionPanel>` from Zone 6 (bottom) to directly after VitalSignsStrip
- Make collapsible: collapsed by default if all items are `success`/`info` severity
- Auto-expand if any `danger`/`warning` items exist
- Collapsed state shows single-line summary: "X items need attention"
- Add expand/collapse toggle chevron

## Phase 3: Consolidate Zones 4+5 → Tabbed Breakdown ✅ COMPLETE
**Files:** New `BreakdownTabs.tsx`, `FinancialDashboard.tsx`
- Remove separate ServiceProfitability + TopCustomers + IncomeVsCostBreakdown zones
- Create single `BreakdownTabs` component with 3 tab pills:
  `[ By Service | By Customer | By Category ]`
- "By Service" → ServiceProfitability table (inlined or imported)
- "By Customer" → TopCustomers horizontal bars (inlined or imported)
- "By Category" → Simplified Income vs Cost comparison bars + single unified table
- Reduces vertical scroll by ~400px

## Phase 4: Revenue Trend — Period Toggle + Stacked Bars ✅ COMPLETE
**Files:** `RevenueTrendChart.tsx`
**Changes:**
- Add period toggle pills in card header: `6M | 12M | YTD`
- Convert from revenue-only bars to stacked Revenue (teal) + Expenses (orange) bars
- Show margin % label on each bar
- Add richer hover state: mini P&L card (Revenue, Expenses, Margin)

## Phase 5: Contextual Summary Line ✅ COMPLETE
**Files:** `FinancialDashboard.tsx`
**Changes:**
- Add single-line data-driven summary between ScopeBar and KPIs
- Format: "This period: ₱X.XM revenue across Y projects · Z customers · W% collection rate"
- 13px, color #667085, updates reactively with scope changes
- Computed from scoped data already available in FinancialDashboard

## Phase 6: "View →" Section Affordances ✅ COMPLETE
**Files:** `ReceivablesAgingBar.tsx`, `CashFlowWaterfall.tsx`, `RevenueTrendChart.tsx`,
          `BreakdownTabs.tsx` (new from Phase 3), `FinancialDashboard.tsx`
**Changes:**
- Add "View →" link (right-aligned, teal #0F766E, 12px) to section headers
- Each links to relevant Financials tab via `onNavigateTab`
- Subtle hover border-color shift on card containers
- Pass `onNavigateTab` to all zone components that need it

## Phase 7: Aging Trend Indicators ✅ COMPLETE
**Files:** `ReceivablesAgingBar.tsx`, `FinancialDashboard.tsx`
**Changes:**
- Accept `previousInvoices` prop (previous-period invoices)
- Compute aging buckets for previous period
- Show ↑/↓ trend arrow per bucket with red/green color
- Arrow shows direction of change (growing = bad for overdue buckets)

## Phase 8: Receivables Aging — Clarity & Inline Drill-Down ✅ COMPLETE
**Files:** `ReceivablesAgingBar.tsx`
**Changes:**
### Phase 8a: Clarity & Polish
- Added "As of [date]" chip with calendar icon next to header (clarifies scope-independence)
- Promoted total outstanding amount to prominent 18px callout in header row with invoice count
- DSO badge now uses severity coloring: teal (≤30d), amber (31–60d), red (61+d)

### Phase 8b: Visual Redesign — Horizontal Row-Based Chart
- **Replaced** the proportional stacked bar + 5 legend cards with **5 horizontal rows**
- Each row: colored square dot → label (fixed 76px) → proportional horizontal bar → amount → count → share % → trend arrow → expand chevron
- Bars are proportional to the **largest bucket** (not total), so smaller amounts remain visible
- Zero-amount buckets show a muted gray placeholder with em-dash — visually quiet, no wasted attention
- Severity color gradient runs vertically: teal (Current) → amber → orange → red → dark red (90d+)
- All columns are fixed-width for perfect vertical alignment

### Phase 8c: Inline Drill-Down (integrated into rows)
- Click any non-empty row → drill-down panel expands **directly below that row** (not at card bottom)
- Panel shows up to 5 invoices sorted by largest balance: invoice number, customer, due date, overdue badge, amount
- "View all in Invoices →" link for full navigation
- Accordion-style: only one row open at a time
- Expanded row gets bucket's bgLight background + colored chevron rotated 90°

---

## Current Status
**✅ ALL PHASES COMPLETE** — Full 8-phase implementation finished.

## Change Log
- Phase 1 implemented: Asymmetric 2+3 KPI layout with dark hero card
- Phase 2 implemented: Attention Panel promoted to Zone 2, collapsible
- Phase 3 implemented: Zones 4+5 consolidated into BreakdownTabs
- Phase 4 implemented: Revenue Trend with period toggle + stacked bars
- Phase 5 implemented: Contextual summary line
- Phase 6 implemented: "View →" section affordances on all zone components
- Phase 7 implemented: Aging trend indicators with previous-period comparison
- Phase 8 implemented: Receivables Aging full redesign — horizontal row-based chart with inline drill-down, replacing stacked bar + legend cards