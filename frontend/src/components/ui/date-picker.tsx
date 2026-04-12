import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function parseDateString(value: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(value + 'T00:00:00')
  return isNaN(d.getTime()) ? undefined : d
}

function toApiString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DatePicker({ value = '', onChange, placeholder = 'Selecionar data', className, disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDateString(value)

  function handleSelect(date: Date | undefined) {
    onChange(date ? toApiString(date) : '')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-start gap-2 rounded-xl border border-[#E8ECF4] bg-[#FAFBFD] px-4 text-sm font-normal font-[Poppins,sans-serif]',
            'hover:bg-white hover:border-[#34C38F] focus-visible:border-[#34C38F] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#34C38F]/10',
            !selected ? 'text-[#B0BBCF]' : 'text-[#2E3A59]',
            className
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          {selected
            ? selected.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
