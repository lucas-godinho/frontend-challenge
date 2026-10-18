import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'

export function Pagination({ page, pageSize, total, onPageChange, disabled = false }: {
  page: number; pageSize: number; total: number; onPageChange: (page: number) => void; disabled?: boolean
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
  const current = Math.min(pages, Math.max(1, page))
  if (pages <= 1) return null
  const visible = Array.from(new Set([1, current - 1, current, current + 1, pages]))
    .filter((value) => value >= 1 && value <= pages).sort((a, b) => a - b)
  const slots: Array<number | string> = []
  for (const value of visible) {
    const previous = slots.at(-1)
    if (typeof previous === 'number' && value - previous > 1) {
      if (value - previous === 2) slots.push(previous + 1)
      else slots.push(`gap-${value}`)
    }
    slots.push(value)
  }
  return <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Paginação do catálogo">
    <Button variant="outline" size="icon" className="size-10 rounded-sm" type="button" aria-label="Página anterior" disabled={disabled || current === 1} onClick={() => onPageChange(current - 1)}><ChevronLeft size={16}/></Button>
    {slots.map((value) => typeof value === 'string' ? <span className="px-1 text-sm text-muted-foreground" key={value} aria-hidden="true">…</span>
      : <Button variant={value === current ? 'default' : 'outline'} size="icon" className="size-10 rounded-sm text-sm" type="button" key={value} aria-label={`Página ${value}`} aria-current={value === current ? 'page' : undefined}
        disabled={disabled} onClick={() => { if (value !== current) onPageChange(value) }}>{value}</Button>)}
    <Button variant="outline" size="icon" className="size-10 rounded-sm" type="button" aria-label="Próxima página" disabled={disabled || current === pages} onClick={() => onPageChange(current + 1)}><ChevronRight size={16}/></Button>
  </nav>
}
