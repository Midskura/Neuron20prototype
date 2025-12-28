import { useState } from 'react';
import { TrendingUp, TrendingDown, Coins, Percent, Package, Truck, CheckCircle } from 'lucide-react';
import { colors, typography, effects, spacing, layout } from './design-tokens';
import { Card } from '../ui/card';
import { ReportingHeader } from './ReportingHeader';
import { DateControlsCard, PeriodPreset } from './DateControlsCard';
import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { TimeSeriesCard } from './TimeSeriesCard';
import { DataTable } from './DataTable';
import { mockData, periodData } from './mock-data';

export function ReportingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [preset, setPreset] = useState<PeriodPreset>('month');
  const [dateFrom, setDateFrom] = useState(new Date(2025, 9, 1)); // Oct 1, 2025
  const [dateTo, setDateTo] = useState(new Date(2025, 9, 27)); // Oct 27, 2025
  const [company, setCompany] = useState('all');
  const [companyCode, setCompanyCode] = useState<string>('');
  
  // Get current period data based on preset
  const currentData = periodData[preset];

  const handleApplyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleExport = () => {
    console.log('Export data');
  };

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString()}`;
  };

  return (
    <div 
      style={{ 
        backgroundColor: colors.surface.page,
        fontFamily: 'Inter, system-ui, sans-serif',
        minHeight: '100vh',
        padding: spacing.lg
      }}
    >
      {/* Main Content Container */}
      <div style={{ 
        maxWidth: layout.contentMaxWidth, 
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Reporting Header (no card) */}
        <ReportingHeader />

        {/* Date Controls Card */}
        <DateControlsCard 
          onApply={handleApplyFilters}
          onExport={handleExport}
          isLoading={isLoading}
          preset={preset}
          onPresetChange={setPreset}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          company={company}
          onCompanyChange={setCompany}
          onCompanyCodeChange={setCompanyCode}
        />

        {/* 1) KPI Row - 4 cards */}
        <div className="grid grid-cols-4 gap-6">
          <KPICard
            label="Total Revenue"
            value={formatCurrency(currentData.totalRevenue)}
            delta={currentData.deltaRevenue}
            deltaLabel={`${Math.abs(currentData.deltaRevenue).toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="#1F8F2E"
            iconBgColor="#DCF5E2"
            isLoading={isLoading}
          />
          <KPICard
            label="Total Expenses"
            value={formatCurrency(currentData.totalExpenses)}
            delta={currentData.deltaExpenses}
            deltaLabel={`${Math.abs(currentData.deltaExpenses).toFixed(1)}%`}
            icon={TrendingDown}
            iconColor="#D23B3B"
            iconBgColor="#FDE5E5"
            isLoading={isLoading}
          />
          <KPICard
            label="Net Profit"
            value={formatCurrency(currentData.netProfit)}
            delta={currentData.deltaProfit}
            deltaLabel={`${Math.abs(currentData.deltaProfit).toFixed(1)}%`}
            icon={Coins}
            iconColor="#2E68F2"
            iconBgColor="#E7EFFF"
            isLoading={isLoading}
          />
          <KPICard
            label="Profit Margin"
            value={`${currentData.profitMargin.toFixed(1)}%`}
            delta={currentData.deltaMargin}
            deltaLabel={`${Math.abs(currentData.deltaMargin).toFixed(1)}%`}
            icon={Percent}
            iconColor="#E0A100"
            iconBgColor="#FFF5D6"
            isLoading={isLoading}
          />
        </div>

        {/* 2) Revenue & Expense Trends (8 cols) + Summary (4 cols) */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <ChartCard
              title="Revenue & Expense Trends"
              subtitle="Monthly comparison"
              type="combo"
              data={mockData.monthlyTrends}
              isLoading={isLoading}
            />
          </div>

          <div className="col-span-4">
            <SummaryCard 
              isLoading={isLoading}
              avgTicket={currentData.avgTicket}
              bookingsThisPeriod={currentData.bookingsThisPeriod}
              deliveryRate={currentData.deliveryRate}
            />
          </div>
        </div>

        {/* 3) Revenue & Expense Breakdown - 6 + 6 */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <ChartCard
              title="Revenue Breakdown"
              subtitle="By category"
              type="donut"
              data={mockData.revenueBreakdown}
              isLoading={isLoading}
            />
          </div>
          <div className="col-span-6">
            <ChartCard
              title="Expense Breakdown"
              subtitle="By category"
              type="donut"
              data={mockData.expenseBreakdown}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* 4) Income Flow - Full Width */}
        <TimeSeriesCard
          title="Income Flow"
          subtitle="Daily revenue over time"
          data={mockData.dailyIncomeFlow}
          dataKey="revenue"
          color={colors.success[500]}
          type="revenue"
          isLoading={isLoading}
        />

        {/* 5) Expense Flow - Full Width */}
        <TimeSeriesCard
          title="Expense Flow"
          subtitle="Daily expenses over time"
          data={mockData.dailyExpenseFlow}
          dataKey="expenses"
          color={colors.danger[500]}
          type="expense"
          isLoading={isLoading}
        />

        {/* 6) Top Clients & Top Expenses - 6 + 6 */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <Card style={{
              backgroundColor: colors.surface.card,
              border: `1px solid ${colors.border.light}`,
              borderRadius: layout.borderRadius.card,
              boxShadow: effects.cardElevation,
              padding: spacing.lg,
              height: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ marginBottom: spacing.md }}>
                <h3 style={{ 
                  ...typography.cardTitle,
                  marginBottom: '4px'
                }}>
                  Top Clients
                </h3>
                <p style={{ 
                  ...typography.meta,
                  color: colors.ink[500]
                }}>
                  Highest revenue contributors
                </p>
              </div>
              
              <div style={{ flex: 1, overflow: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'client', label: 'Client', align: 'left' },
                    { key: 'bookings', label: 'Bookings', align: 'right' },
                    { key: 'revenue', label: 'Revenue', align: 'right' },
                    { key: 'percentage', label: '% of Total', align: 'right' }
                  ]}
                  data={mockData.topClients}
                  isLoading={isLoading}
                />
              </div>
            </Card>
          </div>

          <div className="col-span-6">
            <Card style={{
              backgroundColor: colors.surface.card,
              border: `1px solid ${colors.border.light}`,
              borderRadius: layout.borderRadius.card,
              boxShadow: effects.cardElevation,
              padding: spacing.lg,
              height: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ marginBottom: spacing.md }}>
                <h3 style={{ 
                  ...typography.cardTitle,
                  marginBottom: '4px'
                }}>
                  Top Expenses
                </h3>
                <p style={{ 
                  ...typography.meta,
                  color: colors.ink[500]
                }}>
                  Highest cost categories
                </p>
              </div>
              
              <div style={{ flex: 1, overflow: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'category', label: 'Category', align: 'left' },
                    { key: 'count', label: 'Transactions', align: 'right' },
                    { key: 'amount', label: 'Amount', align: 'right' },
                    { key: 'percentage', label: '% of Total', align: 'right' }
                  ]}
                  data={mockData.topExpenseCategories}
                  isLoading={isLoading}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* 7) Operational Snapshot - 4 small cards */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard
            label="For Delivery"
            value={mockData.statusCounts.forDelivery}
            icon={Package}
            color={colors.primary[500]}
            isLoading={isLoading}
          />
          <StatCard
            label="In Transit"
            value={mockData.statusCounts.inTransit}
            icon={Truck}
            color={colors.chart.blue}
            isLoading={isLoading}
          />
          <StatCard
            label="Delivered"
            value={mockData.statusCounts.delivered}
            icon={CheckCircle}
            color={colors.success[500]}
            isLoading={isLoading}
          />
          <StatCard
            label="Delivery Rate"
            value={`${currentData.deliveryRate.toFixed(1)}%`}
            icon={TrendingUp}
            color={colors.success[500]}
            isLoading={isLoading}
          />
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: spacing.md,
          textAlign: 'center',
          ...typography.meta,
          color: colors.ink[500]
        }}>
          Reporting v1 — All data updated in real time
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  isLoading?: boolean;
  avgTicket: number;
  bookingsThisPeriod: number;
  deliveryRate: number;
}

function SummaryCard({ isLoading, avgTicket, bookingsThisPeriod, deliveryRate }: SummaryCardProps) {
  if (isLoading) {
    return (
      <Card style={{
        backgroundColor: colors.surface.card,
        border: `1px solid ${colors.border.light}`,
        borderRadius: layout.borderRadius.card,
        boxShadow: effects.cardElevation,
        padding: spacing.lg,
        height: '360px'
      }}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card style={{
      backgroundColor: colors.surface.card,
      border: `1px solid ${colors.border.light}`,
      borderRadius: layout.borderRadius.card,
      boxShadow: effects.cardElevation,
      minHeight: '360px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      padding: spacing.lg,
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.md
    }}>
      <div>
        <h3 style={{ 
          ...typography.cardTitle,
          marginBottom: '4px'
        }}>
          Today vs Previous
        </h3>
        <p style={{ 
          ...typography.meta,
          color: colors.ink[500]
        }}>
          Performance summary
        </p>
      </div>

      {/* Mini Income Flow */}
      <div style={{ 
        borderRadius: '8px',
        backgroundColor: colors.ink[50],
        padding: '12px',
        height: '100px'
      }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ 
            ...typography.label,
            color: colors.ink[700]
          }}>
            Income Flow
          </span>
          <span style={{ 
            ...typography.body,
            fontWeight: 700,
            color: colors.success[500],
            fontVariantNumeric: 'tabular-nums'
          }}>
            +18.5%
          </span>
        </div>
        <div style={{ 
          height: '60px',
          background: `linear-gradient(to right, ${colors.success[100]}, ${colors.success[50]})`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '4px',
          gap: '2px'
        }}>
          {[60, 70, 65, 80, 75, 85, 90, 95, 88, 100].map((height, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${height}%`,
                backgroundColor: colors.success[500],
                borderRadius: '2px',
                opacity: 0.8
              }}
            />
          ))}
        </div>
      </div>

      {/* Mini Expense Flow */}
      <div style={{ 
        borderRadius: '8px',
        backgroundColor: colors.ink[50],
        padding: '12px',
        height: '100px'
      }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ 
            ...typography.label,
            color: colors.ink[700]
          }}>
            Expense Flow
          </span>
          <span style={{ 
            ...typography.body,
            fontWeight: 700,
            color: colors.danger[500],
            fontVariantNumeric: 'tabular-nums'
          }}>
            +12.3%
          </span>
        </div>
        <div style={{ 
          height: '60px',
          background: `linear-gradient(to right, ${colors.danger[100]}, ${colors.danger[50]})`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '4px',
          gap: '2px'
        }}>
          {[50, 55, 60, 65, 58, 70, 75, 80, 78, 85].map((height, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${height}%`,
                backgroundColor: colors.danger[500],
                borderRadius: '2px',
                opacity: 0.8
              }}
            />
          ))}
        </div>
      </div>

      {/* Compact Stats */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingTop: '8px',
        borderTop: `1px solid ${colors.border.light}`
      }}>
        <div className="flex items-center justify-between">
          <span style={{ 
            ...typography.meta,
            color: colors.ink[500]
          }}>
            Avg Ticket
          </span>
          <span style={{ 
            ...typography.body,
            fontWeight: 600,
            color: colors.ink[900],
            fontVariantNumeric: 'tabular-nums'
          }}>
            ₱{avgTicket.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ 
            ...typography.meta,
            color: colors.ink[500]
          }}>
            Bookings This Period
          </span>
          <span style={{ 
            ...typography.body,
            fontWeight: 600,
            color: colors.ink[900],
            fontVariantNumeric: 'tabular-nums'
          }}>
            {bookingsThisPeriod}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ 
            ...typography.meta,
            color: colors.ink[500]
          }}>
            Delivery Rate
          </span>
          <span style={{ 
            ...typography.body,
            fontWeight: 600,
            color: colors.success[500],
            fontVariantNumeric: 'tabular-nums'
          }}>
            {deliveryRate.toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card style={{
        backgroundColor: colors.surface.card,
        border: `1px solid ${colors.border.light}`,
        borderRadius: layout.borderRadius.card,
        boxShadow: effects.cardElevation,
        padding: spacing.md,
        height: '120px'
      }}>
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-6 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card style={{
      backgroundColor: colors.surface.card,
      border: `1px solid ${colors.border.light}`,
      borderRadius: layout.borderRadius.card,
      boxShadow: effects.cardElevation,
      padding: spacing.md,
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <Icon className="w-6 h-6" style={{ color }} />
      <div>
        <p style={{ 
          ...typography.meta,
          color: colors.ink[500],
          marginBottom: '4px'
        }}>
          {label}
        </p>
        <p style={{ 
          ...typography.kpi,
          color: colors.ink[900],
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1
        }}>
          {value}
        </p>
      </div>
    </Card>
  );
}
