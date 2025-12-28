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
  X,
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
import { ExpenseBreakdownReport } from "./reports/ExpenseBreakdownReport";
import { MonthPicker } from "./reports/MonthPicker";
import { DateRangePicker } from "./reports/DateRangePicker";
import { BookingPickerModal } from "./reports/BookingPickerModal";
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
  
  // Per Booking Profitability: single booking selection and client filter
  const [selectedBookingNo, setSelectedBookingNo] = useState<string | null>(null);
  const [showBookingPicker, setShowBookingPicker] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("All Clients");

  // Generate mock financials from ALL bookings (memoized for performance)
  const allMockFinancials = useMemo(() => {
    return buildMockFinancialsFromBookings(bookings);
  }, [bookings]);

  // Get unique client names from bookings
  const uniqueClients = useMemo(() => {
    const clientSet = new Set<string>();
    bookings.forEach(booking => {
      if (booking.client) {
        clientSet.add(booking.client);
      }
    });
    return Array.from(clientSet).sort();
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
    let data = filteredFinancials
      .map(record => ({
        bookingNo: record.bookingNo,
        client: record.clientName,
        company: record.companyName,
        revenue: record.revenue,
        expenses: record.totalExpenses,
        adminCost: record.adminCost,
        profit: record.profit,
        profitMargin: record.profitMargin,
      }));
    
    // Filtering priority: Booking takes precedence over Client
    if (selectedBookingNo) {
      // If a specific booking is selected, filter to that booking only (ignore client filter)
      data = data.filter(d => d.bookingNo === selectedBookingNo);
    } else if (selectedClient !== "All Clients") {
      // If a client is selected and no booking is selected, filter by client
      data = data.filter(d => d.client === selectedClient);
    }
    
    return data.sort((a, b) => b.revenue - a.revenue);
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

  const handleClientChange = (value: string) => {
    setSelectedClient(value);
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
    <div className="flex flex-col pb-6" style={{ width: '1440px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Page Header */}
      <div 
        className="flex items-center justify-between border-b"
        style={{ 
          paddingTop: '16px',
          paddingBottom: '12px',
          paddingLeft: '32px',
          paddingRight: '32px',
          backgroundColor: '#FFFFFF',
          width: '100%',
          borderColor: '#EDF0F3',
        }}
      >
        <div className="flex flex-col" style={{ gap: '3px' }}>
          <h1 
            className="text-[#0A1D4D]"
            style={{ 
              fontSize: '26px',
              fontWeight: 700,
              lineHeight: '1.2',
            }}
          >
            Reports
          </h1>
          <p 
            className="text-[#94A3B8]"
            style={{ 
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '1.4',
            }}
          >
            Reports are generated from the current Bookings list. Adjust filters to change the report.
          </p>
        </div>
      </div>

      {/* Pill-style Report Navigation (matching Booking File & Accounting) */}
      <div 
        className="bg-white"
        style={{ 
          paddingTop: '16px',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingBottom: '16px',
        }}
      >
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
                  "flex items-center gap-2 px-5 py-2 rounded-2xl text-[14px] transition-all whitespace-nowrap",
                  activeReport === tab.id
                    ? "bg-[#EDF0F7] text-[#0A1D4D]"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                )}
                style={{ 
                  fontWeight: activeReport === tab.id ? 600 : 500,
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
        className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden"
        style={{ 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginTop: '16px',
          marginLeft: '24px',
          marginRight: '24px',
        }}
      >
        <div className="p-6">

          {/* Filters Bar */}
          <div 
            className="border border-[#E5E7EB] bg-white"
            style={{ 
              padding: activeReport === "Per Booking Profitability" ? '14px 16px' : '12px',
              marginBottom: '16px',
              borderRadius: '8px',
            }}
          >
            {/* 2-ROW LAYOUT: Per Booking Profitability */}
            {activeReport === "Per Booking Profitability" ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Row 1: Time + Actions */}
                <div className="flex items-center" style={{ gap: '12px' }}>
                  {/* Period Type */}
                  <div className="flex items-center flex-shrink-0" style={{ 
                    gap: '6px',
                    opacity: selectedBookingNo ? 0.5 : 1,
                    pointerEvents: selectedBookingNo ? 'none' : 'auto'
                  }}>
                    <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>Period:</span>
                    <Select value={periodType} onValueChange={handlePeriodTypeChange}>
                      <SelectTrigger 
                        className="border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                        style={{ 
                          width: '110px',
                          height: '36px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          padding: '8px 12px',
                        }}
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
                  <div className="flex items-center flex-shrink-0" style={{ 
                    gap: '6px',
                    opacity: selectedBookingNo ? 0.5 : 1,
                    pointerEvents: selectedBookingNo ? 'none' : 'auto'
                  }}>
                    <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>For:</span>
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

                  {/* Spacer */}
                  <div className="flex-grow"></div>

                  {/* Actions */}
                  <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
                    <Button
                      onClick={handlePreviewClick}
                      className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white"
                      style={{ 
                        width: '88px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '0',
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => {
                        toast.success("Exporting to Excel...");
                      }}
                      variant="outline"
                      className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D]"
                      style={{ 
                        width: '88px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '0',
                      }}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Export
                    </Button>
                    <Button
                      onClick={() => {
                        window.print();
                        toast.success("Opening print dialog...");
                      }}
                      variant="outline"
                      className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D]"
                      style={{ 
                        width: '88px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '0',
                      }}
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>

                {/* Row 2: Data Filters */}
                <div className="flex items-center" style={{ gap: '12px' }}>
                  {/* Company */}
                  <div className="flex items-center flex-shrink-0" style={{ 
                    gap: '6px',
                    opacity: selectedBookingNo ? 0.5 : 1,
                    pointerEvents: selectedBookingNo ? 'none' : 'auto'
                  }}>
                    <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>Company:</span>
                    <Select value={reportCompany} onValueChange={handleCompanyChange}>
                      <SelectTrigger 
                        className="border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                        style={{ 
                          width: '170px',
                          height: '36px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          padding: '8px 12px',
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Companies</SelectItem>
                        {COMPANIES.filter(c => c !== "All").map(company => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source */}
                  <div className="flex items-center flex-shrink-0" style={{ 
                    gap: '6px',
                    opacity: selectedBookingNo ? 0.5 : 1,
                    pointerEvents: selectedBookingNo ? 'none' : 'auto'
                  }}>
                    <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>From:</span>
                    <Select value={reportSource} onValueChange={handleSourceChange}>
                      <SelectTrigger 
                        className="border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                        style={{ 
                          width: '130px',
                          height: '36px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          padding: '8px 12px',
                        }}
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

                  {/* Client Filter */}
                  <div className="flex items-center flex-shrink-0" style={{ 
                    gap: '6px',
                    opacity: selectedBookingNo ? 0.5 : 1,
                    pointerEvents: selectedBookingNo ? 'none' : 'auto'
                  }}>
                    <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>Client:</span>
                    <Select 
                      value={selectedClient} 
                      onValueChange={handleClientChange}
                      disabled={uniqueClients.length === 0}
                    >
                      <SelectTrigger 
                        className="border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                        style={{ 
                          width: '180px',
                          height: '36px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          padding: '8px 12px',
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Clients">All Clients</SelectItem>
                        {uniqueClients.length === 0 ? (
                          <SelectItem value="no-clients" disabled>No clients</SelectItem>
                        ) : (
                          uniqueClients.map(client => (
                            <SelectItem key={client} value={client}>
                              {client}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Booking Filter */}
                  <div className="flex items-center flex-shrink-0" style={{ gap: '6px' }}>
                    <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>Booking:</span>
                    <button
                      onClick={() => setShowBookingPicker(true)}
                      className={cn(
                        "transition-all whitespace-nowrap border flex items-center",
                        selectedBookingNo
                          ? "bg-white text-[#0A1D4D] border-[#F25C05] hover:bg-[#FFF7ED]"
                          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
                      )}
                      style={{ 
                        minWidth: '180px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        padding: '8px 12px',
                        fontWeight: selectedBookingNo ? 600 : 500,
                        gap: '6px',
                      }}
                    >
                      <span className="truncate flex-1 text-left">{selectedBookingNo || "All"}</span>
                      {selectedBookingNo && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingNo(null);
                            toast.success("Booking selection cleared");
                          }}
                          className="hover:bg-[#F25C05]/10 rounded-full p-0.5 transition-colors cursor-pointer inline-flex flex-shrink-0"
                        >
                          <X className="w-3 h-3 text-[#F25C05]" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE-ROW LAYOUT: All other reports */
              <div 
                className="flex items-center justify-between" 
                style={{ 
                  gap: '8px',
                  flexWrap: 'nowrap',
                }}
              >
                {/* Period Type */}
                <div className="flex items-center flex-shrink-0" style={{ gap: '6px' }}>
                  <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>Period:</span>
                  <Select value={periodType} onValueChange={handlePeriodTypeChange}>
                    <SelectTrigger 
                      className="border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      style={{ 
                        width: '110px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        padding: '8px 12px',
                      }}
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
                <div className="flex items-center flex-shrink-0" style={{ gap: '6px' }}>
                  <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>For:</span>
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
                <div className="flex items-center flex-shrink-0" style={{ gap: '6px' }}>
                  <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>Company:</span>
                  <Select value={reportCompany} onValueChange={handleCompanyChange}>
                    <SelectTrigger 
                      className="border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      style={{ 
                        width: '170px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        padding: '8px 12px',
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Companies</SelectItem>
                      {COMPANIES.filter(c => c !== "All").map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div className="flex items-center flex-shrink-0" style={{ gap: '6px' }}>
                  <span className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 600 }}>From:</span>
                  <Select value={reportSource} onValueChange={handleSourceChange}>
                    <SelectTrigger 
                      className="border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      style={{ 
                        width: '130px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        padding: '8px 12px',
                      }}
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

                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Actions */}
                <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
                  <Button
                    onClick={handlePreviewClick}
                    className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white"
                    style={{ 
                      width: '88px',
                      height: '36px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '0',
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success("Exporting to Excel...");
                    }}
                    variant="outline"
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D]"
                    style={{ 
                      width: '88px',
                      height: '36px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '0',
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export
                  </Button>
                  <Button
                    onClick={() => {
                      window.print();
                      toast.success("Opening print dialog...");
                    }}
                    variant="outline"
                    className="border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#0A1D4D]"
                    style={{ 
                      width: '88px',
                      height: '36px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '0',
                    }}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            )}

            {/* Helper Text */}
            {(filtersChanged || 
              (activeReport === "Per Booking Profitability" && (selectedBookingNo || selectedClient !== "All Clients"))) && (
              <>
                <div 
                  style={{
                    height: '1px',
                    backgroundColor: '#E5E7EB',
                    margin: '12px 0 0 0',
                  }}
                />
                <div className="text-[#94A3B8]" style={{ fontSize: '12px', marginTop: '12px' }}>
                  {(() => {
                    if (filtersChanged) {
                      return "Filters changed — Preview to update.";
                    }
                    if (activeReport === "Per Booking Profitability") {
                      if (selectedBookingNo) {
                        return `Report is filtered by booking: ${selectedBookingNo}. Client filter is ignored.`;
                      }
                      if (selectedClient !== "All Clients") {
                        return `Report is filtered by client: ${selectedClient}.`;
                      }
                    }
                    return "";
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div 
            className="mb-6"
            style={{
              height: '1px',
              backgroundColor: '#E5E7EB',
              marginLeft: '-24px',
              marginRight: '-24px',
            }}
          />

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
              <>
                {getBookingProfitabilityData().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white rounded-lg border border-[#E5E7EB]">
                    <div className="text-[#0A1D4D] mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
                      No bookings found for these filters.
                    </div>
                    <div className="text-[#6B7280]" style={{ fontSize: '13px', fontWeight: 400 }}>
                      Try another period, or clear the Client / Booking filter.
                    </div>
                  </div>
                ) : (
                  <BookingProfitabilityReport
                    entries={getBookingProfitabilityData()}
                    period={getDisplayPeriod()}
                    generatedAt={generatedAt}
                    companyName={companyNameForReport}
                  />
                )}
              </>
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
            
            {activeReport === "Expense Breakdown" && (
              <ExpenseBreakdownReport
                entries={getExpenseBreakdownData()}
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

      {/* Booking Picker Modal */}
      <BookingPickerModal
        open={showBookingPicker}
        onClose={() => setShowBookingPicker(false)}
        onConfirm={(bookingNo) => {
          setSelectedBookingNo(bookingNo);
          toast.success(`Selected booking: ${bookingNo}`);
        }}
        bookings={filteredFinancials.map(record => ({
          bookingNo: record.bookingNo,
          client: record.clientName,
          company: record.companyName,
          date: record.date,
          revenue: record.revenue,
        }))}
        currentFilters={{
          period: getDisplayPeriod(),
          company: reportCompany,
          source: reportSource,
        }}
      />
    </div>
  );
}
