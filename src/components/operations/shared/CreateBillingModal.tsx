import { useState } from "react";
import { X } from "lucide-react";
import type { Billing } from "../../../types/operations";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "../../ui/toast-utils";

interface CreateBillingModalProps {
  bookingId: string;
  bookingType: "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";
  onClose: () => void;
  onBillingCreated: () => void;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function CreateBillingModal({
  bookingId,
  bookingType,
  onClose,
  onBillingCreated
}: CreateBillingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("PHP");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"Pending" | "Invoiced" | "Paid">("Pending");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount) {
      toast.error("Description and Amount are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const billingData: Partial<Billing> = {
        bookingId,
        bookingType,
        description,
        amount: parseFloat(amount),
        currency,
        invoiceNumber: invoiceNumber || undefined,
        invoiceDate: invoiceDate || undefined,
        dueDate: dueDate || undefined,
        status,
        paymentDate: paymentDate || undefined,
        notes: notes || undefined,
      };

      const response = await fetch(`${API_URL}/billings`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(billingData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Billing created successfully");
        onBillingCreated();
      } else {
        toast.error("Error creating billing: " + result.error);
      }
    } catch (error) {
      console.error('Error creating billing:', error);
      toast.error('Unable to create billing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#12332B]/10">
          <h2 className="text-[#12332B]">Add Billing</h2>
          <button
            onClick={onClose}
            className="text-[#12332B]/40 hover:text-[#12332B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[#12332B]/80 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Freight charges, Handling fees"
                className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[#12332B]/80 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                >
                  <option value="PHP">PHP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g., INV-2025-001"
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Pending" | "Invoiced" | "Paid")}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Invoiced">Invoiced</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            </div>

            {status === "Paid" && (
              <div>
                <label className="block text-[#12332B]/80 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>
            )}

            <div>
              <label className="block text-[#12332B]/80 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes or comments..."
                className="w-full px-3 py-2 border border-[#12332B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#12332B]/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[#12332B] hover:bg-[#12332B]/5 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#0F766E]/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Billing"}
          </button>
        </div>
      </div>
    </div>
  );
}
