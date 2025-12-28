# ⚡ Quick Test Reference Card

## 🎯 **Fast Track: Test in 5 Minutes**

### **1. Create Quotation** (2 min)
```
BD → Customers → Pick any customer → + New Inquiry

Required fields:
✓ Service Type: Forwarding
✓ Mode: FCL
✓ AOL/POL: Manila, Philippines
✓ AOD/POD: Los Angeles, USA  
✓ Commodity: Electronic Components
✓ Cargo Type: General Cargo
✓ Delivery Address: 123 Main St, Quezon City

Save as Draft
```

### **2. Add Pricing** (1 min)
```
Pricing → For Pricing → Click quotation → Add Pricing

Add one charge:
✓ Category: Ocean Freight
✓ Selling Price: 1500
✓ Buying Price: 1200

Save → Submit to BD
```

### **3. Approve & Convert** (1 min)
```
BD → Quotations → Click quotation → Approve

Then: Convert to Project

Fill:
✓ Client PO: PO-2025-001
✓ Shipment Ready Date: Any future date
✓ Requested ETD: Any future date

Create → Note the PROJ-2025-XXX number!
```

### **4. Test Autofill** (1 min)
```
Operations → Forwarding → + New Booking

In Project Reference section:
1. Type: PROJ-2025-001 (your number)
2. Click Autofill or press Enter
3. Watch 8+ fields populate ✨

Should autofill:
✓ Customer Name
✓ Quotation Reference
✓ Commodity Description
✓ Delivery Address
✓ AOL/POL
✓ AOD/POD
✓ Cargo Type
✓ Mode
```

---

## 🔍 **Quick Checks**

### ✅ **Autofill Worked If:**
- Toast message: "Autofilled from project PROJ-2025-XXX"
- Customer Name field has a value
- Mode dropdown shows FCL
- AOL/POL and AOD/POD are filled

### ❌ **Common Issues:**

**"Project not found"**
→ Check you typed exact project number (case-sensitive)

**"Project status is Completed"**
→ Create a new project (status must be Active)

**Fields not populating**
→ F12 to check console for errors

**Autofill button disabled**
→ Type a project number first

---

## 📋 **Minimum Fields to Create Booking**

After autofill, add:

**Required:**
- ✓ Customer Name (should be autofilled)

**Recommended for testing:**
- Services: Freight Forwarding
- Sub-services: Door-to-Door
- Expected Volume (FCL): 40ft Qty = 2
- Consignee: ABC Corp
- Shipper: XYZ Inc
- Carrier: Maersk
- ETA: Future date

---

## 🎯 **Test Success = All These Work:**

1. [ ] Quotation → Project conversion works
2. [ ] Project shows in Operations → Projects
3. [ ] Autofill button responds to click/enter
4. [ ] Fields populate automatically
5. [ ] Success toast appears
6. [ ] Services multi-select works
7. [ ] Expected Volume section shows (FCL mode)
8. [ ] Booking creates successfully
9. [ ] Booking shows project number
10. [ ] Project shows linked booking

---

## 🐛 **Debugging Commands**

Open browser console (F12) and check:

```javascript
// Check if project exists
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-c142e950/projects/by-number/PROJ-2025-001', {
  headers: { 'Authorization': 'Bearer YOUR_ANON_KEY' }
}).then(r => r.json()).then(console.log)

// Check if autofill function exists
console.log(typeof autofillForwardingFromProject)

// Check project data structure
// After autofill, check what was fetched in Network tab
```

---

## 📊 **Expected Project Data Structure**

Your project should have these fields populated:

```json
{
  "project_number": "PROJ-2025-001",
  "status": "Active",
  "customer_name": "Your Customer",
  "quotation_number": "QTE-2025-XXX",
  "commodity_description": "Electronic Components",
  "delivery_address": "123 Main St, Quezon City",
  "aol_pol": "Manila, Philippines",
  "aod_pod": "Los Angeles, USA",
  "cargo_type": "General Cargo",
  "mode": "FCL",
  "services_metadata": {
    "forwarding": {
      "mode": "FCL",
      "incoterm": "FOB",
      "container_type": "40ft Standard",
      "number_of_containers": 2
    }
  },
  "charge_categories": [...]
}
```

---

## 🚀 **Performance Expectations**

- Autofill response: < 500ms
- Field population: Instant
- Booking creation: < 1 second
- Link creation: < 500ms

If slower, check:
- Backend server running?
- Network tab for slow requests
- Console for errors

---

## 💡 **Pro Testing Tips**

1. **Keep DevTools open** (F12) - Console + Network tabs
2. **Create multiple projects** - Test with PROJ-2025-001, -002, etc.
3. **Test different modes** - Change to LCL/AIR, verify volume fields change
4. **Test validation** - Try invalid project numbers
5. **Test edit flow** - Autofill, then edit fields before saving
6. **Clear cache** if things act weird (Ctrl+Shift+R)

---

## 📞 **Quick Status Check**

Run through this in 30 seconds:

```
✓ Login works
✓ BD module loads
✓ Pricing module loads
✓ Operations module loads
✓ Forwarding panel opens
✓ Autofill section visible
✓ Services multi-select visible
✓ Expected Volume section visible
```

All ✓ = Ready to test!

---

**Time to test: ~5 minutes end-to-end** ⚡
