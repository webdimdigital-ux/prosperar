import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-[#34C38F] to-[#26A69A] text-white hover:opacity-90 active:scale-[0.98] shadow-sm',
        destructive: 'bg-destructive text-white hover:opacity-90',
        outline: 'border border-[#34C38F] bg-transparent text-[#34C38F] hover:bg-[#EAF7F2]',
        secondary: 'bg-[#F5F6FA] text-[#2E3A59] hover:bg-[#E8ECF4]',
        ghost: 'text-[#7C8DB5] hover:bg-[#F5F6FA] hover:text-[#2E3A59]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-11 px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
