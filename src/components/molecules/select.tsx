import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption { value: string; label: string }

export function Select({ value, options, onChange, label, icon, compact = false }: {
  value: string; options: SelectOption[]; onChange: (value: string) => void
  label: string; icon?: ReactNode; compact?: boolean
}) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = Math.max(0, options.findIndex((option) => option.value === value))
  const [active, setActive] = useState(selected)
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  const choose = (index: number) => {
    const option = options[index]
    if (option) onChange(option.value)
    setOpen(false)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab') { setOpen(false); return }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      if (!open) { setActive(selected); setOpen(true); return }
      if (event.key === 'Enter' || event.key === ' ') { choose(active); return }
      setActive(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : (active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (event.key.length === 1) {
      const index = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()))
      if (index >= 0) { setActive(index); setOpen(true) }
    }
  }
  return <div ref={root} className={`custom-select${compact ? ' custom-select-compact' : ''}`} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }}>
    <button type="button" role="combobox" aria-label={label} aria-expanded={open} aria-controls={`${id}-list`}
      aria-haspopup="listbox" aria-activedescendant={open ? `${id}-${active}` : undefined}
      className="custom-select-trigger" onKeyDown={onKeyDown}
      onClick={() => { setActive(selected); setOpen(!open) }}>
      {icon}<span className={compact ? 'sr-only' : undefined}>{options[selected]?.label}</span>
      {!compact && <ChevronDown size={14} aria-hidden="true"/>}
    </button>
    {open && <ul id={`${id}-list`} role="listbox" aria-label={label} className="custom-select-options">
      {options.map((option, index) => <li key={option.value} id={`${id}-${index}`} role="option"
        aria-selected={option.value === value} data-active={index === active}
        onPointerMove={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(index)}>
        <span>{option.label}</span>{option.value === value && <Check size={14} aria-hidden="true"/>}
      </li>)}
    </ul>}
  </div>
}
