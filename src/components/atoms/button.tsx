import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { buttonVariants } from './button-variants'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ asChild = false, className, variant, size, ...props }, ref) {
  const Component = asChild ? Slot : 'button'
  return <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
