# Per Booking Profitability - Client & Booking Filters

## Overview
The Per Booking Profitability report includes two context filters:
1. **Client filter** - Filter all bookings by a specific client
2. **Booking picker** - Narrow to a single booking

## UI Layout

The filter bar reads like a sentence with explicit labels:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Period: [Month ▾]  For: [Oct 2025]  Company: [All Companies ▾]  From: [Both ▾]                  │
│  Client: [All Clients ▾]  ··  Booking: [All]  [Preview] [Export] [Print]                         │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

When a client is selected:
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Period: [Month ▾]  For: [Oct 2025]  Company: [All Companies ▾]  From: [Both ▾]                  │
│  Client: [Puregold ▾]  ··  Booking: [All]  [Preview] [Export] [Print]                            │
│  Report is filtered by client: Puregold.                                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

When a booking is selected:
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Period: [Month ▾]  For: [Oct 2025]  Company: [All Companies ▾]  From: [Both ▾]                  │
│  Client: [All Clients ▾]  ··  Booking: [JOB-001 ×]  [Preview] [Export] [Print]                   │
│  (Client filter dimmed at 50% opacity, other filters also dimmed)                                 │
│  Report is filtered by booking: JOB-001. Client filter is ignored.                                │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Both filters appear only when **Per Booking Profitability** is the active report.

## Filter Structure

**Left-aligned filters:**
- **Period:** Month / Custom range
- **For:** Month picker or date range (Start – End)
- **Company:** All Companies, CCE, ZNICF, JLCS
- **From:** Both, Import, Export, Domestic
- **Client:** All Clients / {Client Name} (derived from Bookings)

**Right-aligned context filter:**
- **Booking:** All / {JOB NO.}

**Actions (far right):**
- Preview, Export, Print

## Filtering Priority

**Booking takes precedence over Client:**
1. If **Booking** is selected → only that booking is shown, Client filter is ignored
2. If **Booking = All** AND **Client** is selected → all bookings for that client (within period/company/source filters)
3. If **both are All** → all bookings (current behavior)

## Client Filter Behavior

### Default State
- Label: **"Client:"**
- Dropdown text: **"All Clients"**
- Border: `#E5E7EB` (gray)
- Text color: `#6B7280` (gray)
- Width: `190px` (to fit longer client names)
- Hover: Background → `#F9FAFB`

### With Client Selected
- Dropdown text: **"{Client Name}"** (e.g., "Puregold")
- Text truncates with ellipsis if too long
- Other filters remain enabled (at 100% opacity)
- Helper text shows: "Report is filtered by client: {Client Name}."

### When Booking is Selected
- Client filter is dimmed (50% opacity) and disabled (`pointer-events: none`)
- Selection is ignored in the report logic

### No Clients Available
- Dropdown shows "No clients" option (disabled)
- Entire dropdown is disabled

## Booking Filter Behavior

### Default State
- Label: **"Booking:"**
- Button text: **"All"**
- Border: `#E5E7EB` (gray)
- Text color: `#6B7280` (gray)
- Hover: Background → `#F9FAFB`, Border → `#D1D5DB`

### With Booking Selected
- Button text: **"{JOB NO.}"** (e.g., "LCL-IMPS-001-SEA")
- Border: `#F25C05` (orange)
- Text color: `#0A1D4D` (navy)
- Font weight: 600 (semibold)
- Hover: Background → `#FFF7ED` (light orange)
- Includes a small **× icon** to clear the selection
- **All other filters** (Period, For, Company, From, Client) are dimmed (50% opacity) and disabled
- Helper text shows: "Report is filtered by booking: {JOB NO.}. Client filter is ignored."

### Clear Interaction
- Clicking the × icon clears the booking selection
- Restores all filters to normal state (100% opacity, enabled)
- Shows toast: "Booking selection cleared"

## Report Table

### Total Row
- Shows: **"TOTAL BOOKINGS: {count}"** instead of just "TOTAL"
- Includes sum of Revenue, Expenses, Admin Cost, Profit, and average Profit Margin

### Empty State
When no bookings match the filters:
```
┌────────────────────────────────────────────┐
│  No bookings found for these filters.      │
│  Try another period, or clear the Client   │
│  / Booking filter.                          │
└────────────────────────────────────────────┘
```

## Export Filename Suggestions

```js
// All bookings
"per-booking-profitability-all.xlsx"

// Client filtered
"per-booking-profitability-client-puregold.xlsx"

// Single booking
"per-booking-profitability-booking-LCL-IMPS-001-SEA.xlsx"
```

## Modal - Select Booking

### Trigger
Clicking the "Pick booking…" button opens a centered modal.

### Modal Specs
- Width: **960px**
- Background: White with rounded corners (16px)
- Shadow: `0 4px 20px rgba(0, 0, 0, 0.08)`
- Border: `#E5E7EB`

### Modal Layout

**Header**
- Title: "Select Booking"
- Subtext: "Filtered to: {period} · {company} · {source}"
- Border bottom: `#E5E7EB`

**Toolbar**
- Search bar (left): Placeholder "Search booking, client, company…"
- 3 small filter dropdowns (right): Company, Client
- Height: 40px pills with rounded-full style
- Pre-filled with current report filter values

**Table**
- 5 columns: **Booking / Job No.**, **Client**, **Company**, **Date**, **Revenue (₱)**
- 8 visible rows with pagination
- Clickable rows with hover state (`bg-[#F9FAFB]`)
- Selected row: `bg-[#FFF7ED]` with check icon in last column
- Pagination: "Previous" and "Next" buttons at bottom

**Footer**
- Two buttons aligned right:
  - "Cancel" (ghost style)
  - "Use this booking" (primary orange, enabled only when a row is selected)

### Confirmation
When "Use this booking" is clicked:
1. Modal closes
2. Booking pill updates to "Booking: {JOB NO.}"
3. Other filters are dimmed and disabled
4. Report refreshes to show only that booking
5. Toast: "Selected booking: {JOB NO.}"

## Data Filtering

The `getBookingProfitabilityData()` function applies the booking filter:

```typescript
// If a specific booking is selected, filter to that booking only
if (selectedBookingNo) {
  data = data.filter(d => d.bookingNo === selectedBookingNo);
}
```

When a booking is selected:
- Uses the **filtered financials** (respects main filters initially)
- Then narrows to the **selected booking only**
- Main filters become disabled but their values remain for reference

When cleared:
- Returns to showing all bookings that match the main filters
- Main filters become enabled again

## Design Tokens
- Orange accent: `#F25C05`
- Orange light: `#FFF7ED`
- Navy text: `#0A1D4D`
- Gray text: `#6B7280`
- Border: `#E5E7EB`
- Modal shadow: `0 4px 20px rgba(0, 0, 0, 0.08)`
- Disabled opacity: `0.5`

## Component Files
- `/components/ReportsModule.tsx` - Main reports logic with integrated booking picker
- `/components/reports/BookingPickerModal.tsx` - Modal for selecting a booking
