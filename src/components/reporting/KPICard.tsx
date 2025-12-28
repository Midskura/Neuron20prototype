import { TrendingUp, TrendingDown } from 'lucide-react';
import { colors, typography, effects, spacing, layout } from './design-tokens';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface KPICardProps {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export function KPICard({ 
  label, 
  value, 
  delta, 
  deltaLabel, 
  icon: Icon, 
  iconColor,
  iconBgColor,
  isLoading,
  onClick 
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card style={{
        backgroundColor: colors.surface.card,
        border: `1px solid ${colors.border.light}`,
        borderRadius: layout.borderRadius.card,
        boxShadow: effects.cardElevation,
        padding: spacing.lg,
        minHeight: '120px'
      }}>
        <div className="space-y-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </Card>
    );
  }

  const isPositive = delta > 0;

  return (
    <Card 
      onClick={onClick}
      style={{
        backgroundColor: colors.surface.card,
        border: `1px solid ${colors.border.light}`,
        borderRadius: layout.borderRadius.card,
        boxShadow: effects.cardElevation,
        padding: spacing.lg,
        minHeight: '120px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md
      }}
      className={onClick ? 'hover:border-gray-300' : ''}
    >
      {/* Title Row: Icon + Label */}
      <div className="flex items-center gap-2">
        {/* Icon with circular tinted background */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: iconBgColor
          }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor, strokeWidth: 2 }} />
        </div>
        
        {/* Label */}
        <p style={{ 
          ...typography.label,
          color: colors.ink[700],
          margin: 0
        }}>
          {label}
        </p>
      </div>
      
      {/* Value + Delta Row */}
      <div className="flex items-end justify-between">
        {/* Value */}
        <p style={{ 
          ...typography.kpi,
          color: colors.ink[900],
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1
        }}>
          {value}
        </p>
        
        {/* Delta Chip */}
        <div 
          className="px-2 py-1 rounded-full"
          style={{
            backgroundColor: isPositive ? colors.success[50] : colors.danger[50],
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {isPositive ? (
            <span style={{ color: colors.success[500], fontSize: '10px' }}>▲</span>
          ) : (
            <span style={{ color: colors.danger[500], fontSize: '10px' }}>▼</span>
          )}
          <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: isPositive ? colors.success[500] : colors.danger[500],
            fontVariantNumeric: 'tabular-nums'
          }}>
            {deltaLabel}
          </span>
        </div>
      </div>
    </Card>
  );
}
