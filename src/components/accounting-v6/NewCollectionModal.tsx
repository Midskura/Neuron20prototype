import { useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface NewCollectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const COMPANIES = ["JLCS", "CCE", "CPTC", "ZNICF"];
const CLIENTS = ["Shoe Mart Inc.", "Global Tech Solutions", "Metro Warehouse Corp"];
const PAYMENT_METHODS = ["Cash", "Check", "Bank Transfer"];

// Mock outstanding invoices
const OUTSTANDING_INVOICES = [
  { invoiceNo: "IN-2025-002", balance: 45000 },
  { invoiceNo: "IN-2025-003", balance: 65000 },
  { invoiceNo: "IN-2025-004", balance: 32000 },
];

interface InvoiceApplication {
  id: string;
  invoiceNo: string;
  amountToApply: string;
  remainingBalance: number;
}

export function NewCollectionModal({ open, onClose, onSubmit }: NewCollectionModalProps) {
  const [collectionDate, setCollectionDate] = useState<Date>();
  const [receiptNo, setReceiptNo] = useState("");
  const [client, setClient] = useState("");
  const [company, setCompany] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [refNo, setRefNo] = useState("");
  const [totalReceived, setTotalReceived] = useState("");
  
  const [invoiceApplications, setInvoiceApplications] = useState<InvoiceApplication[]>([
    { id: "1", invoiceNo: "", amountToApply: "", remainingBalance: 0 }
  ]);

  const addInvoiceRow = () => {
    setInvoiceApplications([
      ...invoiceApplications,
      { id: Date.now().toString(), invoiceNo: "", amountToApply: "", remainingBalance: 0 }
    ]);
  };

  const removeInvoiceRow = (id: string) => {
    setInvoiceApplications(invoiceApplications.filter((app) => app.id !== id));
  };

  const updateInvoiceApplication = (id: string, field: string, value: string) => {
    setInvoiceApplications(invoiceApplications.map((app) => {
      if (app.id === id) {
        if (field === "invoiceNo") {
          const invoice = OUTSTANDING_INVOICES.find(inv => inv.invoiceNo === value);
          return {
            ...app,
            invoiceNo: value,
            remainingBalance: invoice ? invoice.balance : 0
          };
        } else if (field === "amountToApply") {
          const amount = parseFloat(value) || 0;
          const invoice = OUTSTANDING_INVOICES.find(inv => inv.invoiceNo === app.invoiceNo);
          return {
            ...app,
            amountToApply: value,
            remainingBalance: invoice ? invoice.balance - amount : 0
          };
        }
      }
      return app;
    }));
  };

  const totalApplied = invoiceApplications.reduce((sum, app) => {
    return sum + (parseFloat(app.amountToApply) || 0);
  }, 0);

  const unapplied = (parseFloat(totalReceived) || 0) - totalApplied;

  const handleSaveDraft = () => {
    onSubmit({
      collectionDate,
      receiptNo,
      client,
      company,
      paymentMethod,
      refNo,
      totalReceived,
      invoiceApplications,
      status: "Draft",
    });
  };

  const handlePost = () => {
    onSubmit({
      collectionDate,
      receiptNo,
      client,
      company,
      paymentMethod,
      refNo,
      totalReceived,
      invoiceApplications,
      status: "Posted",
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col my-10"
        style={{ width: "1180px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-[#E5E9F0] px-8 py-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-[20px] font-semibold text-[#12332B] mb-1">
              New Collection
            </h3>
            <p className="text-[13px] text-[#667085]">
              Record a payment received and apply it to outstanding invoices
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-[#F9FAFB]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            {/* Collection Date */}
            <div>
              <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                Collection Date <span style={{ color: "#EF4444" }}>*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-[#E5E9F0] hover:border-[#0F766E] focus:ring-[#0F766E] focus:border-[#0F766E] rounded-lg"
                    style={{ height: "40px" }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {collectionDate ? format(collectionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={collectionDate}
                    onSelect={setCollectionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* OR / Receipt No. */}
            <div>
              <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                OR / Receipt No. <span style={{ color: "#EF4444" }}>*</span>
              </Label>
              <Input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="OR-2025-XXX"
                className="border-[#E5E9F0] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] rounded-lg"
                style={{ height: "40px" }}
              />
            </div>

            {/* Client */}
            <div>
              <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                Client <span style={{ color: "#EF4444" }}>*</span>
              </Label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger className="border-[#E5E9F0] focus:ring-[#0F766E] focus:border-[#0F766E] rounded-lg" style={{ height: "40px" }}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div>
              <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                Company <span style={{ color: "#EF4444" }}>*</span>
              </Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger className="border-[#E5E9F0] focus:ring-[#0F766E] focus:border-[#0F766E] rounded-lg" style={{ height: "40px" }}>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                Payment Method <span style={{ color: "#EF4444" }}>*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="border-[#E5E9F0] focus:ring-[#0F766E] focus:border-[#0F766E] rounded-lg" style={{ height: "40px" }}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ref / Check No. */}
            <div>
              <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                Ref / Check No.
              </Label>
              <Input
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="Reference number"
                className="border-[#E5E9F0] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] rounded-lg"
                style={{ height: "40px" }}
              />
            </div>

            {/* Total Received */}
            <div className="md:col-span-2">
              <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                Total Amount Received (₱) <span style={{ color: "#EF4444" }}>*</span>
              </Label>
              <Input
                type="number"
                value={totalReceived}
                onChange={(e) => setTotalReceived(e.target.value)}
                placeholder="0.00"
                className="border-[#E5E9F0] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] rounded-lg"
                style={{ height: "40px" }}
              />
            </div>
          </div>

          {/* Apply to Invoices */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-semibold text-[#12332B]">
                Apply to Invoices
              </h3>
              <Button
                variant="ghost"
                onClick={addInvoiceRow}
                className="text-[#0F766E] hover:bg-[#0F766E]/10 h-9 text-[13px] font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Invoice
              </Button>
            </div>

            <div className="border border-[#E5E9F0] rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E9F0]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#667085]">
                      Outstanding Invoice
                    </th>
                    <th className="px-4 py-3 text-right text-[12px] font-semibold text-[#667085]">
                      Amount to Apply
                    </th>
                    <th className="px-4 py-3 text-right text-[12px] font-semibold text-[#667085]">
                      Remaining Balance
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceApplications.map((app) => (
                    <tr key={app.id} className="border-b border-[#E5E9F0] last:border-0">
                      <td className="px-4 py-3">
                        <Select 
                          value={app.invoiceNo} 
                          onValueChange={(value) => updateInvoiceApplication(app.id, "invoiceNo", value)}
                        >
                          <SelectTrigger className="h-9 border-[#E5E9F0] focus:ring-[#0F766E] focus:border-[#0F766E]">
                            <SelectValue placeholder="Select invoice" />
                          </SelectTrigger>
                          <SelectContent>
                            {OUTSTANDING_INVOICES.map((inv) => (
                              <SelectItem key={inv.invoiceNo} value={inv.invoiceNo}>
                                {inv.invoiceNo} (₱{inv.balance.toLocaleString()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={app.amountToApply}
                          onChange={(e) => updateInvoiceApplication(app.id, "amountToApply", e.target.value)}
                          placeholder="0.00"
                          className="h-9 text-right border-[#E5E9F0] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-[14px] font-medium text-[#667085]">
                        ₱{app.remainingBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {invoiceApplications.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInvoiceRow(app.id)}
                            className="h-8 w-8 hover:bg-red-50"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 p-6 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-[11px] text-[#667085] mb-2">Total Received</div>
                  <div className="text-[24px] font-bold text-[#12332B]">
                    ₱{(parseFloat(totalReceived) || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#667085] mb-2">Total Applied</div>
                  <div className="text-[24px] font-bold text-[#0F766E]">
                    ₱{totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#667085] mb-2">Unapplied</div>
                  <div className="text-[24px] font-bold" style={{ color: unapplied > 0 ? "#B06A4F" : "#12332B" }}>
                    ₱{unapplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E9F0] px-8 py-5 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-[#E5E9F0] text-[#12332B] hover:bg-[#F9FAFB] rounded-lg font-medium"
            style={{ height: "44px" }}
          >
            Save as Draft
          </Button>
          <Button
            onClick={handlePost}
            className="bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-lg font-semibold shadow-md"
            style={{ height: "44px" }}
          >
            Post Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
