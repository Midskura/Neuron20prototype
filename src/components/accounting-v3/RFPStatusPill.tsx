import { Clock, FileCheck, ShieldCheck, Stamp, Ban, FileText } from "lucide-react";

export type RFPStatus = "draft" | "submitted" | "verified" | "approved" | "paid" | "cancelled";

interface RFPStatusPillProps {
  status: RFPStatus;
  size?: "sm" | "md";
}

export function RFPStatusPill({ status, size = "md" }: RFPStatusPillProps) {
  const config: Record<
    RFPStatus,
    { label: string; textColor: string; bgColor: string; icon?: React.ReactNode }
  > = {
    draft: {
      label: "Draft",
      textColor: "#4B5563", // Gray 600
      bgColor: "#F3F4F6", // Gray 100
      icon: <FileText className="w-3 h-3" />,
    },
    submitted: {
      label: "Submitted",
      textColor: "#B45309", // Warning 700
      bgColor: "#FEF3C7", // Warning 100
      icon: <Clock className="w-3 h-3" />,
    },
    verified: {
      label: "Verified",
      textColor: "#0A1D4D", // Primary 700
      bgColor: "#DBEAFE", // Primary 100
      icon: <FileCheck className="w-3 h-3" />,
    },
    approved: {
      label: "Approved",
      textColor: "#0A1D4D", // Primary 700
      bgColor: "#EEF2FF", // Primary 100
      icon: <ShieldCheck className="w-3 h-3" />,
    },
    paid: {
      label: "Paid",
      textColor: "#047857", // Success 700
      bgColor: "#D1FAE5", // Success 100
      icon: <Stamp className="w-3 h-3" />,
    },
    cancelled: {
      label: "Cancelled",
      textColor: "#B91C1C", // Danger 700
      bgColor: "#FEE2E2", // Danger 50
      icon: <Ban className="w-3 h-3" />,
    },
  };

  const { label, textColor, bgColor, icon } = config[status];
  const height = size === "sm" ? "22px" : "24px";
  const fontSize = size === "sm" ? "12px" : "13px";
  const padding = size === "sm" ? "0 8px" : "0 10px";

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full max-w-full overflow-hidden"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
        fontWeight: 600,
        height,
        padding,
        lineHeight: "1",
      }}
      role="status"
      aria-label={`RFP Status: ${label}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate whitespace-nowrap">{label}</span>
    </div>
  );
}
