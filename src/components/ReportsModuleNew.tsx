import { useState, useEffect } from "react";
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
import { format, isWithinInterval, parseISO } from "date-fns";

type ReportType = "Sales Profit" | "Company P&L" | "Per Booking Profitability" | "Client Profitability" | "Receivables" | "Expense Breakdown";

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
  const [reportPeriod, setReportPeriod] = useState("Nov 2025");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [reportCompany, setReportCompany] = useState("All");
  const [reportSource, setReportSource] = useState("Both");
  const [showReportPreview, setShowReportPreview] = useState(true);
  const [filtersChanged, setFiltersChanged] = useState(false);

  // Filter bookings based on period, company, and source
  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Filter by date period
    if (periodType === "Custom" && customStartDate && customEndDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = parseISO(booking.deliveryDate);
        return isWithinInterval(bookingDate, { start: customStartDate, end: customEndDate });
      });
    } else {
      // Filter by month (default November 2025)
      const [month, year] = reportPeriod.split(" ");
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      const yearNum = parseInt(year);
      filtered = filtered.filter(booking => {
        const bookingDate = parseISO(booking.deliveryDate);
        return bookingDate.getMonth() === monthIndex && bookingDate.getFullYear() === yearNum;
      });
    }

    // Filter by company (we'll assume bookings don't have company field yet, so skip for now)
    // In production, you'd need to add a company field to bookings
    
    // Filter by delivery type (source)
    if (reportSource !== "Both") {
      filtered = filtered.filter(booking => {
        if (reportSource === "Bookings") return true; // All bookings
        return false; // Entries would be handled separately
      });
    }

    return filtered;
  };

  // Transform bookings for Sales Profit Report
  const getSalesProfitData = () => {
    const filteredBookings = getFilteredBookings();

    return filteredBookings.map(booking => {
      // Get expenses for this booking
      const bookingExpenses = expenses.filter(e => e.bookingId === booking.id && e.status === "Approved");
      const totalExpenses = bookingExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Get payments for this booking
      const bookingPayments = payments.filter(p => p.bookingId === booking.id && p.status === "Approved");
      const collectedAmount = bookingPayments.reduce((sum, p) => sum + p.amount, 0);

      // Calculate admin cost (3% of expenses)
      const adminCost = totalExpenses * 0.03;
      const totalExpensesWithAdmin = totalExpenses + adminCost;
      const grossProfit = collectedAmount - totalExpensesWithAdmin;

      return {
        id: booking.id,
        jobNo: booking.trackingNo,
        date: new Date(booking.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        companyName: booking.client,
        billingNo: bookingPayments[0]?.reference || "—",
        particulars: booking.notes || `${booking.deliveryType || "Domestic"} delivery from ${booking.pickup} to ${booking.dropoff}`,
        itemizedCost: 0, // Not tracked separately in current schema
        expenses: totalExpenses,
        adminCost: adminCost,
        totalExpenses: totalExpensesWithAdmin,
        collectedAmount: collectedAmount,
        grossProfit: grossProfit,
      };
    });
  };

  // Company P&L Data
  const getPnLData = () => {
    const filteredBookings = getFilteredBookings();
    const entries: any[] = [];

    // Add revenue entries from payments
    filteredBookings.forEach(booking => {
      const bookingPayments = payments.filter(p => p.bookingId === booking.id && p.status === "Approved");
      bookingPayments.forEach(payment => {
        entries.push({
          type: "Revenue",
          category: "Payment",
          description: `${booking.trackingNo} - ${payment.method}`,
          amount: payment.amount,
        });
      });
    });

    // Add expense entries
    filteredBookings.forEach(booking => {
      const bookingExpenses = expenses.filter(e => e.bookingId === booking.id && e.status === "Approved");
      bookingExpenses.forEach(expense => {
        entries.push({
          type: "Expense",
          category: expense.type,
          description: expense.description || booking.trackingNo,
          amount: expense.amount,
        });
      });
    });

    return entries;
  };

  // Per Booking Profitability Data
  const getBookingProfitabilityData = () => {
    const filteredBookings = getFilteredBookings();

    return filteredBookings.map(booking => {
      const bookingExpenses = expenses.filter(e => e.bookingId === booking.id && e.status === "Approved");
      const totalExpenses = bookingExpenses.reduce((sum, e) => sum + e.amount, 0);

      const bookingPayments = payments.filter(p => p.bookingId === booking.id && p.status === "Approved");
      const revenue = bookingPayments.reduce((sum, p) => sum + p.amount, 0);

      const adminCost = totalExpenses * 0.03;
      const profit = revenue - totalExpenses - adminCost;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        bookingNo: booking.trackingNo,
        client: booking.client,
        company: booking.client, // Using client as company for now
        revenue,
        expenses: totalExpenses,
        adminCost,
        profit,
        profitMargin,
      };
    });
  };

  // Client Profitability Data
  const getClientProfitabilityData = () => {
    const filteredBookings = getFilteredBookings();
    const clientMap = new Map();

    filteredBookings.forEach(booking => {
      if (!clientMap.has(booking.client)) {
        clientMap.set(booking.client, {
          clientName: booking.client,
          company: booking.client,
          bookingIds: new Set(),
          totalRevenue: 0,
          totalExpenses: 0,
        });
      }

      const client = clientMap.get(booking.client);
      client.bookingIds.add(booking.id);

      const bookingPayments = payments.filter(p => p.bookingId === booking.id && p.status === "Approved");
      const revenue = bookingPayments.reduce((sum, p) => sum + p.amount, 0);
      client.totalRevenue += revenue;

      const bookingExpenses = expenses.filter(e => e.bookingId === booking.id && e.status === "Approved");
      const totalExpenses = bookingExpenses.reduce((sum, e) => sum + e.amount, 0);
      client.totalExpenses += totalExpenses + (totalExpenses * 0.03); // Include admin cost
    });

    return Array.from(clientMap.values()).map(client => {
      const profit = client.totalRevenue - client.totalExpenses;
      const profitMargin = client.totalRevenue > 0 ? (profit / client.totalRevenue) * 100 : 0;
      const numBookings = client.bookingIds.size;
      const avgRevenuePerBooking = numBookings > 0 ? client.totalRevenue / numBookings : 0;

      return {
        clientName: client.clientName,
        company: client.company,
        numBookings,
        totalRevenue: client.totalRevenue,
        totalExpenses: client.totalExpenses,
        profit,
        profitMargin,
        avgRevenuePerBooking,
      };
    });
  };

  // Receivables Data - only show unpaid bookings
  const getReceivablesData = () => {
    const filteredBookings = getFilteredBookings();

    return filteredBookings
      .map(booking => {
        const bookingPayments = payments.filter(p => p.bookingId === booking.id && p.status === "Approved");
        const collectedAmount = bookingPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // Calculate total owed (use profit as expected revenue for now)
        const bookingExpenses = expenses.filter(e => e.bookingId === booking.id && e.status === "Approved");
        const totalExpenses = bookingExpenses.reduce((sum, e) => sum + e.amount, 0);
        const expectedRevenue = totalExpenses + booking.profit;
        
        const isPaid = collectedAmount >= expectedRevenue;
        const lastPayment = bookingPayments[bookingPayments.length - 1];

        return {
          companyName: booking.client,
          clientName: booking.client,
          bookingNo: booking.trackingNo,
          amount: expectedRevenue,
          checkNoOrRef: lastPayment?.reference || "—",
          invoiceAmount: expectedRevenue,
          collectedDate: lastPayment 
            ? new Date(lastPayment.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
          status: isPaid ? "PAID" : "UNPAID" as "PAID" | "UNPAID",
        };
      })
      .filter(entry => entry.status === "UNPAID"); // Only show unpaid
  };

  // Expense Breakdown Data
  const getExpenseBreakdownData = () => {
    const filteredBookings = getFilteredBookings();
    const bookingIds = new Set(filteredBookings.map(b => b.id));
    const filteredExpenses = expenses.filter(e => bookingIds.has(e.bookingId) && e.status === "Approved");

    const categoryMap = new Map();
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    filteredExpenses.forEach(expense => {
      const key = expense.type;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          category: expense.type,
          company: "JJB", // Default company
          totalAmount: 0,
        });
      }
      const cat = categoryMap.get(key);
      cat.totalAmount += expense.amount;
    });

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
        {/* Left block - Title + Subtitle */}
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
          {/* Report Type Pills */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {([" Sales Profit", "Company P&L", "Per Booking Profitability", "Client Profitability", "Receivables", "Expense Breakdown"] as const).map((report) => (
              <button
                key={report}
                onClick={() => setActiveReport(report)}
                className={cn(
                  "px-4 py-2 rounded-full text-[13px] transition-all whitespace-nowrap",
                  activeReport === report
                    ? "bg-[#F25C05] text-white"
                    : "bg-transparent text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]"
                )}
                style={{ fontWeight: activeReport === report ? 600 : 500 }}
              >
                {report}
              </button>
            ))}</div>

          {/* Filters Bar - Single horizontal row */}
          <div 
            className="border border-[#E5E7EB] rounded-[16px] bg-white"
            style={{ 
              padding: '16px 20px',
              marginBottom: '24px',
            }}
          >
            {/* Single row with all controls */}
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

              {/* Spacer */}
              <div className="flex-grow"></div>

              {/* Actions - Right aligned */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={handlePreviewClick}
                  className="bg-[#0A1D4D] hover:bg-[#0A1D4D]/90 text-white rounded-full h-11 px-5"
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

            {/* Helper text when filters change */}
            {filtersChanged && (
              <div className="mt-3 text-[12px] text-[#6B7280] italic">
                Filters updated. Click Preview to refresh.
              </div>
            )}
          </div>

          {/* Report Preview - Always shown */}
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
                <span><strong>Bookings in view:</strong> {getFilteredBookings().length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
