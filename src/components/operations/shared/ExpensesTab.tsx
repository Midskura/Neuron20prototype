import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import type { Expense } from "../../../types/operations";
import { CreateExpenseModal } from "./CreateExpenseModal";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "../../ui/toast-utils";

interface ExpensesTabProps {
  bookingId: string;
  bookingType: "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";
  currentUser?: { name: string; email: string; department: string } | null;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

const STATUS_COLORS = {
  "Pending": "bg-gray-100 text-gray-700 border-gray-300",
  "Approved": "bg-blue-50 text-blue-700 border-blue-300",
  "Paid": "bg-emerald-50 text-emerald-700 border-emerald-300",
};

export function ExpensesTab({ bookingId, bookingType, currentUser }: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [bookingId]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/expenses?bookingId=${bookingId}`, {
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
        setExpenses(result.data);
      } else {
        console.error('Error fetching expenses:', result.error);
        toast.error('Error loading expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Unable to load expenses');
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseCreated = () => {
    setShowCreateModal(false);
    fetchExpenses();
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidAmount = expenses
    .filter(e => e.status === "Paid")
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <>
      <div style={{ padding: "32px 48px" }}>
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-[#12332B] mb-2">Expenses</h3>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#0F766E]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#12332B]/60">Loading expenses...</div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-[#12332B]/10 rounded-lg">
              <div className="text-[#12332B]/60 mb-2">No expenses yet</div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-[#0F766E] hover:underline"
              >
                Add your first expense
              </button>
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
                      Vendor
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-[#12332B]/60 font-medium text-sm">
                      Expense Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.expenseId}
                      className="border-b border-[#12332B]/5 hover:bg-[#12332B]/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#12332B]">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 text-[#12332B]/80">
                        {expense.vendor || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#12332B]/80">
                        {expense.category || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#12332B]">
                        {expense.currency} {expense.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[expense.status]}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#12332B]/80">
                        {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : "—"}
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
        <CreateExpenseModal
          bookingId={bookingId}
          bookingType={bookingType}
          onClose={() => setShowCreateModal(false)}
          onExpenseCreated={handleExpenseCreated}
        />
      )}
    </>
  );
}