# Mock Data Removal - Complete Cleanup Plan

## Backend Status ✅
All required APIs are now available:
- ✅ `/contacts` - Full CRUD + seed
- ✅ `/customers` - Full CRUD + seed
- ✅ `/users` - Full CRUD + seed
- ✅ `/quotations` - Full CRUD + seed
- ✅ `/projects` - Full CRUD + seed
- ✅ `/bookings` - Full CRUD + seed
- ✅ `/tasks` - Full CRUD + seed
- ✅ `/activities` - Full CRUD + seed
- ✅ `/vendors` - Full CRUD + seed (JUST ADDED)

## Files to Update

### 1. ContactsListWithFilters.tsx
**Mock dependencies:**
- `mockActivities` - For KPI metrics (calls, emails, meetings)
- `mockBDUsers` - For owner filter dropdown
- `mockCustomers` - For company name lookup in handleSaveContact

**Solution:**
- Fetch activities from `/activities` API for KPI calculations
- Fetch users from `/users?department=BD` for owner dropdown
- Fetch customers from `/customers` for company lookup

### 2. CustomersListWithFilters.tsx
**Mock dependencies:**
- `mockCustomers` - ENTIRE DATA SOURCE (not connected to backend!)
- `mockContacts` - Not directly used
- `mockBDUsers` - For owner dropdown
- `mockActivities` - For last activity calculation and KPIs

**Solution:**
- Replace with `/customers` API
- Fetch activities from `/activities` for KPIs
- Fetch users from `/users?department=BD`

### 3. ContactDetail.tsx
**Mock dependencies:**
- `mockCustomers` - Company lookup
- `mockBDUsers` - User name display
- `mockActivities` - Activity timeline
- `mockTasks` - Tasks list
- `mockQuotationsNew` - Quotations list

**Solution:**
- Fetch from respective backend APIs
- `/customers/:id`, `/users`, `/activities?contact_id=X`, `/tasks?contact_id=X`, `/quotations?contact_id=X`

### 4. CustomerDetail.tsx  
**Mock dependencies:**
- `mockContacts` - Contacts list under customer
- `mockBDUsers` - Owner name
- `mockActivities` - Activity timeline
- `mockTasks` - Tasks list

**Solution:**
- `/contacts?customer_id=X`, `/users/:id`, `/activities?customer_id=X`, `/tasks?customer_id=X`

### 5. Add Panels (AddContactPanel, AddCustomerPanel, AddTaskPanel, AddActivityPanel)
**Mock dependencies:**
- `mockCustomers` - Dropdown options
- `mockContacts` - Dropdown options
- `mockBDUsers` - Assignee dropdown

**Solution:**
- Fetch dropdown data from APIs on panel open

### 6. ActivityDetailInline.tsx, TaskDetail.tsx
**Mock dependencies:**
- Data lookups for display

**Solution:**
- Pass full objects instead of IDs, or fetch from API

### 7. Pricing Module Components
**Components:**
- InquiriesList.tsx - DEPRECATED (inquiries are now quotations with status "Draft")
- PricingDashboard.tsx - Uses mockInquiries, mockQuotations, mockVendors
- PricingReports.tsx - Uses mockQuotations, mockInquiries, mockVendors
- PricingContactDetail.tsx - Uses mockCustomers, mockQuotationsNew
- PricingCustomerDetail.tsx - Uses mockContacts, mockQuotationsNew
- VendorsList.tsx - Uses mockVendors
- QuotationsList.tsx - Uses mockQuotationsNew (partially connected)
- ProjectsList.tsx - Uses mockProjects (partially connected)
- HeaderSection.tsx - Uses mockCustomers for dropdown

**Solution:**
- InquiriesList: DELETE FILE (feature deprecated)
- Dashboard/Reports: Connect to `/quotations`, `/vendors`
- Vendors: Connect to `/vendors`  
- Others: Already have backend, just remove mock fallbacks

## Execution Steps

### Phase 1: Backend Complete ✅
- [x] Add Vendors API

### Phase 2: Frontend - CRM Module
- [ ] Update ContactsListWithFilters
- [ ] Update CustomersListWithFilters
- [ ] Update ContactDetail
- [ ] Update CustomerDetail
- [ ] Update Add Panels (4 files)
- [ ] Update ActivityDetailInline
- [ ] Update TaskDetail

### Phase 3: Frontend - Pricing Module
- [ ] Delete InquiriesList.tsx
- [ ] Update PricingDashboard
- [ ] Update PricingReports
- [ ] Update VendorsList
- [ ] Update PricingContactDetail
- [ ] Update PricingCustomerDetail
- [ ] Update QuotationsList (remove mock fallback)
- [ ] Update ProjectsList (remove mock fallback)
- [ ] Update HeaderSection

### Phase 4: Cleanup
- [ ] Delete /data/bdMockData.ts
- [ ] Delete /data/pricingMockData.ts
- [ ] Search for any remaining imports
- [ ] Test all modules

## Notes
- KPI metrics that depend on activities will show 0 until activities are seeded
- Owner dropdowns will be empty until users are seeded
- This is expected and correct behavior for a clean database
