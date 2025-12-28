import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { CircleDot, Package, Truck, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "./ui/utils";

type DeliveryStatus = "Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled";

interface DeliveryStatusControlProps {
  status: DeliveryStatus;
  onStatusChange: (status: DeliveryStatus) => void;
}

export function DeliveryStatusControl({
  status,
  onStatusChange,
}: DeliveryStatusControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions: Array<{
    value: DeliveryStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    destructive?: boolean;
  }> = [
    { value: "Created", label: "Created", icon: CircleDot, color: "#6B7280" },
    { value: "For Delivery", label: "For Delivery", icon: Package, color: "#0A1D4D" },
    { value: "In Transit", label: "In Transit", icon: Truck, color: "#F25C05" },
    { value: "Delivered", label: "Delivered", icon: CheckCircle2, color: "#10B981" },
    { value: "Cancelled", label: "Cancelled", icon: XCircle, color: "#EF4444", destructive: true },
  ];

  const currentStatus = statusOptions.find((opt) => opt.value === status);
  const CurrentIcon = currentStatus?.icon || Package;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-[#E5E7EB] hover:border-[#0A1D4D] hover:bg-[#0A1D4D]/5 rounded-lg h-10 px-4 min-w-[180px] justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-[#6B7280] font-medium">
              Status:
            </span>
            <CurrentIcon className="w-4 h-4" style={{ color: currentStatus?.color }} />
            <span className="text-[13px]" style={{ color: currentStatus?.color }}>
              {status}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#6B7280] ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {statusOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = option.value === status;

          return (
            <div key={option.value}>
              {index === statusOptions.length - 1 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => {
                  onStatusChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                  option.destructive && "text-red-600 focus:text-red-600",
                  isSelected && "bg-[#F9FAFB]"
                )}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: option.destructive ? undefined : option.color }}
                />
                <span className="text-[13px]">{option.label}</span>
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
