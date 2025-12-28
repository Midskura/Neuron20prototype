import { useState } from "react";
import { Eye, Copy, FileCheck, FileX, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";

interface Entry {
  id: string;
  type: "revenue" | "expense" | "transfer";
  amount: number;
  category: string;
  categoryColor: string;
  accountId: string;
  accountName: string;
  company: string;
  bookingNo: string;
  note: string;
  date: string;
  status: "draft" | "posted";
}

interface EntriesListProps {
  entries: Entry[];
  onView: (entry: Entry) => void;
  onDuplicate: (entry: Entry) => void;
  onToggleStatus: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}

export function EntriesList({
  entries,
  onView,
  onDuplicate,
  onToggleStatus,
  onDelete,
}: EntriesListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const dateKey = new Date(entry.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, Entry[]>);

  const formatAmount = (amount: number, type: string) => {
    const sign = type === "revenue" ? "+" : type === "expense" ? "-" : "";
    return `${sign}₱${amount.toLocaleString()}`;
  };

  const getAmountColor = (type: string) => {
    if (type === "revenue") return "text-green-600";
    if (type === "expense") return "text-red-600";
    return "text-[#374151]";
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedEntries).map(([dateKey, dateEntries]) => (
        <div key={dateKey}>
          {/* Date Header */}
          <div className="text-[12px] text-[#6B7280] mb-3 px-4">
            {dateKey}
          </div>

          {/* Entries List */}
          <div className="space-y-2">
            {dateEntries.map((entry) => (
              <div
                key={entry.id}
                className="group relative bg-white border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer"
                onMouseEnter={() => setHoveredId(entry.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onView(entry)}
              >
                <div className="flex items-start gap-3">
                  {/* Leading Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: entry.categoryColor + "20" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: entry.categoryColor }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Sub */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[14px] text-[#0A1D4D]">
                          {entry.category}
                        </div>
                        <div className="text-[12px] text-[#6B7280] mt-0.5">
                          {entry.accountName} • {entry.company}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className={`text-[16px] tabular-nums flex-shrink-0 ${getAmountColor(entry.type)}`}>
                        {formatAmount(entry.amount, entry.type)}
                      </div>
                    </div>

                    {/* Second Line */}
                    <div className="text-[12px] text-[#6B7280] mt-2 flex items-center gap-2">
                      <span>Booking {entry.bookingNo}</span>
                      {entry.note && (
                        <>
                          <span>•</span>
                          <span className="truncate">{entry.note}</span>
                        </>
                      )}
                      {entry.status === "draft" && (
                        <Badge variant="outline" className="text-[10px] ml-auto">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Actions */}
                {hoveredId === entry.id && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-[#E5E7EB] p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(entry);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(entry);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(entry);
                      }}
                    >
                      {entry.status === "posted" ? (
                        <FileX className="h-4 w-4" />
                      ) : (
                        <FileCheck className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this entry?")) {
                          onDelete(entry);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
