import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  return <nav className="pagination" aria-label="Paginação do catálogo">
    <button type="button" aria-label="Página anterior" disabled={disabled || current === 1} onClick={() => onPageChange(current - 1)}><ChevronLeft size={14}/></button>
    {slots.map((value) => typeof value === 'string' ? <span key={value} aria-hidden="true">…</span>
      : <button type="button" key={value} aria-label={`Página ${value}`} aria-current={value === current ? 'page' : undefined}
        disabled={disabled} onClick={() => { if (value !== current) onPageChange(value) }}>{value}</button>)}
    <button type="button" aria-label="Próxima página" disabled={disabled || current === pages} onClick={() => onPageChange(current + 1)}><ChevronRight size={14}/></button>
  </nav>
}
