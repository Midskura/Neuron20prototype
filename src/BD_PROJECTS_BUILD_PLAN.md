# BD Projects Module - Complete Build Plan

## 📋 Overview
Build a comprehensive Projects submodule in BD that follows the **Operations service workstation pattern** with proper relay race workflow integration.

---

## 🎯 Goals

1. **Complete the Relay Race**: Add formal BD → Operations handover mechanism
2. **Full Project Details**: Display ALL project information Operations needs
3. **Consistent Architecture**: Match Operations module structure (List → Detail with sub-tabs)
4. **Service Specifications**: Show detailed service metadata from quotations
5. **Pricing Visibility**: Display charge categories and financial summary
6. **Handover Workflow**: Formal handover process with status tracking

---

## 🏗️ Architecture Pattern (Matching Operations)

### Current Operations Pattern:
```
Operations.tsx (Router)
  └─ ForwardingBookings.tsx (List View)
       └─ ForwardingBookingDetails.tsx (Detail View)
            ├─ Tab: Booking Information (Service-specific fields)
            ├─ Tab: Billings
            └─ Tab: Expenses
```

### New BD Projects Pattern:
```
BusinessDevelopment.tsx (Router - already exists)
  └─ bd/ProjectsList.tsx (List View) ✅ EXISTS - needs enhancement
       └─ bd/ProjectDetail.tsx (Detail View) ❌ NEEDS COMPLETE REBUILD
            ├─ Tab: Project Overview (General info, shipment details)
            ├─ Tab: Service Specifications (Detailed service specs by type)
            ├─ Tab: Pricing Breakdown (Charge categories, financial summary)
            └─ Tab: Handover (Handover checklist, status, actions)
```

---

## 📦 File Structure

### New/Modified Files:

```
/components/bd/
  ├─ ProjectsList.tsx ✅ EXISTS - Add handover status filter
  ├─ ProjectDetail.tsx ❌ REBUILD - New tabbed layout
  ├─ ProjectOverviewTab.tsx ✨ NEW - General & shipment info
  ├─ ServiceSpecificationsTab.tsx ✨ NEW - Detailed service specs
  ├─ PricingBreakdownTab.tsx ✨ NEW - Charge categories & financials
  ├─ HandoverTab.tsx ✨ NEW - Handover workflow & checklist
  └─ HandoverProjectModal.tsx ✨ NEW - Formal handover modal

/components/bd/service-displays/ (Reusable components)
  ├─ ForwardingSpecsDisplay.tsx ✨ NEW
  ├─ BrokerageSpecsDisplay.tsx ✨ NEW
  ├─ TruckingSpecsDisplay.tsx ✨ NEW
  ├─ MarineInsuranceSpecsDisplay.tsx ✨ NEW
  └─ OthersSpecsDisplay.tsx ✨ NEW

/types/pricing.ts
  └─ Update Project type with handover fields ⚡ UPDATE
```

---

## 🔧 Component Breakdown

### 1. **ProjectsList.tsx** (Enhancement)

**Changes:**
- Add "Handover Status" filter: `All | Ready to Handover | Handed Over | Pending Info`
- Add "Handover Status" column in table
- Update status pills with handover states
- Keep existing seed data button and empty states

**Handover Status Logic:**
```typescript
type HandoverStatus = 
  | "Incomplete"     // Missing PO/dates/required fields
  | "Ready"          // All required fields filled, not handed over yet
  | "Handed Over"    // Formally handed over to Operations
  | "In Progress"    // Operations has started booking creation
```

---

### 2. **ProjectDetail.tsx** (Complete Rebuild)

**New Structure - Following Operations Pattern:**

```tsx
export function ProjectDetail({ project, onBack, onUpdate, currentUser }) {
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Similar to ForwardingBookingDetails */}
      <div className="border-b border-[#12332B]/10" style={{ padding: "32px 48px" }}>
        <button onClick={onBack}>← Back to Projects</button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1>{project.project_number}</h1>
            <span>Status Pill + Handover Status</span>
          </div>
          
          <div>
            <HandoverButton /> {/* Conditional based on status */}
            <ActionMenu />
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-6 mt-6">
          <TabButton active={activeTab === "overview"}>Project Overview</TabButton>
          <TabButton active={activeTab === "services"}>Service Specifications</TabButton>
          <TabButton active={activeTab === "pricing"}>Pricing Breakdown</TabButton>
          <TabButton active={activeTab === "handover"}>Handover</TabButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "overview" && <ProjectOverviewTab project={project} />}
        {activeTab === "services" && <ServiceSpecificationsTab project={project} />}
        {activeTab === "pricing" && <PricingBreakdownTab project={project} />}
        {activeTab === "handover" && <HandoverTab project={project} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}
```

---

### 3. **ProjectOverviewTab.tsx** (NEW)

**Sections:**

#### A. General Information
- Customer Name, Contact Person
- BD Owner, Operations Assigned
- Project Number, Quotation Reference
- Created Date, Last Updated

#### B. Shipment Details
- Movement (Import/Export)
- Category (Sea/Air/Land Freight)
- Shipment Type (FCL/LCL/Consolidation)
- Route: POL/AOL → POD/AOD
- Carrier, Transit Days
- Incoterm

#### C. Cargo Details
- Commodity
- Volume (CBM, Containers, Packages)
- Gross Weight, Chargeable Weight
- Dimensions
- **Stackability** ✨ NEW
- Cargo Type (General/Perishable/Hazardous/Fragile/High Value)

#### D. Project Timeline
- Client PO Number, PO Date
- Shipment Ready Date
- Requested ETD, Actual ETD
- ETA, Actual Delivery Date
- Collection Address

#### E. Special Instructions
- Full-width textarea showing project.special_instructions

---

### 4. **ServiceSpecificationsTab.tsx** (NEW)

**Purpose:** Display detailed `services_metadata` from quotation

**Structure:**
```tsx
export function ServiceSpecificationsTab({ project }) {
  const servicesMetadata = project.services_metadata || [];
  
  return (
    <div style={{ padding: "32px 48px" }}>
      <div className="max-w-5xl">
        <h3>📋 Service Specifications</h3>
        <p className="text-sm text-gray-600 mb-6">
          Detailed specifications inherited from Quotation {project.quotation_number}
        </p>

        {servicesMetadata.map((service, idx) => (
          <ServiceSpecCard key={idx} service={service} />
        ))}

        {servicesMetadata.length === 0 && (
          <EmptyState message="No detailed service specifications available" />
        )}
      </div>
    </div>
  );
}

function ServiceSpecCard({ service }) {
  switch (service.service_type) {
    case "Forwarding":
      return <ForwardingSpecsDisplay details={service.service_details} />;
    case "Brokerage":
      return <BrokerageSpecsDisplay details={service.service_details} />;
    case "Trucking":
      return <TruckingSpecsDisplay details={service.service_details} />;
    case "Marine Insurance":
      return <MarineInsuranceSpecsDisplay details={service.service_details} />;
    case "Others":
      return <OthersSpecsDisplay details={service.service_details} />;
  }
}
```

---

### 5. **Service Display Components** (NEW)

Each displays service-specific fields in a card format:

#### **ForwardingSpecsDisplay.tsx**
```tsx
export function ForwardingSpecsDisplay({ details }: { details: ForwardingDetails }) {
  return (
    <div className="border rounded-lg p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Ship className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B]">Forwarding Service</h4>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Field label="Incoterms" value={details.incoterms} />
        <Field label="Cargo Type" value={details.cargo_type} />
        <Field label="Commodity" value={details.commodity} />
        <Field label="Mode" value={details.mode} />
        <Field label="POL" value={details.pol} />
        <Field label="POD" value={details.pod} />
        {details.aol && <Field label="AOL" value={details.aol} />}
        {details.aod && <Field label="AOD" value={details.aod} />}
        <Field label="Delivery Address" value={details.delivery_address} className="col-span-3" />
      </div>
    </div>
  );
}
```

#### **BrokerageSpecsDisplay.tsx** (Expanded per MD spec)
```tsx
export function BrokerageSpecsDisplay({ details }: { details: BrokerageDetails }) {
  return (
    <div className="border rounded-lg p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B]">Brokerage Service</h4>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Core Fields */}
        <Field label="Subtype" value={details.subtype} />
        <Field label="Shipment Type" value={details.shipment_type} />
        <Field label="Type of Entry" value={details.type_of_entry} />
        <Field label="POD" value={details.pod} />
        <Field label="Mode" value={details.mode} />
        <Field label="Cargo Type" value={details.cargo_type} />
        
        {/* Cargo Details */}
        <Field label="Commodity" value={details.commodity} />
        <Field label="Declared Value" value={details.declared_value} type="currency" />
        <Field label="Country of Origin" value={details.country_of_origin} />
        
        {/* Expanded MD Fields ✨ */}
        <Field label="Preferential Treatment" value={details.preferential_treatment} />
        <Field label="PSIC" value={details.psic} />
        <Field label="AEO" value={details.aeo} />
        
        <Field label="Delivery Address" value={details.delivery_address} className="col-span-3" />
      </div>
    </div>
  );
}
```

#### **TruckingSpecsDisplay.tsx**
```tsx
export function TruckingSpecsDisplay({ details }: { details: TruckingDetails }) {
  return (
    <div className="border rounded-lg p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B]">Trucking Service</h4>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Field label="Truck Type" value={details.truck_type} />
        <Field label="Pull Out Location" value={details.pull_out} />
        <Field label="Delivery Address" value={details.delivery_address} className="col-span-2" />
        <Field label="Delivery Instructions" value={details.delivery_instructions} className="col-span-2" />
      </div>
    </div>
  );
}
```

#### **MarineInsuranceSpecsDisplay.tsx**
```tsx
export function MarineInsuranceSpecsDisplay({ details }: { details: MarineInsuranceDetails }) {
  return (
    <div className="border rounded-lg p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B]">Marine Insurance</h4>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Field label="Commodity" value={details.commodity_description} />
        <Field label="HS Code" value={details.hs_code} />
        <Field label="Invoice Value" value={details.invoice_value} type="currency" />
        <Field label="POL" value={details.pol} />
        <Field label="POD" value={details.pod} />
        {details.aol && <Field label="AOL" value={details.aol} />}
        {details.aod && <Field label="AOD" value={details.aod} />}
      </div>
    </div>
  );
}
```

#### **OthersSpecsDisplay.tsx**
```tsx
export function OthersSpecsDisplay({ details }: { details: OthersDetails }) {
  return (
    <div className="border rounded-lg p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B]">Other Service</h4>
      </div>

      <Field label="Service Description" value={details.service_description} />
    </div>
  );
}
```

---

### 6. **PricingBreakdownTab.tsx** (NEW)

**Purpose:** Display `charge_categories` and `financial_summary` from quotation

```tsx
export function PricingBreakdownTab({ project }) {
  const chargeCategories = project.charge_categories || [];
  const currency = project.currency || "PHP";
  const total = project.total || 0;

  return (
    <div style={{ padding: "32px 48px" }}>
      <div className="max-w-5xl">
        <h3>💰 Pricing Breakdown</h3>
        <p className="text-sm text-gray-600 mb-6">
          Pricing details from Quotation {project.quotation_number}
        </p>

        {/* Charge Categories */}
        {chargeCategories.map((category, idx) => (
          <ChargeCategoryCard key={idx} category={category} currency={currency} />
        ))}

        {/* Financial Summary */}
        <div className="mt-8 bg-[#12332B]/5 rounded-lg p-6">
          <h4 className="text-[#12332B] mb-4">Financial Summary</h4>
          <div className="space-y-2">
            <SummaryRow label="Subtotal (Non-Taxed)" value={total} currency={currency} />
            <SummaryRow label="Subtotal (Taxed)" value={0} currency={currency} />
            <SummaryRow label="VAT (12%)" value={0} currency={currency} />
            <div className="border-t pt-2 mt-2">
              <SummaryRow label="Grand Total" value={total} currency={currency} bold />
            </div>
          </div>
        </div>

        {chargeCategories.length === 0 && (
          <EmptyState message="No pricing breakdown available" />
        )}
      </div>
    </div>
  );
}

function ChargeCategoryCard({ category, currency }) {
  return (
    <div className="border rounded-lg p-6 mb-4">
      <h4 className="text-[#12332B] mb-4">{category.category_name}</h4>
      <table className="w-full">
        <thead className="border-b">
          <tr>
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Unit Price</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {category.line_items.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="text-right">{item.quantity} {item.unit}</td>
              <td className="text-right">{currency} {item.price.toLocaleString()}</td>
              <td className="text-right">{currency} {item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold">
            <td colSpan={3} className="text-right py-2">Subtotal:</td>
            <td className="text-right">{currency} {category.subtotal.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
```

---

### 7. **HandoverTab.tsx** (NEW)

**Purpose:** Handover workflow and status tracking

```tsx
export function HandoverTab({ project, onUpdate, currentUser }) {
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  
  const handoverStatus = calculateHandoverStatus(project);
  const isReadyToHandover = handoverStatus === "Ready";
  const isHandedOver = project.handover_status === "Handed Over";

  return (
    <div style={{ padding: "32px 48px" }}>
      <div className="max-w-4xl">
        {/* Handover Status Card */}
        <div className={`border rounded-lg p-6 mb-6 ${
          isHandedOver ? 'bg-emerald-50 border-emerald-300' :
          isReadyToHandover ? 'bg-blue-50 border-blue-300' :
          'bg-amber-50 border-amber-300'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isHandedOver ? '✅ Handed Over to Operations' :
                 isReadyToHandover ? '🟦 Ready for Handover' :
                 '⚠️ Incomplete Information'}
              </h3>
              <p className="text-sm">
                {isHandedOver 
                  ? `Handed over to ${project.ops_assigned_user_name} on ${new Date(project.handover_timestamp).toLocaleDateString()}`
                  : isReadyToHandover
                  ? 'All required information is complete. Ready to hand over to Operations.'
                  : 'Please complete all required fields before handing over to Operations.'}
              </p>
            </div>
            
            {!isHandedOver && isReadyToHandover && (
              <button
                onClick={() => setShowHandoverModal(true)}
                className="px-6 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#0F766E]/90"
              >
                Hand Over to Operations
              </button>
            )}
          </div>
        </div>

        {/* Readiness Checklist */}
        <div className="border rounded-lg p-6 mb-6">
          <h4 className="text-[#12332B] mb-4">📋 Handover Readiness Checklist</h4>
          <div className="space-y-3">
            <ChecklistItem
              label="Client PO Number provided"
              completed={!!project.client_po_number}
            />
            <ChecklistItem
              label="Shipment Ready Date confirmed"
              completed={!!project.shipment_ready_date}
            />
            <ChecklistItem
              label="Requested ETD specified"
              completed={!!project.requested_etd}
            />
            <ChecklistItem
              label="Operations team member assigned"
              completed={!!project.ops_assigned_user_id}
            />
            <ChecklistItem
              label="Service specifications available"
              completed={project.services_metadata && project.services_metadata.length > 0}
            />
            <ChecklistItem
              label="Pricing breakdown available"
              completed={project.charge_categories && project.charge_categories.length > 0}
            />
          </div>
        </div>

        {/* Handover History */}
        {isHandedOver && (
          <div className="border rounded-lg p-6">
            <h4 className="text-[#12332B] mb-4">📜 Handover History</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Handed over by:</span>
                <span className="font-medium">{project.handover_by_user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Handed over to:</span>
                <span className="font-medium">{project.ops_assigned_user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Handover date:</span>
                <span className="font-medium">
                  {new Date(project.handover_timestamp).toLocaleString()}
                </span>
              </div>
              {project.handover_notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <span className="text-gray-600 text-xs">Handover Notes:</span>
                  <p className="mt-1">{project.handover_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linked Bookings */}
        {isHandedOver && project.linkedBookings && project.linkedBookings.length > 0 && (
          <div className="border rounded-lg p-6 mt-6">
            <h4 className="text-[#12332B] mb-4">🔗 Linked Service Bookings</h4>
            <div className="space-y-2">
              {project.linkedBookings.map((booking, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{booking.bookingNumber}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({booking.serviceType})
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Handover Modal */}
      {showHandoverModal && (
        <HandoverProjectModal
          project={project}
          onClose={() => setShowHandoverModal(false)}
          onSuccess={() => {
            setShowHandoverModal(false);
            onUpdate();
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

function ChecklistItem({ label, completed }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        completed ? 'bg-emerald-500' : 'bg-gray-300'
      }`}>
        {completed && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={completed ? 'text-[#12332B]' : 'text-gray-500'}>
        {label}
      </span>
    </div>
  );
}

function calculateHandoverStatus(project) {
  const hasRequiredFields = 
    project.client_po_number &&
    project.shipment_ready_date &&
    project.requested_etd &&
    project.ops_assigned_user_id;
  
  const hasServiceSpecs = project.services_metadata && project.services_metadata.length > 0;
  const hasPricing = project.charge_categories && project.charge_categories.length > 0;
  
  if (project.handover_status === "Handed Over") return "Handed Over";
  if (hasRequiredFields && hasServiceSpecs && hasPricing) return "Ready";
  return "Incomplete";
}
```

---

### 8. **HandoverProjectModal.tsx** (NEW)

**Purpose:** Formal handover confirmation modal

```tsx
export function HandoverProjectModal({ project, onClose, onSuccess, currentUser }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handoverNotes, setHandoverNotes] = useState("");

  const handleHandover = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/projects/${project.id}/handover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          handover_by_user_id: currentUser?.id,
          handover_by_user_name: currentUser?.name,
          handover_notes: handoverNotes,
          handover_timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project successfully handed over to Operations!");
        onSuccess();
      } else {
        toast.error("Error handing over project: " + result.error);
      }
    } catch (error) {
      console.error('Error handing over project:', error);
      toast.error("Failed to hand over project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl text-[#12332B] mb-1">Hand Over Project to Operations</h2>
              <p className="text-sm text-gray-600">
                Project: {project.project_number}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Summary */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">Project Summary</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Customer:</span>
                <span className="ml-2 text-gray-900">{project.customer_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Route:</span>
                <span className="ml-2 text-gray-900">
                  {project.pol_aol} → {project.pod_aod}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Services:</span>
                <span className="ml-2 text-gray-900">{project.services?.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-600">Assigned to:</span>
                <span className="ml-2 text-gray-900">{project.ops_assigned_user_name}</span>
              </div>
            </div>
          </div>

          {/* Handover Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Handover Notes (Optional)
            </label>
            <textarea
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Any special instructions or important information for Operations..."
            />
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✓ All required information is complete<br />
              ✓ {project.ops_assigned_user_name} will be notified<br />
              ✓ Project will be available in Operations module
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border rounded-lg hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleHandover}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#0F766E" }}
          >
            {isSubmitting ? "Handing Over..." : "Confirm Handover"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Backend Updates

### 1. Update Project Type (`/types/pricing.ts`)

```typescript
export interface Project {
  // ... existing fields ...
  
  // NEW Handover Fields
  handover_status: "Incomplete" | "Ready" | "Handed Over" | "In Progress";
  handover_timestamp?: string;
  handover_by_user_id?: string;
  handover_by_user_name?: string;
  handover_notes?: string;
  
  // NEW Missing Fields
  stackability?: "Stackable" | "Non-Stackable" | "Fragile";
  preferential_treatment?: string;
  volume_cbm?: number;
  volume_containers?: number;
  volume_packages?: number;
}
```

### 2. New Backend Endpoint (`/supabase/functions/server/index.tsx`)

```typescript
// POST /projects/:id/handover - Hand over project to Operations
app.post("/make-server-c142e950/projects/:id/handover", async (c) => {
  try {
    const id = c.req.param("id");
    const handoverData = await c.req.json();
    
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    // Update project with handover information
    project.handover_status = "Handed Over";
    project.handover_timestamp = handoverData.handover_timestamp;
    project.handover_by_user_id = handoverData.handover_by_user_id;
    project.handover_by_user_name = handoverData.handover_by_user_name;
    project.handover_notes = handoverData.handover_notes;
    project.updated_at = new Date().toISOString();
    
    await kv.set(`project:${id}`, project);
    
    // TODO: Send notification to Operations team member
    
    console.log(`Project ${project.project_number} handed over to ${project.ops_assigned_user_name}`);
    
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error("Error handing over project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});
```

### 3. Update Seed Data

Fix seed data to use proper structure with `services_metadata` and `charge_categories`.

---

## 📊 Implementation Priority

### Phase 1: Core Structure (2-3 hours)
1. ✅ Update Project type with handover fields
2. ✅ Rebuild ProjectDetail.tsx with tabbed layout
3. ✅ Create ProjectOverviewTab.tsx
4. ✅ Add handover backend endpoint

### Phase 2: Service Specifications (2-3 hours)
5. ✅ Create ServiceSpecificationsTab.tsx
6. ✅ Build all 5 service display components
7. ✅ Test with real quotation data

### Phase 3: Pricing & Handover (2-3 hours)
8. ✅ Create PricingBreakdownTab.tsx
9. ✅ Create HandoverTab.tsx
10. ✅ Create HandoverProjectModal.tsx

### Phase 4: List Enhancements (1-2 hours)
11. ✅ Update ProjectsList with handover status filter
12. ✅ Add handover status column
13. ✅ Update empty states

### Phase 5: Polish & Testing (1-2 hours)
14. ✅ Fix seed data structure
15. ✅ Add missing fields (stackability, etc.)
16. ✅ Test full workflow: Create → Fill → Handover
17. ✅ Test Operations visibility

**Total Estimated Time: 8-13 hours**

---

## ✅ Success Criteria

- [ ] Projects show ALL information Operations needs
- [ ] Formal handover workflow with confirmation
- [ ] Handover status tracking (Incomplete/Ready/Handed Over)
- [ ] Service specifications displayed by type
- [ ] Pricing breakdown visible
- [ ] Seed data uses correct structure
- [ ] Consistent with Operations module design
- [ ] Missing fields added (stackability, preferential treatment, volumes)
- [ ] Full relay race completed: BD → PD → BD → **BD → Ops** → Execution

---

## 🎯 Key Design Principles

1. **Follow Operations Pattern**: Same structure (List → Detail with tabs)
2. **Neuron Design System**: Deep green (#12332B), teal (#0F766E), pure white, stroke borders
3. **Consistent Padding**: 32px 48px throughout
4. **Information Completeness**: Show EVERYTHING from quotation
5. **Clear Workflow**: Visual feedback on handover readiness
6. **Relay Race Pattern**: Formal handover = passing the baton

---

Ready to build! 🚀
