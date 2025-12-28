# Phase 0: User Roles & Authentication - Testing Guide

## ✅ What Was Implemented

### Backend:
1. **Auth API Endpoints:**
   - `POST /auth/login` - User login with email/password
   - `GET /auth/me` - Get current user (session check)
   - `GET /users` - List all users (filterable by department/role)
   - `POST /auth/seed-users` - Seed test users (one-time setup)

2. **User Data Structure:**
   ```
   user:{user_id} = {
     id: string
     email: string
     name: string
     department: "BD" | "PD" | "Operations" | "Accounting" | "Executive"
     role: "rep" | "manager" | "director"
     password: string (stored in KV - in production would be hashed)
     created_at: string
     is_active: boolean
   }
   ```

3. **Test Users Created:**
   - bd.rep@neuron.ph (Juan Dela Cruz - BD Rep)
   - bd.manager@neuron.ph (Maria Santos - BD Manager)
   - pd.rep@neuron.ph (Pedro Reyes - PD Rep)
   - pd.manager@neuron.ph (Ana Garcia - PD Manager)
   - ops.rep@neuron.ph (Carlos Mendoza - Operations Rep)
   - executive@neuron.ph (Sofia Rodriguez - Executive Director)
   
   **All passwords:** `password123`

### Frontend:
1. **UserProvider & useUser Hook:**
   - Manages authentication state globally
   - Stores user session in localStorage
   - Provides `login()`, `logout()`, `user`, `isAuthenticated`

2. **Updated Login Page:**
   - Real API integration (no more mock)
   - Error handling with toast notifications
   - Test account hints displayed on page

3. **Updated App Flow:**
   - Auth check on mount
   - Login required to access app
   - User data available throughout app via `useUser()`
   - Logout functionality integrated

---

## 🧪 Testing Steps

### Step 1: Seed Users (One-Time Setup)
Before you can log in, you need to create the test users in the database.

**Option A: Via Browser (Easiest)**
1. Open your browser
2. Navigate to this URL:
   ```
   https://effhfendfrmgnuqgvehr.supabase.co/functions/v1/make-server-c142e950/auth/seed-users
   ```
3. You should see a JSON response with `success: true` and list of created users

**Option B: Via Browser Console**
1. Open the app in your browser
2. Open browser DevTools console (F12)
3. Run this command:
   ```javascript
   fetch('https://effhfendfrmgnuqgvehr.supabase.co/functions/v1/make-server-c142e950/auth/seed-users', {
     method: 'POST',
     headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmhmZW5kZnJtZ251cWd2ZWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMDg0MTMsImV4cCI6MjA0OTg4NDQxM30.nRXYLoxIJhQo-f_wL9G4BuHj4qXQZHI5aTFkp5I9Y8U' }
   }).then(r => r.json()).then(console.log)
   ```

### Step 2: Test Login
1. Refresh the app - you should see the **login page**
2. Try logging in with each test account:

   **BD Rep:**
   - Email: `bd.rep@neuron.ph`
   - Password: `password123`
   - Expected: Login success, see dashboard as BD department

   **PD Manager:**
   - Email: `pd.manager@neuron.ph`
   - Password: `password123`
   - Expected: Login success, see dashboard as PD department

3. **Test invalid login:**
   - Email: `wrong@email.com`
   - Password: `anything`
   - Expected: Error toast: "Invalid email or password"

### Step 3: Verify User Data
1. Log in successfully
2. Open browser DevTools console
3. Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('neuron_user'))
   ```
   Expected output:
   ```json
   {
     "id": "user-bd-rep-001",
     "email": "bd.rep@neuron.ph",
     "name": "Juan Dela Cruz",
     "department": "BD",
     "role": "rep",
     "created_at": "2025-12-18T...",
     "is_active": true
   }
   ```

### Step 4: Test Logout
1. While logged in, click your profile/settings
2. Click "Logout" (or however logout is triggered in Layout component)
3. Expected: Return to login page, localStorage cleared

### Step 5: Test Session Persistence
1. Log in successfully
2. Refresh the page (F5)
3. Expected: Should remain logged in (not kicked back to login page)
4. User data should be restored from localStorage

### Step 6: Verify Department Filtering Still Works
1. Log in as **BD Rep** (`bd.rep@neuron.ph`)
2. Navigate to BD module → Customers
3. Check browser Network tab for API calls
4. Expected: API calls should include `?role=BD` parameter
5. PD users should get `?role=PD`

---

## 🔍 What to Check

### ✅ Backend Working:
- [ ] Users seeded successfully (6 users created)
- [ ] Login API returns user object (without password)
- [ ] Invalid login returns proper error
- [ ] Users API returns filtered lists

### ✅ Frontend Working:
- [ ] Login page appears when not authenticated
- [ ] Login success shows toast notification
- [ ] User redirected to dashboard after login
- [ ] User data accessible via `useUser()` hook
- [ ] Logout clears session and returns to login
- [ ] Page refresh preserves login session
- [ ] Department-based routing still works

### ✅ Integration Working:
- [ ] Existing quotation flows work with new auth
- [ ] BD and PD data filtering based on user department
- [ ] Components receive correct user object

---

## 🐛 Common Issues & Fixes

### Issue: "Users not seeded"
**Fix:** Make sure you called the seed endpoint first (Step 1)

### Issue: "Login fails even with correct credentials"
**Fix:** Check browser console for errors. Verify seed endpoint was called successfully.

### Issue: "User data missing in components"
**Fix:** Components should use `useUser()` hook or receive user via props. Check that `currentUser` is being passed down correctly.

### Issue: "Logged out on page refresh"
**Fix:** Check localStorage for `neuron_user` key. If missing, login isn't persisting.

### Issue: "Department filtering broken"
**Fix:** Make sure components are using `user.department` from `useUser()` hook, not hardcoded values.

---

## 📊 Database State

After seeding, your KV store should contain 6 user records:

```
user:user-bd-rep-001
user:user-bd-manager-001
user:user-pd-rep-001
user:user-pd-manager-001
user:user-ops-rep-001
user:user-exec-001
```

You can verify this by checking Supabase dashboard:
https://supabase.com/dashboard/project/effhfendfrmgnuqgvehr/database/tables

Select the `kv_store_c142e950` table and filter by keys starting with `user:`

---

## ✨ Next Steps

Once Phase 0 is verified working:
1. Confirm you can log in as different users
2. Confirm department filtering works correctly
3. Confirm existing quotation workflows still function

Then we'll move to **Phase 1: Core Ticketing Backend**

---

## 🎯 Success Criteria

Phase 0 is **COMPLETE** when:
- ✅ All 6 test users can log in
- ✅ User session persists across page refresh
- ✅ Logout works correctly
- ✅ Existing BD/PD modules still work with new auth
- ✅ User role/department is accessible throughout the app
