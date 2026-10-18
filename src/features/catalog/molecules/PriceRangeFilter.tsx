import { useState } from 'react'
import { Button } from '@/components/atoms/button'

const format = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const rangeInputClass = 'pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent p-0 focus-visible:outline-none [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-8px] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-card [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-grab'

export function PriceRangeFilter({ min, max, value, onApply }: {
  min: number; max: number; value?: [number, number]; onApply: (value: [number, number]) => void
}) {
  const lower = Math.max(min, Math.min(max, value?.[0] ?? min))
  const upper = Math.max(lower, Math.min(max, value?.[1] ?? max))
  const [range, setRange] = useState<[number, number]>([lower, upper])
  const percentage = (amount: number) => (amount - min) / (max - min || 1) * 100
  return <fieldset className="mt-7 grid gap-3 border-0 p-0">
    <legend className="mb-1 p-0 text-base font-semibold">Faixa de preço</legend>
    <div className="relative mx-2.5 h-6">
      <div className="absolute inset-x-2.5 top-2.5 h-1 rounded-full bg-[#64452e]" aria-hidden="true"><span className="absolute h-full rounded-full bg-primary" style={{ left: `${percentage(range[0])}%`, right: `${100 - percentage(range[1])}%` }}/></div>
      <input className={rangeInputClass} aria-label="Preço mínimo" aria-valuetext={`${format(range[0])} ETH`} type="range" min={min} max={max} step="0.01"
        style={{ zIndex: range[0] > (min + max) / 2 ? 3 : 1 }} value={range[0]} disabled={max <= min} onChange={(event) => setRange([Math.min(Number(event.target.value), range[1]), range[1]])}/>
      <input className={rangeInputClass} aria-label="Preço máximo" aria-valuetext={`${format(range[1])} ETH`} type="range" min={min} max={max} step="0.01"
        style={{ zIndex: 2 }} value={range[1]} disabled={max <= min} onChange={(event) => setRange([range[0], Math.max(Number(event.target.value), range[0])])}/>
    </div>
    <p className="m-0 text-sm text-muted-foreground">Preço: {format(range[0])} – {format(range[1])} ETH</p>
    <Button className="h-9 w-fit rounded-sm px-4 text-sm" type="button" onClick={() => onApply(range)}>Aplicar</Button>
  </fieldset>
}
