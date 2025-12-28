import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  FileText,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "./ui/toast-utils";
import { cn } from "./ui/utils";
import { SalesProfitReport } from "./SalesProfitReport";
import { CompanyPnLReport } from "./reports/CompanyPnLReport";
import { BookingProfitabilityReport } from "./reports/BookingProfitabilityReport";
import { ClientProfitabilityReport } from "./reports/ClientProfitabilityReport";
import { ReceivablesReport } from "./reports/ReceivablesReport";
import { MonthPicker } from "./reports/MonthPicker";
import { DateRangePicker } from "./reports/DateRangePicker";
import { format, isWithinInterval, parseISO } from "date-fns";
import { buildMockFinancialsFromBookings, sumField, type MockFinancialRecord } from "./reports/mockFinancials";

type ReportType = "Sales Profit" | "Company P&L" | "Per Booking Profitability" | "Client Profitability" | "Receivables";

const COMPANIES = ["CCE", "ZNICF", "JLCS", "All"];

// Interfaces matching App.tsx
interface Booking {
  id: string;
  trackingNo: string;
  client: string;
  pickup: string;
  dropoff: string;
  status: "Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled" | "Closed";
  deliveryDate: string;
  deliveryType?: "Import" | "Export" | "Domestic";
  delivered_at?: string;
  profit: number;
  driver?: string;
  vehicle?: string;
  notes?: string;
}

interface Expense {
  id: string;
  bookingId: string;
  bookingNo: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  enteredBy: string;
}

interface Payment {
  id: string;
  bookingId: string;
  bookingNo: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface ReportsModuleProps {
  bookings: Booking[];
  expenses: Expense[];
  payments: Payment[];
  onViewBooking: (bookingId: string) => void;
}

export function ReportsModule({ bookings, expenses, payments, onViewBooking }: ReportsModuleProps) {
  const [activeReport, setActiveReport] = useState<ReportType>("Sales Profit");
  const [periodType, setPeriodType] = useState<"Month" | "Custom">("Month");
  const [reportPeriod, setReportPeriod] = useState("Oct 2025");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [reportCompany, setReportCompany] = useState("All");
  const [reportSource, setReportSource] = useState("Both");
  const [showReportPreview, setShowReportPreview] = useState(true);
  const [filtersChanged, setFiltersChanged] = useState(false);

  // Generate mock financials from ALL bookings (memoized for performance)
  const allMockFinancials = useMemo(() => {
    return buildMockFinancialsFromBookings(bookings);
  }, [bookings]);

  // Filter mock financials based on period, company, and source
  const filteredFinancials = useMemo((): MockFinancialRecord[] => {
    let filtered = [...allMockFinancials];

    // Filter by date period
    if (periodType === "Custom" && customStartDate && customEndDate) {
      filtered = filtered.filter(record => {
        const booking = bookings.find(b => b.id === record.bookingId);
        if (!booking) return false;
        const bookingDate = parseISO(booking.deliveryDate);
        return isWithinInterval(bookingDate, { start: customStartDate, end: customEndDate });
      });
    } else {
      // Filter by month
      const [month, year] = reportPeriod.split(" ");
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      const yearNum = parseInt(year);
      filtered = filtered.filter(record => {
        const booking = bookings.find(b => b.id === record.bookingId);
        if (!booking) return false;
        const bookingDate = parseISO(booking.deliveryDate);
        return bookingDate.getMonth() === monthIndex && bookingDate.getFullYear() === yearNum;
      });
    }

    // Filter by company
    if (reportCompany !== "All") {
      filtered = filtered.filter(record => record.companyName === reportCompany);
    }
    
    // Filter by delivery type (source)
    if (reportSource !== "Both") {
      if (reportSource === "Import" || reportSource === "Export" || reportSource === "Domestic") {
        filtered = filtered.filter(record => {
          const booking = bookings.find(b => b.id === record.bookingId);
          return booking && booking.deliveryType === reportSource;
        });
      }
    }

    return filtered;
  }, [allMockFinancials, bookings, periodType, customStartDate, customEndDate, reportPeriod, reportCompany, reportSource]);

  // Transform for Sales Profit Report
  const getSalesProfitData = () => {
    return filteredFinancials.map(record => ({
      id: record.bookingId,
      jobNo: record.bookingNo,
      date: record.date,
      companyName: record.clientName,
      billingNo: record.billingReference,
      particulars: record.serviceDesc,
      itemizedCost: record.itemizedCost,
      expenses: record.opExpenses,
      adminCost: record.adminCost,
      totalExpenses: record.totalExpenses,
      collectedAmount: record.collectedAmount,
      grossProfit: record.profit,
    }));
  };

  // Company P&L Data
  const getPnLData = () => {
    const entries: any[] = [];

    // Add revenue entries
    filteredFinancials.forEach(record => {
      entries.push({
        type: "Revenue",
        category: "Service Revenue",
        description: `${record.bookingNo} - ${record.clientName}`,
        amount: record.revenue,
      });
    });

    // Add expense entries
    filteredFinancials.forEach(record => {
      entries.push({
        type: "Expense",
        category: "Itemized Cost",
        description: `${record.bookingNo} - Itemized`,
        amount: record.itemizedCost,
      });
      entries.push({
        type: "Expense",
        category: "Operations",
        description: `${record.bookingNo} - Operations`,
        amount: record.opExpenses,
      });
      entries.push({
        type: "Expense",
        category: "Admin",
        description: `${record.bookingNo} - Admin`,
        amount: record.adminCost,
      });
    });

    return entries;
  };

  // Per Booking Profitability Data
  const getBookingProfitabilityData = () => {
    return filteredFinancials
      .map(record => ({
        bookingNo: record.bookingNo,
        client: record.clientName,
        company: record.companyName,
        revenue: record.revenue,
        expenses: record.totalExpenses,
        adminCost: record.adminCost,
        profit: record.profit,
        profitMargin: record.profitMargin,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Client Profitability Data
  const getClientProfitabilityData = () => {
    const clientMap = new Map();

    filteredFinancials.forEach(record => {
      if (!clientMap.has(record.clientName)) {
        clientMap.set(record.clientName, {
          clientName: record.clientName,
          company: record.companyName,
          bookingIds: new Set(),
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
        });
      }

      const client = clientMap.get(record.clientName);
      client.bookingIds.add(record.bookingId);
      client.totalRevenue += record.revenue;
      client.totalExpenses += record.totalExpenses;
      client.totalProfit += record.profit;
    });

    return Array.from(clientMap.values()).map(client => {
      const profitMargin = client.totalRevenue > 0 ? (client.totalProfit / client.totalRevenue) * 100 : 0;
      const numBookings = client.bookingIds.size;
      const avgRevenuePerBooking = numBookings > 0 ? client.totalRevenue / numBookings : 0;

      return {
        clientName: client.clientName,
        company: client.company,
        numBookings,
        totalRevenue: client.totalRevenue,
        totalExpenses: client.totalExpenses,
        profit: client.totalProfit,
        profitMargin,
        avgRevenuePerBooking,
      };
    });
  };

  // Receivables Data - only show unpaid/partial
  const getReceivablesData = () => {
    return filteredFinancials
      .filter(record => record.paymentStatus !== "PAID")
      .map(record => ({
        companyName: record.companyName,
        clientName: record.clientName,
        bookingNo: record.bookingNo,
        amount: record.revenue,
        checkNoOrRef: record.billingReference,
        invoiceAmount: record.revenue,
        collectedDate: record.paymentStatus === "PAID" ? record.date : "—",
        status: record.paymentStatus,
      }));
  };

  // Expense Breakdown Data
  const getExpenseBreakdownData = () => {
    const categoryMap = new Map();

    filteredFinancials.forEach(record => {
      // Determine category from service description
      let category = "Operations";
      const desc = record.serviceDesc.toLowerCase();
      if (desc.includes("fuel") || desc.includes("truck")) {
        category = "Fuel";
      } else if (desc.includes("crating") || desc.includes("packing")) {
        category = "Crating / Packing";
      } else if (desc.includes("sea") || desc.includes("air")) {
        category = "Freight";
      }

      const key = `${category}-${record.companyName}`;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          category,
          company: record.companyName,
          totalAmount: 0,
        });
      }
      const cat = categoryMap.get(key);
      cat.totalAmount += record.totalExpenses;
    });

    const totalExpenses = sumField(filteredFinancials, "totalExpenses");

    return Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentOfTotal: totalExpenses > 0 ? (cat.totalAmount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const generatedAt = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const companyNameForReport = reportCompany === "All" ? "" : reportCompany;

  useEffect(() => {
    setShowReportPreview(true);
    setFiltersChanged(false);
  }, [activeReport]);

  const handlePeriodChange = (value: string) => {
    setReportPeriod(value);
    setFiltersChanged(true);
  };

  const handlePeriodTypeChange = (value: "Month" | "Custom") => {
    setPeriodType(value);
    setFiltersChanged(true);
  };

  const handleCustomStartDateChange = (date: Date | undefined) => {
    setCustomStartDate(date);
    if (date && customEndDate) {
      setFiltersChanged(true);
    }
  };

  const handleCustomEndDateChange = (date: Date | undefined) => {
    setCustomEndDate(date);
    if (customStartDate && date) {
      setFiltersChanged(true);
    }
  };

  const handleCompanyChange = (value: string) => {
    setReportCompany(value);
    setFiltersChanged(true);
  };

  const handleSourceChange = (value: string) => {
    setReportSource(value);
    setFiltersChanged(true);
  };

  const handlePreviewClick = () => {
    setShowReportPreview(true);
    setFiltersChanged(false);
    toast.success("Report refreshed");
  };

  const getDisplayPeriod = () => {
    if (periodType === "Custom" && customStartDate && customEndDate) {
      return `${format(customStartDate, "MMM dd, yyyy")} - ${format(customEndDate, "MMM dd, yyyy")}`;
    }
    return reportPeriod;
  };

  // Report tabs configuration
  const reportTabs = [
    { id: "Sales Profit" as ReportType, label: "Sales Profit", icon: TrendingUp },
    { id: "Company P&L" as ReportType, label: "Company P&L", icon: FileText },
    { id: "Per Booking Profitability" as ReportType, label: "Per Booking Profitability", icon: Package },
    { id: "Client Profitability" as ReportType, label: "Client Profitability", icon: Users },
    { id: "Receivables" as ReportType, label: "Receivables", icon: Wallet },
  ];

  return (
    <div 
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
      }}
    >
      {/* Main Content */}
      <div
        style={{
          padding: "32px 48px",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        {/* Page Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#12332B", marginBottom: "4px", letterSpacing: "-1.2px" }}>
              Reports
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              Reports are generated from the current Bookings list. Adjust filters to change the report.
            </p>
          </div>
        </div>

        {/* Pill-style Report Navigation */}
        <div style={{ marginBottom: "16px" }}>
          <div 
            className="flex items-center gap-2 bg-white border border-[#E6E9F0] rounded-[20px]"
            style={{
              height: '56px',
              padding: '8px 12px',
            }}
          >
            {reportTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] transition-all whitespace-nowrap"
                  )}
                  style={{ 
                    fontWeight: activeReport === tab.id ? 600 : 500,
                    backgroundColor: activeReport === tab.id ? "#E4EFEA" : "transparent",
                    border: activeReport === tab.id ? "1.5px solid #5FC4A1" : "1.5px solid transparent",
                    color: activeReport === tab.id ? "#237F66" : "#6B7280",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Container */}
        <div 
          style={{
            background: "transparent",
            borderRadius: "12px",
            border: "1px solid #E5E9F0",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "24px" }}>

            {/* Filters Bar */}
            <div 
              className="border border-[#E5E7EB] rounded-[16px] bg-white"
              style={{ 
                padding: '16px 20px',
                marginBottom: '24px',
              }}
            >
              <div className="flex items-center gap-4 flex-wrap">
                {/* Period Mode Selector */}
                <div className="flex-shrink-0">
                  <Select value={periodType} onValueChange={handlePeriodTypeChange}>
                    <SelectTrigger 
                      className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                      style={{ width: '110px' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Month">Month</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Period Value */}
                <div className="flex-shrink-0">
                  {periodType === "Month" ? (
                    <MonthPicker
                      value={reportPeriod}
                      onChange={handlePeriodChange}
                    />
                  ) : (
                    <DateRangePicker
                      startDate={customStartDate}
                      endDate={customEndDate}
                      onStartDateChange={handleCustomStartDateChange}
                      onEndDateChange={handleCustomEndDateChange}
                    />
                  )}
                </div>

                {/* Company */}
                <div className="flex-shrink-0">
                  <Select value={reportCompany} onValueChange={handleCompanyChange}>
                    <SelectTrigger 
                      className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                      style={{ width: '140px' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div className="flex-shrink-0">
                  <Select value={reportSource} onValueChange={handleSourceChange}>
                    <SelectTrigger 
                      className="h-11 rounded-full border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 text-[13px] px-4"
                      style={{ width: '140px' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Both">Both</SelectItem>
                      <SelectItem value="Import">Import</SelectItem>
                      <SelectItem value="Export">Export</SelectItem>
                      <SelectItem value="Domestic">Domestic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-grow"></div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={handlePreviewClick}
                    className="bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-full h-11 px-5"
                    style={{ fontWeight: 600 }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success("Exporting to Excel...");
                    }}
                    variant="outline"
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-full h-11 px-5"
                    style={{ fontWeight: 600 }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </Button>
                  <Button
                    onClick={() => {
                      window.print();
                      toast.success("Opening print dialog...");
                    }}
                    variant="outline"
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D] rounded-full h-11 px-5"
                    style={{ fontWeight: 600 }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>

              {filtersChanged && (
                <div className="mt-3 text-[12px] text-[#6B7280] italic">
                  Filters updated. Click Preview to refresh.
                </div>
              )}
            </div>

            {/* Report Preview */}
            <div>
              {activeReport === "Sales Profit" && (
                <SalesProfitReport
                  entries={getSalesProfitData()}
                  month={reportPeriod.split(" ")[0]}
                  year={reportPeriod.split(" ")[1]}
                  companyName={companyNameForReport}
                />
              )}
              
              {activeReport === "Company P&L" && (
                <CompanyPnLReport
                  entries={getPnLData()}
                  period={getDisplayPeriod()}
                  generatedAt={generatedAt}
                  companyName={companyNameForReport}
                />
              )}
              
              {activeReport === "Per Booking Profitability" && (
                <BookingProfitabilityReport
                  entries={getBookingProfitabilityData()}
                  period={getDisplayPeriod()}
                  generatedAt={generatedAt}
                  companyName={companyNameForReport}
                />
              )}
              
              {activeReport === "Client Profitability" && (
                <ClientProfitabilityReport
                  entries={getClientProfitabilityData()}
                  period={getDisplayPeriod()}
                  generatedAt={generatedAt}
                  companyName={companyNameForReport}
                />
              )}
              
              {activeReport === "Receivables" && (
                <ReceivablesReport
                  entries={getReceivablesData()}
                  period={getDisplayPeriod()}
                  generatedAt={generatedAt}
                  companyName={companyNameForReport}
                />
              )}

              {/* Summary Info */}
              <div 
                className="mt-4 text-center text-[13px] text-[#94A3B8]"
                style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}
              >
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <span><strong>Period:</strong> {getDisplayPeriod()}</span>
                  <span>•</span>
                  <span><strong>Company:</strong> {reportCompany}</span>
                  <span>•</span>
                  <span><strong>Source:</strong> {reportSource}</span>
                  <span>•</span>
                  <span><strong>Bookings:</strong> {filteredFinancials.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}