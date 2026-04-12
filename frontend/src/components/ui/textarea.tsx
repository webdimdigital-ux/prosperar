import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[88px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm',
        'placeholder:text-muted-foreground',
        'transition-[border-color,box-shadow] outline-none shadow-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
        'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
