# 🎯 MOCK DATA REMOVAL - EXECUTION BLUEPRINT

**Last Updated:** 🎉🎉🎉 ALL PHASES COMPLETE! Neuron OS is now fully backend-connected!  
**Status:** Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 ✅ | **MISSION ACCOMPLISHED! 🚀**

---

## 📊 PROGRESS TRACKER

### ✅ PHASE 1: BACKEND APIs (COMPLETE)
- [x] Vendors API added to `/supabase/functions/server/index.tsx`
- [x] All APIs available: contacts, customers, users, quotations, projects, bookings, tasks, activities, vendors

### ✅ PHASE 2: CRM MODULE (COMPLETE - 10/10) 🎉
- [x] 2.1 ContactsListWithFilters.tsx ✅ **COMPLETE**
- [x] 2.2 CustomersListWithFilters.tsx ✅ **COMPLETE**
- [x] 2.3 ContactDetail.tsx ✅ **COMPLETE**
- [x] 2.4 CustomerDetail.tsx ✅ **COMPLETE**
- [x] 2.5 AddContactPanel.tsx ✅ **COMPLETE** (was already mock-free)
- [x] 2.6 AddCustomerPanel.tsx ✅ **COMPLETE**
- [x] 2.7 AddTaskPanel.tsx ✅ **COMPLETE**
- [x] 2.8 AddActivityPanel.tsx ✅ **COMPLETE**
- [x] 2.9 ActivityDetailInline.tsx ✅ **COMPLETE**
- [x] 2.10 TaskDetailInline.tsx ✅ **COMPLETE** (was already mock-free)

### ✅ PHASE 3: PRICING MODULE (COMPLETE - 9/9) 🎉🎉🎉
- [x] 3.1 InquiriesList.tsx ✅ **DELETED** (deprecated feature)
- [x] 3.2 PricingDashboard.tsx ✅ **DELETED** (never used - dead code)
- [x] 3.3 PricingReports.tsx ✅ **COMPLETE**
- [x] 3.4 VendorsList.tsx ✅ **COMPLETE**
- [x] 3.5 ProjectsList.tsx ✅ **COMPLETE**
- [x] 3.6 Quotations.tsx ✅ **COMPLETE**
- [x] 3.7 QuotationsList.tsx ✅ **COMPLETE**
- [x] 3.8 PricingContactDetail.tsx ✅ **COMPLETE**
- [x] 3.9 PricingCustomerDetail.tsx ✅ **COMPLETE** (was mostly backend-connected, removed unused imports)
- [x] 3.10 quotations/HeaderSection.tsx ✅ **DELETED** (deprecated - replaced by GeneralDetailsSection)
- [x] 3.11 quotations/QuotationBuilder.tsx ✅ **DELETED** (deprecated - replaced by QuotationBuilderV3)

### ✅ PHASE 4: CLEANUP & DEAD CODE REMOVAL (COMPLETE - 1/1) 🧹
- [x] 4.1 TaskDetail.tsx ✅ **DELETED** (dead code - never used, only TaskDetailInline is used)

**Note:** Operations module components are already 100% backend-connected! 🎉
- ✅ All operations bookings components are mock-free
- ✅ BusinessDevelopment.tsx is mock-free
- ✅ Operations.tsx is mock-free

---

## 📋 DETAILED IMPLEMENTATION GUIDE

### **2.1 ContactsListWithFilters.tsx**

**Location:** `/components/crm/ContactsListWithFilters.tsx`

**Current Mock Dependencies:**
```typescript
import { mockCustomers, mockBDUsers, mockActivities } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockActivities** - Lines 202, 213, 224
   - Used for KPI calculations: callsMade, emailsSent, meetingsBooked
   - Filter by activity_type and date range
   
2. **mockBDUsers** - Line 574
   - Used for owner filter dropdown
   
3. **mockCustomers** - Lines 101, 102
   - Used in `handleSaveContact` to find company name from company_id

**Implementation Plan:**
1. Add state: `const [users, setUsers] = useState<any[]>([]);`
2. Add state: `const [activities, setActivities] = useState<any[]>([]);`
3. Create `fetchUsers()` function
4. Create `fetchActivities()` function
5. Call both in useEffect on mount
6. Replace mockActivities filters with activities state
7. Replace mockBDUsers with users state
8. For mockCustomers lookup: fetch from `/customers` API or remove if redundant
9. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [users, setUsers] = useState<any[]>([]);
const [activities, setActivities] = useState<any[]>([]);
const [customers, setCustomers] = useState<any[]>([]);

// ADD FETCH FUNCTIONS
const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users?department=BD`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUsers(result.data);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const fetchActivities = async () => {
  try {
    const response = await fetch(`${API_URL}/activities`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setActivities(result.data);
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
};

const fetchCustomers = async () => {
  try {
    const response = await fetch(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setCustomers(result.data);
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  fetchContacts();
  fetchUsers();
  fetchActivities();
  fetchCustomers();
}, []);

// REPLACE mockActivities with activities (lines 202, 213, 224)
const callsMade = activities.filter(activity => {
  const activityDate = new Date(activity.date);
  return activity.activity_type === "Call Logged" && 
         activityDate.getMonth() === currentMonth && 
         activityDate.getFullYear() === currentYear;
}).length;

// REPLACE mockBDUsers with users (line 574)
...users.map(user => ({ value: user.id, label: user.name }))

// REPLACE mockCustomers with customers (lines 101-102)
const customer = customers.find(c => c.id === contactData.company_id);

// REMOVE IMPORT
// DELETE: import { mockCustomers, mockBDUsers, mockActivities } from "../../data/bdMockData";
```

**Status:** ✅ COMPLETE

---

### **2.2 CustomersListWithFilters.tsx**

**Location:** `/components/crm/CustomersListWithFilters.tsx`

**Current Mock Dependencies:**
```typescript
import { mockCustomers, mockContacts, mockBDUsers, mockActivities } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockCustomers** - PRIMARY DATA SOURCE
   - Lines 224, 225, 226, 229 - KPI calculations
   - Line 162 - getLastActivityDate filtering
   - Component renders directly from mockCustomers
   
2. **mockActivities** - Lines 162-163
   - Last activity date calculation
   
3. **mockBDUsers** - Lines 176, 603
   - Owner name display, owner filter dropdown
   
4. **mockContacts** - Not used in current implementation

**Implementation Plan:**
1. Add state: `const [customers, setCustomers] = useState<any[]>([]);`
2. Add state: `const [users, setUsers] = useState<any[]>([]);`
3. Add state: `const [activities, setActivities] = useState<any[]>([]);`
4. Create fetch functions for all three
5. Replace ALL mockCustomers references with customers state
6. Replace mockActivities with activities state
7. Replace mockBDUsers with users state
8. Remove mockContacts import (unused)

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [customers, setCustomers] = useState<any[]>([]);
const [users, setUsers] = useState<any[]>([]);
const [activities, setActivities] = useState<any[]>([]);

// ADD FETCH FUNCTIONS
const fetchCustomers = async () => {
  try {
    const response = await fetch(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setCustomers(result.data);
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users?department=BD`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUsers(result.data);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const fetchActivities = async () => {
  try {
    const response = await fetch(`${API_URL}/activities`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setActivities(result.data);
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  fetchCustomers();
  fetchUsers();
  fetchActivities();
}, []);

// REPLACE mockCustomers with customers (lines 224-229, 162-163)
const getLastActivityDate = (customer: any) => {
  const customerActivities = activities.filter(activity => activity.customer_id === customer.id);
  if (customerActivities.length > 0) {
    const lastActivity = customerActivities.reduce((prev, current) => {
      return new Date(prev.date) > new Date(current.date) ? prev : current;
    });
    return lastActivity.date;
  }
  return null;
};

// REPLACE mockBDUsers with users (lines 176, 603)
...users.map(user => ({ value: user.id, label: user.name }))

// REMOVE IMPORT
// DELETE: import { mockCustomers, mockContacts, mockBDUsers, mockActivities } from "../../data/bdMockData";
```

**Status:** ✅ COMPLETE

---

### **2.3 ContactDetail.tsx**

**Location:** `/components/bd/ContactDetail.tsx`

**Current Mock Dependencies:**
```typescript
import { mockCustomers, mockBDUsers, mockActivities, mockTasks } from "../../data/bdMockData";
import { mockQuotationsNew } from "../../data/pricingMockData";
```

**Usage Analysis:**
1. **mockCustomers** - Lines 149, 1299 - Company lookup
2. **mockBDUsers** - Line 1272 - User name in activity timeline
3. **mockActivities** - Lines 153-155 - Activity timeline data
4. **mockTasks** - Lines 159-161 - Tasks list data
5. **mockQuotationsNew** - Lines 166-169 - Quotations list

**Implementation Plan:**
1. Add state for all data sources
2. Create fetch functions with filters (contact_id)
3. Replace helper functions: getCompany(), getContactActivities(), getContactTasks(), getContactQuotations()
4. Update timeline rendering to use fetched data
5. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [company, setCompany] = useState<any>(null);
const [user, setUser] = useState<any>(null);
const [activities, setActivities] = useState<any[]>([]);
const [tasks, setTasks] = useState<any[]>([]);
const [quotations, setQuotations] = useState<any[]>([]);

// ADD FETCH FUNCTIONS
const fetchCompany = async (companyId: string) => {
  try {
    const response = await fetch(`${API_URL}/customers/${companyId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setCompany(result.data);
  } catch (error) {
    console.error("Error fetching company:", error);
  }
};

const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

const fetchActivities = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/activities?contact_id=${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setActivities(result.data);
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
};

const fetchTasks = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/tasks?contact_id=${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setTasks(result.data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const fetchQuotations = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/quotations?contact_id=${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setQuotations(result.data);
  } catch (error) {
    console.error("Error fetching quotations:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (contactId) {
    fetchCompany(contactData.company_id);
    fetchUser(contactData.owner_id);
    fetchActivities(contactId);
    fetchTasks(contactId);
    fetchQuotations(contactId);
  }
}, [contactId]);

// REPLACE helper functions
const getCompany = () => company;
const getContactActivities = () => activities;
const getContactTasks = () => tasks;
const getContactQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockCustomers, mockBDUsers, mockActivities, mockTasks } from "../../data/bdMockData";
// DELETE: import { mockQuotationsNew } from "../../data/pricingMockData";
```

**Status:** ✅ COMPLETE

---

### **2.4 CustomerDetail.tsx**

**Location:** `/components/bd/CustomerDetail.tsx`

**Current Mock Dependencies:**
```typescript
import { mockContacts, mockBDUsers, mockActivities, mockTasks } from "../../data/bdMockData";
import { mockQuotationsNew } from "../../data/pricingMockData";
```

**Usage Analysis:**
1. **mockContacts** - Lines 1018, 1132 - Contact lookup in activities/tasks
2. **mockBDUsers** - Line 159 - Owner name display
3. **mockActivities** - Lines 141-143 - Activity timeline
4. **mockTasks** - Lines 148-150 - Tasks list
5. **mockQuotationsNew** - Quotations for customer

**Implementation Plan:**
Similar to ContactDetail - fetch all data from backend APIs with customer_id filters

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [contacts, setContacts] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);
const [activities, setActivities] = useState<any[]>([]);
const [tasks, setTasks] = useState<any[]>([]);
const [quotations, setQuotations] = useState<any[]>([]);

// ADD FETCH FUNCTIONS
const fetchContacts = async (customerId: string) => {
  try {
    const response = await fetch(`${API_URL}/contacts?customer_id=${customerId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setContacts(result.data);
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
};

const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

const fetchActivities = async (customerId: string) => {
  try {
    const response = await fetch(`${API_URL}/activities?customer_id=${customerId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setActivities(result.data);
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
};

const fetchTasks = async (customerId: string) => {
  try {
    const response = await fetch(`${API_URL}/tasks?customer_id=${customerId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setTasks(result.data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const fetchQuotations = async (customerId: string) => {
  try {
    const response = await fetch(`${API_URL}/quotations?customer_id=${customerId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setQuotations(result.data);
  } catch (error) {
    console.error("Error fetching quotations:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (customerId) {
    fetchContacts(customerId);
    fetchUser(customerData.owner_id);
    fetchActivities(customerId);
    fetchTasks(customerId);
    fetchQuotations(customerId);
  }
}, [customerId]);

// REPLACE helper functions
const getContacts = () => contacts;
const getCustomerActivities = () => activities;
const getCustomerTasks = () => tasks;
const getCustomerQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockContacts, mockBDUsers, mockActivities, mockTasks } from "../../data/bdMockData";
// DELETE: import { mockQuotationsNew } from "../../data/pricingMockData";
```

**Status:** ✅ COMPLETE

---

### **2.5 AddContactPanel.tsx**

**Location:** `/components/bd/AddContactPanel.tsx`

**Current Mock Dependencies:**
```typescript
import { mockCustomers, mockBDUsers } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockCustomers** - Lines 101, 102 - Company dropdown
2. **mockBDUsers** - Line 103 - Owner dropdown

**Implementation Plan:**
1. Add state for all data sources
2. Create fetch functions with filters (contact_id)
3. Replace helper functions: getCompany(), getContactActivities(), getContactTasks(), getContactQuotations()
4. Update timeline rendering to use fetched data
5. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [company, setCompany] = useState<any>(null);
const [user, setUser] = useState<any>(null);
const [activities, setActivities] = useState<any[]>([]);
const [tasks, setTasks] = useState<any[]>([]);
const [quotations, setQuotations] = useState<any[]>([]);

// ADD FETCH FUNCTIONS
const fetchCompany = async (companyId: string) => {
  try {
    const response = await fetch(`${API_URL}/customers/${companyId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setCompany(result.data);
  } catch (error) {
    console.error("Error fetching company:", error);
  }
};

const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

const fetchActivities = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/activities?contact_id=${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setActivities(result.data);
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
};

const fetchTasks = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/tasks?contact_id=${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setTasks(result.data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const fetchQuotations = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/quotations?contact_id=${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setQuotations(result.data);
  } catch (error) {
    console.error("Error fetching quotations:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (contactId) {
    fetchCompany(contactData.company_id);
    fetchUser(contactData.owner_id);
    fetchActivities(contactId);
    fetchTasks(contactId);
    fetchQuotations(contactId);
  }
}, [contactId]);

// REPLACE helper functions
const getCompany = () => company;
const getContactActivities = () => activities;
const getContactTasks = () => tasks;
const getContactQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockCustomers, mockBDUsers, mockActivities, mockTasks } from "../../data/bdMockData";
// DELETE: import { mockQuotationsNew } from "../../data/pricingMockData";
```

**Status:** ✅ COMPLETE

---

### **2.6 AddCustomerPanel.tsx**

**Location:** `/components/bd/AddCustomerPanel.tsx`

**Current Mock Dependencies:**
```typescript
import { mockBDUsers } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockBDUsers** - Line 103 - Owner dropdown

**Implementation Plan:**
1. Add state for all data sources
2. Create fetch functions with filters (contact_id)
3. Replace helper functions: getCompany(), getContactActivities(), getContactTasks(), getContactQuotations()
4. Update timeline rendering to use fetched data
5. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [user, setUser] = useState<any>(null);

// ADD FETCH FUNCTIONS
const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (contactId) {
    fetchUser(contactData.owner_id);
  }
}, [contactId]);

// REPLACE helper functions
const getCompany = () => company;
const getContactActivities = () => activities;
const getContactTasks = () => tasks;
const getContactQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockBDUsers } from "../../data/bdMockData";
```

**Status:** ✅ COMPLETE

---

### **2.7 AddTaskPanel.tsx**

**Location:** `/components/bd/AddTaskPanel.tsx`

**Current Mock Dependencies:**
```typescript
import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockContacts** - Lines 101, 102 - Contact dropdown
2. **mockBDUsers** - Line 103 - Owner dropdown

**Implementation Plan:**
1. Add state for all data sources
2. Create fetch functions with filters (contact_id)
3. Replace helper functions: getCompany(), getContactActivities(), getContactTasks(), getContactQuotations()
4. Update timeline rendering to use fetched data
5. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [contact, setContact] = useState<any>(null);
const [user, setUser] = useState<any>(null);

// ADD FETCH FUNCTIONS
const fetchContact = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setContact(result.data);
  } catch (error) {
    console.error("Error fetching contact:", error);
  }
};

const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (contactId) {
    fetchContact(contactId);
    fetchUser(contactData.owner_id);
  }
}, [contactId]);

// REPLACE helper functions
const getCompany = () => company;
const getContactActivities = () => activities;
const getContactTasks = () => tasks;
const getContactQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Status:** ✅ COMPLETE

---

### **2.8 AddActivityPanel.tsx**

**Location:** `/components/bd/AddActivityPanel.tsx`

**Current Mock Dependencies:**
```typescript
import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockContacts** - Lines 101, 102 - Contact dropdown
2. **mockBDUsers** - Line 103 - Owner dropdown

**Implementation Plan:**
1. Add state for all data sources
2. Create fetch functions with filters (contact_id)
3. Replace helper functions: getCompany(), getContactActivities(), getContactTasks(), getContactQuotations()
4. Update timeline rendering to use fetched data
5. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [contact, setContact] = useState<any>(null);
const [user, setUser] = useState<any>(null);

// ADD FETCH FUNCTIONS
const fetchContact = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setContact(result.data);
  } catch (error) {
    console.error("Error fetching contact:", error);
  }
};

const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (contactId) {
    fetchContact(contactId);
    fetchUser(contactData.owner_id);
  }
}, [contactId]);

// REPLACE helper functions
const getCompany = () => company;
const getContactActivities = () => activities;
const getContactTasks = () => tasks;
const getContactQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Status:** ✅ COMPLETE

---

### **2.9 ActivityDetailInline.tsx**

**Location:** `/components/bd/ActivityDetailInline.tsx`

**Current Mock Dependencies:**
```typescript
import { mockContacts, mockCustomers, mockBDUsers } from "../../data/bdMockData";
```

**Usage:** Helper lookups for displaying names (contact name, customer name, user name)
**Solution:** ✅ Accept full objects as props instead of just IDs (most efficient - avoids re-fetching)

**Implementation Details:**
1. **Updated Props Interface:**
   - Added `contactInfo?: Contact | null` - Full contact object from parent
   - Added `customerInfo?: Customer | null` - Full customer object from parent
   - Added `userName?: string` - User name from parent
   - All optional with default values

2. **Removed Mock Imports:**
   - ❌ Deleted: `import { mockContacts, mockCustomers, mockBDUsers } from "../../data/bdMockData";`
   - ✅ Added: `import type { Activity, Contact, Customer } from "../../types/bd";`

3. **Removed Mock Helper Functions:**
   - Deleted: `getContactInfo()`, `getCustomerInfo()`, `getUserName()`
   - Now uses props directly: `contactInfo`, `customerInfo`, `userName`

4. **Parent Component Updates:**
   - Updated `CustomerDetail.tsx` to pass resolved data:
     ```typescript
     <ActivityDetailInline
       activity={selectedActivity}
       onBack={() => setSelectedActivity(null)}
       contactInfo={selectedActivity.contact_id ? contacts.find(c => c.id === selectedActivity.contact_id) : null}
       customerInfo={customer}
       userName={selectedActivity.user_id ? users.find(u => u.id === selectedActivity.user_id)?.name : undefined}
     />
     ```

**Benefits:**
- ✅ Zero API calls - reuses data already loaded in parent
- ✅ No loading states needed
- ✅ No error handling needed
- ✅ Simpler component logic
- ✅ Better performance (no duplicate fetches)

**Status:** ✅ COMPLETE

---

### **2.10 TaskDetailInline.tsx**

**Location:** `/components/bd/TaskDetailInline.tsx`

**Current Mock Dependencies:** NONE ✅

**Status Analysis:**
- ✅ **Already Mock-Free!** This component was built correctly from the start
- ✅ Already accepts optional props: `customers?: any[]` and `contacts?: any[]`
- ✅ Already has fallback handling for missing data
- ✅ No mock imports found in the file

**Implementation Details:**
1. **Existing Props Interface (already correct):**
   - `customers?: any[]` - Optional customer array from parent
   - `contacts?: any[]` - Optional contact array from parent
   - Props have fallback logic built-in (lines 66-77)

2. **No Mock Imports:** ✅ File is already clean

3. **Parent Component Updates:**
   - Updated `CustomerDetail.tsx` to pass data:
     ```typescript
     <TaskDetailInline
       task={selectedTask}
       onBack={() => {...}}
       customers={customer ? [customer] : []}
       contacts={contacts}
     />
     ```
   - `BusinessDevelopment.tsx` uses component without props (works fine with fallback handling)

**Note:** There is a separate file `/components/bd/TaskDetail.tsx` that DOES have mock imports, but it is **NOT USED** anywhere in the codebase (dead code). Only `TaskDetailInline.tsx` is actively used.

**Benefits:**
- ✅ Already following best practices
- ✅ Zero API calls when data is passed from parent
- ✅ Graceful degradation when props not provided
- ✅ No changes needed - component was designed well from the start

**Status:** ✅ COMPLETE (was already mock-free)

---

### **3.1 InquiriesList.tsx - DELETE**

**Location:** `/components/pricing/InquiriesList.tsx`

**Action:** DELETE FILE - Inquiries are now quotations with status "Draft"

**Status:** ⏳ NOT STARTED

---

### **3.2 PricingDashboard.tsx**

**Location:** `/components/pricing/PricingDashboard.tsx`

**Current Mock Dependencies:**
```typescript
import { mockInquiries, mockQuotations, mockVendors } from "../../data/pricingMockData";
```

**Implementation:**
- Delete mockInquiries (deprecated feature)
- Fetch quotations from `/quotations`
- Fetch vendors from `/vendors`
- Recalculate all KPIs from fetched data

**Status:** ⏳ NOT STARTED

---

### **3.3 PricingReports.tsx**

**Location:** `/components/pricing/PricingReports.tsx`

**Current Mock Dependencies:**
```typescript
import { mockQuotations, mockInquiries, mockVendors } from "../../data/pricingMockData";
```

**Implementation:**
- Similar to PricingDashboard
- Fetch quotations and vendors
- Remove inquiries references

**Status:** ⏳ NOT STARTED

---

### **3.4 VendorsList.tsx**

**Location:** `/components/pricing/VendorsList.tsx`

**Current Mock Dependencies:**
```typescript
import { mockVendors } from "../../data/pricingMockData";
```

**Implementation:**
- Fetch from `/vendors` API
- Use search and type filters (already supported by backend)
- Keep same UI

**Status:** ✅ COMPLETE

---

### **3.5 ProjectsList.tsx**

**Location:** `/components/pricing/ProjectsList.tsx`

**Current Mock Dependencies:**
```typescript
import { mockProjects } from "../../data/pricingMockData";
```

**Implementation:**
- Fetch from `/projects` API
- Use search and type filters (already supported by backend)
- Keep same UI

**Status:** ✅ COMPLETE

---

### **3.6 Quotations.tsx**

**Location:** `/components/pricing/Quotations.tsx`

**Current Mock Dependencies:**
```typescript
import { mockQuotations } from "../../data/pricingMockData";
```

**Implementation:**
- Fetch from `/quotations` API
- Use search and type filters (already supported by backend)
- Keep same UI

**Status:** ✅ COMPLETE

---

### **3.7 QuotationsList.tsx**

**Location:** `/components/pricing/QuotationsList.tsx`

**Current Mock Dependencies:**
```typescript
import { mockQuotations } from "../../data/pricingMockData";
```

**Implementation:**
- Fetch from `/quotations` API
- Use search and type filters (already supported by backend)
- Keep same UI

**Status:** ✅ COMPLETE

---

### **3.8 PricingContactDetail.tsx**

**Location:** `/components/pricing/PricingContactDetail.tsx`

**Current Mock Dependencies:**
```typescript
import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockContacts** - Lines 101, 102 - Contact dropdown
2. **mockBDUsers** - Line 103 - Owner dropdown

**Implementation Plan:**
1. Add state for all data sources
2. Create fetch functions with filters (contact_id)
3. Replace helper functions: getCompany(), getContactActivities(), getContactTasks(), getContactQuotations()
4. Update timeline rendering to use fetched data
5. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [contact, setContact] = useState<any>(null);
const [user, setUser] = useState<any>(null);

// ADD FETCH FUNCTIONS
const fetchContact = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setContact(result.data);
  } catch (error) {
    console.error("Error fetching contact:", error);
  }
};

const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (contactId) {
    fetchContact(contactId);
    fetchUser(contactData.owner_id);
  }
}, [contactId]);

// REPLACE helper functions
const getCompany = () => company;
const getContactActivities = () => activities;
const getContactTasks = () => tasks;
const getContactQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Status:** ✅ COMPLETE

---

### **3.9 PricingCustomerDetail.tsx**

**Location:** `/components/pricing/PricingCustomerDetail.tsx`

**Current Mock Dependencies:**
```typescript
import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Usage Analysis:**
1. **mockContacts** - Lines 101, 102 - Contact dropdown
2. **mockBDUsers** - Line 103 - Owner dropdown

**Implementation Plan:**
1. Add state for all data sources
2. Create fetch functions with filters (contact_id)
3. Replace helper functions: getCompany(), getContactActivities(), getContactTasks(), getContactQuotations()
4. Update timeline rendering to use fetched data
5. Remove all mock imports

**Code Changes:**
```typescript
// ADD AFTER LINE 7
const [contact, setContact] = useState<any>(null);
const [user, setUser] = useState<any>(null);

// ADD FETCH FUNCTIONS
const fetchContact = async (contactId: string) => {
  try {
    const response = await fetch(`${API_URL}/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setContact(result.data);
  } catch (error) {
    console.error("Error fetching contact:", error);
  }
};

const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) setUser(result.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// UPDATE useEffect
useEffect(() => {
  if (contactId) {
    fetchContact(contactId);
    fetchUser(contactData.owner_id);
  }
}, [contactId]);

// REPLACE helper functions
const getCompany = () => company;
const getContactActivities = () => activities;
const getContactTasks = () => tasks;
const getContactQuotations = () => quotations;

// UPDATE timeline rendering
...activities.map(activity => (
  <div key={activity.id}>
    <p>{activity.date}</p>
    <p>{activity.activity_type}</p>
    <p>{user ? user.name : "Unknown User"}</p>
  </div>
))

// REMOVE IMPORT
// DELETE: import { mockContacts, mockBDUsers } from "../../data/bdMockData";
```

**Status:** ✅ COMPLETE (was mostly backend-connected, removed unused imports)

---

### **3.10 quotations/HeaderSection.tsx - DELETE**

**Location:** `/components/pricing/quotations/HeaderSection.tsx`

**Action:** DELETE FILE - Deprecated - replaced by GeneralDetailsSection

**Status:** ✅ COMPLETE

---

### **3.11 quotations/QuotationBuilder.tsx - DELETE**

**Location:** `/components/pricing/quotations/QuotationBuilder.tsx`

**Action:** DELETE FILE - Deprecated - replaced by QuotationBuilderV3

**Status:** ✅ COMPLETE

---

## 🔧 STANDARD PATTERNS TO FOLLOW

### Pattern 1: Basic Fetch Setup
```typescript
// 1. Add state
const [data, setData] = useState<Type[]>([]);
const [isLoading, setIsLoading] = useState(true);

// 2. Create fetch function
const fetchData = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_URL}/endpoint?params`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success) {
      setData(result.data);
    } else {
      console.error("Error:", result.error);
      setData([]);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setData([]);
  } finally {
    setIsLoading(false);
  }
};

// 3. Call in useEffect
useEffect(() => {
  fetchData();
}, []);
```

### Pattern 2: Dropdown Data (for Add Panels)
```typescript
// Fetch dropdown options when panel opens
useEffect(() => {
  if (isOpen) {
    fetchCustomers();
    fetchContacts();
    fetchUsers();
  }
}, [isOpen]);
```

### Pattern 3: Filtered Fetches
```typescript
// Use URL params for filtering
const fetchActivities = async (contactId: string) => {
  const url = `${API_URL}/activities?contact_id=${contactId}`;
  // ... rest of fetch logic
};
```

---

## 📝 COMMIT CHECKLIST (for each file)

Before marking a file as complete:
- [ ] All mock imports removed
- [ ] All fetch functions implemented
- [ ] All state properly initialized
- [ ] Loading states handled
- [ ] Error states handled
- [ ] UI still renders correctly
- [ ] No console errors
- [ ] Data flows correctly

---

## 🎯 NEXT IMMEDIATE ACTION

**🎉 PHASE 2 (CRM MODULE) COMPLETE!**

**Next Phase:** 3.1 InquiriesList.tsx (DELETE) - Pricing Module cleanup begins
**Then:** 3.2 PricingDashboard.tsx
**Continue in sequence...**

---

**END OF BLUEPRINT**
*This document will be updated after each component is completed*