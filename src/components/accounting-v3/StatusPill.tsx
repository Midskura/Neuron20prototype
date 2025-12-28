import { Clock, ShieldCheck, FileCheck, FileText, Ban } from "lucide-react";

export type EntryStatus = "draft" | "pending" | "approved" | "posted" | "rejected";

interface StatusPillProps {
  status: EntryStatus;
  size?: "sm" | "md";
}

export function StatusPill({ status, size = "md" }: StatusPillProps) {
  const config: Record<
    EntryStatus,
    { label: string; textColor: string; bgColor: string; icon?: React.ReactNode }
  > = {
    draft: {
      label: "Draft",
      textColor: "#4B5563", // Gray 600
      bgColor: "#F3F4F6", // Gray 100
    },
    pending: {
      label: "Pending approval",
      textColor: "#B45309", // Warning 700
      bgColor: "#FEF3C7", // Warning 100
      icon: <Clock className="w-3 h-3" />,
    },
    approved: {
      label: "Approved",
      textColor: "#0A1D4D", // Primary 700
      bgColor: "#EEF2FF", // Primary 100
      icon: <ShieldCheck className="w-3 h-3" />,
    },
    posted: {
      label: "Posted",
      textColor: "#047857", // Success 700
      bgColor: "#D1FAE5", // Success 100
      icon: <FileCheck className="w-3 h-3" />,
    },
    rejected: {
      label: "Rejected",
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
      aria-label={`Status: ${label}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate whitespace-nowrap">{label}</span>
    </div>
  );
}
