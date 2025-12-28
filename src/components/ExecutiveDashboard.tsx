import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Percent,
  Calendar,
  AlertCircle,
  Clock,
  Target,
  BarChart3,
  Wallet,
  CreditCard,
  Receipt,
  Truck,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import { NeuronCard } from "./NeuronCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface ExecutiveDashboardProps {
  currentUser?: { name: string; email: string } | null;
}

// Hero Metric Card Component
function HeroMetric({ 
  label, 
  value, 
  subtext, 
  trend, 
  trendValue, 
  icon: Icon,
  alert
}: { 
  label: string; 
  value: string; 
  subtext?: string; 
  trend: "up" | "down" | "neutral"; 
  trendValue: string;
  icon: any;
  alert?: boolean;
}) {
  const isPositive = trend === "up";
  const isNeutral = trend === "neutral";
  
  return (
    <NeuronCard padding="lg" elevation="1" className="relative overflow-hidden">
      {/* Background gradient accent */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5"
        style={{
          background: `radial-gradient(circle, ${alert ? '#C94F3D' : 'var(--neuron-brand-green)'} 0%, transparent 70%)`
        }}
      />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-[#6B7A76] font-medium uppercase tracking-wide">
            {label}
          </span>
          <Icon size={20} className={alert ? "text-[#C94F3D]" : "text-[#6B7A76]"} />
        </div>
        
        <div className="text-[32px] font-semibold text-[#12332B] leading-none mb-2" style={{ letterSpacing: '-0.8px' }}>
          {value}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {!isNeutral && (isPositive ? (
              <TrendingUp size={14} className="text-[#0F766E]" />
            ) : (
              <TrendingDown size={14} className="text-[#C94F3D]" />
            ))}
            <span className={`text-[13px] font-medium ${isNeutral ? 'text-[#6B7A76]' : isPositive ? 'text-[#0F766E]' : 'text-[#C94F3D]'}`}>
              {trendValue}
            </span>
          </div>
          
          {subtext && (
            <>
              <span className="text-[#E5ECE9]">·</span>
              <span className="text-[11px] text-[#6B7A76]">
                {subtext}
              </span>
            </>
          )}
        </div>
      </div>
    </NeuronCard>
  );
}

export function ExecutiveDashboard({ currentUser }: ExecutiveDashboardProps) {
  const [timeframe, setTimeframe] = useState("month");

  // Cash Flow Data
  const cashFlowData = [
    { month: "Jun", receivables: 485000, payables: 362000, netPosition: 123000 },
    { month: "Jul", receivables: 512000, payables: 389000, netPosition: 123000 },
    { month: "Aug", receivables: 548000, payables: 401000, netPosition: 147000 },
    { month: "Sep", receivables: 592000, payables: 438000, netPosition: 154000 },
    { month: "Oct", receivables: 634000, payables: 467000, netPosition: 167000 },
    { month: "Nov", receivables: 678000, payables: 495000, netPosition: 183000 }
  ];

  // Margin Analysis by Service Type
  const marginByServiceData = [
    { service: "Ocean FCL", revenue: 285000, cost: 218000, margin: 23.5 },
    { service: "Ocean LCL", revenue: 142000, cost: 115000, margin: 19.0 },
    { service: "Air Freight", revenue: 189000, cost: 156000, margin: 17.5 },
    { service: "Domestic", revenue: 62000, cost: 51000, margin: 17.7 }
  ];

  // Client Payment Behavior
  const paymentBehaviorData = [
    { name: "0-30 Days", value: 45, amount: "₱305K" },
    { name: "31-60 Days", value: 32, amount: "₱217K" },
    { name: "61-90 Days", value: 15, amount: "₱102K" },
    { name: "90+ Days", value: 8, amount: "₱54K" }
  ];

  // Booking Volume & Efficiency
  const bookingTrendsData = [
    { week: "W40", bookings: 42, onTime: 39, revenue: 125000 },
    { week: "W41", bookings: 48, onTime: 45, revenue: 138000 },
    { week: "W42", bookings: 51, onTime: 48, revenue: 147000 },
    { week: "W43", bookings: 45, onTime: 43, revenue: 132000 },
    { week: "W44", bookings: 53, onTime: 51, revenue: 156000 }
  ];

  const COLORS = {
    green: '#0F766E',
    teal: '#14B8A6',
    orange: '#F97316',
    red: '#EF4444',
    gray: '#9CA3AF'
  };

  // Top Clients by Profitability (not just revenue!)
  const topClientsByProfit = [
    { 
      client: "Acme Trading Corp", 
      revenue: "₱124,500", 
      margin: "24.2%", 
      bookings: 28, 
      paymentDays: 32,
      status: "Excellent"
    },
    { 
      client: "Global Imports Ltd", 
      revenue: "₱98,200", 
      margin: "22.1%", 
      bookings: 21, 
      paymentDays: 28,
      status: "Excellent"
    },
    { 
      client: "Metro Retail Group", 
      revenue: "₱156,800", 
      margin: "18.5%", 
      bookings: 34, 
      paymentDays: 45,
      status: "Good"
    },
    { 
      client: "Pacific Distribution Co", 
      revenue: "₱87,400", 
      margin: "26.8%", 
      bookings: 15, 
      paymentDays: 21,
      status: "Excellent"
    },
    { 
      client: "Sterling Supply Chain", 
      revenue: "₱73,900", 
      margin: "21.3%", 
      bookings: 18, 
      paymentDays: 38,
      status: "Good"
    }
  ];

  // Subcontractor Performance
  const topSubcontractors = [
    { 
      name: "Pacific Express Logistics", 
      bookings: 47, 
      onTimeRate: "96.2%", 
      avgCost: "₱4,850",
      rating: "Excellent"
    },
    { 
      name: "Golden Bridge Transport", 
      bookings: 38, 
      onTimeRate: "94.7%", 
      avgCost: "₱4,620",
      rating: "Excellent"
    },
    { 
      name: "Metro Freight Services", 
      bookings: 42, 
      onTimeRate: "91.3%", 
      avgCost: "₱5,120",
      rating: "Good"
    },
    { 
      name: "Asia Cargo Solutions", 
      bookings: 29, 
      onTimeRate: "89.6%", 
      avgCost: "₱4,980",
      rating: "Good"
    }
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#FFFFFF" }}>
      <div className="flex-1 overflow-y-auto">
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "32px 48px" }}>
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[32px] font-semibold text-[#12332B] mb-1" style={{ letterSpacing: '-1.2px' }}>
                Executive Dashboard
              </h1>
              <p className="text-[14px] text-[#6B7A76]">
                Cash flow, margins, and coordination performance for asset-light forwarding
              </p>
            </div>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px] bg-white border-[#E5E9F0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Critical Alerts Banner */}
          <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#EF4444] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-[#12332B] mb-1">
                Cash Flow Alert
              </div>
              <div className="text-[13px] text-[#6B7A76]">
                3 clients with invoices overdue 60+ days totaling <span className="font-semibold text-[#12332B]">₱54,200</span>. 
                Review payment terms in Client Intelligence section.
              </div>
            </div>
          </div>

          {/* Hero Metrics - Cash Flow Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <HeroMetric
              label="Outstanding Receivables"
              value="₱678K"
              trend="up"
              trendValue="+6.8% MoM"
              subtext="₱183K net position"
              icon={Wallet}
            />
            <HeroMetric
              label="Avg Gross Margin"
              value="21.4%"
              trend="up"
              trendValue="+1.2% vs Q3"
              subtext="Target: 22%"
              icon={Percent}
            />
            <HeroMetric
              label="Active Shipments"
              value="127"
              trend="neutral"
              trendValue="53 bookings/week"
              subtext="Nov avg"
              icon={Package}
            />
            <HeroMetric
              label="Avg Payment Days"
              value="35.2"
              trend="down"
              trendValue="+2.8 days"
              subtext="Target: 30 days"
              icon={Clock}
              alert={true}
            />
          </div>

          {/* Cash Flow Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <NeuronCard padding="lg" className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#12332B] mb-1">
                    Cash Flow Position
                  </h3>
                  <p className="text-[13px] text-[#6B7A76]">
                    Receivables vs payables - your working capital health
                  </p>
                </div>
              </div>
              
              <div style={{ width: '100%', height: 'max(280px, min(350px, 40vh))' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#6B7A76', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E9F0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7A76', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E9F0' }}
                      tickFormatter={(value) => `₱${value / 1000}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#FFFFFF', 
                        border: '1px solid #E5E9F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}
                      formatter={(value: any) => `₱${(value / 1000).toFixed(0)}K`}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="receivables" fill="#0F766E" name="Receivables" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="payables" fill="#9CA3AF" name="Payables" radius={[4, 4, 0, 0]} />
                    <Line 
                      type="monotone" 
                      dataKey="netPosition" 
                      stroke="#14B8A6" 
                      strokeWidth={3}
                      name="Net Position"
                      dot={{ fill: '#14B8A6', r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </NeuronCard>

            <NeuronCard padding="lg">
              <div className="mb-6">
                <h3 className="text-[18px] font-semibold text-[#12332B] mb-1">
                  Payment Aging
                </h3>
                <p className="text-[13px] text-[#6B7A76]">
                  Client receivables breakdown
                </p>
              </div>
              
              <div className="space-y-4">
                {paymentBehaviorData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-medium text-[#12332B]">{item.name}</span>
                      <span className="text-[13px] font-semibold text-[#0F766E]">{item.amount}</span>
                    </div>
                    <div className="w-full h-2 bg-[#E5E9F0] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: idx === 0 ? '#0F766E' : idx === 1 ? '#14B8A6' : idx === 2 ? '#F97316' : '#EF4444'
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-[#6B7A76] mt-1">{item.value}% of total</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[#E5E9F0]">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#6B7A76]">Total Outstanding</span>
                  <span className="text-[16px] font-semibold text-[#12332B]">₱678,000</span>
                </div>
              </div>
            </NeuronCard>
          </div>

          {/* Margin Analysis & Booking Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <NeuronCard padding="lg">
              <div className="mb-6">
                <h3 className="text-[18px] font-semibold text-[#12332B] mb-1">
                  Margin by Service Type
                </h3>
                <p className="text-[13px] text-[#6B7A76]">
                  Where you make the most profit
                </p>
              </div>
              
              <div className="space-y-4">
                {marginByServiceData.map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px] font-medium text-[#12332B]">{item.service}</span>
                      <span className="text-[14px] font-semibold text-[#0F766E]">{item.margin}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-[#6B7A76]">
                      <span>Revenue: ₱{(item.revenue / 1000).toFixed(0)}K</span>
                      <span>·</span>
                      <span>Cost: ₱{(item.cost / 1000).toFixed(0)}K</span>
                      <span>·</span>
                      <span className="font-medium text-[#12332B]">
                        Profit: ₱{((item.revenue - item.cost) / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </NeuronCard>

            <NeuronCard padding="lg">
              <div className="mb-6">
                <h3 className="text-[18px] font-semibold text-[#12332B] mb-1">
                  Booking Volume & On-Time Rate
                </h3>
                <p className="text-[13px] text-[#6B7A76]">
                  Weekly coordination performance
                </p>
              </div>
              
              <div style={{ width: '100%', height: 'max(260px, min(320px, 35vh))' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F0" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: '#6B7A76', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E9F0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7A76', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E9F0' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#FFFFFF', 
                        border: '1px solid #E5E9F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="bookings" fill="#9CA3AF" name="Total Bookings" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="onTime" fill="#0F766E" name="On-Time Deliveries" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </NeuronCard>
          </div>

          {/* Client Intelligence - Profitability Focus */}
          <div className="mb-8">
            <NeuronCard padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#12332B] mb-1">
                    Top Clients by Profitability
                  </h3>
                  <p className="text-[13px] text-[#6B7A76]">
                    Not just revenue — who actually makes you money
                  </p>
                </div>
                <button className="px-4 py-2 text-[13px] font-medium text-[#0F766E] hover:bg-[#E8F2EE] rounded-lg transition-colors">
                  View All Clients
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#E5E9F0]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E9F0]">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6B7A76] uppercase tracking-wide">
                        Client
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6B7A76] uppercase tracking-wide">
                        Revenue (MTD)
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6B7A76] uppercase tracking-wide">
                        Margin
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6B7A76] uppercase tracking-wide">
                        Bookings
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6B7A76] uppercase tracking-wide">
                        Avg Payment Days
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-[#6B7A76] uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClientsByProfit.map((client, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-[#E5E9F0] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E8F2EE] flex items-center justify-center">
                              <Users size={14} className="text-[#0F766E]" />
                            </div>
                            <span className="text-[13px] font-medium text-[#12332B]">
                              {client.client}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-[13px] font-semibold text-[#12332B]">
                          {client.revenue}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#E8F2EE] text-[12px] font-semibold text-[#0F766E]">
                            {client.margin}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-[13px] text-[#6B7A76]">
                          {client.bookings}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-[13px] font-medium ${
                            client.paymentDays <= 30 ? 'text-[#0F766E]' : 
                            client.paymentDays <= 45 ? 'text-[#F97316]' : 
                            'text-[#EF4444]'
                          }`}>
                            {client.paymentDays} days
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            client.status === 'Excellent' 
                              ? 'bg-[#E8F2EE] text-[#0F766E]' 
                              : 'bg-[#FEF3C7] text-[#D97706]'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NeuronCard>
          </div>

          {/* Subcontractor Performance */}
          <div className="mb-8">
            <NeuronCard padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#12332B] mb-1">
                    Reliable Subcontractors
                  </h3>
                  <p className="text-[13px] text-[#6B7A76]">
                    Your coordination network performance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topSubcontractors.map((sub, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:border-[#0F766E] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E8F2EE] flex items-center justify-center">
                          <Truck size={18} className="text-[#0F766E]" />
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-[#12332B] mb-0.5">
                            {sub.name}
                          </div>
                          <div className="text-[11px] text-[#6B7A76]">
                            {sub.bookings} bookings this month
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-semibold ${
                        sub.rating === 'Excellent' 
                          ? 'bg-[#E8F2EE] text-[#0F766E]' 
                          : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}>
                        {sub.rating}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] text-[#6B7A76] mb-1">On-Time Rate</div>
                        <div className="text-[15px] font-semibold text-[#0F766E]">{sub.onTimeRate}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#6B7A76] mb-1">Avg Cost</div>
                        <div className="text-[15px] font-semibold text-[#12332B]">{sub.avgCost}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NeuronCard>
          </div>

          {/* Key Risk Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NeuronCard padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                  <AlertCircle size={18} className="text-[#EF4444]" />
                </div>
                <div>
                  <div className="text-[13px] text-[#6B7A76]">Overdue Payments</div>
                  <div className="text-[20px] font-semibold text-[#12332B]">₱54,200</div>
                </div>
              </div>
              <div className="text-[12px] text-[#6B7A76]">
                3 clients with 60+ day overdue invoices
              </div>
            </NeuronCard>

            <NeuronCard padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                  <Clock size={18} className="text-[#F97316]" />
                </div>
                <div>
                  <div className="text-[13px] text-[#6B7A76]">Delayed Shipments</div>
                  <div className="text-[20px] font-semibold text-[#12332B]">6 Active</div>
                </div>
              </div>
              <div className="text-[12px] text-[#6B7A76]">
                2 critical delays requiring intervention
              </div>
            </NeuronCard>

            <NeuronCard padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#E8F2EE] flex items-center justify-center">
                  <FileCheck size={18} className="text-[#0F766E]" />
                </div>
                <div>
                  <div className="text-[13px] text-[#6B7A76]">Doc Compliance</div>
                  <div className="text-[20px] font-semibold text-[#12332B]">94.3%</div>
                </div>
              </div>
              <div className="text-[12px] text-[#6B7A76]">
                4 shipments pending customs docs
              </div>
            </NeuronCard>
          </div>

        </div>
      </div>
    </div>
  );
}