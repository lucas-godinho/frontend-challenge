import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function PageContainer({ className, ...props }: ComponentProps<'main'>) {
  return <main
    className={cn(
      'mx-auto w-full max-w-[1600px] px-[clamp(28px,6.3vw,100px)]',
      'max-[760px]:px-[var(--space-frame-inline)] max-[760px]:pt-10 max-[760px]:pb-5',
      'min-[761px]:max-[1050px]:px-[4.5%]',
      'min-[1051px]:max-[1199px]:px-[5%]',
      'min-[1200px]:max-w-[1440px] min-[1200px]:px-[120px]',
      className,
    )}
    {...props}
  />
}
