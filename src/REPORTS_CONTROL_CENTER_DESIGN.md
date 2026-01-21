# Reports Module - Control Center Design

## Core Concept
A **flexible query builder** where users can select ANY fields from ANY data source, add cross-entity filters, create calculated fields, and see live results - all without being restricted to a single data source.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ Reports                                    [Export CSV ▼]           │
│ Build custom reports from any data source  [Export Excel]           │
│                                            [Export PDF]             │
├─────────────────────────────────────────────────────────────────────┤
│ CONTROL CENTER (Top Bar - Collapsible Sections)                    │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ 📊 SELECT FIELDS                          8 selected  [Edit]│   │
│ │ ─────────────────────────────────────────────────────────── │   │
│ │ [Quot.ID ×] [Customer ×] [Amount ×] [Status ×] [Industry ×] │   │
│ │ [Contact Name ×] [Created Date ×] [Valid Until ×]           │   │
│ │                                                              │   │
│ │ Click "Edit" to open field picker →                         │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ 🔍 FILTERS                                3 active  [+ Add] │   │
│ │ ─────────────────────────────────────────────────────────── │   │
│ │ Quotation.Amount     >      50000                       [×] │   │
│ │ Quotation.Status     is     Draft                       [×] │   │
│ │ Customer.Industry    is     Garments                    [×] │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ∑ CALCULATIONS & GROUPING                     [Show/Hide ▼]│   │
│ │ ─────────────────────────────────────────────────────────── │   │
│ │ Group By: [Customer Name ▼]  [+ Add Group]                 │   │
│ │ Aggregations:                                               │   │
│ │   • Total Amount = SUM(Quotation.Amount)                    │   │
│ │   • Quote Count = COUNT(Quotation.ID)                       │   │
│ │   [+ Add Calculation]                                       │   │
│ └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│ RESULTS                                              245 rows      │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ Quot.ID │ Customer    │ Amount   │ Status │ Industry │ ...  │ │
│ ├─────────┼─────────────┼──────────┼────────┼──────────┼──────┤ │
│ │ Q001    │ Acme Corp   │ $50,000  │ Draft  │ Garments │ ...  │ │
│ │ Q002    │ TechStart   │ $75,000  │ Draft  │ Tech     │ ...  │ │
│ │ ...                                                          │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ [Save Report Configuration]                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Section 1: SELECT FIELDS

### Collapsed State:
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 SELECT FIELDS                          8 selected  [Edit]│
│ ─────────────────────────────────────────────────────────── │
│ [Quot.ID ×] [Customer ×] [Amount ×] [Status ×] [Industry ×] │
│ [Contact Name ×] [Created Date ×] [Valid Until ×]           │
└─────────────────────────────────────────────────────────────┘
```

### Expanded State (Click "Edit"):
Opens a modal/panel with organized field picker:

```
┌─────────────────────────────────────────────────────────────┐
│ SELECT FIELDS TO DISPLAY                          [Done]    │
├─────────────────────────────────────────────────────────────┤
│ Search fields...  [                              ] 🔍       │
├─────────────────────────────────────────────────────────────┤
│ 📋 QUOTATIONS                                      [5/10]   │
│    ☑ ID                    ☑ Amount               ☑ Status  │
│    ☑ Quote Number          ☐ Valid Until          ☑ Created │
│    ☐ Transit Days          ☐ Updated              ☐ ...     │
│                                                              │
│ 👤 CUSTOMERS                                       [2/5]    │
│    ☑ Name                  ☑ Industry             ☐ Status  │
│    ☐ Created               ☐ Updated                        │
│                                                              │
│ 📞 CONTACTS                                        [1/6]    │
│    ☑ Name                  ☐ Email                ☐ Phone   │
│    ☐ Position              ☐ Created              ☐ ...     │
│                                                              │
│ 📅 ACTIVITIES                                      [0/5]    │
│    ☐ Type                  ☐ Description          ☐ Date    │
│    ☐ Created By            ☐ Created                        │
│                                                              │
│ 💰 BUDGET REQUESTS                                 [0/5]    │
│    ☐ Title                 ☐ Amount               ☐ Status  │
│    ☐ Created               ☐ Updated                        │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Search box to filter field names
- Checkboxes for each field
- Count showing X/Y selected per entity
- Click "Done" to close and apply

---

## Section 2: FILTERS

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 FILTERS                                3 active  [+ Add] │
│ ─────────────────────────────────────────────────────────── │
│ Quotation.Amount     >      50000                       [×] │
│ Quotation.Status     is     Draft                       [×] │
│ Customer.Industry    is     Garments                    [×] │
└─────────────────────────────────────────────────────────────┘
```

**Each filter row has:**
- **Field dropdown** (shows ALL fields from ALL entities)
  - Format: `Entity.FieldName` (e.g., "Quotation.Amount", "Customer.Industry")
- **Operator dropdown** (changes based on field type)
  - Text: is, is not, contains, starts with
  - Number: =, ≠, >, <, ≥, ≤, between
  - Date: is, before, after, between
  - Select: is, is not, in
- **Value input** (text/number/date/dropdown based on field type)
- **Remove [×]** button

**Click "+ Add"** to add a new filter row

---

## Section 3: CALCULATIONS & GROUPING (Optional - Collapsible)

```
┌─────────────────────────────────────────────────────────────┐
│ ∑ CALCULATIONS & GROUPING                     [Show/Hide ▼]│
│ ─────────────────────────────────────────────────────────── │
│ Group By: [Customer Name ▼]  [+ Add Group]                 │
│                                                              │
│ Aggregations:                                               │
│   • Total Amount = SUM(Quotation.Amount)               [×]  │
│   • Quote Count = COUNT(Quotation.ID)                  [×]  │
│   [+ Add Calculation]                                       │
└─────────────────────────────────────────────────────────────┘
```

**Group By:**
- Dropdown to select field(s) to group by
- Can add multiple group levels

**Aggregations:**
- Predefined calculations:
  - SUM(field)
  - AVG(field)
  - COUNT(field)
  - MIN(field)
  - MAX(field)
- Each calculation gets a custom name
- Remove with [×] button

**When grouping is active:**
- Results table shows grouped/aggregated data
- Non-aggregated fields must be in Group By list

---

## Data Model & Relationships

The system needs to understand these relationships to auto-JOIN:

```
Quotations
  ├─ belongs to → Customer (customer_id)
  ├─ belongs to → Contact (contact_person_id)
  └─ has many → Activities (quotation_id)

Customers
  ├─ has many → Quotations
  ├─ has many → Contacts
  └─ has many → Activities

Contacts
  ├─ belongs to → Customer (customer_id)
  └─ has many → Quotations (as contact_person)

Activities
  ├─ belongs to → Quotation (quotation_id)
  ├─ belongs to → Customer (customer_id)
  └─ belongs to → Contact (contact_id)

Budget Requests
  └─ created by → User
```

**Auto-JOIN Logic:**
- If fields from multiple entities are selected, automatically JOIN them
- Start with primary entity (most fields selected)
- LEFT JOIN related entities
- Handle many-to-many relationships appropriately

---

## User Flow Example

### Scenario: "Show me all Draft quotations over $50k with customer details"

1. **Select Fields:**
   - ☑ Quotation.ID
   - ☑ Quotation.Amount
   - ☑ Quotation.Status
   - ☑ Customer.Name
   - ☑ Customer.Industry

2. **Add Filters:**
   - Quotation.Status = Draft
   - Quotation.Amount > 50000

3. **Results:**
   - Table shows 5 columns (ID, Amount, Status, Customer Name, Industry)
   - Only rows matching filters

### Scenario: "Total revenue by customer industry"

1. **Select Fields:**
   - ☑ Customer.Industry

2. **Group & Calculate:**
   - Group By: Customer.Industry
   - Calculation: Total Revenue = SUM(Quotation.Amount)

3. **Results:**
   - Industry | Total Revenue
   - Garments | $1,250,000
   - Tech     | $890,000
   - ...

---

## Technical Implementation Notes

### Backend:
- Needs dynamic SQL query builder
- Parse selected fields, filters, grouping
- Build appropriate JOINs based on field relationships
- Apply WHERE clauses from filters
- Apply GROUP BY and aggregations
- Return normalized data

### Frontend:
- Field picker with entity grouping
- Smart filter builder (field type awareness)
- Real-time query preview (optional)
- Result table with dynamic columns
- Export functionality

---

## Design Alignment with Neuron OS

- **Colors**: #12332B (deep green), #0F766E (teal), white backgrounds
- **Spacing**: 32px 48px padding
- **Borders**: 1px solid strokes, no shadows
- **Typography**: Consistent hierarchy
- **Interactions**: Smooth transitions, clear hover states
- **Components**: Pills/chips for selected fields, clean filter rows

---

**This is the vision! Should we proceed with building this?**
