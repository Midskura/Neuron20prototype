import { useState } from 'react';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { CompanySelect } from './CompanySelect';

export type PeriodPreset = 'day' | 'week' | 'month' | 'custom';

interface DateControlsCardProps {
  onApply: () => void;
  onExport: () => void;
  isLoading?: boolean;
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  dateFrom: Date;
  dateTo: Date;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  company?: string;
  onCompanyChange?: (company: string) => void;
  onCompanyCodeChange?: (code: string) => void;
}

export function DateControlsCard({ 
  onApply, 
  onExport, 
  isLoading,
  preset,
  onPresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  company = 'all',
  onCompanyChange,
  onCompanyCodeChange
}: DateControlsCardProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handlePresetChange = (value: PeriodPreset) => {
    onPresetChange(value);
    
    const today = new Date(2025, 9, 27); // Oct 27, 2025
    
    switch (value) {
      case 'day':
        onDateFromChange(today);
        onDateToChange(today);
        break;
      case 'week':
        const weekStart = new Date(2025, 9, 20); // Oct 20, 2025
        onDateFromChange(weekStart);
        onDateToChange(today);
        break;
      case 'month':
        const monthStart = new Date(2025, 9, 1); // Oct 1, 2025
        onDateFromChange(monthStart);
        onDateToChange(today);
        break;
      case 'custom':
        // Keep current dates
        break;
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div 
      className="date-controls-card"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        minHeight: '88px',
        boxShadow: 'none'
      }}
    >
      {/* Period Segmented Control */}
      <div 
        className="flex items-center gap-1 p-1"
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          height: '32px'
        }}
      >
        {['day', 'week', 'month', 'custom'].map((option) => (
          <button
            key={option}
            onClick={() => handlePresetChange(option as PeriodPreset)}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              padding: '0 16px',
              height: '24px',
              borderRadius: '8px',
              backgroundColor: preset === option ? '#2563EB' : 'transparent',
              color: preset === option ? '#FFFFFF' : '#334155',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
            className={preset !== option ? 'hover:bg-white/50' : ''}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Start Date Field */}
      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
        <PopoverTrigger asChild>
          <div 
            className="flex items-center gap-2 px-3 cursor-pointer hover:border-gray-300 transition-colors"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6E8EC',
              borderRadius: '8px',
              height: '34px',
              width: '160px'
            }}
          >
            <CalendarIcon className="w-4 h-4" style={{ color: '#64748B' }} />
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              color: '#0F172A',
            }}>
              {formatDate(dateFrom)}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          style={{
            borderRadius: '10px',
            border: '1px solid #E6E8EC',
            boxShadow: 'none'
          }}
        >
          <Calendar
            mode="single"
            selected={dateFrom}
            onSelect={(date) => {
              if (date) {
                onDateFromChange(date);
                onPresetChange('custom');
                setStartDateOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* "to" Label */}
      <span style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: 400,
        color: '#64748B'
      }}>
        to
      </span>

      {/* End Date Field */}
      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
        <PopoverTrigger asChild>
          <div 
            className="flex items-center gap-2 px-3 cursor-pointer hover:border-gray-300 transition-colors"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6E8EC',
              borderRadius: '8px',
              height: '34px',
              width: '160px'
            }}
          >
            <CalendarIcon className="w-4 h-4" style={{ color: '#64748B' }} />
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              color: '#0F172A',
            }}>
              {formatDate(dateTo)}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          style={{
            borderRadius: '10px',
            border: '1px solid #E6E8EC',
            boxShadow: 'none'
          }}
        >
          <Calendar
            mode="single"
            selected={dateTo}
            onSelect={(date) => {
              if (date) {
                onDateToChange(date);
                onPresetChange('custom');
                setEndDateOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Company Dropdown */}
      <CompanySelect 
        value={company} 
        onValueChange={onCompanyChange || (() => {})}
        onCompanyCodeChange={onCompanyCodeChange}
      />

      {/* Spacer */}
      <div style={{ flex: 1, minWidth: '16px' }} />

      {/* Action Buttons Group */}
      <div className="date-controls-actions" style={{ display: 'flex', gap: '12px' }}>
        {/* Apply Button */}
        <Button
          onClick={onApply}
          disabled={isLoading}
          style={{
            height: '34px',
            borderRadius: '8px',
            backgroundColor: '#0B63FF',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 500,
            padding: '0 20px',
            border: 'none'
          }}
        >
          Apply
        </Button>

        {/* Export Button */}
        <Button
          onClick={onExport}
          variant="outline"
          style={{
            height: '34px',
            borderRadius: '8px',
            border: '1px solid #E6E8EC',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            fontSize: '13px',
            fontWeight: 500,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
