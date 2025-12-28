import { Skeleton } from "../ui/skeleton";

export function EntriesTableSkeleton() {
  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white">
      {/* Table Header */}
      <div
        className="grid gap-3 px-4 h-10 items-center border-b border-[#E5E7EB] bg-white"
        style={{
          gridTemplateColumns: "28px 150px 110px 85px 135px 135px 110px 75px 50px 130px",
        }}
      >
        <div className="text-[11px] font-semibold uppercase text-[#6B7280] text-center"></div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Category</div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Booking No</div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280] text-center">Type</div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Account</div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280]">Company</div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280] text-right">Amount</div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280] text-center">Status</div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280] text-center"></div>
        <div className="text-[11px] font-semibold uppercase text-[#6B7280] text-right">Actions</div>
      </div>

      {/* Date Header Skeleton */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-4 py-2">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Row Skeletons */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="grid gap-3 px-4 h-11 items-center border-b border-[#E5E7EB] bg-white"
          style={{
            gridTemplateColumns: "28px 150px 110px 85px 135px 135px 110px 75px 50px 130px",
          }}
        >
          <Skeleton className="h-5 w-5 rounded-full mx-auto" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <div className="flex justify-center">
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <div className="flex justify-end">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex justify-end gap-0.5">
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-7 w-7" />
          </div>
        </div>
      ))}
    </div>
  );
}
