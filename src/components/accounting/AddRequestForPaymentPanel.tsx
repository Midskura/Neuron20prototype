import { X, Plus, Printer, Download, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import logoImage from "figma:asset/28c84ed117b026fbf800de0882eb478561f37f4f.png";
import { SimpleDropdown } from "../bd/SimpleDropdown";
import { GroupedDropdown } from "../bd/GroupedDropdown";

interface LineItem {
  id: string;
  particular: string;
  description: string;
  amount: number;
}

interface AddRequestForPaymentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onSaveDraft?: (data: any) => void;
}

type ExpenseCategory = 
  | "Brokerage - FCL"
  | "Brokerage - LCL/AIR"
  | "Forwarding" 
  | "Trucking"
  | "Miscellaneous"
  | "Office";

type PaymentMethod = 
  | "Cash"
  | "Bank Transfer"
  | "Online Payment"
  | "Cash Deposit"
  | "Check Deposit"
  | "Manager's Check"
  | "E-Wallets";

type CreditTerm = "None" | "Net7" | "Net15" | "Net30";

interface SubCategory {
  label: string;
  items: string[];
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Brokerage - FCL",
  "Brokerage - LCL/AIR",
  "Forwarding",
  "Trucking",
  "Miscellaneous",
  "Office"
];

// Hierarchical structure: Category -> Sub-Category -> Sub-Sub-Category
const SUB_CATEGORIES: Record<ExpenseCategory, SubCategory[]> = {
  "Brokerage - FCL": [
    {
      label: "Destination Local Charges",
      items: [
        "THC & Other Local Charges",
        "Detention",
        "Demurrage",
        "Detention/Demurrage",
        "Storage & Deposit",
        "Late Payment Fee",
        "Others"
      ]
    },
    {
      label: "Port Charges",
      items: [
        "THC",
        "Arrastre, Wharfage Due & Storage Fee",
        "Storage Fee",
        "Reefer",
        "Physical Examination",
        "Spot-check Examination",
        "O-LO",
        "Others"
      ]
    },
    {
      label: "Trucking Charges",
      items: [
        "Delivery Fee",
        "Booking Fee",
        "Tricod",
        "CY Fee",
        "Others"
      ]
    }
  ],
  "Brokerage - LCL/AIR": [
    {
      label: "Warehouse Charges",
      items: [
        "Storage & Other Fees"
      ]
    },
    {
      label: "Clearance Charges",
      items: [
        "Assessment",
        "Agents",
        "Liquidation",
        "Audit",
        "District",
        "X-Ray",
        "Wharfinger",
        "CNIU/CAIDTF",
        "BAI",
        "ISPM",
        "BPI",
        "Notary & Photocopies",
        "Employee Particulars",
        "Company Particulars",
        "Brokerage Fee",
        "Others"
      ]
    },
    {
      label: "Sales Commission",
      items: [
        "Sales Commission"
      ]
    }
  ],
  "Forwarding": [
    {
      label: "Freight Charges",
      items: [
        "Air Freight",
        "Ocean Freight"
      ]
    },
    {
      label: "Origin Local Charges",
      items: [
        "EXW",
        "FCA/FOB",
        "Others"
      ]
    },
    {
      label: "Freight & Origin Local Charges",
      items: [
        "EXW/FCA/FOB"
      ]
    },
    {
      label: "Destination Local Charges",
      items: [
        "THC & Other Local Charges",
        "Detention",
        "Demurrage",
        "Detention/Demurrage",
        "Storage & Deposit",
        "Late Payment Fee",
        "Others"
      ]
    },
    {
      label: "Port Charges",
      items: [
        "Arrastre & Wharfage Due",
        "Arrastre, Wharfage Due & Storage Fee",
        "Storage Fee",
        "Reefer",
        "Physical Examination",
        "Spot-check Examination",
        "O-LO",
        "Others"
      ]
    },
    {
      label: "Trucking Charges",
      items: [
        "Delivery Fee",
        "Booking Fee",
        "Tricod",
        "CY Fee",
        "Others"
      ]
    }
  ],
  "Trucking": [
    {
      label: "Transportation Charges",
      items: [
        "Gasoline",
        "Toll",
        "Pull-out",
        "Empty Return",
        "Facilitation",
        "Documentation",
        "Penalty",
        "Others"
      ]
    }
  ],
  "Miscellaneous": [
    {
      label: "NTC Charges",
      items: [
        "Processing",
        "Order of Payment"
      ]
    },
    {
      label: "FDA Charges",
      items: [
        "Processing",
        "Order of Payment"
      ]
    },
    {
      label: "ATRIG Charges",
      items: [
        "Processing",
        "Order of Payment"
      ]
    },
    {
      label: "SRA Charges",
      items: [
        "Processing",
        "Order of Payment"
      ]
    },
    {
      label: "BOC AMO Charges",
      items: [
        "Processing",
        "Order of Payment"
      ]
    },
    {
      label: "DTI Charges",
      items: [
        "Processing",
        "Order of Payment"
      ]
    }
  ],
  "Office": [
    {
      label: "Office Expenses",
      items: [
        "Office Supplies",
        "Utilities",
        "Rent",
        "Telecommunications",
        "Professional Fees",
        "Marketing & Advertising",
        "Travel & Transportation",
        "Representation",
        "Others"
      ]
    }
  ]
};

const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Bank Transfer",
  "Online Payment",
  "Cash Deposit",
  "Check Deposit",
  "Manager's Check",
  "E-Wallets"
];

const CREDIT_TERMS: CreditTerm[] = ["None", "Net7", "Net15", "Net30"];

export function AddRequestForPaymentPanel({ 
  isOpen, 
  onClose, 
  onSave,
  onSaveDraft 
}: AddRequestForPaymentPanelProps) {
  // Form state
  const [requestName, setRequestName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("Brokerage - FCL");
  const [subCategory, setSubCategory] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", particular: "", description: "", amount: 0 }
  ]);
  const [preferredPayment, setPreferredPayment] = useState<PaymentMethod>("Bank Transfer");
  const [vendor, setVendor] = useState("");
  const [creditTerms, setCreditTerms] = useState<CreditTerm>("None");
  const [paymentSchedule, setPaymentSchedule] = useState("");
  const [notes, setNotes] = useState("");

  // Generate today's date and EVRN number
  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
  
  // Generate EVRN: EVRNYYYYMM001 format
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const evrnNumber = `EVRN${year}${month}${day}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const handleAddLine = () => {
    const newId = (Math.max(...lineItems.map(item => parseInt(item.id))) + 1).toString();
    setLineItems([
      ...lineItems,
      { id: newId, particular: "", description: "", amount: 0 }
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      requestName,
      evrnNumber,
      expenseCategory,
      subCategory,
      projectNumber,
      lineItems,
      totalAmount,
      preferredPayment,
      vendor,
      creditTerms,
      paymentSchedule,
      notes,
      date: todayFormatted,
      requestor: "Current User", // In real app, get from auth context
      status: "Submitted"
    });
    handleClose();
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft({
        requestName,
        evrnNumber,
        expenseCategory,
        subCategory,
        projectNumber,
        lineItems,
        totalAmount,
        preferredPayment,
        vendor,
        creditTerms,
        paymentSchedule,
        notes,
        date: todayFormatted,
        requestor: "Current User",
        status: "Draft"
      });
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setRequestName("");
    setExpenseCategory("Brokerage - FCL");
    setSubCategory("");
    setProjectNumber("");
    setLineItems([{ id: "1", particular: "", description: "", amount: 0 }]);
    setPreferredPayment("Bank Transfer");
    setVendor("");
    setCreditTerms("None");
    setPaymentSchedule("");
    setNotes("");
  };

  if (!isOpen) return null;

  const isFormValid = 
    requestName.trim() !== "" &&
    expenseCategory !== "" &&
    subCategory !== "" &&
    lineItems.some(item => item.particular.trim() !== "" && item.amount > 0) &&
    vendor.trim() !== "";

  // Update sub-category when expense category changes
  const availableSubCategories = SUB_CATEGORIES[expenseCategory] || [];

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
        className="fixed right-0 top-0 h-full w-[920px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in"
        style={{
          borderLeft: "1px solid var(--neuron-ui-border)",
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: "24px 48px",
            borderBottom: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#12332B", marginBottom: "4px" }}>
                New Budget Request
              </h2>
              <p style={{ fontSize: "13px", color: "#667085" }}>
                Create a new expense request with complete categorization and payment details
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
          <form onSubmit={handleSubmit} id="rfp-form">
            {/* Header Section with Logo */}
            <div style={{ 
              display: "flex", 
              alignItems: "flex-start", 
              justifyContent: "space-between",
              marginBottom: "32px",
              paddingBottom: "24px",
              borderBottom: "1px solid #E5E7EB"
            }}>
              <div>
                <img 
                  src={logoImage} 
                  alt="Neuron" 
                  style={{ height: "32px", marginBottom: "12px" }}
                />
              </div>
              
              <div style={{ textAlign: "right" }}>
                <h1 style={{ 
                  fontSize: "20px", 
                  fontWeight: 700, 
                  color: "#12332B",
                  letterSpacing: "0.5px",
                  marginBottom: "16px"
                }}>
                  REQUEST FOR PAYMENT
                </h1>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: 500, 
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "4px"
                    }}>
                      Date
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>
                      {todayFormatted}
                    </span>
                  </div>
                  <div>
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: 500, 
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "4px"
                    }}>
                      E-Voucher Ref No.
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#0F766E" }}>
                      {evrnNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Information Section */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "14px", 
                fontWeight: 600, 
                color: "#12332B", 
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Request Information
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Request Name */}
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "12px", 
                    fontWeight: 500, 
                    color: "#374151", 
                    marginBottom: "8px" 
                  }}>
                    Request Name / Title <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="e.g., Q1 2025 Marketing Campaign, Office Supplies - January 2025"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "14px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Expense Category */}
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "12px", 
                      fontWeight: 500, 
                      color: "#374151", 
                      marginBottom: "8px" 
                    }}>
                      Expense Category <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <SimpleDropdown
                      options={EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                      value={expenseCategory}
                      onChange={(value) => {
                        setExpenseCategory(value as ExpenseCategory);
                        setSubCategory(""); // Reset sub-category when category changes
                      }}
                      placeholder="Select category"
                    />
                  </div>

                  {/* Sub-Category */}
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "12px", 
                      fontWeight: 500, 
                      color: "#374151", 
                      marginBottom: "8px" 
                    }}>
                      Sub-Category <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <GroupedDropdown
                      options={availableSubCategories}
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="Select sub-category"
                    />
                  </div>
                </div>

                {/* Project Number */}
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "12px", 
                    fontWeight: 500, 
                    color: "#374151", 
                    marginBottom: "8px" 
                  }}>
                    Project / Booking Number {["Brokerage - FCL", "Brokerage - LCL/AIR", "Forwarding", "Trucking"].includes(expenseCategory) && <span style={{ color: "#6B7280", fontWeight: 400 }}>(Optional)</span>}
                  </label>
                  <input
                    type="text"
                    value={projectNumber}
                    onChange={(e) => setProjectNumber(e.target.value)}
                    placeholder="e.g., LCL-IMPS-001-SEA or BRK-2024-045"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "14px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "14px", 
                fontWeight: 600, 
                color: "#12332B", 
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Expense Details
              </h3>

              {/* Table Header */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1.5fr 180px 40px",
                gap: "12px",
                paddingBottom: "12px",
                borderBottom: "2px solid #E5E7EB",
                marginBottom: "12px"
              }}>
                <div style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Particular
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Description
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "right"
                }}>
                  Amount (₱)
                </div>
                <div></div>
              </div>

              {/* Line Items */}
              {lineItems.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1.5fr 180px 40px",
                    gap: "12px",
                    marginBottom: "12px",
                    alignItems: "start"
                  }}
                >
                  <input
                    type="text"
                    value={item.particular}
                    onChange={(e) => handleLineItemChange(item.id, "particular", e.target.value)}
                    placeholder="Enter particular"
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(item.id, "description", e.target.value)}
                    placeholder="Optional details"
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount || ""}
                    onChange={(e) => handleLineItemChange(item.id, "amount", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      outline: "none",
                      textAlign: "right",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(item.id)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "white",
                        color: "#EF4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#FEF2F2";
                        e.currentTarget.style.borderColor = "#EF4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* Add Another Line Button */}
              <button
                type="button"
                onClick={handleAddLine}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#0F766E",
                  backgroundColor: "transparent",
                  border: "1px dashed #0F766E",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(15, 118, 110, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Plus size={16} />
                Add Another Line
              </button>

              {/* Total Amount */}
              <div style={{ 
                display: "flex", 
                justifyContent: "flex-end",
                paddingTop: "16px",
                marginTop: "16px",
                borderTop: "2px solid #E5E7EB"
              }}>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280" }}>
                    Total Amount
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "#12332B" }}>
                    ₱{totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "14px", 
                fontWeight: 600, 
                color: "#12332B", 
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Payment Details
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Preferred Payment */}
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "12px", 
                    fontWeight: 500, 
                    color: "#374151", 
                    marginBottom: "8px" 
                  }}>
                    Preferred Payment Method <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <SimpleDropdown
                    options={PAYMENT_METHODS.map(method => ({ value: method, label: method }))}
                    value={preferredPayment}
                    onChange={(value) => setPreferredPayment(value as PaymentMethod)}
                    placeholder="Select payment method"
                  />
                </div>

                {/* Credit Terms */}
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "12px", 
                    fontWeight: 500, 
                    color: "#374151", 
                    marginBottom: "8px" 
                  }}>
                    Credit Terms
                  </label>
                  <SimpleDropdown
                    options={CREDIT_TERMS.map(term => ({ value: term, label: term }))}
                    value={creditTerms}
                    onChange={(value) => setCreditTerms(value as CreditTerm)}
                    placeholder="Select credit terms"
                  />
                </div>

                {/* Payment Schedule */}
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "12px", 
                    fontWeight: 500, 
                    color: "#374151", 
                    marginBottom: "8px" 
                  }}>
                    Payment Schedule Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="date"
                      value={paymentSchedule}
                      onChange={(e) => setPaymentSchedule(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: "14px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0F766E";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "14px", 
                fontWeight: 600, 
                color: "#12332B", 
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Vendor / Payee Information
              </h3>
              <label style={{ 
                display: "block", 
                fontSize: "12px", 
                fontWeight: 500, 
                color: "#374151", 
                marginBottom: "8px" 
              }}>
                For the Account Of <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Enter vendor or payee name"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0F766E";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Notes Section */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ 
                fontSize: "14px", 
                fontWeight: 600, 
                color: "#12332B", 
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Additional Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or remarks here..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  outline: "none",
                  transition: "all 0.2s",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0F766E";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Requestor Info */}
            <div style={{ 
              padding: "12px 16px", 
              backgroundColor: "#F9FAFB", 
              borderRadius: "6px",
              border: "1px solid #E5E7EB"
            }}>
              <span style={{ fontSize: "12px", color: "#6B7280" }}>
                <strong>Requestor:</strong> Current User (Account Owner)
              </span>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
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
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Printer size={16} />
              Print
            </button>
            <button
              type="button"
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
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Download size={16} />
              Download Excel
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#6B7280",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#374151",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              form="rfp-form"
              disabled={!isFormValid}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: isFormValid ? "#0F766E" : "#D1D5DB",
                border: "none",
                borderRadius: "8px",
                cursor: isFormValid ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  e.currentTarget.style.backgroundColor = "#0D6559";
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  e.currentTarget.style.backgroundColor = "#0F766E";
                }
              }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </>
  );
}