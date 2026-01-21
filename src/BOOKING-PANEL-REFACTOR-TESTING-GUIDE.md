# Booking Panel Refactor - Testing Guide

## Overview
This guide covers testing for the major refactoring of booking creation panels to support auto-fill from projects and dynamic forms based on service types.

---

## ✅ Phase 1: Brokerage Booking Panel - COMPLETED

### New Features Implemented:
1. **Prefill Support**: Panel accepts `prefillData` prop for auto-filling from projects
2. **Source Detection**: Panel knows if it's being called from Operations or Pricing modules
3. **Team Assignment**: Integrated team assignment form (Manager, Supervisor, Handler) when called from Pricing
4. **Dynamic Brokerage Types**: Form changes based on type (Standard, All-Inclusive, Non-Regular)
5. **Visual Indicators**: Pre-filled fields have light green background (#F0FDF4)
6. **Auto-fill Banner**: Shows information banner when data is pre-filled from project

### Testing Checklist:

#### Test 1: Operations Module - Blank Form
**Location**: Operations → Brokerage → Create New Booking
- [ ] Panel opens with all fields empty
- [ ] No team assignment section visible
- [ ] No auto-fill banner shown
- [ ] Brokerage type selection works (Standard/All-Inclusive/Non-Regular)
- [ ] Form fields change based on selected brokerage type
- [ ] All-Inclusive shows: Country of Origin, Preferential Treatment fields
- [ ] Standard shows: POD, Mode, Cargo Type fields
- [ ] Non-Regular shows: Same as Standard
- [ ] Can successfully create booking

#### Test 2: Pricing Module - Auto-filled Form
**Location**: Pricing → Projects → [Select Project] → Services & Bookings → [Select Brokerage Service] → Create Booking
- [ ] Panel opens with pre-filled data from project
- [ ] Auto-fill banner displays at top
- [ ] Pre-filled fields have light green background
- [ ] Team assignment section is visible
- [ ] Brokerage type is pre-selected from project service metadata
- [ ] Form fields match the pre-selected brokerage type
- [ ] Can edit any pre-filled field
- [ ] Manager auto-populates
- [ ] Can select Supervisor and Handler
- [ ] "Save as default" checkbox works
- [ ] Booking creates successfully with team assignments

#### Test 3: Field Mapping Accuracy
**Verify these fields are correctly pre-filled from Quotation Builder:**
- [ ] Customer Name
- [ ] Project Number
- [ ] Quotation Reference
- [ ] Brokerage Type (Standard/All-Inclusive/Non-Regular)
- [ ] Customs Entry Type
- [ ] Commodity Description
- [ ] Delivery Address
- [ ] POD (Port of Discharge)
- [ ] Mode (FCL/LCL/AIR/Multi-modal)
- [ ] Cargo Type
- [ ] Country of Origin (for All-Inclusive)
- [ ] Preferential Treatment (for All-Inclusive)

---

## ✅ Phase 2: Other Service Panels - NOTED

### Status:
- Forwarding panel already has good ProjectAutofillSection component
- Trucking, Marine Insurance, Others panels need similar refactoring
- These can be done in follow-up work as needed

### Recommended Pattern:
When refactoring these panels, follow the same pattern as Brokerage:
1. Add `prefillData`, `source`, `customerId`, `serviceType`, `currentUser` props
2. Add team assignment section (conditional on `source === "pricing"`)
3. Apply light green background to pre-filled fields
4. Show auto-fill banner when prefillData is provided

---

## ✅ Phase 3: Project Autofill Utilities - COMPLETED

### Enhanced Functions:
- `autofillBrokerageFromProject()` - Now includes comprehensive field mapping
- `autofillForwardingFromProject()` - Already complete
- `autofillTruckingFromProject()` - Already complete
- `autofillMarineInsuranceFromProject()` - Already complete
- `autofillOthersFromProject()` - Already complete

### Testing Checklist:

#### Test 1: Brokerage Autofill
**Create a quotation with Brokerage service → Convert to Project → Create Booking**
- [ ] `brokerageType` correctly mapped from `service_details.subtype`
- [ ] `customsEntryType` mapped from `service_details.type_of_entry`
- [ ] `pod` mapped from `service_details.pod`
- [ ] `mode` mapped from `service_details.mode`
- [ ] `cargoType` mapped from `service_details.cargo_type`
- [ ] `countryOfOrigin` mapped (for All-Inclusive)
- [ ] `preferentialTreatment` mapped (for All-Inclusive)
- [ ] `commodityDescription` mapped
- [ ] `deliveryAddress` mapped

---

## ✅ Phase 4: Pricing Module Integration - COMPLETED

### Changes Made:
- `ServicesAndBookingsTab.tsx` now uses Operations panels directly
- Panel selection based on service type
- Autofill data generation per service type
- Passes correct props (`source="pricing"`, `customerId`, etc.)

### Testing Checklist:

#### Test 1: Brokerage Booking from Project
**Location**: Pricing → Projects → [Select Project with Brokerage] → Services & Bookings
- [ ] "Create Booking" button visible for each service
- [ ] Clicking button opens correct service panel (Brokerage panel for Brokerage service)
- [ ] Panel has auto-fill banner
- [ ] Panel shows team assignment section
- [ ] All project data is pre-filled correctly
- [ ] Brokerage type matches quotation specification
- [ ] Form fields match selected brokerage type
- [ ] Can create booking successfully
- [ ] New booking appears in "Associated Bookings" section
- [ ] Booking count badge updates

#### Test 2: Multiple Services in One Project
**Create project with Forwarding + Brokerage services:**
- [ ] Each service card shows correct specification
- [ ] Clicking "Create Booking" on Forwarding opens Forwarding panel
- [ ] Clicking "Create Booking" on Brokerage opens Brokerage panel
- [ ] Each panel has correct pre-fill data for its service type
- [ ] Can create bookings for both services
- [ ] Both bookings link correctly to project

#### Test 3: Service Specification Display
- [ ] Forwarding displays: Mode, Cargo Type, POL → POD
- [ ] Brokerage displays: Subtype, Type of Entry
- [ ] Trucking displays: Truck Type
- [ ] Marine Insurance displays: Commodity Description
- [ ] Others displays: Service Description (truncated at 80 chars)

---

## 🔍 Phase 5: Integration Testing - IN PROGRESS

### End-to-End Workflow Tests:

#### Workflow 1: BD → Pricing → Operations (Brokerage)
**Steps:**
1. BD creates quotation with Brokerage service (All-Inclusive type)
2. BD marks quotation as "Won"
3. Pricing converts quotation to project
4. Pricing goes to Services & Bookings tab
5. Pricing clicks "Create Booking" for Brokerage service
6. Verify panel opens with:
   - Auto-fill banner
   - Brokerage type pre-selected as "All-Inclusive"
   - Country of Origin and Preferential Treatment fields visible
   - All quotation data pre-filled
   - Team assignment section visible
7. Pricing selects team assignments
8. Pricing creates booking
9. Operations user (assigned handler) sees booking in Brokerage module
10. Operations can view/edit booking

**Expected Results:**
- [ ] All data flows correctly through relay race
- [ ] Brokerage type selection persists
- [ ] Form displays correct fields for All-Inclusive type
- [ ] Team assignments save correctly
- [ ] Handler preference saves (if checkbox selected)
- [ ] Operations sees booking with all correct data

#### Workflow 2: Operations Direct Creation
**Steps:**
1. Operations user goes to Brokerage module
2. Clicks "Create New Booking"
3. Panel opens blank
4. User selects "Standard" brokerage type
5. Fills in required fields
6. Creates booking

**Expected Results:**
- [ ] No auto-fill banner shown
- [ ] No team assignment section shown
- [ ] Form changes correctly when selecting brokerage type
- [ ] Standard type shows correct fields
- [ ] Booking creates successfully
- [ ] No project linkage (standalone booking)

#### Workflow 3: Existing Client Handler Preference
**Setup:** Create a client handler preference for "Client ABC" + Brokerage service
**Steps:**
1. Create project for "Client ABC" with Brokerage service
2. Go to Services & Bookings → Create Booking
3. Team assignment form should auto-load saved preference
4. Verify pre-filled supervisor and handler

**Expected Results:**
- [ ] Saved preference loads automatically
- [ ] Supervisor field pre-filled
- [ ] Handler field pre-filled
- [ ] Can override if needed
- [ ] Can update preference with "Save as default"

---

## 🐛 Common Issues to Check

### Issue 1: Pre-fill Not Working
**Symptoms:** Panel opens but fields are empty
**Check:**
- [ ] `prefillData` prop is being passed correctly
- [ ] `projectAutofill` function returns correct data structure
- [ ] Field names match between autofill data and form fields
- [ ] `useEffect` is applying prefill data correctly

### Issue 2: Team Assignment Not Visible
**Symptoms:** No team assignment section in Pricing module
**Check:**
- [ ] `source` prop is set to `"pricing"`
- [ ] `customerId` prop is provided
- [ ] Conditional rendering logic is correct

### Issue 3: Brokerage Type Not Changing Form
**Symptoms:** Selecting different brokerage type doesn't change form fields
**Check:**
- [ ] `brokerageType` state is updating correctly
- [ ] Conditional rendering based on `formData.brokerageType`
- [ ] All three types have correct field sets

### Issue 4: Pre-filled Fields Not Editable
**Symptoms:** Cannot type in green-background fields
**Check:**
- [ ] Fields are not set to `disabled` or `readOnly`
- [ ] `onChange` handlers are attached correctly
- [ ] Form state updates on change

### Issue 5: Booking Not Linking to Project
**Symptoms:** Booking created but doesn't appear in project
**Check:**
- [ ] `linkBookingToProject` function is being called
- [ ] Project ID is correct
- [ ] Booking ID is correct
- [ ] Backend endpoint for linking is working

---

## 📊 Test Data Setup

### Sample Quotation with Brokerage (All-Inclusive):
```
Customer: ABC Trading Corp
Service: Brokerage
Type: All-Inclusive
Type of Entry: Consumption
POD: NAIA
Mode: AIR
Cargo Type: Dry
Commodity: Electronic Components
Delivery Address: Manila, Philippines
Country of Origin: China
Preferential Treatment: Form E
```

### Sample Quotation with Brokerage (Standard):
```
Customer: XYZ Logistics Inc
Service: Brokerage
Type: Standard
Type of Entry: Warehousing
POD: MICP
Mode: FCL
Cargo Type: Reefer
Commodity: Fresh Produce
Delivery Address: Cebu, Philippines
```

---

## ✅ Sign-off Checklist

Before marking implementation as complete:
- [ ] All Phase 1 tests pass (Brokerage panel)
- [ ] All Phase 3 tests pass (Autofill utilities)
- [ ] All Phase 4 tests pass (Pricing integration)
- [ ] All Phase 5 workflows complete successfully
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No visual glitches or layout issues
- [ ] Mobile responsiveness (if applicable)
- [ ] Browser compatibility (Chrome, Firefox, Safari)

---

## 🎯 Success Criteria

### Primary Goals (MUST HAVE):
✅ When clicking "Create Booking" in Pricing → Services & Bookings:
- Panel that opens is the same detailed panel as Operations
- Panel is auto-filled with service details from project
- For Brokerage: Form changes based on type (Standard/All-Inclusive/Non-Regular)
- Team assignments work correctly
- Bookings link to projects correctly

### Secondary Goals (NICE TO HAVE):
- Pre-filled fields visually distinct
- Auto-fill banner informative
- Smooth user experience
- Handler preferences save and load
- No duplicate bookings per service type per project

---

## 📝 Notes for Future Enhancements

1. **Other Service Panels**: Apply same refactor pattern to Forwarding, Trucking, Marine Insurance, Others
2. **Validation**: Add field-level validation based on brokerage type
3. **Field Dependencies**: Auto-populate related fields based on selections
4. **Audit Trail**: Log when fields are auto-filled vs manually entered
5. **Bulk Creation**: Allow creating multiple bookings from multi-service projects
6. **Templates**: Save frequently used booking configurations

---

## 🚀 Deployment Checklist

Before deploying to production:
- [ ] All tests documented here pass
- [ ] Database migrations run (if any)
- [ ] Backend endpoints tested
- [ ] User acceptance testing complete
- [ ] Training materials updated
- [ ] Stakeholders notified of changes
- [ ] Rollback plan prepared

---

**Last Updated:** January 11, 2026
**Implementation Status:** Phase 1-4 Complete, Phase 5 Testing
