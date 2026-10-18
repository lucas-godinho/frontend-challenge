import type { ReactNode } from 'react'
import { Dialog as DialogRoot, DialogContent } from '@/components/atoms/dialog'

interface DialogProps {
  children: ReactNode
  labelledBy: string
  className?: string
  onClose: () => void
  modal?: boolean
}

export function Dialog({ children, labelledBy, className = '', onClose, modal = true }: DialogProps) {
  if (!modal) return <section className={className} aria-labelledby={labelledBy}>{children}</section>

  return <DialogRoot open onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent inline showCloseButton={false} className={className} aria-labelledby={labelledBy} aria-describedby={undefined}>
      {children}
    </DialogContent>
  </DialogRoot>
}
