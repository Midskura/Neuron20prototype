import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface CategoryExtended {
  id: string;
  name: string;
  type: "income" | "expense";
  colorOuter: string;
  colorInner: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

interface CategoriesScreenProps {
  categories: Category[];
  onRename: (id: string, newName: string) => void;
  onMerge: (sourceId: string, targetId: string) => void;
  onArchive: (id: string) => void;
  onAddCategory: (data: { name: string; type: "income" | "expense"; color: string }) => void;
}

const DEFAULT_INCOME_CATEGORIES: CategoryExtended[] = [
  {
    id: "inc-1",
    name: "Transport Services",
    type: "income",
    colorOuter: "#CFF0DA",
    colorInner: "#16A34A",
  },
  {
    id: "inc-2",
    name: "Last-Mile Delivery",
    type: "income",
    colorOuter: "#D9F4E3",
    colorInner: "#22B36B",
  },
  {
    id: "inc-3",
    name: "Warehousing & Storage",
    type: "income",
    colorOuter: "#E6F7EB",
    colorInner: "#34C67E",
  },
  {
    id: "inc-4",
    name: "Handling & Loading",
    type: "income",
    colorOuter: "#EAF8EE",
    colorInner: "#39B27B",
  },
  {
    id: "inc-5",
    name: "Documentation Fees",
    type: "income",
    colorOuter: "#E1F6E6",
    colorInner: "#25A46A",
  },
  {
    id: "inc-6",
    name: "Fuel Surcharge",
    type: "income",
    colorOuter: "#D3F2DD",
    colorInner: "#178A57",
  },
];

const DEFAULT_EXPENSE_CATEGORIES: CategoryExtended[] = [
  {
    id: "exp-1",
    name: "Fuel",
    type: "expense",
    colorOuter: "#FDE2E2",
    colorInner: "#EF4444",
  },
  {
    id: "exp-2",
    name: "Toll Fees",
    type: "expense",
    colorOuter: "#FEE9D1",
    colorInner: "#F59E0B",
  },
  {
    id: "exp-3",
    name: "Repairs & Maintenance",
    type: "expense",
    colorOuter: "#FFEED6",
    colorInner: "#F97316",
  },
  {
    id: "exp-4",
    name: "Driver Allowance",
    type: "expense",
    colorOuter: "#FFEBD5",
    colorInner: "#FB923C",
  },
  {
    id: "exp-5",
    name: "Parking / Terminal Fees",
    type: "expense",
    colorOuter: "#FFF2DC",
    colorInner: "#F59E0B",
  },
  {
    id: "exp-6",
    name: "Office & Admin",
    type: "expense",
    colorOuter: "#EDEDFE",
    colorInner: "#6366F1",
  },
  {
    id: "exp-7",
    name: "Bank Fees",
    type: "expense",
    colorOuter: "#EAF2FF",
    colorInner: "#2563EB",
  },
  {
    id: "exp-8",
    name: "Insurance",
    type: "expense",
    colorOuter: "#E6F4FF",
    colorInner: "#0EA5E9",
  },
];

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981",
  "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6",
  "#A855F7", "#EC4899", "#F43F5E", "#64748B", "#0A1D4D",
];

export function CategoriesScreen({
  categories,
  onRename,
  onMerge,
  onArchive,
  onAddCategory,
}: CategoriesScreenProps) {
  const [displayCategories] = useState<CategoryExtended[]>([
    ...DEFAULT_INCOME_CATEGORIES,
    ...DEFAULT_EXPENSE_CATEGORIES,
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addingType, setAddingType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: PRESET_COLORS[0],
  });

  const incomeCategories = displayCategories.filter((c) => c.type === "income");
  const expenseCategories = displayCategories.filter((c) => c.type === "expense");

  const handleAddCategory = () => {
    if (!newCategory.name) {
      return;
    }
    onAddCategory({
      name: newCategory.name,
      type: addingType,
      color: newCategory.color,
    });
    setNewCategory({ name: "", color: PRESET_COLORS[0] });
    setIsAddDialogOpen(false);
  };

  const renderCategoryRow = (
    category: CategoryExtended,
    index: number,
    total: number
  ) => {
    const isFirst = index === 0;
    const isLast = index === total - 1;

    return (
      <div
        key={category.id}
        role="button"
        tabIndex={0}
        aria-label={`View category: ${category.name}`}
        className={`
          relative flex items-center justify-between min-h-[56px] px-4 py-3 bg-white
          hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2
          ${isFirst ? 'rounded-t-xl' : ''}
          ${isLast ? 'rounded-b-xl' : ''}
        `}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // Handle view category
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Color indicator - outer circle with inner dot */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: category.colorOuter }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.colorInner }}
            />
          </div>
          <span
            className="text-[14px] text-[#0A1D4D]"
            style={{ fontWeight: 600 }}
          >
            {category.name}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-[#F3F4F6]"
              aria-label={`Actions for ${category.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-[#6B7280]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const newName = prompt("Rename category:", category.name);
                if (newName) {
                  onRename(category.id, newName);
                }
              }}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const targetId = prompt("Enter target category ID to merge into:");
                if (targetId) {
                  onMerge(category.id, targetId);
                }
              }}
            >
              Merge into…
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (window.confirm(`Archive ${category.name}?`)) {
                  onArchive(category.id);
                }
              }}
            >
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Bottom divider - hidden on last row */}
        {!isLast && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E5E7EB]" />
        )}
      </div>
    );
  };

  const renderCategoryList = (categoryList: CategoryExtended[]) => (
    <div 
      className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
      style={{
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
      }}
    >
      {categoryList.map((category, index) =>
        renderCategoryRow(category, index, categoryList.length)
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Income Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-[14px] text-[#0A1D4D]"
            style={{ fontWeight: 600, marginTop: '16px' }}
          >
            Income Categories
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAddingType("income");
              setIsAddDialogOpen(true);
            }}
            className="text-[13px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Income Category
          </Button>
        </div>
        {renderCategoryList(incomeCategories)}
      </div>

      {/* Expense Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-[14px] text-[#0A1D4D]"
            style={{ fontWeight: 600, marginTop: '16px' }}
          >
            Expense Categories
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAddingType("expense");
              setIsAddDialogOpen(true);
            }}
            className="text-[13px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense Category
          </Button>
        </div>
        {renderCategoryList(expenseCategories)}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {addingType === "income" ? "Income" : "Expense"} Category
            </DialogTitle>
            <DialogDescription>
              Create a new category for your transactions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                placeholder="e.g. Fuel, Transport, Salary"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      newCategory.color === color
                        ? "border-[#0A1D4D] scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white"
              onClick={handleAddCategory}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
