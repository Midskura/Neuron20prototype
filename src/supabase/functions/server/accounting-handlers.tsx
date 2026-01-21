// Accounting Module API Handlers - Clean & Consolidated
// Handles Expenses, Collections, and Billings with consistent patterns

import type { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ==================== UTILITIES ====================

/**
 * Generate consistent IDs with timestamps and random suffix
 */
function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate invoice number: INV-YYYY-XXX
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const allBillings = await kv.getByPrefix("billing:");
  const currentYearBillings = allBillings.filter((b: any) => 
    b.invoice_number?.startsWith(prefix)
  );
  
  const nextNumber = currentYearBillings.length + 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Standard error response
 */
function errorResponse(c: Context, message: string, status: number = 500) {
  console.error(`Error: ${message}`);
  return c.json({ success: false, error: message }, status);
}

/**
 * Standard success response
 */
function successResponse(c: Context, data: any, status: number = 200) {
  return c.json({ success: true, data }, status);
}

/**
 * Validate E-Voucher can be posted
 */
async function validateEVoucherForPosting(evoucherId: string): Promise<{ valid: boolean; error?: string; evoucher?: any }> {
  const evoucher = await kv.get(`evoucher:${evoucherId}`);
  
  if (!evoucher) {
    return { valid: false, error: "E-Voucher not found" };
  }
  
  if (evoucher.status !== "Approved") {
    return { valid: false, error: "Only approved E-Vouchers can be posted" };
  }
  
  if (evoucher.posted_to_ledger) {
    return { valid: false, error: "E-Voucher has already been posted" };
  }
  
  return { valid: true, evoucher };
}

// ==================== EXPENSES API ====================

/**
 * GET /expenses - Get all posted expenses from E-Vouchers
 * Only returns expenses that were posted from approved E-Vouchers
 */
export async function getExpenses(c: Context) {
  try {
    const dateFrom = c.req.query("date_from");
    const dateTo = c.req.query("date_to");
    const category = c.req.query("category");
    const vendor = c.req.query("vendor");
    const projectNumber = c.req.query("project_number");
    const search = c.req.query("search");
    
    let expenses = await kv.getByPrefix("expense:");
    
    // Filter by date range
    if (dateFrom) {
      expenses = expenses.filter((e: any) => 
        new Date(e.date) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      expenses = expenses.filter((e: any) => 
        new Date(e.date) <= new Date(dateTo)
      );
    }
    
    // Filter by category
    if (category && category !== "all") {
      expenses = expenses.filter((e: any) => e.category === category);
    }
    
    // Filter by vendor
    if (vendor) {
      expenses = expenses.filter((e: any) => 
        e.vendor?.toLowerCase().includes(vendor.toLowerCase())
      );
    }
    
    // Filter by project number
    if (projectNumber) {
      expenses = expenses.filter((e: any) => e.project_number === projectNumber);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      expenses = expenses.filter((e: any) =>
        e.description?.toLowerCase().includes(searchLower) ||
        e.vendor?.toLowerCase().includes(searchLower) ||
        e.evoucher_number?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date descending
    expenses.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    console.log(`✅ Fetched ${expenses.length} expenses`);
    
    return successResponse(c, expenses);
  } catch (error) {
    return errorResponse(c, `Failed to fetch expenses: ${error}`);
  }
}

/**
 * GET /expenses/:id - Get single expense
 */
export async function getExpenseById(c: Context) {
  try {
    const id = c.req.param("id");
    const expense = await kv.get(`expense:${id}`);
    
    if (!expense) {
      return errorResponse(c, "Expense not found", 404);
    }
    
    return successResponse(c, expense);
  } catch (error) {
    return errorResponse(c, `Failed to fetch expense: ${error}`);
  }
}

/**
 * DELETE /expenses/:id - Delete expense (admin only)
 */
export async function deleteExpense(c: Context) {
  try {
    const id = c.req.param("id");
    const expense = await kv.get(`expense:${id}`);
    
    if (!expense) {
      return errorResponse(c, "Expense not found", 404);
    }
    
    await kv.del(`expense:${id}`);
    
    console.log(`✅ Deleted expense ${id}`);
    
    return successResponse(c, { id, deleted: true });
  } catch (error) {
    return errorResponse(c, `Failed to delete expense: ${error}`);
  }
}

// ==================== COLLECTIONS API ====================

/**
 * GET /collections - Get all posted collections from E-Vouchers
 */
export async function getCollections(c: Context) {
  try {
    const dateFrom = c.req.query("date_from");
    const dateTo = c.req.query("date_to");
    const customerId = c.req.query("customer_id");
    const paymentMethod = c.req.query("payment_method");
    const projectNumber = c.req.query("project_number");
    const search = c.req.query("search");
    
    let collections = await kv.getByPrefix("collection:");
    
    // Filter by date range
    if (dateFrom) {
      collections = collections.filter((c: any) => 
        new Date(c.collection_date) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      collections = collections.filter((c: any) => 
        new Date(c.collection_date) <= new Date(dateTo)
      );
    }
    
    // Filter by customer
    if (customerId) {
      collections = collections.filter((c: any) => c.customer_id === customerId);
    }
    
    // Filter by payment method
    if (paymentMethod && paymentMethod !== "all") {
      collections = collections.filter((c: any) => c.payment_method === paymentMethod);
    }
    
    // Filter by project number
    if (projectNumber) {
      collections = collections.filter((c: any) => c.project_number === projectNumber);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      collections = collections.filter((c: any) =>
        c.description?.toLowerCase().includes(searchLower) ||
        c.customer_name?.toLowerCase().includes(searchLower) ||
        c.reference_number?.toLowerCase().includes(searchLower) ||
        c.evoucher_number?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by collection date descending
    collections.sort((a: any, b: any) => 
      new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime()
    );
    
    console.log(`✅ Fetched ${collections.length} collections`);
    
    return successResponse(c, collections);
  } catch (error) {
    return errorResponse(c, `Failed to fetch collections: ${error}`);
  }
}

/**
 * GET /collections/:id - Get single collection
 */
export async function getCollectionById(c: Context) {
  try {
    const id = c.req.param("id");
    const collection = await kv.get(`collection:${id}`);
    
    if (!collection) {
      return errorResponse(c, "Collection not found", 404);
    }
    
    return successResponse(c, collection);
  } catch (error) {
    return errorResponse(c, `Failed to fetch collection: ${error}`);
  }
}

/**
 * POST /evouchers/:id/post-to-collections - Post approved E-Voucher to Collections
 */
export async function postEVoucherToCollections(c: Context) {
  try {
    const evoucherId = c.req.param("id");
    const { user_id, user_name } = await c.req.json();
    
    // Validate E-Voucher
    const validation = await validateEVoucherForPosting(evoucherId);
    if (!validation.valid) {
      return errorResponse(c, validation.error!, 400);
    }
    
    const evoucher = validation.evoucher;
    
    // Verify transaction type
    if (evoucher.transaction_type !== "collection") {
      return errorResponse(c, "E-Voucher transaction type must be 'collection'", 400);
    }
    
    // Create collection entry
    const collectionId = generateId("COL");
    const collection = {
      id: collectionId,
      evoucher_id: evoucherId,
      evoucher_number: evoucher.voucher_number,
      collection_date: evoucher.request_date || new Date().toISOString().split('T')[0],
      customer_id: evoucher.customer_id || `CUST-${Date.now()}`,
      customer_name: evoucher.customer_name || evoucher.vendor_name || "Unknown Customer",
      amount: evoucher.amount,
      currency: evoucher.currency || "PHP",
      payment_method: evoucher.payment_method || "Bank Transfer",
      reference_number: evoucher.reference_number,
      project_number: evoucher.project_number,
      invoice_number: evoucher.invoice_number,
      description: evoucher.description || evoucher.purpose,
      notes: evoucher.notes,
      received_by: evoucher.requestor_id,
      received_by_name: evoucher.requestor_name,
      posted_by: user_id,
      posted_by_name: user_name,
      posted_at: new Date().toISOString(),
      status: "posted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`collection:${collectionId}`, collection);
    
    // Update E-Voucher
    const updatedEVoucher = {
      ...evoucher,
      status: "Posted",
      posted_to_ledger: true,
      ledger_entry_id: collectionId,
      ledger_entry_type: "collection",
      posted_at: new Date().toISOString(),
      posted_by: user_id,
      posted_by_name: user_name,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`evoucher:${evoucherId}`, updatedEVoucher);
    
    console.log(`✅ Posted E-Voucher ${evoucher.voucher_number} to Collections (${collectionId})`);
    
    return successResponse(c, {
      evoucher: updatedEVoucher,
      collection,
    });
  } catch (error) {
    return errorResponse(c, `Failed to post to collections: ${error}`);
  }
}

/**
 * DELETE /collections/:id - Delete collection (admin only)
 */
export async function deleteCollection(c: Context) {
  try {
    const id = c.req.param("id");
    const collection = await kv.get(`collection:${id}`);
    
    if (!collection) {
      return errorResponse(c, "Collection not found", 404);
    }
    
    await kv.del(`collection:${id}`);
    
    console.log(`✅ Deleted collection ${id}`);
    
    return successResponse(c, { id, deleted: true });
  } catch (error) {
    return errorResponse(c, `Failed to delete collection: ${error}`);
  }
}

// ==================== BILLINGS API ====================

/**
 * GET /billings - Get all billings with filtering
 */
export async function getBillings(c: Context) {
  try {
    const dateFrom = c.req.query("dateFrom");
    const dateTo = c.req.query("dateTo");
    const customerId = c.req.query("customerId");
    const paymentStatus = c.req.query("paymentStatus");
    const projectNumber = c.req.query("projectNumber");
    const search = c.req.query("search");
    
    let billings = await kv.getByPrefix("billing:");
    
    // Normalize billing objects - ensure they all have an 'id' field
    billings = billings.map((b: any) => {
      // If billing has billingId but not id, use billingId as id
      if (!b.id && b.billingId) {
        return { ...b, id: b.billingId };
      }
      return b;
    });
    
    // Filter by date range
    if (dateFrom) {
      billings = billings.filter((b: any) => 
        new Date(b.invoice_date) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      billings = billings.filter((b: any) => 
        new Date(b.invoice_date) <= new Date(dateTo)
      );
    }
    
    // Filter by customer
    if (customerId) {
      billings = billings.filter((b: any) => b.customer_id === customerId);
    }
    
    // Filter by payment status
    if (paymentStatus && paymentStatus !== "all") {
      billings = billings.filter((b: any) => b.payment_status === paymentStatus);
    }
    
    // Filter by project number
    if (projectNumber) {
      billings = billings.filter((b: any) => b.project_number === projectNumber);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      billings = billings.filter((b: any) =>
        b.description?.toLowerCase().includes(searchLower) ||
        b.customer_name?.toLowerCase().includes(searchLower) ||
        b.invoice_number?.toLowerCase().includes(searchLower) ||
        b.evoucher_number?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by invoice date descending
    billings.sort((a: any, b: any) => 
      new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
    );
    
    console.log(`✅ Fetched ${billings.length} billings`);
    
    return successResponse(c, billings);
  } catch (error) {
    return errorResponse(c, `Failed to fetch billings: ${error}`);
  }
}

/**
 * GET /billings/:id - Get single billing
 */
export async function getBillingById(c: Context) {
  try {
    const id = c.req.param("id");
    const billing = await kv.get(`billing:${id}`);
    
    if (!billing) {
      return errorResponse(c, "Billing not found", 404);
    }
    
    return successResponse(c, billing);
  } catch (error) {
    return errorResponse(c, `Failed to fetch billing: ${error}`);
  }
}

/**
 * POST /evouchers/:id/post-to-billings - Post approved E-Voucher to Billings
 */
export async function postEVoucherToBillings(c: Context) {
  try {
    const evoucherId = c.req.param("id");
    const { user_id, user_name } = await c.req.json();
    
    // Validate E-Voucher
    const validation = await validateEVoucherForPosting(evoucherId);
    if (!validation.valid) {
      return errorResponse(c, validation.error!, 400);
    }
    
    const evoucher = validation.evoucher;
    
    // Verify transaction type
    if (evoucher.transaction_type !== "billing") {
      return errorResponse(c, "E-Voucher transaction type must be 'billing'", 400);
    }
    
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    
    // Create billing entry
    const billingId = generateId("BILL");
    const invoiceDate = evoucher.request_date || new Date().toISOString().split('T')[0];
    const dueDate = evoucher.due_date || calculateDueDate(invoiceDate, evoucher.credit_terms);
    
    const billing = {
      id: billingId,
      evoucher_id: evoucherId,
      evoucher_number: evoucher.voucher_number,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      customer_id: evoucher.customer_id || `CUST-${Date.now()}`,
      customer_name: evoucher.customer_name || evoucher.vendor_name || "Unknown Customer",
      customer_address: evoucher.customer_address,
      customer_contact: evoucher.customer_contact,
      project_number: evoucher.project_number,
      booking_id: evoucher.booking_id,
      line_items: evoucher.line_items || [{
        id: "1",
        description: evoucher.description || evoucher.purpose,
        quantity: 1,
        unit_price: evoucher.amount,
        amount: evoucher.amount,
      }],
      subtotal: evoucher.amount,
      tax_amount: evoucher.tax_amount || 0,
      discount_amount: evoucher.discount_amount || 0,
      total_amount: evoucher.amount,
      currency: evoucher.currency || "PHP",
      payment_terms: evoucher.credit_terms || "Net 30",
      payment_status: "unpaid",
      amount_paid: 0,
      amount_due: evoucher.amount,
      description: evoucher.description || evoucher.purpose,
      notes: evoucher.notes,
      created_by: evoucher.requestor_id,
      created_by_name: evoucher.requestor_name,
      posted_by: user_id,
      posted_by_name: user_name,
      posted_at: new Date().toISOString(),
      status: "posted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`billing:${billingId}`, billing);
    
    // Update E-Voucher
    const updatedEVoucher = {
      ...evoucher,
      status: "Posted",
      posted_to_ledger: true,
      ledger_entry_id: billingId,
      ledger_entry_type: "billing",
      invoice_number: invoiceNumber,
      posted_at: new Date().toISOString(),
      posted_by: user_id,
      posted_by_name: user_name,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`evoucher:${evoucherId}`, updatedEVoucher);
    
    console.log(`✅ Posted E-Voucher ${evoucher.voucher_number} to Billings (${invoiceNumber})`);
    
    return successResponse(c, {
      evoucher: updatedEVoucher,
      billing,
    });
  } catch (error) {
    return errorResponse(c, `Failed to post to billings: ${error}`);
  }
}

/**
 * PATCH /billings/:id/payment - Update payment status
 */
export async function updateBillingPayment(c: Context) {
  try {
    const id = c.req.param("id");
    const { amount_paid, payment_status } = await c.req.json();
    
    const billing = await kv.get(`billing:${id}`);
    
    if (!billing) {
      return errorResponse(c, "Billing not found", 404);
    }
    
    const updatedBilling = {
      ...billing,
      amount_paid,
      amount_due: billing.total_amount - amount_paid,
      payment_status: payment_status || (amount_paid >= billing.total_amount ? "paid" : "partial"),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`billing:${id}`, updatedBilling);
    
    console.log(`✅ Updated billing payment ${id}: ${payment_status}`);
    
    return successResponse(c, updatedBilling);
  } catch (error) {
    return errorResponse(c, `Failed to update billing payment: ${error}`);
  }
}

/**
 * DELETE /billings/:id - Delete billing (admin only)
 */
export async function deleteBilling(c: Context) {
  try {
    const id = c.req.param("id");
    console.log(`🗑️ Attempting to delete billing with ID: ${id}`);
    
    // If id is undefined or "undefined", try to find by searching all billings
    if (!id || id === "undefined") {
      console.error(`❌ Invalid billing ID provided: ${id}`);
      return errorResponse(c, "Invalid billing ID", 400);
    }
    
    const billing = await kv.get(`billing:${id}`);
    
    if (!billing) {
      console.error(`❌ Billing not found: billing:${id}`);
      
      // Debug: List all billings to see what's available
      const allBillings = await kv.getByPrefix("billing:");
      console.log(`📋 Total billings in database: ${allBillings.length}`);
      
      if (allBillings.length > 0) {
        console.log(`📋 Sample billing structures:`);
        allBillings.slice(0, 3).forEach((b: any, idx: number) => {
          console.log(`  ${idx + 1}. Keys:`, Object.keys(b));
          console.log(`     id: ${b.id}, billingId: ${b.billingId}, invoice: ${b.invoice_number}`);
        });
      }
      
      return errorResponse(c, "Billing not found", 404);
    }
    
    console.log(`✅ Found billing: ${billing.invoice_number || billing.description || 'unnamed'}, deleting...`);
    await kv.del(`billing:${id}`);
    
    console.log(`✅ Deleted billing ${id}`);
    
    return successResponse(c, { id, deleted: true });
  } catch (error) {
    return errorResponse(c, `Failed to delete billing: ${error}`);
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate due date based on credit terms
 */
function calculateDueDate(invoiceDate: string, creditTerms?: string): string {
  const date = new Date(invoiceDate);
  
  if (!creditTerms) {
    // Default: Net 30
    date.setDate(date.getDate() + 30);
  } else if (creditTerms.includes("Net")) {
    // Parse "Net 30", "Net 60", etc.
    const days = parseInt(creditTerms.replace(/\D/g, "")) || 30;
    date.setDate(date.getDate() + days);
  } else {
    // Default fallback
    date.setDate(date.getDate() + 30);
  }
  
  return date.toISOString().split('T')[0];
}