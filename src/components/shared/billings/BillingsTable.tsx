import { Receipt, Plus, DollarSign, LoaderCircle, ChevronDown, ChevronRight, Briefcase, Ship, Truck, Shield, Package, ChevronsUpDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
// Shared Components
import { PricingTableHeader } from "../pricing/PricingTableHeader";
import { UniversalPricingRow, PricingItemData } from "../pricing/UniversalPricingRow";
// Pricing Components & Types
import { CategoryHeader } from "../../pricing/quotations/CategoryHeader";
import type { SellingPriceCategory } from "../../../types/pricing";
import { getServiceIcon } from "../../../utils/quotation-helpers";

export interface BillingTableItem {
  id: string;
  category: string;
  serviceType: string;
  description: string;
  status: string; // 'unbilled', 'billed', 'paid'
  amount: number;
  currency: string;
  date: string;
  originalData?: any;
}

interface BillingsTableProps {
  data: BillingTableItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  footerSummary?: {
    label: string;
    amount: number;
    currency?: string;
  };
  grossSummary?: {
    label: string;
    amount: number;
    currency?: string;
  };
  viewMode?: boolean; 
  onRowClick?: (item: any) => void;
  onItemChange?: (id: string, field: string, value: any) => void;
  // Phase 3: Category Management Handlers
  activeCategories?: Set<string>;
  onAddCategory?: (name: string) => void;
  onRenameCategory?: (oldName: string, newName: string) => void;
  onDeleteCategory?: (name: string) => void;
  onAddItem?: (category: string) => void;
  // ✨ Booking Grouping (Contract Billings)
  groupBy?: "category" | "booking";
  linkedBookings?: any[];
}

const formatCurrency = (amount: number, currency: string = "PHP") => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export function BillingsTable({
  data,
  isLoading = false,
  emptyMessage = "No billings found.",
  footerSummary,
  grossSummary,
  viewMode = true,
  onRowClick,
  onItemChange,
  activeCategories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddItem,
  groupBy = "category",
  linkedBookings = [],
}: BillingsTableProps) {
  // State for collapsible sections
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  // State for booking-level collapse
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(true);

  // Group data by category
  const groupedData = useMemo(() => {
    const groups: Record<string, BillingTableItem[]> = {};
    data.forEach(item => {
      const cat = item.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [data]);

  // ✨ Group data by booking_id for booking-grouped view
  const bookingGroupedData = useMemo(() => {
    if (groupBy !== "booking") return {};
    const groups: Record<string, BillingTableItem[]> = {};
    data.forEach(item => {
      const bid = item.originalData?.booking_id || "unassigned";
      if (!groups[bid]) groups[bid] = [];
      groups[bid].push(item);
    });
    // Also ensure every linked booking has an entry (even if empty)
    linkedBookings.forEach((b: any) => {
      const id = b.bookingId || b.id;
      if (id && !groups[id]) groups[id] = [];
    });
    return groups;
  }, [data, groupBy, linkedBookings]);

  // Ordered list of booking IDs
  const bookingIds = useMemo(() => {
    return Object.keys(bookingGroupedData).sort((a, b) => {
      if (a === "unassigned") return 1;
      if (b === "unassigned") return -1;
      return a.localeCompare(b);
    });
  }, [bookingGroupedData]);

  // Build a lookup for booking metadata from linkedBookings prop
  const bookingMeta = useMemo(() => {
    const map = new Map<string, any>();
    linkedBookings.forEach((b: any) => {
      const id = b.bookingId || b.id;
      if (id) map.set(id, b);
    });
    return map;
  }, [linkedBookings]);

  // Infer service type from booking ID prefix (same fallback as ContractDetailView)
  const inferServiceType = (bookingId: string, meta?: any): string => {
    if (meta?.serviceType || meta?.bookingType) return meta.serviceType || meta.bookingType;
    if (bookingId.startsWith("FWD-")) return "Forwarding";
    if (bookingId.startsWith("BRK-")) return "Brokerage";
    if (bookingId.startsWith("TRK-")) return "Trucking";
    if (bookingId.startsWith("INS-")) return "Marine Insurance";
    if (bookingId.startsWith("OTH-")) return "Others";
    return "Others";
  };

  // Initialize expanded bookings when booking IDs change
  useEffect(() => {
    if (groupBy === "booking" && bookingIds.length > 0) {
      setExpandedBookings(new Set(bookingIds));
      setAllExpanded(true);
    }
  }, [bookingIds.length, groupBy]);

  // Determine list of categories to display
  // Prioritize activeCategories (state-based) to support empty categories
  const displayedCategories = useMemo(() => {
      if (activeCategories && activeCategories.size > 0) {
          return Array.from(activeCategories).sort();
      }
      // Fallback for when activeCategories prop isn't fully ready or initial load
      const dataCats = Object.keys(groupedData);
      if (dataCats.length === 0 && !viewMode) return []; // Allow empty state in edit mode
      return dataCats.sort();
  }, [activeCategories, groupedData, viewMode]);

  // Initialize expanded state when categories load
  useMemo(() => {
    if (displayedCategories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(displayedCategories));
    }
  }, [displayedCategories.length]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const toggleBooking = (bookingId: string) => {
    const newSet = new Set(expandedBookings);
    if (newSet.has(bookingId)) {
      newSet.delete(bookingId);
    } else {
      newSet.add(bookingId);
    }
    setExpandedBookings(newSet);
    // Sync allExpanded state
    setAllExpanded(newSet.size === bookingIds.length);
  };

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedBookings(new Set());
      setAllExpanded(false);
    } else {
      setExpandedBookings(new Set(bookingIds));
      setAllExpanded(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
        <div className="animate-spin mb-3 text-[#0F766E]">
          <LoaderCircle size={32} />
        </div>
        <p className="text-[13px] font-medium">Loading billings...</p>
      </div>
    );
  }

  // Helper to map BillingTableItem to PricingItemData
  const mapToPricingData = (item: BillingTableItem): PricingItemData => {
    const original = item.originalData || {};
    return {
      id: item.id,
      description: item.description,
      quantity: original.quantity || 1,
      base_cost: 0, 
      amount_added: original.amount_added || 0,
      percentage_added: original.percentage_added || 0,
      currency: item.currency,
      forex_rate: original.forex_rate || 1,
      is_taxed: original.is_taxed || false,
      final_price: item.amount, 
      remarks: original.remarks,
      service: item.serviceType,
      service_tag: item.serviceType,
      status: item.status,
      created_at: item.date
    };
  };

  if (displayedCategories.length === 0 && groupBy === "category" && !onAddCategory) {
     // Only show empty state if we can't add categories (view mode or no handler)
     return (
      <div className="rounded-[10px] overflow-hidden" style={{ 
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--neuron-ui-border)"
      }}>
        <div className="px-6 py-12 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
          <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">No billings found</h3>
          <p style={{ color: "var(--neuron-ink-muted)" }}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // ✨ BOOKING-GROUPED RENDERING
  if (groupBy === "booking") {
    if (bookingIds.length === 0) {
      return (
        <div className="rounded-[10px] overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--neuron-ui-border)" }}>
          <div className="px-6 py-12 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--neuron-ink-muted)" }} />
            <h3 style={{ color: "var(--neuron-ink-primary)" }} className="mb-1">No billings found</h3>
            <p style={{ color: "var(--neuron-ink-muted)" }}>{emptyMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {/* Expand/Collapse All toggle */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleToggleAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors"
            style={{
              color: "#0F766E",
              backgroundColor: "transparent",
              border: "1px solid #D1D5DB",
              cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F0FAFA"; e.currentTarget.style.borderColor = "#0F766E"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
          >
            <ChevronsUpDown size={14} />
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {/* Booking Cards */}
        <div className="flex flex-col gap-4">
          {bookingIds.map(bid => {
            const items = bookingGroupedData[bid] || [];
            const meta = bookingMeta.get(bid);
            const serviceType = bid === "unassigned" ? "Unassigned" : inferServiceType(bid, meta);
            const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            const isExpanded = expandedBookings.has(bid);
            const itemCount = items.length;

            // Sub-group items by category within this booking
            const catGroups: Record<string, BillingTableItem[]> = {};
            items.forEach(item => {
              const cat = item.category || "General";
              if (!catGroups[cat]) catGroups[cat] = [];
              catGroups[cat].push(item);
            });
            const catNames = Object.keys(catGroups).sort();

            return (
              <div
                key={bid}
                className="bg-white border border-[#E5E9E8] rounded-xl overflow-hidden"
                style={{ transition: "box-shadow 0.2s ease" }}
              >
                {/* Booking Card Header */}
                <button
                  onClick={() => toggleBooking(bid)}
                  className="w-full flex items-center justify-between px-5 py-3.5"
                  style={{
                    background: isExpanded ? "#F8FFFE" : "#FAFCFB",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: isExpanded ? "1px solid #E5E9E8" : "none",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Expand chevron */}
                    <div style={{ color: "#9CA3AF", transition: "transform 0.15s ease", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}>
                      <ChevronDown size={16} />
                    </div>
                    {/* Service icon */}
                    {bid !== "unassigned" && getServiceIcon(serviceType, { size: 16, color: "#0F766E" })}
                    {/* Booking ID */}
                    <span style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: bid === "unassigned" ? "#6B7280" : "#0F766E",
                      fontFamily: "monospace",
                    }}>
                      {bid === "unassigned" ? "Unassigned Items" : bid}
                    </span>
                    {/* Service type label */}
                    {bid !== "unassigned" && (
                      <span style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#6B7280",
                        padding: "2px 8px",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "4px",
                      }}>
                        {serviceType}
                      </span>
                    )}
                    {/* Item count badge */}
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#9CA3AF",
                    }}>
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Subtotal */}
                  <span style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#12332B",
                    fontFamily: "monospace",
                  }}>
                    {formatCurrency(subtotal)}
                  </span>
                </button>

                {/* Expanded Content: category sub-groups */}
                {isExpanded && (
                  <div className="p-4">
                    {catNames.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {catNames.map(catName => {
                        const catItems = catGroups[catName];
                        const catSubtotal = catItems.reduce((sum, i) => sum + i.amount, 0);
                        return (
                          <div key={catName} className="border border-[#E5E9E8] rounded-lg overflow-hidden">
                            {/* Category sub-header (lightweight) */}
                            <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E9E8" }}>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                {catName}
                              </span>
                              <div className="flex items-center gap-3">
                                <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                                  {catItems.length} item{catItems.length !== 1 ? "s" : ""}
                                </span>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151", fontFamily: "monospace" }}>
                                  {formatCurrency(catSubtotal)}
                                </span>
                              </div>
                            </div>
                            {/* Pricing rows */}
                            <div className="overflow-x-auto">
                              <PricingTableHeader
                                showCost={false}
                                showMarkup={false}
                                showForex={true}
                                showTax={true}
                              />
                              <div className="divide-y divide-[#E5E9E8]">
                                {catItems.map(item => (
                                  <UniversalPricingRow
                                    key={item.id}
                                    data={mapToPricingData(item)}
                                    mode={viewMode ? "view" : "edit"}
                                    serviceType={item.service_type}
                                    itemType="charge"
                                    config={{
                                      showCost: false,
                                      showMarkup: false,
                                      showForex: true,
                                      showTax: true,
                                      simpleMode: true,
                                      priceEditable: true,
                                    }}
                                    handlers={{
                                      onFieldChange: (field, value) => onItemChange?.(item.id, field, value),
                                      onPriceChange: (value) => onItemChange?.(item.id, "amount", value),
                                      onRemove: () => onItemChange?.(item.id, "delete", true),
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    ) : (
                      <div className="py-6 text-center" style={{ color: "#9CA3AF" }}>
                        <Receipt size={24} className="mx-auto mb-2 opacity-50" />
                        <p style={{ fontSize: "13px", fontStyle: "italic" }}>
                          No billing items for this booking yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Summaries — same as category view */}
        {(footerSummary || grossSummary) && (
          <div className="mt-4 bg-white border border-[#E5E9F0] rounded-lg px-6 py-4 flex items-center justify-end gap-8">
            {grossSummary && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-[#667085] uppercase tracking-wider">
                  {grossSummary.label}
                </span>
                <span className="text-[14px] font-bold text-[#374151]">
                  {formatCurrency(grossSummary.amount, grossSummary.currency)}
                </span>
              </div>
            )}
            {footerSummary && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#667085] uppercase tracking-wider">
                  {footerSummary.label}
                </span>
                <span className="text-[14px] font-bold text-[#0F766E]">
                  {formatCurrency(footerSummary.amount, footerSummary.currency)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ✨ CATEGORY-GROUPED RENDERING (existing behavior)
  return (
    <div className="flex flex-col gap-6">
      {/* Categories List */}
      <div className="flex flex-col gap-4">
        {displayedCategories.map(category => {
            const items = groupedData[category] || [];
            const isExpanded = expandedCategories.has(category);
            const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            const currency = items[0]?.currency || "PHP";

            // Adapter: Create a partial SellingPriceCategory object for the header
            const headerCategoryMock: any = {
                id: category, // Use name as ID
                category_name: category,
                line_items: items, // Passing array ensures .length works
                subtotal: subtotal
            };

            return (
            <div 
                key={category}
                className="bg-white border border-[#E5E9E8] rounded-xl overflow-hidden"
            >
                {/* Reused Category Header */}
                <CategoryHeader 
                    category={headerCategoryMock}
                    isExpanded={isExpanded}
                    onToggle={() => toggleCategory(category)}
                    onAddItem={() => {
                        // Auto-expand the category when adding an item
                        if (!expandedCategories.has(category)) {
                             toggleCategory(category);
                        }
                        onAddItem?.(category);
                    }}
                    onRename={(newName) => onRenameCategory?.(category, newName)}
                    onDuplicate={() => {}} // Not implemented
                    onDelete={() => onDeleteCategory?.(category)}
                    viewMode={viewMode}
                />

                {/* Collapsible Content */}
                {isExpanded && (
                <div className="p-4 bg-white">
                    <div className="border border-[#E5E9E8] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        {/* Table Header */}
                        {items.length > 0 ? (
                            <>
                                <PricingTableHeader 
                                showCost={false}
                                showMarkup={false}
                                showForex={true}
                                showTax={true}
                                />

                                {/* Items */}
                                <div className="divide-y divide-[#E5E9E8]">
                                {items.map(item => (
                                    <UniversalPricingRow
                                    key={item.id}
                                    data={mapToPricingData(item)}
                                    mode={viewMode ? "view" : "edit"}
                                    serviceType={item.service_type}
                                    itemType="charge"
                                    config={{
                                        showCost: false,
                                        showMarkup: false,
                                        showForex: true, 
                                        showTax: true,
                                        simpleMode: true, 
                                        priceEditable: true 
                                    }}
                                    handlers={{
                                        onFieldChange: (field, value) => onItemChange?.(item.id, field, value),
                                        onPriceChange: (value) => onItemChange?.(item.id, 'amount', value),
                                        onRemove: () => onDeleteCategory ? onItemChange?.(item.id, 'delete', true) : undefined // Hack to support remove item if needed, but UnifiedBillingsTab needs to handle 'delete' field or we add onRemoveItem prop?
                                        // For now, let's assume item removal is done via status or we need a dedicated handler.
                                        // UnifiedBillingsTab doesn't implement delete item yet inside handleItemChange.
                                        // We should add onRemoveItem to props later if needed.
                                    }}
                                    />
                                ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center text-[#98A2B3] text-[13px] italic">
                                No items in this category. Click "Add Item" to start.
                            </div>
                        )}
                    </div>
                    </div>
                </div>
                )}
            </div>
            );
        })}
      </div>

      {/* Footer Summaries */}
      {(footerSummary || grossSummary) && (
         <div className="mt-4 bg-white border border-[#E5E9F0] rounded-lg px-6 py-4 flex items-center justify-end gap-8">
           {grossSummary && (
             <div className="flex items-center gap-2">
               <span className="text-[12px] font-semibold text-[#667085] uppercase tracking-wider">
                 {grossSummary.label}
               </span>
               <span className="text-[14px] font-bold text-[#374151]">
                 {formatCurrency(grossSummary.amount, grossSummary.currency)}
               </span>
             </div>
           )}
           {footerSummary && (
             <div className="flex items-center gap-2">
               <span className="text-[12px] font-bold text-[#667085] uppercase tracking-wider">
                 {footerSummary.label}
               </span>
               <span className="text-[14px] font-bold text-[#0F766E]">
                 {formatCurrency(footerSummary.amount, footerSummary.currency)}
               </span>
             </div>
           )}
         </div>
      )}
    </div>
  );
}