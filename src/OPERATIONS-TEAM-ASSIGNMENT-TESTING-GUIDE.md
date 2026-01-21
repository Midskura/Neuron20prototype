# Operations Team Assignment - Testing & Validation Guide

**Created:** January 9, 2025  
**Status:** ✅ Ready for Testing  
**Purpose:** Comprehensive testing guide for Phase 5 validation

---

## 📋 TESTING OVERVIEW

This guide covers end-to-end testing of the Operations Team Assignment feature, including:

1. **Workflow Testing** - Complete relay race from Quotation to Booking
2. **UI/UX Review** - Design system consistency and usability
3. **Performance Testing** - Load testing and optimization
4. **Edge Cases** - Error handling and boundary conditions

---

## 🧪 PHASE 5.1: END-TO-END WORKFLOW TEST

### **Test Scenario 1: Complete Workflow (BD → PD → Operations)**

#### **Step 1: BD User - Create Quotation**
**Login as:** BD User (e.g., `jdoe@example.com` / password: `password`)

**Actions:**
1. Navigate to `/bd/inquiries`
2. Create a new inquiry
3. Navigate to `/bd/quotations`
4. Create quotation from the inquiry
5. Add multiple services (Forwarding, Brokerage, etc.)
6. Save quotation

**Expected Results:**
- ✅ Quotation created successfully
- ✅ Status is "Draft" or "Pending"
- ✅ Services metadata saved correctly

---

#### **Step 2: PD User - Price Quotation**
**Login as:** Pricing User (e.g., `schen@example.com` / password: `password`)

**Actions:**
1. Navigate to `/pricing/quotations`
2. Open the quotation created by BD
3. Add pricing details for each service
4. Update status to "Sent to Client"
5. Have BD user mark it as "Accepted by Client"

**Expected Results:**
- ✅ PD user can view and edit quotation
- ✅ Pricing details saved correctly
- ✅ Status updates properly

---

#### **Step 3: PD User - Create Project**
**Login as:** Pricing User

**Actions:**
1. Navigate to `/pricing/quotations`
2. Open quotation with status "Accepted by Client"
3. Click "Accept and Create Project" button
4. Verify project creation

**Expected Results:**
- ✅ "Accept and Create Project" button visible for PD users
- ✅ Project created successfully
- ✅ Project linked to quotation
- ✅ **Modal opens automatically** for booking creation

---

#### **Step 4: PD User - Create Bookings with Team Assignments**
**Login as:** Pricing User (in the modal from Step 3)

**Actions:**
1. Review services in the modal
2. For **Forwarding service**:
   - Verify Manager auto-filled
   - Select Supervisor from dropdown
   - Select Handler from dropdown
   - Check "Save as default handler" checkbox
   - Click "Create Booking"
3. Repeat for other services if applicable
4. Close modal

**Expected Results:**
- ✅ Manager field disabled and auto-filled
- ✅ Supervisor dropdown populated with correct users
- ✅ Handler dropdown populated with correct users
- ✅ If customer has saved preference, handler pre-selected
- ✅ Booking created with team assignments
- ✅ Handler preference saved (if checkbox checked)
- ✅ Booking linked to project
- ✅ Success message displayed

---

#### **Step 5: Operations Manager - View Assigned Bookings**
**Login as:** Operations Manager - Forwarding (e.g., `carlos.mendoza@example.com`)

**Actions:**
1. Navigate to `/operations/forwarding`
2. Review booking list
3. Verify team assignments visible

**Expected Results:**
- ✅ **Projects NOT visible** in Operations sidebar
- ✅ Only Forwarding bookings shown (service_type = Forwarding)
- ✅ Only bookings where user is assigned as Manager shown
- ✅ Team assignments visible in table (Manager, Supervisor, Handler)
- ✅ Can open booking details

---

#### **Step 6: Operations Supervisor - View Assigned Bookings**
**Login as:** Operations Supervisor - Forwarding (e.g., `diana.reyes@example.com`)

**Actions:**
1. Navigate to `/operations/forwarding`
2. Review booking list
3. Verify filtering works

**Expected Results:**
- ✅ Only bookings where user is assigned as Supervisor shown
- ✅ Cannot see bookings from other service types
- ✅ Team assignments visible

---

#### **Step 7: Operations Handler - View Assigned Bookings**
**Login as:** Operations Handler - Forwarding (e.g., `elena.garcia@example.com`)

**Actions:**
1. Navigate to `/operations/forwarding`
2. Review booking list
3. Open booking details

**Expected Results:**
- ✅ Only bookings where user is assigned as Handler shown
- ✅ Team assignments visible in detail view
- ✅ Can update booking information

---

### **Test Scenario 2: Handler Preferences**

#### **Create Booking for Existing Customer with Saved Preference**

**Login as:** Pricing User

**Actions:**
1. Create project from quotation for customer with saved preference
2. Open booking creation modal
3. Observe team assignment form

**Expected Results:**
- ✅ Handler dropdown pre-selects the saved preference
- ✅ Visual indication that this is a saved preference (e.g., "(Default)" label)
- ✅ User can override the preference if needed

---

#### **Update Handler Preference**

**Login as:** Pricing User

**Actions:**
1. Create booking with "Save as default handler" checked
2. Create another booking for same customer
3. Verify new handler is pre-selected

**Expected Results:**
- ✅ New preference overwrites old one
- ✅ New handler pre-selected on subsequent bookings

---

### **Test Scenario 3: Multi-Service Project**

**Login as:** Pricing User

**Actions:**
1. Create project with 3+ services (Forwarding, Brokerage, Trucking)
2. Open booking creation modal
3. Create bookings for each service with different teams

**Expected Results:**
- ✅ All services displayed in modal
- ✅ Each service has independent team assignment form
- ✅ Different managers/supervisors/handlers can be selected per service
- ✅ All bookings created successfully

---

## 🎨 PHASE 5.2: UI/UX REVIEW

### **Design System Consistency**

**Check List:**
- [ ] All new components use Neuron green colors (#12332B, #0F766E)
- [ ] Consistent padding (32px 48px) on all pages
- [ ] Stroke borders (no shadows) used consistently
- [ ] Typography matches existing modules (font sizes, weights)
- [ ] Button styles consistent with design system
- [ ] Form inputs match existing style
- [ ] Modal layout follows Neuron patterns

**Components to Review:**
1. `/components/pricing/TeamAssignmentForm.tsx`
2. `/components/pricing/CreateBookingsFromProjectModal.tsx`
3. `/components/operations/forwarding/ForwardingBookings.tsx` (Team column)

---

### **Responsive Layout**

**Test on different screen sizes:**
- [ ] Desktop (1920x1080): Full layout works
- [ ] Laptop (1366x768): No horizontal scroll, readable
- [ ] Tablet (768x1024): Layout adapts gracefully
- [ ] Mobile (375x667): Not prioritized (desktop app)

---

### **Loading States**

**Verify loading indicators:**
- [ ] Fetching managers/supervisors/handlers shows loading
- [ ] Creating booking shows loading spinner
- [ ] Fetching bookings shows "Loading bookings..." message
- [ ] Saving preferences shows loading state

---

### **Error Messages**

**Verify error handling:**
- [ ] Missing required fields shows validation errors
- [ ] API errors display user-friendly messages
- [ ] Network errors handled gracefully
- [ ] Toast notifications for success/errors work

---

### **Accessibility**

**Check accessibility:**
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Form labels properly associated with inputs
- [ ] Dropdowns accessible via keyboard
- [ ] Error messages announced to screen readers
- [ ] Focus states visible and clear

---

## ⚡ PHASE 5.3: PERFORMANCE TESTING

### **Test 1: Large Dataset Performance**

**Setup:**
1. Create 100+ bookings via migration or manual creation
2. Assign them to various team members

**Test Actions:**
1. Login as Operations user
2. Navigate to booking module
3. Measure page load time
4. Apply filters
5. Scroll through list

**Expected Results:**
- ✅ Page load < 2 seconds
- ✅ Filter response < 500ms
- ✅ Smooth scrolling
- ✅ No browser lag or freezing

---

### **Test 2: API Response Times**

**Endpoints to test:**
- `GET /users?service_type=Forwarding&operations_role=Manager` - Should be < 200ms
- `GET /forwarding-bookings?assigned_to_user_id=...` - Should be < 500ms
- `GET /client-handler-preferences/:customer/:service` - Should be < 200ms
- `POST /forwarding-bookings` - Should be < 1s

**Tools:**
- Browser DevTools Network tab
- Measure Time to First Byte (TTFB)
- Check for slow queries

---

### **Test 3: Memory Leaks**

**Test Actions:**
1. Open booking creation modal
2. Create booking
3. Close modal
4. Repeat 20+ times
5. Monitor browser memory usage

**Expected Results:**
- ✅ Memory usage remains stable
- ✅ No continuous growth
- ✅ Garbage collection working properly

---

## 🔍 PHASE 5.4: EDGE CASES TESTING

### **Edge Case 1: User with No Assigned Bookings**

**Setup:**
1. Login as newly created Operations Handler
2. Navigate to booking module

**Expected Results:**
- ✅ Empty state message: "No bookings assigned to you"
- ✅ No errors in console
- ✅ Option to view instructions or contact manager

---

### **Edge Case 2: User with Multiple Service Types**

**Setup:**
1. Create user with service_type = "Forwarding,Brokerage"
2. Assign bookings in both service types
3. Login as this user

**Expected Results:**
- ✅ User sees bookings from both service types
- ✅ Can navigate between Forwarding and Brokerage modules
- ✅ Filtering works correctly in each module

---

### **Edge Case 3: Customer with No Saved Handler Preference**

**Setup:**
1. Create booking for new customer (no existing preference)

**Expected Results:**
- ✅ Handler dropdown shows all handlers
- ✅ No pre-selection
- ✅ User must manually select handler
- ✅ Can save as default

---

### **Edge Case 4: Missing Team Members**

**Setup:**
1. Create service type with NO Manager or Supervisor
2. Try to create booking

**Expected Results:**
- ✅ Validation error shown
- ✅ Clear message: "No Manager available for this service type"
- ✅ Booking creation blocked
- ✅ User instructed to contact admin

---

### **Edge Case 5: Deleting User Assigned to Bookings**

**Setup:**
1. Create booking assigned to Handler A
2. Delete Handler A from users

**Expected Results:**
- ⚠️ **Decision needed**: Should deletion be blocked? Or should bookings be reassigned?
- For now: Display warning but allow deletion (orphaned bookings shown with "[Deleted User]")

---

### **Edge Case 6: Concurrent Booking Creation**

**Setup:**
1. Two PD users create bookings for same project simultaneously

**Expected Results:**
- ✅ Both bookings created successfully
- ✅ No race condition errors
- ✅ Bookings have different IDs

---

### **Edge Case 7: Project with No Services**

**Setup:**
1. Create project with empty services_metadata

**Expected Results:**
- ✅ Booking creation modal shows message: "No services to create bookings for"
- ✅ Modal can be closed
- ✅ No errors

---

### **Edge Case 8: Network Failure During Booking Creation**

**Setup:**
1. Simulate network failure (browser DevTools → Network → Offline)
2. Try to create booking

**Expected Results:**
- ✅ Error message: "Unable to connect to server"
- ✅ Booking not created
- ✅ User can retry
- ✅ No partial data saved

---

## ✅ FINAL VALIDATION CHECKLIST

### **Workflow**
- [ ] BD can create quotations
- [ ] PD can price quotations
- [ ] BD can mark as "Accepted by Client"
- [ ] PD can create projects
- [ ] PD can create bookings with team assignments
- [ ] Operations sees only assigned bookings
- [ ] Operations has no Projects module

### **Team Assignments**
- [ ] Manager auto-filled per service type
- [ ] Supervisor manually selected
- [ ] Handler manually selected
- [ ] Handler preferences saved per customer + service type
- [ ] Preferences pre-select handlers on subsequent bookings

### **Navigation**
- [ ] Operations sidebar has NO Projects
- [ ] Pricing sidebar HAS Projects
- [ ] BD sidebar HAS Projects
- [ ] All navigation links work correctly

### **Data Integrity**
- [ ] All new bookings created with assignments
- [ ] All existing bookings migrated with assignments
- [ ] Handler preferences saved and loaded correctly
- [ ] No data loss during migration
- [ ] Bookings linked to projects correctly

### **Performance**
- [ ] Page load times acceptable (<2s)
- [ ] API response times fast (<500ms)
- [ ] No memory leaks
- [ ] Smooth user experience

### **Error Handling**
- [ ] Validation errors clear and helpful
- [ ] Network errors handled gracefully
- [ ] Missing data shows empty states
- [ ] No console errors

---

## 🐛 BUG REPORTING TEMPLATE

**If you find issues during testing, use this template:**

```
**Bug Title:** [Short description]

**Severity:** [Critical / High / Medium / Low]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Browser/Environment:**
- Browser: [Chrome/Firefox/Safari]
- Version: [Version number]
- OS: [Windows/Mac/Linux]

**Console Errors:**
[Paste any console errors]
```

---

## 📊 TEST RESULTS SUMMARY

**After completing all tests, fill this out:**

| Test Category | Pass Rate | Notes |
|--------------|-----------|-------|
| 5.1 - End-to-End Workflow | __/9 scenarios passed | |
| 5.2 - UI/UX Review | __/7 checks passed | |
| 5.3 - Performance | __/3 tests passed | |
| 5.4 - Edge Cases | __/8 cases passed | |

**Overall Status:** [ ] ✅ All Pass | [ ] ⚠️ Pass with Minor Issues | [ ] ❌ Fail - Needs Fixes

**Sign-off:**
- Tested by: _______________
- Date: _______________
- Approved by: _______________

---

## 🚀 DEPLOYMENT READINESS

**Before deploying to production:**

- [ ] All Phase 5 tests completed
- [ ] No critical or high severity bugs
- [ ] Performance benchmarks met
- [ ] Data migration tested and verified
- [ ] Rollback plan documented
- [ ] Stakeholder sign-off received

**Migration Checklist:**
- [ ] Test migration endpoint works: `GET /admin/test-migration`
- [ ] Run migration: `POST /admin/migrate-booking-assignments`
- [ ] Verify migration results in database
- [ ] Confirm all bookings have team assignments
- [ ] Test Operations user login and booking access

**Production Deployment Steps:**
1. Backup database
2. Deploy code changes
3. Run migration endpoint
4. Verify in production
5. Monitor for errors
6. Notify users of new features

---

**END OF TESTING GUIDE**
