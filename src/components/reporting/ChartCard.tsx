import { PieChart, Pie, Cell, LineChart, Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, typography, spacing, layout, effects } from './design-tokens';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface ChartCardProps {
  title: string;
  subtitle: string;
  type: 'donut' | 'line' | 'combo';
  data: any[];
  isLoading?: boolean;
}

export function ChartCard({ title, subtitle, type, data, isLoading }: ChartCardProps) {
  if (isLoading) {
    return (
      <Card style={{
        backgroundColor: colors.surface.card,
        border: `1px solid ${colors.border.light}`,
        borderRadius: layout.borderRadius.card,
        boxShadow: effects.cardElevation,
        padding: spacing.lg
      }}>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-[280px] w-full" />
      </Card>
    );
  }

  return (
    <Card style={{
      backgroundColor: colors.surface.card,
      border: `1px solid ${colors.border.light}`,
      borderRadius: layout.borderRadius.card,
      boxShadow: effects.cardElevation,
      padding: spacing.lg,
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.md,
      overflow: 'hidden' // Clip content
    }}>
      {/* Header */}
      <div>
        <h3 style={{ 
          ...typography.cardTitle,
          marginBottom: '4px'
        }}>
          {title}
        </h3>
        <p style={{ 
          ...typography.meta,
          color: colors.ink[500]
        }}>
          {subtitle}
        </p>
      </div>

      {/* Chart */}
      {type === 'donut' && <DonutChart data={data} />}
      {type === 'line' && <LineChartComponent data={data} />}
      {type === 'combo' && <ComboChartComponent data={data} />}
    </Card>
  );
}

function DonutChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      {/* Chart */}
      <div className="relative mb-6">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <p style={{ 
            ...typography.meta,
            color: colors.ink[500],
            marginBottom: '4px'
          }}>
            Total
          </p>
          <p style={{ 
            fontSize: '20px',
            fontWeight: 700,
            color: colors.ink[900],
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1 
          }}>
            ₱{(total / 1_000_000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span style={{ 
                ...typography.meta,
                color: colors.ink[700] 
              }}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ 
                ...typography.body,
                fontWeight: 600,
                color: colors.ink[900],
                fontVariantNumeric: 'tabular-nums' 
              }}>
                ₱{item.value.toLocaleString()}
              </span>
              <span style={{ 
                ...typography.meta,
                color: colors.ink[500],
                fontVariantNumeric: 'tabular-nums',
                width: '48px',
                textAlign: 'right'
              }}>
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChartComponent({ data }: { data: any[] }) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`;
    return `₱${value}`;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Axes */}
      <svg 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '28px', 
          width: 'calc(100% - 52px)', 
          height: 'calc(100% - 40px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {/* Y-axis */}
        <line x1="0" y1="0" x2="0" y2="100%" stroke={colors.border.axis} strokeWidth="1" />
        
        {/* X-axis */}
        <line x1="0" y1="100%" x2="100%" y2="100%" stroke={colors.border.axis} strokeWidth="1" />
        
        {/* Gridlines */}
        {[0.25, 0.5, 0.75].map((ratio, i) => (
          <line 
            key={i}
            x1="0" 
            y1={`${ratio * 100}%`} 
            x2="100%" 
            y2={`${ratio * 100}%`} 
            stroke={colors.border.subtle} 
            strokeWidth="1" 
          />
        ))}
      </svg>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 12, right: 24, bottom: 28, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: colors.ink[500], fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: colors.ink[500], fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors.primary[500]}
            strokeWidth={2}
            dot={{ fill: colors.primary[500], r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComboChartComponent({ data }: { data: any[] }) {
  // Transform data to include profit calculation
  const dataWithProfit = data.map(item => ({
    ...item,
    profit: item.revenue - item.expenses
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`;
    return `₱${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: colors.surface.white,
          border: `1px solid ${colors.border.light}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ 
            ...typography.body,
            color: colors.ink[900],
            marginBottom: '8px',
            fontWeight: 600
          }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              ...typography.body,
              color: entry.color,
              marginBottom: '4px',
              fontVariantNumeric: 'tabular-nums'
            }}>
              <span style={{ fontWeight: 600 }}>{entry.name}:</span> {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Chart with axes */}
      <div style={{ position: 'relative' }}>
        {/* Custom Axes */}
        <svg 
          style={{ 
            position: 'absolute', 
            top: '5px', 
            left: '40px', 
            width: 'calc(100% - 64px)', 
            height: 'calc(100% - 50px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {/* Gridlines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
            <line 
              key={i}
              x1="0" 
              y1={`${ratio * 100}%`} 
              x2="100%" 
              y2={`${ratio * 100}%`} 
              stroke={colors.border.subtle} 
              strokeWidth="1" 
            />
          ))}
        </svg>

        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={dataWithProfit} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: colors.ink[500], fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: colors.border.axis }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: colors.ink[500], fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: colors.border.axis }}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill={colors.success[500]}
              radius={[6, 6, 0, 0]}
              maxBarSize={14}
            />
            <Bar
              dataKey="expenses"
              fill={colors.danger[500]}
              radius={[6, 6, 0, 0]}
              maxBarSize={14}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke={colors.chart.blue}
              strokeWidth={2}
              dot={{ fill: colors.chart.blue, r: 3 }}
              activeDot={{ r: 5 }}
              strokeLinecap="round"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {/* Income */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: colors.success[500] }}
          />
          <span style={{ 
            ...typography.meta,
            color: colors.ink[700] 
          }}>
            Income
          </span>
        </div>

        {/* Expenses */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: colors.danger[500] }}
          />
          <span style={{ 
            ...typography.meta,
            color: colors.ink[700] 
          }}>
            Expenses
          </span>
        </div>

        {/* Profit */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <svg width="16" height="12">
              <line
                x1="0"
                x2="16"
                y1="6"
                y2="6"
                stroke={colors.chart.blue}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="8" cy="6" r="3" fill={colors.chart.blue} />
            </svg>
          </div>
          <span style={{ 
            ...typography.meta,
            color: colors.ink[700] 
          }}>
            Profit
          </span>
        </div>
      </div>
    </div>
  );
}
