import { useState } from "react";
import { Send, Save, Zap, Loader2 } from "lucide-react";
import { AddRequestForPaymentPanel } from "../AddRequestForPaymentPanel";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface CreateEVoucherFormProps {
  isOpen: boolean;
  onClose: () => void;
  context?: "bd" | "accounting" | "operations";
  defaultRequestor?: string;
  bookingId?: string;
  bookingType?: "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";
  onSuccess?: () => void;
}

export function CreateEVoucherForm({
  isOpen,
  onClose,
  context = "accounting",
  defaultRequestor,
  bookingId,
  bookingType,
  onSuccess
}: CreateEVoucherFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"draft" | "submit" | "auto-approve">("submit");

  const isAccounting = context === "accounting";

  const handleSave = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Get current user from localStorage
      const userData = localStorage.getItem("neuron_user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        alert("User not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // Determine which endpoint to use based on submit mode
      if (submitMode === "auto-approve" && isAccounting) {
        // Auto-Approve: Create and approve in one step
        await handleAutoApprove(data, user);
      } else if (submitMode === "draft") {
        // Save as draft
        await handleSaveDraft(data, user);
      } else {
        // Submit for approval
        await handleSubmitForApproval(data, user);
      }
    } catch (error) {
      console.error("Error saving E-Voucher:", error);
      alert("Failed to save E-Voucher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (data: any, user: any) => {
    // Determine transaction type based on context
    const transactionType = context === "bd" ? "budget_request" : 
                           context === "operations" ? "expense" : 
                           "expense"; // default
    
    // Determine source module based on user department
    const sourceModule = context === "bd" ? "bd" :
                        context === "operations" ? "operations" :
                        user.department?.toLowerCase() || "accounting";
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/evouchers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          // Universal transaction fields
          transaction_type: transactionType,
          source_module: sourceModule,
          // Existing fields
          requestor_id: user.id,
          requestor_name: user.name,
          requestor_department: user.department,
          request_date: data.date || new Date().toISOString().split("T")[0],
          amount: data.totalAmount,
          currency: "PHP",
          purpose: data.requestName,
          description: data.notes || "",
          expense_category: data.expenseCategory,
          gl_sub_category: data.subCategory,
          vendor_name: data.vendor,
          project_number: data.projectNumber || bookingId,
          payment_method: data.preferredPayment,
          credit_terms: data.creditTerms,
          due_date: data.paymentSchedule
        })
      }
    );

    const result = await response.json();

    if (result.success) {
      alert(`✅ E-Voucher ${result.data.voucher_number} saved as draft!`);
      onSuccess?.();
      onClose();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSubmitForApproval = async (data: any, user: any) => {
    // Determine transaction type based on context
    const transactionType = context === "bd" ? "budget_request" : 
                           context === "operations" ? "expense" : 
                           "expense"; // default
    
    // Determine source module based on user department
    const sourceModule = context === "bd" ? "bd" :
                        context === "operations" ? "operations" :
                        user.department?.toLowerCase() || "accounting";
    
    // First create the draft
    const createResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/evouchers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          // Universal transaction fields
          transaction_type: transactionType,
          source_module: sourceModule,
          // Existing fields
          requestor_id: user.id,
          requestor_name: user.name,
          requestor_department: user.department,
          request_date: data.date || new Date().toISOString().split("T")[0],
          amount: data.totalAmount,
          currency: "PHP",
          purpose: data.requestName,
          description: data.notes || "",
          expense_category: data.expenseCategory,
          gl_sub_category: data.subCategory,
          vendor_name: data.vendor,
          project_number: data.projectNumber || bookingId,
          payment_method: data.preferredPayment,
          credit_terms: data.creditTerms,
          due_date: data.paymentSchedule
        })
      }
    );

    const createResult = await createResponse.json();

    if (!createResult.success) {
      alert(`Error: ${createResult.error}`);
      return;
    }

    // Then submit it for approval
    const submitResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/evouchers/${createResult.data.id}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.name,
          user_role: user.department
        })
      }
    );

    const submitResult = await submitResponse.json();

    if (submitResult.success) {
      alert(`✅ E-Voucher ${createResult.data.voucher_number} submitted for approval!`);
      onSuccess?.();
      onClose();
    } else {
      alert(`Error: ${submitResult.error}`);
    }
  };

  const handleAutoApprove = async (data: any, user: any) => {
    // Determine transaction type based on context
    const transactionType = context === "bd" ? "budget_request" : 
                           context === "operations" ? "expense" : 
                           "expense"; // default
    
    // Determine source module based on user department
    const sourceModule = context === "bd" ? "bd" :
                        context === "operations" ? "operations" :
                        user.department?.toLowerCase() || "accounting";
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/evouchers/auto-approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          // Universal transaction fields
          transaction_type: transactionType,
          source_module: sourceModule,
          // User info for approval
          user_id: user.id,
          user_name: user.name,
          user_role: user.department,
          // E-Voucher data
          requestor_id: user.id,
          requestor_name: user.name,
          requestor_department: user.department,
          request_date: data.date || new Date().toISOString().split("T")[0],
          amount: data.totalAmount,
          currency: "PHP",
          purpose: data.requestName,
          description: data.notes || "",
          expense_category: data.expenseCategory,
          gl_sub_category: data.subCategory,
          vendor_name: data.vendor,
          project_number: data.projectNumber || bookingId,
          payment_method: data.preferredPayment,
          credit_terms: data.creditTerms,
          due_date: data.paymentSchedule
        })
      }
    );

    const result = await response.json();

    if (result.success) {
      alert(
        `✅ E-Voucher ${result.data.voucher_number} auto-approved and posted to Expenses Ledger!\\n\\nExpense ID: ${result.expense_id}`
      );
      onSuccess?.();
      onClose();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  // Create custom footer for the panel with our workflow buttons
  const renderCustomFooter = () => {
    if (isSubmitting) {
      return (
        <div
          style={{
            padding: "20px 48px",
            borderTop: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#6B7280" }}>
            <Loader2 size={20} className="animate-spin" />
            <span>{submitMode === "draft" ? "Saving..." : submitMode === "auto-approve" ? "Processing..." : "Submitting..."}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          padding: "20px 48px",
          borderTop: "1px solid var(--neuron-ui-border)",
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#6B7280",
              backgroundColor: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Print
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Save as Draft */}
          <button
            type="button"
            onClick={() => {
              setSubmitMode("draft");
              // Trigger form submission
              document.getElementById("rfp-form")?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <Save size={16} />
            Save as Draft
          </button>

          {/* Auto-Approve (Accounting only) */}
          {isAccounting && (
            <button
              type="button"
              onClick={() => {
                setSubmitMode("auto-approve");
                document.getElementById("rfp-form")?.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#0F766E",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0D6559";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0F766E";
              }}
            >
              <Zap size={16} />
              Auto-Approve
            </button>
          )}

          {/* Submit for Approval */}
          <button
            type="submit"
            form="rfp-form"
            onClick={() => setSubmitMode("submit")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              backgroundColor: isAccounting ? "#115E59" : "#0F766E",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isAccounting ? "#0F4C4A" : "#0D6559";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isAccounting ? "#115E59" : "#0F766E";
            }}
          >
            <Send size={16} />
            {isAccounting ? "Save & Submit" : "Submit for Approval"}
          </button>
        </div>
      </div>
    );
  };

  // Note: Since AddRequestForPaymentPanel doesn't accept custom footer,
  // we'll use the existing callbacks but override with our API logic
  return (
    <AddRequestForPaymentPanel
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      onSaveDraft={(data) => {
        setSubmitMode("draft");
        handleSave(data);
      }}
      context={context}
      defaultRequestor={defaultRequestor}
      bookingId={bookingId}
      bookingType={bookingType}
      mode="create"
    />
  );
}