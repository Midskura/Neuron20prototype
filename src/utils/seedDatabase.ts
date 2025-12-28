/**
 * Utility to seed initial test data into the database
 * 
 * This will seed:
 * - Customers
 * - Contacts
 * - Quotations
 * - Bookings
 * - Expenses
 * - Projects (NEW!)
 * 
 * To use: Open browser console and run:
 * import('/utils/seedDatabase.ts').then(m => m.seedDatabase())
 * 
 * Or navigate to the API endpoint directly:
 * POST https://{projectId}.supabase.co/functions/v1/make-server-c142e950/entities/seed
 */

import { projectId, publicAnonKey } from './supabase/info';

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test data...');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/entities/seed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log('✅ Database seeded successfully!');
      console.log(`📊 Created:`);
      console.log(`  - ${result.data.customers} customers`);
      console.log(`  - ${result.data.contacts} contacts`);
      console.log(`  - ${result.data.quotations} quotations`);
      console.log(`  - ${result.data.bookings} bookings`);
      console.log(`  - ${result.data.expenses} expenses`);
      console.log(`  - ${result.data.projects} projects`);
      console.log(`  📦 Total: ${result.data.total} entities`);
      return result;
    } else {
      console.error('❌ Failed to seed database:', result.error);
      return result;
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Auto-run if this file is imported directly
if (typeof window !== 'undefined') {
  console.log('To seed the database, run: seedDatabase()');
}
