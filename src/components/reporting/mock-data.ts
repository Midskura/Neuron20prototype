import { colors } from './design-tokens';

// Data variants for different time periods
export type PeriodType = 'day' | 'week' | 'month' | 'custom';

export interface PeriodData {
  // KPI values
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  
  // Delta values (vs previous period)
  deltaRevenue: number;
  deltaExpenses: number;
  deltaProfit: number;
  deltaMargin: number;
  
  // Summary stats
  avgTicket: number;
  bookingsThisPeriod: number;
  deliveryRate: number;
}

export const periodData: Record<PeriodType, PeriodData> = {
  day: {
    totalRevenue: 108000,
    totalExpenses: 73000,
    netProfit: 35000,
    profitMargin: 32.4,
    deltaRevenue: 5.8,
    deltaExpenses: -2.1,
    deltaProfit: 12.3,
    deltaMargin: 1.2,
    avgTicket: 27000,
    bookingsThisPeriod: 4,
    deliveryRate: 100,
  },
  week: {
    totalRevenue: 725000,
    totalExpenses: 488000,
    netProfit: 237000,
    profitMargin: 32.7,
    deltaRevenue: 8.2,
    deltaExpenses: 3.5,
    deltaProfit: 15.8,
    deltaMargin: 2.1,
    avgTicket: 103571,
    bookingsThisPeriod: 7,
    deliveryRate: 95.8,
  },
  month: {
    totalRevenue: 9800000,
    totalExpenses: 7400000,
    netProfit: 2400000,
    profitMargin: 24.5,
    deltaRevenue: 12.5,
    deltaExpenses: -8.3,
    deltaProfit: 24.7,
    deltaMargin: 3.2,
    avgTicket: 185714,
    bookingsThisPeriod: 412,
    deliveryRate: 97.2,
  },
  custom: {
    totalRevenue: 5200000,
    totalExpenses: 3900000,
    netProfit: 1300000,
    profitMargin: 25.0,
    deltaRevenue: 9.4,
    deltaExpenses: 4.2,
    deltaProfit: 18.5,
    deltaMargin: 2.8,
    avgTicket: 173333,
    bookingsThisPeriod: 30,
    deliveryRate: 96.5,
  },
};

export const mockData = {
  // Revenue Breakdown
  revenueBreakdown: [
    { name: 'Transport Services', value: 5350000, color: colors.success[500] },
    { name: 'Last-Mile Delivery', value: 2150000, color: colors.chart.blue },
    { name: 'Warehousing', value: 1180000, color: colors.chart.purple },
    { name: 'Documentation', value: 680000, color: colors.chart.yellow },
    { name: 'Fuel Surcharge', value: 440000, color: colors.chart.teal },
  ],

  // Expense Breakdown
  expenseBreakdown: [
    { name: 'Fuel', value: 2950000, color: colors.danger[500] },
    { name: 'Toll Fees', value: 1480000, color: '#EF4444' },
    { name: 'Driver Allowance', value: 1110000, color: '#F87171' },
    { name: 'Repairs', value: 740000, color: '#FCA5A5' },
    { name: 'Port Charges', value: 444000, color: '#FECACA' },
    { name: 'Other', value: 676000, color: colors.ink[300] },
  ],

  // Monthly Trends
  monthlyTrends: [
    { month: 'Jan', revenue: 820000, expenses: 620000 },
    { month: 'Feb', revenue: 850000, expenses: 640000 },
    { month: 'Mar', revenue: 890000, expenses: 670000 },
    { month: 'Apr', revenue: 920000, expenses: 690000 },
    { month: 'May', revenue: 880000, expenses: 660000 },
    { month: 'Jun', revenue: 950000, expenses: 710000 },
    { month: 'Jul', revenue: 980000, expenses: 740000 },
    { month: 'Aug', revenue: 960000, expenses: 720000 },
    { month: 'Sep', revenue: 1020000, expenses: 770000 },
    { month: 'Oct', revenue: 1050000, expenses: 790000 },
  ],

  // Daily Income Flow (Oct 1-27, 2025)
  dailyIncomeFlow: [
    { date: 'Oct 01', revenue: 28000 },
    { date: 'Oct 02', revenue: 35000 },
    { date: 'Oct 03', revenue: 42000 },
    { date: 'Oct 04', revenue: 38000 },
    { date: 'Oct 05', revenue: 45000 },
    { date: 'Oct 06', revenue: 52000 },
    { date: 'Oct 07', revenue: 95000 },
    { date: 'Oct 08', revenue: 48000 },
    { date: 'Oct 09', revenue: 55000 },
    { date: 'Oct 10', revenue: 62000 },
    { date: 'Oct 11', revenue: 58000 },
    { date: 'Oct 12', revenue: 68000 },
    { date: 'Oct 13', revenue: 72000 },
    { date: 'Oct 14', revenue: 65000 },
    { date: 'Oct 15', revenue: 78000 },
    { date: 'Oct 16', revenue: 82000 },
    { date: 'Oct 17', revenue: 75000 },
    { date: 'Oct 18', revenue: 88000 },
    { date: 'Oct 19', revenue: 92000 },
    { date: 'Oct 20', revenue: 85000 },
    { date: 'Oct 21', revenue: 98000 },
    { date: 'Oct 22', revenue: 105000 },
    { date: 'Oct 23', revenue: 95000 },
    { date: 'Oct 24', revenue: 102000 },
    { date: 'Oct 25', revenue: 110000 },
    { date: 'Oct 26', revenue: 115000 },
    { date: 'Oct 27', revenue: 108000 },
  ],

  // Daily Expense Flow (Oct 1-27, 2025)
  dailyExpenseFlow: [
    { date: 'Oct 01', expenses: 22000 },
    { date: 'Oct 02', expenses: 28000 },
    { date: 'Oct 03', expenses: 32000 },
    { date: 'Oct 04', expenses: 29000 },
    { date: 'Oct 05', expenses: 35000 },
    { date: 'Oct 06', expenses: 38000 },
    { date: 'Oct 07', expenses: 42000 },
    { date: 'Oct 08', expenses: 36000 },
    { date: 'Oct 09', expenses: 41000 },
    { date: 'Oct 10', expenses: 45000 },
    { date: 'Oct 11', expenses: 43000 },
    { date: 'Oct 12', expenses: 48000 },
    { date: 'Oct 13', expenses: 52000 },
    { date: 'Oct 14', expenses: 47000 },
    { date: 'Oct 15', expenses: 55000 },
    { date: 'Oct 16', expenses: 58000 },
    { date: 'Oct 17', expenses: 54000 },
    { date: 'Oct 18', expenses: 62000 },
    { date: 'Oct 19', expenses: 65000 },
    { date: 'Oct 20', expenses: 60000 },
    { date: 'Oct 21', expenses: 68000 },
    { date: 'Oct 22', expenses: 72000 },
    { date: 'Oct 23', expenses: 67000 },
    { date: 'Oct 24', expenses: 70000 },
    { date: 'Oct 25', expenses: 75000 },
    { date: 'Oct 26', expenses: 78000 },
    { date: 'Oct 27', expenses: 73000 },
  ],

  // Top Clients
  topClients: [
    { client: 'Puregold', bookings: 58, revenue: '₱2,980,000', percentage: '30.4%' },
    { client: 'SM Retail', bookings: 52, revenue: '₱2,450,000', percentage: '25.0%' },
    { client: 'Robinsons Retail', bookings: 45, revenue: '₱1,960,000', percentage: '20.0%' },
    { client: 'Unilab', bookings: 38, revenue: '₱1,470,000', percentage: '15.0%' },
    { client: 'San Miguel Corp', bookings: 28, revenue: '₱940,000', percentage: '9.6%' },
  ],

  // Top Expense Categories
  topExpenseCategories: [
    { category: 'Fuel', amount: '₱2,950,000', count: 342, percentage: '39.9%' },
    { category: 'Toll Fees', amount: '₱1,480,000', count: 856, percentage: '20.0%' },
    { category: 'Driver Allowance', amount: '₱1,110,000', count: 248, percentage: '15.0%' },
    { category: 'Repairs', amount: '₱740,000', count: 48, percentage: '10.0%' },
    { category: 'Port Charges', amount: '₱444,000', count: 28, percentage: '6.0%' },
  ],

  // Booking Performance
  bookingPerformance: [
    { trackingNo: 'JJB-2025-1042', client: 'Puregold', route: 'Taguig → Cavite', revenue: '₱285,000', expenses: '₱175,000', profit: '₱110,000', margin: '38.6%' },
    { trackingNo: 'JJB-2025-1043', client: 'SM Retail', route: 'Manila → Batangas', revenue: '₱320,000', expenses: '₱220,000', profit: '₱100,000', margin: '31.3%' },
    { trackingNo: 'JJB-2025-1044', client: 'Robinsons', route: 'QC → Laguna', revenue: '₱195,000', expenses: '₱125,000', profit: '₱70,000', margin: '35.9%' },
    { trackingNo: 'JJB-2025-1045', client: 'Unilab', route: 'Pasig → Bulacan', revenue: '₱248,000', expenses: '₱168,000', profit: '₱80,000', margin: '32.3%' },
    { trackingNo: 'JJB-2025-1046', client: 'San Miguel', route: 'Makati → Pampanga', revenue: '₱410,000', expenses: '₱285,000', profit: '₱125,000', margin: '30.5%' },
    { trackingNo: 'JJB-2025-1047', client: 'Puregold', route: 'Taguig → Rizal', revenue: '₱165,000', expenses: '₱98,000', profit: '₱67,000', margin: '40.6%' },
    { trackingNo: 'JJB-2025-1048', client: 'SM Retail', route: 'Manila → Cavite', revenue: '₱298,000', expenses: '₱185,000', profit: '₱113,000', margin: '37.9%' },
    { trackingNo: 'JJB-2025-1049', client: 'Robinsons', route: 'Pasig → Laguna', revenue: '₱225,000', expenses: '₱155,000', profit: '₱70,000', margin: '31.1%' },
    { trackingNo: 'JJB-2025-1050', client: 'Unilab', route: 'QC → Batangas', revenue: '₱335,000', expenses: '₱215,000', profit: '₱120,000', margin: '35.8%' },
    { trackingNo: 'JJB-2025-1051', client: 'San Miguel', route: 'Taguig → Cavite', revenue: '₱280,000', expenses: '₱190,000', profit: '₱90,000', margin: '32.1%' },
  ],

  // Booking Performance Total
  bookingPerformanceTotal: {
    trackingNo: 'TOTAL',
    client: '',
    route: '',
    revenue: '₱2,761,000',
    expenses: '₱1,816,000',
    profit: '₱945,000',
    margin: '34.2%'
  },

  // Status Counts
  statusCounts: {
    forDelivery: 14,
    inTransit: 31,
    delivered: 52,
    deliveryRate: 66.3
  },

  // Top Sources - By Client (Pareto Chart Data)
  topSourcesByClient: {
    items: [
      { label: 'Puregold', amount: 2980000, pct: 0.304 },
      { label: 'SM Retail', amount: 2450000, pct: 0.250 },
      { label: 'Robinsons Retail', amount: 1960000, pct: 0.200 },
      { label: 'Unilab', amount: 1470000, pct: 0.150 },
      { label: 'San Miguel Corp', amount: 940000, pct: 0.096 },
      { label: 'Nestlé Philippines', amount: 720000, pct: 0.073 },
      { label: 'Jollibee Foods', amount: 580000, pct: 0.059 },
      { label: 'Alaska Milk', amount: 450000, pct: 0.046 },
      { label: 'Universal Robina', amount: 380000, pct: 0.039 },
      { label: 'Del Monte', amount: 320000, pct: 0.033 },
      { label: 'Monde Nissin', amount: 280000, pct: 0.029 },
      { label: 'Century Pacific', amount: 240000, pct: 0.024 },
    ],
    total: 9800000,
  },

  // Top Sources - By Account (Pareto Chart Data)
  topSourcesByAccount: {
    items: [
      { label: 'Transport Services', amount: 5350000, pct: 0.546 },
      { label: 'Last-Mile Delivery', amount: 2150000, pct: 0.219 },
      { label: 'Warehousing Fees', amount: 1180000, pct: 0.120 },
      { label: 'Documentation', amount: 680000, pct: 0.069 },
      { label: 'Fuel Surcharge', amount: 440000, pct: 0.045 },
    ],
    total: 9800000,
  },

  // Top Sinks - By Payee (Pareto Chart Data)
  topSinksByPayee: {
    items: [
      { label: 'Shell Fuel Station', amount: 1280000, pct: 0.173 },
      { label: 'Petron Corporation', amount: 1150000, pct: 0.155 },
      { label: 'NLEX Toll Operations', amount: 890000, pct: 0.120 },
      { label: 'SLEX Toll Plaza', amount: 745000, pct: 0.101 },
      { label: 'AutoMech Repairs', amount: 420000, pct: 0.057 },
      { label: 'Port of Manila', amount: 285000, pct: 0.039 },
      { label: 'QuickFix Auto Shop', amount: 268000, pct: 0.036 },
      { label: 'Caltex Station', amount: 225000, pct: 0.030 },
      { label: 'Phoenix Petroleum', amount: 198000, pct: 0.027 },
      { label: 'CAVITEX Toll', amount: 185000, pct: 0.025 },
      { label: 'Tire Depot', amount: 165000, pct: 0.022 },
      { label: 'LBC Express', amount: 142000, pct: 0.019 },
    ],
    total: 7400000,
  },

  // Top Sinks - By Account (Pareto Chart Data)
  topSinksByAccount: {
    items: [
      { label: 'Fuel Expense', amount: 2950000, pct: 0.399 },
      { label: 'Toll Fees', amount: 1480000, pct: 0.200 },
      { label: 'Driver Allowance', amount: 1110000, pct: 0.150 },
      { label: 'Vehicle Repairs', amount: 740000, pct: 0.100 },
      { label: 'Port Charges', amount: 444000, pct: 0.060 },
      { label: 'Parking Fees', amount: 186000, pct: 0.025 },
      { label: 'Office Supplies', amount: 148000, pct: 0.020 },
      { label: 'Utilities', amount: 111000, pct: 0.015 },
    ],
    total: 7400000,
  },
};
