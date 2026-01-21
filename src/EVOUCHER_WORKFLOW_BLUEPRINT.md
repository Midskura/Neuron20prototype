# 🧾 Universal E-Voucher Workflow System - Implementation Blueprint

**Project:** Neuron OS - Accounting Module Restructure  
**Started:** January 19, 2026  
**Status:** 🔵 Planning Phase  
**Last Updated:** January 19, 2026

---

## 📋 Executive Summary

### Vision
Transform Neuron OS into a **universal transaction recording system** where ALL financial transactions flow through E-Vouchers before being posted to the accounting ledger, ensuring proper internal controls, audit trails, and separation of duties.

### Core Principle
```
ANY Transaction → E-Voucher → Approval (or Express Post) → Posted to Ledger → Immutable Record
```

### Key Decisions (Finalized)
- ✅ **Accounting Staff = Finance Manager** (same role, same permissions)
- ✅ **"Create & Approve" Express Option** for Accounting Staff
- ✅ **All Transaction Types** use E-Voucher system (Expenses, Collections, Adjustments)
- ✅ **Posted Expenses Remain Editable** (adjustments always allowed)
- ✅ **No Month-End Locking** (continuous adjustment capability)
- ✅ **Collections Use E-Voucher System** (same workflow, differentiated by type)

---

## 🎯 System Architecture Overview

### Module Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCOUNTING MODULE                        │
└─────────────────────────────────────────────────────────────┘
│
├── 📝 E-VOUCHERS (Primary Write Interface)
│   ├── Dashboard (Summary + Quick Actions)
│   ├── My E-Vouchers (Draft/Pending/Rejected by me)
│   ├── Pending Approval (For Accounting Staff to review)
│   ├── Posted Archive (All approved & posted transactions)
│   └── Create New E-Voucher
│       ├── Type: Expense (Cash Out)
│       ├── Type: Collection (Cash In)
│       └── Type: Journal Adjustment
│
├── 💰 EXPENSES LEDGER (Read + Edit)
│   ├── View all Posted Expenses
│   ├── Filter/Search/Export
│   ├── Edit Posted Expense (adjustment workflow)
│   └── Links back to original E-Voucher
│
├── 💵 COLLECTIONS LEDGER (Read + Edit) [FUTURE]
│   ├── View all Posted Collections
│   ├── Filter/Search/Export
│   ├── Edit Posted Collection (adjustment workflow)
│   └── Links back to original E-Voucher
│
├── 📊 GENERAL LEDGER (Read-Only) [FUTURE]
│   ├── Combined Expenses + Collections + Adjustments
│   ├── Journal Entry View
│   └── Account-wise Transactions
│
└── 📈 REPORTS (Read-Only) [FUTURE]
    ├── Profit & Loss
    ├── Balance Sheet
    └── Cash Flow Statement
```

---

## 🔄 E-Voucher Workflow States

### State Machine Diagram

```
┌─────────┐
│  DRAFT  │ ← User creating/editing (not submitted)
└────┬────┘
     │ User clicks "Submit for Approval"
     ↓
┌──────────────────┐
│ PENDING APPROVAL │ ← Waiting for Accounting Staff review
└────┬─────────────┘
     │
     ├─→ APPROVED ──→ Auto-Post to Ledger ──→ ┌────────┐
     │                                         │ POSTED │ (Immutable in E-Voucher, Editable in Ledger)
     │                                         └────────┘
     │
     └─→ ┌──────────┐
         │ REJECTED │ ← Denied with reason, user can revise & resubmit
         └──────────┘

CANCELLED ← User cancelled before submission
```

### Status Definitions

| Status | Description | Who Can See | Actions Available |
|--------|-------------|-------------|-------------------|
| **DRAFT** | User is filling out the form | Creator only | Edit, Delete, Submit |
| **PENDING APPROVAL** | Submitted, awaiting review | Creator + Accounting Staff | View only (Creator), Approve/Reject (Accounting) |
| **APPROVED** | Accounting approved, auto-posted | Everyone | View only (links to Ledger entry) |
| **POSTED** | Recorded in Ledger (visible in Expenses/Collections) | Everyone | View in Ledger, Edit in Ledger (creates adjustment E-Voucher) |
| **REJECTED** | Denied by Accounting Staff | Creator + Accounting Staff | Revise & Resubmit, Delete |
| **CANCELLED** | User cancelled before approval | Creator only | View only (archive) |

---

## 🧑‍💼 User Roles & Permissions

### Role Matrix

| Action | BD Staff | Operations | Accounting Staff |
|--------|----------|------------|------------------|
| Create E-Voucher | ✅ (Expense only) | ✅ (Expense only) | ✅ (All types) |
| Submit for Approval | ✅ | ✅ | ✅ (OR use Express Post) |
| **Express Post** (Create & Approve in one step) | ❌ | ❌ | ✅ |
| View Own E-Vouchers | ✅ | ✅ | ✅ |
| View Pending Approvals | ❌ | ❌ | ✅ |
| Approve/Reject E-Vouchers | ❌ | ❌ | ✅ |
| View Expenses Ledger | ❌ | ❌ | ✅ |
| Edit Posted Expenses | ❌ | ❌ | ✅ |
| View Collections Ledger | ❌ | ❌ | ✅ |
| View General Ledger | ❌ | ❌ | ✅ |
| View Reports | ❌ | ❌ | ✅ |

### Context-Aware Labeling

| Department | Create Button Label | Detail View Title |
|------------|---------------------|-------------------|
| **BD** | "New Budget Request" | "REQUEST FOR PAYMENT" |
| **Operations** | "New Budget Request" | "REQUEST FOR PAYMENT" |
| **Accounting** | "New E-Voucher" / "Create & Approve" | "EXPENSE VOUCHER" |

---

## 📦 Implementation Phases

---

## **PHASE 1: E-Voucher Approval Workflow Foundation** 🟡 IN PROGRESS

**Goal:** Add approval states, workflow logic, and Accounting Staff approval interface

### **1.1 Database Schema Updates**

✅ **COMPLETED** - Using KV Store pattern instead of SQL migrations
- evoucher:{id} - stores E-Voucher data with status, approval fields
- evoucher_history:{evoucher_id}:{history_id} - stores audit trail
- Auto-numbering implemented: EVRN-2026-XXX

### **1.2 Backend API Endpoints**

#### **New Routes in `/supabase/functions/server/index.tsx`**

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/make-server-c142e950/evouchers` | Create new E-Voucher (draft) | ✅ |
| PUT | `/make-server-c142e950/evouchers/:id` | Update draft E-Voucher | ✅ Creator only |
| POST | `/make-server-c142e950/evouchers/:id/submit` | Submit for approval | ✅ Creator only |
| POST | `/make-server-c142e950/evouchers/:id/approve` | Approve E-Voucher → Auto-post to ledger | ✅ Accounting only |
| POST | `/make-server-c142e950/evouchers/:id/reject` | Reject E-Voucher with reason | ✅ Accounting only |
| POST | `/make-server-c142e950/evouchers/:id/cancel` | Cancel E-Voucher | ✅ Creator only |
| POST | `/make-server-c142e950/evouchers/express-post` | Create & Approve in one step | ✅ Accounting only |
| GET | `/make-server-c142e950/evouchers/pending` | Get all pending approvals | ✅ Accounting only |
| GET | `/make-server-c142e950/evouchers/my-evouchers` | Get user's E-Vouchers | ✅ |
| GET | `/make-server-c142e950/evouchers/:id/history` | Get E-Voucher audit trail | ✅ |

#### **Business Logic: Auto-Post to Ledger on Approval**

When E-Voucher is approved:
1. Create corresponding entry in `expenses` table (if type = expense)
2. Create corresponding entry in `collections` table (if type = collection)
3. Update E-Voucher: `status = 'posted'`, `posted_to_ledger = true`, `ledger_expense_id = [new_id]`
4. Record in `evoucher_history`

### **1.3 Frontend Components**

#### **New Components to Create**

```
/components/accounting/evouchers/
├── ✅ EVoucherStatusBadge.tsx          (Status chip with colors) - COMPLETED
├── ✅ EVoucherWorkflowPanel.tsx        (Submit/Approve/Reject actions) - COMPLETED
├── ✅ PendingApprovalsList.tsx         (List for Accounting Staff) - COMPLETED
├── ✅ MyEVouchersList.tsx              (User's own E-Vouchers) - COMPLETED
├── ✅ EVoucherHistoryTimeline.tsx      (Audit trail display) - COMPLETED
└── ✅ ExpressPostPanel.tsx             (Create & Approve form for Accounting) - COMPLETED
```

#### **Updates to Existing Components**

- **`AddRequestForPaymentPanel.tsx`** ✅ COMPLETED (via CreateEVoucherForm wrapper)
  - Add "Save as Draft" button
  - Add "Submit for Approval" button
  - Add "Create & Approve" button (Accounting only)
  - Add validation before submission

- **`EVoucherDetailView.tsx`** ✅ COMPLETED
  - Add status badge
  - Add approval/rejection panel (Accounting only)
  - Add history timeline
  - Add link to Posted Ledger entry

### **1.4 Testing Checkpoints**

- [ ] Non-Accounting user can create draft E-Voucher
- [ ] Non-Accounting user can submit E-Voucher for approval
- [ ] Accounting Staff can view pending approvals
- [ ] Accounting Staff can approve E-Voucher → Creates Expense in ledger
- [ ] Accounting Staff can reject E-Voucher with reason
- [ ] User can see rejection reason and revise
- [ ] Accounting Staff can use Express Post (create & approve instantly)
- [ ] History timeline shows all state changes

**Estimated Effort:** 2-3 days  
**Status:** ✅ COMPLETED  
**Blocker:** None

**Completion Date:** January 19, 2026

**Integration Status:** ✅ Connected to AccountingV8.tsx via EVouchersContent.tsx

**Routing Fix:** ✅ Updated `/components/accounting/Accounting.tsx` to route `view="evouchers"` to `<EVouchersContent />`
  - Route: `/accounting/evouchers` → `AccountingEVouchersPage` → `<Accounting view="evouchers" />` → `<EVouchersContent />`
  - Fixed "under development" placeholder issue
  - E-Vouchers module now fully accessible from sidebar

---

## **PHASE 2: Expenses Ledger Integration** 🔵 NOT STARTED

**Goal:** Connect Posted E-Vouchers to Expenses Ledger, add ledger-level editing with adjustment tracking

### **2.1 Database Schema Updates**

#### **Update `expenses` table**
```sql
ALTER TABLE expenses
ADD COLUMN created_from_evoucher_id UUID REFERENCES evouchers(id),
ADD COLUMN is_adjustment BOOLEAN DEFAULT FALSE,
ADD COLUMN original_expense_id UUID REFERENCES expenses(id),
ADD COLUMN adjustment_reason TEXT;

CREATE INDEX idx_expenses_evoucher ON expenses(created_from_evoucher_id);
```

### **2.2 Backend API Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/make-server-c142e950/expenses` | Get expenses (already exists, enhance to include E-Voucher data) |
| PUT | `/make-server-c142e950/expenses/:id` | Edit posted expense → Creates adjustment E-Voucher |
| DELETE | `/make-server-c142e950/expenses/:id` | Delete expense → Creates reversal E-Voucher |

#### **Business Logic: Edit Posted Expense**

When user edits a Posted Expense:
1. Create new adjustment E-Voucher (auto-approved, status = posted)
2. Update expense record with new values
3. Link adjustment E-Voucher to expense: `is_adjustment = true`, `original_expense_id = [id]`
4. Record in history

### **2.3 Frontend Components**

#### **Updates to Existing Components**

- **`ExpensesContent.tsx`**
  - Add "Source: E-Voucher #XXX" badge
  - Add "View Original E-Voucher" link
  - Enable edit functionality (currently disabled?)
  - Add adjustment history view

- **`ExpenseDetailView.tsx`** (if exists)
  - Show linked E-Voucher
  - Show adjustment history
  - Show who approved original E-Voucher

#### **New Components**

```
/components/accounting/expenses/
└── ExpenseAdjustmentHistory.tsx     (Shows adjustment trail)
```

### **2.4 Testing Checkpoints**

- [ ] Approved E-Voucher correctly creates Expense in ledger
- [ ] Expense shows link back to original E-Voucher
- [ ] Editing expense creates adjustment E-Voucher
- [ ] Adjustment history is visible in Expense detail
- [ ] Deleting expense creates reversal E-Voucher

**Estimated Effort:** 1-2 days  
**Status:** 🔵 NOT STARTED  
**Blocker:** Requires Phase 1 completion

---

## **PHASE 3: E-Voucher Dashboard & Navigation** 🔵 NOT STARTED

**Goal:** Create central E-Voucher management interface with filtering, search, and quick actions

### **3.1 Components to Create**

```
/components/accounting/evouchers/
├── EVoucherDashboard.tsx            (Main dashboard with summary cards)
├── EVoucherSummaryCards.tsx         (Draft/Pending/Approved counts)
├── EVoucherFilterPanel.tsx          (Filter by status, type, date, user)
├── EVoucherListView.tsx             (Unified list with all E-Vouchers)
└── EVoucherQuickActions.tsx         (Bulk approve, export, etc.)
```

### **3.2 Navigation Updates**

Update `/components/accounting/AccountingContent.tsx` navigation:

```typescript
const tabs = [
  { id: 'evouchers', label: 'E-Vouchers', icon: FileText },      // NEW
  { id: 'expenses', label: 'Expenses Ledger', icon: DollarSign },
  { id: 'collections', label: 'Collections', icon: Wallet },      // FUTURE
  { id: 'billings', label: 'Billings', icon: Receipt },
  { id: 'ledger', label: 'General Ledger', icon: BookOpen },     // FUTURE
  { id: 'reports', label: 'Reports', icon: BarChart3 },          // FUTURE
];
```

### **3.3 Features**

- **Summary Cards:** Draft (X), Pending (X), Approved Today (X), Total This Month
- **Filter Panel:** Status, Type, Date Range, Submitted By, Amount Range
- **Search:** E-Voucher number, description, vendor
- **Quick Actions:** Bulk approve, Export to CSV, Print batch
- **Sorting:** Date, Amount, Status, Type

### **3.4 Testing Checkpoints**

- [ ] Dashboard shows accurate summary counts
- [ ] Filters work correctly (status, type, date)
- [ ] Search returns relevant results
- [ ] Quick actions work (bulk approve, export)
- [ ] Navigation between E-Vouchers and Ledgers is smooth

**Estimated Effort:** 2 days  
**Status:** 🔵 NOT STARTED  
**Blocker:** Requires Phase 1 completion

---

## **PHASE 4: Collections E-Voucher Support** 🔵 NOT STARTED

**Goal:** Extend E-Voucher system to support Collections (Payment Receipts) with same workflow

### **4.1 Database Schema Updates**

#### **Create `collections` table**
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_number VARCHAR(50) UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  booking_id UUID REFERENCES bookings(id),
  client_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  received_date DATE NOT NULL,
  bank_account VARCHAR(100),
  notes TEXT,
  created_from_evoucher_id UUID REFERENCES evouchers(id),
  is_adjustment BOOLEAN DEFAULT FALSE,
  original_collection_id UUID REFERENCES collections(id),
  adjustment_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_project ON collections(project_id);
CREATE INDEX idx_collections_booking ON collections(booking_id);
CREATE INDEX idx_collections_evoucher ON collections(created_from_evoucher_id);
```

#### **Update `evouchers` table**
```sql
ALTER TABLE evouchers
ADD COLUMN voucher_type VARCHAR(20) DEFAULT 'expense'; -- 'expense' | 'collection' | 'adjustment'
```

### **4.2 Backend API Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/make-server-c142e950/collections` | Create collection (from approved E-Voucher) |
| GET | `/make-server-c142e950/collections` | Get all collections |
| GET | `/make-server-c142e950/collections/:id` | Get collection details |
| PUT | `/make-server-c142e950/collections/:id` | Edit collection → Creates adjustment E-Voucher |

### **4.3 Frontend Components**

```
/components/accounting/collections/
├── CollectionsContent.tsx           (Main collections module)
├── CollectionsList.tsx              (List view)
├── CollectionDetailView.tsx         (Detail panel)
├── CollectionSummaryCards.tsx       (Total collected, pending, etc.)
└── CollectionFilters.tsx            (Filter by project, date, method)
```

### **4.4 E-Voucher Form Updates**

Update `AddRequestForPaymentPanel.tsx`:
- Add type selector: "Expense" | "Collection"
- Dynamic form fields based on type
- Collection-specific fields: Payment Method, Reference Number, Bank Account

### **4.5 Testing Checkpoints**

- [ ] Can create Collection-type E-Voucher
- [ ] Approval creates entry in Collections ledger
- [ ] Collections ledger shows link to original E-Voucher
- [ ] Editing collection creates adjustment E-Voucher
- [ ] Collections summary cards show correct totals

**Estimated Effort:** 2-3 days  
**Status:** 🔵 NOT STARTED  
**Blocker:** Requires Phase 1 & 2 completion

---

## **PHASE 5: General Ledger & Reporting** 🔵 NOT STARTED

**Goal:** Build unified ledger view combining all Posted E-Vouchers, enable financial reporting

### **5.1 Components to Create**

```
/components/accounting/ledger/
├── GeneralLedgerContent.tsx         (Main ledger view)
├── LedgerEntryList.tsx              (Combined expenses + collections)
├── LedgerFilters.tsx                (Account, date, type)
└── AccountSummary.tsx               (Balance by account)

/components/accounting/reports/
├── ReportsContent.tsx               (Main reports module)
├── ProfitAndLossReport.tsx          (P&L statement)
├── BalanceSheetReport.tsx           (Balance sheet)
├── CashFlowReport.tsx               (Cash flow statement)
└── ReportFilters.tsx                (Date range, comparison)
```

### **5.2 Features**

#### **General Ledger:**
- Combined view of all Posted E-Vouchers (Expenses + Collections)
- Journal entry format (Debit/Credit)
- Filter by account, date range, type
- Export to CSV/Excel

#### **Reports:**
- **Profit & Loss:** Revenue - Expenses = Net Profit
- **Balance Sheet:** Assets = Liabilities + Equity
- **Cash Flow:** Operating + Investing + Financing activities
- **Date Range Selection:** This Month, Last Month, Quarter, Year, Custom
- **Comparison Mode:** Compare periods side-by-side

### **5.3 Testing Checkpoints**

- [ ] General Ledger shows all Posted transactions
- [ ] Transactions correctly categorized by account
- [ ] P&L report shows accurate profit/loss
- [ ] Balance sheet balances (Assets = Liabilities + Equity)
- [ ] Cash flow report shows cash movements
- [ ] Reports export correctly to CSV/Excel

**Estimated Effort:** 3-4 days  
**Status:** 🔵 NOT STARTED  
**Blocker:** Requires Phase 4 completion

---

## 📊 Progress Tracking

### Overall Progress: 0% Complete

| Phase | Status | Progress | Estimated Effort | Actual Effort | Completion Date |
|-------|--------|----------|------------------|---------------|-----------------|
| **Phase 1:** Approval Workflow | 🟡 In Progress | 0% | 2-3 days | - | - |
| **Phase 2:** Expenses Integration | 🔵 Not Started | 0% | 1-2 days | - | - |
| **Phase 3:** Dashboard & Navigation | 🔵 Not Started | 0% | 2 days | - | - |
| **Phase 4:** Collections Support | 🔵 Not Started | 0% | 2-3 days | - | - |
| **Phase 5:** Ledger & Reporting | 🔵 Not Started | 0% | 3-4 days | - | - |

**Total Estimated:** 10-14 days  
**Total Actual:** -

### Legend
- 🔵 Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔴 Blocked
- ⚪ Skipped/Deferred

---

## 🚧 Known Issues & Technical Debt

### Current Issues
- None yet (pre-implementation)

### Technical Debt
- Will track as implementation progresses

---

## 🔄 Migration Strategy

### Existing E-Vouchers in System

**Question:** What happens to E-Vouchers created before this workflow?

**Strategy:**
1. Run migration script to backfill `status = 'posted'` for all existing E-Vouchers
2. Set `posted_to_ledger = true` if they have corresponding expense
3. Set `approved_at = created_at` (assume auto-approved)
4. Set `approved_by = created_by` (assume self-approved)

**Migration Script Location:** `/supabase/migrations/001_evoucher_workflow_migration.sql`

---

## 📝 Design System Compliance

### Neuron-Style Visual Consistency

All E-Voucher workflow UI must follow:

- **Colors:**
  - Deep Green: `#12332B` (primary)
  - Teal Green: `#0F766E` (accents)
  - White: `#FFFFFF` (backgrounds)
  - Status colors:
    - Draft: `#6B7280` (gray)
    - Pending: `#F59E0B` (amber)
    - Approved: `#10B981` (green)
    - Posted: `#0F766E` (teal)
    - Rejected: `#EF4444` (red)
    - Cancelled: `#9CA3AF` (light gray)

- **Borders:** 1px stroke borders (no shadows)
- **Padding:** 32px 48px (consistent module padding)
- **Typography:** Consistent hierarchy with existing modules
- **Spacing:** 16px base unit
- **Icons:** Lucide React icons only

### Component Design Tokens

```typescript
// Status Badge Styles
const statusStyles = {
  draft: 'bg-gray-100 text-gray-700 border border-gray-300',
  pending: 'bg-amber-50 text-amber-700 border border-amber-300',
  approved: 'bg-green-50 text-green-700 border border-green-300',
  posted: 'bg-teal-50 text-teal-700 border border-teal-300',
  rejected: 'bg-red-50 text-red-700 border border-red-300',
  cancelled: 'bg-gray-50 text-gray-500 border border-gray-200',
};
```

---

## 🧪 Testing Strategy

### Unit Testing
- API endpoint response formats
- State machine transitions
- Validation logic

### Integration Testing
- E-Voucher submission → Approval → Posting flow
- Ledger entry creation on approval
- Adjustment E-Voucher creation on edit

### User Acceptance Testing
- BD staff can create & submit E-Vouchers
- Operations can create & submit E-Vouchers
- Accounting can approve/reject E-Vouchers
- Accounting can use Express Post
- Ledger shows correct posted transactions

### Edge Cases
- Submit E-Voucher without required fields → Validation error
- Approve E-Voucher twice → Idempotent (no duplicate ledger entry)
- Edit Posted Expense multiple times → Multiple adjustment E-Vouchers
- Delete draft E-Voucher → Soft delete
- Reject E-Voucher → User can revise and resubmit

---

## 📚 Documentation Requirements

### User Documentation
- [ ] E-Voucher User Guide (for BD & Operations)
- [ ] Approval Workflow Guide (for Accounting Staff)
- [ ] Express Post Guide (for Accounting Staff)
- [ ] Adjustment Workflow Guide
- [ ] Video Tutorial: Creating E-Voucher
- [ ] Video Tutorial: Approving E-Vouchers

### Developer Documentation
- [ ] API Endpoint Documentation
- [ ] Database Schema Documentation
- [ ] State Machine Diagram
- [ ] Deployment Checklist

---

## 🎯 Success Metrics

### Key Performance Indicators

- **Approval Time:** Average time from submission → approval (Target: <24 hours)
- **Rejection Rate:** % of E-Vouchers rejected (Target: <10%)
- **Express Post Usage:** % of Accounting E-Vouchers using Express Post (Target: >70%)
- **Data Accuracy:** % of E-Vouchers with complete information (Target: >95%)
- **Audit Trail Completeness:** % of ledger entries traceable to E-Voucher (Target: 100%)

---

## 🔐 Security & Compliance

### Access Control
- ✅ Role-based permissions (BD, Operations, Accounting)
- ✅ Creator can only edit their own drafts
- ✅ Only Accounting can approve/reject
- ✅ Audit trail records all state changes

### Data Integrity
- ✅ Posted E-Vouchers are immutable (edits create new adjustment E-Vouchers)
- ✅ Ledger entries always traceable to source E-Voucher
- ✅ Deletion creates reversal entries (no hard deletes)

### Audit Trail
- ✅ Who created E-Voucher
- ✅ Who submitted E-Voucher
- ✅ Who approved/rejected E-Voucher
- ✅ When each action occurred
- ✅ Rejection reasons recorded
- ✅ Adjustment reasons recorded

---

## 📞 Stakeholder Communication

### Updates to Provide After Each Phase

**Phase 1 Complete:**
> "E-Voucher approval workflow is live. All users can now submit E-Vouchers for Accounting approval. Accounting Staff can approve/reject submissions and use Express Post for urgent entries."

**Phase 2 Complete:**
> "Expenses Ledger now fully integrated with E-Vouchers. All posted expenses are traceable to their source E-Voucher. Editing expenses creates adjustment records for full audit trail."

**Phase 3 Complete:**
> "E-Voucher Dashboard launched. Accounting Staff can now manage all pending approvals from one screen with filtering, search, and bulk actions."

**Phase 4 Complete:**
> "Collections module live. Payment receipts now follow the same E-Voucher workflow as expenses, enabling complete cash flow tracking."

**Phase 5 Complete:**
> "Financial reporting enabled. General Ledger, P&L, Balance Sheet, and Cash Flow reports now available with real-time data from E-Vouchers."

---

## 🔄 Change Log

### January 19, 2026
- ✅ Created initial blueprint document
- ✅ Defined 5-phase implementation plan
- ✅ Established design system compliance guidelines
- ✅ Set success metrics and KPIs

---

## 📋 Next Steps

### Immediate Actions
1. ✅ Review and approve this blueprint
2. 🔲 Begin Phase 1: Database schema updates
3. 🔲 Create backend API endpoints for approval workflow
4. 🔲 Build frontend components for E-Voucher status management

### Questions to Resolve Before Starting
- ✅ Role permissions (Answered: Accounting Staff = Finance Manager)
- ✅ Edit permissions on posted items (Answered: Yes, editable)
- ✅ Collections as separate or unified system (Answered: Unified for now)
- ✅ Auto-numbering format for E-Vouchers: **EVRN-[YEAR]-[XXX]** (e.g., EVRN-2026-001)
- ✅ Email notifications on approval/rejection: **Future feature** (prepare infrastructure, don't implement)
- ✅ Mobile responsiveness requirements: **Yes, full mobile compatibility required**

---

## 🎨 UI Mockup References

### E-Voucher List View
```
┌─────────────────────────────────────────────────────────────┐
│  E-VOUCHERS                                    [Create New ▼]│
├─────────────────────────────────────────────────────────────┤
│  📊 Summary                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │  Draft   │ Pending  │ Approved │ Rejected │             │
│  │    12    │     8    │    145   │     3    │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│                                                              │
│  🔍 [Search] [Status ▼] [Type ▼] [Date ▼] [Export]         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ EV-2026-015 │ PENDING │ PHP 12,500 │ Jan 18, 2026   │  │
│  │ Office Supplies - Toner cartridges                   │  │
│  │ Submitted by: Maria Santos                           │  │
│  │                                    [Approve] [Reject] │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ EV-2026-014 │ POSTED │ PHP 45,000 │ Jan 17, 2026    │  │
│  │ Trucking Services - Booking #BK-001                  │  │
│  │ Approved by: You                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

**End of Blueprint Document**

*This is a living document. Update after each implementation milestone.*