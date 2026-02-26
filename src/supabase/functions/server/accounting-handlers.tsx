// Accounting Module API Handlers - Clean & Consolidated
// Handles Expenses, Collections, and Billings with consistent patterns

import type { Context } from "npm:hono";
import * as kv from "./kv_store_robust.tsx";

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

// ==================== JOURNAL ENTRIES API ====================

/**
 * POST /journal-entries - Create a manual journal entry
 */
export async function createJournalEntry(c: Context) {
  try {
    const entryData = await c.req.json();
    const { 
      transaction_date, 
      description, 
      reference_number, 
      transaction_type, 
      entity_id, 
      project_id, 
      lines,
      created_by 
    } = entryData;

    // Validation
    if (!lines || lines.length < 2) {
      return errorResponse(c, "Journal entry must have at least 2 lines", 400);
    }

    const totalDebits = lines.reduce((sum: number, line: any) => sum + (Number(line.debit) || 0), 0);
    const totalCredits = lines.reduce((sum: number, line: any) => sum + (Number(line.credit) || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) { // Floating point tolerance
      return errorResponse(c, `Journal entry must balance. Debits: ${totalDebits}, Credits: ${totalCredits}`, 400);
    }

    const id = generateId("JE");
    const now = new Date().toISOString();

    const journalEntry = {
      id,
      transaction_date,
      posted_at: now,
      description,
      reference_number,
      transaction_type,
      entity_id,
      project_id,
      lines: lines.map((line: any) => ({
        id: generateId("JL"),
        ...line
      })),
      total_amount: totalDebits,
      status: "Posted",
      created_by,
      created_at: now,
      updated_at: now
    };

    await kv.set(`journal_entry:${id}`, journalEntry);

    // Update Account Balances (Simple implementation)
    // In a real system, we might recalculate from ledger, but for KV store, we update running balance
    for (const line of lines) {
      if (line.account_id) {
        // USE NEW PREFIX: accounting:account:
        const account = await kv.get(`accounting:account:${line.account_id}`);
        if (account) {
          // Asset/Expense: Debit increases, Credit decreases
          // Liability/Equity/Income: Credit increases, Debit decreases
          // HOWEVER, standard storage is usually: Debit (+), Credit (-) or vice versa.
          // Let's store a raw "balance" where Assets are positive.
          // Simplest for now: Just log it. Real balance calculation should be dynamic.
          // Or, update a 'cached_balance' field.
          
          let impact = 0;
          const type = account.type;
          
          // Normal Balance Logic
          if (["Asset", "Expense"].includes(type)) {
             impact = (Number(line.debit) || 0) - (Number(line.credit) || 0);
          } else {
             impact = (Number(line.credit) || 0) - (Number(line.debit) || 0);
          }
          
          account.balance = (account.balance || 0) + impact;
          // USE NEW PREFIX: accounting:account:
          await kv.set(`accounting:account:${account.id}`, account);
        }
      }
    }

    console.log(`✅ Created Journal Entry ${id} (${totalDebits})`);
    return successResponse(c, journalEntry);

  } catch (error) {
    return errorResponse(c, `Failed to create journal entry: ${error}`);
  }
}

/**
 * POST /evouchers/:id/post-to-ledger - Post approved E-Voucher to General Ledger
 */
export async function postEVoucherToLedger(c: Context) {
  try {
    const evoucherId = c.req.param("id");
    const { 
      user_id, 
      user_name, 
      debit_account_id, 
      credit_account_id,
      posting_date 
    } = await c.req.json();
    
    // Validate E-Voucher
    const validation = await validateEVoucherForPosting(evoucherId);
    if (!validation.valid) {
      return errorResponse(c, validation.error!, 400);
    }
    
    const evoucher = validation.evoucher;
    
    // Validate Accounts
    if (!debit_account_id || !credit_account_id) {
      return errorResponse(c, "Debit and Credit accounts are required", 400);
    }

    // USE NEW PREFIX: accounting:account:
    const debitAccount = await kv.get(`accounting:account:${debit_account_id}`);
    const creditAccount = await kv.get(`accounting:account:${credit_account_id}`);

    if (!debitAccount || !creditAccount) {
      return errorResponse(c, "One or more selected accounts not found", 400);
    }

    // Create Journal Entry
    const jeId = generateId("JE");
    const now = new Date().toISOString();
    const amount = Number(evoucher.amount);

    const journalEntry = {
      id: jeId,
      transaction_date: posting_date || evoucher.request_date || now,
      posted_at: now,
      description: `E-Voucher Post: ${evoucher.description || evoucher.purpose}`,
      reference_number: evoucher.voucher_number,
      transaction_type: "Expense",
      entity_id: evoucher.vendor_id || null, // Link to Vendor if available
      project_id: null, // Need to resolve project_number to UUID if possible, or just store number
      project_number: evoucher.project_number,
      
      lines: [
        {
          id: generateId("JL"),
          account_id: debit_account_id,
          account_name: debitAccount.name,
          description: evoucher.description,
          debit: amount,
          credit: 0
        },
        {
          id: generateId("JL"),
          account_id: credit_account_id,
          account_name: creditAccount.name,
          description: "Payment Source",
          debit: 0,
          credit: amount
        }
      ],
      total_amount: amount,
      status: "Posted",
      created_by: user_id,
      created_at: now,
      updated_at: now
    };

    // Save Journal Entry
    await kv.set(`journal_entry:${jeId}`, journalEntry);

    // Update Balances
    // Debit
    debitAccount.balance = (debitAccount.balance || 0) + amount; // Expense increases with Debit
    // USE NEW PREFIX: accounting:account:
    await kv.set(`accounting:account:${debit_account_id}`, debitAccount);
    
    // Credit
    // Asset (Cash) decreases with Credit. Liability (AP) increases with Credit.
    // If Asset: Balance = Balance - Credit
    // If Liability: Balance = Balance + Credit
    let creditImpact = 0;
    if (["Asset", "Expense"].includes(creditAccount.type)) {
       creditImpact = -amount;
    } else {
       creditImpact = amount;
    }
    creditAccount.balance = (creditAccount.balance || 0) + creditImpact;
    // USE NEW PREFIX: accounting:account:
    await kv.set(`accounting:account:${credit_account_id}`, creditAccount);

    // Update Draft Transaction (Gatekeeper Sync)
    if (evoucher.draft_transaction_id) {
       const draftTxn = await kv.get(`accounting:txn:${evoucher.draft_transaction_id}`);
       if (draftTxn) {
          draftTxn.status = "posted";
          draftTxn.journal_entry_id = jeId;
          // Sync accounts used in posting
          draftTxn.category_id = debit_account_id;
          draftTxn.bank_account_id = credit_account_id;
          draftTxn.updated_at = now;
          await kv.set(`accounting:txn:${evoucher.draft_transaction_id}`, draftTxn);
          console.log(`✅ Draft Transaction ${evoucher.draft_transaction_id} marked as POSTED`);
       }
    }

    // Update E-Voucher Status
    const updatedEVoucher = {
      ...evoucher,
      status: "Posted",
      posted_to_ledger: true,
      ledger_entry_id: jeId,
      ledger_entry_type: "journal_entry",
      posted_at: now,
      posted_by: user_id,
      posted_by_name: user_name,
      updated_at: now,
    };
    
    await kv.set(`evoucher:${evoucherId}`, updatedEVoucher);
    
    console.log(`✅ Posted E-Voucher ${evoucher.voucher_number} to Ledger (JE: ${jeId})`);

    // AUTO-CREATE BILLING ATOM IF EXPENSE IS BILLABLE
    const isBillable = evoucher.is_billable || evoucher.isBillable;
    if (isBillable && evoucher.project_number) {
        const billingId = generateId("BIL");
        const billingItem = {
            id: billingId,
            project_number: evoucher.project_number,
            booking_id: evoucher.booking_id || evoucher.bookingId || evoucher.project_number, // Phase 5A: ensure booking_id is set for booking-owned billings aggregation
            description: `Reimbursement: ${evoucher.description || evoucher.purpose}`,
            amount: amount,
            currency: evoucher.currency || "PHP",
            status: "unbilled",
            source_type: "billable_expense",
            quotation_category: "Reimbursable Expenses", // Auto-categorize for UI grouping
            source_id: evoucher.id,
            created_at: now,
            updated_at: now
        };
        await kv.set(`billing_item:${billingId}`, billingItem);
        console.log(`✅ Auto-created Billing Atom ${billingId} for Billable Expense (booking_id: ${billingItem.booking_id}, Category: Reimbursable Expenses)`);
    }
    
    return successResponse(c, {
      evoucher: updatedEVoucher,
      journal_entry: journalEntry,
    });
  } catch (error) {
    return errorResponse(c, `Failed to post to ledger: ${error}`);
  }
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
    
    // Fetch both posted expenses and approved E-Vouchers (which are not yet posted)
    // This ensures "Approved" billable items appear in the system before they are fully posted
    const [postedExpenses, allEvouchers] = await Promise.all([
      kv.getByPrefix("expense:"),
      kv.getByPrefix("evoucher:")
    ]);
    
    // Create a set of already posted evoucher IDs to prevent duplicates
    const postedEvoucherIds = new Set(postedExpenses.map((e: any) => e.evoucher_id));
    
    // Map Approved (but not posted) E-Vouchers to Expenses
    // We filter out any that might conflict
    const unpostedExpenses = allEvouchers
      .filter((ev: any) => 
        (ev.status === "Approved" || ev.status === "approved") && 
        !ev.posted_to_ledger &&
        !postedEvoucherIds.has(ev.id)
      )
      .map(mapEVoucherToExpense);
      
    let expenses = [...postedExpenses, ...unpostedExpenses];
    
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

    // SELF-HEALING: Check for missing 'is_billable' flag
    const expensesToHeal = expenses.filter((e: any) => e.is_billable === undefined && e.evoucher_id);
    
    if (expensesToHeal.length > 0) {
      console.log(`🩹 Self-healing ${expensesToHeal.length} expenses missing is_billable flag...`);
      const evoucherKeys = expensesToHeal.map((e: any) => `evoucher:${e.evoucher_id}`);
      
      try {
        const evouchers = await kv.mget(evoucherKeys);
        
        // Map for O(1) lookup
        const evoucherMap = new Map();
        if (Array.isArray(evouchers)) {
          evouchers.forEach((ev: any) => {
             if (ev && ev.id) evoucherMap.set(ev.id, ev);
          });
        }
        
        const savePromises = [];
        
        for (const expense of expensesToHeal) {
           const ev = evoucherMap.get(expense.evoucher_id);
           if (ev) {
              // Handle both snake_case (backend) and camelCase (frontend legacy) keys
              const isBillable = ev.is_billable === true || ev.isBillable === true;
              expense.is_billable = isBillable;
              
              // Only persist if we found a value and it was missing before
              savePromises.push(kv.set(`expense:${expense.id}`, expense));
           }
        }
        
        if (savePromises.length > 0) {
           // We don't await this to keep response fast, but Deno Deploy usually allows async completion
           Promise.allSettled(savePromises).then(() => 
              console.log(`💾 Persisted is_billable flag for ${savePromises.length} expenses`)
           ).catch(err => console.error("Error persisting patches:", err));
        }
      } catch (err) {
        console.error("Error during self-healing:", err);
      }
    }
    
    console.log(`✅ Fetched ${expenses.length} expenses`);
    
    return successResponse(c, expenses);
  } catch (error) {
    return errorResponse(c, `Failed to fetch expenses: ${error}`);
  }
}

/**
 * Helper to map E-Voucher to Expense object
 */
function mapEVoucherToExpense(evoucher: any) {
  return {
    id: evoucher.id,
    evoucher_id: evoucher.id,
    evoucher_number: evoucher.voucher_number,
    date: evoucher.request_date || evoucher.created_at,
    vendor: evoucher.vendor_name || "—",
    category: evoucher.expense_category || "Uncategorized",
    sub_category: evoucher.sub_category || "",
    amount: evoucher.total_amount || evoucher.amount || 0,
    currency: evoucher.currency || "PHP",
    description: evoucher.purpose || evoucher.description || "Untitled Expense",
    project_number: evoucher.project_number,
    status: evoucher.status === "Approved" ? "approved" : 
            evoucher.status === "Posted" ? "posted" : 
            evoucher.status === "Rejected" ? "rejected" : "pending",
    requestor_id: evoucher.requestor_id,
    requestor_name: evoucher.requestor_name,
    created_at: evoucher.created_at,
    updated_at: evoucher.updated_at,
    is_virtual: true,
    is_billable: evoucher.is_billable || evoucher.isBillable
  };
}

/**
 * GET /expenses/:id - Get single expense
 */
export async function getExpenseById(c: Context) {
  try {
    const id = c.req.param("id");
    
    // 1. Try finding exact expense record (legacy)
    let expense = await kv.get(`expense:${id}`);
    
    // 2. If not found, try finding as E-Voucher ID
    if (!expense) {
      const evoucher = await kv.get(`evoucher:${id}`);
      
      if (evoucher) {
        // Check if it's an expense-like transaction
        const type = (evoucher.transaction_type || "").toLowerCase();
        if (type === "expense" || type === "budget_request") {
          expense = mapEVoucherToExpense(evoucher);
        }
      }
    }
    
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
    
    // 1. Try finding exact expense record
    const expense = await kv.get(`expense:${id}`);
    
    if (expense) {
      await kv.del(`expense:${id}`);
      console.log(`✅ Deleted expense ${id}`);
      return successResponse(c, { id, deleted: true });
    }
    
    // 2. If not found, try finding as E-Voucher
    const evoucher = await kv.get(`evoucher:${id}`);
    if (evoucher) {
       // Only allow deletion if not posted? Or just delete?
       // For now, allow deletion to maintain behavior
       await kv.del(`evoucher:${id}`);
       console.log(`✅ Deleted E-Voucher ${id} via expense endpoint`);
       return successResponse(c, { id, deleted: true });
    }
    
    return errorResponse(c, "Expense not found", 404);
  } catch (error) {
    return errorResponse(c, `Failed to delete expense: ${error}`);
  }
}

/**
 * Create a Draft Transaction from an Approved E-Voucher
 * This acts as the "Gatekeeper" step - creating a transaction for review
 */
export async function createDraftTransaction(evoucher: any) {
  try {
    const txnId = generateId("TXN");
    const now = new Date().toISOString();
    
    // Determine amount (negative for expenses)
    // If it's a collection, it's positive. If expense, negative.
    let amount = Number(evoucher.amount) || 0;
    if (evoucher.transaction_type !== "collection" && evoucher.transaction_type !== "billing") {
        amount = -Math.abs(amount); // Ensure it's negative for expenses
    } else {
        amount = Math.abs(amount); // Ensure positive for collections
    }

    const transaction = {
      id: txnId,
      date: evoucher.request_date || now,
      description: `${evoucher.purpose || evoucher.description} (Ref: ${evoucher.voucher_number})`,
      amount: amount,
      status: "draft", // IMPORTANT: Starts as draft for review
      source_document_id: evoucher.id,
      source_document_type: evoucher.transaction_type || "expense",
      bank_account_id: evoucher.source_account_id || null, // Link to selected bank if available
      category_id: null, // To be assigned by Accountant
      contact_id: evoucher.vendor_name, // Store name as contact for now
      created_at: now,
      updated_at: now
    };

    // Save to KV
    await kv.set(`accounting:txn:${txnId}`, transaction);
    console.log(`✅ Created Draft Transaction ${txnId} from E-Voucher ${evoucher.voucher_number}`);
    
    return transaction;
  } catch (error) {
    console.error("Error creating draft transaction:", error);
    // Don't throw, just log. We don't want to fail the approval if this fails
    return null;
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
 * Supports Collection IDs, E-Voucher IDs, and recovery from broken links
 */
export async function getCollectionById(c: Context) {
  try {
    const id = c.req.param("id");
    
    // 1. Try finding exact collection record
    let collection = await kv.get(`collection:${id}`);
    
    // 2. If not found, try finding as E-Voucher ID
    if (!collection) {
      const evoucher = await kv.get(`evoucher:${id}`);
      
      if (evoucher && evoucher.transaction_type === "collection") {
        collection = mapEVoucherToCollection(evoucher);
      }
    }

    // 3. If still not found, it might be a Collection ID but the record is missing
    // Try to find the E-Voucher that points to this Collection ID
    if (!collection) {
      const allEVouchers = await kv.getByPrefix("evoucher:");
      const parentEVoucher = allEVouchers.find((ev: any) => ev.ledger_entry_id === id && ev.transaction_type === "collection");
      
      if (parentEVoucher) {
        console.log(`⚠️ Recovered missing collection ${id} from parent E-Voucher ${parentEVoucher.id}`);
        collection = mapEVoucherToCollection(parentEVoucher);
        collection.id = id;
        collection.reference_number = parentEVoucher.reference_number || collection.reference_number;
      }
    }
    
    if (!collection) {
      return errorResponse(c, "Collection not found", 404);
    }
    
    return successResponse(c, collection);
  } catch (error) {
    return errorResponse(c, `Failed to fetch collection: ${error}`);
  }
}

/**
 * Helper to map E-Voucher to Collection object
 */
function mapEVoucherToCollection(evoucher: any) {
  return {
    id: evoucher.id,
    reference_number: evoucher.voucher_number,
    evoucher_number: evoucher.voucher_number,
    customer_name: evoucher.customer_name || evoucher.vendor_name || "Unknown Customer",
    description: evoucher.purpose || evoucher.description,
    project_number: evoucher.project_number,
    amount: evoucher.amount,
    collection_date: evoucher.request_date,
    payment_method: evoucher.payment_method || "Cash",
    received_by_name: evoucher.requestor_name,
    evoucher_id: evoucher.id,
    created_at: evoucher.created_at,
    status: evoucher.status,
    is_virtual: true
  };
}

/**
 * Core Logic for Posting Collection
 * Shared by API handler and Auto-Post triggers
 */
export async function processCollectionPosting(evoucherId: string, user_id: string, user_name: string) {
    // Validate E-Voucher (Check status if already posted)
    const evoucher = await kv.get(`evoucher:${evoucherId}`);
    
    if (!evoucher) {
      throw new Error("E-Voucher not found");
    }
    
    // For collections, we allow posting from "Pending" status too if we are doing immediate posting
    if (evoucher.posted_to_ledger) {
      throw new Error("Collection has already been posted");
    }
    
    // Verify transaction type
    if (evoucher.transaction_type !== "collection") {
      throw new Error("E-Voucher transaction type must be 'collection'");
    }
    
    // 1. Create Collection Record
    const collectionId = generateId("COL");
    const collectionDate = evoucher.request_date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    const collection = {
      id: collectionId,
      evoucher_id: evoucherId,
      evoucher_number: evoucher.voucher_number,
      collection_date: collectionDate,
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
      posted_at: now,
      status: "posted",
      linked_billings: evoucher.linked_billings || [],
      created_at: now,
      updated_at: now,
    };
    
    await kv.set(`collection:${collectionId}`, collection);
    
    // 2. Identify GL Accounts
    // Debit: Cash in Bank (1000) - For now, we default to a standard Cash account
    // Credit: Accounts Receivable (1200)
    // USE NEW PREFIX: accounting:account:
    const allAccounts = await kv.getByPrefix("accounting:account:");
    const cashAccount = allAccounts.find((a: any) => a.code === "1000") || allAccounts.find((a: any) => a.type === "Asset");
    const arAccount = allAccounts.find((a: any) => a.code === "1200") || allAccounts.find((a: any) => a.subtype === "Accounts Receivable");

    let jeId = null;

    if (!cashAccount || !arAccount) {
      console.warn("⚠️ Critical GL Accounts missing. Skipping Journal Entry creation, but saving Collection.");
    } else {
        // Create Journal Entry
        jeId = generateId("JE");
        
        const journalEntry = {
          id: jeId,
          transaction_date: collectionDate,
          posted_at: now,
          description: `Collection: ${collection.description} (${collection.customer_name})`,
          reference_number: collection.reference_number,
          transaction_type: "Collection",
          entity_id: collection.customer_id,
          project_number: collection.project_number,
          
          lines: [
            {
              id: generateId("JL"),
              account_id: cashAccount.id,
              account_name: cashAccount.name,
              description: `Cash received from ${collection.customer_name}`,
              debit: collection.amount,
              credit: 0
            },
            {
              id: generateId("JL"),
              account_id: arAccount.id,
              account_name: arAccount.name,
              description: "AR Cleared",
              debit: 0,
              credit: collection.amount
            }
          ],
          total_amount: collection.amount,
          status: "Posted",
          created_by: user_id,
          created_at: now,
          updated_at: now
        };
        
        await kv.set(`journal_entry:${jeId}`, journalEntry);
        
        // Update Balances (Simple)
        cashAccount.balance = (cashAccount.balance || 0) + collection.amount;
        // USE NEW PREFIX: accounting:account:
        await kv.set(`accounting:account:${cashAccount.id}`, cashAccount);
        
        arAccount.balance = (arAccount.balance || 0) - collection.amount;
        // USE NEW PREFIX: accounting:account:
        await kv.set(`accounting:account:${arAccount.id}`, arAccount);
        
        console.log(`✅ Created Journal Entry ${jeId} for Collection`);
    }
    
    // 3. Update E-Voucher
    const updatedEVoucher = {
      ...evoucher,
      status: "Posted",
      posted_to_ledger: true,
      ledger_entry_id: collectionId, // Link to Collection ID
      ledger_entry_type: "collection",
      journal_entry_id: jeId, // Optional link to JE
      posted_at: now,
      posted_by: user_id,
      posted_by_name: user_name,
      updated_at: now,
    };
    
    await kv.set(`evoucher:${evoucherId}`, updatedEVoucher);
    
    console.log(`✅ Posted Collection E-Voucher ${evoucher.voucher_number} (COL: ${collectionId})`);
    
    return {
      collection,
      evoucher: updatedEVoucher,
      journal_entry_id: jeId
    };
}

// ==================== INVOICES (Billings as Documents) ====================

/**
 * GET /accounting/invoices - Get all invoices (billing documents)
 * Supports ?projectNumber= filter
 */
export async function getInvoices(c: Context) {
  try {
    const projectNumber = c.req.query("projectNumber");
    let billings = await kv.getByPrefix("billing:");
    
    // Only return actual invoices (records that have an invoice_number),
    // not billing line items which share the same KV prefix
    billings = billings.filter((b: any) => !!b.invoice_number);
    
    if (projectNumber) {
      billings = billings.filter((b: any) => 
        b.project_number === projectNumber || b.projectNumber === projectNumber
      );
    }
    
    // Sort by date descending
    billings.sort((a: any, b: any) => {
      const dateA = a.created_at || a.createdAt || "";
      const dateB = b.created_at || b.createdAt || "";
      return dateB.localeCompare(dateA);
    });
    
    console.log(`Fetched ${billings.length} invoices${projectNumber ? ` for project ${projectNumber}` : ""}`);
    return c.json({ success: true, data: billings });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return errorResponse(c, String(error));
  }
}

/**
 * GET /accounting/invoices/:id - Get a single invoice by ID
 */
export async function getInvoiceById(c: Context) {
  try {
    const id = c.req.param("id");
    const billing = await kv.get(`billing:${id}`);
    
    if (!billing) {
      return c.json({ success: false, error: "Invoice not found" }, 404);
    }
    
    return c.json({ success: true, data: billing });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return errorResponse(c, String(error));
  }
}

/**
 * POST /accounting/invoices - Create a new invoice from billing items
 * Phase 1 (Invoice Ledger Integration): Also creates a Journal Entry (DR AR / CR Revenue)
 * and a Draft Transaction for the Transactions module.
 */
export async function createInvoice(c: Context) {
  try {
    const body = await c.req.json();
    const invoiceNumber = await generateInvoiceNumber();
    const now = new Date().toISOString();
    const id = generateId("INV");
    
    const invoice: any = {
      ...body,
      id,
      invoice_number: invoiceNumber,
      status: body.status || "posted",
      created_at: now,
      updated_at: now,
    };
    
    // --- Mark referenced billing items as "billed" ---
    const billingItemIds: string[] = body.billing_item_ids || [];
    if (billingItemIds.length > 0) {
      for (const itemId of billingItemIds) {
        try {
          const existing = await kv.get(`billing:${itemId}`);
          if (existing && !existing.invoice_number) {
            // Only update actual billing items (not invoices)
            await kv.set(`billing:${itemId}`, {
              ...existing,
              status: "billed",
              invoice_id: id,
              invoice_number: invoiceNumber,
              billed_at: now,
              updated_at: now,
            });
          }
        } catch (itemErr) {
          console.error(`Failed to mark billing item ${itemId} as billed:`, itemErr);
        }
      }
      console.log(`Marked ${billingItemIds.length} billing item(s) as billed for invoice ${invoiceNumber}`);
    }

    // --- Journal Entry: DR Accounts Receivable / CR Revenue ---
    const revenueAccountId = body.revenue_account_id;
    const totalAmount = Number(body.total_amount) || 0;
    let jeId: string | null = null;
    let txnId: string | null = null;

    if (revenueAccountId && totalAmount > 0) {
      // Auto-lookup AR account (code 1200 or subtype "Accounts Receivable")
      const allAccounts = await kv.getByPrefix("accounting:account:");
      const arAccount = allAccounts.find((a: any) => a.code === "1200")
        || allAccounts.find((a: any) => a.subtype === "Accounts Receivable");
      const revenueAccount = await kv.get(`accounting:account:${revenueAccountId}`);

      if (!arAccount || !revenueAccount) {
        console.warn(`⚠️ GL accounts missing for invoice JE (AR: ${!!arAccount}, Revenue: ${!!revenueAccount}). Skipping JE, but invoice saved.`);
      } else {
        // 1. Create Journal Entry
        jeId = generateId("JE");

        const journalEntry = {
          id: jeId,
          transaction_date: body.invoice_date || now,
          posted_at: now,
          description: `Invoice ${invoiceNumber}: ${body.customer_name || "Customer"}`,
          reference_number: invoiceNumber,
          transaction_type: "Invoice",
          entity_id: body.customer_id || null,
          project_number: body.project_number || null,
          lines: [
            {
              id: generateId("JL"),
              account_id: arAccount.id,
              account_name: arAccount.name,
              description: `AR for Invoice ${invoiceNumber}`,
              debit: totalAmount,
              credit: 0
            },
            {
              id: generateId("JL"),
              account_id: revenueAccountId,
              account_name: revenueAccount.name,
              description: `Revenue recognized - Invoice ${invoiceNumber}`,
              debit: 0,
              credit: totalAmount
            }
          ],
          total_amount: totalAmount,
          status: "Posted",
          created_by: body.user_id || null,
          created_at: now,
          updated_at: now
        };

        await kv.set(`journal_entry:${jeId}`, journalEntry);

        // 2. Update CoA Balances
        // AR is an Asset — increases with Debit
        arAccount.balance = (arAccount.balance || 0) + totalAmount;
        await kv.set(`accounting:account:${arAccount.id}`, arAccount);

        // Revenue is Income — increases with Credit
        revenueAccount.balance = (revenueAccount.balance || 0) + totalAmount;
        await kv.set(`accounting:account:${revenueAccountId}`, revenueAccount);

        console.log(`✅ Created Journal Entry ${jeId} for Invoice ${invoiceNumber} (DR AR ${totalAmount} / CR Revenue ${totalAmount})`);

        // 3. Create Draft Transaction for Transactions module
        txnId = generateId("TXN");
        const transaction = {
          id: txnId,
          date: body.invoice_date || now,
          description: `Invoice ${invoiceNumber}: ${body.customer_name || "Customer"}`,
          amount: totalAmount, // Positive — receivable
          currency: body.currency || "PHP",
          status: "posted",
          source_document_id: id,
          source_document_type: "invoice",
          bank_account_id: arAccount.id, // AR account
          category_id: revenueAccountId, // Revenue account
          category_account_id: revenueAccountId,
          contact_id: body.customer_name || null,
          journal_entry_id: jeId,
          created_at: now,
          updated_at: now
        };

        await kv.set(`accounting:txn:${txnId}`, transaction);
        console.log(`✅ Created Transaction ${txnId} for Invoice ${invoiceNumber}`);
      }
    } else {
      if (!revenueAccountId) {
        console.warn(`⚠️ No revenue_account_id provided for invoice ${invoiceNumber}. Skipping JE creation.`);
      }
      if (totalAmount <= 0) {
        console.warn(`⚠️ Invoice ${invoiceNumber} has zero/negative total_amount (${totalAmount}). Skipping JE creation.`);
      }
    }

    // Store ledger references on the invoice for traceability
    if (jeId) invoice.journal_entry_id = jeId;
    if (txnId) invoice.draft_transaction_id = txnId;

    // Persist final invoice (with ledger references)
    await kv.set(`billing:${id}`, invoice);
    
    console.log(`Created invoice ${invoiceNumber} (${id})${jeId ? ` [JE: ${jeId}]` : ' [No JE]'}`);
    return c.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return errorResponse(c, String(error));
  }
}

// ==================== BILLING ITEMS (The Atoms) ====================

/**
 * GET /accounting/billing-items - Get all billing line items
 */
export async function getBillings(c: Context) {
  try {
    let billings = await kv.getByPrefix("billing:");
    
    // Exclude invoices (which share the billing: KV prefix) —
    // only return actual billing line items (those without invoice_number)
    billings = billings.filter((b: any) => !b.invoice_number);
    
    // Sort by date descending
    billings.sort((a: any, b: any) => {
      const dateA = a.created_at || a.createdAt || "";
      const dateB = b.created_at || b.createdAt || "";
      return dateB.localeCompare(dateA);
    });
    
    console.log(`Fetched ${billings.length} billing items`);
    return c.json({ success: true, data: billings });
  } catch (error) {
    console.error("Error fetching billing items:", error);
    return errorResponse(c, String(error));
  }
}

/**
 * POST /accounting/billing-items - Create a single billing item
 */
export async function createBillingItem(c: Context) {
  try {
    const body = await c.req.json();
    const now = new Date().toISOString();
    const id = body.id || generateId("BIL");
    
    const billingItem = {
      ...body,
      id,
      billingId: id,
      created_at: now,
      updated_at: now,
    };
    
    await kv.set(`billing:${id}`, billingItem);
    
    console.log(`Created billing item ${id}`);
    return c.json({ success: true, data: billingItem });
  } catch (error) {
    console.error("Error creating billing item:", error);
    return errorResponse(c, String(error));
  }
}

/**
 * POST /accounting/billings/batch - Batch upsert billing items
 */
export async function batchUpsertBillings(c: Context) {
  try {
    const { items } = await c.req.json();
    
    if (!items || !Array.isArray(items)) {
      return c.json({ success: false, error: "items array is required" }, 400);
    }
    
    const now = new Date().toISOString();
    const results: any[] = [];
    
    for (const item of items) {
      const id = item.id || generateId("BIL");
      const billingItem = {
        ...item,
        id,
        billingId: id,
        updated_at: now,
        created_at: item.created_at || now,
      };
      
      await kv.set(`billing:${id}`, billingItem);
      results.push(billingItem);
    }
    
    console.log(`Batch upserted ${results.length} billing items`);
    return c.json({ success: true, data: results, count: results.length });
  } catch (error) {
    console.error("Error batch upserting billings:", error);
    return errorResponse(c, String(error));
  }
}

/**
 * POST /accounting/import-quotation-charges - Import charges from a quotation as billing items
 */
export async function importQuotationCharges(c: Context) {
  try {
    const { quotation_id, project_number, booking_id, charges } = await c.req.json();
    
    if (!charges || !Array.isArray(charges)) {
      return c.json({ success: false, error: "charges array is required" }, 400);
    }
    
    const now = new Date().toISOString();
    const results: any[] = [];
    
    for (const charge of charges) {
      const id = generateId("BIL");
      const billingItem = {
        id,
        billingId: id,
        quotation_id,
        project_number,
        booking_id,
        description: charge.description || charge.name,
        amount: charge.amount || charge.selling_price || 0,
        currency: charge.currency || "PHP",
        category: charge.category,
        status: "draft",
        source: "quotation_import",
        created_at: now,
        updated_at: now,
      };
      
      await kv.set(`billing:${id}`, billingItem);
      results.push(billingItem);
    }
    
    console.log(`Imported ${results.length} quotation charges as billing items`);
    return c.json({ success: true, data: results, count: results.length });
  } catch (error) {
    console.error("Error importing quotation charges:", error);
    return errorResponse(c, String(error));
  }
}

// ==================== COLLECTION OPERATIONS ====================

/**
 * DELETE /accounting/collections/:id - Delete a collection record
 */
export async function deleteCollection(c: Context) {
  try {
    const id = c.req.param("id");
    
    const collection = await kv.get(`collection:${id}`);
    if (!collection) {
      return c.json({ success: false, error: "Collection not found" }, 404);
    }
    
    await kv.del(`collection:${id}`);
    
    console.log(`Deleted collection ${id}`);
    return c.json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return errorResponse(c, String(error));
  }
}

/**
 * POST /evouchers/:id/post-to-collections - Post an E-Voucher to collections
 */
export async function postEVoucherToCollections(c: Context) {
  try {
    const evoucherId = c.req.param("id");
    const body = await c.req.json();
    const { user_id, user_name } = body;
    
    if (!user_id || !user_name) {
      return c.json({ success: false, error: "user_id and user_name are required" }, 400);
    }
    
    const result = await processCollectionPosting(evoucherId, user_id, user_name);
    
    return c.json({ 
      success: true, 
      data: result,
      message: `Collection posted successfully` 
    });
  } catch (error) {
    console.error("Error posting E-Voucher to collections:", error);
    return errorResponse(c, String(error));
  }
}