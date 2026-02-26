import { Receipt, Plus, DollarSign, LoaderCircle } from "lucide-react";
import { useState, useMemo } from "react";
// Shared Components
import { PricingTableHeader } from "../pricing/PricingTableHeader";
import { UniversalPricingRow, PricingItemData } from "../pricing/UniversalPricingRow";
// Pricing Components & Types
import { CategoryHeader } from "../../pricing/quotations/CategoryHeader";
import type { SellingPriceCategory } from "../../../types/pricing";

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
  onAddItem
}: BillingsTableProps) {
  // State for collapsible sections
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  if (displayedCategories.length === 0 && !onAddCategory) {
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
