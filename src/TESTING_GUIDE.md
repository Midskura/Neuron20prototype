# 🧪 Step-by-Step Testing Guide: Project → Forwarding Autofill

## Prerequisites
Your Neuron OS app should be running locally. If not, start it with your usual development command.

---

## 🎯 **Test Flow Overview**

```
BD Module → Create Quotation → PD Reviews → Accept → Convert to Project → 
Operations Module → Forwarding → New Booking → Autofill from Project → Create Booking
```

---

## 📝 **STEP 1: Login & Navigate to BD Module**

1. **Open your app** (usually `http://localhost:5173` or similar)
2. **Login** with any credentials (DEV MODE accepts any email/password)
3. **Click "Business Development"** in the left sidebar
4. You should see the BD Dashboard

---

## 📋 **STEP 2: Create a Test Quotation**

### Option A: If you have existing quotations
1. Go to **"Quotations"** tab in BD
2. Look for any quotation with status **"Approved"** or **"Accepted by Client"**
3. **Skip to STEP 3** if you find one

### Option B: Create a new quotation from scratch
1. Click **"Customers"** tab
2. Click on any customer (or create a new one with **"+ New Customer"**)
3. Click **"+ New Inquiry"** button
4. Fill in the quotation form:

   **General Information:**
   - Customer: (auto-filled)
   - Inquiry Date: Today's date
   - Contact Person: "John Doe"
   - Contact Number: "+63 912 345 6789"
   - Service Type: **"Forwarding"** ← IMPORTANT!

   **Service Details - Forwarding:**
   - Mode: **FCL** (or LCL/AIR)
   - Incoterm: **"FOB"**
   - AOL/POL: **"Manila, Philippines"** ← This will autofill
   - AOD/POD: **"Los Angeles, USA"** ← This will autofill
   - Commodity Description: **"Electronic Components"** ← This will autofill
   - Container Type: **"40ft Standard"**
   - Number of Containers: **2**
   - Gross Weight: **5000 kg**
   - Cargo Type: **"General Cargo"** ← This will autofill
   - Delivery Address: **"123 Main St, Quezon City"** ← This will autofill

5. Click **"Save as Draft"**
6. The quotation should now appear in the customer's inquiries list

---

## 💰 **STEP 3: Add Pricing (Pricing Department)**

1. **Click "Pricing"** in the left sidebar
2. Find your quotation in the **"For Pricing"** queue
3. Click on it to open the detail view
4. Click **"Add Pricing"** button
5. Add some charge categories (at least one):
   
   **Example Charge:**
   - Category: **"Ocean Freight"**
   - Description: **"40ft container shipping"**
   - Quantity: **2**
   - Selling Price: **1500 USD**
   - Buying Price: **1200 USD**

6. Click **"Save Pricing"**
7. Click **"Submit to BD"** to send it back to BD for approval

---

## ✅ **STEP 4: Approve Quotation (BD)**

1. **Go back to "Business Development"** module
2. Click **"Quotations"** tab
3. Find your quotation (should now show **"Priced - Pending BD Approval"**)
4. Click on it to open
5. Click **"Approve"** button (this changes status to **"Approved"**)

---

## 🚀 **STEP 5: Convert to Project**

This is the critical step that creates the Project!

1. While viewing the quotation, click **"Convert to Project"** button
2. A modal should appear: **"Create Project"**
3. Fill in the required fields:
   - **Client PO Number:** `PO-2025-001` ← Required
   - **Shipment Ready Date:** Select any future date ← Required
   - **Requested ETD:** Select any future date ← Required
   - **Special Instructions:** (optional) "Test project for autofill"
   - **Ops Assigned User:** (optional) Leave blank for now

4. Click **"Create Project"**
5. Success! You should see: **"Project created successfully!"**
6. **IMPORTANT:** Note the **Project Number** displayed (e.g., **PROJ-2025-001**)
   - This is what you'll use for autofill!

---

## 🔍 **STEP 6: Verify Project Was Created**

1. **Click "Operations"** in the left sidebar
2. Click **"Projects"** tab
3. You should see your new project with:
   - Project Number: **PROJ-2025-001**
   - Status: **Active**
   - Customer name
   - Services: **Forwarding**

4. **Click on the project** to view details
5. Verify the following fields have data:
   - **Quotation Number:** Your original quote number
   - **Customer Name:** From quotation
   - **Commodity Description:** "Electronic Components"
   - **AOL/POL:** "Manila, Philippines"
   - **AOD/POD:** "Los Angeles, USA"
   - **Delivery Address:** "123 Main St, Quezon City"
   - **Cargo Type:** "General Cargo"
   - **Mode:** "FCL"
   - **Charge Categories:** Your pricing data

---

## 🎯 **STEP 7: Test Autofill in Forwarding Booking**

Now for the moment of truth!

1. While still in **Operations** module
2. Click **"Forwarding"** in the left submenu
3. Click **"+ New Booking"** button (top right)
4. A side panel should slide in: **"New Forwarding Booking"**

---

## 🪄 **STEP 8: Use the Autofill Feature**

1. Look at the **top section** - you should see:
   - 📎 **"Project Reference (Optional)"** section with teal background
   - An input field: "Enter Project Number to autofill"
   - An **"Autofill"** button

2. **Type in your project number:** `PROJ-2025-001`
   - (Use the exact number from Step 5)

3. **Click the "Autofill" button** OR **press Enter**

4. **Watch the magic happen!** ✨
   
   The following fields should **automatically populate:**
   - ✅ **Customer Name:** From your project
   - ✅ **Quotation Reference:** Your quote number
   - ✅ **Commodity Description:** "Electronic Components"
   - ✅ **Delivery Address:** "123 Main St, Quezon City"
   - ✅ **AOL/POL:** "Manila, Philippines"
   - ✅ **AOD/POD:** "Los Angeles, USA"
   - ✅ **Cargo Type:** "General Cargo"
   - ✅ **Mode:** "FCL"

5. **Success message should appear:** 
   > "Autofilled from project PROJ-2025-001"

---

## ✏️ **STEP 9: Fill Remaining Fields**

The autofill doesn't fill EVERYTHING (by design). You still need to add:

### Select Services/Sub-services:
1. Click on **"Services"** dropdown
2. Select: **"Freight Forwarding"** and **"Documentation"**
3. Click on **"Sub-services"** dropdown
4. Select: **"Door-to-Door"** and **"Container Stuffing"**

### Fill Expected Volume:
1. Scroll to **"Expected Volume"** section
2. Since Mode is FCL, you should see:
   - **20ft Quantity:** `0`
   - **40ft Quantity:** `2` ← Match your quotation
   - **45ft Quantity:** `0`

### Fill Shipment Information:
1. **Consignee:** "ABC Trading Corp"
2. **Shipper:** "XYZ Manufacturing Inc"
3. **MBL/MAWB:** "MAEU123456789"
4. **HBL/HAWB:** "HBL987654321"
5. **Carrier:** "Maersk Line"
6. **Forwarder:** "Your Company Name"
7. **Country of Origin:** "Philippines"
8. **Preferential Treatment:** "Form E" (ASEAN)
9. **Gross Weight:** "5000 kg"
10. **Dimensions:** "40ft x 8ft x 8.5ft"
11. **ETA:** Select a future date

### Fill FCL Details (conditional - appears because mode is FCL):
1. **Container Numbers:** `MAEU1234567, MAEU1234568` (comma-separated)
2. **Container Deposit:** Check the box if applicable
3. **Empty Return Location:** "Manila Port"
4. **DET/DEM Validity:** "7 days"
5. **Storage Validity:** "14 days"
6. **CRO Availability:** Select a date

---

## 💾 **STEP 10: Create the Booking**

1. **Review all fields** - both autofilled and manually entered
2. **Click "Create Booking"** button at the bottom
3. **Wait for success message:**
   > "Forwarding booking FWD-2025-001 created successfully"

4. The panel should close and you should see the new booking in the list

---

## 🔗 **STEP 11: Verify Bidirectional Linking**

### Check the Booking:
1. Click on your newly created booking
2. Look for **"Project Number"** field
3. It should show: **PROJ-2025-001**

### Check the Project:
1. Navigate back to **"Projects"** tab
2. Click on **PROJ-2025-001**
3. Look for **"Linked Bookings"** section
4. You should see your booking:
   - **Booking Number:** FWD-2025-001
   - **Service Type:** Forwarding
   - **Status:** Draft

---

## ✅ **Success Criteria Checklist**

- [ ] Quotation created successfully
- [ ] Pricing added successfully
- [ ] Quotation approved by BD
- [ ] Project created (PROJ-2025-XXX)
- [ ] Project visible in Operations → Projects
- [ ] Autofill button works (no errors)
- [ ] Fields populate automatically (8+ fields)
- [ ] Success toast appears
- [ ] Services/Sub-services multi-select works
- [ ] Expected Volume section displays correctly
- [ ] All form sections work properly
- [ ] Booking created successfully
- [ ] Booking shows project number
- [ ] Project shows linked booking

---

## 🐛 **Troubleshooting**

### "Project not found" error:
- Check you typed the project number exactly (case-sensitive)
- Verify project exists in Operations → Projects
- Try refreshing the page

### "Project status is Completed" error:
- Only **Active** projects can be used for new bookings
- Create a new project or change the project status

### "Service type mismatch" warning:
- This is just a warning, not an error
- The project might not include Forwarding service
- You can still proceed with autofill

### Fields not populating:
- Check browser console (F12) for errors
- Verify the project has data in those fields
- Try clicking Autofill again

### Booking creation fails:
- Check **Customer Name** is filled (required field)
- Check browser console for detailed error
- Verify backend server is running

---

## 🎉 **What You're Testing**

1. ✅ **Project Creation Flow** - From quotation to project
2. ✅ **Project Lookup API** - GET `/projects/by-number/:projectNumber`
3. ✅ **Autofill Logic** - `autofillForwardingFromProject()`
4. ✅ **UI Components:**
   - ProjectAutofillSection
   - ServicesMultiSelect
   - Expected Volume inputs
5. ✅ **Bidirectional Linking** - POST `/projects/:id/link-booking`
6. ✅ **Data Persistence** - All fields saved correctly
7. ✅ **Type Safety** - TypeScript types working
8. ✅ **UX Flow** - Complete end-to-end workflow

---

## 📊 **Expected Data Flow**

```
Quotation (BD) 
   ↓
   services: ["Forwarding"]
   commodity: "Electronic Components"
   aol_pol: "Manila"
   aod_pod: "Los Angeles"
   ↓
Project (Operations)
   ↓
   project_number: "PROJ-2025-001"
   status: "Active"
   services_metadata: { forwarding: {...} }
   charge_categories: [...]
   ↓
Autofill (Forwarding Panel)
   ↓
   customerName ← project.customer_name
   quotationReferenceNumber ← project.quotation_number
   commodityDescription ← project.commodity_description
   deliveryAddress ← project.delivery_address
   aolPol ← project.aol_pol
   aodPod ← project.aod_pod
   cargoType ← project.cargo_type
   mode ← project.mode
   ↓
Booking Created
   ↓
   bookingId: "FWD-2025-001"
   projectNumber: "PROJ-2025-001"
   all fields saved ✓
   ↓
Bidirectional Link
   ↓
   Project.linkedBookings += [{
     bookingNumber: "FWD-2025-001",
     serviceType: "Forwarding",
     status: "Draft"
   }]
```

---

## 🚀 **Next Steps After Testing**

Once you verify everything works:
1. Test with different modes (LCL, AIR) - volume fields should change
2. Test with multiple projects
3. Test error cases (invalid project number, completed projects)
4. Replicate the pattern to other services (Brokerage, Trucking, etc.)

---

## 💡 **Pro Tips**

- Keep browser DevTools (F12) open to see console logs
- The autofill only fills fields that have data in the project
- You can edit autofilled fields before creating the booking
- Services/Sub-services are searchable - just start typing
- Expected Volume fields change based on Mode selection
- Press Enter in the project number field to trigger autofill

---

**Happy Testing! 🎯**
