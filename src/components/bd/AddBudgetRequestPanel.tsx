import { X, Upload, FileText, Building2, Calendar } from "lucide-react";
import { PhilippinePeso } from "../icons/PhilippinePeso";
import { SimpleDropdown } from "./SimpleDropdown";
import { useState } from "react";
import type { PaymentMethod } from "../../types/evoucher";

interface AddBudgetRequestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AddBudgetRequestPanel({ isOpen, onClose, onSave }: AddBudgetRequestPanelProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    purpose: "",
    description: "",
    vendor_name: "",
    vendor_contact: "",
    project_number: "",
    customer_name: "",
    credit_terms: "",
    due_date: "",
    payment_method: "" as PaymentMethod | "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    handleClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      amount: 0,
      purpose: "",
      description: "",
      vendor_name: "",
      vendor_contact: "",
      project_number: "",
      customer_name: "",
      credit_terms: "",
      due_date: "",
      payment_method: "" as PaymentMethod | "",
    });
  };

  if (!isOpen) return null;

  const isFormValid = 
    formData.amount > 0 &&
    formData.purpose.trim() !== "" &&
    formData.vendor_name.trim() !== "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black z-40"
        onClick={handleClose}
        style={{ 
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(18, 51, 43, 0.15)"
        }}
      />

      {/* Slide-out Panel */}
      <div
        className="fixed right-0 top-0 h-full w-[680px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in"
        style={{
          borderLeft: "1px solid var(--neuron-ui-border)",
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: "32px 48px",
            borderBottom: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#12332B", marginBottom: "8px" }}>
                New Budget Request
              </h2>
              <p style={{ fontSize: "14px", color: "#667085" }}>
                Fill in the request details for approval and payment
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "transparent",
                color: "#667085",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px" }}>
          <form onSubmit={handleSubmit} id="budget-request-form">
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Expense Information Section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <PhilippinePeso size={18} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                    Expense Information
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Amount */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Amount (PHP) <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount || ""}
                      onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--neuron-ink-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                    />
                  </div>

                  {/* Purpose */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Purpose <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.purpose}
                      onChange={(e) => handleChange("purpose", e.target.value)}
                      placeholder="Brief description of expense purpose"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--neuron-ink-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Additional details..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--neuron-ink-primary)",
                        resize: "vertical",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                    />
                  </div>
                </div>
              </div>

              {/* Vendor/Payee Information Section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <Building2 size={18} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                    Vendor/Payee Information
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Vendor Name */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Vendor/Payee Name <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vendor_name}
                      onChange={(e) => handleChange("vendor_name", e.target.value)}
                      placeholder="Enter vendor name"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--neuron-ink-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                    />
                  </div>

                  {/* Vendor Contact */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Contact Information
                    </label>
                    <input
                      type="text"
                      value={formData.vendor_contact}
                      onChange={(e) => handleChange("vendor_contact", e.target.value)}
                      placeholder="Phone or email"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--neuron-ink-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                    />
                  </div>
                </div>
              </div>

              {/* Linking & Payment Terms Section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <FileText size={18} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                    Linking & Payment Terms
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Project Number */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Project/Booking Number
                    </label>
                    <input
                      type="text"
                      value={formData.project_number}
                      onChange={(e) => handleChange("project_number", e.target.value)}
                      placeholder="e.g., BK-2024-1234"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--neuron-ink-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                    />
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Related Customer
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => handleChange("customer_name", e.target.value)}
                      placeholder="Customer name (if applicable)"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--neuron-ink-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                    />
                  </div>

                  {/* Credit Terms & Due Date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                        Credit Terms
                      </label>
                      <input
                        type="text"
                        value={formData.credit_terms}
                        onChange={(e) => handleChange("credit_terms", e.target.value)}
                        placeholder="e.g., Net 30"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          color: "var(--neuron-ink-primary)",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleChange("due_date", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          color: "var(--neuron-ink-primary)",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "#0F766E"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "var(--neuron-ui-border)"}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                      Preferred Payment Method
                    </label>
                    <SimpleDropdown
                      value={formData.payment_method}
                      onChange={(value) => handleChange("payment_method", value)}
                      placeholder="Select payment method"
                      options={[
                        "Cash",
                        "Bank Transfer",
                        "Check",
                        "Credit Card",
                        "Online Payment"
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <Calendar size={18} style={{ color: "#0F766E" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B" }}>
                    Supporting Documents
                  </h3>
                </div>
                <div
                  style={{
                    border: "2px dashed var(--neuron-ui-border)",
                    borderRadius: "12px",
                    padding: "32px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0F766E";
                    e.currentTarget.style.backgroundColor = "#F0FDFA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Upload size={32} style={{ color: "#667085", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "14px", color: "#374151", fontWeight: 500, marginBottom: "4px" }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ fontSize: "13px", color: "#667085" }}>
                    Invoices, receipts, or supporting documents (PDF, PNG, JPG)
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed at Bottom */}
        <div 
          style={{
            padding: "24px 48px",
            borderTop: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FAFAFA",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "1px solid var(--neuron-ui-border)",
              backgroundColor: "#FFFFFF",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="budget-request-form"
            disabled={!isFormValid}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isFormValid ? "#0F766E" : "#E5E7EB",
              color: isFormValid ? "#FFFFFF" : "#9CA3AF",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isFormValid ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor = "#0D6560";
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor = "#0F766E";
              }
            }}
          >
            Submit for Approval
          </button>
        </div>
      </div>
    </>
  );
}