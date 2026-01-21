import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from '../components/ui/toast-utils';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

type EVoucherContext = "bd" | "accounting" | "operations" | "collection" | "billing";

interface LineItem {
  id: string;
  particular: string;
  description: string;
  amount: number;
}

interface EVoucherData {
  requestName: string;
  expenseCategory: string;
  subCategory: string;
  projectNumber?: string;
  lineItems: LineItem[];
  totalAmount: number;
  preferredPayment: string;
  vendor: string;
  creditTerms: string;
  paymentSchedule?: string;
  notes?: string;
  requestor: string;
  bookingId?: string;
}

export function useEVoucherSubmit(context: EVoucherContext = "bd") {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map context to transaction_type
  const getTransactionType = () => {
    switch (context) {
      case "bd":
        return "budget_request";
      case "accounting":
        return "expense";
      case "operations":
        return "expense";
      case "collection":
        return "collection";
      case "billing":
        return "billing";
      default:
        return "expense";
    }
  };

  // Map context to source_module
  const getSourceModule = () => {
    return context; // Already matches the backend enum
  };

  /**
   * Creates an E-Voucher in DRAFT status
   * Saves to database but doesn't submit for approval
   */
  const createDraft = async (data: EVoucherData) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        transaction_type: getTransactionType(),
        source_module: getSourceModule(),
        purpose: data.requestName,
        description: data.requestName,
        expense_category: data.expenseCategory,
        sub_category: data.subCategory,
        project_number: data.projectNumber || null,
        booking_id: data.bookingId || null,
        line_items: data.lineItems,
        total_amount: data.totalAmount,
        payment_method: data.preferredPayment,
        vendor_name: data.vendor,
        credit_terms: data.creditTerms,
        due_date: data.paymentSchedule || null,
        notes: data.notes || null,
        requestor_name: data.requestor,
        status: "draft",
      };

      console.log('Creating E-Voucher draft:', payload);

      const response = await fetch(`${API_URL}/evouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create E-Voucher');
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ E-Voucher draft created:', result.data);
        toast.success(`Draft saved successfully! Ref: ${result.data.voucher_number}`);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create E-Voucher');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error creating E-Voucher draft:', err);
      setError(errorMessage);
      toast.error(`Failed to save draft: ${errorMessage}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Creates an E-Voucher and immediately submits for approval
   * Two-step process: Create → Submit
   */
  const submitForApproval = async (data: EVoucherData) => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!data.requestName || data.requestName.trim() === '') {
        throw new Error('Request name is required');
      }
      
      if (!data.expenseCategory) {
        throw new Error('Expense category is required');
      }
      
      if (!data.lineItems || data.lineItems.length === 0) {
        throw new Error('At least one line item is required');
      }
      
      if (!data.vendor || data.vendor.trim() === '') {
        throw new Error('Vendor is required');
      }
      
      // Step 1: Create the E-Voucher in draft status
      const payload = {
        transaction_type: getTransactionType(),
        source_module: getSourceModule(),
        purpose: data.requestName,
        description: data.requestName,
        expense_category: data.expenseCategory,
        sub_category: data.subCategory || '',
        project_number: data.projectNumber || null,
        booking_id: data.bookingId || null,
        line_items: data.lineItems,
        total_amount: data.totalAmount,
        amount: data.totalAmount, // Backend expects 'amount' field too
        payment_method: data.preferredPayment,
        vendor_name: data.vendor,
        credit_terms: data.creditTerms,
        due_date: data.paymentSchedule || null,
        notes: data.notes || '',
        requestor_name: data.requestor,
        requestor_id: data.requestor, // Use requestor as ID for now
        requestor_department: context, // Add department context
        status: "draft",
      };

      console.log('📤 Creating E-Voucher for submission:', JSON.stringify(payload, null, 2));

      const createResponse = await fetch(`${API_URL}/evouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Create E-Voucher response error:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error (${createResponse.status}): ${errorText || 'Unknown error'}`);
        }
        
        throw new Error(errorData.error || 'Failed to create E-Voucher');
      }

      const createResult = await createResponse.json();

      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create E-Voucher');
      }

      const evoucherId = createResult.data.id;
      const voucherNumber = createResult.data.voucher_number;

      console.log('✅ E-Voucher created:', voucherNumber);

      // Step 2: Submit for approval
      console.log('Submitting E-Voucher for approval...');

      const submitResponse = await fetch(`${API_URL}/evouchers/${evoucherId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          user_id: data.requestor,
          user_name: data.requestor,
          user_role: 'User',
        }),
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error('Submit E-Voucher response error:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error (${submitResponse.status}): ${errorText || 'Unknown error'}`);
        }
        
        throw new Error(errorData.error || 'Failed to submit E-Voucher');
      }

      const submitResult = await submitResponse.json();

      if (submitResult.success) {
        console.log('✅ E-Voucher submitted for approval:', submitResult.data);
        
        // Context-aware success message
        const successMessage = 
          context === "bd" ? `Budget Request ${voucherNumber} submitted successfully!` :
          context === "collection" ? `Collection ${voucherNumber} recorded successfully!` :
          context === "billing" ? `Invoice ${voucherNumber} created successfully!` :
          `Expense ${voucherNumber} submitted successfully!`;
        
        toast.success(successMessage);
        return submitResult.data;
      } else {
        throw new Error(submitResult.error || 'Failed to submit E-Voucher');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error submitting E-Voucher:', err);
      setError(errorMessage);
      toast.error(`Failed to submit: ${errorMessage}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    createDraft,
    submitForApproval,
    isSaving,
    error,
  };
}