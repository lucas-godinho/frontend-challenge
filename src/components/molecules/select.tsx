import { lazy, Suspense, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { selectCompactTriggerClass, selectRootClass, selectTriggerClass } from '@/components/atoms/select-styles'

export interface SelectOption { value: string; label: string }

export interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  label: string
  icon?: ReactNode
  compact?: boolean
  className?: string
}

const SelectRadix = lazy(() => import('./select-radix'))

export function Select({ value, options, onChange, label, icon, compact = false, className }: SelectProps) {
  const [activated, setActivated] = useState(false)
  const selected = options.find((option) => option.value === value)
  const trigger = <div className={cn(selectRootClass, compact && 'custom-select-compact', className)}>
    <button type="button" role="combobox" aria-label={label} aria-expanded="false" aria-haspopup="listbox" className={cn(selectTriggerClass, compact && selectCompactTriggerClass, className)} onClick={() => setActivated(true)}>
      {icon}<span className={compact ? 'sr-only' : undefined}>{selected?.label ?? options[0]?.label}</span>
      {!compact && <ChevronDown size={14} aria-hidden="true"/>}
    </button>
  </div>

  return activated
    ? <Suspense fallback={trigger}><SelectRadix value={value} options={options} onChange={onChange} label={label} icon={icon} compact={compact} className={className} initialOpen/></Suspense>
    : trigger
}
