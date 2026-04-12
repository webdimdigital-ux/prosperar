import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface Props {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

function getPageNumbers(current: number, last: number): (number | '...')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', last]
  if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last]
  return [1, '...', current - 1, current, current + 1, '...', last]
}

export function Pagination({ currentPage, lastPage, total, perPage, onPageChange, onPerPageChange }: Props) {
  const pages = getPageNumbers(currentPage, lastPage)
  const from = Math.min((currentPage - 1) * perPage + 1, total)
  const to = Math.min(currentPage * perPage, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
      <div className="flex items-center gap-2 text-sm text-[#7C8DB5]">
        <span>Mostrando</span>
        <Select value={String(perPage)} onValueChange={v => onPerPageChange(Number(v))}>
          <SelectTrigger size="sm" className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map(n => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>de {total} registros ({from}–{to})</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="flex size-9 items-center justify-center text-sm text-muted-foreground">…</span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
