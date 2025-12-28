import { EntryStatus } from "./StatusPill";

interface StatusFilterPillsProps {
  selected: "all" | EntryStatus;
  onChange: (status: "all" | EntryStatus) => void;
}

export function StatusFilterPills({ selected, onChange }: StatusFilterPillsProps) {
  const statuses: Array<{ value: "all" | EntryStatus; label: string }> = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "posted", label: "Posted" },
  ];

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Filter by status">
      {statuses.map((status, index) => (
        <button
          key={status.value}
          onClick={() => onChange(status.value)}
          className={`h-9 px-3.5 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D] ${
            selected === status.value
              ? "bg-[#EEF2FF] border-[#0A1D4D] text-[#0A1D4D]"
              : "bg-white border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#C7CBD1] hover:text-[#374151]"
          }`}
          style={{ fontWeight: 600, fontSize: "14px" }}
          aria-pressed={selected === status.value}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && index < statuses.length - 1) {
              e.preventDefault();
              onChange(statuses[index + 1].value);
            } else if (e.key === "ArrowLeft" && index > 0) {
              e.preventDefault();
              onChange(statuses[index - 1].value);
            }
          }}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}
