import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Trash2, Check } from "lucide-react";
import { toast } from "../ui/toast-utils";

interface ExpenseCategoriesDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface ExpenseCategory {
  id: string;
  name: string;
  defaultType: string;
  defaultCompany: string;
}

const COMPANIES = ["JLCS", "CCE", "CPTC", "ZNICF", "(None)"];
const EXPENSE_TYPES = ["Operations", "Admin", "Commission", "Itemized Cost"];

const mockCategories: ExpenseCategory[] = [
  { id: "1", name: "Trucking", defaultType: "Operations", defaultCompany: "(None)" },
  { id: "2", name: "Fumigation", defaultType: "Itemized Cost", defaultCompany: "(None)" },
  { id: "3", name: "Handling Fee", defaultType: "Operations", defaultCompany: "(None)" },
  { id: "4", name: "Mobilization", defaultType: "Operations", defaultCompany: "(None)" },
  { id: "5", name: "Office Rent", defaultType: "Admin", defaultCompany: "JLCS" },
  { id: "6", name: "Salaries", defaultType: "Admin", defaultCompany: "(None)" },
  { id: "7", name: "Utilities", defaultType: "Admin", defaultCompany: "(None)" },
  { id: "8", name: "Commission", defaultType: "Commission", defaultCompany: "(None)" },
];

export function ExpenseCategoriesDrawer({ open, onClose }: ExpenseCategoriesDrawerProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>(mockCategories);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("Operations");
  const [newCategoryCompany, setNewCategoryCompany] = useState("(None)");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    const newCategory: ExpenseCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      defaultType: newCategoryType,
      defaultCompany: newCategoryCompany,
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setNewCategoryType("Operations");
    setNewCategoryCompany("(None)");
    setIsAddingNew(false);
    toast.success(`Category "${newCategoryName}" added`);
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    setCategories(categories.filter(c => c.id !== id));
    toast.success(`Category "${category?.name}" deleted`);
  };

  const handleUpdateCategory = (id: string, field: string, value: string) => {
    setCategories(categories.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[600px] sm:w-[600px] overflow-y-auto"
        style={{ paddingTop: "24px" }}
      >
        <SheetHeader>
          <SheetTitle style={{ fontSize: "20px", fontWeight: "700", color: "#000000" }}>
            Manage Expense Categories
          </SheetTitle>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>
            Set up default expense types and companies for faster encoding
          </p>
        </SheetHeader>

        <div style={{ marginTop: "32px" }}>
          {/* Add New Category Button */}
          {!isAddingNew && (
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="outline"
              className="w-full mb-4"
              style={{ gap: "6px", height: "40px" }}
            >
              <Plus size={16} />
              Add New Category
            </Button>
          )}

          {/* New Category Form */}
          {isAddingNew && (
            <div 
              style={{ 
                padding: "16px", 
                backgroundColor: "#F9FAFB", 
                borderRadius: "12px", 
                marginBottom: "16px",
                border: "2px dashed #D1D5DB"
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <Label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" }}>
                  Category Name
                </Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Storage Fee"
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <Label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" }}>
                  Default Expense Type
                </Label>
                <Select value={newCategoryType} onValueChange={setNewCategoryType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" }}>
                  Default Company (Optional)
                </Label>
                <Select value={newCategoryCompany} onValueChange={setNewCategoryCompany}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  onClick={handleAddCategory}
                  className="bg-[#F26A21] hover:bg-[#D85A15] text-white flex-1"
                  style={{ gap: "6px" }}
                >
                  <Check size={16} />
                  Add Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewCategoryName("");
                    setNewCategoryType("Operations");
                    setNewCategoryCompany("(None)");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div style={{ marginTop: "16px" }}>
            <Label style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px", display: "block" }}>
              Existing Categories ({categories.length})
            </Label>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  style={{
                    padding: "16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        value={category.name}
                        onChange={(e) => handleUpdateCategory(category.id, "name", e.target.value)}
                        style={{ fontWeight: "600", fontSize: "14px" }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="ml-2 h-8 w-8"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <Label style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", marginBottom: "4px", display: "block" }}>
                        Default Type
                      </Label>
                      <Select 
                        value={category.defaultType} 
                        onValueChange={(value) => handleUpdateCategory(category.id, "defaultType", value)}
                      >
                        <SelectTrigger style={{ height: "32px", fontSize: "13px" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", marginBottom: "4px", display: "block" }}>
                        Default Company
                      </Label>
                      <Select 
                        value={category.defaultCompany} 
                        onValueChange={(value) => handleUpdateCategory(category.id, "defaultCompany", value)}
                      >
                        <SelectTrigger style={{ height: "32px", fontSize: "13px" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANIES.map(company => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          position: "sticky", 
          bottom: 0, 
          backgroundColor: "white", 
          paddingTop: "20px", 
          paddingBottom: "20px",
          marginTop: "32px",
          borderTop: "1px solid #E5E7EB"
        }}>
          <Button
            onClick={onClose}
            className="w-full bg-[#F26A21] hover:bg-[#D85A15] text-white"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
