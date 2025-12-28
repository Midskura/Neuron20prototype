# 🚀 QUICK START GUIDE - NEW FEATURES

## For Business Development (BD) Users

### ✨ What's New for You

#### 1. Generate Invoices Instantly
**Where**: Project Detail Page  
**When**: After quotation is accepted and project created  
**How**:
1. Open any project with pricing
2. Click the green **"Generate Invoice"** button
3. Done! Invoice created automatically with all pricing

**Benefits**:
- ⏱️ Saves 15 minutes per invoice
- ✅ Zero pricing errors
- 📊 Perfect copy of quotation pricing

---

#### 2. Locked Quotations (Data Protection)
**What**: Once you create a project from a quotation, that quotation becomes **locked**

**You'll see**:
- 🔒 Yellow "Locked" badge instead of "Edit" button
- Warning banner if you try to open in builder
- All fields are view-only

**Why**: Prevents accidental changes to pricing after project creation. Maintains data integrity between quotation → project → billing.

**If you need changes**: Create a new quotation or revision, don't edit the locked one.

---

#### 3. Clear Status Actions
**What**: Status dropdown now only shows actions you can actually perform

**You can**:
- ✅ Send quotation to client
- ✅ Mark as accepted by client
- ✅ Request pricing revision
- ✅ Create project from accepted quotation

**You can't**:
- ❌ Price the quotation (that's Pricing Department's job)

---

## For Pricing Department (PD) Users

### ✨ What's New for You

#### 1. Role-Based Interface
**What**: You only see actions relevant to your role

**You can**:
- ✅ Price quotations assigned to you
- ✅ View quotation status
- ✅ Add/edit pricing breakdown

**You can't**:
- ❌ Send quotations to clients (BD does this)
- ❌ Mark as accepted (BD does this)
- ❌ Create projects (BD does this)

**Why**: Cleaner interface, less confusion, proper workflow separation

---

#### 2. View-Only After Conversion
**What**: After BD creates a project, the quotation becomes locked

**You'll see**:
- 🔒 Locked indicator in quotation list
- Warning banner if opened
- No edit capability

**Why**: Your pricing work is complete! Project inherits your pricing. Any changes would break the project data.

---

## For Operations Users

### ✨ What's New for You

#### 1. Project Auto-fill (Reminder)
**Already existed, but worth highlighting!**

**Where**: When creating any booking  
**How**:
1. Operations → Create Booking (any type)
2. Look for "📦 Auto-fill from Project" section at top
3. Enter/select project number
4. Click "Load Project Data"
5. Form fills automatically!

**Auto-fills**:
- Customer name
- Quotation reference
- POL/POD (ports)
- Commodity description
- Delivery address
- Cargo type
- Volume/weight
- All service metadata

**Benefits**:
- ⏱️ Saves 8-10 minutes per booking
- ✅ Eliminates data entry errors
- 📋 Ensures consistency with quotation

---

## For Finance Users

### ✨ What's New for You

#### 1. Generate Invoices from Projects
**Where**: Project Detail Page  
**Who**: You or BD can do this  
**How**:
1. Navigate to project
2. Click **"Generate Invoice"**
3. System creates billing with complete pricing breakdown

**What you get**:
- Full charge categories (SEA FREIGHT, LOCAL CHARGES, etc.)
- All line items with quantities and prices
- Automatic totals
- Link back to project and quotation
- Marked as `source: "project"` (vs manual entry)

**Benefits**:
- ⏱️ Instant invoice creation
- ✅ Pricing matches quotation exactly
- 📊 Clear audit trail (project → quotation)
- 🔍 Easy to verify vs contract

---

## Common Workflows

### 📋 Complete BD → PD → BD → OPS → Finance Flow

#### Step 1: BD Creates Inquiry
```
BD → Quotations → Create Inquiry
- Fill customer info
- Select services
- Describe requirements
- Submit to Pricing Department
Status: "Pending Pricing"
```

#### Step 2: PD Prices Quotation
```
PD → View Inquiry → Start Pricing
- Add charge categories
- Add line items (buying + selling prices)
- Calculate totals
- Submit
Status: "Priced"
```

#### Step 3: BD Sends to Client
```
BD → View Quotation → Send to Client
Status: "Sent to Client"

(Client reviews and accepts)

BD → Mark as Accepted
Status: "Accepted by Client"
```

#### Step 4: BD Creates Project
```
BD → Create Project button
- Assigns BD owner
- Assigns Operations handler
- Adds special instructions
- Submit
Status: "Converted to Project" ← QUOTATION LOCKS HERE!
New Project Created: "PROJ-2025-XXX"
```

#### Step 5: Operations Creates Bookings
```
Operations → Forwarding → Create Booking
- Enter project number
- Auto-fill loads all data
- Verify and adjust
- Submit
Booking Status: "Draft" → "Confirmed"
```

#### Step 6: Finance Generates Invoice
```
Finance → Projects → View Project → Generate Invoice
OR
BD → Projects → View Project → Generate Invoice

System creates billing automatically
Invoice ready in Operations → Booking → Billings tab
```

---

## 🚨 Important Notes

### Data Integrity Rules

1. **Locked Quotations Cannot Be Edited**
   - Once converted to project, quotation is read-only
   - This prevents pricing mismatches
   - Create new quotation if major changes needed

2. **Project Pricing is Immutable**
   - Inherited from locked quotation
   - Cannot be changed in project
   - Any billing generated uses this pricing

3. **Invoices Track Source**
   - "Project" invoices = auto-generated from project
   - "Manual" invoices = hand-created
   - Always prefer project invoices for accuracy

### Permission Rules

| Action | BD | PD | Ops | Finance |
|--------|----|----|-----|---------|
| Create Inquiry | ✅ | ❌ | ❌ | ❌ |
| Price Quotation | ❌ | ✅ | ❌ | ❌ |
| Send to Client | ✅ | ❌ | ❌ | ❌ |
| Mark Accepted | ✅ | ❌ | ❌ | ❌ |
| Create Project | ✅ | ❌ | ❌ | ❌ |
| Create Booking | ❌ | ❌ | ✅ | ❌ |
| Generate Invoice | ✅ | ❌ | ❌ | ✅ |
| View All | ✅ | ✅ | ✅ | ✅ |

---

## 💡 Tips & Tricks

### For BD:
- Always check project has pricing before generating invoice
- Use descriptive quotation names (helps in project view)
- Lock means "done and protected" - that's good!

### For PD:
- Add detailed line item descriptions
- Include vendor info for cost tracking
- Once you submit, BD takes over (you're done!)

### For Operations:
- Always use project auto-fill when available
- Saves time and reduces errors significantly
- Verify auto-filled data before submitting

### For Finance:
- Use "Generate Invoice" instead of manual entry
- Check invoice source field (`project` vs `manual`)
- Project invoices are automatically accurate

---

## 🆘 Troubleshooting

### "Generate Invoice button is missing"
**Cause**: Project doesn't have pricing data  
**Solution**: Check if quotation had pricing when project was created

### "Can't edit quotation"
**Cause**: Quotation is locked (converted to project)  
**Solution**: This is correct! Create new quotation if needed

### "Status action not showing"
**Cause**: Your role doesn't have permission  
**Solution**: Ask correct department (e.g., BD sends to clients, not PD)

### "Project auto-fill not working"
**Cause**: Project number incorrect or project has no metadata  
**Solution**: Verify project number, check project has service details

---

## 📞 Need Help?

Contact your system administrator or refer to:
- `/IMPLEMENTATION_SUMMARY.md` - Technical details
- `/VISUAL_CHANGES_GUIDE.md` - Visual examples
- This guide - User instructions

---

**Last Updated**: December 27, 2024  
**Version**: 1.0 - "Make It Feel Real" Release
