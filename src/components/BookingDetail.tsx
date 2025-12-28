import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Edit, Printer, Upload, Plus, FileText, Copy } from "lucide-react";
import { toast } from "./ui/toast-utils";

interface Booking {
  id: string;
  trackingNo: string;
  client: string;
  pickup: string;
  dropoff: string;
  status: "Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled" | "Closed";
  deliveryDate: string;
  deliveryType?: "Import" | "Export" | "Domestic";
  mode?: "Air" | "Sea" | "Trucking" | "Domestic";
  etd?: string;
  eta?: string;
  delivered_at?: string;
  shipmentType?: "FCL" | "LCL";
  driver?: string;
  vehicle?: string;
  notes?: string;
}

interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  enteredBy: string;
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
  name: string;
  type: string;
  uploadedDate: string;
}

interface BookingDetailProps {
  booking: Booking;
  expenses: Expense[];
  payments: Payment[];
  documents: Document[];
  onBack: () => void;
  onUpdateStatus: (status: Booking["status"]) => void;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
  onUploadDocument: (doc: { name: string; type: string }) => void;
}

export function BookingDetail({
  booking,
  expenses,
  payments,
  documents,
  onBack,
  onUpdateStatus,
  onAddExpense,
  onAddPayment,
  onUploadDocument,
}: BookingDetailProps) {
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ type: "", amount: "", date: "" });
  const [newPayment, setNewPayment] = useState({ amount: "", date: "", method: "", reference: "" });

  // Status badge component
  const StatusBadge = ({ status }: { status: Booking["status"] }) => {
    const statusConfig: Record<string, { color: string; bg: string }> = {
      "Created": { color: "#6B7280", bg: "#F3F4F6" },
      "For Delivery": { color: "#0A1D4D", bg: "#E8EAF6" },
      "In Transit": { color: "#F25C05", bg: "#FFF3E0" },
      "Delivered": { color: "#10b981", bg: "#E8F5E9" },
      "Cancelled": { color: "#EF4444", bg: "#FEE2E2" },
      "Closed": { color: "#6B7280", bg: "#F9FAFB" },
    };

    const config = statusConfig[status] || statusConfig["Closed"];

    return (
      <div 
        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs"
        style={{
          backgroundColor: config.bg,
          color: config.color,
        }}
      >
        {status}
      </div>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  };

  const handleAddExpense = () => {
    onAddExpense({
      type: newExpense.type,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      status: "Pending",
      enteredBy: "Current User",
    });
    setNewExpense({ type: "", amount: "", date: "" });
    setIsExpenseDialogOpen(false);
  };

  const handleAddPayment = () => {
    onAddPayment({
      amount: parseFloat(newPayment.amount),
      date: newPayment.date,
      method: newPayment.method,
      reference: newPayment.reference,
      status: "Pending",
    });
    setNewPayment({ amount: "", date: "", method: "", reference: "" });
    setIsPaymentDialogOpen(false);
  };

  const printPack = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const expenseEntries = expenses.map((e) => `
      <tr>
        <td>${e.type}</td>
        <td>$${e.amount.toLocaleString()}</td>
        <td>${e.date}</td>
        <td>${e.status}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Pack - ${booking.trackingNo}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; }
            h1 { color: #127C56; letter-spacing: -0.01em; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-variant-numeric: tabular-nums; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Booking Details</h1>
          <p><strong>Tracking Number:</strong> ${booking.trackingNo}</p>
          <p><strong>Client:</strong> ${booking.client}</p>
          <p><strong>Route:</strong> ${booking.pickup} → ${booking.dropoff}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
          <p><strong>Delivery Date:</strong> ${booking.deliveryDate}</p>
          <p><strong>Driver:</strong> ${booking.driver || "—"}</p>
          
          <h2>Expense Entries</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${expenseEntries}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6 hover:bg-gray-50 rounded-xl transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Bookings
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[24px]">{booking.trackingNo}</h1>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {booking.status === "For Delivery" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus("In Transit")}
              className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
            >
              Mark In Transit
            </Button>
          )}
          {booking.status === "In Transit" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus("Delivered")}
              className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
            >
              Mark Delivered
            </Button>
          )}
          {booking.status === "Delivered" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus("Closed")}
              className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
            >
              Close
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={printPack}
            className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Pack
          </Button>
        </div>
      </div>

      {/* Key Facts Card */}
      <Card className="p-6 mb-6 bg-white border border-[#E5E7EB] rounded-xl">
        <h3 className="text-[16px] mb-6 text-[#0A1D4D]">Key Facts</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Tracking No with Copy Icon */}
          <div>
            <p className="text-[13px] text-[#6B7280] mb-1">Tracking No</p>
            <div className="flex items-center gap-2">
              <p className="text-[14px] text-[#0A1D4D] font-medium">{booking.trackingNo}</p>
              <button
                onClick={() => copyToClipboard(booking.trackingNo)}
                className="text-[#6B7280] hover:text-[#F25C05] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Client */}
          <div>
            <p className="text-[13px] text-[#6B7280] mb-1">Client</p>
            <p className="text-[14px] text-[#0A1D4D]">{booking.client}</p>
          </div>

          {/* Type */}
          <div>
            <p className="text-[13px] text-[#6B7280] mb-1">Type</p>
            <p className="text-[14px] text-[#0A1D4D]">{booking.deliveryType || "—"}</p>
          </div>

          {/* Mode */}
          <div>
            <p className="text-[13px] text-[#6B7280] mb-1">Mode</p>
            <p className="text-[14px] text-[#0A1D4D]">{booking.mode || "—"}</p>
          </div>

          {/* Route */}
          <div className="col-span-2">
            <p className="text-[13px] text-[#6B7280] mb-1">Route</p>
            <p className="text-[14px] text-[#0A1D4D]">{booking.pickup} → {booking.dropoff}</p>
          </div>

          {/* Driver & Vehicle */}
          <div className="col-span-2">
            <p className="text-[13px] text-[#6B7280] mb-1">Driver & Vehicle</p>
            <p className="text-[14px] text-[#0A1D4D]">
              {booking.driver && booking.vehicle 
                ? `${booking.driver} • ${booking.vehicle}`
                : booking.driver || booking.vehicle || "—"}
            </p>
          </div>

          {/* ETD / ETA / Delivered */}
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[13px] text-[#6B7280] mb-1">ETD</p>
                <p className="text-[14px] text-[#0A1D4D]">{booking.etd || "—"}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#6B7280] mb-1">ETA</p>
                <p className="text-[14px] text-[#0A1D4D]">{booking.eta || booking.deliveryDate}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#6B7280] mb-1">Delivered</p>
                <p className="text-[14px] text-[#0A1D4D]">{booking.delivered_at || "—"}</p>
              </div>
            </div>
          </div>

          {/* Shipment Type */}
          <div>
            <p className="text-[13px] text-[#6B7280] mb-1">Shipment Type</p>
            <p className="text-[14px] text-[#0A1D4D]">
              {booking.mode === "Sea" && booking.shipmentType ? booking.shipmentType : "—"}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <div>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#F9FAFB] p-1 rounded-lg mb-6">
            <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[13px]">Documents</TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[13px]">Expenses</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[13px]">Payments</TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="p-6 bg-white border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] text-[#0A1D4D]">Documents</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUploadDocument({ name: "Booking Details.pdf", type: "Booking Details" })}
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Booking Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUploadDocument({ name: "Expense Entries.pdf", type: "Expense Entries" })}
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Expense Entries
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F9FAFB] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#0A1D4D]" />
                      </div>
                      <div>
                        <p className="text-[14px] text-[#0A1D4D]">{doc.name}</p>
                        <p className="text-[13px] text-[#6B7280]">{doc.type} • {doc.uploadedDate}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-lg h-9"
                    >
                      Download
                    </Button>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-center text-[#6B7280] py-8 text-[14px]">No documents uploaded yet</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card className="p-6 bg-white border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] text-[#0A1D4D]">Expenses</h3>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-9"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Expense</DialogTitle>
                      <DialogDescription>Record a new expense for this booking.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newExpense.type}
                          onValueChange={(value) => setNewExpense({ ...newExpense, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fuel">Fuel</SelectItem>
                            <SelectItem value="Toll">Toll</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newExpense.date}
                          onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        />
                      </div>
                      <Button
                        onClick={handleAddExpense}
                        className="w-full bg-[#F25C05] hover:bg-[#D84D00]"
                      >
                        Add Expense
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[13px]">Type</TableHead>
                    <TableHead className="text-[13px]">Amount</TableHead>
                    <TableHead className="text-[13px]">Date</TableHead>
                    <TableHead className="text-[13px]">Status</TableHead>
                    <TableHead className="text-[13px]">Entered By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-[14px]">{expense.type}</TableCell>
                      <TableCell className="text-[14px]">${expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-[14px]">{expense.date}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            expense.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : expense.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[14px]">{expense.enteredBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="p-6 bg-white border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] text-[#0A1D4D]">Payments</h3>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-9">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment</DialogTitle>
                      <DialogDescription>Record a new payment for this booking.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newPayment.date}
                          onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Method</Label>
                        <Select
                          value={newPayment.method}
                          onValueChange={(value) => setNewPayment({ ...newPayment, method: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Check">Check</SelectItem>
                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Reference</Label>
                        <Input
                          value={newPayment.reference}
                          onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                          placeholder="Payment reference"
                        />
                      </div>
                      <Button
                        onClick={handleAddPayment}
                        className="w-full bg-[#F25C05] hover:bg-[#D84D00]"
                      >
                        Add Payment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[13px]">Amount</TableHead>
                    <TableHead className="text-[13px]">Date</TableHead>
                    <TableHead className="text-[13px]">Method</TableHead>
                    <TableHead className="text-[13px]">Reference</TableHead>
                    <TableHead className="text-[13px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-[14px]">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-[14px]">{payment.date}</TableCell>
                      <TableCell className="text-[14px]">{payment.method}</TableCell>
                      <TableCell className="text-[14px]">{payment.reference}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            payment.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
