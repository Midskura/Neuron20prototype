import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface MonthNavigatorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthNavigator({ currentDate, onPrevMonth, onNextMonth }: MonthNavigatorProps) {
  const monthYear = currentDate.toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevMonth}
        className="h-8 w-8 rounded-lg text-[#374151] hover:bg-[#F9FAFB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 600 }}>
        {monthYear}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="h-8 w-8 rounded-lg text-[#374151] hover:bg-[#F9FAFB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
