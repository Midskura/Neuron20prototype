import type { Context } from "npm:hono";
import * as kv from "./kv_store_robust.tsx";

// Account Handlers

export const getAccounts = async (c: Context) => {
  try {
    const accounts = await kv.getByPrefix("accounting:account:");
    
    if (!accounts || !Array.isArray(accounts)) {
      return c.json({ success: true, data: [] });
    }

    // Sort by code safely
    accounts.sort((a: any, b: any) => {
      const codeA = a?.code || "";
      const codeB = b?.code || "";
      return codeA.localeCompare(codeB);
    });

    return c.json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
};

export const saveAccount = async (c: Context) => {
  try {
    const account = await c.req.json();
    if (!account.id) {
      return c.json({ success: false, error: "Account ID is required" }, 400);
    }
    await kv.set(`accounting:account:${account.id}`, account);
    return c.json({ success: true, data: account });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
};

export const deleteAccount = async (c: Context) => {
  try {
    const id = c.req.param("id");
    await kv.del(`accounting:account:${id}`);
    return c.json({ success: true, message: "Account deleted" });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
};

// Transaction Handlers

export const getTransactions = async (c: Context) => {
  try {
    const txns = await kv.getByPrefix("accounting:txn:");
    return c.json({ success: true, data: txns });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
};

export const saveTransaction = async (c: Context) => {
  try {
    const txn = await c.req.json();
    if (!txn.id) {
      return c.json({ success: false, error: "Transaction ID is required" }, 400);
    }
    await kv.set(`accounting:txn:${txn.id}`, txn);
    return c.json({ success: true, data: txn });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
};

// View Settings Handlers

export const getTransactionViewSettings = async (c: Context) => {
  try {
    // Assuming a global setting or per-user. For now, simple global key.
    const settings = await kv.get("settings:transaction-view");
    return c.json({ success: true, data: settings || { visibleAccountIds: [] } });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
};

export const saveTransactionViewSettings = async (c: Context) => {
  try {
    const settings = await c.req.json();
    await kv.set("settings:transaction-view", settings);
    return c.json({ success: true, data: settings });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
};
