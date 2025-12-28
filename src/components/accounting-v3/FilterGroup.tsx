import { useState, useRef, useEffect } from "react";
import { RotateCcw, Search, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { COMPANIES } from "./companies";

interface FilterGroupProps {
  bookingNo: string;
  onBookingNoChange: (value: string) => void;
  company: string[];
  onCompanyChange: (values: string[]) => void;
  type: string;
  onTypeChange: (value: string) => void;
  account: string;
  onAccountChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  companyOptions: Array<{ value: string; label: string }>;
  accountOptions: Array<{ value: string; label: string }>;
  categoryOptions: Array<{ value: string; label: string }>;
  bookingSuggestions?: string[];
}

export function FilterGroup({
  bookingNo,
  onBookingNoChange,
  company,
  onCompanyChange,
  type,
  onTypeChange,
  account,
  onAccountChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  onClearFilters,
  companyOptions,
  accountOptions,
  categoryOptions,
  bookingSuggestions = [],
}: FilterGroupProps) {
  const [isCompanyPopoverOpen, setIsCompanyPopoverOpen] = useState(false);
  const [bookingSearch, setBookingSearch] = useState(bookingNo);
  const [companySearch, setCompanySearch] = useState("");

  const hasActiveFilters = bookingNo || company.length > 0 || type !== "all" || account !== "all" || category !== "all" || status !== "all";

  // Filter companies by search
  const filteredCompanies = COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredBookings = bookingSuggestions.filter((b) =>
    b.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  // Track scroll state for fade effects
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: true });

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setScrollState({
        atStart: scrollLeft <= 0,
        atEnd: scrollLeft + clientWidth >= scrollWidth - 1,
      });
    };

    updateScrollState();
    element.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      element.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* FiltersHeader */}
      <div 
        className="flex items-center justify-between"
        style={{ 
          paddingTop: "8px", 
          paddingRight: "12px", 
          paddingLeft: "12px" 
        }}
      >
        <span className="text-[13px]" style={{ color: "#6B7280" }}>
          Filters
        </span>
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D]"
          style={{
            backgroundColor: hasActiveFilters ? "#FEF3F2" : "#F9FAFB",
            color: hasActiveFilters ? "#F25C05" : "#9CA3AF",
          }}
          title="Reset filters"
          onMouseEnter={(e) => {
            if (hasActiveFilters) {
              e.currentTarget.style.backgroundColor = "#FEE2E2";
            }
          }}
          onMouseLeave={(e) => {
            if (hasActiveFilters) {
              e.currentTarget.style.backgroundColor = "#FEF3F2";
            }
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Controls Row - Single horizontal auto-layout */}
      <div className="relative" style={{ paddingLeft: "12px", paddingRight: "12px" }}>
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
          style={{
            height: "40px",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {/* Booking No - Type-ahead */}
          <div className="relative flex-shrink-0" style={{ width: "280px" }}>
            <Input
              placeholder="Search booking…"
              value={bookingSearch}
              onChange={(e) => {
                setBookingSearch(e.target.value);
                onBookingNoChange(e.target.value);
              }}
              className="h-10 text-[13px] border-neutral-300 focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
              style={{
                borderRadius: "999px",
                paddingLeft: "12px",
                paddingRight: "12px",
                color: "#1F2937",
              }}
            />
            {filteredBookings.length > 0 && bookingSearch && (
              <div className="absolute top-full mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {filteredBookings.slice(0, 5).map((booking) => (
                  <button
                    key={booking}
                    className="w-full px-3 py-2 text-left text-[13px] hover:bg-neutral-50 text-neutral-700"
                    onClick={() => {
                      setBookingSearch(booking);
                      onBookingNoChange(booking);
                    }}
                  >
                    {booking}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company - Multi-select */}
          <Popover open={isCompanyPopoverOpen} onOpenChange={setIsCompanyPopoverOpen}>
            <PopoverTrigger asChild>
              <button 
                className="h-10 text-[13px] justify-between px-3 inline-flex items-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0A1D4D] flex-shrink-0"
                style={{
                  width: "200px",
                  borderRadius: "999px",
                  color: "#1F2937",
                }}
              >
                <span className="truncate flex-1 text-left">
                  Company
                  {company.length > 0 && (
                    <span className="ml-1" style={{ color: "#6B7280" }}>({company.length})</span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ opacity: 0.5 }} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="p-3 z-50 md:w-[280px] w-[320px]" 
              align="start"
              style={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
            >
              <div className="space-y-3">
                {/* Search field */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                  <Input
                    placeholder="Search companies…"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="h-7 pl-7 pr-2 text-[12px] border-neutral-300 rounded-lg focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
                  />
                </div>

                {/* Company list */}
                <div className="space-y-1 max-h-[240px] overflow-y-auto">
                  {filteredCompanies.map((companyItem) => (
                    <div 
                      key={companyItem.id} 
                      className="flex items-start gap-2 min-h-[36px] py-1.5 hover:bg-[#F9FAFB] rounded-md px-1 transition-colors"
                    >
                      <Checkbox
                        id={`company-${companyItem.id}`}
                        checked={company.includes(companyItem.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onCompanyChange([...company, companyItem.id]);
                          } else {
                            onCompanyChange(company.filter((c) => c !== companyItem.id));
                          }
                        }}
                        className="mt-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1D4D]"
                      />
                      <Label
                        htmlFor={`company-${companyItem.id}`}
                        className="text-[12px] cursor-pointer leading-snug text-[#111827] flex-1"
                        style={{ 
                          fontWeight: 500,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxHeight: '32px',
                        }}
                      >
                        {companyItem.name}
                      </Label>
                    </div>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <div className="text-[12px] text-[#9CA3AF] text-center py-4">
                      No companies found
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Type */}
          <div className="flex-shrink-0" style={{ width: "140px" }}>
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger 
                className="h-10 text-[13px] border-neutral-300 focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
                style={{
                  borderRadius: "999px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  color: "#1F2937",
                }}
              >
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="flex-shrink-0" style={{ width: "180px" }}>
            <Select value={account} onValueChange={onAccountChange}>
              <SelectTrigger 
                className="h-10 text-[13px] border-neutral-300 focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
                style={{
                  borderRadius: "999px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  color: "#1F2937",
                }}
              >
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="flex-shrink-0" style={{ width: "180px" }}>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger 
                className="h-10 text-[13px] border-neutral-300 focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
                style={{
                  borderRadius: "999px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  color: "#1F2937",
                }}
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex-shrink-0" style={{ width: "140px" }}>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger 
                className="h-10 text-[13px] border-neutral-300 focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
                style={{
                  borderRadius: "999px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  color: "#1F2937",
                }}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scroll fade effect - left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 pointer-events-none transition-opacity"
          style={{
            width: "16px",
            background: "linear-gradient(to right, white, transparent)",
            opacity: scrollState.atStart ? 0 : 1,
          }}
        />

        {/* Scroll fade effect - right edge */}
        <div
          className="absolute right-0 top-0 bottom-0 pointer-events-none transition-opacity"
          style={{
            width: "16px",
            background: "linear-gradient(to left, white, transparent)",
            opacity: scrollState.atEnd ? 0 : 1,
          }}
        />
      </div>
    </div>
  );
}
