import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Paperclip, FileText } from "lucide-react";

interface ApproveRejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: {
    payee?: string;
    amount: number;
    company: string;
    category: string;
    bookingNo?: string;
    note: string;
    attachments?: number;
  };
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ApproveRejectModal({
  open,
  onOpenChange,
  entry,
  onApprove,
  onReject,
}: ApproveRejectModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = () => {
    onApprove();
    onOpenChange(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }
    onReject(rejectionReason);
    onOpenChange(false);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[520px] max-w-[92vw] p-0 gap-0 border-[#E5E7EB] rounded-2xl"
        style={{ boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
        aria-describedby={undefined}
      >
        <DialogHeader className="px-5 py-4 border-b border-[#E5E7EB]">
          <DialogTitle className="text-[#0A1D4D]" style={{ fontSize: "18px", fontWeight: 700 }}>
            {showRejectForm ? "Reject expense?" : "Approve expense?"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4">
          {!showRejectForm ? (
            <div className="space-y-3">
              {/* Payee & Amount */}
              <div className="flex items-baseline justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[#6B7280] mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    PAYEE
                  </p>
                  <p className="text-[#0A1D4D] truncate" style={{ fontSize: "16px", fontWeight: 600 }}>
                    {entry.payee || "—"}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-[#6B7280] mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    AMOUNT
                  </p>
                  <p className="text-[#0A1D4D]" style={{ fontSize: "20px", fontWeight: 700 }}>
                    ₱{entry.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-[#6B7280] mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    CATEGORY
                  </p>
                  <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 500 }}>
                    {entry.category}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B7280] mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    COMPANY
                  </p>
                  <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 500 }}>
                    {entry.company}
                  </p>
                </div>
              </div>

              {/* Booking No */}
              {entry.bookingNo && (
                <div className="pt-1">
                  <p className="text-[#6B7280] mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    BOOKING
                  </p>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F3F4F6]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-[#374151] font-mono" style={{ fontSize: "13px", fontWeight: 500 }}>
                      {entry.bookingNo}
                    </span>
                  </div>
                </div>
              )}

              {/* Note */}
              {entry.note && (
                <div className="pt-1">
                  <p className="text-[#6B7280] mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    NOTE
                  </p>
                  <p className="text-[#374151]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.5" }}>
                    {entry.note}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {entry.attachments && entry.attachments > 0 && (
                <div className="pt-1 flex items-center gap-2 text-[#6B7280]" style={{ fontSize: "13px", fontWeight: 500 }}>
                  <Paperclip className="w-4 h-4" />
                  <span>{entry.attachments} receipt{entry.attachments > 1 ? "s" : ""} attached</span>
                </div>
              )}

              {!entry.attachments || entry.attachments === 0 && (
                <div className="pt-1 text-[#D97706]" style={{ fontSize: "13px", fontWeight: 500 }}>
                  ⚠ No receipts attached
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label className="text-[#374151] mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                Reason (required)
              </Label>
              <Textarea
                placeholder="Explain why this expense cannot be approved..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px] border-[#D1D5DB] focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2 rounded-[10px]"
                style={{ fontSize: "14px" }}
                autoFocus
              />
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
          {!showRejectForm ? (
            <>
              <Button
                variant="outline"
                className="h-10 border-[#B91C1C] text-[#B91C1C] hover:bg-[#FEE2E2] hover:border-[#B91C1C] rounded-[10px]"
                style={{ fontSize: "14px", fontWeight: 600 }}
                onClick={() => setShowRejectForm(true)}
              >
                Reject
              </Button>
              <Button
                className="h-10 bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-[10px]"
                style={{ fontSize: "14px", fontWeight: 600 }}
                onClick={handleApprove}
              >
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-10 border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-[10px]"
                style={{ fontSize: "14px", fontWeight: 600 }}
                onClick={() => setShowRejectForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-10 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-[10px]"
                style={{ fontSize: "14px", fontWeight: 600 }}
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
