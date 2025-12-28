/**
 * Utility to seed initial test users into the database
 * 
 * To use: Open browser console and run:
 * import('/utils/seed-users.ts').then(m => m.seedUsers())
 * 
 * Or just navigate to this URL once:
 * https://effhfendfrmgnuqgvehr.supabase.co/functions/v1/make-server-c142e950/auth/seed-users
 */

import { projectId, publicAnonKey } from './supabase/info';

export async function seedUsers() {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/auth/seed-users`,
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
      console.log('✅ Users seeded successfully!');
      console.log(`Created ${result.users.length} users:`);
      result.users.forEach((u: any) => {
        console.log(`  - ${u.email} (${u.department} ${u.role})`);
      });
      return result;
    } else {
      console.error('❌ Failed to seed users:', result.error);
      return result;
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

// Auto-run if this file is imported directly
if (typeof window !== 'undefined') {
  console.log('To seed users, run: seedUsers()');
}
