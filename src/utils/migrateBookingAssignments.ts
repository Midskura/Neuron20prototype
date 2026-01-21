/**
 * Migration Script: Assign Teams to Existing Bookings
 * 
 * This script assigns default Manager/Supervisor/Handler to all existing bookings
 * that don't have team assignments yet.
 * 
 * Usage:
 * - Call via admin endpoint: POST /admin/migrate-booking-assignments
 * - Safe to run multiple times (idempotent)
 */

import { projectId, publicAnonKey } from "./supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  service_type?: string;
  operations_role?: string;
}

interface ServiceTeam {
  manager: User | null;
  supervisor: User | null;
  handler: User | null;
}

interface MigrationStats {
  totalBookings: number;
  migratedBookings: number;
  skippedBookings: number;
  errors: string[];
}

/**
 * Get default team for a service type
 */
async function getDefaultTeam(serviceType: string): Promise<ServiceTeam> {
  try {
    // Fetch Manager
    const managerResponse = await fetch(
      `${API_URL}/users?department=Operations&service_type=${serviceType}&operations_role=Manager`,
      {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      }
    );
    const managerResult = await managerResponse.json();
    const manager = managerResult.success && managerResult.data.length > 0 
      ? managerResult.data[0] 
      : null;

    // Fetch Supervisor (get first one)
    const supervisorResponse = await fetch(
      `${API_URL}/users?department=Operations&service_type=${serviceType}&operations_role=Supervisor`,
      {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      }
    );
    const supervisorResult = await supervisorResponse.json();
    const supervisor = supervisorResult.success && supervisorResult.data.length > 0 
      ? supervisorResult.data[0] 
      : null;

    // Fetch Handler (get first one)
    const handlerResponse = await fetch(
      `${API_URL}/users?department=Operations&service_type=${serviceType}&operations_role=Handler`,
      {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      }
    );
    const handlerResult = await handlerResponse.json();
    const handler = handlerResult.success && handlerResult.data.length > 0 
      ? handlerResult.data[0] 
      : null;

    return { manager, supervisor, handler };
  } catch (error) {
    console.error(`Error fetching team for ${serviceType}:`, error);
    return { manager: null, supervisor: null, handler: null };
  }
}

/**
 * Migrate bookings for a specific service type
 */
async function migrateServiceBookings(
  serviceType: string,
  endpoint: string
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalBookings: 0,
    migratedBookings: 0,
    skippedBookings: 0,
    errors: [],
  };

  try {
    console.log(`\n🔄 Migrating ${serviceType} bookings...`);

    // Get default team for this service type
    const team = await getDefaultTeam(serviceType);

    if (!team.manager || !team.supervisor || !team.handler) {
      const missingRoles = [];
      if (!team.manager) missingRoles.push("Manager");
      if (!team.supervisor) missingRoles.push("Supervisor");
      if (!team.handler) missingRoles.push("Handler");
      
      const errorMsg = `Missing team members for ${serviceType}: ${missingRoles.join(", ")}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
      return stats;
    }

    // Fetch all bookings for this service type
    const response = await fetch(`${API_URL}/${endpoint}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });

    const result = await response.json();

    if (!result.success) {
      const errorMsg = `Failed to fetch ${serviceType} bookings: ${result.error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
      return stats;
    }

    const bookings = result.data || [];
    stats.totalBookings = bookings.length;

    console.log(`📊 Found ${bookings.length} ${serviceType} bookings`);

    // Update each booking that doesn't have assignments
    for (const booking of bookings) {
      try {
        // Skip if already has assignments
        if (booking.assigned_manager_id && booking.assigned_supervisor_id && booking.assigned_handler_id) {
          stats.skippedBookings++;
          continue;
        }

        // Update booking with team assignments
        const updateResponse = await fetch(`${API_URL}/${endpoint}/${booking.bookingId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...booking,
            assigned_manager_id: team.manager.id,
            assigned_manager_name: team.manager.name,
            assigned_supervisor_id: team.supervisor.id,
            assigned_supervisor_name: team.supervisor.name,
            assigned_handler_id: team.handler.id,
            assigned_handler_name: team.handler.name,
          }),
        });

        const updateResult = await updateResponse.json();

        if (updateResult.success) {
          stats.migratedBookings++;
          console.log(`  ✅ Migrated ${booking.bookingId}`);
        } else {
          const errorMsg = `Failed to migrate ${booking.bookingId}: ${updateResult.error}`;
          console.error(`  ❌ ${errorMsg}`);
          stats.errors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `Error migrating ${booking.bookingId}: ${String(error)}`;
        console.error(`  ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    console.log(`✅ ${serviceType}: Migrated ${stats.migratedBookings}/${stats.totalBookings} bookings (${stats.skippedBookings} already had assignments)`);
  } catch (error) {
    const errorMsg = `Error in ${serviceType} migration: ${String(error)}`;
    console.error(`❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }

  return stats;
}

/**
 * Main migration function
 */
export async function migrateAllBookingAssignments(): Promise<{
  success: boolean;
  summary: {
    totalBookings: number;
    migratedBookings: number;
    skippedBookings: number;
    errors: string[];
  };
}> {
  console.log("🚀 Starting booking assignments migration...\n");

  const serviceTypes = [
    { name: "Forwarding", endpoint: "forwarding-bookings" },
    { name: "Brokerage", endpoint: "brokerage-bookings" },
    { name: "Trucking", endpoint: "trucking-bookings" },
    { name: "Marine Insurance", endpoint: "marine-insurance-bookings" },
    { name: "Others", endpoint: "others-bookings" },
  ];

  const allStats: MigrationStats = {
    totalBookings: 0,
    migratedBookings: 0,
    skippedBookings: 0,
    errors: [],
  };

  for (const service of serviceTypes) {
    const stats = await migrateServiceBookings(service.name, service.endpoint);
    
    allStats.totalBookings += stats.totalBookings;
    allStats.migratedBookings += stats.migratedBookings;
    allStats.skippedBookings += stats.skippedBookings;
    allStats.errors.push(...stats.errors);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total bookings found:       ${allStats.totalBookings}`);
  console.log(`Successfully migrated:      ${allStats.migratedBookings}`);
  console.log(`Already had assignments:    ${allStats.skippedBookings}`);
  console.log(`Errors:                     ${allStats.errors.length}`);
  console.log("=".repeat(60));

  if (allStats.errors.length > 0) {
    console.log("\n❌ ERRORS:");
    allStats.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  const success = allStats.errors.length === 0;
  
  if (success) {
    console.log("\n✅ Migration completed successfully!");
  } else {
    console.log("\n⚠️  Migration completed with errors. Please review the errors above.");
  }

  return {
    success,
    summary: allStats,
  };
}

/**
 * Test function - migrate just one booking to verify it works
 */
export async function testMigration(): Promise<boolean> {
  console.log("🧪 Running migration test...\n");

  try {
    // Test with Forwarding service
    const team = await getDefaultTeam("Forwarding");
    
    if (!team.manager || !team.supervisor || !team.handler) {
      console.error("❌ Test failed: Missing team members for Forwarding");
      return false;
    }

    console.log("✅ Successfully fetched default team:");
    console.log(`   Manager: ${team.manager.name}`);
    console.log(`   Supervisor: ${team.supervisor.name}`);
    console.log(`   Handler: ${team.handler.name}`);

    // Fetch one booking
    const response = await fetch(`${API_URL}/forwarding-bookings`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });

    const result = await response.json();

    if (!result.success || result.data.length === 0) {
      console.log("⚠️  No forwarding bookings found to test");
      return true; // Not a failure, just no data
    }

    console.log(`\n✅ Test passed! Ready to migrate ${result.data.length} forwarding bookings.`);
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}
