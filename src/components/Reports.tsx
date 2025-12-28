import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { toast } from "./ui/toast-utils";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  CheckCircle, 
  DollarSign,
  ChevronDown,
  Loader2,
  AlertCircle,
  RotateCcw,
  FileDown,
  Check,
  Building2,
  FileText,
  FileSpreadsheet,
  Archive,
  Plus,
  Clock,
  FileCheck,
  Users,
  Calculator
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

/**
 * =====================================================
 * DATA CONTRACT & DICTIONARY (Dev Handoff)
 * =====================================================
 * 
 * BACKEND DATA REQUIREMENTS:
 * 
 * Needed fields from backend:
 * - Booking: booking_id, client_id, company_id, created_at, dispatched_at, delivered_at, 
 *           status, revenue_amount, expense_amount, currency
 * - Entry: entry_id, type(revenue|expense), amount, currency, company_id, booking_id, 
 *         category, entry_date
 * - Client: client_id, name
 * 
 * API endpoint: POST /api/reports
 * Request: { start_date, end_date, frequency, company_ids, client_ids, modes, statuses, date_basis, currency }
 * 
 * Response:
 * {
 *   kpis: { bookings, delivered, deliveryRatePct, revenue, expenses, marginPct },
 *   series: [{ period, revenue, expenses, netProfit }],
 *   byCategory: [{ category, amount, pct }],
 *   topClients: [{ client, bookings, revenue, marginPct }],
 *   negativeBookings: [{ bookingId, client, revenue, expense, net, company }],
 *   unlinkedExpenses: [{ entryId, date, category, amount, company }],
 *   unbilledDelivered: [{ bookingId, client, deliveredDate, company }]
 * }
 * 
 * Calculations:
 * - net_profit = SUM(revenue) − SUM(expense)
 * - margin_pct = IF(SUM(revenue)=0, 0, net_profit / SUM(revenue))
 * - delivery_rate = delivered / total_bookings
 * 
 * =====================================================
 * RAW DATA EXPORTS - EXACT SCHEMAS
 * =====================================================
 * 
 * Raw Bookings (exact column order):
 * booking_id, client_id, client_name, company_id, company_name, mode, status, 
 * created_at, dispatched_at, delivered_at, revenue_amount, expense_amount, currency
 * 
 * Raw Entries (exact column order):
 * entry_id, type, amount, currency, entry_date, company_id, company_name, 
 * booking_id, category
 * 
 * Filenames:
 * - JJB_bookings_{start}_{end}_{basis}_{freq}.csv
 * - JJB_entries_{start}_{end}_{freq}.csv
 * - JJB_raw_{start}_{end}_{freq}.zip
 * 
 * Sorting:
 * - Bookings: delivered_at (nulls last), then booking_id
 * - Entries: entry_date, then entry_id
 * 
 * Row limits:
 * - If >200k rows, chunk as _partNN
 * 
 * ZIP Contents:
 * - Include README.txt with column definitions and basis notes
 */

interface ReportsProps {
  data?: any;
}

// Helper functions
const getFirstDayOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mock data
const COMPANIES = [
  { id: 'jjb-main', name: 'JJB Main' },
  { id: 'jjb-express', name: 'JJB Express' },
  { id: 'jjb-intl', name: 'JJB International' }
];

// Reusable KPI Tile Component
interface KPITileProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
}

function KPITile({ label, value, icon: Icon, trend, trendUp, isLoading, isEmpty }: KPITileProps) {
  if (isLoading) {
    return (
      <Card style={{ height: '150px', padding: '24px' }} className="border-[#E5E7EB] rounded-2xl">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card style={{ height: '150px', padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-[#FAFBFC]">
        <div className="flex items-center justify-center h-full text-[#6B7280] text-[13px]">
          No data
        </div>
      </Card>
    );
  }

  return (
    <Card 
      style={{ height: '150px', padding: '24px' }}
      className="border-[#E5E7EB] rounded-2xl bg-white hover:shadow-md transition-shadow"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
        <div className="flex items-center">
          <Icon className="w-6 h-6 text-[#6B7280]" strokeWidth={1.5} />
        </div>
        <p className="text-[14px] text-[#6B7280]">{label}</p>
        <p className="text-[32px] text-[#0A1D4D] leading-none">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 text-[12px] ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// Reusable Chart Card Component
interface ChartCardProps {
  title: string;
  subtitle: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  children: React.ReactNode;
}

function ChartCard({ title, subtitle, isLoading, isEmpty, children }: ChartCardProps) {
  if (isLoading) {
    return (
      <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl">
        <div className="flex flex-col gap-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-[#FAFBFC]">
        <div className="mb-4">
          <h3 className="text-[#0A1D4D]">{title}</h3>
          <p className="text-[13px] text-[#6B7280] mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center h-[320px] text-[#6B7280]">
          No chart data available
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-white">
      <div className="mb-4" style={{ marginBottom: '16px' }}>
        <h3 className="text-[#0A1D4D]">{title}</h3>
        <p className="text-[13px] text-[#6B7280] mt-1">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

// Reusable Table Component
interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableCardProps {
  title: string;
  subtitle: string;
  columns: TableColumn[];
  data: any[];
  isLoading?: boolean;
  isEmpty?: boolean;
  onExportCSV?: () => void;
}

function TableCard({ title, subtitle, columns, data, isLoading, isEmpty, onExportCSV }: TableCardProps) {
  if (isLoading) {
    return (
      <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-[#FAFBFC]">
        <div className="mb-4">
          <h3 className="text-[#0A1D4D]">{title}</h3>
          <p className="text-[13px] text-[#6B7280] mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center h-[200px] text-[#6B7280]">
          No table data available
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-white">
      <div className="flex items-start justify-between mb-4" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="text-[#0A1D4D]">{title}</h3>
          <p className="text-[13px] text-[#6B7280] mt-1">{subtitle}</p>
        </div>
        {onExportCSV && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="h-9 px-3 border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-4 text-[13px] text-[#6B7280]"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                style={{
                  backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                  height: '56px',
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-[14px] text-[#374151]">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Reports({ data }: ReportsProps) {
  // Filter state
  const defaultStartDate = getFirstDayOfMonth();
  const defaultEndDate = getToday();
  const defaultFrequency = "monthly";

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [frequency, setFrequency] = useState(defaultFrequency);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  
  // Popover state
  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false);
  
  const [appliedStartDate, setAppliedStartDate] = useState(defaultStartDate);
  const [appliedEndDate, setAppliedEndDate] = useState(defaultEndDate);
  const [appliedFrequency, setAppliedFrequency] = useState(defaultFrequency);
  const [appliedCompanies, setAppliedCompanies] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasData, setHasData] = useState(true);

  const hasDateError = endDate < startDate;
  const applyDisabled = !isDirty || hasDateError || isLoading;
  const downloadEnabled = !isDirty && !isLoading && hasData;

  const markDirty = () => setIsDirty(true);

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    markDirty();
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    markDirty();
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    markDirty();
  };

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId]
    );
    markDirty();
  };

  const handleApply = () => {
    if (applyDisabled) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setAppliedStartDate(startDate);
      setAppliedEndDate(endDate);
      setAppliedFrequency(frequency);
      setAppliedCompanies(selectedCompanies);
      setIsLoading(false);
      setIsDirty(false);
      setHasData(true);
    }, 600);
  };

  const handleResetToCurrentMonth = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setFrequency(defaultFrequency);
    setSelectedCompanies([]);
    markDirty();
  };

  const generateFilename = () => {
    return `JJB_report_${appliedStartDate}_${appliedEndDate}_${appliedFrequency}`;
  };

  const getCompanyQueryParam = () => {
    if (appliedCompanies.length === 0) return 'all';
    return appliedCompanies.join(',');
  };

  const handleExport = (type: string) => {
    toast.success("Raw export started", {
      description: "Your download will begin shortly."
    });
    console.log(`Exporting: ${type}, Filename: ${generateFilename()}`);
  };

  // Mock data
  const kpiData = [
    { label: "Bookings", value: "318", icon: Package },
    { label: "Delivered", value: "210", icon: CheckCircle },
    { label: "Delivery rate", value: "66%", icon: Truck },
    { label: "Revenue", value: "₱9.8M", icon: TrendingUp },
    { label: "Expenses", value: "₱7.4M", icon: TrendingDown },
    { label: "Margin", value: "24.5%", icon: DollarSign }
  ];

  const timeSeriesData = [
    { period: "2024-01", revenue: 720000, expenses: 580000, netProfit: 140000 },
    { period: "2024-02", revenue: 810000, expenses: 620000, netProfit: 190000 },
    { period: "2024-03", revenue: 850000, expenses: 640000, netProfit: 210000 },
    { period: "2024-04", revenue: 920000, expenses: 690000, netProfit: 230000 },
    { period: "2024-05", revenue: 980000, expenses: 720000, netProfit: 260000 },
    { period: "2024-06", revenue: 1050000, expenses: 780000, netProfit: 270000 },
    { period: "2024-07", revenue: 1100000, expenses: 810000, netProfit: 290000 },
    { period: "2024-08", revenue: 1150000, expenses: 840000, netProfit: 310000 },
    { period: "2024-09", revenue: 1180000, expenses: 860000, netProfit: 320000 },
    { period: "2024-10", revenue: 1240000, expenses: 810000, netProfit: 430000 },
  ];

  const categoryData = [
    { category: "Fuel", amount: 2950000, pct: 40 },
    { category: "Maintenance", amount: 1800000, pct: 25 },
    { category: "Toll", amount: 1250000, pct: 17 },
    { category: "Allowances", amount: 750000, pct: 10 },
    { category: "Insurance", amount: 400000, pct: 5 },
    { category: "Other", amount: 200000, pct: 3 }
  ];

  const topClientsData = [
    { client: "Premier Trading Group", bookings: 72, revenue: "₱2.3M", marginPct: "28%" },
    { client: "Acme Trading Corp", bookings: 65, revenue: "₱1.9M", marginPct: "24%" },
    { client: "Delta Trading Ltd", bookings: 51, revenue: "₱1.5M", marginPct: "22%" },
    { client: "Apex Supply Co", bookings: 48, revenue: "₱1.3M", marginPct: "25%" },
    { client: "Sterling Supply Chain", bookings: 36, revenue: "₱1.0M", marginPct: "26%" }
  ];

  const negativeBookingsData = [
    { bookingId: "ND-2025-0156", client: "ABC Trading", revenue: "₱45,000", expense: "₱52,000", net: "-₱7,000", company: "JJB Main" },
    { bookingId: "ND-2025-0203", client: "XYZ Logistics", revenue: "₱38,000", expense: "₱41,500", net: "-₱3,500", company: "JJB Express" },
    { bookingId: "ND-2025-0287", client: "FastMove Inc", revenue: "₱62,000", expense: "₱65,200", net: "-₱3,200", company: "JJB Main" }
  ];

  const unlinkedExpensesData = [
    { entryId: "E-4521", date: "2024-10-18", category: "Fuel", amount: "₱12,500", company: "JJB Main" },
    { entryId: "E-4598", date: "2024-10-22", category: "Maintenance", amount: "₱8,200", company: "JJB Express" },
    { entryId: "E-4632", date: "2024-10-25", category: "Toll", amount: "₱3,400", company: "JJB Main" }
  ];

  const unbilledDeliveredData = [
    { bookingId: "ND-2025-0145", client: "Acme Trading Corp", deliveredDate: "2024-10-15", company: "JJB Main" },
    { bookingId: "ND-2025-0198", client: "Global Imports Ltd", deliveredDate: "2024-10-20", company: "JJB Express" }
  ];

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div style={{ padding: '12px 16px' }}>
          {/* Main Filter Row */}
          <div className="flex items-start gap-3 flex-wrap">
            {/* Start Date */}
            <div className="flex flex-col">
              <label className="text-[11px] text-[#6B7280] mb-1">Start date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={`h-11 border-[#E5E7EB] rounded-lg w-[150px] ${hasDateError ? 'border-red-500' : ''}`}
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="text-[11px] text-[#6B7280] mb-1">End date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={`h-11 border-[#E5E7EB] rounded-lg w-[150px] ${hasDateError ? 'border-red-500' : ''}`}
              />
            </div>

            {/* Frequency */}
            <div className="flex flex-col">
              <label className="text-[11px] text-[#6B7280] mb-1">Frequency</label>
              <Select value={frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger className="w-[130px] border-[#E5E7EB] rounded-lg h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Multi-Select */}
            <div className="flex flex-col">
              <label className="text-[11px] text-[#6B7280] mb-1">Company</label>
              <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] h-11 justify-between border-[#E5E7EB] rounded-lg"
                  >
                    <span className="text-[14px] truncate">
                      {selectedCompanies.length === 0 ? 'All companies' : `${selectedCompanies.length} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      <CommandEmpty>No company found.</CommandEmpty>
                      <CommandGroup>
                        {COMPANIES.map((company) => (
                          <CommandItem
                            key={company.id}
                            onSelect={() => toggleCompany(company.id)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCompanies.includes(company.id) ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {company.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Spacer to push buttons to right */}
            <div className="flex-1"></div>

            {/* Apply Button */}
            <Button
              onClick={handleApply}
              disabled={applyDisabled}
              className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-xl h-11 px-5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading
                </>
              ) : (
                'Apply'
              )}
            </Button>

            {/* Download Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={!downloadEnabled}
                          className="border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-xl h-11 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[280px]">
                        <DropdownMenuItem onClick={() => handleExport('aggregates-csv')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export Aggregates (.csv)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('aggregates-xlsx')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export Aggregates (.xlsx)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleExport('raw-bookings')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export Raw Bookings (.csv)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('raw-entries')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export Raw Entries (.csv)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleExport('raw-bundle')}>
                          <Archive className="w-4 h-4 mr-2" />
                          Export Raw Bundle (.zip)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-2 text-[11px] text-[#6B7280] font-mono">
                          {generateFilename()}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TooltipTrigger>
                {!downloadEnabled && isDirty && (
                  <TooltipContent>
                    <p>Apply filters first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Helper Text */}
          <div className="mt-2 flex flex-col gap-1">
            {hasDateError ? (
              <div className="flex items-center gap-1 text-[12px] text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>End date must be after start date</span>
              </div>
            ) : (
              <p className="text-[11px] text-[#6B7280]">Inclusive. Timezone: PH</p>
            )}
            
            {!isDirty && hasData && (
              <div className="text-[11px] text-[#6B7280] bg-[#F9FAFB] px-2 py-1 rounded border border-[#E5E7EB] inline-block">
                <span className="font-mono">
                  Query: start={appliedStartDate}&end={appliedEndDate}&freq={appliedFrequency}&company={getCompanyQueryParam()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full bg-background">
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Page Header */}
            <div>
              <h1 className="text-[#0A1D4D]">Reporting</h1>
              <p className="text-[#6B7280] mt-1">Analytics, KPIs, trends, and operational insights</p>
            </div>

            {/* Empty State */}
            {!hasData && !isLoading && (
              <Card style={{ padding: '48px 24px' }} className="border-[#E5E7EB] rounded-2xl bg-[#FAFBFC]">
                <div className="flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#F25C05]/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-[#F25C05]" />
                  </div>
                  <div>
                    <h3 className="text-[#0A1D4D] mb-2">No data for the selected period</h3>
                    <p className="text-[14px] text-[#6B7280]">Try adjusting your date range or filters</p>
                  </div>
                  <Button
                    onClick={handleResetToCurrentMonth}
                    variant="outline"
                    className="h-11 px-5 rounded-xl border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] mt-2"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to current month
                  </Button>
                </div>
              </Card>
            )}

            {/* KPI Tiles */}
            {hasData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpiData.map((kpi, index) => (
                  <KPITile
                    key={index}
                    label={kpi.label}
                    value={kpi.value}
                    icon={kpi.icon}
                    isLoading={isLoading}
                    isEmpty={!hasData}
                  />
                ))}
              </div>
            )}

            {/* Approvals Snapshot & Quick Actions Row */}
            {hasData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Approvals Snapshot */}
                <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[#0A1D4D]">Approvals Snapshot</h3>
                      <p className="text-[13px] text-[#6B7280] mt-1">Pending items requiring attention</p>
                    </div>
                    <FileCheck className="w-5 h-5 text-[#6B7280]" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#FFF6F2] rounded-xl border border-[#F25C05]/20 hover:border-[#F25C05] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F25C05] rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] text-[#374151]">Pending Entries</p>
                          <p className="text-[12px] text-[#6B7280]">Accounting approvals</p>
                        </div>
                      </div>
                      <div className="text-[24px] text-[#F25C05]">12</div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-[#0A1D4D] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0A1D4D] rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] text-[#374151]">RFP Requests</p>
                          <p className="text-[12px] text-[#6B7280]">Payment requests</p>
                        </div>
                      </div>
                      <div className="text-[24px] text-[#0A1D4D]">5</div>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-white">
                  <div className="mb-4">
                    <h3 className="text-[#0A1D4D]">Quick Actions</h3>
                    <p className="text-[13px] text-[#6B7280] mt-1">Jump to common tasks</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start p-4 border-[#E5E7EB] hover:border-[#F25C05] hover:bg-[#FFF6F2] rounded-xl transition-all"
                    >
                      <div className="w-10 h-10 bg-[#F25C05]/10 rounded-lg flex items-center justify-center mb-2">
                        <Truck className="w-5 h-5 text-[#F25C05]" />
                      </div>
                      <span className="text-[14px] text-[#0A1D4D]">New Booking</span>
                      <span className="text-[11px] text-[#6B7280] mt-1">Create shipment</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start p-4 border-[#E5E7EB] hover:border-[#0A1D4D] hover:bg-[#EEF2FF] rounded-xl transition-all"
                    >
                      <div className="w-10 h-10 bg-[#0A1D4D]/10 rounded-lg flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-[#0A1D4D]" />
                      </div>
                      <span className="text-[14px] text-[#0A1D4D]">New Client</span>
                      <span className="text-[11px] text-[#6B7280] mt-1">Add contact</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start p-4 border-[#E5E7EB] hover:border-[#10B981] hover:bg-[#ECFDF5] rounded-xl transition-all"
                    >
                      <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center mb-2">
                        <Calculator className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <span className="text-[14px] text-[#0A1D4D]">New Entry</span>
                      <span className="text-[11px] text-[#6B7280] mt-1">Record transaction</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start p-4 border-[#E5E7EB] hover:border-[#6B7280] hover:bg-[#F9FAFB] rounded-xl transition-all"
                    >
                      <div className="w-10 h-10 bg-[#6B7280]/10 rounded-lg flex items-center justify-center mb-2">
                        <Download className="w-5 h-5 text-[#6B7280]" />
                      </div>
                      <span className="text-[14px] text-[#0A1D4D]">Export Data</span>
                      <span className="text-[11px] text-[#6B7280] mt-1">Download CSV</span>
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Charts */}
            {hasData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard
                  title="Performance over time"
                  subtitle="Revenue, expenses, and net profit trends"
                  isLoading={isLoading}
                  isEmpty={!hasData}
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="period" 
                        stroke="#6B7280" 
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6B7280' }}
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6B7280' }}
                        tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any) => `₱${value.toLocaleString()}`}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        name="Revenue"
                        dot={{ fill: '#10b981', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#ef4444" 
                        strokeWidth={3} 
                        name="Expenses"
                        dot={{ fill: '#ef4444', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netProfit" 
                        stroke="#0A1D4D" 
                        strokeWidth={3} 
                        name="Net Profit"
                        dot={{ fill: '#0A1D4D', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Expense by category"
                  subtitle="Top expense categories breakdown"
                  isLoading={isLoading}
                  isEmpty={!hasData}
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={categoryData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        type="number"
                        stroke="#6B7280" 
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6B7280' }}
                        tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="category"
                        stroke="#6B7280" 
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6B7280' }}
                        width={100}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Amount']}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="#F25C05" 
                        radius={[0, 8, 8, 0]}
                        label={{ position: 'right', fill: '#6B7280', fontSize: 12, formatter: (val: any) => `${((val / 7350000) * 100).toFixed(0)}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}

            {/* Tables */}
            {hasData && (
              <div className="grid grid-cols-1 gap-4">
                <TableCard
                  title="Top clients"
                  subtitle="By revenue and shipment volume"
                  columns={[
                    { key: 'client', label: 'Client', width: '40%' },
                    { key: 'bookings', label: 'Bookings', width: '20%' },
                    { key: 'revenue', label: 'Revenue', width: '20%' },
                    { key: 'marginPct', label: 'Margin %', width: '20%' }
                  ]}
                  data={topClientsData}
                  isLoading={isLoading}
                  isEmpty={!hasData}
                  onExportCSV={() => handleExport('top-clients-csv')}
                />

                <TableCard
                  title="Negative-margin bookings"
                  subtitle="Bookings with expenses exceeding revenue"
                  columns={[
                    { key: 'bookingId', label: 'Booking', width: '20%' },
                    { key: 'client', label: 'Client', width: '25%' },
                    { key: 'revenue', label: 'Revenue', width: '15%' },
                    { key: 'expense', label: 'Expense', width: '15%' },
                    { 
                      key: 'net', 
                      label: 'Net', 
                      width: '15%',
                      render: (value) => <span className="text-red-600">{value}</span>
                    },
                    { key: 'company', label: 'Company', width: '10%' }
                  ]}
                  data={negativeBookingsData}
                  isLoading={isLoading}
                  isEmpty={!hasData}
                  onExportCSV={() => handleExport('negative-bookings-csv')}
                />

                {/* Data Hygiene */}
                <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-white">
                  <div className="mb-4" style={{ marginBottom: '16px' }}>
                    <h3 className="text-[#0A1D4D]">Data hygiene</h3>
                    <p className="text-[13px] text-[#6B7280] mt-1">Entries requiring attention</p>
                  </div>

                  <Tabs defaultValue="unlinked" className="w-full">
                    <TabsList className="bg-[#F9FAFB] p-1">
                      <TabsTrigger value="unlinked" className="relative">
                        Unlinked expenses
                        <Badge 
                          variant="secondary" 
                          className="ml-2 h-5 px-1.5 bg-[#F25C05] text-white text-[11px]"
                        >
                          {unlinkedExpensesData.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="unbilled" className="relative">
                        Unbilled delivered
                        <Badge 
                          variant="secondary" 
                          className="ml-2 h-5 px-1.5 bg-[#F25C05] text-white text-[11px]"
                        >
                          {unbilledDeliveredData.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="unlinked" className="mt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                            <tr>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '20%' }}>Entry</th>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '20%' }}>Date</th>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '25%' }}>Category</th>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '20%' }}>Amount</th>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '15%' }}>Company</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unlinkedExpensesData.map((row, index) => (
                              <tr
                                key={index}
                                className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                                style={{
                                  backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                                  height: '56px',
                                }}
                              >
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.entryId}</td>
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.date}</td>
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.category}</td>
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.amount}</td>
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.company}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="unbilled" className="mt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                            <tr>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '25%' }}>Booking</th>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '35%' }}>Client</th>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '25%' }}>Delivered date</th>
                              <th className="text-left py-3 px-4 text-[13px] text-[#6B7280]" style={{ width: '15%' }}>Company</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unbilledDeliveredData.map((row, index) => (
                              <tr
                                key={index}
                                className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                                style={{
                                  backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                                  height: '56px',
                                }}
                              >
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.bookingId}</td>
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.client}</td>
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.deliveredDate}</td>
                                <td className="py-3 px-4 text-[14px] text-[#374151]">{row.company}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Raw Data Section */}
                <Card style={{ padding: '24px' }} className="border-[#E5E7EB] rounded-2xl bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-[#F25C05]" />
                        <h3 className="text-[#0A1D4D]">Raw Data</h3>
                      </div>
                      <p className="text-[14px] text-[#6B7280] mb-4">
                        Export clean, schema-stable files for audit and analysis.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleExport('raw-bookings')}
                          disabled={!downloadEnabled}
                          className="h-11 px-5 bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-xl disabled:opacity-50"
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          Export Raw Bookings (.csv)
                        </Button>
                        <Button
                          onClick={() => handleExport('raw-entries')}
                          disabled={!downloadEnabled}
                          className="h-11 px-5 bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-xl disabled:opacity-50"
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          Export Raw Entries (.csv)
                        </Button>
                      </div>
                      <p className="text-[12px] text-[#6B7280] mt-3">
                        Columns match the data dictionary in the ZIP bundle.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
