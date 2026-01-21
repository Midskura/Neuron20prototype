import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import type { Billing } from "../../../types/operations";
import { AddRequestForPaymentPanel } from "../../accounting/AddRequestForPaymentPanel";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "../../ui/toast-utils";

interface BillingsTabProps {
  bookingId: string;
  bookingType?: "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";
  currentUserId?: string;
  currentUserName?: string;
  currentUserDepartment?: string;
  currentUser?: { name: string; email: string; department: string } | null;
  readOnly?: boolean;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

const STATUS_COLORS = {
  "Pending": "bg-gray-100 text-gray-700 border-gray-300",
  "Invoiced": "bg-blue-50 text-blue-700 border-blue-300",
  "Paid": "bg-emerald-50 text-emerald-700 border-emerald-300",
};

export function BillingsTab({ bookingId, bookingType, currentUser, currentUserId, currentUserName, currentUserDepartment, readOnly = false }: BillingsTabProps) {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBillings();
  }, [bookingId]);

  const fetchBillings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/billings?bookingId=${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setBillings(result.data);
      } else {
        console.error('Error fetching billings:', result.error);
        toast.error('Error loading billings');
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
      toast.error('Unable to load billings');
      setBillings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingCreated = () => {
    setShowCreateModal(false);
    fetchBillings();
  };

  const totalAmount = billings.reduce((sum, billing) => sum + billing.amount, 0);
  const paidAmount = billings
    .filter(b => b.status === "Paid")
    .reduce((sum, billing) => sum + billing.amount, 0);

  return (
    <>
      <div style={{ padding: "32px 48px" }}>
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-[#12332B] mb-2">Billings</h3>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#0F766E]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Billing
              </button>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#12332B]/60">Loading billings...</div>
            </div>
          ) : billings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-[#12332B]/10 rounded-lg">
              <div className="text-[#12332B]/60 mb-2">No billings yet</div>
              {!readOnly && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-[#0F766E] hover:underline"
                >
                  Add your first billing
                </button>
              )}
            </div>
          ) : (
            <div className="border border-[#12332B]/10 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#12332B]/[0.02]">
                  <tr className="border-b border-[#12332B]/10">
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Description
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Invoice #
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Invoice Date
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billings.map((billing) => (
                    <tr
                      key={billing.billingId}
                      className="border-b border-[#12332B]/5 hover:bg-[#12332B]/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#12332B]">
                        {billing.description}
                      </td>
                      <td className="px-4 py-3 text-[#12332B]/80">
                        {billing.invoiceNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#12332B]">
                        {billing.currency} {billing.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[billing.status]}`}>
                          {billing.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#12332B]/80">
                        {billing.invoiceDate ? new Date(billing.invoiceDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#12332B]/80">
                        {billing.dueDate ? new Date(billing.dueDate).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <AddRequestForPaymentPanel
          context="billing"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleBillingCreated}
          defaultRequestor={currentUser?.name || currentUserName || "Current User"}
          bookingId={bookingId}
          bookingType={bookingType}
        />
      )}
    </>
  );
}