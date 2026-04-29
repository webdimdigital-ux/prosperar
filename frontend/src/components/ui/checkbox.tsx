import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked, indeterminate, onCheckedChange, className }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange(e.target.checked)}
      className={cn('size-4 rounded cursor-pointer accent-[#E8624A]', className)}
    />
  )
}
