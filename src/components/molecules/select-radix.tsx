import type { SelectProps } from './select'
import { cn } from '@/lib/cn'
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select'
import { selectCompactTriggerClass, selectRootClass } from '@/components/atoms/select-styles'

const emptyValue = '__kurio_empty__'

export default function SelectRadix({ value, options, onChange, label, icon, compact = false, className, initialOpen = false }: SelectProps & { initialOpen?: boolean }) {
  const selected = options.find((option) => option.value === value)

  return <div className={cn(selectRootClass, compact && 'custom-select-compact', className)}><SelectRoot defaultOpen={initialOpen} value={value || emptyValue} onValueChange={(next) => onChange(next === emptyValue ? '' : next)}>
    <SelectTrigger aria-label={label} showIcon={!compact} className={cn(compact && selectCompactTriggerClass, className)}>
      {icon}<span className={compact ? 'sr-only' : undefined}><SelectValue>{selected?.label ?? options[0]?.label}</SelectValue></span>
    </SelectTrigger>
    <SelectContent position="popper" sideOffset={6} align="end">
      {options.map((option) => <SelectItem key={option.value} value={option.value || emptyValue}>{option.label}</SelectItem>)}
    </SelectContent>
  </SelectRoot></div>
}
