# BookingPicker Component

## Overview
A sophisticated, context-rich booking selection component for the JJB OS Accounting module. Provides fast, keyboard-first booking search with intelligent filtering and ranking.

## Features

### Search & Filtering
- **Real-time search**: Debounced search across booking number, client name, and route
- **Smart filters**: 
  - Company (locked to current entry's company)
  - Date ranges (Today, Yesterday, Last 7 days)
  - Status (Delivered, Closed) - multi-select
- **Intelligent ranking**: Boosts bookings by:
  - Same company match
  - Date proximity to entry date (±7 days)
  - Text match relevance
  - Similar amount values
  - Delivered/Closed status priority

### Rich Context Display
Each booking row shows:
- Booking number (bold, primary color)
- Client name
- Route (From → To)
- ETA/Date
- Status pill (color-coded)
- Amount (green for positive values)
- Linked entries count badge

### Selected State
When a booking is selected, the field displays:
- Compact pill with booking no., client, and route
- View action (external link icon)
- Remove action (X icon)
- Hover states for better interactivity

### Keyboard Navigation
- **Arrow Up/Down**: Navigate through results
- **Enter**: Select highlighted booking
- **Escape**: Close picker
- **Tab**: Move focus out

### States
- Idle (empty field)
- Focused (panel open)
- Selected (booking chosen)
- Error (validation failed)
- Disabled (read-only)
- Conflict (booking from different company)

### Mobile Support
- Responsive design adapts to mobile screens
- Touch-friendly targets (44px minimum)
- Optimized layout for narrow viewports

## Usage

```tsx
import { BookingPicker } from "./BookingPicker";

<BookingPicker
  value={formData.bookingNo}
  onChange={(bookingNo) => updateFormData({ bookingNo })}
  companyId={formData.company}
  entryDate={formData.date}
  error={errors.bookingNo}
  disabled={false}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current booking number |
| `onChange` | `(bookingNo: string) => void` | Callback when selection changes |
| `companyId` | `string` | Current company ID (for filtering) |
| `entryDate` | `Date` | Entry date (for date proximity ranking) |
| `error` | `string` | Validation error message |
| `disabled` | `boolean` | Disable the picker |

## Data Source
- Mock data from `bookings-data.ts`
- Search function: `searchBookings()`
- In production, replace with API calls

## Design Tokens
- Width: 560px (desktop)
- Border radius: 12px
- Max height: 320px (scroll area)
- Border: 1px #E5E7EB
- Shadow: lg
- Focus ring: 2px #0A1D4D
- Row min-height: 56px

## Future Enhancements
- [ ] Real API integration
- [ ] Booking creation flow
- [ ] "View booking" action implementation
- [ ] Advanced filters (payment status, amount range)
- [ ] Recently selected bookings
- [ ] Booking preview on hover
