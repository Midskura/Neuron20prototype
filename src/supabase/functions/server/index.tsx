import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as accountingHandlers from "./accounting-handlers.tsx";

const app = new Hono();

// Initialize Supabase client for storage
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Only initialize Supabase client if credentials are available
let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Supabase client initialized for storage");
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
  }
}

// Initialize storage bucket for comment attachments
const COMMENT_ATTACHMENTS_BUCKET = "make-c142e950-comment-attachments";

// Create bucket on startup if it doesn't exist (don't block server startup)
if (supabase) {
  (async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((bucket: any) => bucket.name === COMMENT_ATTACHMENTS_BUCKET);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(COMMENT_ATTACHMENTS_BUCKET, {
          public: false,
          fileSizeLimit: 52428800, // 50MB limit
        });
        
        if (error) {
          console.error("Error creating comment attachments bucket:", error);
        } else {
          console.log("✅ Created comment attachments bucket:", COMMENT_ATTACHMENTS_BUCKET);
        }
      } else {
        console.log("✅ Comment attachments bucket already exists:", COMMENT_ATTACHMENTS_BUCKET);
      }
    } catch (error) {
      console.error("Error initializing storage bucket:", error);
    }
  })();
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c142e950/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH & USERS API ====================

// Login endpoint
app.post("/make-server-c142e950/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Get all users
    const users = await kv.getByPrefix("user:");
    
    // Find user by email
    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return c.json({ success: false, error: "Invalid email or password" }, 401);
    }
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
      console.log(`Login failed: Invalid password for email ${email}`);
      return c.json({ success: false, error: "Invalid email or password" }, 401);
    }
    
    if (!user.is_active) {
      console.log(`Login failed: User account is inactive for email ${email}`);
      return c.json({ success: false, error: "Account is inactive" }, 401);
    }
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`Login successful: ${user.email} (${user.department} ${user.role})`);
    
    return c.json({ 
      success: true, 
      data: userWithoutPassword 
    });
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get current user (session check)
app.get("/make-server-c142e950/auth/me", async (c) => {
  try {
    const userId = c.req.query("user_id");
    
    if (!userId) {
      return c.json({ success: false, error: "User ID required" }, 400);
    }
    
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return c.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all users (with optional filters)
app.get("/make-server-c142e950/users", async (c) => {
  try {
    const department = c.req.query("department");
    const role = c.req.query("role");
    const service_type = c.req.query("service_type");
    const operations_role = c.req.query("operations_role");
    
    // Get all users
    let users = await kv.getByPrefix("user:");
    
    // Filter by department if provided
    if (department) {
      users = users.filter((u: any) => u.department === department);
    }
    
    // Filter by role if provided
    if (role) {
      users = users.filter((u: any) => u.role === role);
    }
    
    // Filter by service_type if provided (Operations team assignments)
    if (service_type) {
      users = users.filter((u: any) => u.service_type === service_type);
    }
    
    // Filter by operations_role if provided (Manager, Supervisor, Handler)
    if (operations_role) {
      users = users.filter((u: any) => u.operations_role === operations_role);
    }
    
    // Only return active users
    users = users.filter((u: any) => u.is_active);
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map((u: any) => {
      const { password: _, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
    // Sort by name
    usersWithoutPasswords.sort((a: any, b: any) => 
      a.name.localeCompare(b.name)
    );
    
    console.log(`Fetched ${usersWithoutPasswords.length} users (department: ${department || 'all'}, role: ${role || 'all'}, service_type: ${service_type || 'all'}, operations_role: ${operations_role || 'all'})`);
    
    return c.json({ success: true, data: usersWithoutPasswords });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed initial users (development only - call once to set up test users)
app.post("/make-server-c142e950/users/seed", async (c) => {
  try {
    // First, clear existing users to avoid duplicates
    const existingUsers = await kv.getByPrefix("user:");
    if (existingUsers.length > 0) {
      console.log(`Clearing ${existingUsers.length} existing users before re-seeding...`);
      for (const user of existingUsers) {
        await kv.del(`user:${user.id}`);
      }
    }
    
    const seedUsers = [
      {
        id: "user-bd-rep-001",
        email: "bd.rep@neuron.ph",
        password: "password123", // In production, hash this!
        name: "Juan Dela Cruz",
        department: "Business Development",
        role: "rep",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-bd-manager-001",
        email: "bd.manager@neuron.ph",
        password: "password123",
        name: "Maria Santos",
        department: "Business Development",
        role: "manager",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-pd-rep-001",
        email: "pd.rep@neuron.ph",
        password: "password123",
        name: "Pedro Reyes",
        department: "Pricing",
        role: "rep",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-pd-manager-001",
        email: "pd.manager@neuron.ph",
        password: "password123",
        name: "Ana Garcia",
        department: "Pricing",
        role: "manager",
        created_at: new Date().toISOString(),
        is_active: true
      },
      // ===== FORWARDING TEAM =====
      {
        id: "user-ops-fwd-manager-001",
        email: "fwd.manager@neuron.ph",
        password: "password123",
        name: "Carlos Mendoza",
        department: "Operations",
        role: "manager",
        service_type: "Forwarding",
        operations_role: "Manager",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-fwd-supervisor-001",
        email: "fwd.supervisor1@neuron.ph",
        password: "password123",
        name: "Maria Santos",
        department: "Operations",
        role: "rep",
        service_type: "Forwarding",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-fwd-supervisor-002",
        email: "fwd.supervisor2@neuron.ph",
        password: "password123",
        name: "Ricardo Cruz",
        department: "Operations",
        role: "rep",
        service_type: "Forwarding",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-fwd-handler-001",
        email: "fwd.handler1@neuron.ph",
        password: "password123",
        name: "Juan Dela Cruz",
        department: "Operations",
        role: "rep",
        service_type: "Forwarding",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-fwd-handler-002",
        email: "fwd.handler2@neuron.ph",
        password: "password123",
        name: "Anna Reyes",
        department: "Operations",
        role: "rep",
        service_type: "Forwarding",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-fwd-handler-003",
        email: "fwd.handler3@neuron.ph",
        password: "password123",
        name: "Miguel Torres",
        department: "Operations",
        role: "rep",
        service_type: "Forwarding",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      // ===== BROKERAGE TEAM =====
      {
        id: "user-ops-brk-manager-001",
        email: "brk.manager@neuron.ph",
        password: "password123",
        name: "Linda Villanueva",
        department: "Operations",
        role: "manager",
        service_type: "Brokerage",
        operations_role: "Manager",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-brk-supervisor-001",
        email: "brk.supervisor1@neuron.ph",
        password: "password123",
        name: "Roberto Gonzales",
        department: "Operations",
        role: "rep",
        service_type: "Brokerage",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-brk-supervisor-002",
        email: "brk.supervisor2@neuron.ph",
        password: "password123",
        name: "Elena Martinez",
        department: "Operations",
        role: "rep",
        service_type: "Brokerage",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-brk-handler-001",
        email: "brk.handler1@neuron.ph",
        password: "password123",
        name: "Paolo Fernandez",
        department: "Operations",
        role: "rep",
        service_type: "Brokerage",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-brk-handler-002",
        email: "brk.handler2@neuron.ph",
        password: "password123",
        name: "Cristina Lopez",
        department: "Operations",
        role: "rep",
        service_type: "Brokerage",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-brk-handler-003",
        email: "brk.handler3@neuron.ph",
        password: "password123",
        name: "Daniel Ramos",
        department: "Operations",
        role: "rep",
        service_type: "Brokerage",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      // ===== TRUCKING TEAM =====
      {
        id: "user-ops-trk-manager-001",
        email: "trk.manager@neuron.ph",
        password: "password123",
        name: "Antonio Dela Rosa",
        department: "Operations",
        role: "manager",
        service_type: "Trucking",
        operations_role: "Manager",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-trk-supervisor-001",
        email: "trk.supervisor1@neuron.ph",
        password: "password123",
        name: "Josephine Garcia",
        department: "Operations",
        role: "rep",
        service_type: "Trucking",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-trk-supervisor-002",
        email: "trk.supervisor2@neuron.ph",
        password: "password123",
        name: "Ramon Vasquez",
        department: "Operations",
        role: "rep",
        service_type: "Trucking",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-trk-handler-001",
        email: "trk.handler1@neuron.ph",
        password: "password123",
        name: "Benjamin Santos",
        department: "Operations",
        role: "rep",
        service_type: "Trucking",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-trk-handler-002",
        email: "trk.handler2@neuron.ph",
        password: "password123",
        name: "Isabella Cruz",
        department: "Operations",
        role: "rep",
        service_type: "Trucking",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-trk-handler-003",
        email: "trk.handler3@neuron.ph",
        password: "password123",
        name: "Gabriel Morales",
        department: "Operations",
        role: "rep",
        service_type: "Trucking",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      // ===== MARINE INSURANCE TEAM =====
      {
        id: "user-ops-mar-manager-001",
        email: "mar.manager@neuron.ph",
        password: "password123",
        name: "Patricia Alvarez",
        department: "Operations",
        role: "manager",
        service_type: "Marine Insurance",
        operations_role: "Manager",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-mar-supervisor-001",
        email: "mar.supervisor1@neuron.ph",
        password: "password123",
        name: "Fernando Aquino",
        department: "Operations",
        role: "rep",
        service_type: "Marine Insurance",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-mar-supervisor-002",
        email: "mar.supervisor2@neuron.ph",
        password: "password123",
        name: "Sandra Flores",
        department: "Operations",
        role: "rep",
        service_type: "Marine Insurance",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-mar-handler-001",
        email: "mar.handler1@neuron.ph",
        password: "password123",
        name: "Luis Mendez",
        department: "Operations",
        role: "rep",
        service_type: "Marine Insurance",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-mar-handler-002",
        email: "mar.handler2@neuron.ph",
        password: "password123",
        name: "Carmen Rivera",
        department: "Operations",
        role: "rep",
        service_type: "Marine Insurance",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-mar-handler-003",
        email: "mar.handler3@neuron.ph",
        password: "password123",
        name: "Oscar Diaz",
        department: "Operations",
        role: "rep",
        service_type: "Marine Insurance",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      // ===== OTHERS TEAM =====
      {
        id: "user-ops-oth-manager-001",
        email: "oth.manager@neuron.ph",
        password: "password123",
        name: "Victoria Castro",
        department: "Operations",
        role: "manager",
        service_type: "Others",
        operations_role: "Manager",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-oth-supervisor-001",
        email: "oth.supervisor1@neuron.ph",
        password: "password123",
        name: "Rodrigo Salazar",
        department: "Operations",
        role: "rep",
        service_type: "Others",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-oth-supervisor-002",
        email: "oth.supervisor2@neuron.ph",
        password: "password123",
        name: "Margarita Herrera",
        department: "Operations",
        role: "rep",
        service_type: "Others",
        operations_role: "Supervisor",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-oth-handler-001",
        email: "oth.handler1@neuron.ph",
        password: "password123",
        name: "Alfredo Jimenez",
        department: "Operations",
        role: "rep",
        service_type: "Others",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-oth-handler-002",
        email: "oth.handler2@neuron.ph",
        password: "password123",
        name: "Teresa Castillo",
        department: "Operations",
        role: "rep",
        service_type: "Others",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-ops-oth-handler-003",
        email: "oth.handler3@neuron.ph",
        password: "password123",
        name: "Francisco Navarro",
        department: "Operations",
        role: "rep",
        service_type: "Others",
        operations_role: "Handler",
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "user-exec-001",
        email: "executive@neuron.ph",
        password: "password123",
        name: "Sofia Rodriguez",
        department: "Executive",
        role: "director",
        created_at: new Date().toISOString(),
        is_active: true
      }
    ];
    
    // Save each user to KV store
    for (const user of seedUsers) {
      await kv.set(`user:${user.id}`, user);
      console.log(`Seeded user: ${user.email} (${user.department} ${user.role})`);
    }
    
    return c.json({ 
      success: true, 
      message: `Seeded ${seedUsers.length} users successfully`,
      summary: {
        users: seedUsers.length
      },
      users: seedUsers.map(u => ({ email: u.email, department: u.department, role: u.role }))
    });
  } catch (error) {
    console.error("Error seeding users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed client handler preferences (development only)
app.post("/make-server-c142e950/client-handler-preferences/seed", async (c) => {
  try {
    // Clear existing preferences
    const existingPrefs = await kv.getByPrefix("client-handler-preference:");
    if (existingPrefs.length > 0) {
      console.log(`Clearing ${existingPrefs.length} existing preferences before re-seeding...`);
      for (const pref of existingPrefs) {
        await kv.del(`client-handler-preference:${pref.id}`);
      }
    }
    
    const now = new Date().toISOString();
    
    const seedPreferences = [
      {
        id: "pref-001",
        customer_id: "CUST-001", // Pacific Electronics Manufacturing Corp.
        service_type: "Forwarding",
        preferred_manager_id: "user-ops-fwd-manager-001",
        preferred_manager_name: "Carlos Mendoza",
        preferred_supervisor_id: "user-ops-fwd-supervisor-001",
        preferred_supervisor_name: "Maria Santos",
        preferred_handler_id: "user-ops-fwd-handler-001",
        preferred_handler_name: "Juan Dela Cruz",
        created_at: now,
        updated_at: now
      },
      {
        id: "pref-002",
        customer_id: "CUST-002", // Manila Fashion Distributors Inc.
        service_type: "Brokerage",
        preferred_manager_id: "user-ops-brk-manager-001",
        preferred_manager_name: "Linda Villanueva",
        preferred_supervisor_id: "user-ops-brk-supervisor-001",
        preferred_supervisor_name: "Roberto Gonzales",
        preferred_handler_id: "user-ops-brk-handler-002",
        preferred_handler_name: "Cristina Lopez",
        created_at: now,
        updated_at: now
      },
      {
        id: "pref-003",
        customer_id: "CUST-003", // Cebu Food Products Corporation
        service_type: "Forwarding",
        preferred_manager_id: "user-ops-fwd-manager-001",
        preferred_manager_name: "Carlos Mendoza",
        preferred_supervisor_id: "user-ops-fwd-supervisor-002",
        preferred_supervisor_name: "Ricardo Cruz",
        preferred_handler_id: "user-ops-fwd-handler-002",
        preferred_handler_name: "Anna Reyes",
        created_at: now,
        updated_at: now
      },
      {
        id: "pref-004",
        customer_id: "CUST-004", // AutoParts Solutions Philippines
        service_type: "Trucking",
        preferred_manager_id: "user-ops-trk-manager-001",
        preferred_manager_name: "Antonio Dela Rosa",
        preferred_supervisor_id: "user-ops-trk-supervisor-001",
        preferred_supervisor_name: "Josephine Garcia",
        preferred_handler_id: "user-ops-trk-handler-001",
        preferred_handler_name: "Benjamin Santos",
        created_at: now,
        updated_at: now
      },
      {
        id: "pref-005",
        customer_id: "CUST-005", // BuildRight Construction Supplies
        service_type: "Forwarding",
        preferred_manager_id: "user-ops-fwd-manager-001",
        preferred_manager_name: "Carlos Mendoza",
        preferred_supervisor_id: "user-ops-fwd-supervisor-001",
        preferred_supervisor_name: "Maria Santos",
        preferred_handler_id: "user-ops-fwd-handler-003",
        preferred_handler_name: "Miguel Torres",
        created_at: now,
        updated_at: now
      },
      {
        id: "pref-006",
        customer_id: "CUST-006", // MedSupply Pharmaceuticals Inc.
        service_type: "Marine Insurance",
        preferred_manager_id: "user-ops-mar-manager-001",
        preferred_manager_name: "Patricia Alvarez",
        preferred_supervisor_id: "user-ops-mar-supervisor-001",
        preferred_supervisor_name: "Fernando Aquino",
        preferred_handler_id: "user-ops-mar-handler-001",
        preferred_handler_name: "Luis Mendez",
        created_at: now,
        updated_at: now
      },
      {
        id: "pref-007",
        customer_id: "CUST-001", // Pacific Electronics - Brokerage service
        service_type: "Brokerage",
        preferred_manager_id: "user-ops-brk-manager-001",
        preferred_manager_name: "Linda Villanueva",
        preferred_supervisor_id: "user-ops-brk-supervisor-002",
        preferred_supervisor_name: "Elena Martinez",
        preferred_handler_id: "user-ops-brk-handler-001",
        preferred_handler_name: "Paolo Fernandez",
        created_at: now,
        updated_at: now
      },
      {
        id: "pref-008",
        customer_id: "CUST-002", // Manila Fashion - Trucking service
        service_type: "Trucking",
        preferred_manager_id: "user-ops-trk-manager-001",
        preferred_manager_name: "Antonio Dela Rosa",
        preferred_supervisor_id: "user-ops-trk-supervisor-002",
        preferred_supervisor_name: "Ramon Vasquez",
        preferred_handler_id: "user-ops-trk-handler-002",
        preferred_handler_name: "Isabella Cruz",
        created_at: now,
        updated_at: now
      }
    ];
    
    // Save each preference to KV store
    for (const pref of seedPreferences) {
      await kv.set(`client-handler-preference:${pref.id}`, pref);
      console.log(`Seeded handler preference: ${pref.customer_id} - ${pref.service_type}`);
    }
    
    return c.json({ 
      success: true, 
      message: `Seeded ${seedPreferences.length} client handler preferences successfully`,
      count: seedPreferences.length
    });
  } catch (error) {
    console.error("Error seeding client handler preferences:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear all users (development only - for resetting test data)
app.delete("/make-server-c142e950/auth/clear-users", async (c) => {
  try {
    const allUsers = await kv.getByPrefix("user:");
    
    // Delete each user
    for (const user of allUsers) {
      await kv.del(`user:${user.id}`);
      console.log(`Deleted user: ${user.email}`);
    }
    
    return c.json({ 
      success: true, 
      message: `Cleared ${allUsers.length} users successfully` 
    });
  } catch (error) {
    console.error("Error clearing users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CLIENT HANDLER PREFERENCES API ====================

// Create or update a client handler preference
app.post("/make-server-c142e950/client-handler-preferences", async (c) => {
  try {
    const body = await c.req.json();
    const { customer_id, service_type, preferred_manager_id, preferred_manager_name, preferred_supervisor_id, preferred_supervisor_name, preferred_handler_id, preferred_handler_name } = body;
    
    // Validate required fields
    if (!customer_id || !service_type || !preferred_manager_id || !preferred_supervisor_id || !preferred_handler_id) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }
    
    // Check if preference already exists
    const existingPreferences = await kv.getByPrefix("client-handler-preference:");
    const existing = existingPreferences.find((p: any) => 
      p.customer_id === customer_id && p.service_type === service_type
    );
    
    const now = new Date().toISOString();
    const preferenceId = existing?.id || `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const preference = {
      id: preferenceId,
      customer_id,
      service_type,
      preferred_manager_id,
      preferred_manager_name,
      preferred_supervisor_id,
      preferred_supervisor_name,
      preferred_handler_id,
      preferred_handler_name,
      created_at: existing?.created_at || now,
      updated_at: now
    };
    
    await kv.set(`client-handler-preference:${preferenceId}`, preference);
    
    console.log(`${existing ? 'Updated' : 'Created'} handler preference for customer ${customer_id}, service ${service_type}`);
    
    return c.json({ success: true, data: preference });
  } catch (error) {
    console.error("Error saving client handler preference:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific client handler preference
app.get("/make-server-c142e950/client-handler-preferences/:customer_id/:service_type", async (c) => {
  try {
    const customer_id = c.req.param("customer_id");
    const service_type = c.req.param("service_type");
    
    const preferences = await kv.getByPrefix("client-handler-preference:");
    const preference = preferences.find((p: any) => 
      p.customer_id === customer_id && p.service_type === service_type
    );
    
    if (!preference) {
      return c.json({ success: true, data: null });
    }
    
    console.log(`Found handler preference for customer ${customer_id}, service ${service_type}`);
    
    return c.json({ success: true, data: preference });
  } catch (error) {
    console.error("Error fetching client handler preference:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all client handler preferences (admin only)
app.get("/make-server-c142e950/client-handler-preferences", async (c) => {
  try {
    const preferences = await kv.getByPrefix("client-handler-preference:");
    
    // Sort by customer_id
    preferences.sort((a: any, b: any) => a.customer_id.localeCompare(b.customer_id));
    
    console.log(`Fetched ${preferences.length} handler preferences`);
    
    return c.json({ success: true, data: preferences });
  } catch (error) {
    console.error("Error fetching client handler preferences:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a client handler preference
app.delete("/make-server-c142e950/client-handler-preferences/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    await kv.del(`client-handler-preference:${id}`);
    
    console.log(`Deleted handler preference: ${id}`);
    
    return c.json({ success: true, message: "Preference deleted successfully" });
  } catch (error) {
    console.error("Error deleting client handler preference:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== TICKET TYPES API ====================

// Seed ticket types (auto-run on startup if none exist)
app.post("/make-server-c142e950/ticket-types/seed", async (c) => {
  try {
    // Check if ticket types already exist
    const existingTypes = await kv.getByPrefix("ticket_type:");
    
    if (existingTypes.length > 0) {
      console.log(`Ticket types already exist (${existingTypes.length}). Skipping seed.`);
      return c.json({ 
        success: true, 
        message: `${existingTypes.length} ticket types already exist`,
        data: existingTypes 
      });
    }
    
    const ticketTypes = [
      {
        id: "QUOTATION_PRICING",
        name: "Quotation Pricing Request",
        description: "Request pricing for a customer quotation",
        default_from_department: "Business Development",
        default_to_department: "Pricing",
        default_due_hours: 24,
        created_at: new Date().toISOString()
      },
      {
        id: "QUOTATION_REVISION",
        name: "Quotation Revision",
        description: "Customer requested changes to existing quotation pricing",
        default_from_department: "Business Development",
        default_to_department: "Pricing",
        default_due_hours: 12,
        created_at: new Date().toISOString()
      },
      {
        id: "CUSTOMER_CLARIFICATION",
        name: "Customer Clarification Needed",
        description: "Need additional information or clarification from customer",
        default_from_department: "Pricing",
        default_to_department: "Business Development",
        default_due_hours: 24,
        created_at: new Date().toISOString()
      },
      {
        id: "DOCUMENT_REQUEST",
        name: "Document Request",
        description: "Request missing or additional documents",
        default_from_department: "Pricing",
        default_to_department: "Business Development",
        default_due_hours: 48,
        created_at: new Date().toISOString()
      },
      {
        id: "URGENT_ISSUE",
        name: "Urgent Issue",
        description: "Critical issue requiring immediate attention",
        default_from_department: null,
        default_to_department: null,
        default_due_hours: 4,
        created_at: new Date().toISOString()
      },
      {
        id: "GENERAL_REQUEST",
        name: "General Request",
        description: "General request or question between departments",
        default_from_department: null,
        default_to_department: null,
        default_due_hours: 48,
        created_at: new Date().toISOString()
      }
    ];
    
    // Save each ticket type
    for (const ticketType of ticketTypes) {
      await kv.set(`ticket_type:${ticketType.id}`, ticketType);
      console.log(`Seeded ticket type: ${ticketType.id}`);
    }
    
    return c.json({ 
      success: true, 
      message: `Seeded ${ticketTypes.length} ticket types successfully`,
      data: ticketTypes
    });
  } catch (error) {
    console.error("Error seeding ticket types:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all ticket types
app.get("/make-server-c142e950/ticket-types", async (c) => {
  try {
    const ticketTypes = await kv.getByPrefix("ticket_type:");
    
    // Sort by name
    ticketTypes.sort((a: any, b: any) => a.name.localeCompare(b.name));
    
    return c.json({ success: true, data: ticketTypes });
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== TICKETS API ====================

// Create a new ticket
app.post("/make-server-c142e950/tickets", async (c) => {
  try {
    const ticket = await c.req.json();
    
    // Generate department-based sequential ticket ID
    if (!ticket.id) {
      // Get department prefix (first 2-3 letters)
      const deptMap: Record<string, string> = {
        "Business Development": "BD",
        "Pricing": "PRC",
        "Operations": "OPS",
        "Finance": "FIN",
        "Executive": "EXEC",
        "Administration": "ADM"
      };
      
      const deptPrefix = deptMap[ticket.from_department] || "GEN";
      
      // Get the current counter for this department
      const counterKey = `ticket_counter:${deptPrefix}`;
      let counter = await kv.get(counterKey);
      
      if (!counter) {
        counter = { value: 0 };
      }
      
      // Increment counter
      counter.value += 1;
      
      // Save updated counter
      await kv.set(counterKey, counter);
      
      // Generate ID: DEPT-0001, DEPT-0042, etc.
      const sequenceNumber = counter.value.toString().padStart(4, '0');
      ticket.id = `${deptPrefix}-${sequenceNumber}`;
    }
    
    // Set timestamps
    ticket.created_at = new Date().toISOString();
    ticket.updated_at = new Date().toISOString();
    
    // Set default status and priority if not provided
    if (!ticket.status) {
      ticket.status = "Open";
    }
    if (!ticket.priority) {
      ticket.priority = "Normal";
    }
    
    // Calculate due date based on ticket type if not provided
    if (!ticket.due_date && ticket.ticket_type) {
      const ticketType = await kv.get(`ticket_type:${ticket.ticket_type}`);
      if (ticketType && ticketType.default_due_hours) {
        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + ticketType.default_due_hours);
        ticket.due_date = dueDate.toISOString();
      }
    }
    
    // Initialize null fields for assignment
    ticket.assigned_to = ticket.assigned_to || null;
    ticket.assigned_to_name = ticket.assigned_to_name || null;
    ticket.assigned_at = ticket.assigned_at || null;
    ticket.resolved_at = null;
    ticket.closed_at = null;
    
    // Handle linked entity fields (optional)
    ticket.linked_entity_type = ticket.linked_entity_type || null;
    ticket.linked_entity_id = ticket.linked_entity_id || null;
    ticket.linked_entity_name = ticket.linked_entity_name || null;
    ticket.linked_entity_status = ticket.linked_entity_status || null;
    
    // Save to KV store
    await kv.set(`ticket:${ticket.id}`, ticket);
    
    // Log activity: ticket created
    await logTicketActivity(
      ticket.id,
      "ticket_created",
      ticket.created_by,
      ticket.created_by_name,
      ticket.from_department,
      null,
      null,
      { 
        subject: ticket.subject,
        priority: ticket.priority,
        to_department: ticket.to_department
      }
    );
    
    console.log(`Created ticket: ${ticket.id} - ${ticket.subject} (${ticket.from_department} → ${ticket.to_department})${ticket.linked_entity_type ? ` [Linked to ${ticket.linked_entity_type}: ${ticket.linked_entity_id}]` : ''}`);
    
    return c.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all tickets with role-based filtering
app.get("/make-server-c142e950/tickets", async (c) => {
  try {
    const user_id = c.req.query("user_id");
    const role = c.req.query("role"); // rep, manager, director
    const department = c.req.query("department");
    const status = c.req.query("status");
    const priority = c.req.query("priority");
    const search = c.req.query("search");
    
    // Get all tickets
    let tickets = await kv.getByPrefix("ticket:");
    
    // Apply role-based filtering
    if (role === "rep") {
      // Reps see: tickets assigned to them + tickets they created
      tickets = tickets.filter((t: any) => 
        t.assigned_to === user_id || t.created_by === user_id
      );
    } else if (role === "manager") {
      // Managers see: all tickets in their department (to_department)
      tickets = tickets.filter((t: any) => 
        t.to_department === department || t.from_department === department
      );
    } else if (role === "director") {
      // Directors see all tickets
      // No filtering needed
    }
    
    // Apply additional filters
    if (status) {
      tickets = tickets.filter((t: any) => t.status === status);
    }
    
    if (priority) {
      tickets = tickets.filter((t: any) => t.priority === priority);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      tickets = tickets.filter((t: any) => 
        t.id?.toLowerCase().includes(searchLower) ||
        t.subject?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created_at descending (newest first)
    tickets.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`Fetched ${tickets.length} tickets for user ${user_id} (${role} in ${department})`);
    
    return c.json({ success: true, data: tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single ticket by ID with comments
app.get("/make-server-c142e950/tickets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const ticket = await kv.get(`ticket:${id}`);
    
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    // Get all comments for this ticket
    const allComments = await kv.getByPrefix(`ticket_comment:${id}:`);
    
    // Sort comments by created_at ascending (oldest first)
    allComments.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return c.json({ 
      success: true, 
      data: {
        ...ticket,
        comments: allComments
      }
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update ticket status
app.patch("/make-server-c142e950/tickets/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status, user_id, user_name, user_department } = await c.req.json();
    
    const ticket = await kv.get(`ticket:${id}`);
    
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updated_at = new Date().toISOString();
    
    // Set resolved_at when status changes to Resolved
    if (status === "Resolved" && oldStatus !== "Resolved") {
      ticket.resolved_at = new Date().toISOString();
    }
    
    // Set closed_at when status changes to Closed
    if (status === "Closed" && oldStatus !== "Closed") {
      ticket.closed_at = new Date().toISOString();
    }
    
    await kv.set(`ticket:${id}`, ticket);
    
    // Log activity: status changed
    if (user_id && user_name && user_department && oldStatus !== status) {
      await logTicketActivity(
        id,
        "status_changed",
        user_id,
        user_name,
        user_department,
        oldStatus,
        status
      );
    }
    
    console.log(`Updated ticket ${id} status: ${oldStatus} → ${status}`);
    
    return c.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update ticket priority
app.patch("/make-server-c142e950/tickets/:id/priority", async (c) => {
  try {
    const id = c.req.param("id");
    const { priority } = await c.req.json();
    
    const ticket = await kv.get(`ticket:${id}`);
    
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    ticket.priority = priority;
    ticket.updated_at = new Date().toISOString();
    
    await kv.set(`ticket:${id}`, ticket);
    
    console.log(`Updated ticket ${id} priority to: ${priority}`);
    
    return c.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error updating ticket priority:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Assign ticket to user
app.patch("/make-server-c142e950/tickets/:id/assign", async (c) => {
  try {
    const id = c.req.param("id");
    const { assigned_to, assigned_to_name } = await c.req.json();
    
    const ticket = await kv.get(`ticket:${id}`);
    
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    ticket.assigned_to = assigned_to;
    ticket.assigned_to_name = assigned_to_name;
    ticket.assigned_at = new Date().toISOString();
    ticket.updated_at = new Date().toISOString();
    
    // Auto-update status to Assigned if currently Open
    if (ticket.status === "Open") {
      ticket.status = "Assigned";
    }
    
    await kv.set(`ticket:${id}`, ticket);
    
    console.log(`Assigned ticket ${id} to: ${assigned_to_name} (${assigned_to})`);
    
    return c.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update ticket due date
app.patch("/make-server-c142e950/tickets/:id/due-date", async (c) => {
  try {
    const id = c.req.param("id");
    const { due_date } = await c.req.json();
    
    const ticket = await kv.get(`ticket:${id}`);
    
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    ticket.due_date = due_date;
    ticket.updated_at = new Date().toISOString();
    
    await kv.set(`ticket:${id}`, ticket);
    
    console.log(`Updated ticket ${id} due date to: ${due_date}`);
    
    return c.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error updating ticket due date:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete ticket
app.delete("/make-server-c142e950/tickets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Delete the ticket
    await kv.del(`ticket:${id}`);
    
    // Delete all comments for this ticket
    const comments = await kv.getByPrefix(`ticket_comment:${id}:`);
    for (const comment of comments) {
      await kv.del(`ticket_comment:${id}:${comment.id}`);
    }
    
    console.log(`Deleted ticket: ${id} and ${comments.length} comments`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== TICKET COMMENTS API ====================

// Generic activity logger for all system activities (dual storage)
async function logActivity(
  entity_type: string,
  entity_id: string,
  entity_name: string,
  action_type: string,
  user_id: string,
  user_name: string,
  user_department: string,
  old_value: string | null = null,
  new_value: string | null = null,
  metadata: any = {}
) {
  try {
    const timestamp = Date.now();
    const activity_id = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    const activity = {
      id: activity_id,
      entity_type,
      entity_id,
      entity_name,
      action_type,
      user_id,
      user_name,
      user_department,
      old_value,
      new_value,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    // Write to global activity log (for system-wide view)
    await kv.set(`activity_log:${timestamp}:${activity_id}`, activity);
    
    // Write to entity-specific log (for fast entity queries)
    if (entity_type === "ticket") {
      await kv.set(`ticket_activity:${entity_id}:${activity_id}`, activity);
    } else if (entity_type === "quotation") {
      await kv.set(`quotation_activity:${entity_id}:${activity_id}`, activity);
    } else if (entity_type === "booking") {
      await kv.set(`booking_activity:${entity_id}:${activity_id}`, activity);
    }
    
    console.log(`Activity logged: ${entity_type} ${entity_id} - ${action_type} by ${user_name}`);
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw - activity logging should not break the main flow
  }
}

// Helper function to log ticket activity (wrapper for backward compatibility)
async function logTicketActivity(
  ticket_id: string,
  action_type: string,
  user_id: string,
  user_name: string,
  user_department: string,
  old_value: string | null = null,
  new_value: string | null = null,
  metadata: any = {}
) {
  // Get ticket name for better display
  let ticket_name = ticket_id;
  try {
    const ticket = await kv.get(`ticket:${ticket_id}`);
    if (ticket && ticket.subject) {
      ticket_name = ticket.subject;
    }
  } catch (error) {
    // If we can't get ticket name, just use ID
  }
  
  await logActivity(
    "ticket",
    ticket_id,
    ticket_name,
    action_type,
    user_id,
    user_name,
    user_department,
    old_value,
    new_value,
    metadata
  );
}

// Add comment to ticket
app.post("/make-server-c142e950/tickets/:id/comments", async (c) => {
  try {
    const ticket_id = c.req.param("id");
    const commentData = await c.req.json();
    
    // Verify ticket exists
    const ticket = await kv.get(`ticket:${ticket_id}`);
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    // Generate unique comment ID
    const comment_id = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const comment = {
      id: comment_id,
      ticket_id,
      user_id: commentData.user_id,
      user_name: commentData.user_name,
      user_department: commentData.user_department,
      content: commentData.content,
      created_at: new Date().toISOString()
    };
    
    // Save comment with key: ticket_comment:{ticket_id}:{comment_id}
    await kv.set(`ticket_comment:${ticket_id}:${comment_id}`, comment);
    
    // Update ticket's updated_at timestamp
    ticket.updated_at = new Date().toISOString();
    await kv.set(`ticket:${ticket_id}`, ticket);
    
    // Log activity: comment added
    await logTicketActivity(
      ticket_id,
      "comment_added",
      commentData.user_id,
      commentData.user_name,
      commentData.user_department,
      null,
      null,
      { comment_preview: commentData.content.substring(0, 100) }
    );
    
    console.log(`Added comment ${comment_id} to ticket ${ticket_id} by ${commentData.user_name}`);
    
    return c.json({ success: true, data: comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all comments for a ticket
app.get("/make-server-c142e950/tickets/:id/comments", async (c) => {
  try {
    const ticket_id = c.req.param("id");
    
    // Verify ticket exists
    const ticket = await kv.get(`ticket:${ticket_id}`);
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    // Get all comments for this ticket
    const comments = await kv.getByPrefix(`ticket_comment:${ticket_id}:`);
    
    // Sort by created_at ascending (oldest first)
    comments.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return c.json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get activity log for a ticket with role-based access control
app.get("/make-server-c142e950/tickets/:id/activity", async (c) => {
  try {
    const ticket_id = c.req.param("id");
    const user_role = c.req.query("role");
    const user_department = c.req.query("department");
    
    // Check role-based access
    if (user_role === "rep") {
      return c.json({ 
        success: false, 
        error: "Access denied: Activity log is not available for Employee/Rep roles" 
      }, 403);
    }
    
    // Verify ticket exists
    const ticket = await kv.get(`ticket:${ticket_id}`);
    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    // Get all activities for this ticket
    let activities = await kv.getByPrefix(`ticket_activity:${ticket_id}:`);
    
    // Apply role-based filtering
    if (user_role === "manager") {
      // Managers can only see activities involving their department
      activities = activities.filter((activity: any) => {
        // Show if activity user is from manager's department
        // OR if ticket involves manager's department (from or to)
        return activity.user_department === user_department ||
               ticket.from_department === user_department ||
               ticket.to_department === user_department;
      });
    }
    // Executives see all activities (no filtering needed)
    
    // Sort by timestamp descending (newest first)
    activities.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    console.log(`Fetched ${activities.length} activities for ticket ${ticket_id} (role: ${user_role})`);
    
    return c.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching ticket activities:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== GLOBAL ACTIVITY LOG API ====================

// Get system-wide activity log with role-based access and filters
app.get("/make-server-c142e950/activity-log", async (c) => {
  try {
    const user_role = c.req.query("role");
    const user_department = c.req.query("department");
    const entity_type = c.req.query("entity_type");
    const action_type = c.req.query("action_type");
    const user_id = c.req.query("user_id");
    const date_from = c.req.query("date_from");
    const date_to = c.req.query("date_to");
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 50;
    const offset = c.req.query("offset") ? parseInt(c.req.query("offset")!) : 0;
    
    // Check role-based access
    if (user_role === "rep") {
      return c.json({ 
        success: false, 
        error: "Access denied: Activity log is not available for Employee/Rep roles" 
      }, 403);
    }
    
    // Get all activities from global log
    let activities = await kv.getByPrefix("activity_log:");
    
    console.log(`Found ${activities.length} activities in global log`);
    
    // TEMPORARY: Also fetch from old ticket_activity storage and migrate to global
    // This ensures we don't lose activities created before dual storage was implemented
    const oldTicketActivities = await kv.getByPrefix("ticket_activity:");
    console.log(`Found ${oldTicketActivities.length} old ticket activities to check for migration`);
    
    for (const oldActivity of oldTicketActivities) {
      // Check if this activity already exists in global log by searching for matching ID
      const existsInGlobal = activities.some((a: any) => a.id === oldActivity.id);
      
      if (!existsInGlobal) {
        // Migrate this activity to global log
        const timestamp = new Date(oldActivity.timestamp).getTime();
        const globalKey = `activity_log:${timestamp}:${oldActivity.id}`;
        
        // Add entity_type and entity_name if missing (old format compatibility)
        const migratedActivity = {
          ...oldActivity,
          entity_type: oldActivity.entity_type || "ticket",
          entity_id: oldActivity.entity_id || oldActivity.ticket_id,
          entity_name: oldActivity.entity_name || oldActivity.ticket_id
        };
        
        // Write to global log
        await kv.set(globalKey, migratedActivity);
        
        // Add to activities array for this request
        activities.push(migratedActivity);
        
        console.log(`Migrated activity ${oldActivity.id} to global log`);
      }
    }
    
    console.log(`Total activities after migration: ${activities.length}`);
    
    // Apply role-based filtering
    if (user_role === "manager") {
      // Managers can only see activities from their department
      activities = activities.filter((activity: any) => {
        return activity.user_department === user_department;
      });
    }
    // Executives see all activities (no filtering needed)
    
    // Apply entity_type filter
    if (entity_type && entity_type !== "all") {
      activities = activities.filter((activity: any) => activity.entity_type === entity_type);
    }
    
    // Apply action_type filter
    if (action_type && action_type !== "all") {
      activities = activities.filter((activity: any) => activity.action_type === action_type);
    }
    
    // Apply user_id filter
    if (user_id) {
      activities = activities.filter((activity: any) => activity.user_id === user_id);
    }
    
    // Apply date filters
    if (date_from) {
      const fromDate = new Date(date_from);
      activities = activities.filter((activity: any) => 
        new Date(activity.timestamp) >= fromDate
      );
    }
    
    if (date_to) {
      const toDate = new Date(date_to);
      toDate.setHours(23, 59, 59, 999); // End of day
      activities = activities.filter((activity: any) => 
        new Date(activity.timestamp) <= toDate
      );
    }
    
    // Sort by timestamp descending (newest first)
    activities.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Apply pagination
    const total = activities.length;
    const paginated = activities.slice(offset, offset + limit);
    
    console.log(`Fetched ${paginated.length}/${total} activities for ${user_role} in ${user_department}`);
    
    return c.json({ 
      success: true, 
      data: paginated,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== QUOTATIONS API ====================

// Create a new quotation
app.post("/make-server-c142e950/quotations", async (c) => {
  try {
    const quotation = await c.req.json();
    
    // Generate unique ID if not provided
    if (!quotation.id) {
      quotation.id = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Set timestamps
    quotation.created_at = quotation.created_at || new Date().toISOString();
    quotation.updated_at = new Date().toISOString();
    
    // Set default status if not provided
    if (!quotation.status) {
      quotation.status = "Draft";
    }
    
    // Save to KV store with key: quotation:{id}
    await kv.set(`quotation:${quotation.id}`, quotation);
    
    console.log(`Created quotation: ${quotation.id} with status: ${quotation.status}`);
    
    return c.json({ success: true, data: quotation });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all quotations (with optional status filter)
app.get("/make-server-c142e950/quotations", async (c) => {
  try {
    const status = c.req.query("status");
    const department = c.req.query("department");
    const customer_id = c.req.query("customer_id");
    const contact_id = c.req.query("contact_id");
    const search = c.req.query("search");
    const created_by = c.req.query("created_by");
    const date_from = c.req.query("date_from");
    const date_to = c.req.query("date_to");
    const sort_by = c.req.query("sort_by") || "updated_at"; // updated_at, created_at, quote_number
    const sort_order = c.req.query("sort_order") || "desc"; // asc or desc
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined;
    const offset = c.req.query("offset") ? parseInt(c.req.query("offset")!) : 0;
    
    // Get all quotations with prefix
    const quotations = await kv.getByPrefix("quotation:");
    
    // AUTOMATIC STATUS MIGRATION: Convert old status names to new ones
    // This ensures backward compatibility with quotations created before the status refactor
    const migrateStatus = (oldStatus: string): string => {
      const statusMigrationMap: Record<string, string> = {
        "Quotation": "Priced",           // Old → New
        "Approved": "Accepted by Client", // Old → New
        "Rejected": "Rejected by Client", // Old → New
        // All other statuses remain unchanged
      };
      return statusMigrationMap[oldStatus] || oldStatus;
    };
    
    // Apply status migration to all quotations
    let filtered = quotations.map((q: any) => ({
      ...q,
      status: migrateStatus(q.status)
    }));
    
    // Filter by customer_id if provided
    if (customer_id) {
      filtered = filtered.filter((q: any) => q.customer_id === customer_id);
    }
    
    // Filter by contact_id if provided
    if (contact_id) {
      filtered = filtered.filter((q: any) => q.contact_person_id === contact_id);
    }
    
    // Filter by created_by if provided
    if (created_by) {
      filtered = filtered.filter((q: any) => q.created_by === created_by);
    }
    
    // Filter by date range
    if (date_from) {
      const fromDate = new Date(date_from);
      filtered = filtered.filter((q: any) => 
        new Date(q.created_at) >= fromDate
      );
    }
    
    if (date_to) {
      const toDate = new Date(date_to);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((q: any) => 
        new Date(q.created_at) <= toDate
      );
    }
    
    // Filter by search query (searches quote_number, quotation_name, and customer info)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((q: any) => 
        q.quote_number?.toLowerCase().includes(searchLower) ||
        q.quotation_name?.toLowerCase().includes(searchLower) ||
        q.customer_name?.toLowerCase().includes(searchLower) ||
        q.id?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by status if provided
    if (status) {
      filtered = filtered.filter((q: any) => q.status === status);
    }
    
    // NOTE: Department-based visibility filtering has been removed
    // The frontend now handles all tab filtering logic for better flexibility
    // This allows the frontend to control what quotations appear in which tabs
    // based on the two-layer status system (business view + technical workflow)
    
    // Get total count before pagination
    const total = filtered.length;
    
    // Sort
    filtered.sort((a: any, b: any) => {
      let aVal, bVal;
      
      switch (sort_by) {
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case "quote_number":
          aVal = a.quote_number || "";
          bVal = b.quote_number || "";
          break;
        case "updated_at":
        default:
          aVal = new Date(a.updated_at).getTime();
          bVal = new Date(b.updated_at).getTime();
          break;
      }
      
      if (sort_order === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    // Apply pagination
    const paginated = limit ? filtered.slice(offset, offset + limit) : filtered;
    
    console.log(`Fetched ${paginated.length}/${total} quotations (offset: ${offset}, limit: ${limit || 'all'}) for department: ${department}, status: ${status}, search: ${search}`);
    
    return c.json({ 
      success: true, 
      data: paginated,
      pagination: {
        total,
        offset,
        limit: limit || total,
        hasMore: limit ? (offset + limit) < total : false
      }
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single quotation by ID
app.get("/make-server-c142e950/quotations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const quotation = await kv.get(`quotation:${id}`);
    
    if (!quotation) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    // Apply status migration for backward compatibility
    const statusMigrationMap: Record<string, string> = {
      "Quotation": "Priced",
      "Approved": "Accepted by Client",
      "Rejected": "Rejected by Client"
    };
    
    if (statusMigrationMap[quotation.status]) {
      quotation.status = statusMigrationMap[quotation.status];
    }
    
    return c.json({ success: true, data: quotation });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update quotation
app.put("/make-server-c142e950/quotations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get existing quotation
    const existing = await kv.get(`quotation:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    // Merge updates
    const updated = {
      ...existing,
      ...updates,
      id, // Preserve ID
      created_at: existing.created_at, // Preserve created_at
      updated_at: new Date().toISOString()
    };
    
    // Save back
    await kv.set(`quotation:${id}`, updated);
    
    console.log(`Updated quotation: ${id}, new status: ${updated.status}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating quotation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit inquiry to pricing (BD → Pricing)
app.post("/make-server-c142e950/quotations/:id/submit", async (c) => {
  try {
    const id = c.req.param("id");
    const quotation = await kv.get(`quotation:${id}`);
    
    if (!quotation) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    // Change status from Draft to Pending Pricing
    quotation.status = "Pending Pricing";
    quotation.submitted_at = new Date().toISOString();
    quotation.updated_at = new Date().toISOString();
    
    await kv.set(`quotation:${id}`, quotation);
    
    console.log(`Submitted quotation ${id} to Pricing`);
    
    return c.json({ success: true, data: quotation });
  } catch (error) {
    console.error("Error submitting quotation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Convert to full quotation (Pricing adds pricing and accepts)
app.post("/make-server-c142e950/quotations/:id/convert", async (c) => {
  try {
    const id = c.req.param("id");
    const pricingData = await c.req.json();
    
    const quotation = await kv.get(`quotation:${id}`);
    
    if (!quotation) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    // Merge pricing data and change status to Quotation (accepted)
    const converted = {
      ...quotation,
      ...pricingData,
      status: "Quotation",
      converted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`quotation:${id}`, converted);
    
    console.log(`Converted quotation ${id} to full Quotation`);
    
    return c.json({ success: true, data: converted });
  } catch (error) {
    console.error("Error converting quotation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete quotation
app.delete("/make-server-c142e950/quotations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    await kv.del(`quotation:${id}`);
    
    console.log(`Deleted quotation: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Migrate quotation statuses (one-time migration from old status names to new)
app.post("/make-server-c142e950/quotations/migrate-statuses", async (c) => {
  try {
    const quotations = await kv.getByPrefix("quotation:");
    
    const statusMigrationMap: Record<string, string> = {
      "Quotation": "Priced",
      "Approved": "Accepted by Client",
      "Rejected": "Rejected by Client"
    };
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const quotation of quotations) {
      const oldStatus = quotation.status;
      const newStatus = statusMigrationMap[oldStatus];
      
      if (newStatus) {
        quotation.status = newStatus;
        quotation.updated_at = new Date().toISOString();
        await kv.set(`quotation:${quotation.id}`, quotation);
        console.log(`Migrated quotation ${quotation.id}: "${oldStatus}" → "${newStatus}"`);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`Migration complete: ${migratedCount} quotations migrated, ${skippedCount} skipped`);
    
    return c.json({ 
      success: true, 
      message: `Migration complete: ${migratedCount} quotations migrated, ${skippedCount} skipped`,
      migrated: migratedCount,
      skipped: skippedCount
    });
  } catch (error) {
    console.error("Error migrating quotation statuses:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update quotation status (for BD workflow: Sent to Client, Approved, Rejected, etc.)
app.patch("/make-server-c142e950/quotations/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status, user_id, user_name, user_department, sent_to_client_at } = await c.req.json();
    
    const quotation = await kv.get(`quotation:${id}`);
    
    if (!quotation) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    const oldStatus = quotation.status;
    quotation.status = status;
    quotation.updated_at = new Date().toISOString();
    
    // Track when sent to client (for expiration calculation)
    if (status === "Sent to Client" && sent_to_client_at) {
      quotation.sent_to_client_at = sent_to_client_at;
      
      // Calculate expiration date based on validity_period
      if (quotation.validity_period) {
        const validityDays = parseInt(quotation.validity_period);
        if (!isNaN(validityDays)) {
          const expiresAt = new Date(sent_to_client_at);
          expiresAt.setDate(expiresAt.getDate() + validityDays);
          quotation.expires_at = expiresAt.toISOString();
        }
      }
    }
    
    // Track when client approved/rejected
    if (status === "Accepted by Client") {
      quotation.client_accepted_at = new Date().toISOString();
    } else if (status === "Rejected by Client") {
      quotation.client_rejected_at = new Date().toISOString();
    }
    
    await kv.set(`quotation:${id}`, quotation);
    
    // Log activity
    if (user_id && user_name && user_department && oldStatus !== status) {
      await logActivity(
        "quotation",
        id,
        quotation.quote_number || quotation.quotation_name || id,
        "status_changed",
        user_id,
        user_name,
        user_department,
        oldStatus,
        status
      );
    }
    
    console.log(`Updated quotation ${id} status: ${oldStatus} → ${status}`);
    
    return c.json({ success: true, data: quotation });
  } catch (error) {
    console.error("Error updating quotation status:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new version of quotation (for client-requested revisions)
app.post("/make-server-c142e950/quotations/:id/revise", async (c) => {
  try {
    const id = c.req.param("id");
    const { revision_reason, user_id, user_name, user_department } = await c.req.json();
    
    const quotation = await kv.get(`quotation:${id}`);
    
    if (!quotation) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    // Initialize version control if not already present
    if (!quotation.current_version) {
      quotation.current_version = 1;
      quotation.versions = [{
        version: 1,
        created_at: quotation.created_at,
        created_by_user_id: quotation.created_by,
        created_by_user_name: user_name,
        charge_categories: quotation.charge_categories,
        financial_summary: quotation.financial_summary,
        sent_to_client_at: quotation.sent_to_client_at,
        revision_reason: "Initial quotation"
      }];
    }
    
    // Mark quotation as needing revision
    quotation.status = "Needs Revision";
    quotation.revision_requested_at = new Date().toISOString();
    quotation.pending_revision_reason = revision_reason;
    quotation.updated_at = new Date().toISOString();
    
    await kv.set(`quotation:${id}`, quotation);
    
    // Log activity
    if (user_id && user_name && user_department) {
      await logActivity(
        "quotation",
        id,
        quotation.quote_number || quotation.quotation_name || id,
        "revision_requested",
        user_id,
        user_name,
        user_department,
        null,
        null,
        { revision_reason }
      );
    }
    
    console.log(`Quotation ${id} marked for revision: ${revision_reason}`);
    
    return c.json({ success: true, data: quotation });
  } catch (error) {
    console.error("Error requesting quotation revision:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PROJECTS API ====================

// Accept quotation and create project in one atomic operation
app.post("/make-server-c142e950/quotations/:id/accept-and-create-project", async (c) => {
  try {
    const quotation_id = c.req.param("id");
    const { bd_owner_user_id, bd_owner_user_name, ops_assigned_user_id, ops_assigned_user_name, special_instructions } = await c.req.json();
    
    // Get quotation
    const quotation = await kv.get(`quotation:${quotation_id}`);
    
    if (!quotation) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    // Verify quotation is in correct status
    if (quotation.status !== "Accepted by Client") {
      return c.json({ success: false, error: "Can only create projects from quotations with 'Accepted by Client' status" }, 400);
    }
    
    // Check if project already exists for this quotation
    if (quotation.project_id) {
      return c.json({ success: false, error: "Project already exists for this quotation" }, 400);
    }
    
    // Debug: Log services metadata from quotation
    console.log(`Quotation ${quotation.quote_number} has ${quotation.services_metadata?.length || 0} service specifications`);
    if (quotation.services_metadata && quotation.services_metadata.length > 0) {
      console.log(`  Service types: ${quotation.services_metadata.map((s: any) => s.service_type).join(", ")}`);
      console.log(`  Services metadata:`, JSON.stringify(quotation.services_metadata, null, 2));
    } else {
      console.log(`  WARNING: services_metadata is empty or undefined!`);
      console.log(`  Quotation services array:`, quotation.services);
    }
    
    // Generate project number: PROJ-2025-001
    const year = new Date().getFullYear();
    const counterKey = `project_counter:${year}`;
    let counter = await kv.get(counterKey);
    
    if (!counter) {
      counter = { value: 0 };
    }
    
    counter.value += 1;
    await kv.set(counterKey, counter);
    
    const sequenceNumber = counter.value.toString().padStart(3, '0');
    const project_number = `PROJ-${year}-${sequenceNumber}`;
    
    // Generate unique project ID
    const project_id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create project from quotation data
    const project = {
      id: project_id,
      project_number,
      quotation_id: quotation.id,
      quotation_number: quotation.quote_number,
      quotation_name: quotation.quotation_name,
      
      // Inherit from quotation
      customer_id: quotation.customer_id,
      customer_name: quotation.customer_name,
      contact_person_id: quotation.contact_person_id,
      contact_person_name: quotation.contact_person_name,
      services: quotation.services || [],
      services_metadata: quotation.services_metadata || [],
      charge_categories: quotation.charge_categories || [],
      currency: quotation.currency,
      total: quotation.financial_summary?.grand_total || 0,
      
      // Shipment details
      movement: quotation.movement,
      category: quotation.category,
      pol_aol: quotation.pol_aol,
      pod_aod: quotation.pod_aod,
      commodity: quotation.commodity,
      incoterm: quotation.incoterm,
      carrier: quotation.carrier,
      volume: quotation.volume,
      gross_weight: quotation.gross_weight,
      chargeable_weight: quotation.chargeable_weight,
      dimensions: quotation.dimensions,
      collection_address: quotation.collection_address,
      
      // Project-specific fields (optional)
      shipment_ready_date: null,
      requested_etd: null,
      special_instructions: special_instructions || "",
      
      // Simplified status (Active/Completed)
      status: "Active",
      booking_status: "Not Booked",
      
      // Bidirectional linking
      linkedBookings: [],
      
      // Ownership
      bd_owner_user_id: bd_owner_user_id || quotation.created_by,
      bd_owner_user_name: bd_owner_user_name || "",
      ops_assigned_user_id: ops_assigned_user_id || null,
      ops_assigned_user_name: ops_assigned_user_name || null,
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    };
    
    // Save project
    await kv.set(`project:${project_id}`, project);
    
    // Update quotation: mark as converted and link to project
    quotation.project_id = project_id;
    quotation.project_number = project_number;
    quotation.status = "Converted to Project";
    quotation.converted_to_project_at = new Date().toISOString();
    quotation.updated_at = new Date().toISOString();
    await kv.set(`quotation:${quotation.id}`, quotation);
    
    // Log activity
    if (bd_owner_user_id && bd_owner_user_name) {
      await logActivity(
        "project",
        project_id,
        project_number,
        "project_created",
        bd_owner_user_id,
        bd_owner_user_name,
        "Business Development",
        null,
        null,
        { quotation_id: quotation.id, quotation_number: quotation.quote_number }
      );
    }
    
    console.log(`✓ Accepted quotation ${quotation.quote_number} and created project ${project_number}`);
    console.log(`   Services metadata copied: ${project.services_metadata?.length || 0} services`);
    
    return c.json({ 
      success: true, 
      data: {
        quotation,
        project
      }
    });
  } catch (error) {
    console.error("Error accepting quotation and creating project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new project from approved quotation
app.post("/make-server-c142e950/projects", async (c) => {
  try {
    const projectData = await c.req.json();
    
    // Verify quotation exists and is approved
    const quotation = await kv.get(`quotation:${projectData.quotation_id}`);
    
    if (!quotation) {
      return c.json({ success: false, error: "Quotation not found" }, 404);
    }
    
    if (quotation.status !== "Accepted by Client") {
      return c.json({ success: false, error: "Can only create projects from approved quotations" }, 400);
    }
    
    // Check if project already exists for this quotation
    if (quotation.project_id) {
      return c.json({ success: false, error: "Project already exists for this quotation" }, 400);
    }
    
    // Generate project number: PROJ-2025-001
    const year = new Date().getFullYear();
    const counterKey = `project_counter:${year}`;
    let counter = await kv.get(counterKey);
    
    if (!counter) {
      counter = { value: 0 };
    }
    
    counter.value += 1;
    await kv.set(counterKey, counter);
    
    const sequenceNumber = counter.value.toString().padStart(3, '0');
    const project_number = `PROJ-${year}-${sequenceNumber}`;
    
    // Generate unique project ID
    const project_id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create project from quotation data
    const project = {
      id: project_id,
      project_number,
      quotation_id: quotation.id,
      quotation_number: quotation.quote_number,
      quotation_name: quotation.quotation_name, // ✨ Inherit quotation name
      
      // Inherit from quotation
      customer_id: quotation.customer_id,
      customer_name: quotation.customer_name,
      contact_person_id: quotation.contact_person_id,
      contact_person_name: quotation.contact_person_name,
      services: quotation.services || [],
      services_metadata: quotation.services_metadata || [], // Preserve detailed service specs
      charge_categories: quotation.charge_categories || [],
      currency: quotation.currency,
      total: quotation.financial_summary?.grand_total || 0,
      
      // Shipment details
      movement: quotation.movement,
      category: quotation.category,
      pol_aol: quotation.pol_aol,
      pod_aod: quotation.pod_aod,
      commodity: quotation.commodity,
      incoterm: quotation.incoterm,
      carrier: quotation.carrier,
      volume: quotation.volume,
      gross_weight: quotation.gross_weight,
      chargeable_weight: quotation.chargeable_weight,
      dimensions: quotation.dimensions,
      collection_address: quotation.collection_address,
      
      // Project-specific fields
      shipment_ready_date: projectData.shipment_ready_date || null,
      requested_etd: projectData.requested_etd || null,
      special_instructions: projectData.special_instructions || "",
      
      // Simplified status (Active/Completed)
      status: "Active",
      booking_status: "Not Booked",
      
      // Bidirectional linking
      linkedBookings: [],
      
      // Ownership
      bd_owner_user_id: projectData.bd_owner_user_id || quotation.created_by,
      bd_owner_user_name: projectData.bd_owner_user_name || "",
      ops_assigned_user_id: projectData.ops_assigned_user_id || null,
      ops_assigned_user_name: projectData.ops_assigned_user_name || null,
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    };
    
    // Save project
    await kv.set(`project:${project_id}`, project);
    
    // Update quotation to mark as converted
    quotation.project_id = project_id;
    quotation.status = "Converted to Project";
    quotation.converted_to_project_at = new Date().toISOString();
    quotation.updated_at = new Date().toISOString();
    await kv.set(`quotation:${quotation.id}`, quotation);
    
    // Log activity
    if (projectData.bd_owner_user_id && projectData.bd_owner_user_name) {
      await logActivity(
        "project",
        project_id,
        project_number,
        "project_created",
        projectData.bd_owner_user_id,
        projectData.bd_owner_user_name,
        "Business Development",
        null,
        null,
        { quotation_id: quotation.id, quotation_number: quotation.quote_number }
      );
    }
    
    console.log(`Created project: ${project_number} from quotation ${quotation.quote_number}`);
    
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error("Error creating project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all projects (with filters)
app.get("/make-server-c142e950/projects", async (c) => {
  try {
    const status = c.req.query("status");
    const bd_owner_user_id = c.req.query("bd_owner_user_id");
    const ops_assigned_user_id = c.req.query("ops_assigned_user_id");
    const customer_id = c.req.query("customer_id");
    const search = c.req.query("search");
    
    // Get all projects
    let projects = await kv.getByPrefix("project:");
    
    // Apply filters
    if (status) {
      projects = projects.filter((p: any) => p.status === status);
    }
    
    if (bd_owner_user_id) {
      projects = projects.filter((p: any) => p.bd_owner_user_id === bd_owner_user_id);
    }
    
    if (ops_assigned_user_id) {
      projects = projects.filter((p: any) => p.ops_assigned_user_id === ops_assigned_user_id);
    }
    
    if (customer_id) {
      projects = projects.filter((p: any) => p.customer_id === customer_id);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter((p: any) =>
        p.project_number?.toLowerCase().includes(searchLower) ||
        p.customer_name?.toLowerCase().includes(searchLower) ||
        p.quotation_number?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created_at descending (newest first)
    projects.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`Fetched ${projects.length} projects`);
    
    return c.json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single project by ID
app.get("/make-server-c142e950/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get project by project number (for Operations autofill)
app.get("/make-server-c142e950/projects/by-number/:projectNumber", async (c) => {
  try {
    const projectNumber = c.req.param("projectNumber");
    
    // Get all projects and find by project_number
    const allProjects = await kv.getByPrefix("project:");
    const project = allProjects.find((p: any) => p.project_number === projectNumber);
    
    if (!project) {
      return c.json({ success: false, error: `Project ${projectNumber} not found` }, 404);
    }
    
    console.log(`Fetched project by number: ${projectNumber}`);
    
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error("Error fetching project by number:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update project
app.patch("/make-server-c142e950/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    // Merge updates
    const updated = {
      ...project,
      ...updates,
      id, // Preserve ID
      created_at: project.created_at, // Preserve created_at
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`project:${id}`, updated);
    
    console.log(`Updated project: ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Link booking to project (for bidirectional tracking)
app.post("/make-server-c142e950/projects/:id/link-booking", async (c) => {
  try {
    const id = c.req.param("id");
    const { bookingId, bookingNumber, serviceType, status, createdBy } = await c.req.json();
    
    // Validate required fields
    if (!bookingId || !bookingNumber || !serviceType) {
      return c.json({ 
        success: false, 
        error: "Missing required fields: bookingId, bookingNumber, and serviceType are required" 
      }, 400);
    }
    
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    // Add booking to linkedBookings array
    if (!project.linkedBookings) {
      project.linkedBookings = [];
    }
    
    // Check if already linked (by bookingId)
    const alreadyLinked = project.linkedBookings.some((b: any) => b.bookingId === bookingId);
    if (alreadyLinked) {
      return c.json({ success: true, data: project }); // Already linked, just return success
    }
    
    // VALIDATION: Check if a booking for this service type already exists
    const serviceTypeExists = project.linkedBookings.some((b: any) => b.serviceType === serviceType);
    if (serviceTypeExists) {
      const existingBooking = project.linkedBookings.find((b: any) => b.serviceType === serviceType);
      return c.json({ 
        success: false, 
        error: `A ${serviceType} booking (${existingBooking?.bookingNumber || 'unknown'}) already exists for this project. Only one booking per service type is allowed.`
      }, 400);
    }
    
    project.linkedBookings.push({
      bookingId,
      bookingNumber,
      serviceType,
      status,
      createdAt: new Date().toISOString(),
      createdBy
    });
    
    // Auto-calculate booking_status
    const totalServices = project.services?.length || 0;
    const bookedServices = new Set(project.linkedBookings.map((b: any) => b.serviceType)).size;
    
    if (bookedServices === 0) {
      project.booking_status = "No Bookings Yet";
    } else if (bookedServices >= totalServices) {
      project.booking_status = "Fully Booked";
    } else {
      project.booking_status = "Partially Booked";
    }
    
    project.updated_at = new Date().toISOString();
    await kv.set(`project:${id}`, project);
    
    console.log(`Linked booking ${bookingNumber} to project ${project.project_number} - Status: ${project.booking_status}`);
    
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error("Error linking booking to project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Unlink booking from project
app.post("/make-server-c142e950/projects/:id/unlink-booking", async (c) => {
  try {
    const id = c.req.param("id");
    const { bookingId } = await c.req.json();
    
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    // Remove booking from linkedBookings array
    if (project.linkedBookings) {
      project.linkedBookings = project.linkedBookings.filter((b: any) => b.bookingId !== bookingId);
      
      // Recalculate booking_status
      const totalServices = project.services?.length || 0;
      const bookedServices = new Set(project.linkedBookings.map((b: any) => b.serviceType)).size;
      
      if (bookedServices === 0) {
        project.booking_status = "No Bookings Yet";
      } else if (bookedServices >= totalServices) {
        project.booking_status = "Fully Booked";
      } else {
        project.booking_status = "Partially Booked";
      }
      
      project.updated_at = new Date().toISOString();
      await kv.set(`project:${id}`, project);
      
      console.log(`Unlinked booking ${bookingId} from project ${project.project_number} - Status: ${project.booking_status}`);
    }
    
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error("Error unlinking booking from project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clean up orphaned booking references from project
app.post("/make-server-c142e950/projects/:id/cleanup-orphaned-bookings", async (c) => {
  try {
    const id = c.req.param("id");
    
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    if (!project.linkedBookings || project.linkedBookings.length === 0) {
      return c.json({ 
        success: true, 
        data: project,
        message: "No linked bookings to clean up"
      });
    }
    
    const originalCount = project.linkedBookings.length;
    const verifiedBookings: any[] = [];
    const orphanedBookings: string[] = [];
    
    // Verify each linked booking exists
    for (const booking of project.linkedBookings) {
      const serviceType = booking.serviceType || booking.service;
      let bookingKey = "";
      
      switch (serviceType) {
        case "Forwarding":
          bookingKey = `forwarding_booking:${booking.bookingId}`;
          break;
        case "Brokerage":
          bookingKey = `brokerage_booking:${booking.bookingId}`;
          break;
        case "Trucking":
          bookingKey = `trucking_booking:${booking.bookingId}`;
          break;
        case "Marine Insurance":
          bookingKey = `marine_insurance_booking:${booking.bookingId}`;
          break;
        case "Others":
          bookingKey = `others_booking:${booking.bookingId}`;
          break;
        default:
          console.warn(`Unknown service type: ${serviceType} for booking ${booking.bookingId}`);
          orphanedBookings.push(booking.bookingId);
          continue;
      }
      
      // Check if booking exists
      const existingBooking = await kv.get(bookingKey);
      
      if (existingBooking) {
        verifiedBookings.push(booking);
      } else {
        orphanedBookings.push(booking.bookingId);
        console.log(`🧹 Found orphaned booking reference: ${booking.bookingId}`);
      }
    }
    
    // Update project with only verified bookings
    project.linkedBookings = verifiedBookings;
    
    // Recalculate booking_status
    const totalServices = project.services?.length || 0;
    const bookedServices = new Set(verifiedBookings.map((b: any) => b.serviceType)).size;
    
    if (bookedServices === 0) {
      project.booking_status = "No Bookings Yet";
    } else if (bookedServices >= totalServices) {
      project.booking_status = "Fully Booked";
    } else {
      project.booking_status = "Partially Booked";
    }
    
    project.updated_at = new Date().toISOString();
    await kv.set(`project:${id}`, project);
    
    console.log(
      `✅ Cleaned up project ${project.project_number}: ` +
      `Removed ${orphanedBookings.length} orphaned booking(s), ` +
      `${verifiedBookings.length} valid booking(s) remain. ` +
      `Status: ${project.booking_status}`
    );
    
    return c.json({ 
      success: true, 
      data: project,
      message: `Removed ${orphanedBookings.length} orphaned booking reference(s)`,
      details: {
        originalCount,
        verifiedCount: verifiedBookings.length,
        orphanedCount: orphanedBookings.length,
        orphanedBookings
      }
    });
  } catch (error) {
    console.error("Error cleaning up orphaned bookings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Generate invoice (billing) from project pricing
app.post("/make-server-c142e950/projects/:id/generate-invoice", async (c) => {
  try {
    const projectId = c.req.param("id");
    const { bookingId, bookingType } = await c.req.json();
    
    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    // Check if project has pricing data
    if (!project.charge_categories || project.charge_categories.length === 0) {
      return c.json({ success: false, error: "Project has no pricing data to generate invoice from" }, 400);
    }
    
    // Generate billing ID
    const billingId = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    
    // Convert project charge_categories to billing format
    const chargeCategories = project.charge_categories.map((cat: any) => ({
      categoryName: cat.category_name || cat.name,
      lineItems: (cat.line_items || []).map((item: any) => ({
        description: item.description || "",
        price: item.price || 0,
        quantity: item.quantity || 1,
        unit: item.unit || "",
        amount: item.amount || (item.price * item.quantity),
        remarks: item.remarks || ""
      })),
      subtotal: cat.subtotal || 0
    }));
    
    // Calculate total from charge categories
    const totalAmount = chargeCategories.reduce((sum: number, cat: any) => sum + cat.subtotal, 0);
    
    // Create new billing from project pricing
    const newBilling = {
      billingId,
      bookingId: bookingId || `PROJECT-${project.project_number}`,
      bookingType: bookingType || "forwarding",
      createdAt: timestamp,
      updatedAt: timestamp,
      
      // Source tracking - THIS IS THE KEY!
      source: "project" as const,
      projectNumber: project.project_number,
      quotationNumber: project.quotation_number,
      
      // Detailed structure from project
      chargeCategories,
      
      // Legacy fields for compatibility
      description: `Invoice for ${project.quotation_name || project.project_number}`,
      amount: totalAmount,
      currency: project.currency || "PHP",
      status: "Pending" as const,
      notes: `Auto-generated from project ${project.project_number}`
    };
    
    await kv.set(`billing:${billingId}`, newBilling);
    
    console.log(`✓ Generated invoice ${billingId} from project ${project.project_number} (${chargeCategories.length} categories, ${project.currency} ${totalAmount.toFixed(2)})`);
    
    return c.json({ success: true, data: newBilling });
  } catch (error) {
    console.error("Error generating invoice from project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete project (only if no linked bookings)
app.delete("/make-server-c142e950/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ success: false, error: "Project not found" }, 404);
    }
    
    // Only allow deletion if no linked bookings
    if (project.linkedBookings && project.linkedBookings.length > 0) {
      return c.json({ 
        success: false, 
        error: "Cannot delete project with linked bookings. Delete all bookings first." 
      }, 400);
    }
    
    // Delete project
    await kv.del(`project:${id}`);
    
    // Update quotation to remove project link
    if (project.quotation_id) {
      const quotation = await kv.get(`quotation:${project.quotation_id}`);
      if (quotation) {
        quotation.project_id = null;
        quotation.status = "Accepted by Client"; // Revert status
        delete quotation.converted_to_project_at;
        quotation.updated_at = new Date().toISOString();
        await kv.set(`quotation:${project.quotation_id}`, quotation);
      }
    }
    
    console.log(`Deleted project: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Backfill quotation_name for existing projects
app.post("/make-server-c142e950/projects/backfill-names", async (c) => {
  try {
    const projects = await kv.getByPrefix("project:");
    let updated = 0;
    let skipped = 0;
    
    for (const project of projects) {
      // Skip if already has quotation_name
      if (project.quotation_name) {
        skipped++;
        continue;
      }
      
      // Try to get quotation and copy the name
      if (project.quotation_id) {
        const quotation = await kv.get(`quotation:${project.quotation_id}`);
        if (quotation && quotation.quotation_name) {
          project.quotation_name = quotation.quotation_name;
          project.updated_at = new Date().toISOString();
          await kv.set(`project:${project.id}`, project);
          updated++;
          console.log(`Backfilled quotation_name for project ${project.project_number}: "${quotation.quotation_name}"`);
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`Backfill complete: ${updated} projects updated, ${skipped} skipped`);
    
    return c.json({ 
      success: true, 
      data: { updated, skipped, total: projects.length }
    });
  } catch (error) {
    console.error("Error backfilling project names:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Migrate services_metadata from camelCase to snake_case for all projects and quotations
app.post("/make-server-c142e950/migrate-services-metadata", async (c) => {
  try {
    // Helper function to migrate service details
    const migrateServiceDetails = (service: any) => {
      if (!service || !service.service_details) return service;
      
      const details = service.service_details;
      const serviceType = service.service_type;
      
      // Create new details object with snake_case fields
      let newDetails: any = {};
      
      if (serviceType === "Brokerage") {
        newDetails = {
          subtype: details.subtype || details.brokerageType,
          shipment_type: details.shipment_type || details.shipmentType,
          type_of_entry: details.type_of_entry || details.typeOfEntry,
          pod: details.pod,
          mode: details.mode,
          cargo_type: details.cargo_type || details.cargoType,
          commodity: details.commodity || details.commodityDescription,
          declared_value: details.declared_value || details.declaredValue,
          delivery_address: details.delivery_address || details.deliveryAddress,
          country_of_origin: details.country_of_origin || details.countryOfOrigin,
          preferential_treatment: details.preferential_treatment || details.preferentialTreatment,
          psic: details.psic,
          aeo: details.aeo
        };
        
        // Remove undefined values
        Object.keys(newDetails).forEach(key => {
          if (newDetails[key] === undefined) delete newDetails[key];
        });
      } else if (serviceType === "Forwarding") {
        // Handle compound fields
        let aol = details.aol;
        let pol = details.pol;
        let aod = details.aod;
        let pod = details.pod;
        
        if (details.aolPol && !aol && !pol) {
          const parts = details.aolPol.split('→').map((s: string) => s.trim());
          aol = parts[0];
          pol = parts[1];
        }
        if (details.aodPod && !aod && !pod) {
          const parts = details.aodPod.split('→').map((s: string) => s.trim());
          aod = parts[0];
          pod = parts[1];
        }
        
        newDetails = {
          incoterms: details.incoterms,
          cargo_type: details.cargo_type || details.cargoType,
          commodity: details.commodity || details.commodityDescription,
          delivery_address: details.delivery_address || details.deliveryAddress,
          mode: details.mode,
          aol: aol,
          pol: pol,
          aod: aod,
          pod: pod
        };
        
        // Remove undefined values
        Object.keys(newDetails).forEach(key => {
          if (newDetails[key] === undefined) delete newDetails[key];
        });
      } else if (serviceType === "Trucking") {
        newDetails = {
          pull_out: details.pull_out || details.pullOut,
          delivery_address: details.delivery_address || details.deliveryAddress,
          truck_type: details.truck_type || details.truckType,
          delivery_instructions: details.delivery_instructions || details.deliveryInstructions
        };
        
        // Remove undefined values
        Object.keys(newDetails).forEach(key => {
          if (newDetails[key] === undefined) delete newDetails[key];
        });
      } else if (serviceType === "Marine Insurance") {
        // Handle compound fields
        let aol = details.aol;
        let pol = details.pol;
        let aod = details.aod;
        let pod = details.pod;
        
        if (details.aolPol && !aol && !pol) {
          const parts = details.aolPol.split('→').map((s: string) => s.trim());
          aol = parts[0];
          pol = parts[1];
        }
        if (details.aodPod && !aod && !pod) {
          const parts = details.aodPod.split('→').map((s: string) => s.trim());
          aod = parts[0];
          pod = parts[1];
        }
        
        newDetails = {
          commodity_description: details.commodity_description || details.commodityDescription,
          hs_code: details.hs_code || details.hsCode,
          aol: aol,
          pol: pol,
          aod: aod,
          pod: pod,
          invoice_value: details.invoice_value || details.invoiceValue
        };
        
        // Remove undefined values
        Object.keys(newDetails).forEach(key => {
          if (newDetails[key] === undefined) delete newDetails[key];
        });
      } else if (serviceType === "Others") {
        newDetails = {
          service_description: details.service_description || details.serviceDescription
        };
        
        // Remove undefined values
        Object.keys(newDetails).forEach(key => {
          if (newDetails[key] === undefined) delete newDetails[key];
        });
      } else {
        // Unknown service type, keep as is
        newDetails = details;
      }
      
      return {
        ...service,
        service_details: newDetails
      };
    };
    
    // Migrate all projects
    const projects = await kv.getByPrefix("project:");
    let projectsUpdated = 0;
    let projectsSkipped = 0;
    
    for (const project of projects) {
      if (project.services_metadata && Array.isArray(project.services_metadata)) {
        const migratedMetadata = project.services_metadata.map(migrateServiceDetails);
        project.services_metadata = migratedMetadata;
        project.updated_at = new Date().toISOString();
        await kv.set(`project:${project.id}`, project);
        projectsUpdated++;
        console.log(`✓ Migrated services_metadata for project ${project.project_number}`);
      } else {
        projectsSkipped++;
      }
    }
    
    // Migrate all quotations
    const quotations = await kv.getByPrefix("quotation:");
    let quotationsUpdated = 0;
    let quotationsSkipped = 0;
    
    for (const quotation of quotations) {
      if (quotation.services_metadata && Array.isArray(quotation.services_metadata)) {
        const migratedMetadata = quotation.services_metadata.map(migrateServiceDetails);
        quotation.services_metadata = migratedMetadata;
        quotation.updated_at = new Date().toISOString();
        await kv.set(`quotation:${quotation.id}`, quotation);
        quotationsUpdated++;
        console.log(`✓ Migrated services_metadata for quotation ${quotation.quote_number}`);
      } else {
        quotationsSkipped++;
      }
    }
    
    console.log(`Migration complete!`);
    console.log(`  Projects: ${projectsUpdated} updated, ${projectsSkipped} skipped`);
    console.log(`  Quotations: ${quotationsUpdated} updated, ${quotationsSkipped} skipped`);
    
    return c.json({ 
      success: true, 
      data: { 
        projects: { updated: projectsUpdated, skipped: projectsSkipped, total: projects.length },
        quotations: { updated: quotationsUpdated, skipped: quotationsSkipped, total: quotations.length }
      }
    });
  } catch (error) {
    console.error("Error migrating services_metadata:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== BOOKINGS API ====================

// Create a new booking
app.post("/make-server-c142e950/bookings", async (c) => {
  try {
    const booking = await c.req.json();
    
    // Generate unique ID if not provided
    if (!booking.id) {
      booking.id = `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Set timestamps
    booking.created_at = booking.created_at || new Date().toISOString();
    booking.updated_at = new Date().toISOString();
    
    // Set default status if not provided
    if (!booking.status) {
      booking.status = "Draft";
    }
    
    // Save to KV store with key: booking:{id}
    await kv.set(`booking:${booking.id}`, booking);
    
    console.log(`Created booking: ${booking.id} with status: ${booking.status}`);
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all bookings (with optional filters)
app.get("/make-server-c142e950/bookings", async (c) => {
  try {
    const status = c.req.query("status");
    const search = c.req.query("search");
    const customer_id = c.req.query("customer_id");
    const created_by = c.req.query("created_by");
    const date_from = c.req.query("date_from");
    const date_to = c.req.query("date_to");
    const sort_by = c.req.query("sort_by") || "updated_at";
    const sort_order = c.req.query("sort_order") || "desc";
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined;
    const offset = c.req.query("offset") ? parseInt(c.req.query("offset")!) : 0;
    
    // Get all bookings with prefix
    const bookings = await kv.getByPrefix("booking:");
    
    let filtered = bookings;
    
    // Filter by customer_id if provided
    if (customer_id) {
      filtered = filtered.filter((b: any) => b.customer_id === customer_id);
    }
    
    // Filter by created_by if provided
    if (created_by) {
      filtered = filtered.filter((b: any) => b.created_by === created_by);
    }
    
    // Filter by date range
    if (date_from) {
      const fromDate = new Date(date_from);
      filtered = filtered.filter((b: any) => 
        new Date(b.created_at) >= fromDate
      );
    }
    
    if (date_to) {
      const toDate = new Date(date_to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((b: any) => 
        new Date(b.created_at) <= toDate
      );
    }
    
    // Filter by search query (searches tracking_number and booking_name)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((b: any) => 
        b.tracking_number?.toLowerCase().includes(searchLower) ||
        b.booking_name?.toLowerCase().includes(searchLower) ||
        b.id?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by status if provided
    if (status) {
      filtered = filtered.filter((b: any) => b.status === status);
    }
    
    const total = filtered.length;
    
    // Sort
    filtered.sort((a: any, b: any) => {
      let aVal, bVal;
      switch (sort_by) {
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case "updated_at":
        default:
          aVal = new Date(a.updated_at).getTime();
          bVal = new Date(b.updated_at).getTime();
          break;
      }
      return sort_order === "asc" 
        ? (aVal > bVal ? 1 : aVal < bVal ? -1 : 0)
        : (aVal < bVal ? 1 : aVal > bVal ? -1 : 0);
    });
    
    const paginated = limit ? filtered.slice(offset, offset + limit) : filtered;
    
    console.log(`Fetched ${paginated.length}/${total} bookings (offset: ${offset}, limit: ${limit || 'all'})`);
    
    return c.json({ 
      success: true, 
      data: paginated,
      pagination: {
        total,
        offset,
        limit: limit || total,
        hasMore: limit ? (offset + limit) < total : false
      }
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single booking by ID
app.get("/make-server-c142e950/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(`booking:${id}`);
    
    if (!booking) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    console.log(`Fetched booking: ${id}`);
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update booking
app.patch("/make-server-c142e950/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get existing booking
    const existing = await kv.get(`booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    // Merge updates
    const updated = {
      ...existing,
      ...updates,
      id, // Preserve ID
      created_at: existing.created_at, // Preserve created_at
      updated_at: new Date().toISOString()
    };
    
    // Save back
    await kv.set(`booking:${id}`, updated);
    
    console.log(`Updated booking: ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete booking
app.delete("/make-server-c142e950/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    await kv.del(`booking:${id}`);
    
    console.log(`Deleted booking: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== EXPENSES API ====================

// Create a new expense
app.post("/make-server-c142e950/expenses", async (c) => {
  try {
    const expense = await c.req.json();
    
    // Generate unique ID if not provided
    if (!expense.id) {
      expense.id = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Set timestamps
    expense.created_at = expense.created_at || new Date().toISOString();
    expense.updated_at = new Date().toISOString();
    
    // Set default status if not provided
    if (!expense.status) {
      expense.status = "Pending";
    }
    
    // Save to KV store with key: expense:{id}
    await kv.set(`expense:${expense.id}`, expense);
    
    console.log(`Created expense: ${expense.id} with status: ${expense.status}`);
    
    return c.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error creating expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all expenses (with optional filters)
app.get("/make-server-c142e950/expenses", async (c) => {
  try {
    // Support both camelCase (from Operations) and snake_case (from Accounting)
    const bookingId = c.req.query("bookingId") || c.req.query("booking_id");
    const status = c.req.query("status");
    const search = c.req.query("search");
    const created_by = c.req.query("created_by");
    const date_from = c.req.query("date_from");
    const date_to = c.req.query("date_to");
    const sort_by = c.req.query("sort_by") || "updated_at";
    const sort_order = c.req.query("sort_order") || "desc";
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined;
    const offset = c.req.query("offset") ? parseInt(c.req.query("offset")!) : 0;
    
    // Get all expenses with prefix
    const expenses = await kv.getByPrefix("expense:");
    
    let filtered = expenses;
    
    // Filter by booking_id/bookingId if provided (supports both field names in data)
    if (bookingId) {
      filtered = filtered.filter((e: any) => 
        e.booking_id === bookingId || e.bookingId === bookingId
      );
      console.log(`Filtering expenses for bookingId: ${bookingId}, found ${filtered.length} expenses`);
    }
    
    // Filter by created_by if provided
    if (created_by) {
      filtered = filtered.filter((e: any) => e.created_by === created_by);
    }
    
    // Filter by date range
    if (date_from) {
      const fromDate = new Date(date_from);
      filtered = filtered.filter((e: any) => 
        new Date(e.created_at || e.createdAt).getTime() >= fromDate.getTime()
      );
    }
    
    if (date_to) {
      const toDate = new Date(date_to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e: any) => 
        new Date(e.created_at || e.createdAt).getTime() <= toDate.getTime()
      );
    }
    
    // Filter by search query (searches expense_name, description and id)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((e: any) => 
        e.expense_name?.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.id?.toLowerCase().includes(searchLower) ||
        e.category?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by status if provided
    if (status) {
      filtered = filtered.filter((e: any) => e.status === status);
    }
    
    const total = filtered.length;
    
    // Sort
    filtered.sort((a: any, b: any) => {
      let aVal, bVal;
      switch (sort_by) {
        case "created_at":
          aVal = new Date(a.created_at || a.createdAt).getTime();
          bVal = new Date(b.created_at || b.createdAt).getTime();
          break;
        case "updated_at":
        default:
          aVal = new Date(a.updated_at || a.updatedAt).getTime();
          bVal = new Date(b.updated_at || b.updatedAt).getTime();
          break;
      }
      return sort_order === "asc" 
        ? (aVal > bVal ? 1 : aVal < bVal ? -1 : 0)
        : (aVal < bVal ? 1 : aVal > bVal ? -1 : 0);
    });
    
    const paginated = limit ? filtered.slice(offset, offset + limit) : filtered;
    
    console.log(`Fetched ${paginated.length}/${total} expenses (bookingId: ${bookingId}, status: ${status}, search: ${search})`);
    
    return c.json({ 
      success: true, 
      data: paginated,
      pagination: {
        total,
        offset,
        limit: limit || total,
        hasMore: limit ? (offset + limit) < total : false
      }
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single expense by ID
app.get("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const expense = await kv.get(`expense:${id}`);
    
    if (!expense) {
      return c.json({ success: false, error: "Expense not found" }, 404);
    }
    
    console.log(`Fetched expense: ${id}`);
    
    return c.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error fetching expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update expense
app.patch("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get existing expense
    const existing = await kv.get(`expense:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Expense not found" }, 404);
    }
    
    // Merge updates
    const updated = {
      ...existing,
      ...updates,
      id, // Preserve ID
      created_at: existing.created_at, // Preserve created_at
      updated_at: new Date().toISOString()
    };
    
    // Save back
    await kv.set(`expense:${id}`, updated);
    
    console.log(`Updated expense: ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete expense
app.delete("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    await kv.del(`expense:${id}`);
    
    console.log(`Deleted expense: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SEED DATA API ====================

// Seed all entity types with test data
app.post("/make-server-c142e950/entities/seed", async (c) => {
  try {
    const results = {
      customers: [],
      contacts: [],
      quotations: [],
      bookings: [],
      expenses: [],
      projects: []
    };
    
    // === SEED CUSTOMERS ===
    const customers = [
      {
        id: "customer-1",
        company_name: "ABC Logistics Corp",
        industry: "Logistics",
        status: "Active",
        registered_address: "123 Ayala Avenue, Makati City",
        email: "info@abclogistics.ph",
        phone: "+63 2 8123 4567",
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "customer-2",
        company_name: "XYZ Manufacturing Inc",
        industry: "Manufacturing",
        status: "Active",
        registered_address: "456 Ortigas Avenue, Pasig City",
        email: "contact@xyzmanufacturing.ph",
        phone: "+63 2 8234 5678",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "customer-3",
        company_name: "Global Trading Solutions",
        industry: "Trading",
        status: "Active",
        registered_address: "789 BGC, Taguig City",
        email: "hello@globaltrading.ph",
        phone: "+63 2 8345 6789",
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "customer-4",
        company_name: "Pacific Import Export",
        industry: "Import/Export",
        status: "Prospect",
        registered_address: "321 Roxas Boulevard, Manila",
        email: "info@pacificimport.ph",
        phone: "+63 2 8456 7890",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "customer-5",
        company_name: "Metro Retail Group",
        industry: "Retail",
        status: "Active",
        registered_address: "654 Shaw Boulevard, Mandaluyong",
        email: "procurement@metroretail.ph",
        phone: "+63 2 8567 8901",
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const customer of customers) {
      await kv.set(`customer:${customer.id}`, customer);
      results.customers.push(customer);
    }
    
    // === SEED CONTACTS ===
    // ⚠️ REMOVED: Contact seed data has been removed to prevent fake data pollution
    // Users should create real contacts through the UI instead
    
    // === SEED QUOTATIONS ===
    const quotations = [
      {
        id: "QUO-1734500000-abc123",
        quote_number: "QUO-1734500000-abc123",
        quotation_name: "Container Shipment - Manila to Cebu",
        customer_id: "customer-1",
        customer_name: "ABC Logistics Corp",
        contact_person_id: "contact-1",
        contact_person_name: "Juan Dela Cruz",
        status: "Draft",
        origin: "Manila",
        destination: "Cebu",
        cargo_type: "General Cargo",
        container_size: "20ft",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "QUO-1734400000-def456",
        quote_number: "QUO-1734400000-def456",
        quotation_name: "Air Freight - Manila to Singapore",
        customer_id: "customer-2",
        customer_name: "XYZ Manufacturing Inc",
        contact_person_id: "contact-3",
        contact_person_name: "Pedro Reyes",
        status: "Pending Pricing",
        origin: "Manila",
        destination: "Singapore",
        cargo_type: "Electronics",
        weight: "500kg",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "QUO-1734300000-ghi789",
        quote_number: "QUO-1734300000-ghi789",
        quotation_name: "Sea Freight - Davao to Hong Kong",
        customer_id: "customer-3",
        customer_name: "Global Trading Solutions",
        contact_person_id: "contact-4",
        contact_person_name: "Ana Garcia",
        status: "Quotation",
        origin: "Davao",
        destination: "Hong Kong",
        cargo_type: "Agricultural Products",
        container_size: "40ft",
        ocean_freight_rate: 1200,
        local_charges: 300,
        total_price: 1500,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "QUO-1734200000-jkl012",
        quote_number: "QUO-1734200000-jkl012",
        quotation_name: "LCL Shipment - Manila to Japan",
        customer_id: "customer-1",
        customer_name: "ABC Logistics Corp",
        contact_person_id: "contact-2",
        contact_person_name: "Maria Santos",
        status: "Rejected",
        origin: "Manila",
        destination: "Tokyo",
        cargo_type: "Consumer Goods",
        weight: "2000kg",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "QUO-1734100000-mno345",
        quote_number: "QUO-1734100000-mno345",
        quotation_name: "Express Delivery - Manila to Cebu",
        customer_id: "customer-5",
        customer_name: "Metro Retail Group",
        contact_person_id: "contact-6",
        contact_person_name: "Sofia Rodriguez",
        status: "Draft",
        origin: "Manila",
        destination: "Cebu",
        cargo_type: "Retail Products",
        weight: "100kg",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "QUO-1734050000-pqr678",
        quote_number: "QUO-1734050000-pqr678",
        quotation_name: "Bulk Cargo - Subic to Vietnam",
        customer_id: "customer-2",
        customer_name: "XYZ Manufacturing Inc",
        contact_person_id: "contact-3",
        contact_person_name: "Pedro Reyes",
        status: "Quotation",
        origin: "Subic",
        destination: "Ho Chi Minh",
        cargo_type: "Raw Materials",
        weight: "5000kg",
        ocean_freight_rate: 2500,
        local_charges: 600,
        total_price: 3100,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "QUO-1734000000-stu901",
        quote_number: "QUO-1734000000-stu901",
        quotation_name: "Refrigerated Container - Manila to USA",
        customer_id: "customer-3",
        customer_name: "Global Trading Solutions",
        contact_person_id: "contact-4",
        contact_person_name: "Ana Garcia",
        status: "Pending Pricing",
        origin: "Manila",
        destination: "Los Angeles",
        cargo_type: "Perishable Goods",
        container_size: "20ft Reefer",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "QUO-1733900000-vwx234",
        quote_number: "QUO-1733900000-vwx234",
        quotation_name: "Multimodal Transport - Cebu to Europe",
        customer_id: "customer-4",
        customer_name: "Pacific Import Export",
        contact_person_id: "contact-5",
        contact_person_name: "Carlos Mendoza",
        status: "Draft",
        origin: "Cebu",
        destination: "Rotterdam",
        cargo_type: "Mixed Cargo",
        container_size: "40ft HC",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    for (const quotation of quotations) {
      await kv.set(`quotation:${quotation.id}`, quotation);
      results.quotations.push(quotation);
    }
    
    // === SEED BOOKINGS ===
    const bookings = [
      {
        id: "BKG-1734600000-aaa111",
        tracking_number: "ABCL-2024-001",
        booking_name: "Container to Cebu - ABC Logistics",
        customer_id: "customer-1",
        customer_name: "ABC Logistics Corp",
        quotation_id: "QUO-1734300000-ghi789",
        status: "In Transit",
        origin: "Manila",
        destination: "Cebu",
        departure_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "BKG-1734500000-bbb222",
        tracking_number: "XYZM-2024-045",
        booking_name: "Air Freight to Singapore - XYZ Manufacturing",
        customer_id: "customer-2",
        customer_name: "XYZ Manufacturing Inc",
        quotation_id: "QUO-1734050000-pqr678",
        status: "Delivered",
        origin: "Manila",
        destination: "Singapore",
        departure_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        eta: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        delivery_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "BKG-1734400000-ccc333",
        tracking_number: "GLTS-2024-089",
        booking_name: "Sea Freight to Hong Kong - Global Trading",
        customer_id: "customer-3",
        customer_name: "Global Trading Solutions",
        quotation_id: "QUO-1734300000-ghi789",
        status: "Completed",
        origin: "Davao",
        destination: "Hong Kong",
        departure_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        eta: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        delivery_date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "BKG-1734300000-ddd444",
        tracking_number: "METR-2024-012",
        booking_name: "Express Delivery - Metro Retail",
        customer_id: "customer-5",
        customer_name: "Metro Retail Group",
        status: "Processing",
        origin: "Manila",
        destination: "Cebu",
        departure_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        eta: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "BKG-1734200000-eee555",
        tracking_number: "PACI-2024-034",
        booking_name: "Import Cargo - Pacific Import Export",
        customer_id: "customer-4",
        customer_name: "Pacific Import Export",
        status: "Draft",
        origin: "Shanghai",
        destination: "Manila",
        departure_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        eta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    for (const booking of bookings) {
      await kv.set(`booking:${booking.id}`, booking);
      results.bookings.push(booking);
    }
    
    // === SEED EXPENSES ===
    const expenses = [
      {
        id: "EXP-1734700000-xxx111",
        expense_name: "Ocean Freight Charges",
        booking_id: "BKG-1734600000-aaa111",
        category: "Transportation",
        amount: 1200,
        currency: "USD",
        status: "Approved",
        vendor: "Maersk Line",
        description: "Ocean freight from Manila to Cebu",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "EXP-1734600000-yyy222",
        expense_name: "Local Port Charges",
        booking_id: "BKG-1734600000-aaa111",
        category: "Port Fees",
        amount: 300,
        currency: "USD",
        status: "Approved",
        vendor: "Manila Port Authority",
        description: "Local handling and port fees",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "EXP-1734500000-zzz333",
        expense_name: "Customs Clearance",
        booking_id: "BKG-1734500000-bbb222",
        category: "Customs",
        amount: 450,
        currency: "USD",
        status: "Paid",
        vendor: "ABC Customs Broker",
        description: "Import customs clearance Singapore",
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "EXP-1734400000-www444",
        expense_name: "Trucking Service",
        booking_id: "BKG-1734400000-ccc333",
        category: "Transportation",
        amount: 180,
        currency: "USD",
        status: "Paid",
        vendor: "FastTrack Logistics",
        description: "Inland transport from port to warehouse",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "EXP-1734300000-vvv555",
        expense_name: "Warehouse Storage",
        booking_id: "BKG-1734300000-ddd444",
        category: "Storage",
        amount: 120,
        currency: "USD",
        status: "Pending",
        vendor: "Metro Warehouse Inc",
        description: "7 days storage fee",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "EXP-1734200000-uuu666",
        expense_name: "Insurance Premium",
        booking_id: "BKG-1734500000-bbb222",
        category: "Insurance",
        amount: 250,
        currency: "USD",
        status: "Approved",
        vendor: "Marine Insurance Co",
        description: "Cargo insurance coverage",
        created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    for (const expense of expenses) {
      await kv.set(`expense:${expense.id}`, expense);
      results.expenses.push(expense);
    }
    
    // === SEED PROJECTS ===
    const projects = [
      {
        id: "PRJ-2024-001",
        project_number: "PRJ-2024-001",
        quotation_id: "QUO-1734300000-ghi789",
        quotation_number: "QUO-1734300000-ghi789",
        quotation_name: "Manila to Cebu Electronics Export",
        customer_id: "customer-1",
        customer_name: "ABC Logistics Corp",
        contact_person_name: "Juan Dela Cruz",
        status: "Active",
        booking_status: "No Bookings Yet",
        bd_owner_user_id: "user-bd-rep-001",
        bd_owner_user_name: "Juan Dela Cruz",
        bd_owner_email: "bd.rep@neuron.ph",
        ops_assigned_user_id: "user-ops-rep-001",
        ops_assigned_user_name: "Carlos Mendoza",
        // Route information
        movement: "EXPORT",
        category: "SEA FREIGHT",
        shipment_type: "FCL",
        pol_aol: "Manila",
        pod_aod: "Cebu",
        carrier: "Maersk",
        transit_days: 3,
        incoterm: "FOB",
        commodity: "Electronics",
        // Service list
        services: ["Forwarding"],
        services_metadata: [
          {
            service_type: "Forwarding",
            service_details: {
              mode: "Ocean",
              incoterms: "FOB",
              cargo_type: "General",
              commodity: "Electronics",
              pol: "Manila",
              pod: "Cebu"
            }
          }
        ],
        // Cargo details
        volume_cbm: 28.5,
        volume_containers: "2x20' STD",
        volume_packages: 40,
        gross_weight: 12500,
        chargeable_weight: 12500,
        cargo_type: "General",
        stackability: "Stackable",
        // Project details
        client_po_number: "PO-ABC-2024-158",
        client_po_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        shipment_ready_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        requested_etd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        special_instructions: "Handle with care - fragile electronics",
        // Financial
        currency: "PHP",
        total: 85000,
        // Tracking
        linkedBookings: [],
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "PRJ-2024-002",
        project_number: "PRJ-2024-002",
        quotation_id: "QUO-1734050000-pqr678",
        quotation_number: "QUO-1734050000-pqr678",
        quotation_name: "Subic to Ho Chi Minh Raw Materials",
        customer_id: "customer-2",
        customer_name: "XYZ Manufacturing Inc",
        contact_person_name: "Maria Santos",
        status: "Active",
        booking_status: "Partially Booked",
        bd_owner_user_id: "user-bd-manager-001",
        bd_owner_user_name: "Maria Santos",
        bd_owner_email: "bd.manager@neuron.ph",
        ops_assigned_user_id: null,
        ops_assigned_user_name: null,
        // Route information
        movement: "EXPORT",
        category: "SEA FREIGHT",
        shipment_type: "FCL",
        pol_aol: "Subic",
        pod_aod: "Ho Chi Minh",
        carrier: "ONE Line",
        transit_days: 5,
        incoterm: "CIF",
        commodity: "Raw Materials",
        // Service list
        services: ["Forwarding", "Trucking"],
        services_metadata: [
          {
            service_type: "Forwarding",
            service_details: {
              mode: "Ocean",
              incoterms: "CIF",
              cargo_type: "General",
              commodity: "Raw Materials",
              pol: "Subic",
              pod: "Ho Chi Minh"
            }
          },
          {
            service_type: "Trucking",
            service_details: {
              pull_out: "Factory A, Subic Bay Freeport Zone",
              delivery_address: "Subic Port Terminal",
              truck_type: "10W"
            }
          }
        ],
        // Cargo details
        volume_cbm: 67.2,
        volume_containers: "1x40' HC",
        volume_packages: 80,
        gross_weight: 22000,
        chargeable_weight: 22000,
        cargo_type: "General",
        stackability: "Stackable",
        // Project details
        client_po_number: "PO-XYZ-2024-089",
        client_po_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        shipment_ready_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        requested_etd: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        special_instructions: "Coordinate with factory for pickup schedule",
        // Financial
        currency: "PHP",
        total: 120000,
        // Tracking - One service booked (Forwarding)
        linkedBookings: [
          {
            bookingId: "FOR-2024-001",
            bookingNumber: "FOR-2024-001",
            serviceType: "Forwarding",
            status: "Draft",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: "Carlos Mendoza"
          }
        ],
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "PRJ-2024-003",
        project_number: "PRJ-2024-003",
        quotation_id: "QUO-1734000000-abc123",
        quotation_number: "QUO-1734000000-abc123",
        quotation_name: "Manila to Singapore Textile Air Freight",
        customer_id: "customer-3",
        customer_name: "Global Trading Solutions",
        contact_person_name: "Robert Lee",
        status: "Completed",
        booking_status: "Fully Booked",
        bd_owner_user_id: "user-bd-rep-001",
        bd_owner_user_name: "Juan Dela Cruz",
        bd_owner_email: "bd.rep@neuron.ph",
        ops_assigned_user_id: "user-ops-rep-001",
        ops_assigned_user_name: "Carlos Mendoza",
        // Route information
        movement: "EXPORT",
        category: "AIR FREIGHT",
        shipment_type: "Consolidation",
        pol_aol: "Manila",
        pod_aod: "Singapore",
        carrier: "Singapore Airlines",
        transit_days: 1,
        incoterm: "EXW",
        commodity: "Textile Products",
        // Service list
        services: ["Forwarding"],
        services_metadata: [
          {
            service_type: "Forwarding",
            service_details: {
              mode: "Air",
              incoterms: "EXW",
              cargo_type: "General",
              commodity: "Textile Products",
              aol: "Manila",
              aod: "Singapore",
              pol: "Manila",
              pod: "Singapore"
            }
          }
        ],
        // Cargo details
        volume_cbm: 2.5,
        gross_weight: 500,
        chargeable_weight: 500,
        cargo_type: "General",
        stackability: "Stackable",
        // Project details
        client_po_number: "PO-GTS-2024-042",
        client_po_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        shipment_ready_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        requested_etd: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        actual_etd: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        eta: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        actual_delivery_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        // Financial
        currency: "PHP",
        total: 65000,
        // Tracking - Fully booked
        linkedBookings: [
          {
            bookingId: "FOR-2024-099",
            bookingNumber: "FOR-2024-099",
            serviceType: "Forwarding",
            status: "Completed",
            createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: "Carlos Mendoza"
          }
        ],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    for (const project of projects) {
      await kv.set(`project:${project.id}`, project);
      results.projects.push(project);
    }
    
    console.log(`Seeded ${results.customers.length} customers, ${results.contacts.length} contacts, ${results.quotations.length} quotations, ${results.bookings.length} bookings, ${results.expenses.length} expenses, ${results.projects.length} projects`);
    
    return c.json({
      success: true,
      message: "Successfully seeded all entity data",
      data: {
        customers: results.customers.length,
        contacts: results.contacts.length,
        quotations: results.quotations.length,
        bookings: results.bookings.length,
        expenses: results.expenses.length,
        projects: results.projects.length,
        total: results.customers.length + results.contacts.length + results.quotations.length + results.bookings.length + results.expenses.length + results.projects.length
      }
    });
  } catch (error) {
    console.error("Error seeding entity data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== OPERATIONS MODULE API ====================

// Helper function to generate booking ID
function generateBookingId(type: string): string {
  const prefix = type.toUpperCase().substring(0, 3);
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${random}`;
}

// Helper function to unlink a booking from its project
async function unlinkBookingFromProject(booking: any, bookingId: string): Promise<void> {
  const projectIdentifier = booking.projectId || booking.projectNumber;
  if (!projectIdentifier) {
    return; // No project to unlink from
  }
  
  let project;
  
  // Try to get by ID first, then by number
  if (booking.projectId) {
    project = await kv.get(`project:${booking.projectId}`);
  } else if (booking.projectNumber) {
    // Find project by project_number
    const allProjects = await kv.getByPrefix("project:");
    project = allProjects.find((p: any) => p.project_number === booking.projectNumber);
  }
  
  if (project && project.linkedBookings) {
    const initialLength = project.linkedBookings.length;
    project.linkedBookings = project.linkedBookings.filter((b: any) => b.bookingId !== bookingId);
    
    if (project.linkedBookings.length !== initialLength) {
      // Recalculate booking status
      const totalServices = project.services?.length || 0;
      const bookedServices = new Set(project.linkedBookings.map((b: any) => b.serviceType)).size;
      
      if (bookedServices === 0) {
        project.booking_status = "No Bookings Yet";
      } else if (bookedServices >= totalServices) {
        project.booking_status = "Fully Booked";
      } else {
        project.booking_status = "Partially Booked";
      }
      
      project.updated_at = new Date().toISOString();
      await kv.set(`project:${project.id}`, project);
      console.log(`✓ Unlinked booking ${bookingId} from project ${project.project_number}`);
    }
  }
}

// ==================== FORWARDING BOOKINGS ====================

// Get all forwarding bookings
app.get("/make-server-c142e950/forwarding-bookings", async (c) => {
  try {
    const assigned_to_user_id = c.req.query("assigned_to_user_id");
    
    let bookings = await kv.getByPrefix("forwarding_booking:");
    
    // Filter by assigned user if provided (Operations team filtering)
    if (assigned_to_user_id) {
      bookings = bookings.filter((b: any) => 
        b.assigned_manager_id === assigned_to_user_id ||
        b.assigned_supervisor_id === assigned_to_user_id ||
        b.assigned_handler_id === assigned_to_user_id
      );
    }
    
    // Sort by createdAt descending (newest first)
    bookings.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`Fetched ${bookings.length} forwarding bookings${assigned_to_user_id ? ` for user ${assigned_to_user_id}` : ''}`);
    
    return c.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching forwarding bookings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single forwarding booking
app.get("/make-server-c142e950/forwarding-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(`forwarding_booking:${id}`);
    
    if (!booking) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching forwarding booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create forwarding booking
app.post("/make-server-c142e950/forwarding-bookings", async (c) => {
  try {
    const bookingData = await c.req.json();
    
    // Generate booking ID if not provided
    const bookingId = bookingData.bookingId || generateBookingId("FWD");
    
    const timestamp = new Date().toISOString();
    
    const newBooking = {
      ...bookingData,
      bookingId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await kv.set(`forwarding_booking:${bookingId}`, newBooking);
    
    console.log(`Created forwarding booking ${bookingId}`);
    
    return c.json({ success: true, data: newBooking });
  } catch (error) {
    console.error("Error creating forwarding booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update forwarding booking
app.put("/make-server-c142e950/forwarding-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`forwarding_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      bookingId: id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`forwarding_booking:${id}`, updated);
    
    console.log(`Updated forwarding booking ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating forwarding booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete forwarding booking
app.delete("/make-server-c142e950/forwarding-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`forwarding_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    // Unlink from project if linked
    await unlinkBookingFromProject(existing, id);
    
    await kv.del(`forwarding_booking:${id}`);
    
    // Also delete associated billings and expenses
    const billings = await kv.getByPrefix(`billing:`);
    const expenses = await kv.getByPrefix(`expense:`);
    
    for (const billing of billings) {
      if (billing.bookingId === id) {
        await kv.del(`billing:${billing.billingId}`);
      }
    }
    
    for (const expense of expenses) {
      if (expense.bookingId === id) {
        await kv.del(`expense:${expense.expenseId}`);
      }
    }
    
    console.log(`Deleted forwarding booking ${id} and associated records`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting forwarding booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== TRUCKING BOOKINGS ====================

// Get all trucking bookings
app.get("/make-server-c142e950/trucking-bookings", async (c) => {
  try {
    const assigned_to_user_id = c.req.query("assigned_to_user_id");
    
    let bookings = await kv.getByPrefix("trucking_booking:");
    
    // Filter by assigned user if provided (Operations team filtering)
    if (assigned_to_user_id) {
      bookings = bookings.filter((b: any) => 
        b.assigned_manager_id === assigned_to_user_id ||
        b.assigned_supervisor_id === assigned_to_user_id ||
        b.assigned_handler_id === assigned_to_user_id
      );
    }
    
    // Sort by createdAt descending (newest first)
    bookings.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`Retrieved ${bookings.length} trucking bookings${assigned_to_user_id ? ` for user ${assigned_to_user_id}` : ''}`);
    
    return c.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching trucking bookings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single trucking booking
app.get("/make-server-c142e950/trucking-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(`trucking_booking:${id}`);
    
    if (!booking) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching trucking booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create trucking booking
app.post("/make-server-c142e950/trucking-bookings", async (c) => {
  try {
    const bookingData = await c.req.json();
    
    // Get counter for booking number
    const counter = await kv.get("trucking_booking_counter") || 0;
    const newCounter = counter + 1;
    await kv.set("trucking_booking_counter", newCounter);
    
    // Generate booking ID: TRK-YYYY-NNN
    const year = new Date().getFullYear();
    const bookingId = `TRK-${year}-${String(newCounter).padStart(3, '0')}`;
    
    const timestamp = new Date().toISOString();
    
    const newBooking = {
      ...bookingData,
      bookingId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await kv.set(`trucking_booking:${bookingId}`, newBooking);
    
    console.log(`Created trucking booking ${bookingId}`);
    
    return c.json({ success: true, data: newBooking });
  } catch (error) {
    console.error("Error creating trucking booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update trucking booking
app.put("/make-server-c142e950/trucking-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`trucking_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      bookingId: id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`trucking_booking:${id}`, updated);
    
    console.log(`Updated trucking booking ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating trucking booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete trucking booking
app.delete("/make-server-c142e950/trucking-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`trucking_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    // Unlink from project if linked
    await unlinkBookingFromProject(existing, id);
    
    await kv.del(`trucking_booking:${id}`);
    
    // Also delete associated billings and expenses
    const billings = await kv.getByPrefix(`billing:`);
    const expenses = await kv.getByPrefix(`expense:`);
    
    for (const billing of billings) {
      if (billing.bookingId === id) {
        await kv.del(`billing:${billing.billingId}`);
      }
    }
    
    for (const expense of expenses) {
      if (expense.bookingId === id) {
        await kv.del(`expense:${expense.expenseId}`);
      }
    }
    
    console.log(`Deleted trucking booking ${id} and associated records`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting trucking booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== MARINE INSURANCE BOOKINGS ====================

// Get all marine insurance bookings
app.get("/make-server-c142e950/marine-insurance-bookings", async (c) => {
  try {
    const assigned_to_user_id = c.req.query("assigned_to_user_id");
    
    let bookings = await kv.getByPrefix("marine_insurance_booking:");
    
    // Filter by assigned user if provided (Operations team filtering)
    if (assigned_to_user_id) {
      bookings = bookings.filter((b: any) => 
        b.assigned_manager_id === assigned_to_user_id ||
        b.assigned_supervisor_id === assigned_to_user_id ||
        b.assigned_handler_id === assigned_to_user_id
      );
    }
    
    // Sort by createdAt descending (newest first)
    bookings.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`Retrieved ${bookings.length} marine insurance bookings${assigned_to_user_id ? ` for user ${assigned_to_user_id}` : ''}`);
    
    return c.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching marine insurance bookings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single marine insurance booking
app.get("/make-server-c142e950/marine-insurance-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(`marine_insurance_booking:${id}`);
    
    if (!booking) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching marine insurance booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create marine insurance booking
app.post("/make-server-c142e950/marine-insurance-bookings", async (c) => {
  try {
    const bookingData = await c.req.json();
    
    // Get counter for booking number
    const counter = await kv.get("marine_insurance_booking_counter") || 0;
    const newCounter = counter + 1;
    await kv.set("marine_insurance_booking_counter", newCounter);
    
    // Generate booking ID: INS-YYYY-NNN
    const year = new Date().getFullYear();
    const bookingId = `INS-${year}-${String(newCounter).padStart(3, '0')}`;
    
    const timestamp = new Date().toISOString();
    
    const newBooking = {
      ...bookingData,
      bookingId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await kv.set(`marine_insurance_booking:${bookingId}`, newBooking);
    
    console.log(`Created marine insurance booking ${bookingId}`);
    
    return c.json({ success: true, data: newBooking });
  } catch (error) {
    console.error("Error creating marine insurance booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update marine insurance booking
app.put("/make-server-c142e950/marine-insurance-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`marine_insurance_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      bookingId: id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`marine_insurance_booking:${id}`, updated);
    
    console.log(`Updated marine insurance booking ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating marine insurance booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete marine insurance booking
app.delete("/make-server-c142e950/marine-insurance-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`marine_insurance_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    // Unlink from project if linked
    await unlinkBookingFromProject(existing, id);
    
    await kv.del(`marine_insurance_booking:${id}`);
    
    // Also delete associated billings and expenses
    const billings = await kv.getByPrefix(`billing:`);
    const expenses = await kv.getByPrefix(`expense:`);
    
    for (const billing of billings) {
      if (billing.bookingId === id) {
        await kv.del(`billing:${billing.billingId}`);
      }
    }
    
    for (const expense of expenses) {
      if (expense.bookingId === id) {
        await kv.del(`expense:${expense.expenseId}`);
      }
    }
    
    console.log(`Deleted marine insurance booking ${id} and associated records`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting marine insurance booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== BROKERAGE BOOKINGS ====================

// Get all brokerage bookings
app.get("/make-server-c142e950/brokerage-bookings", async (c) => {
  try {
    const assigned_to_user_id = c.req.query("assigned_to_user_id");
    
    let bookings = await kv.getByPrefix("brokerage_booking:");
    
    // Filter by assigned user if provided (Operations team filtering)
    if (assigned_to_user_id) {
      bookings = bookings.filter((b: any) => 
        b.assigned_manager_id === assigned_to_user_id ||
        b.assigned_supervisor_id === assigned_to_user_id ||
        b.assigned_handler_id === assigned_to_user_id
      );
    }
    
    // Sort by createdAt descending (newest first)
    bookings.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`Retrieved ${bookings.length} brokerage bookings${assigned_to_user_id ? ` for user ${assigned_to_user_id}` : ''}`);
    
    return c.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching brokerage bookings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single brokerage booking
app.get("/make-server-c142e950/brokerage-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(`brokerage_booking:${id}`);
    
    if (!booking) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching brokerage booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create brokerage booking
app.post("/make-server-c142e950/brokerage-bookings", async (c) => {
  try {
    const bookingData = await c.req.json();
    
    // Get counter for booking number
    const counter = await kv.get("brokerage_booking_counter") || 0;
    const newCounter = counter + 1;
    await kv.set("brokerage_booking_counter", newCounter);
    
    // Generate booking ID: BRK-YYYY-NNN
    const year = new Date().getFullYear();
    const bookingId = `BRK-${year}-${String(newCounter).padStart(3, '0')}`;
    
    const timestamp = new Date().toISOString();
    
    const newBooking = {
      ...bookingData,
      bookingId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await kv.set(`brokerage_booking:${bookingId}`, newBooking);
    
    console.log(`Created brokerage booking ${bookingId}`);
    
    return c.json({ success: true, data: newBooking });
  } catch (error) {
    console.error("Error creating brokerage booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update brokerage booking
app.put("/make-server-c142e950/brokerage-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`brokerage_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      bookingId: id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`brokerage_booking:${id}`, updated);
    
    console.log(`Updated brokerage booking ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating brokerage booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete brokerage booking
app.delete("/make-server-c142e950/brokerage-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`brokerage_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    // Unlink from project if linked
    await unlinkBookingFromProject(existing, id);
    
    await kv.del(`brokerage_booking:${id}`);
    
    // Also delete associated billings and expenses
    const billings = await kv.getByPrefix(`billing:`);
    const expenses = await kv.getByPrefix(`expense:`);
    
    for (const billing of billings) {
      if (billing.bookingId === id) {
        await kv.del(`billing:${billing.billingId}`);
      }
    }
    
    for (const expense of expenses) {
      if (expense.bookingId === id) {
        await kv.del(`expense:${expense.expenseId}`);
      }
    }
    
    console.log(`Deleted brokerage booking ${id} and associated records`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting brokerage booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== OTHERS BOOKINGS ====================

// Get all others bookings
app.get("/make-server-c142e950/others-bookings", async (c) => {
  try {
    const assigned_to_user_id = c.req.query("assigned_to_user_id");
    
    let bookings = await kv.getByPrefix("others_booking:");
    
    // Filter by assigned user if provided (Operations team filtering)
    if (assigned_to_user_id) {
      bookings = bookings.filter((b: any) => 
        b.assigned_manager_id === assigned_to_user_id ||
        b.assigned_supervisor_id === assigned_to_user_id ||
        b.assigned_handler_id === assigned_to_user_id
      );
    }
    
    // Sort by createdAt descending (newest first)
    bookings.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`Retrieved ${bookings.length} others bookings${assigned_to_user_id ? ` for user ${assigned_to_user_id}` : ''}`);
    
    return c.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching others bookings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single others booking
app.get("/make-server-c142e950/others-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(`others_booking:${id}`);
    
    if (!booking) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching others booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create others booking
app.post("/make-server-c142e950/others-bookings", async (c) => {
  try {
    const bookingData = await c.req.json();
    
    // Get counter for booking number
    const counter = await kv.get("others_booking_counter") || 0;
    const newCounter = counter + 1;
    await kv.set("others_booking_counter", newCounter);
    
    // Generate booking ID: OTH-YYYY-NNN
    const year = new Date().getFullYear();
    const bookingId = `OTH-${year}-${String(newCounter).padStart(3, '0')}`;
    
    const timestamp = new Date().toISOString();
    
    const newBooking = {
      ...bookingData,
      bookingId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await kv.set(`others_booking:${bookingId}`, newBooking);
    
    console.log(`Created others booking ${bookingId}`);
    
    return c.json({ success: true, data: newBooking });
  } catch (error) {
    console.error("Error creating others booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update others booking
app.put("/make-server-c142e950/others-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`others_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      bookingId: id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`others_booking:${id}`, updated);
    
    console.log(`Updated others booking ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating others booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete others booking
app.delete("/make-server-c142e950/others-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`others_booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    // Unlink from project if linked
    await unlinkBookingFromProject(existing, id);
    
    await kv.del(`others_booking:${id}`);
    
    // Also delete associated billings and expenses
    const billings = await kv.getByPrefix(`billing:`);
    const expenses = await kv.getByPrefix(`expense:`);
    
    for (const billing of billings) {
      if (billing.bookingId === id) {
        await kv.del(`billing:${billing.billingId}`);
      }
    }
    
    for (const expense of expenses) {
      if (expense.bookingId === id) {
        await kv.del(`expense:${expense.expenseId}`);
      }
    }
    
    console.log(`Deleted others booking ${id} and associated records`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting others booking:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== BILLINGS ====================

// Get billings by booking ID
app.get("/make-server-c142e950/billings", async (c) => {
  try {
    const bookingId = c.req.query("bookingId");
    
    if (!bookingId) {
      return c.json({ success: false, error: "bookingId parameter required" }, 400);
    }
    
    const allBillings = await kv.getByPrefix("billing:");
    const bookingBillings = allBillings.filter((b: any) => b.bookingId === bookingId);
    
    // Sort by createdAt descending
    bookingBillings.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`Fetched ${bookingBillings.length} billings for booking ${bookingId}`);
    
    return c.json({ success: true, data: bookingBillings });
  } catch (error) {
    console.error("Error fetching billings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create billing
app.post("/make-server-c142e950/billings", async (c) => {
  try {
    const billingData = await c.req.json();
    
    const billingId = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    
    const newBilling = {
      ...billingData,
      billingId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await kv.set(`billing:${billingId}`, newBilling);
    
    console.log(`Created billing ${billingId} for booking ${billingData.bookingId}`);
    
    return c.json({ success: true, data: newBilling });
  } catch (error) {
    console.error("Error creating billing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update billing
app.put("/make-server-c142e950/billings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`billing:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Billing not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      billingId: id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`billing:${id}`, updated);
    
    console.log(`Updated billing ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating billing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete billing
app.delete("/make-server-c142e950/billings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`billing:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Billing not found" }, 404);
    }
    
    await kv.del(`billing:${id}`);
    
    console.log(`Deleted billing ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting billing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== EXPENSES ====================

// NOTE: GET /expenses handler consolidated above (line ~3395) to support both
// Accounting module (all expenses) and Operations module (filtered by bookingId)

// Create expense
app.post("/make-server-c142e950/expenses", async (c) => {
  try {
    const expenseData = await c.req.json();
    
    const expenseId = `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    
    const newExpense = {
      ...expenseData,
      expenseId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await kv.set(`expense:${expenseId}`, newExpense);
    
    console.log(`Created expense ${expenseId} for booking ${expenseData.bookingId}`);
    
    return c.json({ success: true, data: newExpense });
  } catch (error) {
    console.error("Error creating expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update expense
app.put("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`expense:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Expense not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      expenseId: id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`expense:${id}`, updated);
    
    console.log(`Updated expense ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete expense
app.delete("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`expense:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Expense not found" }, 404);
    }
    
    await kv.del(`expense:${id}`);
    
    console.log(`Deleted expense ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== E-VOUCHERS API ====================

// Helper function to generate E-Voucher number (EVRN-YEAR-XXX)
async function generateEVoucherNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EVRN-${year}-`;
  
  // Get all evouchers for current year
  const allEVouchers = await kv.getByPrefix("evoucher:");
  const currentYearEVouchers = allEVouchers.filter((ev: any) => 
    ev.voucher_number && ev.voucher_number.startsWith(prefix)
  );
  
  // Find highest number
  let maxNumber = 0;
  currentYearEVouchers.forEach((ev: any) => {
    const match = ev.voucher_number.match(/EVRN-\d{4}-(\d{3})/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  
  // Increment and format
  const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
  return `${prefix}${nextNumber}`;
}

// Helper function to generate type-specific E-Voucher number (EVRN-XX-YEAR-XXX)
async function generateTypedEVoucherNumber(voucherType: string): Promise<string> {
  const year = new Date().getFullYear();
  
  // Map voucher types to prefixes
  const typePrefixes: Record<string, string> = {
    'budget_request': 'BR',
    'expense': 'EX',
    'collection': 'CO',
    'billing': 'BI'
  };
  
  const typeCode = typePrefixes[voucherType] || 'GN'; // GN = General
  const prefix = `EVRN-${typeCode}-${year}-`;
  
  // Get all existing E-Vouchers of this type to find the max number
  const allEVouchers = await kv.getByPrefix('evoucher:');
  let maxNumber = 0;
  
  allEVouchers.forEach((voucher: any) => {
    if (voucher.voucher_number && voucher.voucher_number.startsWith(prefix)) {
      const numPart = voucher.voucher_number.split('-').pop();
      const num = parseInt(numPart || '0', 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  
  // Increment and format
  const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
  return `${prefix}${nextNumber}`;
}

// Helper function to add history entry
async function addEVoucherHistory(evoucherId: string, action: string, userId: string, userName: string, userRole: string, previousStatus?: string, newStatus?: string, notes?: string) {
  const historyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const historyEntry = {
    id: historyId,
    evoucher_id: evoucherId,
    action,
    previous_status: previousStatus,
    new_status: newStatus,
    performed_by: userId,
    performed_by_name: userName,
    performed_by_role: userRole,
    notes,
    created_at: new Date().toISOString()
  };
  
  await kv.set(`evoucher_history:${evoucherId}:${historyId}`, historyEntry);
  return historyEntry;
}

// Create new E-Voucher (draft)
app.post("/make-server-c142e950/evouchers", async (c) => {
  try {
    let evoucherData;
    
    // Safely parse JSON with better error handling
    try {
      const text = await c.req.text();
      console.log('Received E-Voucher request body length:', text.length);
      
      if (!text || text.trim() === '') {
        return c.json({ success: false, error: "Request body is empty" }, 400);
      }
      
      evoucherData = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing E-Voucher request JSON:", parseError);
      return c.json({ 
        success: false, 
        error: `Invalid JSON in request body: ${parseError instanceof Error ? parseError.message : String(parseError)}` 
      }, 400);
    }
    
    // Generate type-specific E-Voucher number
    const voucherType = evoucherData.voucher_type || evoucherData.transaction_type || "expense";
    const voucherNumber = await generateTypedEVoucherNumber(voucherType);
    const id = `EV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const now = new Date().toISOString();
    
    // Ensure amount field exists (handle both 'amount' and 'total_amount')
    const amount = evoucherData.amount ?? evoucherData.total_amount ?? 0;
    
    const evoucher = {
      id,
      voucher_number: voucherNumber,
      status: evoucherData.status || "draft", // Allow setting status on creation
      posted_to_ledger: false,
      // Voucher type (new field)
      voucher_type: voucherType,
      // Universal transaction fields (with defaults for backward compatibility)
      transaction_type: voucherType, // Keep for backward compatibility
      source_module: evoucherData.source_module || "accounting",
      // Ensure required fields have defaults
      request_date: evoucherData.request_date || now,
      currency: evoucherData.currency || "PHP",
      amount: amount, // Standardize on 'amount' field
      approvers: evoucherData.approvers || [],
      workflow_history: evoucherData.workflow_history || [],
      ...evoucherData,
      amount: amount, // Set again after spread to ensure it's not overwritten
      created_at: now,
      updated_at: now
    };
    
    await kv.set(`evoucher:${id}`, evoucher);
    
    // Add history entry
    await addEVoucherHistory(
      id,
      "Created E-Voucher",
      evoucherData.requestor_id || "system",
      evoucherData.requestor_name || "System",
      evoucherData.requestor_department || "User",
      undefined,
      "draft"
    );
    
    console.log(`✅ Created E-Voucher ${voucherNumber} (${id}) [Type: ${evoucher.transaction_type}, Module: ${evoucher.source_module}]`);
    
    return c.json({ success: true, data: evoucher });
  } catch (error) {
    console.error("Error creating E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all E-Vouchers (with filters)
app.get("/make-server-c142e950/evouchers", async (c) => {
  try {
    const status = c.req.query("status");
    const transactionType = c.req.query("transaction_type");
    const sourceModule = c.req.query("source_module");
    const requestorId = c.req.query("requestor_id");
    const dateFrom = c.req.query("date_from");
    const dateTo = c.req.query("date_to");
    const search = c.req.query("search");
    
    console.log(`🔍 [GET /evouchers] Fetching with filters:`, {
      status: status || 'all',
      transactionType: transactionType || 'all',
      sourceModule: sourceModule || 'all',
      requestorId,
      dateFrom,
      dateTo,
      search
    });
    
    let evouchers = await kv.getByPrefix("evoucher:");
    
    console.log(`📦 [GET /evouchers] Found ${evouchers.length} total E-Vouchers before filtering`);
    
    // Apply filters
    if (status && status !== "all") {
      evouchers = evouchers.filter((ev: any) => ev.status === status);
      console.log(`📦 [GET /evouchers] After status filter: ${evouchers.length} E-Vouchers`);
    }
    
    if (transactionType && transactionType !== "all") {
      const beforeCount = evouchers.length;
      evouchers = evouchers.filter((ev: any) => ev.transaction_type === transactionType);
      console.log(`📦 [GET /evouchers] After transaction_type filter (${transactionType}): ${evouchers.length} E-Vouchers (was ${beforeCount})`);
    }
    
    if (sourceModule && sourceModule !== "all") {
      const beforeCount = evouchers.length;
      evouchers = evouchers.filter((ev: any) => ev.source_module === sourceModule);
      console.log(`📦 [GET /evouchers] After source_module filter (${sourceModule}): ${evouchers.length} E-Vouchers (was ${beforeCount})`);
    }
    
    if (requestorId) {
      evouchers = evouchers.filter((ev: any) => ev.requestor_id === requestorId);
    }
    
    if (dateFrom) {
      evouchers = evouchers.filter((ev: any) => 
        new Date(ev.request_date || ev.created_at) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      evouchers = evouchers.filter((ev: any) => 
        new Date(ev.request_date || ev.created_at) <= new Date(dateTo)
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      evouchers = evouchers.filter((ev: any) =>
        ev.voucher_number?.toLowerCase().includes(searchLower) ||
        ev.purpose?.toLowerCase().includes(searchLower) ||
        ev.vendor_name?.toLowerCase().includes(searchLower) ||
        ev.requestor_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created_at descending
    evouchers.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ [GET /evouchers] Returning ${evouchers.length} E-Vouchers`);
    if (evouchers.length > 0) {
      console.log(`📋 [GET /evouchers] First E-Voucher sample:`, {
        id: evouchers[0].id,
        voucher_number: evouchers[0].voucher_number,
        transaction_type: evouchers[0].transaction_type,
        source_module: evouchers[0].source_module,
        status: evouchers[0].status
      });
    }
    
    return c.json({ success: true, data: evouchers });
  } catch (error) {
    console.error("Error fetching E-Vouchers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get pending approvals (Accounting Staff only)
app.get("/make-server-c142e950/evouchers/pending", async (c) => {
  try {
    const evouchers = await kv.getByPrefix("evoucher:");
    const pending = evouchers.filter((ev: any) => ev.status === "pending");
    
    // Sort by submitted_at ascending (oldest first)
    pending.sort((a: any, b: any) => 
      new Date(a.submitted_at || a.created_at).getTime() - 
      new Date(b.submitted_at || b.created_at).getTime()
    );
    
    console.log(`Fetched ${pending.length} pending E-Vouchers for approval`);
    
    return c.json({ success: true, data: pending });
  } catch (error) {
    console.error("Error fetching pending E-Vouchers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user's own E-Vouchers
app.get("/make-server-c142e950/evouchers/my-evouchers", async (c) => {
  try {
    const requestorId = c.req.query("requestor_id");
    
    if (!requestorId) {
      return c.json({ success: false, error: "requestor_id required" }, 400);
    }
    
    const evouchers = await kv.getByPrefix("evoucher:");
    const myEVouchers = evouchers.filter((ev: any) => ev.requestor_id === requestorId);
    
    // Sort by created_at descending
    myEVouchers.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`Fetched ${myEVouchers.length} E-Vouchers for user ${requestorId}`);
    
    return c.json({ success: true, data: myEVouchers });
  } catch (error) {
    console.error("Error fetching user E-Vouchers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single E-Voucher by ID
app.get("/make-server-c142e950/evouchers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const evoucher = await kv.get(`evoucher:${id}`);
    
    if (!evoucher) {
      return c.json({ success: false, error: "E-Voucher not found" }, 404);
    }
    
    return c.json({ success: true, data: evoucher });
  } catch (error) {
    console.error("Error fetching E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get E-Voucher history
app.get("/make-server-c142e950/evouchers/:id/history", async (c) => {
  try {
    const id = c.req.param("id");
    const history = await kv.getByPrefix(`evoucher_history:${id}:`);
    
    // Sort by created_at ascending (oldest first)
    history.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return c.json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching E-Voucher history:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update E-Voucher (draft only)
app.put("/make-server-c142e950/evouchers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`evoucher:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "E-Voucher not found" }, 404);
    }
    
    if (existing.status !== "draft") {
      return c.json({ 
        success: false, 
        error: "Only draft E-Vouchers can be edited" 
      }, 400);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`evoucher:${id}`, updated);
    
    console.log(`Updated E-Voucher ${existing.voucher_number} (${id})`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit E-Voucher for approval
app.post("/make-server-c142e950/evouchers/:id/submit", async (c) => {
  try {
    const id = c.req.param("id");
    
    let requestBody;
    try {
      const text = await c.req.text();
      console.log('Received submit request body length:', text.length);
      
      if (!text || text.trim() === '') {
        return c.json({ success: false, error: "Request body is empty" }, 400);
      }
      
      requestBody = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing submit request JSON:", parseError);
      return c.json({ 
        success: false, 
        error: `Invalid JSON in request body: ${parseError instanceof Error ? parseError.message : String(parseError)}` 
      }, 400);
    }
    
    const { user_id, user_name, user_role } = requestBody;
    
    const existing = await kv.get(`evoucher:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "E-Voucher not found" }, 404);
    }
    
    if (existing.status !== "draft") {
      return c.json({ 
        success: false, 
        error: "Only draft E-Vouchers can be submitted" 
      }, 400);
    }
    
    const updated = {
      ...existing,
      status: "pending",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`evoucher:${id}`, updated);
    
    // Add history entry
    await addEVoucherHistory(
      id,
      "Submitted for Approval",
      user_id,
      user_name,
      user_role,
      "draft",
      "pending"
    );
    
    console.log(`E-Voucher ${existing.voucher_number} submitted for approval`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error submitting E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Approve E-Voucher (does NOT post to ledger - separate step)
app.post("/make-server-c142e950/evouchers/:id/approve", async (c) => {
  try {
    const id = c.req.param("id");
    const { user_id, user_name, user_role, notes } = await c.req.json();
    
    const existing = await kv.get(`evoucher:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "E-Voucher not found" }, 404);
    }
    
    // Accept multiple statuses for approval
    if (existing.status !== "pending" && existing.status !== "Submitted" && existing.status !== "Draft") {
      return c.json({ 
        success: false, 
        error: "Only pending/submitted/draft E-Vouchers can be approved" 
      }, 400);
    }
    
    // Update E-Voucher to approved status (but NOT posted to ledger yet)
    const updated = {
      ...existing,
      status: "Approved",
      approved_at: new Date().toISOString(),
      approved_by: user_id,
      approved_by_name: user_name,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`evoucher:${id}`, updated);
    
    // Add history entry
    await addEVoucherHistory(
      id,
      "Approved by Accounting",
      user_id,
      user_name,
      user_role,
      existing.status,
      "Approved",
      notes
    );
    
    console.log(`E-Voucher ${existing.voucher_number} approved by ${user_name}`);
    
    return c.json({ 
      success: true, 
      data: updated
    });
  } catch (error) {
    console.error("Error approving E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Post E-Voucher to Ledger (separate step after approval)
// Routes to correct module based on transaction_type
app.post("/make-server-c142e950/evouchers/:id/post-to-ledger", async (c) => {
  try {
    const id = c.req.param("id");
    const { user_id, user_name, user_role } = await c.req.json();
    
    const existing = await kv.get(`evoucher:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "E-Voucher not found" }, 404);
    }
    
    if (existing.status !== "Approved") {
      return c.json({ 
        success: false, 
        error: "Only approved E-Vouchers can be posted to ledger" 
      }, 400);
    }
    
    if (existing.posted_to_ledger) {
      return c.json({ 
        success: false, 
        error: "E-Voucher has already been posted to ledger" 
      }, 400);
    }
    
    // Route to correct module based on transaction_type
    const transactionType = existing.transaction_type || "expense";
    
    switch (transactionType) {
      case "collection":
        // Delegate to collections handler
        return accountingHandlers.postEVoucherToCollections(c);
        
      case "billing":
        // Delegate to billings handler
        return accountingHandlers.postEVoucherToBillings(c);
        
      case "expense":
      case "budget_request":
      case "adjustment":
      case "reimbursement":
      default:
        // Create expense entry
        const expenseId = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const expense = {
          id: expenseId,
          evoucher_id: id,
          evoucher_number: existing.voucher_number,
          date: existing.request_date || existing.created_at,
          vendor: existing.vendor_name,
          category: existing.expense_category || existing.gl_category,
          sub_category: existing.sub_category || existing.gl_sub_category,
          amount: existing.amount,
          currency: existing.currency || "PHP",
          description: existing.description || existing.purpose,
          project_number: existing.project_number,
          customer_name: existing.customer_name,
          requestor_id: existing.requestor_id,
          requestor_name: existing.requestor_name,
          posted_by: user_id,
          posted_by_name: user_name,
          posted_at: new Date().toISOString(),
          status: "posted",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await kv.set(`expense:${expenseId}`, expense);
        
        // Update E-Voucher status
        const updated = {
          ...existing,
          status: "Posted",
          posted_to_ledger: true,
          ledger_entry_id: expenseId,
          ledger_entry_type: "expense",
          posted_at: new Date().toISOString(),
          posted_by: user_id,
          posted_by_name: user_name,
          updated_at: new Date().toISOString()
        };
        
        await kv.set(`evoucher:${id}`, updated);
        
        // Add history entry
        await addEVoucherHistory(
          id,
          "Posted to Expenses Ledger",
          user_id,
          user_name,
          user_role,
          "Approved",
          "Posted"
        );
        
        console.log(`✅ E-Voucher ${existing.voucher_number} posted to Expenses (${expenseId})`);
        
        return c.json({ 
          success: true, 
          data: updated,
          expense_id: expenseId
        });
    }
  } catch (error) {
    console.error("Error posting E-Voucher to ledger:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reject E-Voucher
app.post("/make-server-c142e950/evouchers/:id/reject", async (c) => {
  try {
    const id = c.req.param("id");
    const { user_id, user_name, user_role, rejection_reason } = await c.req.json();
    
    const existing = await kv.get(`evoucher:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "E-Voucher not found" }, 404);
    }
    
    if (existing.status !== "pending") {
      return c.json({ 
        success: false, 
        error: "Only pending E-Vouchers can be rejected" 
      }, 400);
    }
    
    const updated = {
      ...existing,
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejected_by: user_id,
      rejected_by_name: user_name,
      rejection_reason,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`evoucher:${id}`, updated);
    
    // Add history entry
    await addEVoucherHistory(
      id,
      "Rejected",
      user_id,
      user_name,
      user_role,
      "pending",
      "rejected",
      rejection_reason
    );
    
    console.log(`E-Voucher ${existing.voucher_number} rejected by ${user_name}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error rejecting E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Cancel E-Voucher
app.post("/make-server-c142e950/evouchers/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");
    const { user_id, user_name, user_role } = await c.req.json();
    
    const existing = await kv.get(`evoucher:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "E-Voucher not found" }, 404);
    }
    
    if (existing.status !== "draft" && existing.status !== "rejected") {
      return c.json({ 
        success: false, 
        error: "Only draft or rejected E-Vouchers can be cancelled" 
      }, 400);
    }
    
    const previousStatus = existing.status;
    
    const updated = {
      ...existing,
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`evoucher:${id}`, updated);
    
    // Add history entry
    await addEVoucherHistory(
      id,
      "Cancelled",
      user_id,
      user_name,
      user_role,
      previousStatus,
      "cancelled"
    );
    
    console.log(`E-Voucher ${existing.voucher_number} cancelled by ${user_name}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error cancelling E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Auto-Approve (Create & Approve in one step - Accounting Staff only)
app.post("/make-server-c142e950/evouchers/auto-approve", async (c) => {
  try {
    const evoucherData = await c.req.json();
    const { user_id, user_name, user_role } = evoucherData;
    
    // Generate E-Voucher number
    const voucherNumber = await generateEVoucherNumber();
    const id = `EV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create expense entry immediately
    const expenseId = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expense = {
      id: expenseId,
      expense_name: evoucherData.purpose,
      booking_id: evoucherData.project_number,
      category: evoucherData.expense_category || evoucherData.gl_sub_category,
      amount: evoucherData.amount,
      currency: evoucherData.currency,
      status: "Approved",
      vendor: evoucherData.vendor_name,
      description: evoucherData.description || evoucherData.purpose,
      request_date: evoucherData.request_date || new Date().toISOString(),
      created_from_evoucher_id: id,
      created_by: user_id,
      is_adjustment: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`expense:${expenseId}`, expense);
    
    // Create E-Voucher in posted status
    const evoucher = {
      id,
      voucher_number: voucherNumber,
      status: "posted",
      posted_to_ledger: true,
      ledger_expense_id: expenseId,
      approved_at: new Date().toISOString(),
      approved_by: user_id,
      approved_by_name: user_name,
      submitted_at: new Date().toISOString(),
      ...evoucherData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`evoucher:${id}`, evoucher);
    
    // Add history entries
    await addEVoucherHistory(
      id,
      "Created with Auto-Approve",
      user_id,
      user_name,
      user_role,
      undefined,
      "posted",
      "Created and approved in one step by Accounting Staff"
    );
    
    console.log(`Auto-approved E-Voucher ${voucherNumber} (${id}) → Expense ${expenseId}`);
    
    return c.json({ 
      success: true, 
      data: evoucher,
      expense_id: expenseId
    });
  } catch (error) {
    console.error("Error auto-approving E-Voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ACCOUNTING MODULE API (CLEAN & CONSOLIDATED) ====================
// All accounting transactions MUST come from approved E-Vouchers
// Direct creation bypassing E-Vouchers is NOT allowed

// EXPENSES - Read-only, populated from posted E-Vouchers
app.get("/make-server-c142e950/accounting/expenses", accountingHandlers.getExpenses);
app.get("/make-server-c142e950/accounting/expenses/:id", accountingHandlers.getExpenseById);
app.delete("/make-server-c142e950/accounting/expenses/:id", accountingHandlers.deleteExpense);

// COLLECTIONS - Read-only, populated from posted E-Vouchers
app.get("/make-server-c142e950/accounting/collections", accountingHandlers.getCollections);
app.get("/make-server-c142e950/accounting/collections/:id", accountingHandlers.getCollectionById);
app.post("/make-server-c142e950/evouchers/:id/post-to-collections", accountingHandlers.postEVoucherToCollections);
app.delete("/make-server-c142e950/accounting/collections/:id", accountingHandlers.deleteCollection);

// BILLINGS - Read-only, populated from posted E-Vouchers
app.get("/make-server-c142e950/accounting/billings", accountingHandlers.getBillings);
app.get("/make-server-c142e950/accounting/billings/:id", accountingHandlers.getBillingById);
app.post("/make-server-c142e950/evouchers/:id/post-to-billings", accountingHandlers.postEVoucherToBillings);
app.patch("/make-server-c142e950/accounting/billings/:id/payment", accountingHandlers.updateBillingPayment);
app.delete("/make-server-c142e950/accounting/billings/:id", accountingHandlers.deleteBilling);

// ==================== COMPREHENSIVE SEED DATA ====================
// This creates realistic data showing the BD → PD → BD → OPS relay race in action

import { seedComprehensiveData } from "./seed_data.tsx";

app.post("/make-server-c142e950/seed/comprehensive", async (c) => {
  try {
    console.log("Starting comprehensive seed...");
    
    const result = await seedComprehensiveData();
    
    return c.json({ 
      success: true, 
      message: "Comprehensive seed completed successfully!",
      summary: result.summary
    });
  } catch (error) {
    console.error("Error during comprehensive seed:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear all seed data (for testing)
app.delete("/make-server-c142e950/seed/clear", async (c) => {
  try {
    console.log("Clearing all seed data...");
    
    // Clear customers
    const customers = await kv.getByPrefix("customer:");
    for (const customer of customers) {
      await kv.del(`customer:${customer.id}`);
    }
    
    // Clear quotations
    const quotations = await kv.getByPrefix("quotation:");
    for (const quotation of quotations) {
      await kv.del(`quotation:${quotation.id}`);
    }
    
    // Clear projects
    const projects = await kv.getByPrefix("project:");
    for (const project of projects) {
      await kv.del(`project:${project.id}`);
    }
    
    // Clear bookings (all service types)
    const forwardingBookings = await kv.getByPrefix("forwarding_booking:");
    for (const booking of forwardingBookings) {
      await kv.del(`forwarding_booking:${booking.id}`);
    }
    
    const brokerageBookings = await kv.getByPrefix("brokerage_booking:");
    for (const booking of brokerageBookings) {
      await kv.del(`brokerage_booking:${booking.id}`);
    }
    
    const truckingBookings = await kv.getByPrefix("trucking_booking:");
    for (const booking of truckingBookings) {
      await kv.del(`trucking_booking:${booking.id}`);
    }
    
    const insuranceBookings = await kv.getByPrefix("marine_insurance_booking:");
    for (const booking of insuranceBookings) {
      await kv.del(`marine_insurance_booking:${booking.id}`);
    }
    
    const othersBookings = await kv.getByPrefix("others_booking:");
    for (const booking of othersBookings) {
      await kv.del(`others_booking:${booking.id}`);
    }
    
    // Also clear any legacy bookings with old prefix
    const legacyBookings = await kv.getByPrefix("booking:");
    for (const booking of legacyBookings) {
      await kv.del(`booking:${booking.id}`);
    }
    
    const totalBookings = forwardingBookings.length + brokerageBookings.length + 
                          truckingBookings.length + insuranceBookings.length + 
                          othersBookings.length + legacyBookings.length;
    
    console.log(`Cleared ${customers.length} customers, ${quotations.length} quotations, ${projects.length} projects, and ${totalBookings} bookings`);
    
    return c.json({ 
      success: true, 
      message: "Seed data cleared successfully",
      summary: {
        customers_cleared: customers.length,
        quotations_cleared: quotations.length,
        projects_cleared: projects.length,
        bookings_cleared: totalBookings
      }
    });
  } catch (error) {
    console.error("Error clearing seed data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMERS API ====================

// Get all customers
app.get("/make-server-c142e950/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    
    // Sort by created_at descending
    customers.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    console.log(`Fetched ${customers.length} customers`);
    
    return c.json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single customer by ID
app.get("/make-server-c142e950/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);
    
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // Fetch all contacts for this customer
    const allContacts = await kv.getByPrefix("contact:");
    const customerContacts = allContacts.filter((contact: any) => contact.customer_id === id);
    
    // Sort contacts by created_at descending
    customerContacts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Fetch all quotations for this customer
    const allQuotations = await kv.getByPrefix("quotation:");
    const customerQuotations = allQuotations.filter((q: any) => q.customer_id === id);
    
    // Sort quotations by created_at descending
    customerQuotations.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`Fetched customer ${id} with ${customerContacts.length} contacts and ${customerQuotations.length} quotations`);
    
    return c.json({ 
      success: true, 
      data: {
        ...customer,
        contacts: customerContacts,
        quotations: customerQuotations
      }
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create customer
app.post("/make-server-c142e950/customers", async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate customer ID
    const timestamp = Date.now();
    const id = `CUST-${timestamp}`;
    
    const customer = {
      id,
      name: data.name,
      industry: data.industry || null,
      registered_address: data.registered_address || null,
      status: data.status || "Prospect",
      lead_source: data.lead_source || null,
      owner_id: data.owner_id || null,
      credit_terms: data.credit_terms || "Net 30",
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      created_by: data.created_by || null,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`customer:${id}`, customer);
    
    console.log(`Created customer: ${id} - ${customer.name}`);
    
    return c.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update customer
app.put("/make-server-c142e950/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const existing = await kv.get(`customer:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    const customer = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      created_at: existing.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`customer:${id}`, customer);
    
    console.log(`Updated customer: ${id}`);
    
    return c.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete customer
app.delete("/make-server-c142e950/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`customer:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    await kv.del(`customer:${id}`);
    
    console.log(`Deleted customer: ${id}`);
    
    return c.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed customers
app.post("/make-server-c142e950/customers/seed", async (c) => {
  try {
    // Clear existing customers
    const existingCustomers = await kv.getByPrefix("customer:");
    for (const customer of existingCustomers) {
      await kv.del(`customer:${customer.id}`);
    }
    
    const seedCustomers = [
      {
        id: "CUST-001",
        name: "Manila Electronics Corp",
        industry: "Electronics",
        registered_address: "123 Ayala Avenue, Makati City",
        status: "Active",
        lead_source: "Referral",
        owner_id: "user-bd-rep-001",
        credit_terms: "Net 30",
        phone: "+63 2 8123 4567",
        email: "procurement@mec.com.ph",
        notes: null,
        created_at: new Date().toISOString(),
        created_by: "user-bd-rep-001",
        updated_at: new Date().toISOString(),
      },
      {
        id: "CUST-002",
        name: "Pacific Trading Inc",
        industry: "General Merchandise",
        registered_address: "456 Roxas Boulevard, Pasay City",
        status: "Active",
        lead_source: "Cold Outreach",
        owner_id: "user-bd-rep-001",
        credit_terms: "Net 45",
        phone: "+63 2 8234 5678",
        email: "operations@pacifictrade.ph",
        notes: null,
        created_at: new Date().toISOString(),
        created_by: "user-bd-rep-001",
        updated_at: new Date().toISOString(),
      },
      {
        id: "CUST-003",
        name: "Global Garments Ltd",
        industry: "Garments",
        registered_address: "789 Ortigas Center, Pasig City",
        status: "Active",
        lead_source: "Website Inquiry",
        owner_id: "user-bd-manager-001",
        credit_terms: "Net 30",
        phone: "+63 2 8345 6789",
        email: "logistics@globalgarments.ph",
        notes: null,
        created_at: new Date().toISOString(),
        created_by: "user-bd-manager-001",
        updated_at: new Date().toISOString(),
      },
      {
        id: "CUST-004",
        name: "Prime Pharmaceuticals",
        industry: "Pharmaceutical",
        registered_address: "321 BGC, Taguig City",
        status: "Prospect",
        lead_source: "Trade Show",
        owner_id: "user-bd-rep-001",
        credit_terms: "Net 15",
        phone: "+63 2 8456 7890",
        email: "supply@primepharma.ph",
        notes: null,
        created_at: new Date().toISOString(),
        created_by: "user-bd-rep-001",
        updated_at: new Date().toISOString(),
      },
      {
        id: "CUST-005",
        name: "Metro Food Distributors",
        industry: "Food & Beverage",
        registered_address: "654 Quezon Avenue, Quezon City",
        status: "Active",
        lead_source: "Referral",
        owner_id: "user-bd-manager-001",
        credit_terms: "Net 30",
        phone: "+63 2 8567 8901",
        email: "procurement@metrofood.ph",
        notes: null,
        created_at: new Date().toISOString(),
        created_by: "user-bd-manager-001",
        updated_at: new Date().toISOString(),
      },
    ];
    
    for (const customer of seedCustomers) {
      await kv.set(`customer:${customer.id}`, customer);
      console.log(`Seeded customer: ${customer.id} - ${customer.name}`);
    }
    
    return c.json({ 
      success: true, 
      message: "Customers seeded successfully",
      data: seedCustomers 
    });
  } catch (error) {
    console.error("Error seeding customers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear all customers
app.delete("/make-server-c142e950/customers/clear", async (c) => {
  try {
    const existingCustomers = await kv.getByPrefix("customer:");
    let count = 0;
    
    for (const customer of existingCustomers) {
      await kv.del(`customer:${customer.id}`);
      count++;
    }
    
    console.log(`Cleared ${count} customers`);
    
    return c.json({ 
      success: true, 
      message: `Cleared ${count} customers`,
      count 
    });
  } catch (error) {
    console.error("Error clearing customers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CONTACTS API ====================

// Get all contacts (optionally filter by customer_id)
app.get("/make-server-c142e950/contacts", async (c) => {
  try {
    const customer_id = c.req.query("customer_id");
    
    let contacts = await kv.getByPrefix("contact:");
    
    // Filter by customer if provided
    if (customer_id) {
      contacts = contacts.filter((contact: any) => contact.customer_id === customer_id);
    }
    
    // Enrich contacts with company names
    const enrichedContacts = await Promise.all(
      contacts.map(async (contact: any) => {
        if (contact.customer_id) {
          const customer = await kv.get(`customer:${contact.customer_id}`);
          return {
            ...contact,
            company: customer?.name || ''
          };
        }
        return {
          ...contact,
          company: ''
        };
      })
    );
    
    // Sort by created_at descending
    enrichedContacts.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    console.log(`Fetched ${enrichedContacts.length} contacts${customer_id ? ` for customer ${customer_id}` : ''}`);
    
    return c.json({ success: true, data: enrichedContacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single contact by ID
app.get("/make-server-c142e950/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const contact = await kv.get(`contact:${id}`);
    
    if (!contact) {
      return c.json({ success: false, error: "Contact not found" }, 404);
    }
    
    // Enrich with company name
    let enrichedContact = contact;
    if (contact.customer_id) {
      const customer = await kv.get(`customer:${contact.customer_id}`);
      enrichedContact = {
        ...contact,
        company: customer?.name || ''
      };
    } else {
      enrichedContact = {
        ...contact,
        company: ''
      };
    }
    
    return c.json({ success: true, data: enrichedContact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create contact
app.post("/make-server-c142e950/contacts", async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate contact ID
    const timestamp = Date.now();
    const id = `CONTACT-${timestamp}`;
    
    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];
    
    const contact = {
      id,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      title: data.title || null,
      email: data.email || null,
      phone: data.phone || null,
      customer_id: data.customer_id || null, // Optional - can be standalone
      owner_id: data.owner_id || null,
      lifecycle_stage: data.lifecycle_stage || "Lead",
      lead_status: data.lead_status || "New",
      company: data.company || "",
      status: data.status || "Lead",
      last_activity: now,
      created_date: dateOnly,
      notes: data.notes || null,
      created_at: now,
      created_by: data.created_by || null,
      updated_at: now,
    };
    
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    
    await kv.set(`contact:${id}`, contact);
    
    console.log(`Created contact: ${id} - ${fullName}${contact.customer_id ? ` for customer ${contact.customer_id}` : ''}`);
    
    return c.json({ success: true, data: contact });
  } catch (error) {
    console.error("Error creating contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update contact
app.put("/make-server-c142e950/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const existing = await kv.get(`contact:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Contact not found" }, 404);
    }
    
    const contact = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      created_at: existing.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`contact:${id}`, contact);
    
    console.log(`Updated contact: ${id}`);
    
    return c.json({ success: true, data: contact });
  } catch (error) {
    console.error("Error updating contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ⚠️ IMPORTANT: Specific routes must come BEFORE parameterized routes
// Clear all contacts - must be before /contacts/:id
app.delete("/make-server-c142e950/contacts/clear", async (c) => {
  try {
    const existingContacts = await kv.getByPrefix("contact:");
    let count = 0;
    
    for (const contact of existingContacts) {
      await kv.del(`contact:${contact.id}`);
      count++;
    }
    
    console.log(`Cleared ${count} contacts`);
    
    return c.json({ 
      success: true, 
      message: `Cleared ${count} contacts`,
      count 
    });
  } catch (error) {
    console.error("Error clearing contacts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Migrate contacts from old schema (name field) to new schema (first_name, last_name)
app.post("/make-server-c142e950/contacts/migrate-names", async (c) => {
  try {
    const contacts = await kv.getByPrefix("contact:");
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const contact of contacts) {
      // Check if contact has old 'name' field but no first_name/last_name
      if (contact.name && (!contact.first_name || !contact.last_name)) {
        // Split name into first and last name
        const nameParts = contact.name.trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';
        
        // Update contact with new schema
        const updatedContact = {
          ...contact,
          first_name,
          last_name,
          updated_at: new Date().toISOString()
        };
        
        // Remove old 'name' field
        delete updatedContact.name;
        
        await kv.set(`contact:${contact.id}`, updatedContact);
        console.log(`Migrated contact ${contact.id}: "${contact.name}" → first_name: "${first_name}", last_name: "${last_name}"`);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`);
    
    return c.json({ 
      success: true, 
      message: `Migrated ${migratedCount} contacts from old schema to new schema`,
      migrated: migratedCount,
      skipped: skippedCount
    });
  } catch (error) {
    console.error("Error migrating contacts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete contact (parameterized route must come after specific routes)
app.delete("/make-server-c142e950/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`contact:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Contact not found" }, 404);
    }
    
    await kv.del(`contact:${id}`);
    
    console.log(`Deleted contact: ${id}`);
    
    return c.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ⚠️ REMOVED: Seed contacts endpoint
// Contact seed data endpoint has been removed to prevent fake data pollution
// Users should create real contacts through the UI instead

// ==================== TASKS API ====================

// Get all tasks (optionally filter by customer_id, contact_id, status, or owner_id)
app.get("/make-server-c142e950/tasks", async (c) => {
  try {
    const customerId = c.req.query("customer_id");
    const contactId = c.req.query("contact_id");
    const status = c.req.query("status");
    const ownerId = c.req.query("owner_id");
    
    let tasks = await kv.getByPrefix("task:");
    
    // Apply filters
    if (customerId) {
      tasks = tasks.filter((task: any) => task.customer_id === customerId);
    }
    if (contactId) {
      tasks = tasks.filter((task: any) => task.contact_id === contactId);
    }
    if (status) {
      tasks = tasks.filter((task: any) => task.status === status);
    }
    if (ownerId) {
      tasks = tasks.filter((task: any) => task.owner_id === ownerId);
    }
    
    // Sort by due_date ascending (earliest first), then by created_at descending
    tasks.sort((a: any, b: any) => {
      const dueDateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (dueDateDiff !== 0) return dueDateDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    console.log(`Fetched ${tasks.length} tasks`);
    
    return c.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single task by ID
app.get("/make-server-c142e950/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const task = await kv.get(`task:${id}`);
    
    if (!task) {
      return c.json({ success: false, error: "Task not found" }, 404);
    }
    
    return c.json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create task
app.post("/make-server-c142e950/tasks", async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate task ID
    const timestamp = Date.now();
    const id = `TASK-${timestamp}`;
    
    const task = {
      id,
      title: data.title,
      type: data.type,
      due_date: data.due_date,
      priority: data.priority || "Medium",
      status: data.status || "Pending",
      cancel_reason: data.cancel_reason || null,
      remarks: data.remarks || null,
      contact_id: data.contact_id || null,
      customer_id: data.customer_id || null,
      owner_id: data.owner_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`task:${id}`, task);
    
    console.log(`Created task: ${id} - ${task.title}`);
    
    return c.json({ success: true, data: task });
  } catch (error) {
    console.error("Error creating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update task
app.put("/make-server-c142e950/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const existing = await kv.get(`task:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Task not found" }, 404);
    }
    
    const task = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      created_at: existing.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`task:${id}`, task);
    
    console.log(`Updated task: ${id}`);
    
    return c.json({ success: true, data: task });
  } catch (error) {
    console.error("Error updating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete task
app.delete("/make-server-c142e950/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`task:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Task not found" }, 404);
    }
    
    await kv.del(`task:${id}`);
    
    console.log(`Deleted task: ${id}`);
    
    return c.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ACTIVITIES API ====================

// Get all activities (optionally filter by customer_id, contact_id, or user_id)
app.get("/make-server-c142e950/activities", async (c) => {
  try {
    const customerId = c.req.query("customer_id");
    const contactId = c.req.query("contact_id");
    const userId = c.req.query("user_id");
    
    let activities = await kv.getByPrefix("activity:");
    
    // Apply filters
    if (customerId) {
      activities = activities.filter((activity: any) => activity.customer_id === customerId);
    }
    if (contactId) {
      activities = activities.filter((activity: any) => activity.contact_id === contactId);
    }
    if (userId) {
      activities = activities.filter((activity: any) => activity.user_id === userId);
    }
    
    // Sort by date descending (most recent first)
    activities.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    console.log(`Fetched ${activities.length} activities`);
    
    return c.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single activity by ID
app.get("/make-server-c142e950/activities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const activity = await kv.get(`activity:${id}`);
    
    if (!activity) {
      return c.json({ success: false, error: "Activity not found" }, 404);
    }
    
    return c.json({ success: true, data: activity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create activity
app.post("/make-server-c142e950/activities", async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate activity ID
    const timestamp = Date.now();
    const id = `ACTIVITY-${timestamp}`;
    
    const activity = {
      id,
      type: data.type,
      description: data.description,
      date: data.date || new Date().toISOString(),
      contact_id: data.contact_id || null,
      customer_id: data.customer_id || null,
      task_id: data.task_id || null,
      user_id: data.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`activity:${id}`, activity);
    
    console.log(`Created activity: ${id} - ${activity.type}`);
    
    return c.json({ success: true, data: activity });
  } catch (error) {
    console.error("Error creating activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete activity
app.delete("/make-server-c142e950/activities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Check if activity exists
    const activity = await kv.get(`activity:${id}`);
    if (!activity) {
      return c.json({ success: false, error: "Activity not found" }, 404);
    }
    
    // Delete the activity
    await kv.del(`activity:${id}`);
    
    console.log(`Deleted activity: ${id}`);
    
    return c.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== BUDGET REQUESTS API ====================

// Get all budget requests (optionally filter by customer_id or status)
app.get("/make-server-c142e950/budget-requests", async (c) => {
  try {
    const customerId = c.req.query("customer_id");
    const status = c.req.query("status");
    
    let budgetRequests = await kv.getByPrefix("budget_request:");
    
    // Apply filters
    if (customerId) {
      budgetRequests = budgetRequests.filter((br: any) => br.customer_id === customerId);
    }
    if (status) {
      budgetRequests = budgetRequests.filter((br: any) => br.status === status);
    }
    
    // Sort by created_at descending
    budgetRequests.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    console.log(`Fetched ${budgetRequests.length} budget requests`);
    
    return c.json({ success: true, data: budgetRequests });
  } catch (error) {
    console.error("Error fetching budget requests:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single budget request by ID
app.get("/make-server-c142e950/budget-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const budgetRequest = await kv.get(`budget_request:${id}`);
    
    if (!budgetRequest) {
      return c.json({ success: false, error: "Budget request not found" }, 404);
    }
    
    return c.json({ success: true, data: budgetRequest });
  } catch (error) {
    console.error("Error fetching budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create budget request
app.post("/make-server-c142e950/budget-requests", async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate budget request ID
    const timestamp = Date.now();
    const id = `BR-${timestamp}`;
    
    const budgetRequest = {
      id,
      type: data.type,
      amount: data.amount,
      justification: data.justification,
      status: data.status || "Pending",
      customer_id: data.customer_id || null,
      requested_by: data.requested_by,
      approved_by: data.approved_by || null,
      approved_at: data.approved_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`budget_request:${id}`, budgetRequest);
    
    console.log(`Created budget request: ${id} - ${budgetRequest.type} - ${budgetRequest.amount}`);
    
    return c.json({ success: true, data: budgetRequest });
  } catch (error) {
    console.error("Error creating budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update budget request (typically for approval/rejection)
app.put("/make-server-c142e950/budget-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const existing = await kv.get(`budget_request:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Budget request not found" }, 404);
    }
    
    const budgetRequest = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      created_at: existing.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`budget_request:${id}`, budgetRequest);
    
    console.log(`Updated budget request: ${id} - Status: ${budgetRequest.status}`);
    
    return c.json({ success: true, data: budgetRequest });
  } catch (error) {
    console.error("Error updating budget request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== EXPENSES API ====================

// Get all expenses (optionally filter by date, category, vendor, project)
app.get("/make-server-c142e950/expenses", async (c) => {
  try {
    const dateFrom = c.req.query("date_from");
    const dateTo = c.req.query("date_to");
    const category = c.req.query("category");
    const vendorId = c.req.query("vendor_id");
    const projectNumber = c.req.query("project_number");
    const status = c.req.query("status");
    
    let expenses = await kv.getByPrefix("expense:");
    
    // Apply filters
    if (dateFrom) {
      expenses = expenses.filter((exp: any) => new Date(exp.request_date || exp.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      expenses = expenses.filter((exp: any) => new Date(exp.request_date || exp.created_at) <= new Date(dateTo));
    }
    if (category) {
      expenses = expenses.filter((exp: any) => exp.expense_category === category);
    }
    if (vendorId) {
      expenses = expenses.filter((exp: any) => exp.vendor_id === vendorId);
    }
    if (projectNumber) {
      expenses = expenses.filter((exp: any) => exp.project_number === projectNumber);
    }
    if (status) {
      expenses = expenses.filter((exp: any) => exp.status === status);
    }
    
    // Sort by date descending (newest first)
    expenses.sort((a: any, b: any) => {
      return new Date(b.request_date || b.created_at).getTime() - new Date(a.request_date || a.created_at).getTime();
    });
    
    console.log(`Fetched ${expenses.length} expenses`);
    
    return c.json({ success: true, data: expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single expense by ID
app.get("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const expense = await kv.get(`expense:${id}`);
    
    if (!expense) {
      return c.json({ success: false, error: "Expense not found" }, 404);
    }
    
    return c.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error fetching expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create expense
app.post("/make-server-c142e950/expenses", async (c) => {
  try {
    const data = await c.req.json();
    
    // Use provided ID or generate new one
    const id = data.id || `EXP-${Date.now()}`;
    
    const expense = {
      ...data,
      id,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`expense:${id}`, expense);
    
    console.log(`Created expense: ${id} - ${expense.description} - ${expense.amount}`);
    
    return c.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error creating expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update expense
app.put("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const existing = await kv.get(`expense:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Expense not found" }, 404);
    }
    
    const expense = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      created_at: existing.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`expense:${id}`, expense);
    
    console.log(`Updated expense: ${id} - ${expense.description}`);
    
    return c.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error updating expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete expense
app.delete("/make-server-c142e950/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`expense:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Expense not found" }, 404);
    }
    
    await kv.del(`expense:${id}`);
    
    console.log(`Deleted expense: ${id}`);
    
    return c.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get expense summary by category
app.get("/make-server-c142e950/expenses/summary/by-category", async (c) => {
  try {
    const dateFrom = c.req.query("date_from");
    const dateTo = c.req.query("date_to");
    
    let expenses = await kv.getByPrefix("expense:");
    
    // Apply date filters
    if (dateFrom) {
      expenses = expenses.filter((exp: any) => new Date(exp.request_date || exp.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      expenses = expenses.filter((exp: any) => new Date(exp.request_date || exp.created_at) <= new Date(dateTo));
    }
    
    // Group by category and sum amounts
    const summary: Record<string, { category: string; total: number; count: number }> = {};
    
    expenses.forEach((exp: any) => {
      const category = exp.expense_category || "Uncategorized";
      if (!summary[category]) {
        summary[category] = { category, total: 0, count: 0 };
      }
      summary[category].total += exp.amount || 0;
      summary[category].count += 1;
    });
    
    const result = Object.values(summary).sort((a, b) => b.total - a.total);
    
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDORS API ====================

// Get all vendors (optionally filter by type)
app.get("/make-server-c142e950/vendors", async (c) => {
  try {
    const type = c.req.query("type");
    const search = c.req.query("search");
    
    let vendors = await kv.getByPrefix("vendor:");
    
    // Apply filters
    if (type && type !== "All") {
      vendors = vendors.filter((vendor: any) => vendor.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      vendors = vendors.filter((vendor: any) => 
        vendor.company_name.toLowerCase().includes(searchLower) ||
        vendor.country.toLowerCase().includes(searchLower) ||
        vendor.contact_person?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by company name
    vendors.sort((a: any, b: any) => a.company_name.localeCompare(b.company_name));
    
    console.log(`Fetched ${vendors.length} vendors`);
    
    return c.json({ success: true, data: vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single vendor by ID
app.get("/make-server-c142e950/vendors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const vendor = await kv.get(`vendor:${id}`);
    
    if (!vendor) {
      return c.json({ success: false, error: "Vendor not found" }, 404);
    }
    
    return c.json({ success: true, data: vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create vendor
app.post("/make-server-c142e950/vendors", async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate vendor ID
    const timestamp = Date.now();
    const id = `VENDOR-${timestamp}`;
    
    const now = new Date().toISOString();
    
    const vendor = {
      id,
      type: data.type || "Local Agent",
      company_name: data.company_name,
      country: data.country,
      territory: data.territory || "",
      wca_number: data.wca_number || "",
      contact_person: data.contact_person || "",
      contact_email: data.contact_email || "",
      contact_phone: data.contact_phone || "",
      address: data.address || "",
      services_offered: data.services_offered || [],
      total_shipments: 0,
      notes: data.notes || "",
      created_at: now,
      updated_at: now,
    };
    
    await kv.set(`vendor:${id}`, vendor);
    
    console.log(`Created vendor: ${id} - ${vendor.company_name}`);
    
    return c.json({ success: true, data: vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update vendor
app.put("/make-server-c142e950/vendors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const existing = await kv.get(`vendor:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Vendor not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`vendor:${id}`, updated);
    
    console.log(`Updated vendor: ${id}`);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete vendor
app.delete("/make-server-c142e950/vendors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`vendor:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Vendor not found" }, 404);
    }
    
    await kv.del(`vendor:${id}`);
    
    console.log(`Deleted vendor: ${id}`);
    
    return c.json({ success: true, message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed vendors
app.post("/make-server-c142e950/vendors/seed", async (c) => {
  try {
    // Clear existing vendors
    const existingVendors = await kv.getByPrefix("vendor:");
    for (const vendor of existingVendors) {
      await kv.del(`vendor:${vendor.id}`);
    }
    
    const now = new Date().toISOString();
    
    const seedVendors = [
      {
        id: "VENDOR-001",
        type: "Overseas Agent",
        company_name: "Global Freight Solutions",
        country: "Singapore",
        territory: "Southeast Asia",
        wca_number: "WCA-SG-001",
        contact_person: "Michael Tan",
        contact_email: "michael.tan@globalfreight.sg",
        contact_phone: "+65 6123 4567",
        address: "123 Marina Bay, Singapore 018956",
        services_offered: ["Forwarding", "Brokerage"],
        total_shipments: 156,
        notes: "Preferred partner for Singapore shipments",
        created_at: now,
        updated_at: now,
      },
      {
        id: "VENDOR-002",
        type: "Overseas Agent",
        company_name: "Pacific Logistics Network",
        country: "China",
        territory: "East Asia",
        wca_number: "WCA-CN-045",
        contact_person: "Li Wei",
        contact_email: "liwei@pacificlog.cn",
        contact_phone: "+86 21 1234 5678",
        address: "456 Pudong Avenue, Shanghai 200120, China",
        services_offered: ["Forwarding", "Trucking"],
        total_shipments: 234,
        notes: "Strong consolidation services from Shanghai",
        created_at: now,
        updated_at: now,
      },
      {
        id: "VENDOR-003",
        type: "Local Agent",
        company_name: "Manila Port Services",
        country: "Philippines",
        territory: "Metro Manila",
        wca_number: "",
        contact_person: "Juan Reyes",
        contact_email: "juan.reyes@manilaport.ph",
        contact_phone: "+63 2 8123 4567",
        address: "Port Area, Manila 1018, Philippines",
        services_offered: ["Brokerage", "Trucking"],
        total_shipments: 89,
        notes: "Excellent port handling and local customs clearance",
        created_at: now,
        updated_at: now,
      },
      {
        id: "VENDOR-004",
        type: "Subcontractor",
        company_name: "FastTrack Customs Brokers",
        country: "Philippines",
        territory: "Nationwide",
        wca_number: "",
        contact_person: "Maria Santos",
        contact_email: "maria@fasttrackph.com",
        contact_phone: "+63 917 123 4567",
        address: "Makati City, Metro Manila, Philippines",
        services_offered: ["Brokerage"],
        total_shipments: 312,
        notes: "BOC-accredited broker, fast processing",
        created_at: now,
        updated_at: now,
      },
      {
        id: "VENDOR-005",
        type: "Overseas Agent",
        company_name: "American Express Cargo",
        country: "United States",
        territory: "North America",
        wca_number: "WCA-US-112",
        contact_person: "John Miller",
        contact_email: "jmiller@amexcargo.com",
        contact_phone: "+1 310 555 1234",
        address: "Los Angeles, CA 90001, USA",
        services_offered: ["Forwarding", "Marine Insurance"],
        total_shipments: 67,
        notes: "West Coast operations, good for consolidations",
        created_at: now,
        updated_at: now,
      },
      {
        id: "VENDOR-006",
        type: "Subcontractor",
        company_name: "Metro Trucking Solutions",
        country: "Philippines",
        territory: "Luzon",
        wca_number: "",
        contact_person: "Roberto Cruz",
        contact_email: "roberto@metrotruck.ph",
        contact_phone: "+63 918 234 5678",
        address: "Valenzuela City, Metro Manila, Philippines",
        services_offered: ["Trucking"],
        total_shipments: 445,
        notes: "Large fleet, 24/7 operations",
        created_at: now,
        updated_at: now,
      },
      {
        id: "VENDOR-007",
        type: "Local Agent",
        company_name: "Cebu Logistics Hub",
        country: "Philippines",
        territory: "Visayas",
        wca_number: "",
        contact_person: "Anna Garcia",
        contact_email: "anna@cebuhub.ph",
        contact_phone: "+63 32 234 5678",
        address: "Cebu City 6000, Philippines",
        services_offered: ["Forwarding", "Trucking", "Brokerage"],
        total_shipments: 178,
        notes: "Comprehensive Visayas coverage",
        created_at: now,
        updated_at: now,
      },
      {
        id: "VENDOR-008",
        type: "Overseas Agent",
        company_name: "Tokyo International Freight",
        country: "Japan",
        territory: "Northeast Asia",
        wca_number: "WCA-JP-078",
        contact_person: "Takeshi Yamamoto",
        contact_email: "yamamoto@tokyofreight.jp",
        contact_phone: "+81 3 1234 5678",
        address: "Tokyo 100-0001, Japan",
        services_offered: ["Forwarding", "Marine Insurance"],
        total_shipments: 92,
        notes: "Premium service, strong airline connections",
        created_at: now,
        updated_at: now,
      },
    ];
    
    for (const vendor of seedVendors) {
      await kv.set(`vendor:${vendor.id}`, vendor);
      console.log(`Seeded vendor: ${vendor.id} - ${vendor.company_name}`);
    }
    
    return c.json({ 
      success: true, 
      message: "Vendors seeded successfully",
      data: seedVendors 
    });
  } catch (error) {
    console.error("Error seeding vendors:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear all vendors
app.delete("/make-server-c142e950/vendors/clear", async (c) => {
  try {
    const existingVendors = await kv.getByPrefix("vendor:");
    let count = 0;
    
    for (const vendor of existingVendors) {
      await kv.del(`vendor:${vendor.id}`);
      count++;
    }
    
    console.log(`Cleared ${count} vendors`);
    
    return c.json({ 
      success: true, 
      message: `Cleared ${count} vendors`,
      count 
    });
  } catch (error) {
    console.error("Error clearing vendors:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== BD REPORTS API ====================

// Get available report templates
app.get("/make-server-c142e950/reports/templates", async (c) => {
  try {
    const templates = [
      {
        id: "quotation-performance",
        name: "Quotation Performance Report",
        description: "Overview of quotation metrics, win rates, and conversion statistics",
        icon: "📊",
        category: "Performance"
      },
      {
        id: "customer-activity",
        name: "Customer Activity Report",
        description: "Customer engagement, quotations, and lifetime value analysis",
        icon: "👥",
        category: "Customers"
      },
      {
        id: "rep-performance",
        name: "BD Rep Performance Report",
        description: "Individual and team performance metrics and comparisons",
        icon: "🎯",
        category: "Performance"
      },
      {
        id: "pipeline-health",
        name: "Pipeline Health Report",
        description: "Pipeline stages, conversion rates, and velocity metrics",
        icon: "💼",
        category: "Pipeline"
      },
      {
        id: "budget-requests",
        name: "Budget Request Report",
        description: "Overview of budget requests, approvals, and spending",
        icon: "📈",
        category: "Finance"
      }
    ];

    return c.json({ success: true, data: templates });
  } catch (error) {
    console.error("Error fetching report templates:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Generate report based on configuration
app.post("/make-server-c142e950/reports/generate", async (c) => {
  try {
    const config = await c.req.json();
    const { templateId, dataSource, columns, filters, groupBy, aggregations, sortBy, dateRange } = config;

    // Fetch data based on dataSource
    let rawData: any[] = [];
    
    if (dataSource === "quotations" || templateId === "quotation-performance" || templateId === "pipeline-health") {
      const quotations = await kv.getByPrefix("quotation:");
      rawData = quotations;
    } else if (dataSource === "customers" || templateId === "customer-activity") {
      const customers = await kv.getByPrefix("customer:");
      rawData = customers;
    } else if (dataSource === "budget_requests" || templateId === "budget-requests") {
      const budgetRequests = await kv.getByPrefix("budget_request:");
      rawData = budgetRequests;
    } else if (dataSource === "contacts") {
      const contacts = await kv.getByPrefix("contact:");
      rawData = contacts;
    } else if (dataSource === "activities") {
      const activities = await kv.getByPrefix("activity:");
      rawData = activities;
    }

    // Apply filters
    let filteredData = rawData;
    if (filters && filters.length > 0) {
      filteredData = rawData.filter(item => {
        return filters.every((filter: any) => {
          const { field, operator, value } = filter;
          const fieldValue = item[field];

          switch (operator) {
            case "equals":
              return fieldValue === value;
            case "not_equals":
              return fieldValue !== value;
            case "contains":
              return String(fieldValue || "").toLowerCase().includes(String(value).toLowerCase());
            case "greater_than":
              return Number(fieldValue) > Number(value);
            case "less_than":
              return Number(fieldValue) < Number(value);
            case "in":
              return Array.isArray(value) && value.includes(fieldValue);
            case "between":
              return Number(fieldValue) >= Number(value[0]) && Number(fieldValue) <= Number(value[1]);
            case "date_after":
              return new Date(fieldValue) > new Date(value);
            case "date_before":
              return new Date(fieldValue) < new Date(value);
            case "date_between":
              return new Date(fieldValue) >= new Date(value[0]) && new Date(fieldValue) <= new Date(value[1]);
            default:
              return true;
          }
        });
      });
    }

    // Apply date range filter if provided
    if (dateRange && dateRange.field && dateRange.start && dateRange.end) {
      filteredData = filteredData.filter(item => {
        const date = new Date(item[dateRange.field]);
        return date >= new Date(dateRange.start) && date <= new Date(dateRange.end);
      });
    }

    // Calculate metrics based on template
    let metrics: any = {};
    let chartData: any = {};

    if (templateId === "quotation-performance") {
      const total = filteredData.length;
      const wonCount = filteredData.filter(q => q.status === "Won").length;
      const lostCount = filteredData.filter(q => q.status === "Lost").length;
      const sentCount = filteredData.filter(q => q.status === "Sent to Client").length;
      const draftCount = filteredData.filter(q => q.status === "Draft").length;
      
      const totalValue = filteredData.reduce((sum, q) => sum + (q.total_amount || 0), 0);
      const avgValue = total > 0 ? totalValue / total : 0;
      const winRate = (wonCount + lostCount) > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;

      metrics = {
        total_quotations: total,
        won_count: wonCount,
        lost_count: lostCount,
        sent_count: sentCount,
        draft_count: draftCount,
        total_value: totalValue,
        average_value: avgValue,
        win_rate: winRate.toFixed(1)
      };

      // Chart data: Status distribution
      chartData.statusDistribution = [
        { name: "Won", value: wonCount },
        { name: "Lost", value: lostCount },
        { name: "Sent", value: sentCount },
        { name: "Draft", value: draftCount }
      ];

      // Chart data: Monthly trend
      const monthlyData: any = {};
      filteredData.forEach(q => {
        const month = new Date(q.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });
      chartData.monthlyTrend = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      }));

    } else if (templateId === "customer-activity") {
      // Get all quotations and contacts for calculations
      const allQuotations = await kv.getByPrefix("quotation:");
      const allContacts = await kv.getByPrefix("contact:");
      
      metrics = {
        total_customers: filteredData.length,
        total_quotations: allQuotations.length,
        active_customers: filteredData.filter((c: any) => {
          const customerQuotations = allQuotations.filter((q: any) => q.customer_id === c.id);
          return customerQuotations.length > 0;
        }).length
      };

      // Top customers by quotation count
      const customerQuotationCounts: any = {};
      allQuotations.forEach((q: any) => {
        customerQuotationCounts[q.customer_id] = (customerQuotationCounts[q.customer_id] || 0) + 1;
      });
      
      chartData.topCustomers = Object.entries(customerQuotationCounts)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([customerId, count]) => {
          const customer = filteredData.find((c: any) => c.id === customerId);
          return {
            name: customer?.company_name || "Unknown",
            count
          };
        });

    } else if (templateId === "rep-performance") {
      const allQuotations = await kv.getByPrefix("quotation:");
      const allUsers = await kv.getByPrefix("user:");
      const bdUsers = allUsers.filter((u: any) => u.department === "Business Development");

      const repStats: any = {};
      bdUsers.forEach((user: any) => {
        const userQuotations = allQuotations.filter((q: any) => q.created_by === user.id);
        const wonQuotations = userQuotations.filter((q: any) => q.status === "Won");
        const lostQuotations = userQuotations.filter((q: any) => q.status === "Lost");
        const totalDecided = wonQuotations.length + lostQuotations.length;
        const winRate = totalDecided > 0 ? (wonQuotations.length / totalDecided) * 100 : 0;

        repStats[user.id] = {
          name: user.name,
          total_quotations: userQuotations.length,
          won_count: wonQuotations.length,
          win_rate: winRate,
          total_value: userQuotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
        };
      });

      metrics = {
        total_reps: bdUsers.length,
        total_quotations: allQuotations.length,
        avg_quotations_per_rep: bdUsers.length > 0 ? allQuotations.length / bdUsers.length : 0
      };

      chartData.repPerformance = Object.values(repStats);

    } else if (templateId === "pipeline-health") {
      const statusCounts: any = {
        "Draft": 0,
        "Inquiry Submitted": 0,
        "Sent to Client": 0,
        "Won": 0,
        "Lost": 0
      };

      const statusValues: any = {
        "Draft": 0,
        "Inquiry Submitted": 0,
        "Sent to Client": 0,
        "Won": 0,
        "Lost": 0
      };

      filteredData.forEach(q => {
        if (statusCounts.hasOwnProperty(q.status)) {
          statusCounts[q.status]++;
          statusValues[q.status] += (q.total_amount || 0);
        }
      });

      const totalValue = Object.values(statusValues).reduce((sum: number, val: any) => sum + val, 0);

      metrics = {
        total_pipeline_value: totalValue,
        active_opportunities: statusCounts["Sent to Client"] + statusCounts["Inquiry Submitted"],
        won_count: statusCounts["Won"],
        lost_count: statusCounts["Lost"]
      };

      chartData.pipelineStages = Object.entries(statusCounts).map(([stage, count]) => ({
        stage,
        count,
        value: statusValues[stage]
      }));

    } else if (templateId === "budget-requests") {
      const approved = filteredData.filter(br => br.status === "Approved").length;
      const pending = filteredData.filter(br => br.status === "Pending").length;
      const rejected = filteredData.filter(br => br.status === "Rejected").length;
      const totalAmount = filteredData.reduce((sum, br) => sum + (br.amount || 0), 0);

      metrics = {
        total_requests: filteredData.length,
        approved_count: approved,
        pending_count: pending,
        rejected_count: rejected,
        total_amount: totalAmount,
        approval_rate: (approved + rejected) > 0 ? (approved / (approved + rejected)) * 100 : 0
      };

      chartData.statusDistribution = [
        { name: "Approved", value: approved },
        { name: "Pending", value: pending },
        { name: "Rejected", value: rejected }
      ];
    }

    // Select columns if specified
    let tableData = filteredData;
    if (columns && columns.length > 0) {
      tableData = filteredData.map(item => {
        const row: any = {};
        columns.forEach((col: string) => {
          row[col] = item[col];
        });
        return row;
      });
    }

    // Apply sorting
    if (sortBy && sortBy.length > 0) {
      tableData.sort((a: any, b: any) => {
        for (const sort of sortBy) {
          const { field, direction } = sort;
          const aVal = a[field];
          const bVal = b[field];
          
          if (aVal < bVal) return direction === "asc" ? -1 : 1;
          if (aVal > bVal) return direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return c.json({
      success: true,
      data: {
        metrics,
        chartData,
        tableData: tableData.slice(0, 1000), // Limit to 1000 rows for performance
        totalRows: filteredData.length
      }
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user's saved reports
app.get("/make-server-c142e950/reports/saved", async (c) => {
  try {
    const userId = c.req.query("user_id");
    
    if (!userId) {
      return c.json({ success: false, error: "User ID required" }, 400);
    }

    const savedReports = await kv.getByPrefix(`saved_report:${userId}:`);
    
    return c.json({ success: true, data: savedReports });
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save report configuration
app.post("/make-server-c142e950/reports/save", async (c) => {
  try {
    const { userId, name, description, config } = await c.req.json();
    
    if (!userId || !name || !config) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const savedReport = {
      id: reportId,
      user_id: userId,
      name,
      description: description || "",
      config,
      created_at: new Date().toISOString(),
      last_run: null
    };

    await kv.set(`saved_report:${userId}:${reportId}`, savedReport);
    
    return c.json({ success: true, data: savedReport });
  } catch (error) {
    console.error("Error saving report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete saved report
app.delete("/make-server-c142e950/reports/saved/:id", async (c) => {
  try {
    const reportId = c.req.param("id");
    const userId = c.req.query("user_id");
    
    if (!userId) {
      return c.json({ success: false, error: "User ID required" }, 400);
    }

    await kv.del(`saved_report:${userId}:${reportId}`);
    
    return c.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting saved report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Export report to CSV/Excel/PDF
app.post("/make-server-c142e950/reports/export", async (c) => {
  try {
    const { format, data, filename } = await c.req.json();
    
    if (format === "csv") {
      // Generate CSV
      if (!data || data.length === 0) {
        return c.json({ success: false, error: "No data to export" }, 400);
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map((row: any) => 
          headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value || "");
            if (stringValue.includes(",") || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(",")
        )
      ];

      const csvContent = csvRows.join("\n");
      
      return c.json({
        success: true,
        data: {
          content: csvContent,
          filename: filename || "report.csv",
          mimeType: "text/csv"
        }
      });
    } else if (format === "excel") {
      // For Excel, we'll return CSV with .xlsx extension
      // In a production app, you'd use a library like xlsx
      if (!data || data.length === 0) {
        return c.json({ success: false, error: "No data to export" }, 400);
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join("\t"), // Tab-separated for Excel
        ...data.map((row: any) => 
          headers.map(header => String(row[header] || "")).join("\t")
        )
      ];

      const content = csvRows.join("\n");
      
      return c.json({
        success: true,
        data: {
          content,
          filename: filename || "report.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      });
    } else if (format === "pdf") {
      // For PDF, return a simple text representation
      // In production, use a PDF generation library
      return c.json({
        success: true,
        data: {
          content: JSON.stringify(data, null, 2),
          filename: filename || "report.pdf",
          mimeType: "application/pdf",
          note: "PDF generation requires additional library - returning JSON for now"
        }
      });
    } else {
      return c.json({ success: false, error: "Invalid export format" }, 400);
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CONTROL CENTER REPORTS API ====================

// Helper function to apply filter operators
function applyFilterOperator(fieldValue: any, operator: string, filterValue: any): boolean {
  switch (operator) {
    case 'equals':
      return fieldValue === filterValue;
    case 'not_equals':
      return fieldValue !== filterValue;
    case 'contains':
      return String(fieldValue || '').toLowerCase().includes(String(filterValue).toLowerCase());
    case 'starts_with':
      return String(fieldValue || '').toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'greater_than':
      return Number(fieldValue) > Number(filterValue);
    case 'less_than':
      return Number(fieldValue) < Number(filterValue);
    case 'greater_than_or_equal':
      return Number(fieldValue) >= Number(filterValue);
    case 'less_than_or_equal':
      return Number(fieldValue) <= Number(filterValue);
    case 'date_after':
      return new Date(fieldValue) > new Date(filterValue);
    case 'date_before':
      return new Date(fieldValue) < new Date(filterValue);
    default:
      return true;
  }
}

// Generate report from Control Center (cross-entity queries)
app.post("/make-server-c142e950/reports/control-center", async (c) => {
  try {
    const { selectedFields, filters, groupBy, aggregations } = await c.req.json();
    
    console.log('[Control Center] Received config:', {
      selectedFields: selectedFields?.length || 0,
      filters: filters?.length || 0,
      groupBy: groupBy?.length || 0,
      aggregations: aggregations?.length || 0
    });

    // If no fields selected, return empty result
    if (!selectedFields || selectedFields.length === 0) {
      return c.json({
        success: true,
        data: [],
        columns: []
      });
    }

    // Determine which entities are involved
    const entitiesInvolved = new Set<string>();
    selectedFields.forEach((f: any) => entitiesInvolved.add(f.entity));
    if (filters) {
      filters.forEach((f: any) => entitiesInvolved.add(f.entity));
    }

    console.log('[Control Center] Entities involved:', Array.from(entitiesInvolved));

    // Fetch all required entities from KV store
    const entityData: Record<string, any[]> = {};
    for (const entity of entitiesInvolved) {
      const prefix = entity === 'quotations' ? 'quotation:' :
                     entity === 'customers' ? 'customer:' :
                     entity === 'contacts' ? 'contact:' :
                     entity === 'activities' ? 'activity:' :
                     entity === 'budget_requests' ? 'budget_request:' : '';
      
      if (prefix) {
        entityData[entity] = await kv.getByPrefix(prefix);
        console.log(`[Control Center] Loaded ${entityData[entity].length} records from ${entity}`);
      }
    }

    // Determine primary entity (the one with most selected fields)
    const fieldCounts: Record<string, number> = {};
    selectedFields.forEach((f: any) => {
      fieldCounts[f.entity] = (fieldCounts[f.entity] || 0) + 1;
    });
    const primaryEntity = Object.entries(fieldCounts).sort(([, a], [, b]) => b - a)[0][0];
    console.log('[Control Center] Primary entity:', primaryEntity, 'Field counts:', fieldCounts);

    // Start with primary entity data
    let results = entityData[primaryEntity] || [];
    console.log('[Control Center] Starting with', results.length, 'records from primary entity');

    // Apply filters
    if (filters && filters.length > 0) {
      results = results.filter((item: any) => {
        return filters.every((filter: any) => {
          // For filters on the primary entity, apply directly
          if (filter.entity === primaryEntity) {
            const fieldValue = item[filter.field];
            return applyFilterOperator(fieldValue, filter.operator, filter.value);
          }
          
          // For filters on related entities, we need to do a lookup
          // This is a simplified version - in production you'd handle complex joins
          if (filter.entity === 'customers' && primaryEntity === 'quotations') {
            const customer = entityData.customers?.find((c: any) => c.id === item.customer_id);
            if (!customer) return false;
            return applyFilterOperator(customer[filter.field], filter.operator, filter.value);
          }
          
          if (filter.entity === 'contacts' && primaryEntity === 'quotations') {
            const contact = entityData.contacts?.find((c: any) => c.id === item.contact_person_id);
            if (!contact) return false;
            return applyFilterOperator(contact[filter.field], filter.operator, filter.value);
          }
          
          // Default: don't filter if we can't match the relationship
          return true;
        });
      });
      console.log('[Control Center] After filtering:', results.length, 'records');
    }

    // Build result rows with cross-entity field mapping
    const resultRows = results.map((item: any) => {
      const row: any = {};
      
      selectedFields.forEach((field: any) => {
        const columnName = field.displayLabel;
        
        if (field.entity === primaryEntity) {
          // Direct field from primary entity
          row[columnName] = item[field.field];
        } else if (field.entity === 'customers' && primaryEntity === 'quotations') {
          // Join to customers
          const customer = entityData.customers?.find((c: any) => c.id === item.customer_id);
          row[columnName] = customer ? customer[field.field] : null;
        } else if (field.entity === 'contacts' && primaryEntity === 'quotations') {
          // Join to contacts
          const contact = entityData.contacts?.find((c: any) => c.id === item.contact_person_id);
          row[columnName] = contact ? contact[field.field] : null;
        } else if (field.entity === 'quotations' && primaryEntity === 'customers') {
          // Can't easily do one-to-many in this simple structure
          // Would need aggregation logic here
          row[columnName] = null;
        } else {
          row[columnName] = null;
        }
      });
      
      return row;
    });

    console.log('[Control Center] Built', resultRows.length, 'result rows');

    // Handle grouping and aggregations
    let finalResults = resultRows;
    if (groupBy && groupBy.length > 0 && aggregations && aggregations.length > 0) {
      // Group by specified fields
      const grouped: Record<string, any[]> = {};
      
      resultRows.forEach((row: any) => {
        const groupKey = groupBy.map((g: any) => row[g.label]).join('|');
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(row);
      });

      // Calculate aggregations for each group
      finalResults = Object.entries(grouped).map(([groupKey, rows]) => {
        const result: any = {};
        
        // Add group by fields
        groupBy.forEach((g: any, index: number) => {
          result[g.label] = groupKey.split('|')[index];
        });
        
        // Add aggregations
        aggregations.forEach((agg: any) => {
          const field = selectedFields.find((f: any) => f.entity === agg.entity && f.field === agg.field);
          const columnName = field?.displayLabel;
          
          if (columnName) {
            const values = rows.map((r: any) => Number(r[columnName]) || 0);
            
            if (agg.function === 'SUM') {
              result[agg.name] = values.reduce((sum, val) => sum + val, 0);
            } else if (agg.function === 'AVG') {
              result[agg.name] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            } else if (agg.function === 'COUNT') {
              result[agg.name] = rows.length;
            } else if (agg.function === 'MIN') {
              result[agg.name] = Math.min(...values);
            } else if (agg.function === 'MAX') {
              result[agg.name] = Math.max(...values);
            }
          }
        });
        
        return result;
      });

      console.log('[Control Center] After grouping/aggregation:', finalResults.length, 'rows');
    }

    // Extract column names from first row
    const columns = finalResults.length > 0 ? Object.keys(finalResults[0]) : [];

    return c.json({
      success: true,
      data: finalResults.slice(0, 1000), // Limit to 1000 rows
      columns: columns
    });

  } catch (error) {
    console.error("[Control Center] Error generating report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================================================
// ADMIN ENDPOINTS - MIGRATION
// ============================================================================

/**
 * Test migration - verify team members exist for all service types
 * GET /admin/test-migration
 */
app.get("/make-server-c142e950/admin/test-migration", async (c) => {
  try {
    console.log("🧪 Testing migration prerequisites...");

    const serviceTypes = ["Forwarding", "Brokerage", "Trucking", "Marine Insurance", "Others"];
    const results = [];

    for (const serviceType of serviceTypes) {
      // Fetch all users
      const allUsers = await kv.getByPrefix("user:");
      
      const manager = allUsers.find(
        (u: any) => u.department === "Operations" && 
                   u.service_type === serviceType && 
                   u.operations_role === "Manager"
      );

      const supervisors = allUsers.filter(
        (u: any) => u.department === "Operations" && 
                   u.service_type === serviceType && 
                   u.operations_role === "Supervisor"
      );

      const handlers = allUsers.filter(
        (u: any) => u.department === "Operations" && 
                   u.service_type === serviceType && 
                   u.operations_role === "Handler"
      );

      results.push({
        serviceType,
        manager: manager ? manager.name : null,
        supervisorCount: supervisors.length,
        handlerCount: handlers.length,
        ready: !!manager && supervisors.length > 0 && handlers.length > 0,
      });
    }

    const allReady = results.every(r => r.ready);

    return c.json({
      success: true,
      ready: allReady,
      results,
      message: allReady 
        ? "✅ All service types have complete teams. Ready to migrate!" 
        : "⚠️ Some service types are missing team members. Please create users first.",
    });
  } catch (error) {
    console.error("Error testing migration:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * Migrate booking assignments - assign default teams to existing bookings
 * POST /admin/migrate-booking-assignments
 */
app.post("/make-server-c142e950/admin/migrate-booking-assignments", async (c) => {
  try {
    console.log("🚀 Starting booking assignments migration...\n");

    const serviceConfigs = [
      { name: "Forwarding", prefix: "forwarding-booking:" },
      { name: "Brokerage", prefix: "brokerage-booking:" },
      { name: "Trucking", prefix: "trucking-booking:" },
      { name: "Marine Insurance", prefix: "marine-insurance-booking:" },
      { name: "Others", prefix: "others-booking:" },
    ];

    const migrationResults = [];
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const config of serviceConfigs) {
      console.log(`\n🔄 Migrating ${config.name} bookings...`);

      // Get default team for this service type
      const allUsers = await kv.getByPrefix("user:");
      
      const manager = allUsers.find(
        (u: any) => u.department === "Operations" && 
                   u.service_type === config.name && 
                   u.operations_role === "Manager"
      );

      const supervisor = allUsers.find(
        (u: any) => u.department === "Operations" && 
                   u.service_type === config.name && 
                   u.operations_role === "Supervisor"
      );

      const handler = allUsers.find(
        (u: any) => u.department === "Operations" && 
                   u.service_type === config.name && 
                   u.operations_role === "Handler"
      );

      if (!manager || !supervisor || !handler) {
        const missingRoles = [];
        if (!manager) missingRoles.push("Manager");
        if (!supervisor) missingRoles.push("Supervisor");
        if (!handler) missingRoles.push("Handler");
        
        const error = `Missing team members for ${config.name}: ${missingRoles.join(", ")}`;
        console.error(`❌ ${error}`);
        
        migrationResults.push({
          serviceType: config.name,
          success: false,
          error,
          migrated: 0,
          skipped: 0,
        });
        
        totalErrors++;
        continue;
      }

      // Get all bookings for this service type
      const bookings = await kv.getByPrefix(config.prefix);
      let migrated = 0;
      let skipped = 0;

      console.log(`📊 Found ${bookings.length} ${config.name} bookings`);

      for (const booking of bookings) {
        try {
          // Skip if already has assignments
          if (booking.assigned_manager_id && booking.assigned_supervisor_id && booking.assigned_handler_id) {
            skipped++;
            continue;
          }

          // Update booking with team assignments
          const updatedBooking = {
            ...booking,
            assigned_manager_id: manager.id,
            assigned_manager_name: manager.name,
            assigned_supervisor_id: supervisor.id,
            assigned_supervisor_name: supervisor.name,
            assigned_handler_id: handler.id,
            assigned_handler_name: handler.name,
            updatedAt: new Date().toISOString(),
          };

          await kv.set(`${config.prefix}${booking.bookingId}`, updatedBooking);
          migrated++;
          console.log(`  ✅ Migrated ${booking.bookingId}`);
        } catch (error) {
          console.error(`  ❌ Error migrating ${booking.bookingId}:`, error);
          totalErrors++;
        }
      }

      console.log(`✅ ${config.name}: Migrated ${migrated}/${bookings.length} bookings (${skipped} already had assignments)`);

      migrationResults.push({
        serviceType: config.name,
        success: true,
        total: bookings.length,
        migrated,
        skipped,
      });

      totalMigrated += migrated;
      totalSkipped += skipped;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Successfully migrated:      ${totalMigrated}`);
    console.log(`Already had assignments:    ${totalSkipped}`);
    console.log(`Errors:                     ${totalErrors}`);
    console.log("=".repeat(60));

    const overallSuccess = totalErrors === 0;

    if (overallSuccess) {
      console.log("\n✅ Migration completed successfully!");
    } else {
      console.log("\n⚠️  Migration completed with errors. Please review the logs.");
    }

    return c.json({
      success: overallSuccess,
      summary: {
        totalMigrated,
        totalSkipped,
        totalErrors,
      },
      details: migrationResults,
    });
  } catch (error) {
    console.error("Error in migration:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== INQUIRY/QUOTATION/PROJECT COMMENTS API ====================

// Get comments for an inquiry (also works for quotations and projects via shared inquiry_id)
app.get("/make-server-c142e950/comments", async (c) => {
  try {
    const inquiry_id = c.req.query("inquiry_id");
    
    if (!inquiry_id) {
      return c.json({ success: false, error: "inquiry_id parameter required" }, 400);
    }
    
    // Get all comments for this inquiry
    const comments = await kv.getByPrefix(`inquiry_comment:${inquiry_id}:`);
    
    // Sort by created_at ascending (oldest first)
    comments.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    console.log(`Fetched ${comments.length} comments for inquiry ${inquiry_id}`);
    
    return c.json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload file attachment for comment
app.post("/make-server-c142e950/comments/upload", async (c) => {
  try {
    // Check if Supabase storage is available
    if (!supabase) {
      return c.json({ success: false, error: "File storage is not configured" }, 503);
    }
    
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const inquiry_id = formData.get("inquiry_id") as string;
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }
    
    if (!inquiry_id) {
      return c.json({ success: false, error: "inquiry_id required" }, 400);
    }
    
    // Check file size (50MB limit)
    if (file.size > 52428800) {
      return c.json({ success: false, error: "File size exceeds 50MB limit" }, 400);
    }
    
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${inquiry_id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(COMMENT_ATTACHMENTS_BUCKET)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error("Error uploading file:", error);
      return c.json({ success: false, error: `Upload failed: ${error.message}` }, 500);
    }
    
    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(COMMENT_ATTACHMENTS_BUCKET)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds
    
    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      return c.json({ success: false, error: "Failed to create download URL" }, 500);
    }
    
    console.log(`Uploaded file ${file.name} (${file.size} bytes) for inquiry ${inquiry_id}`);
    
    return c.json({ 
      success: true, 
      data: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_path: fileName,
        file_url: signedUrlData.signedUrl,
      }
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add comment to inquiry/quotation/project (with optional file attachments)
app.post("/make-server-c142e950/comments", async (c) => {
  try {
    const { inquiry_id, user_id, user_name, department, message, attachments } = await c.req.json();
    
    // Validate required fields
    if (!inquiry_id || !user_id || !user_name || !department) {
      return c.json({ 
        success: false, 
        error: "Missing required fields: inquiry_id, user_id, user_name, department" 
      }, 400);
    }
    
    // Validate that either message or attachments exist
    if (!message?.trim() && (!attachments || attachments.length === 0)) {
      return c.json({ success: false, error: "Either message or attachments must be provided" }, 400);
    }
    
    const now = new Date().toISOString();
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const comment = {
      id: commentId,
      inquiry_id,
      user_id,
      user_name,
      department,
      message: message?.trim() || "",
      attachments: attachments || [], // Array of { file_name, file_size, file_type, file_url }
      created_at: now,
    };
    
    // Store comment using dual-key pattern: inquiry_comment:{inquiry_id}:{comment_id}
    await kv.set(`inquiry_comment:${inquiry_id}:${commentId}`, comment);
    
    const attachmentInfo = attachments && attachments.length > 0 
      ? ` with ${attachments.length} attachment(s)` 
      : "";
    console.log(`Added comment ${commentId} to inquiry ${inquiry_id} by ${user_name} (${department})${attachmentInfo}`);
    
    return c.json({ success: true, data: comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== BOOKING COMMENTS API ====================

// Get comments for a booking
app.get("/make-server-c142e950/bookings/:booking_id/comments", async (c) => {
  try {
    const booking_id = c.req.param("booking_id");
    
    if (!booking_id) {
      return c.json({ success: false, error: "booking_id parameter required" }, 400);
    }
    
    // Get all comments for this booking
    const comments = await kv.getByPrefix(`booking_comment:${booking_id}:`);
    
    // Sort comments by created_at (most recent first)
    const sortedComments = comments.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    console.log(`Fetched ${comments.length} comments for booking ${booking_id}`);
    
    return c.json({ success: true, data: sortedComments });
  } catch (error) {
    console.error("Error fetching booking comments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload file attachment for booking comment
app.post("/make-server-c142e950/bookings/comments/upload", async (c) => {
  try {
    // Check if Supabase storage is available
    if (!supabase) {
      return c.json({ success: false, error: "File storage is not configured" }, 503);
    }
    
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const booking_id = formData.get("booking_id") as string;
    
    if (!file || !booking_id) {
      return c.json({ success: false, error: "Missing file or booking_id" }, 400);
    }
    
    // Generate unique file name
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `bookings/${booking_id}/${fileName}`;
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(COMMENT_ATTACHMENTS_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      return c.json({ success: false, error: `Storage upload failed: ${uploadError.message}` }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(COMMENT_ATTACHMENTS_BUCKET)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError);
      return c.json({ success: false, error: `Failed to create signed URL: ${signedUrlError.message}` }, 500);
    }
    
    console.log(`Uploaded file ${file.name} for booking ${booking_id}`);
    
    return c.json({
      success: true,
      data: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: signedUrlData.signedUrl,
      }
    });
  } catch (error) {
    console.error("Error in booking comment file upload:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add comment to booking (with optional file attachments)
app.post("/make-server-c142e950/bookings/:booking_id/comments", async (c) => {
  try {
    const booking_id = c.req.param("booking_id");
    const { user_id, user_name, department, message, attachments } = await c.req.json();
    
    // Validate required fields
    if (!booking_id || !user_id || !user_name || !department) {
      return c.json({ 
        success: false, 
        error: "Missing required fields: booking_id, user_id, user_name, department" 
      }, 400);
    }
    
    // Validate that either message or attachments exist
    if (!message?.trim() && (!attachments || attachments.length === 0)) {
      return c.json({ success: false, error: "Either message or attachments must be provided" }, 400);
    }
    
    const now = new Date().toISOString();
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const comment = {
      id: commentId,
      booking_id,
      user_id,
      user_name,
      department,
      message: message?.trim() || "",
      attachments: attachments || [], // Array of { file_name, file_size, file_type, file_url }
      created_at: now,
    };
    
    // Store comment using dual-key pattern: booking_comment:{booking_id}:{comment_id}
    await kv.set(`booking_comment:${booking_id}:${commentId}`, comment);
    
    const attachmentInfo = attachments && attachments.length > 0 
      ? ` with ${attachments.length} attachment(s)` 
      : "";
    console.log(`Added comment ${commentId} to booking ${booking_id} by ${user_name} (${department})${attachmentInfo}`);
    
    return c.json({ success: true, data: comment });
  } catch (error) {
    console.error("Error adding booking comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PROJECT ATTACHMENTS API ====================

const PROJECT_ATTACHMENTS_BUCKET = "make-c142e950-project-attachments";

// Initialize project attachments bucket
if (supabase) {
  (async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((bucket: any) => bucket.name === PROJECT_ATTACHMENTS_BUCKET);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(PROJECT_ATTACHMENTS_BUCKET, {
          public: false,
          fileSizeLimit: 52428800, // 50MB limit
        });
        
        if (error) {
          console.error("Error creating project attachments bucket:", error);
        } else {
          console.log("✅ Created project attachments bucket:", PROJECT_ATTACHMENTS_BUCKET);
        }
      } else {
        console.log("✅ Project attachments bucket already exists:", PROJECT_ATTACHMENTS_BUCKET);
      }
    } catch (error) {
      console.error("Error initializing project attachments bucket:", error);
    }
  })();
}

// Get all attachments for a project
app.get("/make-server-c142e950/projects/:id/attachments", async (c) => {
  try {
    const projectId = c.req.param("id");
    
    // Get all attachments for this project
    const allAttachments = await kv.getByPrefix(`project_attachment:${projectId}:`);
    
    // Sort by upload date (newest first)
    const sortedAttachments = allAttachments.sort((a: any, b: any) => 
      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
    
    return c.json({ success: true, data: sortedAttachments });
  } catch (error) {
    console.error("Error fetching project attachments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload attachment to project
app.post("/make-server-c142e950/projects/:id/attachments", async (c) => {
  try {
    const projectId = c.req.param("id");
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const uploadedBy = formData.get("uploaded_by") as string;
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }
    
    if (!supabase) {
      return c.json({ success: false, error: "Storage not configured" }, 500);
    }
    
    // Generate unique file name
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const fileExtension = file.name.split(".").pop();
    const storagePath = `${projectId}/${timestamp}-${randomId}.${fileExtension}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(PROJECT_ATTACHMENTS_BUCKET)
      .upload(storagePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      });
    
    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      return c.json({ success: false, error: uploadError.message }, 500);
    }
    
    // Generate signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(PROJECT_ATTACHMENTS_BUCKET)
      .createSignedUrl(storagePath, 31536000); // 1 year in seconds
    
    if (urlError || !urlData) {
      console.error("Error generating signed URL:", urlError);
      return c.json({ success: false, error: "Failed to generate file URL" }, 500);
    }
    
    // Save attachment metadata to KV store
    const attachmentId = `${timestamp}-${randomId}`;
    const attachment = {
      id: attachmentId,
      project_id: projectId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: urlData.signedUrl,
      storage_path: storagePath,
      uploaded_by: uploadedBy || "Unknown",
      uploaded_at: new Date().toISOString(),
    };
    
    await kv.set(`project_attachment:${projectId}:${attachmentId}`, attachment);
    
    console.log(`✅ Uploaded attachment ${file.name} to project ${projectId}`);
    
    return c.json({ success: true, data: attachment });
  } catch (error) {
    console.error("Error uploading project attachment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete attachment from project
app.delete("/make-server-c142e950/projects/:id/attachments/:attachmentId", async (c) => {
  try {
    const projectId = c.req.param("id");
    const attachmentId = c.req.param("attachmentId");
    
    // Get attachment metadata
    const attachment = await kv.get(`project_attachment:${projectId}:${attachmentId}`);
    
    if (!attachment) {
      return c.json({ success: false, error: "Attachment not found" }, 404);
    }
    
    if (!supabase) {
      return c.json({ success: false, error: "Storage not configured" }, 500);
    }
    
    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(PROJECT_ATTACHMENTS_BUCKET)
      .remove([attachment.storage_path]);
    
    if (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
      // Continue with metadata deletion even if storage delete fails
    }
    
    // Delete metadata from KV store
    await kv.del(`project_attachment:${projectId}:${attachmentId}`);
    
    console.log(`✅ Deleted attachment ${attachment.file_name} from project ${projectId}`);
    
    return c.json({ success: true, message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting project attachment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);