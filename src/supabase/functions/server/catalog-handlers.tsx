// Expense & Charge Catalog API Handlers
// Manages master catalog of financial line items (Item Master)
// KV keys: catalog_item:{id}, catalog_category:{id}

import type { Context } from "npm:hono";
import * as kv from "./kv_store_robust.tsx";

// ==================== UTILITIES ====================

function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

function errorResponse(c: Context, message: string, status: number = 500) {
  console.error(`Catalog Error: ${message}`);
  return c.json({ success: false, error: message }, status);
}

function successResponse(c: Context, data: any, status: number = 200) {
  return c.json({ success: true, data }, status);
}

// ==================== TYPES ====================

export interface CatalogItem {
  id: string;
  name: string;
  type: "expense" | "charge" | "both";
  category: string;
  service_types: string[];
  default_currency: string;
  default_amount: number | null;
  is_taxable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

// ==================== CATALOG ITEMS ====================

/**
 * GET /catalog/items
 * List all catalog items, with optional filters:
 *   ?search=arrastre
 *   ?service_type=Brokerage
 *   ?type=expense
 *   ?include_inactive=true
 */
export async function listCatalogItems(c: Context) {
  try {
    const search = c.req.query("search")?.toLowerCase() || "";
    const serviceType = c.req.query("service_type") || "";
    const itemType = c.req.query("type") || "";
    const includeInactive = c.req.query("include_inactive") === "true";

    const allItems: CatalogItem[] = await kv.getByPrefix("catalog_item:");

    let filtered = allItems;

    // Filter by active status
    if (!includeInactive) {
      filtered = filtered.filter((item) => item.is_active !== false);
    }

    // Filter by search term (fuzzy: name contains search string)
    if (search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search)
      );
    }

    // Filter by service type
    if (serviceType) {
      filtered = filtered.filter((item) =>
        item.service_types?.includes(serviceType)
      );
    }

    // Filter by item type
    if (itemType) {
      filtered = filtered.filter((item) => item.type === itemType);
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(c, filtered);
  } catch (error) {
    return errorResponse(c, `Error listing catalog items: ${String(error)}`);
  }
}

/**
 * GET /catalog/items/:id
 * Get a single catalog item by ID
 */
export async function getCatalogItem(c: Context) {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`catalog_item:${id}`);

    if (!item) {
      return errorResponse(c, `Catalog item not found: ${id}`, 404);
    }

    return successResponse(c, item);
  } catch (error) {
    return errorResponse(c, `Error getting catalog item: ${String(error)}`);
  }
}

/**
 * POST /catalog/items
 * Create a new catalog item
 */
export async function createCatalogItem(c: Context) {
  try {
    const body = await c.req.json();
    const { name, type, category, service_types, default_currency, default_amount, is_taxable } = body;

    if (!name || !type) {
      return errorResponse(c, "Name and type are required", 400);
    }

    if (!["expense", "charge", "both"].includes(type)) {
      return errorResponse(c, "Type must be 'expense', 'charge', or 'both'", 400);
    }

    const id = generateId("ci");
    const now = new Date().toISOString();

    const item: CatalogItem = {
      id,
      name: name.trim(),
      type,
      category: (category || "Uncategorized").trim(),
      service_types: service_types || [],
      default_currency: default_currency || "PHP",
      default_amount: default_amount ?? null,
      is_taxable: is_taxable ?? false,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    await kv.set(`catalog_item:${id}`, item);

    // Also ensure the category exists
    if (item.category && item.category !== "Uncategorized") {
      await ensureCategoryExists(item.category);
    }

    console.log(`Created catalog item: ${item.name} (${item.id})`);
    return successResponse(c, item, 201);
  } catch (error) {
    return errorResponse(c, `Error creating catalog item: ${String(error)}`);
  }
}

/**
 * PUT /catalog/items/:id
 * Update a catalog item
 */
export async function updateCatalogItem(c: Context) {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`catalog_item:${id}`);

    if (!existing) {
      return errorResponse(c, `Catalog item not found: ${id}`, 404);
    }

    const body = await c.req.json();
    const updated: CatalogItem = {
      ...existing,
      ...body,
      id, // prevent ID override
      updated_at: new Date().toISOString(),
    };

    // Validate type if provided
    if (body.type && !["expense", "charge", "both"].includes(body.type)) {
      return errorResponse(c, "Type must be 'expense', 'charge', or 'both'", 400);
    }

    await kv.set(`catalog_item:${id}`, updated);

    // Ensure category exists if changed
    if (updated.category && updated.category !== "Uncategorized") {
      await ensureCategoryExists(updated.category);
    }

    console.log(`Updated catalog item: ${updated.name} (${id})`);
    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, `Error updating catalog item: ${String(error)}`);
  }
}

/**
 * DELETE /catalog/items/:id
 * Soft-delete: sets is_active to false
 */
export async function deleteCatalogItem(c: Context) {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`catalog_item:${id}`);

    if (!existing) {
      return errorResponse(c, `Catalog item not found: ${id}`, 404);
    }

    const updated = {
      ...existing,
      is_active: false,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`catalog_item:${id}`, updated);

    console.log(`Deactivated catalog item: ${existing.name} (${id})`);
    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, `Error deactivating catalog item: ${String(error)}`);
  }
}

// ==================== CATALOG CATEGORIES ====================

/**
 * Ensure a category exists in the KV store (idempotent)
 */
async function ensureCategoryExists(categoryName: string) {
  const allCategories: CatalogCategory[] = await kv.getByPrefix("catalog_category:");
  const exists = allCategories.some(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!exists) {
    const id = generateId("cc");
    const category: CatalogCategory = {
      id,
      name: categoryName.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    await kv.set(`catalog_category:${id}`, category);
    console.log(`Auto-created catalog category: ${categoryName} (${id})`);
  }
}

/**
 * GET /catalog/categories
 * List all categories
 */
export async function listCatalogCategories(c: Context) {
  try {
    const allCategories: CatalogCategory[] = await kv.getByPrefix("catalog_category:");
    const active = allCategories.filter((cat) => cat.is_active !== false);
    active.sort((a, b) => a.name.localeCompare(b.name));
    return successResponse(c, active);
  } catch (error) {
    return errorResponse(c, `Error listing catalog categories: ${String(error)}`);
  }
}

/**
 * POST /catalog/categories
 * Create a new category
 */
export async function createCatalogCategory(c: Context) {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return errorResponse(c, "Category name is required", 400);
    }

    // Check for duplicate
    const allCategories: CatalogCategory[] = await kv.getByPrefix("catalog_category:");
    const exists = allCategories.some(
      (cat) => cat.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (exists) {
      return errorResponse(c, `Category '${name}' already exists`, 409);
    }

    const id = generateId("cc");
    const category: CatalogCategory = {
      id,
      name: name.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    await kv.set(`catalog_category:${id}`, category);
    console.log(`Created catalog category: ${name} (${id})`);
    return successResponse(c, category, 201);
  } catch (error) {
    return errorResponse(c, `Error creating catalog category: ${String(error)}`);
  }
}

// ==================== SEED DATA ====================

/**
 * POST /catalog/seed
 * Seed common expense/charge items for Philippine freight forwarding
 * Idempotent: skips items whose name already exists
 */
export async function seedCatalogItems(c: Context) {
  try {
    const existingItems: CatalogItem[] = await kv.getByPrefix("catalog_item:");
    const existingNames = new Set(existingItems.map((i) => i.name.toLowerCase()));

    const seedItems: Omit<CatalogItem, "id" | "created_at" | "updated_at">[] = [
      // Government Fees
      { name: "Arrastre/Wharfage", type: "both", category: "Government Fees", service_types: ["Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },
      { name: "Duties & Taxes", type: "both", category: "Government Fees", service_types: ["Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },
      { name: "Import Processing Fee", type: "expense", category: "Government Fees", service_types: ["Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },
      { name: "Customs Exam Fee", type: "expense", category: "Government Fees", service_types: ["Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },
      { name: "Value Added Tax (VAT)", type: "both", category: "Government Fees", service_types: ["Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },

      // Brokerage Fees
      { name: "Document Fees", type: "both", category: "Brokerage Fees", service_types: ["Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Processing Fee", type: "charge", category: "Brokerage Fees", service_types: ["Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Handling Fee", type: "charge", category: "Brokerage Fees", service_types: ["Brokerage", "Forwarding", "Trucking"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Brokerage Fee", type: "charge", category: "Brokerage Fees", service_types: ["Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Arrangement Fee", type: "charge", category: "Brokerage Fees", service_types: ["Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },

      // Trucking Costs
      { name: "Local Trucking", type: "both", category: "Trucking Costs", service_types: ["Trucking", "Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Toll Fees", type: "expense", category: "Trucking Costs", service_types: ["Trucking"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },
      { name: "Fuel Surcharge", type: "both", category: "Trucking Costs", service_types: ["Trucking"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Driver Allowance", type: "expense", category: "Trucking Costs", service_types: ["Trucking"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },
      { name: "Demurrage/Detention", type: "both", category: "Trucking Costs", service_types: ["Trucking", "Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },

      // Forwarding Charges
      { name: "Ocean Freight", type: "both", category: "Freight Charges", service_types: ["Forwarding"], default_currency: "USD", default_amount: null, is_taxable: false, is_active: true },
      { name: "Air Freight", type: "both", category: "Freight Charges", service_types: ["Forwarding"], default_currency: "USD", default_amount: null, is_taxable: false, is_active: true },
      { name: "Bill of Lading Fee", type: "both", category: "Freight Charges", service_types: ["Forwarding"], default_currency: "USD", default_amount: null, is_taxable: false, is_active: true },
      { name: "CFS Charges", type: "both", category: "Freight Charges", service_types: ["Forwarding"], default_currency: "USD", default_amount: null, is_taxable: false, is_active: true },
      { name: "Terminal Handling Charge", type: "both", category: "Freight Charges", service_types: ["Forwarding"], default_currency: "USD", default_amount: null, is_taxable: false, is_active: true },

      // Equipment Costs
      { name: "Container Rental", type: "expense", category: "Equipment Costs", service_types: ["Forwarding", "Trucking"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Container Deposit", type: "expense", category: "Equipment Costs", service_types: ["Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: false, is_active: true },

      // Insurance
      { name: "Marine Insurance", type: "both", category: "Insurance", service_types: ["Forwarding", "Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },

      // Surcharges
      { name: "Rush Surcharge", type: "charge", category: "Surcharges", service_types: ["Brokerage", "Trucking", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Overweight Surcharge", type: "charge", category: "Surcharges", service_types: ["Trucking"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Weekend/Holiday Surcharge", type: "charge", category: "Surcharges", service_types: ["Trucking", "Brokerage"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },

      // Service Fees
      { name: "Coordination Fee", type: "charge", category: "Service Fees", service_types: ["Brokerage", "Forwarding", "Trucking", "Others"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Communication Fee", type: "charge", category: "Service Fees", service_types: ["Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },

      // Others
      { name: "Storage Charges", type: "both", category: "Warehousing", service_types: ["Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
      { name: "Stripping Charges", type: "both", category: "Warehousing", service_types: ["Brokerage", "Forwarding"], default_currency: "PHP", default_amount: null, is_taxable: true, is_active: true },
    ];

    const now = new Date().toISOString();
    let created = 0;
    let skipped = 0;

    for (const seed of seedItems) {
      if (existingNames.has(seed.name.toLowerCase())) {
        skipped++;
        continue;
      }

      const id = generateId("ci");
      const item: CatalogItem = {
        ...seed,
        id,
        created_at: now,
        updated_at: now,
      };
      await kv.set(`catalog_item:${id}`, item);

      // Ensure category exists
      if (item.category) {
        await ensureCategoryExists(item.category);
      }

      created++;
    }

    console.log(`Catalog seed complete: ${created} created, ${skipped} skipped (already exist)`);
    return successResponse(c, { created, skipped, total: seedItems.length });
  } catch (error) {
    return errorResponse(c, `Error seeding catalog items: ${String(error)}`);
  }
}

// ==================== AUDITING / AGGREGATION ====================

/**
 * Infer service type from a booking ID prefix.
 * BRK → Brokerage, TRK → Trucking, FWD → Forwarding, MI → Marine Insurance, OTH → Others
 */
function inferServiceType(bookingId: string): string {
  if (!bookingId) return "Unknown";
  const prefix = bookingId.split("-")[0]?.toUpperCase();
  switch (prefix) {
    case "BRK": return "Brokerage";
    case "TRK": return "Trucking";
    case "FWD": return "Forwarding";
    case "MI":  return "Marine Insurance";
    case "OTH": return "Others";
    default:    return "Unknown";
  }
}

/**
 * Normalize a line item to a common shape for aggregation.
 * Handles field name variations (booking_id vs bookingId, created_at vs createdAt).
 */
function normalizeLineItem(item: any): {
  booking_id: string;
  description: string;
  amount: number;
  currency: string;
  catalog_item_id: string | null;
  date: string;
  project_number: string;
} {
  return {
    booking_id: item.booking_id || item.bookingId || "",
    description: item.description || item.name || "",
    amount: Number(item.amount) || 0,
    currency: item.currency || "PHP",
    catalog_item_id: item.catalog_item_id || null,
    date: item.created_at || item.createdAt || item.request_date || "",
    project_number: item.project_number || item.projectNumber || "",
  };
}

/**
 * GET /catalog/audit/matrix
 * Pivot table: bookings as rows, catalog items as columns, amounts as values.
 * Query params:
 *   ?period=2026-02       (YYYY-MM, defaults to current month)
 *   ?service_type=Brokerage (optional, filters by booking prefix)
 *   ?view=charges|expenses|both (default: charges)
 *   ?client=              (optional, filters by client name on bookings — future)
 */
export async function auditMatrix(c: Context) {
  try {
    const periodParam = c.req.query("period") || "";
    const serviceTypeFilter = c.req.query("service_type") || "";
    const view = c.req.query("view") || "charges";

    // Determine date range from period (YYYY-MM)
    let startDate: Date;
    let endDate: Date;
    if (periodParam && /^\d{4}-\d{2}$/.test(periodParam)) {
      const [year, month] = periodParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Fetch raw line items based on view
    let rawItems: any[] = [];

    if (view === "charges" || view === "both") {
      const [billingItems, billings] = await Promise.all([
        kv.getByPrefix("billing_item:"),
        kv.getByPrefix("billing:"),
      ]);
      rawItems.push(...billingItems, ...billings);
    }

    if (view === "expenses" || view === "both") {
      const expenses = await kv.getByPrefix("expense:");
      rawItems.push(...expenses);
    }

    // Normalize all items
    const normalized = rawItems.map(normalizeLineItem);

    // Filter by date range
    const inPeriod = normalized.filter((item) => {
      if (!item.date) return false;
      const d = new Date(item.date);
      return d >= startDate && d <= endDate;
    });

    // Filter by service type (inferred from booking ID prefix)
    const filtered = serviceTypeFilter
      ? inPeriod.filter((item) => inferServiceType(item.booking_id) === serviceTypeFilter)
      : inPeriod;

    // Build catalog item lookup map (id → name)
    const catalogItems: CatalogItem[] = await kv.getByPrefix("catalog_item:");
    const catalogMap = new Map<string, string>();
    for (const ci of catalogItems) {
      catalogMap.set(ci.id, ci.name);
    }

    // Pivot: group by booking_id, then by catalog_item_id
    const bookingMap = new Map<string, {
      booking_id: string;
      project_number: string;
      cells: Map<string, { amount: number; currency: string }>;
    }>();

    // Track which catalog_item_ids appear
    const seenCatalogIds = new Set<string>();
    let totalLineItems = 0;
    let unlinkedCount = 0;

    for (const item of filtered) {
      if (!item.booking_id) continue;
      totalLineItems++;

      const colKey = item.catalog_item_id || "__unlinked__";
      if (!item.catalog_item_id) {
        unlinkedCount++;
      }
      seenCatalogIds.add(colKey);

      if (!bookingMap.has(item.booking_id)) {
        bookingMap.set(item.booking_id, {
          booking_id: item.booking_id,
          project_number: item.project_number,
          cells: new Map(),
        });
      }

      const bookingEntry = bookingMap.get(item.booking_id)!;
      const existing = bookingEntry.cells.get(colKey);
      if (existing) {
        existing.amount += item.amount;
      } else {
        bookingEntry.cells.set(colKey, { amount: item.amount, currency: item.currency });
      }
    }

    // Build columns (sorted by name, __unlinked__ last)
    const columns: { catalog_item_id: string; name: string }[] = [];
    for (const cid of seenCatalogIds) {
      if (cid === "__unlinked__") continue;
      columns.push({
        catalog_item_id: cid,
        name: catalogMap.get(cid) || cid,
      });
    }
    columns.sort((a, b) => a.name.localeCompare(b.name));
    if (seenCatalogIds.has("__unlinked__")) {
      columns.push({ catalog_item_id: "__unlinked__", name: "Unlinked Items" });
    }

    // Build rows (sorted by booking_id)
    const rows: any[] = [];
    for (const [, entry] of bookingMap) {
      const cellsObj: Record<string, { amount: number; currency: string }> = {};
      for (const [colKey, val] of entry.cells) {
        cellsObj[colKey] = val;
      }
      rows.push({
        booking_id: entry.booking_id,
        project_number: entry.project_number,
        service_type: inferServiceType(entry.booking_id),
        cells: cellsObj,
      });
    }
    rows.sort((a: any, b: any) => a.booking_id.localeCompare(b.booking_id));

    // Build totals
    const totals: Record<string, number> = {};
    for (const col of columns) {
      let sum = 0;
      for (const row of rows) {
        sum += row.cells[col.catalog_item_id]?.amount || 0;
      }
      totals[col.catalog_item_id] = sum;
    }

    const linkedCount = totalLineItems - unlinkedCount;
    const linkedPercentage = totalLineItems > 0
      ? Math.round((linkedCount / totalLineItems) * 1000) / 10
      : 100;

    return successResponse(c, {
      columns,
      rows,
      totals,
      meta: {
        total_bookings: rows.length,
        total_line_items: totalLineItems,
        unlinked_count: unlinkedCount,
        linked_count: linkedCount,
        linked_percentage: linkedPercentage,
        period: periodParam || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`,
        service_type: serviceTypeFilter || "All",
        view,
      },
    });
  } catch (error) {
    return errorResponse(c, `Error building audit matrix: ${String(error)}`);
  }
}

/**
 * GET /catalog/audit/summary
 * Per-catalog-item aggregation: total, count of bookings, average per booking.
 * Query params: same as matrix (period, service_type, view)
 */
export async function auditSummary(c: Context) {
  try {
    const periodParam = c.req.query("period") || "";
    const serviceTypeFilter = c.req.query("service_type") || "";
    const view = c.req.query("view") || "both";

    // Determine date range
    let startDate: Date;
    let endDate: Date;
    if (periodParam && /^\d{4}-\d{2}$/.test(periodParam)) {
      const [year, month] = periodParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Fetch raw line items
    let rawItems: any[] = [];

    if (view === "charges" || view === "both") {
      const [billingItems, billings] = await Promise.all([
        kv.getByPrefix("billing_item:"),
        kv.getByPrefix("billing:"),
      ]);
      rawItems.push(...billingItems, ...billings);
    }

    if (view === "expenses" || view === "both") {
      const expenses = await kv.getByPrefix("expense:");
      rawItems.push(...expenses);
    }

    // Normalize, filter by period and service type
    const normalized = rawItems.map(normalizeLineItem);
    const inPeriod = normalized.filter((item) => {
      if (!item.date) return false;
      const d = new Date(item.date);
      return d >= startDate && d <= endDate;
    });
    const filtered = serviceTypeFilter
      ? inPeriod.filter((item) => inferServiceType(item.booking_id) === serviceTypeFilter)
      : inPeriod;

    // Build catalog item lookup
    const catalogItems: CatalogItem[] = await kv.getByPrefix("catalog_item:");
    const catalogMap = new Map<string, CatalogItem>();
    for (const ci of catalogItems) {
      catalogMap.set(ci.id, ci);
    }

    // Aggregate by catalog_item_id
    const agg = new Map<string, {
      catalog_item_id: string;
      name: string;
      type: string;
      total_amount: number;
      booking_ids: Set<string>;
      line_item_count: number;
    }>();

    let totalLineItems = 0;
    let unlinkedCount = 0;

    for (const item of filtered) {
      if (!item.booking_id) continue;
      totalLineItems++;

      const colKey = item.catalog_item_id || "__unlinked__";
      if (!item.catalog_item_id) unlinkedCount++;

      if (!agg.has(colKey)) {
        const ci = catalogMap.get(colKey);
        agg.set(colKey, {
          catalog_item_id: colKey,
          name: ci?.name || (colKey === "__unlinked__" ? "Unlinked Items" : colKey),
          type: ci?.type || "—",
          total_amount: 0,
          booking_ids: new Set(),
          line_item_count: 0,
        });
      }

      const entry = agg.get(colKey)!;
      entry.total_amount += item.amount;
      entry.booking_ids.add(item.booking_id);
      entry.line_item_count++;
    }

    // Build summary rows sorted by total descending, __unlinked__ last
    const summaryRows: any[] = [];
    for (const [, entry] of agg) {
      if (entry.catalog_item_id === "__unlinked__") continue;
      const bookingCount = entry.booking_ids.size;
      summaryRows.push({
        catalog_item_id: entry.catalog_item_id,
        name: entry.name,
        type: entry.type,
        booking_count: bookingCount,
        line_item_count: entry.line_item_count,
        total_amount: Math.round(entry.total_amount * 100) / 100,
        avg_per_booking: bookingCount > 0 ? Math.round((entry.total_amount / bookingCount) * 100) / 100 : 0,
      });
    }
    summaryRows.sort((a, b) => Math.abs(b.total_amount) - Math.abs(a.total_amount));

    // Add unlinked row at end if present
    const unlinkedEntry = agg.get("__unlinked__");
    if (unlinkedEntry) {
      const bookingCount = unlinkedEntry.booking_ids.size;
      summaryRows.push({
        catalog_item_id: "__unlinked__",
        name: "Unlinked Items",
        type: "—",
        booking_count: bookingCount,
        line_item_count: unlinkedEntry.line_item_count,
        total_amount: Math.round(unlinkedEntry.total_amount * 100) / 100,
        avg_per_booking: bookingCount > 0 ? Math.round((unlinkedEntry.total_amount / bookingCount) * 100) / 100 : 0,
      });
    }

    const linkedCount = totalLineItems - unlinkedCount;
    const linkedPercentage = totalLineItems > 0
      ? Math.round((linkedCount / totalLineItems) * 1000) / 10
      : 100;

    return successResponse(c, {
      items: summaryRows,
      meta: {
        total_catalog_items: summaryRows.length,
        total_line_items: totalLineItems,
        unlinked_count: unlinkedCount,
        linked_count: linkedCount,
        linked_percentage: linkedPercentage,
        period: periodParam || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`,
        service_type: serviceTypeFilter || "All",
        view,
      },
    });
  } catch (error) {
    return errorResponse(c, `Error building audit summary: ${String(error)}`);
  }
}