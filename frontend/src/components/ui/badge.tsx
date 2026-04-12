import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-[6px] px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[#E6F9F7] text-[#4ECDC4]',
        secondary: 'bg-[#FEF5E6] text-[#F5A623]',
        destructive: 'bg-[#FDEAE6] text-[#E8624A]',
        outline: 'bg-[#F0F2F7] text-[#7C8DB5]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
