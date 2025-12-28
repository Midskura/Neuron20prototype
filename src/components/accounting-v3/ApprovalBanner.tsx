import { Clock, ShieldCheck, Ban, AlertCircle } from "lucide-react";
import { EntryStatus } from "./StatusPill";

interface ApprovalBannerProps {
  status: EntryStatus;
  approverName?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export function ApprovalBanner({
  status,
  approverName,
  approvalDate,
  rejectionReason,
}: ApprovalBannerProps) {
  if (status === "draft" || status === "posted") {
    return null;
  }

  const configs: Record<
    Exclude<EntryStatus, "draft" | "posted">,
    {
      icon: React.ReactNode;
      bgColor: string;
      borderColor: string;
      textColor: string;
      iconColor: string;
      title: string;
      message: string;
    }
  > = {
    pending: {
      icon: <Clock className="w-5 h-5 flex-shrink-0" />,
      bgColor: "#FFFBEB",
      borderColor: "#FEF3C7",
      textColor: "#78350F",
      iconColor: "#B45309",
      title: "Waiting for approval",
      message: "You can edit notes and attachments; core fields are locked.",
    },
    approved: {
      icon: <ShieldCheck className="w-5 h-5 flex-shrink-0" />,
      bgColor: "#EEF2FF",
      borderColor: "#E0E7FF",
      textColor: "#0A1D4D",
      iconColor: "#0A1D4D",
      title: `Approved by ${approverName || "Approver"}${approvalDate ? ` on ${approvalDate}` : ""}`,
      message: "Ready to post.",
    },
    rejected: {
      icon: <Ban className="w-5 h-5 flex-shrink-0" />,
      bgColor: "#FEE2E2",
      borderColor: "#FECACA",
      textColor: "#7F1D1D",
      iconColor: "#B91C1C",
      title: `Rejected by ${approverName || "Approver"}`,
      message: rejectionReason || "No reason provided.",
    },
  };

  const config = configs[status as Exclude<EntryStatus, "draft" | "posted">];

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border mb-4"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <div style={{ color: config.iconColor }}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p
          className="mb-1"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: config.textColor,
            lineHeight: "1.4",
          }}
        >
          {config.title}
        </p>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: config.textColor,
            lineHeight: "1.4",
            opacity: 0.9,
          }}
        >
          {config.message}
        </p>
      </div>
    </div>
  );
}
