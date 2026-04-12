import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-xl border border-[#E8ECF4] bg-[#FAFBFD] px-4 py-2 text-sm',
        'font-[Poppins,sans-serif] text-[#2E3A59]',
        'placeholder:text-[#B0BBCF]',
        'shadow-none transition-[border-color,box-shadow] outline-none',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-[#34C38F] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#34C38F]/10',
        'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10',
        'selection:bg-primary selection:text-primary-foreground',
        className
      )}
      {...props}
    />
  )
}

export { Input }
