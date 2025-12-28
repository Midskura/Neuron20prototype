# BD Projects Module - Phased Implementation Plan

## 🎯 Objective
Build a comprehensive Projects submodule in BD that displays complete project information, service specifications, pricing breakdown, and activity tracking - following the Operations module pattern (List → Detail with tabs).

---

## 📐 Architecture Overview

### Pattern (Matching Operations)
```
BusinessDevelopment.tsx (Router)
  └─ bd/ProjectsList.tsx (List View) ⚡ ENHANCE
       └─ bd/ProjectDetail.tsx (Detail View) 🔨 REBUILD
            ├─ Tab 1: Project Overview (General, Shipment, Cargo, Timeline)
            ├─ Tab 2: Service Specifications (services_metadata by type)
            ├─ Tab 3: Pricing Breakdown (charge_categories + financial)
            └─ Tab 4: Activity (Linked bookings, usage tracking)
```

### No Handover Ceremony
- **No approval gates** - Operations just creates bookings and references Project Number
- **No readiness checklists** - Just show the data
- **Track usage organically** - Show which bookings have been created from this project
- **Simple status filter** - "No Bookings Yet" | "Partially Booked" | "Fully Booked"

---

## 🗂️ File Structure

```
/components/bd/
  ├─ ProjectsList.tsx ⚡ ENHANCE - Add booking status filter
  ├─ ProjectDetail.tsx 🔨 REBUILD - New 4-tab layout
  ├─ ProjectOverviewTab.tsx ✨ NEW
  ├─ ServiceSpecificationsTab.tsx ✨ NEW
  ├─ PricingBreakdownTab.tsx ✨ NEW
  └─ ActivityTab.tsx ✨ NEW

/components/bd/service-displays/
  ├─ ForwardingSpecsDisplay.tsx ✨ NEW
  ├─ BrokerageSpecsDisplay.tsx ✨ NEW
  ├─ TruckingSpecsDisplay.tsx ✨ NEW
  ├─ MarineInsuranceSpecsDisplay.tsx ✨ NEW
  └─ OthersSpecsDisplay.tsx ✨ NEW

/types/pricing.ts
  └─ Update Project interface ⚡ UPDATE
```

---

## 📋 Type Definitions

### Update Project Interface (`/types/pricing.ts`)

```typescript
export interface Project {
  // Core Identity
  id: string;
  project_number: string;
  quotation_id: string;
  quotation_number: string;
  customer_id: string;
  customer_name: string;
  
  // Team Assignment
  bd_owner_name: string;
  bd_owner_email?: string;
  ops_assigned_user_id?: string;
  ops_assigned_user_name?: string;
  
  // Status
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  
  // Shipment Details
  movement: "Import" | "Export";
  category: "Sea Freight" | "Air Freight" | "Land Freight";
  shipment_type?: "FCL" | "LCL" | "Consolidation" | "Break Bulk";
  pol_aol?: string;
  pod_aod?: string;
  carrier?: string;
  transit_days?: number;
  incoterm?: string;
  
  // Cargo Details
  commodity?: string;
  cargo_type?: "General Cargo" | "Perishable" | "Hazardous" | "Fragile" | "High Value";
  gross_weight?: number;
  chargeable_weight?: number;
  dimensions?: string;
  
  // NEW: Missing Fields
  stackability?: "Stackable" | "Non-Stackable" | "Fragile";
  volume_cbm?: number;
  volume_containers?: string; // e.g., "2x40' HC"
  volume_packages?: number;
  
  // Timeline
  client_po_number?: string;
  client_po_date?: string;
  shipment_ready_date?: string;
  requested_etd?: string;
  actual_etd?: string;
  eta?: string;
  actual_delivery_date?: string;
  collection_address?: string;
  
  // Services
  services?: string[]; // ["Forwarding", "Brokerage", "Trucking"]
  services_metadata?: ServiceMetadata[]; // Detailed specs from quotation
  
  // Pricing
  charge_categories?: ChargeCategory[];
  currency?: string;
  total?: number;
  
  // Activity & Usage Tracking
  linkedBookings?: LinkedBooking[];
  booking_status?: "No Bookings Yet" | "Partially Booked" | "Fully Booked";
  
  // Metadata
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// NEW: Linked Booking Type
export interface LinkedBooking {
  bookingId: string;
  bookingNumber: string;
  serviceType: "Forwarding" | "Brokerage" | "Trucking" | "Marine Insurance" | "Others";
  status: string;
  createdAt: string;
  createdBy?: string;
}

// Service Metadata (from Quotation)
export interface ServiceMetadata {
  service_type: "Forwarding" | "Brokerage" | "Trucking" | "Marine Insurance" | "Others";
  service_details: 
    | ForwardingDetails 
    | BrokerageDetails 
    | TruckingDetails 
    | MarineInsuranceDetails 
    | OthersDetails;
}

// Service Detail Interfaces
export interface ForwardingDetails {
  mode: "Sea Freight" | "Air Freight";
  incoterms?: string;
  pol?: string;
  pod?: string;
  aol?: string;
  aod?: string;
  cargo_type?: string;
  commodity?: string;
  delivery_address?: string;
}

export interface BrokerageDetails {
  subtype: "Import" | "Export";
  shipment_type?: string;
  type_of_entry?: string;
  pod?: string;
  mode?: string;
  cargo_type?: string;
  commodity?: string;
  declared_value?: number;
  country_of_origin?: string;
  preferential_treatment?: string; // NEW
  psic?: string; // NEW
  aeo?: string; // NEW
  delivery_address?: string;
}

export interface TruckingDetails {
  truck_type?: string;
  pull_out?: string;
  delivery_address?: string;
  delivery_instructions?: string;
}

export interface MarineInsuranceDetails {
  commodity_description?: string;
  hs_code?: string;
  invoice_value?: number;
  pol?: string;
  pod?: string;
  aol?: string;
  aod?: string;
}

export interface OthersDetails {
  service_description?: string;
}
```

---

# 🚀 PHASE 1: Core Structure & Type Updates

**Estimated Time:** 2-3 hours

## Tasks

### 1.1 Update Type Definitions
**File:** `/types/pricing.ts`

**Actions:**
- Add `stackability`, `volume_cbm`, `volume_containers`, `volume_packages` to Project
- Add `LinkedBooking` interface
- Add `linkedBookings` and `booking_status` to Project
- Add `preferential_treatment`, `psic`, `aeo` to BrokerageDetails
- Remove any handover-related fields

### 1.2 Rebuild ProjectDetail.tsx
**File:** `/components/bd/ProjectDetail.tsx`

**Structure:**
```tsx
import { useState } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { ServiceSpecificationsTab } from "./ServiceSpecificationsTab";
import { PricingBreakdownTab } from "./PricingBreakdownTab";
import { ActivityTab } from "./ActivityTab";
import type { Project } from "../../types/pricing";

type ProjectTab = "overview" | "services" | "pricing" | "activity";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdate: () => void;
  currentUser?: { name: string; email: string; department: string } | null;
}

const STATUS_COLORS: Record<Project["status"], string> = {
  "Active": "bg-emerald-50 text-emerald-700 border-emerald-300",
  "Completed": "bg-blue-50 text-blue-700 border-blue-300",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-300",
  "Cancelled": "bg-red-50 text-red-700 border-red-300",
};

const BOOKING_STATUS_COLORS: Record<NonNullable<Project["booking_status"]>, string> = {
  "No Bookings Yet": "bg-gray-100 text-gray-700 border-gray-300",
  "Partially Booked": "bg-blue-50 text-blue-700 border-blue-300",
  "Fully Booked": "bg-emerald-50 text-emerald-700 border-emerald-300",
};

export function ProjectDetail({ project, onBack, onUpdate, currentUser }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-[#12332B]/10" style={{ padding: "32px 48px" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#12332B]/60 hover:text-[#12332B] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[#12332B]">{project.project_number}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[project.status]}`}>
                {project.status}
              </span>
              {project.booking_status && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${BOOKING_STATUS_COLORS[project.booking_status]}`}>
                  {project.booking_status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[#12332B]/60">
              <span>Customer: {project.customer_name}</span>
              <span>Quotation: {project.quotation_number}</span>
              {project.pol_aol && project.pod_aod && (
                <span>Route: {project.pol_aol} → {project.pod_aod}</span>
              )}
            </div>
          </div>

          <button className="p-2 hover:bg-[#12332B]/5 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-[#12332B]/60" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#0F766E] text-[#12332B]"
                : "border-transparent text-[#12332B]/60 hover:text-[#12332B]"
            }`}
          >
            Project Overview
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "services"
                ? "border-[#0F766E] text-[#12332B]"
                : "border-transparent text-[#12332B]/60 hover:text-[#12332B]"
            }`}
          >
            Service Specifications
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "pricing"
                ? "border-[#0F766E] text-[#12332B]"
                : "border-transparent text-[#12332B]/60 hover:text-[#12332B]"
            }`}
          >
            Pricing Breakdown
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "activity"
                ? "border-[#0F766E] text-[#12332B]"
                : "border-transparent text-[#12332B]/60 hover:text-[#12332B]"
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "overview" && (
          <ProjectOverviewTab project={project} onUpdate={onUpdate} />
        )}
        {activeTab === "services" && (
          <ServiceSpecificationsTab project={project} />
        )}
        {activeTab === "pricing" && (
          <PricingBreakdownTab project={project} />
        )}
        {activeTab === "activity" && (
          <ActivityTab project={project} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}
```

### 1.3 Create ProjectOverviewTab.tsx
**File:** `/components/bd/ProjectOverviewTab.tsx`

**Sections to Display:**
1. **General Information**
   - Customer Name, Contact Person
   - BD Owner, Operations Assigned
   - Project Number, Quotation Reference
   - Created Date, Last Updated

2. **Shipment Details**
   - Movement, Category, Shipment Type
   - Route (POL/AOL → POD/AOD)
   - Carrier, Transit Days, Incoterm

3. **Cargo Details**
   - Commodity, Cargo Type
   - Volume (CBM, Containers, Packages) ✨ NEW
   - Gross Weight, Chargeable Weight
   - Dimensions, Stackability ✨ NEW

4. **Project Timeline**
   - Client PO Number, PO Date
   - Shipment Ready Date
   - Requested ETD, Actual ETD
   - ETA, Actual Delivery Date
   - Collection Address

5. **Special Instructions**
   - Full-width textarea display

**Code Structure:**
```tsx
import type { Project } from "../../types/pricing";

interface ProjectOverviewTabProps {
  project: Project;
  onUpdate: () => void;
}

export function ProjectOverviewTab({ project, onUpdate }: ProjectOverviewTabProps) {
  return (
    <div style={{ padding: "32px 48px" }}>
      <div className="max-w-4xl">
        {/* General Information */}
        <Section title="📌 General Information">
          <FieldGrid>
            <Field label="Customer Name" value={project.customer_name} />
            <Field label="BD Owner" value={project.bd_owner_name} />
            <Field label="Operations Assigned" value={project.ops_assigned_user_name} />
            <Field label="Project Number" value={project.project_number} />
            <Field label="Quotation Reference" value={project.quotation_number} />
            <Field label="Created Date" value={formatDate(project.created_at)} />
          </FieldGrid>
        </Section>

        {/* Shipment Details */}
        <Section title="🚢 Shipment Details">
          <FieldGrid>
            <Field label="Movement" value={project.movement} />
            <Field label="Category" value={project.category} />
            <Field label="Shipment Type" value={project.shipment_type} />
            <Field label="POL/AOL" value={project.pol_aol} />
            <Field label="POD/AOD" value={project.pod_aod} />
            <Field label="Carrier" value={project.carrier} />
            <Field label="Transit Days" value={project.transit_days} />
            <Field label="Incoterm" value={project.incoterm} />
          </FieldGrid>
        </Section>

        {/* Cargo Details */}
        <Section title="📦 Cargo Details">
          <FieldGrid>
            <Field label="Commodity" value={project.commodity} />
            <Field label="Cargo Type" value={project.cargo_type} />
            <Field label="Volume (CBM)" value={project.volume_cbm} />
            <Field label="Volume (Containers)" value={project.volume_containers} />
            <Field label="Volume (Packages)" value={project.volume_packages} />
            <Field label="Gross Weight" value={project.gross_weight} unit="kg" />
            <Field label="Chargeable Weight" value={project.chargeable_weight} unit="kg" />
            <Field label="Dimensions" value={project.dimensions} />
            <Field label="Stackability" value={project.stackability} />
          </FieldGrid>
        </Section>

        {/* Project Timeline */}
        <Section title="📅 Project Timeline">
          <FieldGrid>
            <Field label="Client PO Number" value={project.client_po_number} />
            <Field label="PO Date" value={formatDate(project.client_po_date)} />
            <Field label="Shipment Ready Date" value={formatDate(project.shipment_ready_date)} />
            <Field label="Requested ETD" value={formatDate(project.requested_etd)} />
            <Field label="Actual ETD" value={formatDate(project.actual_etd)} />
            <Field label="ETA" value={formatDate(project.eta)} />
            <Field label="Actual Delivery Date" value={formatDate(project.actual_delivery_date)} />
            <Field label="Collection Address" value={project.collection_address} className="col-span-2" />
          </FieldGrid>
        </Section>

        {/* Special Instructions */}
        {project.special_instructions && (
          <Section title="📝 Special Instructions">
            <div className="p-4 bg-gray-50 border border-[#12332B]/10 rounded-lg">
              <p className="text-[#12332B] whitespace-pre-wrap">
                {project.special_instructions}
              </p>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-[#12332B] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-6">{children}</div>;
}

function Field({ 
  label, 
  value, 
  unit, 
  className 
}: { 
  label: string; 
  value?: string | number; 
  unit?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[#12332B]/60 text-sm mb-1">{label}</label>
      <p className="text-[#12332B]">
        {value || "—"}
        {value && unit && ` ${unit}`}
      </p>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return undefined;
  return new Date(date).toLocaleDateString();
}
```

---

# 🚀 PHASE 2: Service Specifications Display

**Estimated Time:** 2-3 hours

## Tasks

### 2.1 Create ServiceSpecificationsTab.tsx
**File:** `/components/bd/ServiceSpecificationsTab.tsx`

**Purpose:** Display `services_metadata` array with type-specific cards

```tsx
import type { Project } from "../../types/pricing";
import { ForwardingSpecsDisplay } from "./service-displays/ForwardingSpecsDisplay";
import { BrokerageSpecsDisplay } from "./service-displays/BrokerageSpecsDisplay";
import { TruckingSpecsDisplay } from "./service-displays/TruckingSpecsDisplay";
import { MarineInsuranceSpecsDisplay } from "./service-displays/MarineInsuranceSpecsDisplay";
import { OthersSpecsDisplay } from "./service-displays/OthersSpecsDisplay";

interface ServiceSpecificationsTabProps {
  project: Project;
}

export function ServiceSpecificationsTab({ project }: ServiceSpecificationsTabProps) {
  const servicesMetadata = project.services_metadata || [];

  return (
    <div style={{ padding: "32px 48px" }}>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h3 className="text-[#12332B] mb-2">📋 Service Specifications</h3>
          <p className="text-sm text-[#12332B]/60">
            Detailed specifications inherited from Quotation {project.quotation_number}
          </p>
        </div>

        {servicesMetadata.length > 0 ? (
          <div className="space-y-4">
            {servicesMetadata.map((service, idx) => (
              <ServiceSpecCard key={idx} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#12332B]/60">No detailed service specifications available</p>
            <p className="text-sm text-[#12332B]/40 mt-2">
              Service specifications are inherited from the quotation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceSpecCard({ service }: { service: any }) {
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
    default:
      return null;
  }
}
```

### 2.2 Create Service Display Components
**Directory:** `/components/bd/service-displays/`

Create 5 components, each displaying service-specific fields in a card format.

#### ForwardingSpecsDisplay.tsx
```tsx
import { Ship } from "lucide-react";
import type { ForwardingDetails } from "../../../types/pricing";

interface ForwardingSpecsDisplayProps {
  details: ForwardingDetails;
}

export function ForwardingSpecsDisplay({ details }: ForwardingSpecsDisplayProps) {
  return (
    <div className="border border-[#12332B]/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Ship className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B] font-semibold">Forwarding Service</h4>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <SpecField label="Mode" value={details.mode} />
        <SpecField label="Incoterms" value={details.incoterms} />
        <SpecField label="Cargo Type" value={details.cargo_type} />
        <SpecField label="Commodity" value={details.commodity} />
        <SpecField label="POL" value={details.pol} />
        <SpecField label="POD" value={details.pod} />
        {details.aol && <SpecField label="AOL" value={details.aol} />}
        {details.aod && <SpecField label="AOD" value={details.aod} />}
        <SpecField 
          label="Delivery Address" 
          value={details.delivery_address} 
          className="col-span-3" 
        />
      </div>
    </div>
  );
}

function SpecField({ 
  label, 
  value, 
  className 
}: { 
  label: string; 
  value?: string; 
  className?: string 
}) {
  return (
    <div className={className}>
      <div className="text-xs text-[#12332B]/60 mb-1">{label}</div>
      <div className="text-sm text-[#12332B]">{value || "—"}</div>
    </div>
  );
}
```

#### BrokerageSpecsDisplay.tsx (Expanded)
```tsx
import { FileText } from "lucide-react";
import type { BrokerageDetails } from "../../../types/pricing";

interface BrokerageSpecsDisplayProps {
  details: BrokerageDetails;
}

export function BrokerageSpecsDisplay({ details }: BrokerageSpecsDisplayProps) {
  return (
    <div className="border border-[#12332B]/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B] font-semibold">Brokerage Service</h4>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Core Fields */}
        <SpecField label="Subtype" value={details.subtype} />
        <SpecField label="Shipment Type" value={details.shipment_type} />
        <SpecField label="Type of Entry" value={details.type_of_entry} />
        <SpecField label="POD" value={details.pod} />
        <SpecField label="Mode" value={details.mode} />
        <SpecField label="Cargo Type" value={details.cargo_type} />
        
        {/* Cargo Details */}
        <SpecField label="Commodity" value={details.commodity} />
        <SpecField 
          label="Declared Value" 
          value={details.declared_value ? `PHP ${details.declared_value.toLocaleString()}` : undefined} 
        />
        <SpecField label="Country of Origin" value={details.country_of_origin} />
        
        {/* Expanded MD Fields */}
        <SpecField label="Preferential Treatment" value={details.preferential_treatment} />
        <SpecField label="PSIC" value={details.psic} />
        <SpecField label="AEO" value={details.aeo} />
        
        <SpecField 
          label="Delivery Address" 
          value={details.delivery_address} 
          className="col-span-3" 
        />
      </div>
    </div>
  );
}

function SpecField({ 
  label, 
  value, 
  className 
}: { 
  label: string; 
  value?: string; 
  className?: string 
}) {
  return (
    <div className={className}>
      <div className="text-xs text-[#12332B]/60 mb-1">{label}</div>
      <div className="text-sm text-[#12332B]">{value || "—"}</div>
    </div>
  );
}
```

#### TruckingSpecsDisplay.tsx
```tsx
import { Truck } from "lucide-react";
import type { TruckingDetails } from "../../../types/pricing";

interface TruckingSpecsDisplayProps {
  details: TruckingDetails;
}

export function TruckingSpecsDisplay({ details }: TruckingSpecsDisplayProps) {
  return (
    <div className="border border-[#12332B]/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B] font-semibold">Trucking Service</h4>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SpecField label="Truck Type" value={details.truck_type} />
        <SpecField label="Pull Out Location" value={details.pull_out} />
        <SpecField 
          label="Delivery Address" 
          value={details.delivery_address} 
          className="col-span-2" 
        />
        <SpecField 
          label="Delivery Instructions" 
          value={details.delivery_instructions} 
          className="col-span-2" 
        />
      </div>
    </div>
  );
}

function SpecField({ 
  label, 
  value, 
  className 
}: { 
  label: string; 
  value?: string; 
  className?: string 
}) {
  return (
    <div className={className}>
      <div className="text-xs text-[#12332B]/60 mb-1">{label}</div>
      <div className="text-sm text-[#12332B]">{value || "—"}</div>
    </div>
  );
}
```

#### MarineInsuranceSpecsDisplay.tsx
```tsx
import { Shield } from "lucide-react";
import type { MarineInsuranceDetails } from "../../../types/pricing";

interface MarineInsuranceSpecsDisplayProps {
  details: MarineInsuranceDetails;
}

export function MarineInsuranceSpecsDisplay({ details }: MarineInsuranceSpecsDisplayProps) {
  return (
    <div className="border border-[#12332B]/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B] font-semibold">Marine Insurance</h4>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <SpecField label="Commodity" value={details.commodity_description} />
        <SpecField label="HS Code" value={details.hs_code} />
        <SpecField 
          label="Invoice Value" 
          value={details.invoice_value ? `PHP ${details.invoice_value.toLocaleString()}` : undefined} 
        />
        <SpecField label="POL" value={details.pol} />
        <SpecField label="POD" value={details.pod} />
        {details.aol && <SpecField label="AOL" value={details.aol} />}
        {details.aod && <SpecField label="AOD" value={details.aod} />}
      </div>
    </div>
  );
}

function SpecField({ 
  label, 
  value, 
  className 
}: { 
  label: string; 
  value?: string; 
  className?: string 
}) {
  return (
    <div className={className}>
      <div className="text-xs text-[#12332B]/60 mb-1">{label}</div>
      <div className="text-sm text-[#12332B]">{value || "—"}</div>
    </div>
  );
}
```

#### OthersSpecsDisplay.tsx
```tsx
import { Package } from "lucide-react";
import type { OthersDetails } from "../../../types/pricing";

interface OthersSpecsDisplayProps {
  details: OthersDetails;
}

export function OthersSpecsDisplay({ details }: OthersSpecsDisplayProps) {
  return (
    <div className="border border-[#12332B]/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-[#0F766E]" />
        <h4 className="text-[#12332B] font-semibold">Other Service</h4>
      </div>

      <div>
        <div className="text-xs text-[#12332B]/60 mb-1">Service Description</div>
        <div className="text-sm text-[#12332B]">
          {details.service_description || "—"}
        </div>
      </div>
    </div>
  );
}
```

---

# 🚀 PHASE 3: Pricing Breakdown & Activity Tracking

**Estimated Time:** 2-3 hours

## Tasks

### 3.1 Create PricingBreakdownTab.tsx
**File:** `/components/bd/PricingBreakdownTab.tsx`

**Purpose:** Display `charge_categories` and financial summary

```tsx
import type { Project, ChargeCategory } from "../../types/pricing";

interface PricingBreakdownTabProps {
  project: Project;
}

export function PricingBreakdownTab({ project }: PricingBreakdownTabProps) {
  const chargeCategories = project.charge_categories || [];
  const currency = project.currency || "PHP";
  const total = project.total || 0;

  return (
    <div style={{ padding: "32px 48px" }}>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h3 className="text-[#12332B] mb-2">💰 Pricing Breakdown</h3>
          <p className="text-sm text-[#12332B]/60">
            Pricing details from Quotation {project.quotation_number}
          </p>
        </div>

        {chargeCategories.length > 0 ? (
          <>
            {/* Charge Categories */}
            <div className="space-y-4 mb-8">
              {chargeCategories.map((category, idx) => (
                <ChargeCategoryCard 
                  key={idx} 
                  category={category} 
                  currency={currency} 
                />
              ))}
            </div>

            {/* Financial Summary */}
            <div className="bg-[#12332B]/5 rounded-lg p-6">
              <h4 className="text-[#12332B] mb-4">Financial Summary</h4>
              <div className="space-y-2">
                <SummaryRow 
                  label="Grand Total" 
                  value={total} 
                  currency={currency} 
                  bold 
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#12332B]/60">No pricing breakdown available</p>
            <p className="text-sm text-[#12332B]/40 mt-2">
              Pricing details are inherited from the quotation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChargeCategoryCard({ 
  category, 
  currency 
}: { 
  category: ChargeCategory; 
  currency: string 
}) {
  return (
    <div className="border border-[#12332B]/10 rounded-lg p-6">
      <h4 className="text-[#12332B] mb-4">{category.category_name}</h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[#12332B]/10">
            <tr>
              <th className="text-left py-2 text-sm text-[#12332B]/60">Description</th>
              <th className="text-right py-2 text-sm text-[#12332B]/60">Qty</th>
              <th className="text-right py-2 text-sm text-[#12332B]/60">Unit Price</th>
              <th className="text-right py-2 text-sm text-[#12332B]/60">Amount</th>
            </tr>
          </thead>
          <tbody>
            {category.line_items.map((item, idx) => (
              <tr key={idx} className="border-b border-[#12332B]/5">
                <td className="py-2 text-sm">{item.description}</td>
                <td className="text-right text-sm">
                  {item.quantity} {item.unit}
                </td>
                <td className="text-right text-sm">
                  {currency} {item.price.toLocaleString()}
                </td>
                <td className="text-right text-sm">
                  {currency} {item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-[#12332B]/10">
            <tr>
              <td colSpan={3} className="text-right py-2 font-semibold text-sm">
                Subtotal:
              </td>
              <td className="text-right py-2 font-semibold text-sm">
                {currency} {category.subtotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryRow({ 
  label, 
  value, 
  currency, 
  bold 
}: { 
  label: string; 
  value: number; 
  currency: string; 
  bold?: boolean 
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${bold ? 'font-semibold' : ''} text-[#12332B]`}>
        {label}
      </span>
      <span className={`${bold ? 'font-semibold text-lg' : ''} text-[#12332B]`}>
        {currency} {value.toLocaleString()}
      </span>
    </div>
  );
}
```

### 3.2 Create ActivityTab.tsx
**File:** `/components/bd/ActivityTab.tsx`

**Purpose:** Show linked bookings and project usage

```tsx
import type { Project } from "../../types/pricing";
import { FileText, Calendar, User } from "lucide-react";

interface ActivityTabProps {
  project: Project;
  currentUser?: { name: string; email: string; department: string } | null;
}

export function ActivityTab({ project }: ActivityTabProps) {
  const linkedBookings = project.linkedBookings || [];
  const bookingStatus = project.booking_status || "No Bookings Yet";

  return (
    <div style={{ padding: "32px 48px" }}>
      <div className="max-w-4xl">
        {/* Booking Status Overview */}
        <div className={`border rounded-lg p-6 mb-6 ${
          bookingStatus === "Fully Booked" 
            ? "bg-emerald-50 border-emerald-300" 
            : bookingStatus === "Partially Booked"
            ? "bg-blue-50 border-blue-300"
            : "bg-gray-50 border-gray-300"
        }`}>
          <h3 className="text-lg font-semibold mb-2">
            {bookingStatus === "Fully Booked" && "✅ All Services Booked"}
            {bookingStatus === "Partially Booked" && "🔵 Partially Booked"}
            {bookingStatus === "No Bookings Yet" && "⚪ No Bookings Yet"}
          </h3>
          <p className="text-sm">
            {bookingStatus === "Fully Booked" && 
              "All services in this project have been booked by Operations."}
            {bookingStatus === "Partially Booked" && 
              `${linkedBookings.length} of ${project.services?.length || 0} services have been booked.`}
            {bookingStatus === "No Bookings Yet" && 
              "Operations has not created any bookings for this project yet."}
          </p>
        </div>

        {/* Linked Bookings */}
        <div className="border border-[#12332B]/10 rounded-lg p-6 mb-6">
          <h4 className="text-[#12332B] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Linked Service Bookings
          </h4>
          
          {linkedBookings.length > 0 ? (
            <div className="space-y-3">
              {linkedBookings.map((booking, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-gray-50 border border-[#12332B]/10 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-[#12332B]">
                      {booking.bookingNumber}
                    </div>
                    <div className="text-sm text-[#12332B]/60 mt-1">
                      {booking.serviceType} • Created {new Date(booking.createdAt).toLocaleDateString()}
                      {booking.createdBy && ` by ${booking.createdBy}`}
                    </div>
                  </div>
                  <div className="text-sm text-[#12332B]/60">
                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#12332B]/60">
              <p>No bookings have been created from this project yet</p>
              <p className="text-sm text-[#12332B]/40 mt-2">
                Operations will create service bookings and link them to this project
              </p>
            </div>
          )}
        </div>

        {/* Project Team */}
        <div className="border border-[#12332B]/10 rounded-lg p-6">
          <h4 className="text-[#12332B] mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Project Team
          </h4>
          <div className="space-y-3">
            <TeamMember 
              role="BD Owner" 
              name={project.bd_owner_name} 
              email={project.bd_owner_email} 
            />
            {project.ops_assigned_user_name && (
              <TeamMember 
                role="Operations Assigned" 
                name={project.ops_assigned_user_name} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamMember({ 
  role, 
  name, 
  email 
}: { 
  role: string; 
  name: string; 
  email?: string 
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div>
        <div className="text-sm text-[#12332B]/60">{role}</div>
        <div className="font-medium text-[#12332B]">{name}</div>
        {email && <div className="text-sm text-[#12332B]/40">{email}</div>}
      </div>
    </div>
  );
}
```

---

# 🚀 PHASE 4: List Enhancements

**Estimated Time:** 1-2 hours

## Tasks

### 4.1 Update ProjectsList.tsx
**File:** `/components/bd/ProjectsList.tsx`

**Changes:**
1. Add "Booking Status" filter dropdown
2. Add "Booking Status" column in table
3. Update status pill colors
4. Filter logic for booking status

**Key Additions:**
```tsx
// Add to state
const [bookingStatusFilter, setBookingStatusFilter] = useState<Project["booking_status"] | "all">("all");

// Add filter dropdown (after existing filters)
<select
  value={bookingStatusFilter}
  onChange={(e) => setBookingStatusFilter(e.target.value as Project["booking_status"] | "all")}
  className="px-4 py-2 border border-[#12332B]/20 rounded-lg"
>
  <option value="all">All Booking Statuses</option>
  <option value="No Bookings Yet">No Bookings Yet</option>
  <option value="Partially Booked">Partially Booked</option>
  <option value="Fully Booked">Fully Booked</option>
</select>

// Update filter logic
const matchesBookingStatus = 
  bookingStatusFilter === "all" || 
  project.booking_status === bookingStatusFilter;

// Add column in table header
<th>Booking Status</th>

// Add cell in table row
<td>
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
    BOOKING_STATUS_COLORS[project.booking_status || "No Bookings Yet"]
  }`}>
    {project.booking_status || "No Bookings Yet"}
  </span>
</td>
```

---

# 🚀 PHASE 5: Backend Integration & Polish

**Estimated Time:** 1-2 hours

## Tasks

### 5.1 Update Backend to Track Linked Bookings

**When a booking is created with a projectNumber:**
1. Fetch the project
2. Add the booking to `project.linkedBookings` array
3. Recalculate `project.booking_status` based on services vs bookings
4. Update project in KV store

**Example Logic in `/supabase/functions/server/index.tsx`:**

```typescript
// In POST /forwarding-bookings endpoint (and other booking creation endpoints)
if (bookingData.projectNumber) {
  // Fetch project
  const projects = await kv.getByPrefix("project:");
  const project = projects.find(p => p.project_number === bookingData.projectNumber);
  
  if (project) {
    // Add linked booking
    if (!project.linkedBookings) {
      project.linkedBookings = [];
    }
    
    project.linkedBookings.push({
      bookingId: newBooking.id,
      bookingNumber: newBooking.bookingId,
      serviceType: "Forwarding", // or the appropriate service type
      status: newBooking.status,
      createdAt: newBooking.createdAt,
      createdBy: newBooking.createdBy
    });
    
    // Recalculate booking status
    const totalServices = project.services?.length || 0;
    const bookedServices = project.linkedBookings.length;
    
    if (bookedServices === 0) {
      project.booking_status = "No Bookings Yet";
    } else if (bookedServices < totalServices) {
      project.booking_status = "Partially Booked";
    } else {
      project.booking_status = "Fully Booked";
    }
    
    // Update project
    await kv.set(`project:${project.id}`, project);
    console.log(`Updated project ${project.project_number} with linked booking`);
  }
}
```

### 5.2 Fix Seed Data Structure

**Update seed data to use proper structure:**
- Add `services_metadata` array with detailed service specs
- Add `charge_categories` array with line items
- Add `linkedBookings` array (can be empty for new projects)
- Add `booking_status` field
- Add missing fields: `stackability`, `volume_cbm`, `volume_containers`, `volume_packages`
- Add `preferential_treatment`, `psic`, `aeo` to Brokerage services

### 5.3 Integration with BusinessDevelopment.tsx

**Update routing in `/components/BusinessDevelopment.tsx`:**

```tsx
// In the projects view section
{view === "projects" && (
  <>
    {subView === "list" && (
      <ProjectsList onViewProject={handleViewProject} />
    )}
    {subView === "detail" && selectedProject && (
      <ProjectDetail 
        project={selectedProject} 
        onBack={handleBackFromProject}
        onUpdate={() => {
          // Refresh project data
          setProjectDetailKey(prev => prev + 1);
        }}
        currentUser={currentUser}
      />
    )}
  </>
)}
```

### 5.4 Testing Checklist

- [ ] Create project from accepted quotation
- [ ] View project detail - all tabs load correctly
- [ ] Project Overview shows all fields including new ones (stackability, volumes)
- [ ] Service Specifications displays all service types correctly
- [ ] Brokerage shows expanded fields (preferential treatment, PSIC, AEO)
- [ ] Pricing Breakdown shows charge categories and totals
- [ ] Activity tab shows "No Bookings Yet" initially
- [ ] Create forwarding booking with project number
- [ ] Project updates with linked booking
- [ ] Booking status changes to "Partially Booked"
- [ ] Activity tab shows linked booking details
- [ ] Projects list filter works for booking status
- [ ] Create remaining bookings for all services
- [ ] Booking status changes to "Fully Booked"

---

## ✅ Success Criteria

- [ ] **Complete Information**: Projects show ALL data from quotations (services_metadata, charge_categories)
- [ ] **Service Specifications**: Each service type displays correctly with type-specific fields
- [ ] **Expanded Brokerage**: Shows preferential_treatment, PSIC, AEO fields
- [ ] **Missing Fields Added**: stackability, volume_cbm, volume_containers, volume_packages visible
- [ ] **Pricing Visibility**: Full charge breakdown with line items and totals
- [ ] **Activity Tracking**: Shows linked bookings automatically when Operations creates them
- [ ] **Booking Status**: "No Bookings Yet" | "Partially Booked" | "Fully Booked" tracked automatically
- [ ] **No Friction**: No approval gates or handover ceremonies
- [ ] **Consistent Design**: Matches Operations module pattern and Neuron design system
- [ ] **Relay Race Complete**: BD → PD → BD → [Ops uses project data] → Execution

---

## 🎨 Design Principles

1. **Neuron Design System**: Deep green (#12332B), teal (#0F766E), pure white, stroke borders
2. **Consistent Padding**: 32px 48px throughout all views
3. **Operations Pattern**: Same List → Detail → Tabs structure
4. **Information Completeness**: Show EVERYTHING from quotation
5. **Organic Tracking**: Track usage automatically, no manual processes
6. **Clear Visual Hierarchy**: Section headers with emojis, clear field labels

---

## 📦 Deliverables

### New Files (12)
1. `/components/bd/ProjectDetail.tsx` (Rebuilt)
2. `/components/bd/ProjectOverviewTab.tsx`
3. `/components/bd/ServiceSpecificationsTab.tsx`
4. `/components/bd/PricingBreakdownTab.tsx`
5. `/components/bd/ActivityTab.tsx`
6. `/components/bd/service-displays/ForwardingSpecsDisplay.tsx`
7. `/components/bd/service-displays/BrokerageSpecsDisplay.tsx`
8. `/components/bd/service-displays/TruckingSpecsDisplay.tsx`
9. `/components/bd/service-displays/MarineInsuranceSpecsDisplay.tsx`
10. `/components/bd/service-displays/OthersSpecsDisplay.tsx`

### Modified Files (3)
11. `/types/pricing.ts` (Type updates)
12. `/components/bd/ProjectsList.tsx` (Booking status filter)
13. `/supabase/functions/server/index.tsx` (Linked booking tracking)

---

**Total Implementation Time: 8-13 hours**

🚀 **Ready to build!**
