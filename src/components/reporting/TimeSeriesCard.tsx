import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, typography, effects, spacing, layout } from './design-tokens';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface TimeSeriesCardProps {
  title: string;
  subtitle: string;
  data: any[];
  dataKey: string;
  color: string;
  type?: 'revenue' | 'expense';
  isLoading?: boolean;
}

export function TimeSeriesCard({ 
  title, 
  subtitle, 
  data, 
  dataKey, 
  color,
  type = 'revenue',
  isLoading 
}: TimeSeriesCardProps) {
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
        <Skeleton className="h-[420px] w-full" />
      </Card>
    );
  }

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
            marginBottom: '4px',
            fontWeight: 600
          }}>
            {label}
          </p>
          <p style={{ 
            ...typography.body,
            color: color,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600
          }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card style={{
      backgroundColor: colors.surface.card,
      border: `1px solid ${colors.border.light}`,
      borderRadius: layout.borderRadius.card,
      boxShadow: effects.cardElevation,
      padding: spacing.lg,
      overflow: 'hidden' // Clip content
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.md }}>
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

      {/* Chart Container with Axes */}
      <div style={{ 
        position: 'relative',
        height: '420px',
        padding: '20px 24px 24px 40px',
        backgroundColor: colors.surface.white,
        borderRadius: '8px'
      }}>
        {/* Custom Axes */}
        <svg 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '28px', 
            width: 'calc(100% - 52px)', 
            height: 'calc(100% - 88px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {/* Y-axis */}
          <line x1="0" y1="0" x2="0" y2="100%" stroke={colors.border.axis} strokeWidth="1" />
          
          {/* X-axis */}
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke={colors.border.axis} strokeWidth="1" />
          
          {/* Gridlines - 4 horizontal lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
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

        {/* Chart Series */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: 'calc(100% - 64px)',
          zIndex: 1
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`area-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              
              {/* Transparent grid */}
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
              
              {/* X Axis */}
              <XAxis
                dataKey="date"
                tick={{ 
                  fill: colors.ink[500], 
                  fontSize: 12,
                  fontWeight: 400
                }}
                axisLine={false}
                tickLine={false}
                interval={1} // Show every 2nd date label
              />
              
              {/* Y Axis */}
              <YAxis
                tick={{ 
                  fill: colors.ink[500], 
                  fontSize: 12,
                  fontWeight: 400
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                width={40}
              />
              
              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} />
              
              {/* Area */}
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                fill={`url(#area-${type})`}
                strokeLinecap="round"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3" style={{ 
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span style={{ 
              ...typography.meta,
              color: colors.ink[700]
            }}>
              {type === 'revenue' ? 'Income' : 'Expenses'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
