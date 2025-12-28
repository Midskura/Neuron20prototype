import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  // If your shadcn popover doesn't export PopoverAnchor, use:
  // PopoverAnchor as RadixPopoverAnchor
  PopoverAnchor,
} from "../ui/popover";
// import { PopoverAnchor as RadixPopoverAnchor } from "@radix-ui/react-popover";
import {
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Link2,
  Search,
  X,
  Check,
} from "lucide-react";
import { searchBookings, Booking, MOCK_BOOKINGS } from "./bookings-data";
import { getCompanyById } from "./companies";
import { format } from "date-fns";

interface BookingPickerProps {
  value: string;
  onChange: (bookingNo: string) => void;
  companyId: string;
  entryDate?: Date;
  error?: string;
  disabled?: boolean;
  onVerificationChange?: (isVerified: boolean) => void;
}

type DateFilter = "today" | "yesterday" | "last7days" | null;

export function BookingPicker({
  value,
  onChange,
  companyId,
  entryDate,
  error,
  disabled,
  onVerificationChange,
}: BookingPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("last7days");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const popoverInnerRef = useRef<HTMLDivElement>(null);

  // Verified / unverified
  const selectedBooking = MOCK_BOOKINGS.find((b) => b.bookingNo === value);
  const isVerified = !!(selectedBooking && selectedBooking.companyId === companyId);
  const isUnverified = !!value && !isVerified;

  useEffect(() => {
    onVerificationChange?.(isVerified);
  }, [isVerified, onVerificationChange]);

  // Responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open || !companyId) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      const filtered = searchBookings(
        searchQuery || inputValue,
        companyId,
        dateFilter,
        statusFilters,
        entryDate
      );
      setResults(filtered);
      setSelectedIndex(filtered.length ? 0 : -1);
    }, 200);
    return () => clearTimeout(t);
  }, [open, companyId, searchQuery, inputValue, dateFilter, statusFilters, entryDate]);

  // Resolve booking from free text
  const tryResolveBooking = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        onChange("");
        setInputValue("");
        return;
      }
      const b = MOCK_BOOKINGS.find(
        (bk) => bk.bookingNo.toLowerCase() === trimmed.toLowerCase()
      );
      if (b && b.companyId === companyId) {
        onChange(b.bookingNo); // verified
      } else {
        onChange(trimmed); // unverified
      }
      setInputValue("");
    },
    [companyId, onChange]
  );

  const handleReset = () => {
    setDateFilter("last7days");
    setStatusFilters([]);
    setSearchQuery("");
  };

  const handleSelectBooking = (b: Booking) => {
    onChange(b.bookingNo);
    setInputValue("");
    setOpen(false);
    setSearchQuery("");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleVerify = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) tryResolveBooking(value);
  };

  const handleChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue(value);
    onChange("");
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Input keyboard
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectBooking(results[selectedIndex]);
      } else if (inputValue.trim()) {
        tryResolveBooking(inputValue);
        setOpen(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Backspace" && !inputValue && value) {
      e.preventDefault();
      onChange("");
    }
  };

  // Panel keyboard
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectBooking(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const txt = e.clipboardData.getData("text");
    if (!txt) return;
    setTimeout(() => {
      tryResolveBooking(txt);
      setOpen(false);
    }, 0);
  };

  // Scroll selected into view
  useEffect(() => {
    if (!open || selectedIndex < 0) return;
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [open, selectedIndex]);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const company = getCompanyById(companyId);
  const hasConflict = selectedBooking && selectedBooking.companyId !== companyId;
  const dateFilterLabel =
    dateFilter === "today"
      ? "Today"
      : dateFilter === "yesterday"
      ? "Yesterday"
      : dateFilter === "last7days"
      ? "Last 7 days"
      : "";

  return (
    <div>
      {/* If using RadixPopoverAnchor instead, replace PopoverAnchor below */}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverAnchor asChild>
          <div className="relative">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] z-10 pointer-events-none" />
              {/* Selected booking pill */}
              {value && (
                <div
                  className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-[#F3F4F6] rounded-md max-w-[calc(100%-120px)] z-10 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isVerified && selectedBooking ? (
                    <>
                      <span className="truncate text-[#0A1D4D]" style={{ fontSize: 13, fontWeight: 600 }}>
                        {selectedBooking.bookingNo}
                      </span>
                      <span className="text-[#6B7280]">•</span>
                      <span className="truncate text-[#6B7280]" style={{ fontSize: 13 }}>
                        {selectedBooking.client}
                      </span>
                      <span className="text-[#6B7280] hidden sm:inline">•</span>
                      <span className="truncate text-[#6B7280] hidden sm:inline" style={{ fontSize: 13 }}>
                        {selectedBooking.routeFrom} → {selectedBooking.routeTo}
                      </span>
                      {selectedBooking.eta && (
                        <>
                          <span className="text-[#6B7280] hidden md:inline">•</span>
                          <span className="truncate text-[#6B7280] hidden md:inline" style={{ fontSize: 13 }}>
                            {format(selectedBooking.eta, "MMM d")}
                          </span>
                        </>
                      )}
                      <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                        <button
                          className="hover:bg-[#D1D5DB] rounded p-0.5 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title="View booking"
                          disabled={disabled}
                          type="button"
                        >
                          <ExternalLink className="w-3 h-3 text-[#6B7280]" />
                        </button>
                        <button
                          className="hover:bg-[#D1D5DB] rounded p-0.5 transition-colors"
                          onClick={handleChange}
                          title="Change"
                          disabled={disabled}
                          type="button"
                        >
                          <Search className="w-3 h-3 text-[#6B7280]" />
                        </button>
                        <button
                          className="hover:bg-[#D1D5DB] rounded p-0.5 transition-colors"
                          onClick={handleRemove}
                          title="Remove"
                          disabled={disabled}
                          type="button"
                        >
                          <X className="w-3 h-3 text-[#6B7280]" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="truncate text-[#0A1D4D]" style={{ fontSize: 13, fontWeight: 600 }}>
                        {value}
                      </span>
                      <div
                        className="px-1.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] flex-shrink-0"
                        style={{ fontSize: 10, fontWeight: 600 }}
                      >
                        Unverified
                      </div>
                      <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                        <button
                          className="hover:bg-[#D1D5DB] rounded px-1.5 py-0.5 transition-colors"
                          onClick={handleVerify}
                          title="Verify"
                          disabled={disabled}
                          type="button"
                        >
                          <Check className="w-3 h-3 text-[#6B7280]" />
                        </button>
                        <button
                          className="hover:bg-[#D1D5DB] rounded p-0.5 transition-colors"
                          onClick={handleChange}
                          title="Change"
                          disabled={disabled}
                          type="button"
                        >
                          <Search className="w-3 h-3 text-[#6B7280]" />
                        </button>
                        <button
                          className="hover:bg-[#D1D5DB] rounded p-0.5 transition-colors"
                          onClick={handleRemove}
                          title="Remove"
                          disabled={disabled}
                          type="button"
                        >
                          <X className="w-3 h-3 text-[#6B7280]" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!open && companyId) setOpen(true);
                }}
                onKeyDown={handleInputKeyDown}
                onPaste={handlePaste}
                onFocus={() => {
                  if (companyId) setOpen(true);
                }}
                // Open on pointer down to beat outside handlers
                onPointerDown={() => {
                  if (companyId) setOpen(true);
                }}
                placeholder="Search or paste booking no., client, or route"
                disabled={disabled || !companyId}
                className={`h-12 ${
                  value ? "pl-10 pr-9 text-transparent caret-black" : "pl-10 pr-9"
                } border-[#D1D5DB] hover:border-[#C7CBD1] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] focus-visible:ring-offset-2 rounded-[10px] ${
                  error ? "border-[#B91C1C]" : ""
                } ${!companyId ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ fontSize: 14 }}
                title={!companyId ? "Select a company first" : undefined}
                role="combobox"
                aria-expanded={open}
                aria-controls="booking-listbox"
                aria-autocomplete="list"
              />
            </div>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6B7280] pointer-events-none" />
          </div>
        </PopoverAnchor>

        <PopoverContent
          className="p-0 md:w-[560px] w-screen border-[#E5E7EB] animate-in fade-in-0 zoom-in-95"
          align="start"
          style={{
            borderRadius: isMobile ? "0" : "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          }}
          onKeyDown={handleSearchKeyDown}
          onOpenAutoFocus={(e) => {
            // keep focus where we want it, not Radix default
            e.preventDefault();
            searchInputRef.current?.focus();
          }}
          // Do NOT close if pointer starts on input or inside panel
          onPointerDownOutside={(e) => {
            const t = e.target as Node;
            if (inputRef.current?.contains(t) || popoverInnerRef.current?.contains(t)) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            const t = e.target as Node;
            if (inputRef.current?.contains(t) || popoverInnerRef.current?.contains(t)) {
              e.preventDefault();
              return;
            }
            setOpen(false);
          }}
        >
          <div
            ref={popoverInnerRef}
            className="flex flex-col gap-2 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
              <Input
                ref={searchInputRef}
                placeholder="Type booking no., client, or route"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 border-[#D1D5DB] rounded-lg focus-visible:border-[#0A1D4D] focus-visible:ring-[#0A1D4D]/20"
                style={{ fontSize: 14 }}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="h-7 px-2.5 rounded-full bg-[#0A1D4D] text-white flex items-center gap-1.5"
                style={{ fontSize: 12, fontWeight: 600 }}
                title={company?.name}
              >
                {company?.code || companyId.toUpperCase()}
              </div>
              {(["today", "yesterday", "last7days"] as DateFilter[]).map((d) => (
                <button
                  key={d ?? "none"}
                  type="button"
                  className={`h-7 px-2.5 rounded-full transition-colors ${
                    dateFilter === d
                      ? "bg-[#0A1D4D] text-white"
                      : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                  }`}
                  style={{ fontSize: 12, fontWeight: 600 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateFilter(dateFilter === d ? null : d);
                  }}
                >
                  {d === "today" ? "Today" : d === "yesterday" ? "Yesterday" : "Last 7 days"}
                </button>
              ))}
              {["Delivered", "Closed"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`h-7 px-2.5 rounded-full transition-colors ${
                    statusFilters.includes(s)
                      ? "bg-[#0A1D4D] text-white"
                      : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                  }`}
                  style={{ fontSize: 12, fontWeight: 600 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatusFilter(s);
                  }}
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                className="ml-auto text-[#6B7280] hover:text-[#374151]"
                style={{ fontSize: 12, fontWeight: 500 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
              >
                Reset
              </button>
            </div>

            {/* Conflict banner */}
            {hasConflict && (
              <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
                <AlertCircle className="w-4 h-4 text-[#B91C1C] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#B91C1C]" style={{ fontSize: 12, fontWeight: 600 }}>
                    This booking belongs to a different company.
                  </p>
                  <p className="text-[#B91C1C] mt-0.5" style={{ fontSize: 11 }}>
                    Expected: {company?.name}
                  </p>
                </div>
              </div>
            )}

            {/* Results list */}
            <div
              ref={listRef}
              id="booking-listbox"
              role="listbox"
              className="flex flex-col gap-1 max-h-[320px] overflow-y-auto -mx-3 px-3"
            >
              {!companyId && (
                <EmptyState
                  iconBg="#FEF3C7"
                  iconColor="#92400E"
                  title="Select a company first"
                  subtitle="Bookings are filtered by company."
                />
              )}

              {companyId && results.length === 0 && (
                <EmptyState
                  iconBg="#F3F4F6"
                  iconColor="#9CA3AF"
                  title="No matches found"
                  subtitle="Try a different client, route, or date."
                  cta={
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 h-8 border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] rounded-lg"
                      style={{ fontSize: 12, fontWeight: 600 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Create booking
                    </Button>
                  }
                />
              )}

              {results.map((b, i) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  isSelected={i === selectedIndex}
                  onClick={() => handleSelectBooking(b)}
                  onMouseEnter={() => setSelectedIndex(i)}
                />
              ))}
            </div>

            {/* Footer */}
            {companyId && (
              <div className="flex md:flex-row flex-col md:items-center items-start justify-between md:gap-4 gap-2 pt-2 border-t border-[#E5E7EB]">
                {results.length > 0 && (
                  <p className="text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>
                    Showing results for {company?.code || companyId.toUpperCase()}
                    {dateFilterLabel && ` • ${dateFilterLabel}`}
                  </p>
                )}
                <div className="flex items-center gap-2 md:ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB]"
                    style={{ fontSize: 12, fontWeight: 600 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange("");
                      setInputValue("");
                      setOpen(false);
                    }}
                  >
                    Save without link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 border-[#D1D5DB] hover:border-[#C7CBD1] hover:bg-[#F9FAFB] rounded-lg"
                    style={{ fontSize: 12, fontWeight: 600 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Create booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="mt-1 text-[#B91C1C]" style={{ fontSize: 12 }}>
          {error}
        </p>
      )}
      {!error && !companyId && (
        <p className="mt-1 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>
          Select a company to link a booking
        </p>
      )}
      {!error && isUnverified && (
        <p className="mt-1 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>
          Save as Draft to keep this number. Verify to post.
        </p>
      )}
    </div>
  );
}

function EmptyState({
  iconBg,
  iconColor,
  title,
  subtitle,
  cta,
}: {
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: iconBg }}>
        <Search className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      <p className="text-[#0A1D4D] mb-1" style={{ fontSize: 14, fontWeight: 600 }}>
        {title}
      </p>
      <p className="text-[#6B7280] text-center" style={{ fontSize: 12 }}>
        {subtitle}
      </p>
      {cta}
    </div>
  );
}

interface BookingRowProps {
  booking: Booking;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function BookingRow({ booking, isSelected, onClick, onMouseEnter }: BookingRowProps) {
  const statusColors = {
    "For delivery": { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
    "In transit": { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
    Delivered: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
    Closed: { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" },
  } as const;

  const statusStyle = statusColors[booking.status];
  const formattedAmount = booking.amount ? `₱${booking.amount.toLocaleString()}` : "—";
  const amountColor =
    booking.amount && booking.amount > 0 ? "#059669" : "#6B7280";

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={`w-full min-height-[56px] p-3 rounded-lg text-left transition-all ${
        isSelected ? "bg-[#F9FAFB] border border-[#0A1D4D]" : "border border-transparent hover:bg-[#F9FAFB]"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[#0A1D4D]" style={{ fontSize: 14, fontWeight: 600 }}>
              {booking.bookingNo}
            </p>
            {booking.linkedEntriesCount > 0 && (
              <div
                className="px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {booking.linkedEntriesCount}{" "}
                {booking.linkedEntriesCount === 1 ? "entry" : "entries"}
              </div>
            )}
          </div>
          <p className="text-[#6B7280] truncate" style={{ fontSize: 12, fontWeight: 500 }}>
            {booking.client} • {booking.routeFrom} → {booking.routeTo} •{" "}
            {booking.eta ? format(booking.eta, "MMM d") : format(booking.date, "MMM d")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div
            className="px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: statusStyle.bg,
              borderColor: statusStyle.border,
              fontSize: 11,
              fontWeight: 600,
              color: statusStyle.text,
            }}
          >
            {booking.status}
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: amountColor }}>{formattedAmount}</p>
        </div>
      </div>
    </button>
  );
}
