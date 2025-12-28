# 🔄 Complete Data Flow Diagram

## 📊 **End-to-End Flow: Quotation → Project → Booking**

```
┌─────────────────────────────────────────────────────────────────┐
│                    BD MODULE (Business Development)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Create Quote   │
                    │  QTE-2025-001   │
                    └─────────────────┘
                              │
                    Services: [Forwarding]
                    Mode: FCL
                    AOL/POL: Manila, Philippines
                    AOD/POD: Los Angeles, USA
                    Commodity: Electronic Components
                    Cargo Type: General Cargo
                    Delivery Address: 123 Main St
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRICING MODULE                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Add Pricing   │
                    └─────────────────┘
                              │
                    Charge Categories:
                    [
                      {
                        category: "Ocean Freight",
                        selling_price: 1500,
                        buying_price: 1200,
                        items: [...]
                      }
                    ]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BD APPROVAL                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Convert to      │
                    │ Project         │
                    └─────────────────┘
                              │
                    POST /projects
                    {
                      quotation_id: "...",
                      client_po_number: "PO-2025-001",
                      shipment_ready_date: "2025-01-15",
                      requested_etd: "2025-01-20"
                    }
                              │
                              ▼
                    ┌─────────────────┐
                    │  Project        │
                    │  PROJ-2025-001  │
                    │  Status: Active │
                    └─────────────────┘
                              │
            STORED IN DATABASE (KV Store):
            Key: project:PROJ-2025-001
            Value: {
              id: "project-xxx",
              project_number: "PROJ-2025-001",
              quotation_number: "QTE-2025-001",
              customer_name: "ABC Corp",
              status: "Active",
              services_metadata: {
                forwarding: {
                  mode: "FCL",
                  incoterm: "FOB",
                  container_type: "40ft",
                  ...
                }
              },
              charge_categories: [...],
              commodity_description: "Electronic Components",
              delivery_address: "123 Main St",
              aol_pol: "Manila, Philippines",
              aod_pod: "Los Angeles, USA",
              cargo_type: "General Cargo",
              mode: "FCL",
              linkedBookings: []  ← Empty initially
            }
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPERATIONS MODULE                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Forwarding     │
                    │  + New Booking  │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PROJECT AUTOFILL SECTION                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📎 Project Reference (Optional)                        │    │
│  │  ┌──────────────────────┐  ┌──────────┐               │    │
│  │  │ PROJ-2025-001        │  │ Autofill │               │    │
│  │  └──────────────────────┘  └──────────┘               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                        User clicks "Autofill"
                              │
                              ▼
                    ┌─────────────────┐
                    │  FRONTEND       │
                    │  Lookup Project │
                    └─────────────────┘
                              │
            GET /projects/by-number/PROJ-2025-001
                              │
                              ▼
                    ┌─────────────────┐
                    │  BACKEND API    │
                    │  Find Project   │
                    └─────────────────┘
                              │
            Search KV Store for project:*
            Filter by project_number
                              │
                              ▼
                    ┌─────────────────┐
                    │  Return Project │
                    │  Data           │
                    └─────────────────┘
                              │
            { success: true, data: {...} }
                              │
                              ▼
                    ┌─────────────────┐
                    │  FRONTEND       │
                    │  Autofill Logic │
                    └─────────────────┘
                              │
            autofillForwardingFromProject(project)
                              │
            Extracts:
            - customerName ← project.customer_name
            - quotationReferenceNumber ← project.quotation_number
            - commodityDescription ← project.commodity_description
            - deliveryAddress ← project.delivery_address
            - aolPol ← project.aol_pol
            - aodPod ← project.aod_pod
            - cargoType ← project.cargo_type
            - mode ← project.mode
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              FORM FIELDS AUTO-POPULATED                          │
│                                                                  │
│  Customer Name: ABC Corp                          ✅            │
│  Quotation Reference: QTE-2025-001                ✅            │
│  Mode: FCL                                        ✅            │
│  Cargo Type: General Cargo                       ✅            │
│  Delivery Address: 123 Main St                   ✅            │
│  AOL/POL: Manila, Philippines                     ✅            │
│  AOD/POD: Los Angeles, USA                        ✅            │
│  Commodity Description: Electronic Components     ✅            │
└─────────────────────────────────────────────────────────────────┘
                              │
                    User fills remaining fields:
                    - Services: [Freight Forwarding]
                    - Sub-services: [Door-to-Door]
                    - Expected Volume: 40ft x 2
                    - Consignee, Shipper, etc.
                              │
                              ▼
                    ┌─────────────────┐
                    │  Create Booking │
                    └─────────────────┘
                              │
            POST /forwarding-bookings
            {
              projectNumber: "PROJ-2025-001",
              customerName: "ABC Corp",
              mode: "FCL",
              services: ["Freight Forwarding"],
              qty40ft: "2",
              ...all other fields
            }
                              │
                              ▼
                    ┌─────────────────┐
                    │  BACKEND        │
                    │  Create Booking │
                    └─────────────────┘
                              │
            Generate: FWD-2025-001
            Store in KV: forwarding_booking:FWD-2025-001
                              │
                              ▼
                    ┌─────────────────┐
                    │  Link to Project│
                    └─────────────────┘
                              │
            POST /projects/{id}/link-booking
            {
              bookingNumber: "FWD-2025-001",
              bookingId: "...",
              serviceType: "Forwarding",
              status: "Draft"
            }
                              │
                              ▼
                    ┌─────────────────┐
                    │  Update Project │
                    │  linkedBookings │
                    └─────────────────┘
                              │
            project.linkedBookings.push({
              bookingNumber: "FWD-2025-001",
              bookingId: "...",
              serviceType: "Forwarding",
              status: "Draft"
            })
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINAL STATE                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PROJECT (PROJ-2025-001):                                       │
│  {                                                               │
│    status: "Active",                                            │
│    linkedBookings: [                                            │
│      {                                                           │
│        bookingNumber: "FWD-2025-001",                           │
│        serviceType: "Forwarding",                               │
│        status: "Draft"                     ← Bidirectional!     │
│      }                                                           │
│    ]                                                             │
│  }                                                               │
│                                                                  │
│  BOOKING (FWD-2025-001):                                        │
│  {                                                               │
│    bookingNumber: "FWD-2025-001",                               │
│    projectNumber: "PROJ-2025-001",         ← Bidirectional!     │
│    customerName: "ABC Corp",                                    │
│    mode: "FCL",                                                 │
│    services: ["Freight Forwarding"],                            │
│    qty40ft: "2",                                                │
│    status: "Draft",                                             │
│    ...all other fields                                          │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 **Key Components in Action**

### **1. ProjectAutofillSection Component**
```tsx
Location: /components/operations/shared/ProjectAutofillSection.tsx

Props:
- projectNumber: string
- onProjectNumberChange: (num: string) => void
- onAutofill: (project: Project) => void
- serviceType: "Forwarding" | "Brokerage" | ...

Responsibilities:
✓ Input field for project number
✓ Autofill button with loading state
✓ Fetch project from API
✓ Validate project status
✓ Validate service type match
✓ Call onAutofill callback with project data
✓ Show success/error messages
```

### **2. ServicesMultiSelect Component**
```tsx
Location: /components/operations/shared/ServicesMultiSelect.tsx

Props:
- label: string
- selectedServices: string[]
- onServicesChange: (services: string[]) => void
- availableServices: string[]
- placeholder: string
- required: boolean

Features:
✓ Multi-select dropdown
✓ Pill-style selected items
✓ Remove individual selections
✓ Click-outside-to-close
✓ Checkmarks for selected items
```

### **3. Autofill Utility Functions**
```typescript
Location: /utils/projectAutofill.ts

Functions:
1. fetchProjectByNumber(projectNumber, projectId, publicAnonKey)
   → Returns: { success: boolean, data: Project | null, error?: string }

2. autofillForwardingFromProject(project)
   → Returns: Partial<ForwardingBooking> with extracted fields

3. linkBookingToProject(projectId, bookingId, bookingNumber, ...)
   → Creates bidirectional link

Usage in CreateForwardingBookingPanel:
1. User enters project number
2. handleProjectAutofill() calls fetchProjectByNumber()
3. Calls autofillForwardingFromProject() to extract data
4. Sets form state with extracted values
5. On booking creation, calls linkBookingToProject()
```

---

## 🗄️ **Database Structure**

### **KV Store Keys:**

```
quotation:QTE-2025-001 → Quotation data
project:PROJ-2025-001 → Project data
forwarding_booking:FWD-2025-001 → Booking data

project_counter:2025 → Auto-increment counter
forwarding_counter:2025 → Auto-increment counter
```

### **Project Schema:**
```typescript
{
  id: string,                    // "project-xxx"
  project_number: string,        // "PROJ-2025-001"
  quotation_number: string,      // "QTE-2025-001"
  quotation_id: string,
  customer_name: string,
  status: "Active" | "Completed",
  
  // Service metadata (preserved from quotation)
  services_metadata: {
    forwarding?: { mode, incoterm, ... },
    brokerage?: { ... },
    trucking?: { ... },
    marine_insurance?: { ... },
    others?: { ... }
  },
  
  // Shipment details
  commodity_description?: string,
  delivery_address?: string,
  aol_pol?: string,
  aod_pod?: string,
  cargo_type?: string,
  mode?: string,
  
  // Billing
  charge_categories?: BillingChargeCategory[],
  
  // Linked bookings (bidirectional)
  linkedBookings: [
    {
      bookingId: string,
      bookingNumber: string,
      serviceType: "Forwarding" | ...,
      status: ExecutionStatus
    }
  ],
  
  created_at: string,
  updated_at: string
}
```

### **Forwarding Booking Schema:**
```typescript
{
  bookingId: string,             // "forwarding-xxx"
  bookingNumber: string,         // "FWD-2025-001"
  projectNumber?: string,        // "PROJ-2025-001" ← Link to project
  
  // General info
  customerName: string,
  accountOwner: string,
  services: string[],            // NEW!
  subServices: string[],         // NEW!
  mode: "FCL" | "LCL" | "AIR",
  cargoType: string,
  stackability?: string,         // NEW!
  
  // Expected Volume (NEW!)
  qty20ft?: string,
  qty40ft?: string,
  qty45ft?: string,
  volumeGrossWeight?: string,
  volumeDimensions?: string,
  volumeChargeableWeight?: string,
  
  // Shipment info
  consignee: string,
  shipper: string,
  mblMawb: string,
  commodityDescription: string,
  preferentialTreatment: string, // NEW!
  aolPol: string,
  aodPod: string,
  
  // ... all other fields
  
  status: ExecutionStatus,
  created_at: string,
  updated_at: string
}
```

---

## 🎯 **API Endpoints Used**

### **1. Project Lookup**
```
GET /projects/by-number/:projectNumber

Response:
{
  success: true,
  data: {
    id: "project-xxx",
    project_number: "PROJ-2025-001",
    status: "Active",
    ...all project fields
  }
}
```

### **2. Create Forwarding Booking**
```
POST /forwarding-bookings

Body:
{
  projectNumber: "PROJ-2025-001",  ← Optional
  customerName: "ABC Corp",
  mode: "FCL",
  services: ["Freight Forwarding"],
  qty40ft: "2",
  ...
}

Response:
{
  success: true,
  data: {
    bookingId: "forwarding-xxx",
    bookingNumber: "FWD-2025-001",
    ...
  }
}
```

### **3. Link Booking to Project**
```
POST /projects/:id/link-booking

Body:
{
  bookingId: "forwarding-xxx",
  bookingNumber: "FWD-2025-001",
  serviceType: "Forwarding",
  status: "Draft"
}

Response:
{
  success: true,
  message: "Booking linked to project"
}
```

---

## 📈 **State Management Flow**

```typescript
// In CreateForwardingBookingPanel.tsx

// 1. State variables
const [projectNumber, setProjectNumber] = useState("");
const [fetchedProject, setFetchedProject] = useState<Project | null>(null);
const [customerName, setCustomerName] = useState("");
const [services, setServices] = useState<string[]>([]);
// ... etc

// 2. Autofill handler
const handleProjectAutofill = (project: Project) => {
  setFetchedProject(project);  // Store project for later linking
  
  const autofilled = autofillForwardingFromProject(project);
  
  setCustomerName(autofilled.customerName || "");
  setQuotationReferenceNumber(autofilled.quotationReferenceNumber || "");
  // ... set all other fields
  
  toast.success(`Autofilled from project ${project.project_number}`);
};

// 3. Submit handler
const handleSubmit = async () => {
  // Create booking
  const response = await fetch('/forwarding-bookings', { ... });
  const result = await response.json();
  
  // Link to project if exists
  if (fetchedProject && projectNumber) {
    await linkBookingToProject(
      fetchedProject.id,
      result.data.bookingId,
      result.data.bookingNumber,
      "Forwarding",
      result.data.status,
      projectId,
      publicAnonKey
    );
  }
};
```

---

## ✨ **Magic Moments**

### **Moment 1: User types project number**
```
Input: "PROJ-2025-001"
       ↓
State: projectNumber = "PROJ-2025-001"
```

### **Moment 2: User clicks Autofill**
```
Click "Autofill" button
       ↓
fetchProjectByNumber("PROJ-2025-001")
       ↓
API call: GET /projects/by-number/PROJ-2025-001
       ↓
Backend searches KV store
       ↓
Project found & returned
       ↓
autofillForwardingFromProject(project)
       ↓
8+ form fields populate ✨
       ↓
Toast: "Autofilled from project PROJ-2025-001"
```

### **Moment 3: User creates booking**
```
Click "Create Booking"
       ↓
POST /forwarding-bookings (with projectNumber)
       ↓
Booking created: FWD-2025-001
       ↓
POST /projects/{id}/link-booking
       ↓
project.linkedBookings updated
       ↓
booking.projectNumber stored
       ↓
Bidirectional link complete! 🔗
```

---

**This is what you built! 🎉**
