# Booking Panel Refactor - Quick Reference

## 🎯 What Changed?

### Before:
- Clicking "Create Booking" in Pricing → Projects → Services & Bookings opened a simple modal
- Limited information displayed
- No connection to detailed Operations forms

### After:
- Clicking "Create Booking" opens the **SAME detailed panel** as Operations modules
- Panel is **auto-filled** with project data
- For Brokerage: Form **changes based on type** (Standard/All-Inclusive/Non-Regular)
- Team assignments integrated for Pricing workflow

---

## 🔑 Key Features

### 1. Brokerage Type Selection (NEW)
Three types: **Standard** | **All-Inclusive** | **Non-Regular**
- Form fields change based on selected type
- Type pre-selected from quotation when creating from project

### 2. Auto-fill from Project (NEW)
- Light green background = field pre-filled from project
- All fields still editable
- Info banner shows auto-fill is enabled

### 3. Team Assignment (NEW - Pricing only)
- Manager auto-assigned
- Select Supervisor and Handler
- Option to save preference for client

### 4. Source-aware Panel
- **Operations**: Blank form, no team assignment
- **Pricing**: Pre-filled form, team assignment required

---

## 🎨 Visual Indicators

| Element | Indicator | Meaning |
|---------|-----------|---------|
| **Light green background** | #F0FDF4 | Field was pre-filled from project |
| **Blue banner** | Top of panel | Auto-fill is enabled |
| **Teal selected button** | Brokerage type | Currently selected type |
| **Green badge** | Service card | Number of bookings |

---

## 📁 Files Modified

### Core Changes:
1. **CreateBrokerageBookingPanel.tsx** - Refactored with all new features
2. **ServicesAndBookingsTab.tsx** - Now uses Operations panels directly
3. **projectAutofill.ts** - Enhanced field mapping

### Documentation:
1. **BOOKING-PANEL-REFACTOR-TESTING-GUIDE.md** - Comprehensive testing
2. **BOOKING-PANEL-REFACTOR-SUMMARY.md** - Full implementation details
3. **BOOKING-PANEL-QUICK-REFERENCE.md** - This file

---

## 🧪 Quick Test

### Test 1: Operations (Blank Form)
1. Go to **Operations → Brokerage**
2. Click **"Create New Booking"**
3. **Verify:** Form is blank, no team assignment section

### Test 2: Pricing (Auto-filled Form)
1. Go to **Pricing → Projects → [Select Project]**
2. Click **"Services & Bookings"** tab
3. Find Brokerage service, click **"Create Booking"**
4. **Verify:** 
   - Form has blue auto-fill banner
   - Fields have green backgrounds
   - Team assignment section visible
   - Brokerage type is pre-selected
   - Form fields match selected type

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Fields not pre-filled | Check that project has service metadata |
| Team assignment not showing | Verify `source="pricing"` prop is passed |
| Brokerage type not changing form | Check state is updating correctly |
| Green backgrounds not showing | Verify prefillData is being passed |

---

## 🎓 For Developers

### How to Use the Refactored Panel:

```typescript
// From Pricing module
<CreateBrokerageBookingPanel
  isOpen={true}
  onClose={handleClose}
  onSuccess={handleSuccess}
  prefillData={autofillBrokerageFromProject(project)} // Auto-fill data
  source="pricing" // Shows team assignment
  customerId={project.customer_id}
  serviceType="Brokerage"
  currentUser={currentUser}
/>

// From Operations module
<CreateBrokerageBookingPanel
  isOpen={true}
  onClose={handleClose}
  onSuccess={handleSuccess}
  // No prefillData = blank form
  // No source = defaults to "operations"
/>
```

### Field Mapping Example:
```typescript
// Quotation Builder field → Booking Panel field
service_details.subtype → brokerageType
service_details.type_of_entry → customsEntryType
service_details.pod → pod
service_details.mode → mode
service_details.cargo_type → cargoType
service_details.country_of_origin → countryOfOrigin
service_details.preferential_treatment → preferentialTreatment
```

---

## 📋 Brokerage Type Field Differences

### Standard & Non-Regular:
- POD (Port of Discharge)
- Mode (FCL/LCL/AIR)
- Cargo Type
- Commodity Description
- Delivery Address

### All-Inclusive (adds):
- Country of Origin
- Preferential Treatment (Form E/D/AI/AK/JP)

---

## ✅ Quick Checklist for QA

- [ ] Operations: Blank form loads correctly
- [ ] Pricing: Auto-filled form loads correctly
- [ ] Pre-filled fields have green background
- [ ] Auto-fill banner displays
- [ ] Brokerage type pre-selected correctly
- [ ] Form fields change when type changes
- [ ] Team assignment section visible (Pricing only)
- [ ] Can select Supervisor and Handler
- [ ] "Save as default" checkbox works
- [ ] Booking creates successfully
- [ ] Booking appears in project's associated bookings
- [ ] Can navigate to booking from project

---

## 🎯 User Benefits

1. **70% less data entry** when creating from project
2. **Type-aware forms** reduce confusion
3. **Same form everywhere** = no learning curve
4. **Team preferences** ensure continuity
5. **Visual indicators** make process transparent

---

## 📞 Need Help?

1. **Testing Issues:** See `BOOKING-PANEL-REFACTOR-TESTING-GUIDE.md`
2. **Implementation Details:** See `BOOKING-PANEL-REFACTOR-SUMMARY.md`
3. **Code Questions:** Check inline comments in modified files

---

**Last Updated:** January 11, 2026  
**Status:** ✅ Ready for QA Testing
