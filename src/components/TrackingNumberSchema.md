# JJB OS Tracking Number Schema

## Overview
All booking tracking numbers in the JJB OS logistics system follow a standardized schema format.

## Format
```
[Load Type]-[Delivery Type]-[No.]-[Mode]
```

**Example:** `LCL-IMPS-001-SEA`

---

## Schema Components

### 1. Load Type (Segment 1)
The container load classification.

| Code | Full Name | Description |
|------|-----------|-------------|
| `LCL` | Less than Container Load | Partial container shipments |
| `FCL` | Full Container Load | Complete container shipments |

### 2. Delivery Type (Segment 2)
The direction of goods flow.

| Code | Full Name | Description |
|------|-----------|-------------|
| `IMPS` | Import | Incoming international shipments |
| `EXPS` | Export | Outgoing international shipments |
| `DOM` | Domestic | Local/domestic shipments |

### 3. Number (Segment 3)
Sequential identifier for the booking.

- **Format:** 3-digit, zero-padded
- **Range:** `000` - `999`
- **Example:** `001`, `042`, `315`

### 4. Mode (Segment 4)
The primary transportation method.

| Code | Full Name | Description |
|------|-----------|-------------|
| `SEA` | Sea Type Shipping | Maritime/ocean freight |
| `AIR` | Air Type Shipping | Air cargo transport |
| `DOM` | Domestic Shipping | Local delivery service |
| `TRK` | Trucking Shipping | Road freight transport |

---

## Implementation

### Sample Tracking Numbers

```
LCL-IMPS-001-SEA  →  Puregold • Taguig → Cavite • For Delivery
FCL-EXPS-002-SEA  →  Unilab • Manila → Laguna • For Delivery
LCL-IMPS-003-AIR  →  SM Retail • Pasig → Cavite • In Transit
LCL-DOM-004-TRK   →  Robinsons Retail • Makati → Cavite • Delivered
FCL-IMPS-005-SEA  →  Puregold • Quezon City → Cavite • For Delivery
LCL-EXPS-006-AIR  →  Robinsons Retail • QC → Batangas • For Delivery
LCL-DOM-007-DOM   →  SM Retail • QC → Cavite • For Delivery
FCL-IMPS-008-SEA  →  Unilab • Makati → Laguna • For Delivery
```

### Where It's Used

1. **Bookings Table** - Tracking No. column displays schema-compliant values
2. **Date-Grouped View** - All bookings grouped by date use the schema
3. **Booking Detail Drawer** - Right-side panel shows tracking number in schema format
4. **Create Booking Modal** - Interactive schema builder with dropdowns:
   - Load Type selector (LCL/FCL)
   - Delivery Type selector (IMPS/EXPS/DOM)
   - Number input (3-digit, zero-padded)
   - Mode selector (SEA/AIR/DOM/TRK)
   - Auto-generated read-only tracking number display

### Validation Rules

- **Load Type:** Must be either `LCL` or `FCL`
- **Delivery Type:** Must be `IMPS`, `EXPS`, or `DOM`
- **Number:** Must be numeric, 3 digits, zero-padded (001-999)
- **Mode:** Must be `SEA`, `AIR`, `DOM`, or `TRK`
- **Separators:** Always use hyphen (`-`) between segments

### Migration Notes

All legacy tracking numbers in the format `ND-2025-XXXX` have been replaced with schema-compliant values. The schema ensures:
- Clear categorization of shipment types
- Better filtering and reporting capabilities
- Standardized format across all modules
- Self-documenting tracking codes

---

## Developer Reference

When creating new bookings programmatically:

```typescript
const generateTrackingNo = (
  loadType: 'LCL' | 'FCL',
  deliveryType: 'IMPS' | 'EXPS' | 'DOM',
  number: number,
  mode: 'SEA' | 'AIR' | 'DOM' | 'TRK'
): string => {
  const paddedNumber = number.toString().padStart(3, '0');
  return `${loadType}-${deliveryType}-${paddedNumber}-${mode}`;
};

// Example usage:
const trackingNo = generateTrackingNo('LCL', 'IMPS', 1, 'SEA');
// Result: "LCL-IMPS-001-SEA"
```
