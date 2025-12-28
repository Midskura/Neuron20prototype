import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { 
  Building2, 
  Wallet, 
  Smartphone, 
  ListChecks, 
  X, 
  CircleHelp,
  AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type AccountType = "Bank" | "Cash" | "E-wallet" | "Control";
type ControlCode = "AR" | "AP";
type EWalletProvider = "GCash Business" | "Maya Business" | "PayPal" | "Other";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  companyCode: string;
  existingAccountNames?: string[];
  onCreateAccount: (account: AccountFormData) => void;
}

export interface AccountFormData {
  accountName: string;
  type: AccountType;
  code: string;
  startingBalance: number;
  reconcilable: boolean;
  makeDefault: boolean;
  provider?: string;
  controlCode?: ControlCode;
  notes: string;
}

export function AddAccountModal({
  open,
  onOpenChange,
  companyName,
  companyCode,
  existingAccountNames = [],
  onCreateAccount,
}: AddAccountModalProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    accountName: "",
    type: "Bank",
    code: "",
    startingBalance: 0,
    reconcilable: true,
    makeDefault: false,
    provider: undefined,
    controlCode: undefined,
    notes: "",
  });

  const [customProvider, setCustomProvider] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false);
  const [previousType, setPreviousType] = useState<AccountType>("Bank");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        accountName: "",
        type: "Bank",
        code: "",
        startingBalance: 0,
        reconcilable: true,
        makeDefault: false,
        provider: undefined,
        controlCode: undefined,
        notes: "",
      });
      setCustomProvider("");
      setErrors({});
      setShowTypeChangeWarning(false);
      setPreviousType("Bank");
    }
  }, [open]);

  // Handle type change and show warning
  const handleTypeChange = (newType: AccountType) => {
    if (formData.accountName || formData.code || formData.notes) {
      setShowTypeChangeWarning(true);
      setTimeout(() => setShowTypeChangeWarning(false), 3000);
    }
    setPreviousType(formData.type);
    
    // Reset type-specific fields
    const updates: Partial<AccountFormData> = { type: newType };
    
    if (newType === "Control") {
      updates.reconcilable = false;
      updates.makeDefault = false;
      updates.provider = undefined;
    } else if (newType === "Bank") {
      updates.reconcilable = true;
      updates.controlCode = undefined;
      updates.provider = undefined;
    } else if (newType === "Cash") {
      updates.reconcilable = true;
      updates.makeDefault = false;
      updates.controlCode = undefined;
      updates.provider = undefined;
    } else if (newType === "E-wallet") {
      updates.reconcilable = true;
      updates.makeDefault = false;
      updates.controlCode = undefined;
      updates.provider = "GCash Business";
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Account name required and unique
    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    } else if (formData.accountName.trim().length < 2) {
      newErrors.accountName = "Account name must be at least 2 characters";
    } else if (formData.accountName.trim().length > 64) {
      newErrors.accountName = "Account name must be 64 characters or less";
    } else if (existingAccountNames.includes(formData.accountName.trim())) {
      newErrors.accountName = "An account with this name already exists in this company";
    }

    // Type required
    if (!formData.type) {
      newErrors.type = "Account type is required";
    }

    // Control code required for Control type
    if (formData.type === "Control" && !formData.controlCode) {
      newErrors.controlCode = "Control code is required for control accounts";
    }

    // Code validation (optional but if provided must be 2-8 chars)
    if (formData.code && (formData.code.length < 2 || formData.code.length > 8)) {
      newErrors.code = "Code must be 2-8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValid = () => {
    if (!formData.accountName.trim() || !formData.type) return false;
    if (formData.type === "Control" && !formData.controlCode) return false;
    if (existingAccountNames.includes(formData.accountName.trim())) return false;
    if (formData.code && (formData.code.length < 2 || formData.code.length > 8)) return false;
    return true;
  };

  const handleCreate = (addAnother = false) => {
    if (!validateForm()) return;

    const accountToCreate = {
      ...formData,
      accountName: formData.accountName.trim(),
      code: formData.code.toUpperCase().trim() || formData.accountName.substring(0, 6).toUpperCase(),
      provider: formData.type === "E-wallet" 
        ? (formData.provider === "Other" ? customProvider : formData.provider)
        : undefined,
    };

    onCreateAccount(accountToCreate);

    // Show success toast
    toast.success("Account created", {
      description: `${accountToCreate.accountName} added to ${companyName}.`,
      action: {
        label: "View",
        onClick: () => {
          // Scroll to company section (would be implemented in parent)
        },
      },
    });

    if (addAnother) {
      // Reset form but keep type
      setFormData(prev => ({
        ...prev,
        accountName: "",
        code: "",
        startingBalance: 0,
        notes: "",
        controlCode: undefined,
      }));
      setErrors({});
      // Focus account name input
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('[name="accountName"]');
        input?.focus();
      }, 50);
    } else {
      onOpenChange(false);
    }
  };

  const handleCodeBlur = () => {
    setFormData(prev => ({
      ...prev,
      code: prev.code.toUpperCase(),
    }));
  };

  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case "Bank":
        return <Building2 className="w-4 h-4" />;
      case "Cash":
        return <Wallet className="w-4 h-4" />;
      case "E-wallet":
        return <Smartphone className="w-4 h-4" />;
      case "Control":
        return <ListChecks className="w-4 h-4" />;
    }
  };

  const getPreviewText = () => {
    if (!formData.accountName) return null;
    
    const parts = [
      formData.accountName,
      formData.code || "AUTO",
      `₱${formData.startingBalance.toLocaleString()}`,
    ];

    if (formData.reconcilable && formData.type !== "Control") {
      parts.push("Reconcilable");
    }

    if (formData.makeDefault && formData.type === "Bank") {
      parts.push("(Default)");
    }

    if (formData.type === "Control" && formData.controlCode) {
      parts.push(formData.controlCode === "AR" ? "Receivable" : "Payable");
    }

    return `Will create: ${parts.join(" • ")}`;
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/[0.48] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-[720px] translate-x-[-50%] translate-y-[-50%] bg-white border border-[#E5E7EB] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col max-h-[80vh]"
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header - Sticky */}
          <div className="flex-shrink-0 px-6 py-5 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogPrimitive.Title 
                  className="text-[#0A1D4D]" 
                  style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 700 }}
                >
                  Add account
                </DialogPrimitive.Title>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        type="button"
                        className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#374151] rounded-full hover:bg-[#F3F4F6] transition-colors"
                        aria-label="Help"
                      >
                        <CircleHelp className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right"
                      className="max-w-[280px]"
                      style={{ fontSize: "12px" }}
                    >
                      Set up a simple account. Bank/Cash/E-wallet can be reconciled.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#374151] rounded-lg hover:bg-[#F3F4F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A1D4D] focus:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                  <span className="sr-only">Close</span>
                </button>
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Description className="text-[#6B7280] mt-1" style={{ fontSize: "14px" }}>
              Create a new account for {companyName}
            </DialogPrimitive.Description>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Type change warning */}
            {showTypeChangeWarning && (
              <div 
                className="flex items-start gap-2 p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-[10px]"
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 text-[#92400E] flex-shrink-0 mt-0.5" />
                <p className="text-[#92400E]" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Some settings changed based on the account type. Review before saving.
                </p>
              </div>
            )}

            {/* Company (read-only) */}
            <div className="space-y-2">
              <Label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                Company
              </Label>
              <Input
                value={companyName}
                disabled
                className="h-11 border-[#D1D5DB] rounded-[10px] bg-[#F9FAFB] cursor-not-allowed"
                style={{ fontSize: "14px" }}
              />
              <p className="text-[#6B7280]" style={{ fontSize: "12px" }}>
                Saved as company ID: {companyCode}
              </p>
            </div>

            {/* Type selector (segmented control) */}
            <div className="space-y-2">
              <Label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                Type <span className="text-[#B91C1C]">*</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {(["Bank", "Cash", "E-wallet", "Control"] as AccountType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`h-11 flex items-center justify-center gap-2 rounded-[8px] border transition-all ${
                      formData.type === type
                        ? "border-[#0A1D4D] bg-[#0A1D4D]/[0.04] text-[#0A1D4D]"
                        : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                    }`}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    {getTypeIcon(type)}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-column grid for main fields */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Account name */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="accountName" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                  Account name <span className="text-[#B91C1C]">*</span>
                </Label>
                <Input
                  id="accountName"
                  name="accountName"
                  placeholder={
                    formData.type === "Bank" 
                      ? "e.g., Bank – BPI" 
                      : formData.type === "Cash"
                      ? "e.g., Cash on Hand"
                      : formData.type === "E-wallet"
                      ? "e.g., GCash Business"
                      : "e.g., Accounts Receivable"
                  }
                  value={formData.accountName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, accountName: e.target.value }));
                    if (errors.accountName) {
                      setErrors(prev => ({ ...prev, accountName: "" }));
                    }
                  }}
                  className={`h-11 border-[#D1D5DB] rounded-[10px] focus-visible:ring-2 focus-visible:ring-[#0A1D4D] ${
                    errors.accountName ? "border-[#B91C1C] focus-visible:ring-[#B91C1C]" : ""
                  }`}
                  style={{ fontSize: "14px" }}
                  autoFocus
                />
                {errors.accountName && (
                  <p className="text-[#B91C1C]" style={{ fontSize: "12px" }} role="alert">
                    {errors.accountName}
                  </p>
                )}
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                  Code
                </Label>
                <Input
                  id="code"
                  placeholder="e.g., BPI, CASH"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  onBlur={handleCodeBlur}
                  maxLength={8}
                  className={`h-11 border-[#D1D5DB] rounded-[10px] ${
                    errors.code ? "border-[#B91C1C]" : ""
                  }`}
                  style={{ fontSize: "14px" }}
                />
                <p className="text-[#6B7280]" style={{ fontSize: "12px" }}>
                  Short label shown in tables (e.g., BPI, CASH)
                </p>
                {errors.code && (
                  <p className="text-[#B91C1C]" style={{ fontSize: "12px" }} role="alert">
                    {errors.code}
                  </p>
                )}
              </div>

              {/* Starting balance */}
              <div className="space-y-2">
                <Label htmlFor="balance" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                  Starting balance
                </Label>
                <div className="relative">
                  <span 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                    style={{ fontSize: "14px" }}
                  >
                    ₱
                  </span>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.startingBalance}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      startingBalance: parseFloat(e.target.value) || 0 
                    }))}
                    className="h-11 pl-7 border-[#D1D5DB] rounded-[10px]"
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <p className="text-[#6B7280]" style={{ fontSize: "12px" }}>
                  If unsure, leave zero. You can import balances later.
                </p>
                {formData.controlCode === "AP" && formData.startingBalance > 0 && (
                  <p className="text-[#92400E]" style={{ fontSize: "12px" }}>
                    💡 AP balances are typically negative
                  </p>
                )}
                {formData.controlCode === "AR" && formData.startingBalance < 0 && (
                  <p className="text-[#92400E]" style={{ fontSize: "12px" }}>
                    💡 AR balances are typically positive
                  </p>
                )}
              </div>
            </div>

            {/* Control code (only for Control type) */}
            {formData.type === "Control" && (
              <div className="space-y-2">
                <Label htmlFor="controlCode" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                  Control code <span className="text-[#B91C1C]">*</span>
                </Label>
                <Select
                  value={formData.controlCode}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    controlCode: value as ControlCode 
                  }))}
                >
                  <SelectTrigger 
                    id="controlCode"
                    className={`h-11 border-[#D1D5DB] rounded-[10px] ${
                      errors.controlCode ? "border-[#B91C1C]" : ""
                    }`}
                    style={{ fontSize: "14px" }}
                  >
                    <SelectValue placeholder="Select control type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AR">AR — Accounts Receivable</SelectItem>
                    <SelectItem value="AP">AP — Accounts Payable</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[#6B7280]" style={{ fontSize: "12px" }}>
                  Control accounts are managed by the system and not reconciled.
                </p>
                {errors.controlCode && (
                  <p className="text-[#B91C1C]" style={{ fontSize: "12px" }} role="alert">
                    {errors.controlCode}
                  </p>
                )}
              </div>
            )}

            {/* E-wallet provider (only for E-wallet type) */}
            {formData.type === "E-wallet" && (
              <div className="space-y-2">
                <Label htmlFor="provider" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                  E-wallet provider
                </Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger 
                    id="provider"
                    className="h-11 border-[#D1D5DB] rounded-[10px]"
                    style={{ fontSize: "14px" }}
                  >
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GCash Business">GCash Business</SelectItem>
                    <SelectItem value="Maya Business">Maya Business</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formData.provider === "Other" && (
                  <Input
                    placeholder="Provider name"
                    value={customProvider}
                    onChange={(e) => setCustomProvider(e.target.value)}
                    className="h-11 border-[#D1D5DB] rounded-[10px]"
                    style={{ fontSize: "14px" }}
                  />
                )}
              </div>
            )}

            {/* Reconcilable (for Bank, Cash, E-wallet) */}
            {formData.type !== "Control" && (
              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="reconcilable"
                  checked={formData.reconcilable}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, reconcilable: checked as boolean }))
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="reconcilable"
                    className="cursor-pointer"
                    style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}
                  >
                    Reconcilable
                  </Label>
                  <p className="text-[#6B7280] mt-0.5" style={{ fontSize: "12px" }}>
                    Enable bank/cash reconciliation for this account
                  </p>
                </div>
              </div>
            )}

            {/* Make default (only for Bank) */}
            {formData.type === "Bank" && (
              <div className="flex items-start justify-between pt-2">
                <div className="flex-1">
                  <Label
                    htmlFor="makeDefault"
                    className="cursor-pointer"
                    style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}
                  >
                    Make default
                  </Label>
                  <p className="text-[#6B7280] mt-0.5" style={{ fontSize: "12px" }}>
                    Use as default bank for this company
                  </p>
                  {formData.makeDefault && (
                    <p className="text-[#92400E] mt-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                      ℹ️ Current default will be replaced
                    </p>
                  )}
                </div>
                <Switch
                  id="makeDefault"
                  checked={formData.makeDefault}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, makeDefault: checked }))
                  }
                  className="data-[state=checked]:bg-[#0A1D4D]"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                Notes
              </Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Optional details for admins"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="border-[#D1D5DB] rounded-[10px] resize-none"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Preview strip */}
            {getPreviewText() && (
              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px]">
                <p 
                  className="text-[#6B7280] truncate" 
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {getPreviewText()}
                </p>
              </div>
            )}
          </div>
        </div>

          {/* Footer - Sticky */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-[#E5E7EB] flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-[10px]"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Cancel
            </Button>
            {isValid() && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreate(true)}
                className="h-10 border-[#D1D5DB] rounded-[10px]"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Create & add another
              </Button>
            )}
            <Button
              type="button"
              onClick={() => handleCreate(false)}
              disabled={!isValid()}
              className="h-10 bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Create account
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
