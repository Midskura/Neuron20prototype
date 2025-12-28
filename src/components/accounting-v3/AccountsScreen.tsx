import { useState } from "react";
import { 
  Plus, 
  Building2, 
  Wallet, 
  Smartphone, 
  ListChecks,
  ChevronRight
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { AddAccountModal, AccountFormData } from "./AddAccountModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Mock data following the spec
const ACCOUNTS_DATA = [
  {
    "company": "Conforme Cargo Express",
    "code": "CCE",
    "accounts": [
      {"name":"Bank – BPI","type":"Bank","code":"BPI","balance":50000,"default":true,"reconcilable":true},
      {"name":"Cash on Hand","type":"Cash","code":"CASH","balance":12000,"reconcilable":true},
      {"name":"GCash Business","type":"E-wallet","code":"GCASH","balance":8500,"reconcilable":true},
      {"name":"Accounts Receivable","type":"Control","code":"AR","balance":260000},
      {"name":"Accounts Payable","type":"Control","code":"AP","balance":-94000}
    ]
  },
  {
    "company": "ZN International Cargo Forwarding Company",
    "code": "ZNICF",
    "accounts": [
      {"name":"Bank – BDO","type":"Bank","code":"BDO","balance":120000,"default":true,"reconcilable":true},
      {"name":"Cash on Hand","type":"Cash","code":"CASH","balance":9000,"reconcilable":true},
      {"name":"Maya Business","type":"E-wallet","code":"MAYA","balance":3000,"reconcilable":true},
      {"name":"Accounts Receivable","type":"Control","code":"AR","balance":175000},
      {"name":"Accounts Payable","type":"Control","code":"AP","balance":-68000}
    ]
  },
  {
    "company": "Juan Logistica Courier Services",
    "code": "JLCS",
    "accounts": [
      {"name":"Bank – LandBank","type":"Bank","code":"LBP","balance":25000,"default":true,"reconcilable":true},
      {"name":"Cash on Hand","type":"Cash","code":"CASH","balance":6000,"reconcilable":true},
      {"name":"GCash Business","type":"E-wallet","code":"GCASH","balance":4200,"reconcilable":true},
      {"name":"Accounts Receivable","type":"Control","code":"AR","balance":82000},
      {"name":"Accounts Payable","type":"Control","code":"AP","balance":-21000}
    ]
  },
  {
    "company": "Zeuj One Marketing International",
    "code": "ZOMI",
    "accounts": [
      {"name":"Bank – BPI","type":"Bank","code":"BPI","balance":42000,"default":true,"reconcilable":true},
      {"name":"Cash on Hand","type":"Cash","code":"CASH","balance":7000,"reconcilable":true},
      {"name":"Shopee/Lazada Wallet","type":"E-wallet","code":"MPAY","balance":5600,"reconcilable":true},
      {"name":"Accounts Receivable","type":"Control","code":"AR","balance":110000},
      {"name":"Accounts Payable","type":"Control","code":"AP","balance":-33000}
    ]
  },
  {
    "company": "Conforme Packaging and Trading Corporation",
    "code": "CPTC",
    "accounts": [
      {"name":"Bank – BPI","type":"Bank","code":"BPI","balance":88000,"default":true,"reconcilable":true},
      {"name":"Cash on Hand","type":"Cash","code":"CASH","balance":10000,"reconcilable":true},
      {"name":"GCash Business","type":"E-wallet","code":"GCASH","balance":3200,"reconcilable":true},
      {"name":"Accounts Receivable","type":"Control","code":"AR","balance":136000},
      {"name":"Accounts Payable","type":"Control","code":"AP","balance":-52000}
    ]
  }
];

interface Account {
  name: string;
  type: "Bank" | "Cash" | "E-wallet" | "Control";
  code: string;
  balance: number;
  default?: boolean;
  reconcilable?: boolean;
}

interface CompanyData {
  company: string;
  code: string;
  accounts: Account[];
}

export function AccountsScreen() {
  const [showEwallet, setShowEwallet] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAddAccount = (account: AccountFormData) => {
    // Stub - would create new account
    console.log("Creating account:", account);
  };

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleBackToAccounts = () => {
    setSelectedAccount(null);
  };

  // Filter accounts based on showEwallet toggle
  const filteredData = ACCOUNTS_DATA.map(company => ({
    ...company,
    accounts: company.accounts.filter(acc => 
      showEwallet || acc.type !== "E-wallet"
    )
  }));

  // If an account is selected, show the ledger view
  if (selectedAccount) {
    const { LedgerScreen } = require('./LedgerScreen');
    return (
      <LedgerScreen
        accountName={selectedAccount.name}
        accountCode={selectedAccount.code}
        accountType={selectedAccount.type}
        isReconcilable={selectedAccount.reconcilable}
        isDefault={selectedAccount.default}
        currentBalance={selectedAccount.balance}
        onBack={handleBackToAccounts}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-[#6B7280]" style={{ fontSize: "14px", lineHeight: "20px" }}>
            Manage your chart of accounts
          </p>
          <div className="flex items-center gap-2">
            <Switch
              checked={showEwallet}
              onCheckedChange={setShowEwallet}
              className="data-[state=checked]:bg-[#0A1D4D]"
            />
            <Label 
              htmlFor="e-wallet-toggle" 
              className="text-[#6B7280] cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              Show E-wallets
            </Label>
          </div>
        </div>
      </div>

      {/* Company sections */}
      <div className="space-y-5">
        {filteredData.map((companyData) => (
          <CompanySection 
            key={companyData.code} 
            data={companyData}
            onAddAccount={() => setSelectedCompany(companyData.code)}
            onAccountClick={handleAccountClick}
          />
        ))}
      </div>

      {/* Add Account Modal */}
      {selectedCompany && (
        <AddAccountModal
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
          companyName={ACCOUNTS_DATA.find(c => c.code === selectedCompany)?.company || ""}
          companyCode={selectedCompany}
          existingAccountNames={
            ACCOUNTS_DATA.find(c => c.code === selectedCompany)?.accounts.map(a => a.name) || []
          }
          onCreateAccount={handleAddAccount}
        />
      )}
    </div>
  );
}

interface CompanySectionProps {
  data: CompanyData;
  onAddAccount: () => void;
  onAccountClick: (account: Account) => void;
}

function CompanySection({ data, onAddAccount, onAccountClick }: CompanySectionProps) {
  return (
    <div 
      className="border border-[#E5E7EB] rounded-[12px] bg-white overflow-hidden"
      style={{ 
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
        <h3 className="text-[#0A1D4D]" style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>
          {data.company}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[#6B7280] hover:text-[#F25C05] hover:bg-[#FFF5ED] -mr-2"
          style={{ fontSize: "12px", fontWeight: 600 }}
          onClick={onAddAccount}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Account
        </Button>
      </div>

      {/* Accounts */}
      <div className="p-3 space-y-2">
        {data.accounts.map((account, index) => (
          <AccountRow 
            key={`${data.code}-${account.code}-${index}`} 
            account={account}
            onAccountClick={onAccountClick}
          />
        ))}
      </div>
    </div>
  );
}

interface AccountRowProps {
  account: Account;
  onAccountClick: (account: Account) => void;
}

function AccountRow({ account, onAccountClick }: AccountRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getAccountIcon = () => {
    switch (account.type) {
      case "Bank":
        return <Building2 className="w-6 h-6 text-[#6B7280]" />;
      case "Cash":
        return <Wallet className="w-6 h-6 text-[#6B7280]" />;
      case "E-wallet":
        return <Smartphone className="w-6 h-6 text-[#6B7280]" />;
      case "Control":
        return <ListChecks className="w-6 h-6 text-[#6B7280]" />;
      default:
        return null;
    }
  };

  // Format balance according to specs
  const formattedBalance = account.balance >= 0 
    ? `₱${account.balance.toLocaleString()}` 
    : `-₱${Math.abs(account.balance).toLocaleString()}`;

  // Color rules based on account type
  const getBalanceColor = () => {
    if (account.balance < 0) {
      return "#B91C1C"; // Danger/red for negative
    }
    return "#0A1D4D"; // Default text color for positive/zero
  };

  const balanceColor = getBalanceColor();
  const isNegative = account.balance < 0;

  // Accessibility label for screen readers
  const balanceAriaLabel = `Balance (as of now), ${formattedBalance}`;

  // Navigate to ledger
  const handleNavigateToLedger = () => {
    onAccountClick(account);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigateToLedger();
    }
  };

  return (
    <div 
      className="group min-h-[64px] flex items-center gap-4 px-4 py-3 border border-[#E5E7EB] rounded-[12px] hover:bg-[#F9FAFB] transition-all cursor-pointer"
      style={{
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
      onClick={handleNavigateToLedger}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`View ledger for ${account.name}`}
    >
      {/* Left: Account details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          {getAccountIcon()}
          <p className="text-[#0A1D4D] truncate" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 600 }}>
            {account.name}
          </p>
        </div>
        <p className="text-[#6B7280] pl-9" style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 500 }}>
          {account.type} <span className="text-[#D1D5DB]">•</span> {account.code}
        </p>
      </div>

      {/* Right: Pills and Balance */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Pills */}
        <div className="flex items-center gap-2">
          {account.default && (
            <div 
              className="px-2 py-1 bg-[#F3F4F6] text-[#374151] rounded-[8px]"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Default
            </div>
          )}
          {account.reconcilable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="px-2 py-1 border border-[#E5E7EB] text-[#6B7280] rounded-[8px] cursor-help"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    Reconcilable
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top"
                  className="max-w-[280px]"
                  style={{ 
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "12px"
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: "2px" }}>Reconcilable</p>
                  <p style={{ fontWeight: 500, color: "#6B7280" }}>
                    This account can be reconciled against statements.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Balance with tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-[140px] text-right">
                <span className="sr-only">{balanceAriaLabel}</span>
                <div className="flex items-center justify-end gap-2">
                  {isNegative && (
                    <div 
                      className="px-2 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-[8px]"
                      style={{ fontSize: "10px", fontWeight: 600 }}
                      aria-hidden="true"
                    >
                      NEG
                    </div>
                  )}
                  <p 
                    className="tabular-nums"
                    style={{ 
                      fontSize: "14px", 
                      lineHeight: "20px", 
                      fontWeight: 600, 
                      color: balanceColor 
                    }}
                    aria-hidden="true"
                  >
                    {formattedBalance}
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top"
              className="max-w-[280px]"
              style={{ 
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "12px"
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: "2px" }}>Balance (as of now)</p>
              <p style={{ fontWeight: 500, color: "#6B7280", lineHeight: "16px" }}>
                Posted entries & transfers only.<br />Drafts are excluded.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Chevron on hover */}
        <ChevronRight 
          className={`w-4 h-4 text-[#6B7280] transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
