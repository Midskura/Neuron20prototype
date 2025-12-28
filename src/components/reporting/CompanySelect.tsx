import { useState, useMemo } from 'react';
import { Building2, Check, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input';

export interface Company {
  id: string;
  name: string;
  code: string;
}

export const COMPANIES: Company[] = [
  {
    id: "all",
    name: "All Companies",
    code: "ALL",
  },
  {
    id: "cce",
    name: "Conforme Cargo Express",
    code: "CCE",
  },
  {
    id: "znicf",
    name: "ZN International Cargo Forwarding Company",
    code: "ZNICF",
  },
  {
    id: "jlcs",
    name: "Juan Logistica Courier Services",
    code: "JLCS",
  },
  {
    id: "zomi",
    name: "Zeuj One Marketing International",
    code: "ZOMI",
  },
  {
    id: "cptc",
    name: "Conforme Packaging and Trading Corporation",
    code: "CPTC",
  },
];

interface CompanySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onCompanyCodeChange?: (code: string) => void;
}

export function CompanySelect({ value, onValueChange, onCompanyCodeChange }: CompanySelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCompany = COMPANIES.find(c => c.id === value) || COMPANIES[0];

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return COMPANIES;
    const query = searchQuery.toLowerCase();
    return COMPANIES.filter(company => 
      company.name.toLowerCase().includes(query) ||
      company.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (company: Company) => {
    onValueChange(company.id);
    if (onCompanyCodeChange && company.id !== 'all') {
      onCompanyCodeChange(company.code);
    }
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 cursor-pointer hover:border-gray-300 transition-colors"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E8EC',
            borderRadius: '8px',
            height: '34px',
            minWidth: '240px',
            justifyContent: 'flex-start',
          }}
        >
          <Building2 className="w-4 h-4" style={{ color: '#64748B' }} />
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            color: '#0F172A',
            flex: 1,
            textAlign: 'left',
          }}>
            {selectedCompany.name}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="start"
        className="p-0"
        style={{
          width: '296px',
          maxHeight: '320px',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Search Field */}
        <div className="relative" style={{ marginBottom: '4px' }}>
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2" 
            style={{ 
              width: '14px', 
              height: '14px', 
              color: '#64748B' 
            }} 
          />
          <Input
            placeholder="Search companies…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9"
            style={{
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              paddingLeft: '32px',
            }}
          />
        </div>

        {/* Company List */}
        <div 
          className="overflow-y-auto"
          style={{
            maxHeight: '240px',
          }}
        >
          {filteredCompanies.map((company) => {
            const isSelected = company.id === value;
            
            return (
              <button
                key={company.id}
                onClick={() => handleSelect(company)}
                className="w-full text-left transition-colors"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#FFF7ED' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#0F172A',
                }}>
                  {company.name}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4" style={{ color: '#FB923C' }} />
                )}
              </button>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div 
            style={{
              padding: '16px 12px',
              textAlign: 'center',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              color: '#64748B',
            }}
          >
            No companies found
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
