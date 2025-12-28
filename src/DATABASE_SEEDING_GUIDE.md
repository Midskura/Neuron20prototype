# Database Seeding Guide

## Problem: Projects list is empty in BD module

When you open the Projects tab in Business Development (BD), you might see an empty list. This is because **projects are not automatically created** - they come from converting "Accepted by Client" quotations into projects.

## Solution: Seed the database with test data

We've included sample projects in the seed data. Follow these steps:

### Option 1: Browser Console (Recommended)

1. Open your app in the browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the Console tab
4. Run this command:

```javascript
import('/utils/seedDatabase.js').then(m => m.seedDatabase())
```

5. Wait for the success message showing how many entities were created
6. Refresh the page or navigate back to BD → Projects

### Option 2: Direct API Call

You can also call the seeding endpoint directly using curl or Postman:

```bash
POST https://{your-project-id}.supabase.co/functions/v1/make-server-c142e950/entities/seed
Authorization: Bearer {your-anon-key}
```

## What gets seeded?

The seed script creates test data for:
- **5 Customers** (ABC Logistics, XYZ Manufacturing, etc.)
- **8 Contacts** (Sales representatives, procurement heads, etc.)
- **5 Quotations** (Draft, Pending Pricing, Priced, Quotation statuses)
- **3 Bookings** (In Transit, Delivered, Preparing)
- **5 Expenses** (Various expense types)
- **3 Projects** ⭐ NEW!
  - PRJ-2024-001: Active project with Ocean Freight (Manila → Cebu)
  - PRJ-2024-002: Active project with Multi-service (Subic → Ho Chi Minh)
  - PRJ-2024-003: Completed project with Air Freight (Manila → Singapore)

## Creating projects manually

Alternatively, you can create projects through the normal workflow:

1. Go to **Pricing Department** module
2. Open a quotation with "Sent to Client" status
3. Change status to "Accepted by Client"
4. Click "Convert to Project" button
5. Fill in project details and assign to Operations
6. The project will now appear in BD → Projects

## Notes

- Projects are visible to both BD and Pricing departments
- Only quotations with "Accepted by Client" status can be converted to projects
- Once converted, the quotation status changes to "Converted to Project"
- Projects can be assigned to Operations team members for execution

## Troubleshooting

If projects still don't show up after seeding:

1. Check browser console for any errors
2. Verify the API call succeeded (should return 200 status)
3. Try refreshing the page or re-navigating to BD → Projects
4. Check that the backend server is running properly

## For Developers

The seed data is defined in `/supabase/functions/server/index.tsx` in the `POST /make-server-c142e950/entities/seed` endpoint (around line 2861).

To modify the seed data, edit the `projects` array in that file and re-seed the database.
