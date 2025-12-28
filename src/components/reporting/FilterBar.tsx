import { useState } from 'react';
import { Calendar, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { colors, typography, spacing, layout } from './design-tokens';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FilterBarProps {
  onApply: () => void;
  isLoading?: boolean;
}

export function FilterBar({ onApply, isLoading }: FilterBarProps) {
  const [dateFrom, setDateFrom] = useState('2025-10-01');
  const [dateTo, setDateTo] = useState('2025-10-27');
  const [company, setCompany] = useState('all');
  const [preset, setPreset] = useState('month');

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const today = new Date('2025-10-27');
    
    switch (value) {
      case 'day':
        setDateFrom('2025-10-27');
        setDateTo('2025-10-27');
        break;
      case 'week':
        setDateFrom('2025-10-20');
        setDateTo('2025-10-27');
        break;
      case 'month':
        setDateFrom('2025-10-01');
        setDateTo('2025-10-27');
        break;
      case 'custom':
        // Keep current dates
        break;
    }
  };

  const handlePrevPeriod = () => {
    // Logic to jump to previous period
    console.log('Previous period');
  };

  const handleNextPeriod = () => {
    // Logic to jump to next period
    console.log('Next period');
  };

  return (
    <div className="flex items-center gap-4">
      {/* Period Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevPeriod}
          className="h-8 w-8 p-0"
          style={{ borderRadius: layout.borderRadius.button }}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextPeriod}
          className="h-8 w-8 p-0"
          style={{ borderRadius: layout.borderRadius.button }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Presets Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: colors.ink[100] }}>
          {['day', 'week', 'month', 'custom'].map((option) => (
            <button
              key={option}
              onClick={() => handlePresetChange(option)}
              style={{
                ...typography.label,
                padding: '4px 12px',
                borderRadius: layout.borderRadius.chip,
                backgroundColor: preset === option ? colors.surface.white : 'transparent',
                color: preset === option ? colors.ink[900] : colors.ink[700],
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
                height: '28px'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg border" style={{ 
          borderColor: colors.border.light,
          backgroundColor: colors.surface.white,
          borderRadius: layout.borderRadius.input,
          height: '32px'
        }}>
          <Calendar className="w-4 h-4" style={{ color: colors.ink[500] }} />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              ...typography.body,
              fontSize: '13px',
              color: colors.ink[900],
              border: 'none',
              outline: 'none',
              width: '110px',
              backgroundColor: 'transparent'
            }}
          />
        </div>
        
        <span style={{ 
          ...typography.meta,
          color: colors.ink[500]
        }}>
          to
        </span>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg border" style={{ 
          borderColor: colors.border.light,
          backgroundColor: colors.surface.white,
          borderRadius: layout.borderRadius.input,
          height: '32px'
        }}>
          <Calendar className="w-4 h-4" style={{ color: colors.ink[500] }} />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              ...typography.body,
              fontSize: '13px',
              color: colors.ink[900],
              border: 'none',
              outline: 'none',
              width: '110px',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Company Selector */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4" style={{ color: colors.ink[500] }} />
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger 
            className="w-[200px] h-8"
            style={{ 
              borderRadius: layout.borderRadius.input,
              borderColor: colors.border.light
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            <SelectItem value="jjb-main">JJB Main</SelectItem>
            <SelectItem value="jjb-express">JJB Express</SelectItem>
            <SelectItem value="jjb-intl">JJB International</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
