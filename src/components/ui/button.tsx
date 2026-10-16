import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68752a] disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: { default: 'bg-[#20201d] text-white hover:bg-[#393933]', secondary: 'bg-[#e6e8dc] text-[#20201d] hover:bg-[#dce0cc]', outline: 'border border-[#deddd6] bg-transparent text-[#20201d] hover:bg-[#eeede7]', ghost: 'text-[#20201d] hover:bg-[#eeede7]' },
    size: { default: 'h-11 px-4 text-xs', sm: 'h-9 px-3 text-xs', icon: 'size-10' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant, size, ...props }, ref) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
