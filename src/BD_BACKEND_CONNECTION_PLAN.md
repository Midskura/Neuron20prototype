# Business Development Module - Backend Connection Plan

## Current State Analysis

### ✅ What's Working
- **Quotations**: Fully connected to backend (`/quotations` endpoints)
- **Projects**: Fully connected to backend (`/projects` endpoints)  
- **AddInquiryPanel**: Already uses correct backend structure with `name` field
- **CustomerDetail**: Uses backward-compatible `customer.name || customer.company_name`

### ❌ Critical Issues Identified

#### 1. **DUPLICATE ROUTE DEFINITIONS** (Lines 2238-2731 vs 4905-5246)
**Problem**: Server has TWO sets of customer/contact routes defined
- **Old routes (2238-2731)**: Use `company_name` field structure
- **New routes (4905-5246)**: Use `name` field structure  
- **Result**: Hono uses first matching route, causing unpredictable behavior

**Routes Duplicated**:
- `GET /customers` (lines 2501 & 4905)
- `GET /customers/:id` (lines 2632 & 4924)
- `POST /customers` (lines 2470 & 4941)
- `PUT /customers/:id` (lines 2697 & 4974)
- `DELETE /customers/:id` (lines 2731 & 5005)
- `GET /contacts` (lines 2270 & 5117)
- `GET /contacts/:id` (lines 2389 & 5143)
- `POST /contacts` (lines 2238 & 5160)
- `PUT /contacts/:id` (lines 2418 & 5193)
- `DELETE /contacts/:id` (lines 2452 & 5224)

#### 2. **CUSTOMER FIELD MISMATCH**
**Backend Schema** (seed data, line 5038):
```typescript
{
  id: "CUST-001",
  name: "Manila Electronics Corp",  // ← Uses 'name'
  industry: "Electronics & Technology",
  credit_terms: "Net 30",
  address: "123 Ayala Avenue...",
  // ...
}
```

**Frontend Usage** (multiple components):
```typescript
// ❌ WRONG - Looking for company_name
customer.company_name
formData.company_name
customer?.company_name

// ✅ CORRECT - Should use name
customer.name
formData.name
customer?.name
```

**Affected Components**:
- `/components/bd/ActivitiesList.tsx` (line 67)
- `/components/bd/ActivityDetailInline.tsx` (line 189)
- `/components/bd/AddActivityPanel.tsx` (line 201)
- `/components/bd/AddCustomerPanel.tsx` (lines 29, 48, 65, 77, 159-169)
- `/components/bd/AddTaskPanel.tsx` (line 195)
- `/components/bd/ContactDetail.tsx` (lines 606, 951)
- `/components/bd/BudgetRequestDetailPanel.tsx` (usage unknown)
- `/components/crm/CustomersListWithFilters.tsx` (likely affected)

#### 3. **CONTACT PERSON FILTERING MISMATCH**
**Backend Structure** (line 2295):
```typescript
// Contacts have customer_id field
contact.customer_id === customer_id || 
contact.company === customer.company_name  // Fallback
```

**Frontend ContactPersonAutocomplete** (line 56):
```typescript
// ❌ WRONG - Filters by non-existent company field
if (companyName) {
  filteredContacts = result.data.filter(
    (contact: Contact) => contact.company === companyName  // ← Doesn't work!
  );
}
```

**Should be**:
```typescript
// ✅ CORRECT - Filter by customer_id
if (customerId) {
  filteredContacts = result.data.filter(
    (contact: Contact) => contact.customer_id === customerId
  );
}
```

**Impact**: Contact person dropdown shows ZERO results because filtering logic is broken

#### 4. **MISSING BACKEND APIs**
The following BD features have **NO backend implementation**:

| Feature | Status | Impact |
|---------|--------|--------|
| **Tasks** | ❌ No `/tasks` endpoints | Using mock data only |
| **Activities** | ❌ No `/activities` CRUD (only `/activity-log` exists) | Using mock data only |
| **Budget Requests** | ❌ No `/budget-requests` endpoints | Using mock data only |
| **Inquiries** | ⚠️ Unclear (quotations exist, but inquiry workflow unclear) | Partial functionality |

---

## 🎯 IMPLEMENTATION PLAN

### **PHASE 1: Critical Fixes** (Immediate - Do This First)

#### Step 1.1: Remove Duplicate Routes in Server
**File**: `/supabase/functions/server/index.tsx`

**Action**: Delete OLD route definitions (lines ~2238-2731) that use `company_name` schema
- Keep ONLY the new routes (lines ~4905-5246) that use `name` schema
- Delete the following sections:
  - Old contacts POST (line 2238)
  - Old contacts GET (line 2270)
  - Old contacts GET /:id (line 2389)
  - Old contacts PUT /:id (line 2418)
  - Old contacts DELETE /:id (line 2452)
  - Old customers POST (line 2470)
  - Old customers GET (line 2501)
  - Old customers GET /:id (line 2632)
  - Old customers PUT /:id (line 2697)
  - Old customers DELETE /:id (line 2731)

**Why**: Prevents route conflicts and ensures consistent data schema

#### Step 1.2: Fix CompanyAutocomplete Field Mapping
**File**: `/components/crm/CompanyAutocomplete.tsx`

**Current** (line 88-89):
```typescript
const displayName = customer.name || customer.company_name || '';
onChange(displayName, customer.id);
```

**Change to**:
```typescript
// Backend always uses 'name' field
const displayName = customer.name || '';
onChange(displayName, customer.id);
```

**Display** (line 304):
```typescript
{customer.name || customer.company_name}
```

**Change to**:
```typescript
{customer.name}
```

#### Step 1.3: Fix ContactPersonAutocomplete Filtering
**File**: `/components/crm/ContactPersonAutocomplete.tsx`

**Current Interface** (line 11):
```typescript
interface ContactPersonAutocompleteProps {
  value: string; // contact_name
  contactId?: string; // contact_id
  companyName?: string; // Filter by this company ← WRONG
  onChange: (contactName: string, contactId: string) => void;
  // ...
}
```

**Change to**:
```typescript
interface ContactPersonAutocompleteProps {
  value: string; // contact_name
  contactId?: string; // contact_id
  customerId?: string; // ✅ Filter by customer_id instead
  onChange: (contactName: string, contactId: string) => void;
  // ...
}
```

**Current Filtering** (lines 52-59):
```typescript
if (result.success) {
  // Filter contacts by company name if provided
  let filteredContacts = result.data;
  if (companyName) {
    filteredContacts = result.data.filter(
      (contact: Contact) => contact.company === companyName  // ❌ BROKEN
    );
  }
  setContacts(filteredContacts);
}
```

**Change to**:
```typescript
if (result.success) {
  let filteredContacts = result.data;
  
  // ✅ Filter by customer_id on the backend instead
  if (customerId) {
    const params = new URLSearchParams({ customer_id: customerId });
    // Refetch with filter parameter
  }
  
  setContacts(filteredContacts);
}
```

**OR** (Better approach - filter via API):
```typescript
// Modify fetchContacts to accept customerId parameter
const fetchContacts = async (search: string = "", customer_id?: string) => {
  setIsLoading(true);
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (customer_id) params.append("customer_id", customer_id);  // ✅ Backend filtering

    const response = await fetch(`${API_URL}/contacts?${params.toString()}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` }
    });

    const result = await response.json();
    if (result.success) {
      setContacts(result.data);  // ✅ Already filtered by backend
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
  } finally {
    setIsLoading(false);
  }
};

// Call with customerId when it changes
useEffect(() => {
  if (isOpen) {
    fetchContacts(searchQuery, customerId);
  }
}, [isOpen, customerId]);
```

**Update props passed from GeneralDetailsSection**:
```typescript
// OLD
<ContactPersonAutocomplete
  companyName={customerName}  // ❌ Wrong
  // ...
/>

// NEW
<ContactPersonAutocomplete
  customerId={customerId}  // ✅ Correct
  // ...
/>
```

#### Step 1.4: Update All Frontend Components to Use `name` Field
**Files to update**:

1. **AddCustomerPanel.tsx** - Change all `company_name` to `name`
2. **ActivitiesList.tsx** - Update line 67: `customer?.name`
3. **ActivityDetailInline.tsx** - Update line 189: `customer.name`
4. **AddActivityPanel.tsx** - Update line 201: `customer.name`
5. **AddTaskPanel.tsx** - Update line 195: `customer.name`
6. **ContactDetail.tsx** - Update lines 606, 951: `company?.name`
7. **BudgetRequestDetailPanel.tsx** - Search and update any `company_name` usage
8. **CustomersListWithFilters.tsx** - Likely uses `company_name` in display

**Pattern to find/replace**:
```bash
# Search for:
company_name

# Replace with:
name
```

**Exception**: Keep backward compatibility in CustomerDetail (line 86):
```typescript
// ✅ Keep this for safety during transition
customer.name || customer.company_name
```

---

### **PHASE 2: Missing Backend APIs** (High Priority)

#### Step 2.1: Implement Tasks API
**File**: `/supabase/functions/server/index.tsx`

**Add routes**:
```typescript
// Get all tasks (with filters)
app.get("/make-server-c142e950/tasks", async (c) => {
  try {
    const customer_id = c.req.query("customer_id");
    const status = c.req.query("status");
    const assigned_to = c.req.query("assigned_to");
    
    let tasks = await kv.getByPrefix("task:");
    
    // Filter by customer_id
    if (customer_id) {
      tasks = tasks.filter((t: any) => t.customer_id === customer_id);
    }
    
    // Filter by status
    if (status && status !== "All") {
      tasks = tasks.filter((t: any) => t.status === status);
    }
    
    // Filter by assigned user
    if (assigned_to) {
      tasks = tasks.filter((t: any) => t.assigned_to === assigned_to);
    }
    
    // Sort by due date (newest first)
    tasks.sort((a: any, b: any) => 
      new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    );
    
    return c.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single task by ID
app.get("/make-server-c142e950/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const task = await kv.get(`task:${id}`);
    
    if (!task) {
      return c.json({ success: false, error: "Task not found" }, 404);
    }
    
    return c.json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create task
app.post("/make-server-c142e950/tasks", async (c) => {
  try {
    const data = await c.req.json();
    
    const task = {
      id: data.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type, // "Call" | "Meeting" | "Email" | "Follow-up" | "Other"
      title: data.title,
      description: data.description || "",
      customer_id: data.customer_id,
      customer_name: data.customer_name, // Denormalized for easy display
      assigned_to: data.assigned_to,
      due_date: data.due_date,
      priority: data.priority || "Medium", // "Low" | "Medium" | "High"
      status: data.status || "Pending", // "Pending" | "In Progress" | "Completed" | "Cancelled"
      created_at: new Date().toISOString(),
      created_by: data.created_by,
      updated_at: new Date().toISOString(),
      completed_at: null,
      notes: data.notes || "",
    };
    
    await kv.set(`task:${task.id}`, task);
    console.log(`✅ Created task: ${task.id} - ${task.title}`);
    
    return c.json({ success: true, data: task });
  } catch (error) {
    console.error("Error creating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update task
app.put("/make-server-c142e950/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existingTask = await kv.get(`task:${id}`);
    if (!existingTask) {
      return c.json({ success: false, error: "Task not found" }, 404);
    }
    
    const updatedTask = {
      ...existingTask,
      ...updates,
      id, // Prevent ID changes
      updated_at: new Date().toISOString(),
      // If status changed to Completed, record completion time
      completed_at: updates.status === "Completed" 
        ? new Date().toISOString() 
        : existingTask.completed_at,
    };
    
    await kv.set(`task:${id}`, updatedTask);
    console.log(`✅ Updated task: ${id}`);
    
    return c.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete task
app.delete("/make-server-c142e950/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`task:${id}`);
    console.log(`✅ Deleted task: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});
```

#### Step 2.2: Implement Activities API
**File**: `/supabase/functions/server/index.tsx`

**Add routes**:
```typescript
// Get all activities (with filters)
app.get("/make-server-c142e950/activities", async (c) => {
  try {
    const customer_id = c.req.query("customer_id");
    const type = c.req.query("type");
    const owner = c.req.query("owner");
    
    let activities = await kv.getByPrefix("activity:");
    
    // Filter by customer_id
    if (customer_id) {
      activities = activities.filter((a: any) => a.customer_id === customer_id);
    }
    
    // Filter by type
    if (type && type !== "All") {
      activities = activities.filter((a: any) => a.type === type);
    }
    
    // Filter by owner
    if (owner && owner !== "All") {
      activities = activities.filter((a: any) => a.owner === owner);
    }
    
    // Sort by date (newest first)
    activities.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return c.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single activity by ID
app.get("/make-server-c142e950/activities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const activity = await kv.get(`activity:${id}`);
    
    if (!activity) {
      return c.json({ success: false, error: "Activity not found" }, 404);
    }
    
    return c.json({ success: true, data: activity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create activity (log activity)
app.post("/make-server-c142e950/activities", async (c) => {
  try {
    const data = await c.req.json();
    
    const activity = {
      id: data.id || `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type, // "Call" | "Email" | "Meeting" | "Site Visit" | "Other"
      subject: data.subject,
      outcome: data.outcome,
      notes: data.notes || "",
      customer_id: data.customer_id,
      customer_name: data.customer_name, // Denormalized
      contact_person: data.contact_person || "",
      owner: data.owner, // User ID who logged this activity
      date: data.date || new Date().toISOString(),
      duration: data.duration || "", // e.g., "30 min"
      next_action: data.next_action || "",
      attachments: data.attachments || [], // Array of file objects
      created_at: new Date().toISOString(),
      created_by: data.created_by,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`activity:${activity.id}`, activity);
    console.log(`✅ Created activity: ${activity.id} - ${activity.subject}`);
    
    return c.json({ success: true, data: activity });
  } catch (error) {
    console.error("Error creating activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update activity
app.put("/make-server-c142e950/activities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existingActivity = await kv.get(`activity:${id}`);
    if (!existingActivity) {
      return c.json({ success: false, error: "Activity not found" }, 404);
    }
    
    const updatedActivity = {
      ...existingActivity,
      ...updates,
      id, // Prevent ID changes
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`activity:${id}`, updatedActivity);
    console.log(`✅ Updated activity: ${id}`);
    
    return c.json({ success: true, data: updatedActivity });
  } catch (error) {
    console.error("Error updating activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete activity
app.delete("/make-server-c142e950/activities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`activity:${id}`);
    console.log(`✅ Deleted activity: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});
```

#### Step 2.3: Implement Budget Requests API
**File**: `/supabase/functions/server/index.tsx`

```typescript
// Get all budget requests (with filters)
app.get("/make-server-c142e950/budget-requests", async (c) => {
  try {
    const status = c.req.query("status");
    const requested_by = c.req.query("requested_by");
    
    let requests = await kv.getByPrefix("budget_request:");
    
    // Filter by status
    if (status && status !== "All") {
      requests = requests.filter((r: any) => r.status === status);
    }
    
    // Filter by requester
    if (requested_by) {
      requests = requests.filter((r: any) => r.requested_by === requested_by);
    }
    
    // Sort by created date (newest first)
    requests.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching budget requests:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single budget request
app.get("/make-server-c142e950/budget-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const request = await kv.get(`budget_request:${id}`);
    
    if (!request) {
      return c.json({ success: false, error: "Budget request not found" }, 404);
    }
    
    return c.json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create budget request
app.post("/make-server-c142e950/budget-requests", async (c) => {
  try {
    const data = await c.req.json();
    
    const request = {
      id: data.id || `br-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: data.category, // "Client Entertainment" | "Travel" | "Marketing" | "Other"
      amount: data.amount,
      currency: data.currency || "PHP",
      purpose: data.purpose,
      justification: data.justification || "",
      customer_id: data.customer_id || null,
      customer_name: data.customer_name || null,
      requested_by: data.requested_by, // User ID
      requested_by_name: data.requested_by_name, // User name
      status: "Pending", // "Pending" | "Approved" | "Rejected"
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments: data.attachments || [],
      notes: data.notes || "",
    };
    
    await kv.set(`budget_request:${request.id}`, request);
    console.log(`✅ Created budget request: ${request.id} - ${request.purpose}`);
    
    return c.json({ success: true, data: request });
  } catch (error) {
    console.error("Error creating budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Approve budget request
app.post("/make-server-c142e950/budget-requests/:id/approve", async (c) => {
  try {
    const id = c.req.param("id");
    const { approved_by, approved_by_name } = await c.req.json();
    
    const request = await kv.get(`budget_request:${id}`);
    if (!request) {
      return c.json({ success: false, error: "Budget request not found" }, 404);
    }
    
    const updatedRequest = {
      ...request,
      status: "Approved",
      approved_by,
      approved_by_name,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`budget_request:${id}`, updatedRequest);
    console.log(`✅ Approved budget request: ${id}`);
    
    return c.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error("Error approving budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reject budget request
app.post("/make-server-c142e950/budget-requests/:id/reject", async (c) => {
  try {
    const id = c.req.param("id");
    const { rejected_by, rejected_by_name, rejection_reason } = await c.req.json();
    
    const request = await kv.get(`budget_request:${id}`);
    if (!request) {
      return c.json({ success: false, error: "Budget request not found" }, 404);
    }
    
    const updatedRequest = {
      ...request,
      status: "Rejected",
      approved_by: rejected_by,
      approved_by_name: rejected_by_name,
      approved_at: new Date().toISOString(),
      rejection_reason,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`budget_request:${id}`, updatedRequest);
    console.log(`✅ Rejected budget request: ${id}`);
    
    return c.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error("Error rejecting budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete budget request
app.delete("/make-server-c142e950/budget-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`budget_request:${id}`);
    console.log(`✅ Deleted budget request: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});
```

---

### **PHASE 3: Frontend Component Updates** (Connect to Backend)

#### Step 3.1: Update TasksList Component
**File**: `/components/bd/TasksList.tsx`

**Current**: Uses `mockTasks` from mock data

**Update to**:
```typescript
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function TasksList() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Rest of component...
}
```

#### Step 3.2: Update ActivitiesList Component
**File**: `/components/bd/ActivitiesList.tsx`

Same pattern as TasksList - fetch from `/activities` endpoint

#### Step 3.3: Update BudgetRequestList Component
**File**: `/components/bd/BudgetRequestList.tsx`

Same pattern - fetch from `/budget-requests` endpoint

#### Step 3.4: Update AddTaskPanel Component
**File**: `/components/bd/AddTaskPanel.tsx`

Add POST request to create task:
```typescript
const handleSave = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    const result = await response.json();
    if (result.success) {
      onSave(result.data);
      onClose();
    }
  } catch (error) {
    console.error("Error creating task:", error);
  }
};
```

#### Step 3.5: Update AddActivityPanel Component
Same pattern for POST to `/activities`

#### Step 3.6: Update AddBudgetRequestPanel Component
Same pattern for POST to `/budget-requests`

---

## 🔍 Testing Checklist

### Phase 1 Testing
- [ ] Customer autocomplete shows results with correct `name` field
- [ ] Contact person autocomplete filters by customer_id correctly
- [ ] No duplicate route errors in server logs
- [ ] Customer detail page displays customer.name correctly
- [ ] All BD components use `name` instead of `company_name`

### Phase 2 Testing
- [ ] Can create new task via API
- [ ] Tasks list fetches from backend
- [ ] Can update task status
- [ ] Can delete task
- [ ] Same for Activities (create, read, update, delete)
- [ ] Same for Budget Requests (create, approve, reject, delete)

### Phase 3 Testing
- [ ] Tasks tab in Customer Detail shows backend tasks
- [ ] Activities tab shows backend activities
- [ ] Budget Requests tab shows backend data
- [ ] Creating new task from UI saves to backend
- [ ] Creating new activity from UI saves to backend
- [ ] Submitting budget request saves to backend

---

## 📊 Migration Strategy

### Data Migration (If Needed)
If you have existing customers with `company_name` field in the KV store:

```typescript
// One-time migration endpoint
app.post("/make-server-c142e950/customers/migrate-company-name", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    let migratedCount = 0;
    
    for (const customer of customers) {
      if (customer.company_name && !customer.name) {
        // Migrate company_name to name
        const updated = {
          ...customer,
          name: customer.company_name,
          // Optionally keep company_name for backward compatibility
        };
        
        await kv.set(`customer:${customer.id}`, updated);
        migratedCount++;
      }
    }
    
    return c.json({ 
      success: true, 
      message: `Migrated ${migratedCount} customers` 
    });
  } catch (error) {
    console.error("Migration error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});
```

---

## 🎯 Priority Order

1. **CRITICAL (Do First)**:
   - Remove duplicate routes
   - Fix CompanyAutocomplete field
   - Fix ContactPersonAutocomplete filtering
   
2. **HIGH (Do Next)**:
   - Update all components to use `name`
   - Implement Tasks API
   - Implement Activities API
   
3. **MEDIUM (After Core Works)**:
   - Implement Budget Requests API
   - Connect all frontend components to backend
   
4. **LOW (Polish)**:
   - Data migration (if needed)
   - Additional filtering/sorting features

---

## ⚠️ Known Issues & Notes

1. **Backward Compatibility**: Keep `customer.name || customer.company_name` in a few key places during transition
2. **Contact Person**: Backend supports both `customer_id` and fallback to `company` matching - we're using the better `customer_id` approach
3. **Quotations vs Inquiries**: The current system uses "quotations" for both inquiries and priced quotations, distinguished by status. This is OK but may need clarification in documentation.

---

## 📝 Summary

**Total Issues**: 4 critical categories
**Total Files to Update**: ~15-20 files
**New Backend Routes**: ~18 new routes (Tasks, Activities, Budget Requests)
**Estimated Time**: 
- Phase 1 (Critical): 2-3 hours
- Phase 2 (APIs): 4-5 hours  
- Phase 3 (Frontend): 3-4 hours
- **Total**: ~10-12 hours of focused work
