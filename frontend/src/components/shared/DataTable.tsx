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
  toolbar?: ReactNode
  pagination?: ReactNode
}

const CARD = 'bg-white rounded-[20px] shadow-[0_4px_24px_rgba(46,58,89,0.08)] overflow-hidden'

export function DataTable<T extends { id: string | number }>({
  columns, data, loading, sortColumn, sortOrder, onSort,
  emptyMessage = 'Nenhum registro encontrado.',
  toolbar, pagination,
}: Props<T>) {

  if (loading) {
    return (
      <div className={CARD}>
        {toolbar && (
          <div className="px-5 py-4 border-b border-[#F0F3F8]">
            {toolbar}
          </div>
        )}
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn('animate-pulse h-13 border-b border-[#F5F7FB]', i % 2 === 0 ? 'bg-[#FAFBFD]' : 'bg-white')}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={CARD}>
      {/* Toolbar */}
      {toolbar && (
        <div className="px-5 py-4 border-b border-[#F0F3F8]">
          {toolbar}
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#F0F3F8] bg-[#FAFBFD]">
            {columns.map(col => (
              <TableHead
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={cn(
                  col.compact ? 'px-3' : 'px-5',
                  'py-3.5 h-auto text-[11px] font-semibold uppercase tracking-[0.6px] text-[#9BA8C2]',
                  col.sortable && 'cursor-pointer select-none',
                )}
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
                className="py-12 px-5 text-center text-sm text-[#9BA8C2]"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow
                key={row.id}
                className={cn(
                  'transition-colors hover:bg-[#FAFBFD]',
                  idx === data.length - 1 && !pagination ? 'border-none' : 'border-b border-[#F5F7FB]',
                )}
              >
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.compact ? 'px-3 py-2.5' : 'px-5 py-3.5',
                      'text-[13px] text-[#2E3A59]',
                    )}
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
        <div className="border-t border-[#F0F3F8] px-4 py-2">
          {pagination}
        </div>
      )}
    </div>
  )
}
