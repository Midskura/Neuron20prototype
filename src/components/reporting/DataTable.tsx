import { colors, typography, spacing, layout, effects } from './design-tokens';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';

interface Column {
  key: string;
  label: string;
  align: 'left' | 'right' | 'center';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  showTotal?: boolean;
  totalRow?: any;
  onRowClick?: (row: any) => void;
}

export function DataTable({ columns, data, isLoading, showTotal, totalRow, onRowClick }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="border rounded-lg overflow-hidden"
      style={{ 
        borderColor: colors.border.light,
        borderRadius: layout.borderRadius.chip
      }}
    >
      <Table>
        <TableHeader style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <TableRow 
            className="hover:bg-transparent"
            style={{ 
              backgroundColor: colors.ink[100],
              borderColor: colors.border.light
            }}
          >
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`h-11 px-4 ${
                  col.align === 'right' ? 'text-right' : 
                  col.align === 'center' ? 'text-center' : 
                  'text-left'
                }`}
                style={{
                  ...typography.label,
                  color: colors.ink[700]
                }}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer' : ''}
              style={{
                borderColor: colors.border.light,
                backgroundColor: colors.surface.white,
                height: '44px'
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={`px-4 ${
                    col.align === 'right' ? 'text-right' : 
                    col.align === 'center' ? 'text-center' : 
                    'text-left'
                  }`}
                  style={{
                    ...typography.body,
                    color: colors.ink[900],
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
          
          {showTotal && totalRow && (
            <TableRow 
              className="hover:bg-transparent"
              style={{
                backgroundColor: colors.ink[100],
                borderTop: `2px solid ${colors.ink[300]}`
              }}
            >
              {columns.map((col, idx) => (
                <TableCell
                  key={col.key}
                  className={`px-4 ${
                    col.align === 'right' ? 'text-right' : 
                    col.align === 'center' ? 'text-center' : 
                    'text-left'
                  }`}
                  style={{
                    ...typography.body,
                    color: idx === 0 ? colors.ink[700] : colors.ink[900],
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {totalRow[col.key]}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
