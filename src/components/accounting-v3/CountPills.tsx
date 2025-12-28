interface CountPillsProps {
  entriesCount: number;
  bookingsCount: number;
}

export function CountPills({ entriesCount, bookingsCount }: CountPillsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 flex items-center px-2.5 rounded-full bg-[#F3F4F6] text-[#111827] text-[12px]" style={{ fontWeight: 600 }}>
        Entries • {entriesCount}
      </div>
      <div className="h-7 flex items-center px-2.5 rounded-full bg-[#F3F4F6] text-[#111827] text-[12px]" style={{ fontWeight: 600 }}>
        Bookings • {bookingsCount}
      </div>
    </div>
  );
}
