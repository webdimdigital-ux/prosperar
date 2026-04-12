import { type ReactNode } from 'react'
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  compact?: boolean
  render?: (row: T) => ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  sortColumn?: string
  sortOrder?: 'ASC' | 'DESC'
  onSort?: (column: string) => void
  emptyMessage?: string
  /** Filter/search bar rendered above the table, inside the card */
  toolbar?: ReactNode
  /** Pagination rendered below the table, inside the card */
  pagination?: ReactNode
}

const CARD_STYLE: React.CSSProperties = {
  background: 'white',
  borderRadius: 20,
  boxShadow: '0 4px 24px rgba(46,58,89,0.08)',
  overflow: 'hidden',
}

export function DataTable<T extends { id: string | number }>({
  columns, data, loading, sortColumn, sortOrder, onSort,
  emptyMessage = 'Nenhum registro encontrado.',
  toolbar, pagination,
}: Props<T>) {

  if (loading) {
    return (
      <div style={CARD_STYLE}>
        {toolbar && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F3F8' }}>
            {toolbar}
          </div>
        )}
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: 52,
                borderBottom: '1px solid #F5F7FB',
                backgroundColor: i % 2 === 0 ? '#FAFBFD' : 'white',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={CARD_STYLE}>
      {/* Toolbar (filters / search) */}
      {toolbar && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F3F8' }}>
          {toolbar}
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow
            className="hover:bg-transparent"
            style={{ borderBottom: '1px solid #F0F3F8', backgroundColor: '#FAFBFD' }}
          >
            {columns.map(col => (
              <TableHead
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={cn(
                  col.compact ? 'px-3' : 'px-5',
                  'py-3.5 h-auto',
                  col.sortable && 'cursor-pointer select-none',
                )}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#9BA8C2',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortColumn === col.key
                      ? sortOrder === 'ASC'
                        ? <ChevronUpIcon className="size-3.5 text-primary" />
                        : <ChevronDownIcon className="size-3.5 text-primary" />
                      : <ChevronsUpDownIcon className="size-3.5 opacity-30" />
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                style={{ padding: '48px 20px', textAlign: 'center', color: '#9BA8C2', fontSize: 14 }}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow
                key={row.id}
                style={{
                  borderBottom: idx === data.length - 1 && !pagination ? 'none' : '1px solid #F5F7FB',
                }}
                className="transition-colors"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFBFD')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    className={col.compact ? 'px-3 py-2.5' : 'px-5 py-3.5'}
                    style={{ fontSize: 13, color: '#2E3A59', fontFamily: 'Poppins, sans-serif' }}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <div style={{ borderTop: '1px solid #F0F3F8', padding: '8px 16px' }}>
          {pagination}
        </div>
      )}
    </div>
  )
}
