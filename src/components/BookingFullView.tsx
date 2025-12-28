import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Edit3,
  Printer,
  MoreVertical,
  Plus,
  Trash2,
  FileText,
  Package,
  Archive,
  User,
  MapPin,
  Calendar,
  Truck,
  Clock,
  CalendarClock,
  DollarSign,
  Receipt,
  Ship,
  Wallet,
  ExternalLink,
  Save,
  X,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "./ui/toast-utils";
import { ShipmentMonitoringForm } from "./ShipmentMonitoringForm";
import { ShipmentTypeSelector } from "./ShipmentTypeSelector";
import { DeliveryStatusControl } from "./DeliveryStatusControl";
import { BillingWorkspace } from "./BillingWorkspace";
import { ExpenseModal } from "./ExpenseModal";
import { cn } from "./ui/utils";

interface Booking {
  id: string;
  trackingNo: string;
  client: string;
  pickup: string;
  dropoff: string;
  status: "Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled" | "Closed";
  deliveryType?: "Import" | "Export" | "Domestic";
  deliveryDate: string;
  profit: number;
  driver?: string;
  vehicle?: string;
  notes?: string;
}

interface Expense {
  id: string;
  expenseNo?: string;
  bookingId: string;
  forAccountOf?: string;
  date: string;
  categories?: string[];
  lineItems?: any[];
  subtotal?: number;
  lessAdvance?: number;
  total?: number;
  amount?: number;
  vendor?: string;
  category?: string;
  status: "Draft" | "For Review" | "Approved" | "Posted" | "Pending";
  preparedBy?: string;
  notedBy?: string;
  approvedBy?: string;
  createdAt?: string;
  expenseType?: "Operations" | "Admin" | "Commission" | "Itemized Cost";
  company?: string;
  type?: string;
  description?: string;
  enteredBy?: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface Document {
  id: string;
  bookingId: string;
  name: string;
  type: string;
  uploadedDate: string;
}

interface BookingFullViewProps {
  booking: Booking;
  expenses?: Expense[];
  payments?: Payment[];
  documents?: Document[];
  onBack: () => void;
  onEdit?: (updates: any) => void;
  onAddExpense?: (expense: any) => void;
  onUpdateExpense?: (id: string, updates: any) => void;
  onDeleteExpense?: (id: string) => void;
  onAddPayment?: (payment: any) => void;
  onUpdatePayment?: (id: string, updates: any) => void;
  onDeletePayment?: (id: string) => void;
  onAddDocument?: (document: any) => void;
  onDeleteDocument?: (id: string) => void;
  onViewExpense?: (id: string) => void;
  currentUser?: string;
}

// Tab type
type BookingTab = "information" | "billings" | "expenses";

// Helper function to resolve delivery type
type DeliveryTypeResolved = "Import" | "Export" | "Domestic";

const resolveDeliveryType = (b: any): DeliveryTypeResolved => {
  const raw =
    b?.deliveryType ??
    (b as any)?.shipmentType ??
    (b as any)?.delivery_type ??
    (b as any)?.type ??
    "";

  const v = String(raw).trim().toLowerCase();
  if (v === "import") return "Import";
  if (v === "export") return "Export";
  if (v === "domestic") return "Domestic";
  return "Import";
};

// Status pill component
function StatusPill({ status }: { status: Booking["status"] }) {
  const statusConfig: Record<string, { color: string; bg: string }> = {
    "Created": { color: "#6B7280", bg: "#F3F4F6" },
    "For Delivery": { color: "#0F766E", bg: "#E8F2EE" },
    "In Transit": { color: "#F25C05", bg: "#FFF3E0" },
    "Delivered": { color: "#10B981", bg: "#D1FAE5" },
    "Cancelled": { color: "#EF4444", bg: "#FEE2E2" },
    "Closed": { color: "#6B7280", bg: "#F3F4F6" },
  };

  const config = statusConfig[status] || statusConfig["Closed"];

  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {status}
    </div>
  );
}

// Mock billings data
const mockBillings = [
  {
    id: "bil1",
    billingNo: "BIL-2025-000134",
    date: "2025-04-21",
    description: "Door-to-door rate (Pickup, Freight, Permits & Customs)",
    amount: 82500.00,
    status: "Draft" as const,
    clientName: "Global Imports Ltd",
    billTo: "Mr. Sandesh Mhatre",
    clientAddress: "MAHARASHTRA, INDIA",
    bookingRef: "LCL-IMPS-001-SEA",
    notes: "Kindly make check payable to CONFORME CARGO EXPRESS",
    destination: "Manila, Philippines",
    commodity: "Personal Household Items",
    measurement: "10 bxs",
    lineItems: [
      {
        id: "1",
        description: "Door-door rate (Pickup, Freight, Permits/Lodgement & Customs Formalities)",
        amount: 82500,
      },
    ],
    paymentDetails: {
      bankName: "BDO",
      accountName: "CONFORME CARGO EXPRESS",
      accountNo: "0014-8803-0454",
      branch: "SM City Sucat A",
      swiftCode: "BNORPHMM",
    },
  },
];

export function BookingFullView({
  booking,
  expenses = [],
  payments = [],
  documents = [],
  onBack,
  onEdit,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onAddDocument,
  onDeleteDocument,
  onViewExpense,
  currentUser,
}: BookingFullViewProps) {
  // Safety check
  if (!booking) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B7280] mb-2">No booking selected.</p>
          <p className="text-[#9CA3AF] text-sm">The booking prop is undefined or null.</p>
        </div>
      </div>
    );
  }

  const deliveryType = resolveDeliveryType(booking);

  const [activeTab, setActiveTab] = useState<BookingTab>("information");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  
  // Editable booking fields
  const [editedBooking, setEditedBooking] = useState({
    client: booking.client,
    projectRef: "PROJ-2025-001",
    mode: "SEA" as "AIR" | "SEA",
    containerType: "LCL" as "FCL" | "LCL",
    shipper: "Acme Trading Corp",
    consignee: "Baguio Distribution Center",
    etd: "2025-10-20",
    eta: "2025-10-25",
    containerNo: "MSCU1234567",
    origin: booking.pickup,
    destination: booking.dropoff,
    weight: "5000",
    awbBlNo: "AWB-2025-00123",
    measurement: "45",
    commodity: "Retail Goods - Temperature Controlled",
    shippingLine: "Maersk Philippines",
    registryNo: "REG-2025-001",
    warehouse: "Manila Warehouse A",
    port: "Manila North Port",
    specialInstructions: booking.notes || "",
  });
  
  // Generate realistic expenses based on booking type
  const generateBookingExpenses = (bookingType: string = "Import", mode: string = "SEA"): Expense[] => {
    if (mode === "SEA" && bookingType === "Import") {
      return [
        {
          id: "exp-1",
          expenseNo: "EXP-2025-0412",
          bookingId: "LCL-IMPS-001-SEA",
          forAccountOf: "Metro Haulers PH",
          date: "2025-10-21",
          categories: ["Trucking"],
          lineItems: [],
          subtotal: 8500,
          lessAdvance: 0,
          total: 8500,
          vendor: "Metro Haulers PH",
          category: "Trucking (Pickup – QC to Port)",
          status: "Approved",
          preparedBy: "Operations",
          createdAt: "2025-10-21",
          expenseType: "Operations" as const,
          company: "CCE",
        },
        {
          id: "exp-2",
          expenseNo: "EXP-2025-0413",
          bookingId: "LCL-IMPS-001-SEA",
          forAccountOf: "JJB Brokerage Team",
          date: "2025-10-21",
          categories: ["Brokerage"],
          lineItems: [],
          subtotal: 4200,
          lessAdvance: 0,
          total: 4200,
          vendor: "JJB Brokerage Team",
          category: "Brokerage & Lodgement",
          status: "For Review",
          preparedBy: "Operations",
          createdAt: "2025-10-21",
          expenseType: "Itemized Cost" as const,
          company: "CCE",
        },
        {
          id: "exp-3",
          expenseNo: "EXP-2025-0414",
          bookingId: "LCL-IMPS-001-SEA",
          forAccountOf: "CCE Warehouse",
          date: "2025-10-21",
          categories: ["Warehouse"],
          lineItems: [],
          subtotal: 2750,
          lessAdvance: 0,
          total: 2750,
          vendor: "CCE Warehouse",
          category: "Warehouse / Handling (1 day)",
          status: "Approved",
          preparedBy: "Operations",
          createdAt: "2025-10-21",
          expenseType: "Operations" as const,
          company: "CCE",
        },
        {
          id: "exp-4",
          expenseNo: "EXP-2025-0415",
          bookingId: "LCL-IMPS-001-SEA",
          forAccountOf: "Metro Haulers PH",
          date: "2025-10-22",
          categories: ["Trucking Surcharge"],
          lineItems: [],
          subtotal: 1250,
          lessAdvance: 0,
          total: 1250,
          vendor: "Metro Haulers PH",
          category: "Trucking Surcharge (port delay)",
          status: "For Review",
          preparedBy: "Operations",
          createdAt: "2025-10-22",
          expenseType: "Operations" as const,
          company: "CCE",
        },
        {
          id: "exp-5",
          expenseNo: "EXP-2025-0416",
          bookingId: "LCL-IMPS-001-SEA",
          forAccountOf: "JJB Admin & Filing",
          date: "2025-10-23",
          categories: ["Admin"],
          lineItems: [],
          subtotal: 950,
          lessAdvance: 0,
          total: 950,
          vendor: "JJB Admin & Filing",
          category: "Admin / Documentation",
          status: "Approved",
          preparedBy: "Operations",
          createdAt: "2025-10-23",
          expenseType: "Admin" as const,
          company: "CCE",
        },
      ];
    }
    return [];
  };

  const [localExpenses, setLocalExpenses] = useState<Expense[]>(() => {
    if (expenses.length > 0) return expenses;
    return generateBookingExpenses("Import", "SEA");
  });

  const [selectedStatus, setSelectedStatus] = useState<"Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled">(
    booking.status as "Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled"
  );

  // Sync selectedStatus with booking.status when booking prop changes
  useEffect(() => {
    setSelectedStatus(booking.status as "Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled");
  }, [booking.status]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Handle Save
  const handleSave = () => {
    if (onEdit) {
      onEdit(editedBooking);
    }
    setIsEditing(false);
    toast.success("Booking updated successfully!");
  };

  // Handle Cancel
  const handleCancel = () => {
    // Reset to original values
    setEditedBooking({
      client: booking.client,
      projectRef: "PROJ-2025-001",
      mode: "SEA",
      containerType: "LCL",
      shipper: "Acme Trading Corp",
      consignee: "Baguio Distribution Center",
      etd: "2025-10-20",
      eta: "2025-10-25",
      containerNo: "MSCU1234567",
      origin: booking.pickup,
      destination: booking.dropoff,
      weight: "5000",
      awbBlNo: "AWB-2025-00123",
      measurement: "45",
      commodity: "Retail Goods - Temperature Controlled",
      shippingLine: "Maersk Philippines",
      registryNo: "REG-2025-001",
      warehouse: "Manila Warehouse A",
      port: "Manila North Port",
      specialInstructions: booking.notes || "",
    });
    setIsEditing(false);
  };

  return (
    <div style={{ 
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}>
      {/* Header Bar */}
      <div style={{
        padding: "20px 48px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        backgroundColor: "#F8FBFB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: "var(--neuron-ink-secondary)",
              cursor: "pointer",
              fontSize: "13px",
              marginBottom: "12px",
              padding: "0"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--neuron-brand-green)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--neuron-ink-secondary)";
            }}
          >
            <ArrowLeft size={16} />
            Back to Bookings
          </button>
          
          <h1 style={{ 
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            marginBottom: "4px"
          }}>
            {booking.client}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--neuron-ink-muted)", margin: 0 }}>
            {booking.trackingNo}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Status Control */}
          <DeliveryStatusControl
            status={selectedStatus}
            onStatusChange={(newStatus) => {
              setSelectedStatus(newStatus);
              if (onEdit) {
                onEdit({ status: newStatus as any });
              }
              toast.success(`Status updated to ${newStatus}`);
            }}
          />

          {/* Edit Button */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "white",
                border: "1.5px solid var(--neuron-brand-green)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--neuron-brand-green)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "var(--neuron-brand-green)";
              }}
            >
              <Edit3 size={16} />
              Edit
            </button>
          ) : (
            <>
              {/* Save Button */}
              <button
                onClick={handleSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "var(--neuron-brand-green)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0D6560";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
                }}
              >
                <Save size={16} />
                Save Changes
              </button>
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "white",
                  border: "1.5px solid var(--neuron-ui-border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--neuron-ink-secondary)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}

          {/* Kebab Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "white",
                  border: "1.5px solid var(--neuron-ui-border)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => toast.success("Duplicating booking...")}>
                <Package className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Printing...")}>
                <Printer className="w-4 h-4 mr-2" />
                Print Waybill
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Archived")}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        padding: "0 48px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        backgroundColor: "white",
        display: "flex",
        gap: "32px"
      }}>
        <button
          onClick={() => setActiveTab("information")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "information" ? "2px solid #0F766E" : "2px solid transparent",
            color: activeTab === "information" ? "#0F766E" : "#667085",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
        >
          Booking Information
        </button>
        <button
          onClick={() => setActiveTab("billings")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "billings" ? "2px solid #0F766E" : "2px solid transparent",
            color: activeTab === "billings" ? "#0F766E" : "#667085",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
        >
          Billings
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "expenses" ? "2px solid #0F766E" : "2px solid transparent",
            color: activeTab === "expenses" ? "#0F766E" : "#667085",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-1px"
          }}
        >
          Expenses
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        overflow: "auto"
      }}>
        <div style={{ 
          padding: "32px 48px",
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          
          {/* BOOKING INFORMATION TAB */}
          {activeTab === "information" && (
            <>
              {/* General Information Section */}
              <div style={{
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                padding: "24px",
                marginBottom: "24px"
              }}>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--neuron-brand-green)",
                  marginBottom: "20px"
                }}>
                  General Information
                </h2>

                <div style={{ display: "grid", gap: "20px" }}>
                  {/* Row 1: Client, Project Reference, Status */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    {/* Client */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Client *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.client}
                          onChange={(e) => setEditedBooking({ ...editedBooking, client: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.client || "—"}
                        </div>
                      )}
                    </div>

                    {/* Project Reference */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Project Reference
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.projectRef}
                          onChange={(e) => setEditedBooking({ ...editedBooking, projectRef: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.projectRef || "—"}
                        </div>
                      )}
                    </div>

                    {/* Status (Read-only) */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Status
                      </label>
                      <div style={{
                        padding: "10px 14px",
                        backgroundColor: "#F9FAFB",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "6px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center"
                      }}>
                        <StatusPill status={selectedStatus as any} />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Type, Mode, Container Type */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    {/* Type */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Type *
                      </label>
                      <div style={{
                        padding: "10px 14px",
                        backgroundColor: "#F9FAFB",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "var(--neuron-ink-primary)"
                      }}>
                        {deliveryType}
                      </div>
                    </div>

                    {/* Mode */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Mode *
                      </label>
                      {isEditing ? (
                        <select
                          value={editedBooking.mode}
                          onChange={(e) => setEditedBooking({ ...editedBooking, mode: e.target.value as "AIR" | "SEA" })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        >
                          <option value="SEA">SEA</option>
                          <option value="AIR">AIR</option>
                        </select>
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.mode}
                        </div>
                      )}
                    </div>

                    {/* Container Type */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Container Type
                      </label>
                      {isEditing ? (
                        <select
                          value={editedBooking.containerType}
                          onChange={(e) => setEditedBooking({ ...editedBooking, containerType: e.target.value as "FCL" | "LCL" })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        >
                          <option value="LCL">LCL</option>
                          <option value="FCL">FCL</option>
                        </select>
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.containerType}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipment Details Section */}
              <div style={{
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                padding: "24px",
                marginBottom: "24px"
              }}>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--neuron-brand-green)",
                  marginBottom: "20px"
                }}>
                  Shipment Details
                </h2>

                <div style={{ display: "grid", gap: "20px" }}>
                  {/* Row 1: Shipper, Consignee */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* Shipper */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Shipper
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.shipper}
                          onChange={(e) => setEditedBooking({ ...editedBooking, shipper: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.shipper || "—"}
                        </div>
                      )}
                    </div>

                    {/* Consignee */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Consignee
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.consignee}
                          onChange={(e) => setEditedBooking({ ...editedBooking, consignee: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.consignee || "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Origin, Destination */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* Origin */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Origin
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.origin}
                          onChange={(e) => setEditedBooking({ ...editedBooking, origin: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.origin || "—"}
                        </div>
                      )}
                    </div>

                    {/* Destination */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Destination
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.destination}
                          onChange={(e) => setEditedBooking({ ...editedBooking, destination: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.destination || "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: ETD, ETA */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* ETD */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        ETD (Estimated Time of Departure)
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedBooking.etd}
                          onChange={(e) => setEditedBooking({ ...editedBooking, etd: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <Calendar size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                          {formatDate(editedBooking.etd)}
                        </div>
                      )}
                    </div>

                    {/* ETA */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        ETA (Estimated Time of Arrival)
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedBooking.eta}
                          onChange={(e) => setEditedBooking({ ...editedBooking, eta: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <Calendar size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                          {formatDate(editedBooking.eta)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Shipping Line, Port, Warehouse */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    {/* Shipping Line */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Shipping Line
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.shippingLine}
                          onChange={(e) => setEditedBooking({ ...editedBooking, shippingLine: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.shippingLine || "—"}
                        </div>
                      )}
                    </div>

                    {/* Port */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Port
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.port}
                          onChange={(e) => setEditedBooking({ ...editedBooking, port: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.port || "—"}
                        </div>
                      )}
                    </div>

                    {/* Warehouse */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Warehouse
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.warehouse}
                          onChange={(e) => setEditedBooking({ ...editedBooking, warehouse: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.warehouse || "—"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Container & Cargo Information Section */}
              <div style={{
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                padding: "24px",
                marginBottom: "24px"
              }}>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--neuron-brand-green)",
                  marginBottom: "20px"
                }}>
                  Container & Cargo Information
                </h2>

                <div style={{ display: "grid", gap: "20px" }}>
                  {/* Row 1: Container No, AWB/BL No, Registry No */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    {/* Container No */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Container No.
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.containerNo}
                          onChange={(e) => setEditedBooking({ ...editedBooking, containerNo: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.containerNo || "—"}
                        </div>
                      )}
                    </div>

                    {/* AWB/BL No */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        AWB/BL No.
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.awbBlNo}
                          onChange={(e) => setEditedBooking({ ...editedBooking, awbBlNo: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.awbBlNo || "—"}
                        </div>
                      )}
                    </div>

                    {/* Registry No */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Registry No.
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.registryNo}
                          onChange={(e) => setEditedBooking({ ...editedBooking, registryNo: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.registryNo || "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Weight, Measurement, Commodity */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "20px" }}>
                    {/* Weight */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Weight (kg)
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.weight}
                          onChange={(e) => setEditedBooking({ ...editedBooking, weight: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.weight || "—"}
                        </div>
                      )}
                    </div>

                    {/* Measurement */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        CBM
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.measurement}
                          onChange={(e) => setEditedBooking({ ...editedBooking, measurement: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.measurement || "—"}
                        </div>
                      )}
                    </div>

                    {/* Commodity */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-base)",
                        marginBottom: "8px"
                      }}>
                        Commodity
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedBooking.commodity}
                          onChange={(e) => setEditedBooking({ ...editedBooking, commodity: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "var(--neuron-ink-primary)"
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: "10px 14px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)"
                        }}>
                          {editedBooking.commodity || "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--neuron-ink-base)",
                      marginBottom: "8px"
                    }}>
                      Special Instructions
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editedBooking.specialInstructions}
                        onChange={(e) => setEditedBooking({ ...editedBooking, specialInstructions: e.target.value })}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          backgroundColor: "white",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "var(--neuron-ink-primary)",
                          resize: "vertical"
                        }}
                      />
                    ) : (
                      <div style={{
                        padding: "10px 14px",
                        backgroundColor: "#F9FAFB",
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: editedBooking.specialInstructions ? "var(--neuron-ink-primary)" : "#9CA3AF",
                        minHeight: "60px"
                      }}>
                        {editedBooking.specialInstructions || "No special instructions"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div style={{
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "8px",
                padding: "24px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <h2 style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--neuron-brand-green)",
                    margin: 0
                  }}>
                    Documents & Attachments
                  </h2>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      backgroundColor: "white",
                      border: "1.5px solid var(--neuron-brand-green)",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--neuron-brand-green)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.color = "var(--neuron-brand-green)";
                    }}
                    onClick={() => toast.success("Upload functionality coming soon")}
                  >
                    <Upload size={14} />
                    Upload Document
                  </button>
                </div>

                {/* Documents List */}
                {documents && documents.length > 0 ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid var(--neuron-ui-border)",
                          borderRadius: "6px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <FileText size={18} style={{ color: "var(--neuron-brand-green)" }} />
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--neuron-ink-primary)", margin: 0 }}>
                              {doc.name}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", margin: 0 }}>
                              {doc.type} • {formatDate(doc.uploadedDate)}
                            </p>
                          </div>
                        </div>
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 12px",
                            backgroundColor: "white",
                            border: "1px solid var(--neuron-ui-border)",
                            borderRadius: "6px",
                            fontSize: "13px",
                            color: "var(--neuron-ink-secondary)",
                            cursor: "pointer"
                          }}
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#F9FAFB",
                    border: "1px dashed var(--neuron-ui-border)",
                    borderRadius: "6px"
                  }}>
                    <FileText size={32} style={{ color: "#CBD5E1", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "var(--neuron-ink-muted)", margin: 0 }}>
                      No documents uploaded yet
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* BILLINGS TAB */}
          {activeTab === "billings" && (
            <BillingWorkspace
              bookingId={booking.id}
              billings={mockBillings}
              onAddBilling={() => toast.success("Add billing functionality")}
              onEditBilling={(id) => toast.success(`Edit billing ${id}`)}
              onDeleteBilling={(id) => toast.success(`Delete billing ${id}`)}
            />
          )}

          {/* EXPENSES TAB */}
          {activeTab === "expenses" && (
            <div>
              {/* Expenses Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}>
                <div>
                  <h2 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "var(--neuron-ink-primary)",
                    margin: 0
                  }}>
                    Expenses
                  </h2>
                  <p style={{
                    fontSize: "13px",
                    color: "var(--neuron-ink-muted)",
                    margin: "4px 0 0"
                  }}>
                    {localExpenses.length} {localExpenses.length === 1 ? 'expense' : 'expenses'} recorded
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedExpense(undefined);
                    setShowExpenseModal(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    backgroundColor: "var(--neuron-brand-green)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#0D6560";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--neuron-brand-green)";
                  }}
                >
                  <Plus size={16} />
                  Add Expense
                </button>
              </div>

              {/* Expenses Table */}
              {localExpenses.length > 0 ? (
                <div style={{
                  backgroundColor: "white",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  {/* Table Header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr 120px 120px 120px 80px",
                    gap: "16px",
                    padding: "12px 20px",
                    backgroundColor: "#F9FAFB",
                    borderBottom: "1px solid var(--neuron-ui-border)"
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase" }}>
                      Expense No.
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase" }}>
                      For Account Of
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase" }}>
                      Date
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", textAlign: "right" }}>
                      Amount
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase" }}>
                      Status
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase" }}>
                      
                    </div>
                  </div>

                  {/* Table Rows */}
                  {localExpenses.map((expense, index) => (
                    <div
                      key={expense.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "180px 1fr 120px 120px 120px 80px",
                        gap: "16px",
                        padding: "16px 20px",
                        borderBottom: index < localExpenses.length - 1 ? "1px solid var(--neuron-ui-border)" : "none",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ fontSize: "14px", color: "var(--neuron-brand-green)", fontWeight: 500 }}>
                        {expense.expenseNo}
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--neuron-ink-primary)" }}>
                        {expense.forAccountOf || expense.vendor}
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--neuron-ink-secondary)" }}>
                        {formatDate(expense.date)}
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--neuron-ink-primary)", textAlign: "right", fontWeight: 500 }}>
                        ₱{(expense.total || expense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 500,
                          backgroundColor: expense.status === "Approved" ? "#D1FAE5" : expense.status === "Posted" ? "#DBEAFE" : expense.status === "For Review" ? "#FFF3E0" : "#F3F4F6",
                          color: expense.status === "Approved" ? "#10B981" : expense.status === "Posted" ? "#3B82F6" : expense.status === "For Review" ? "#F59E0B" : "#6B7280"
                        }}>
                          {expense.status}
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            if (onViewExpense) {
                              onViewExpense(expense.id);
                            } else {
                              toast.success(`View expense ${expense.expenseNo}`);
                            }
                          }}
                          style={{
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--neuron-ink-muted)"
                          }}
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "60px",
                  textAlign: "center",
                  backgroundColor: "#F9FAFB",
                  border: "1px dashed var(--neuron-ui-border)",
                  borderRadius: "8px"
                }}>
                  <Wallet size={48} style={{ color: "#CBD5E1", margin: "0 auto 16px" }} />
                  <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--neuron-ink-primary)", margin: "0 0 8px" }}>
                    No expenses yet
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--neuron-ink-muted)", margin: 0 }}>
                    Click "Add Expense" to record your first expense
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("Booking deleted");
                setShowDeleteDialog(false);
                onBack();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          isOpen={showExpenseModal}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedExpense(undefined);
          }}
          expense={selectedExpense}
          bookingId={booking.id}
          onSave={(expenseData) => {
            if (selectedExpense) {
              // Update existing expense
              if (onUpdateExpense) {
                onUpdateExpense(selectedExpense.id, expenseData);
              }
              setLocalExpenses(prev =>
                prev.map(exp => exp.id === selectedExpense.id ? { ...exp, ...expenseData } : exp)
              );
              toast.success("Expense updated successfully");
            } else {
              // Add new expense
              const newExpense: Expense = {
                id: `exp-${Date.now()}`,
                ...expenseData,
                bookingId: booking.id,
                status: "Draft",
                createdAt: new Date().toISOString()
              };
              if (onAddExpense) {
                onAddExpense(newExpense);
              }
              setLocalExpenses(prev => [...prev, newExpense]);
              toast.success("Expense added successfully");
            }
            setShowExpenseModal(false);
            setSelectedExpense(undefined);
          }}
        />
      )}
    </div>
  );
}
