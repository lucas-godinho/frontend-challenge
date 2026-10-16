import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: { default: 'bg-primary text-primary-foreground hover:bg-primary/90', secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80', outline: 'border border-border bg-transparent text-foreground hover:bg-muted', ghost: 'text-foreground hover:bg-muted', destructive: 'bg-destructive text-white hover:bg-destructive/90' },
    size: { default: 'h-11 px-4 text-xs', sm: 'h-9 px-3 text-xs', icon: 'size-10' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant, size, ...props }, ref) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
