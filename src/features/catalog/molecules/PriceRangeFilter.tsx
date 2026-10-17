import { useState } from 'react'

const format = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function PriceRangeFilter({ min, max, value, onApply }: {
  min: number; max: number; value?: [number, number]; onApply: (value: [number, number]) => void
}) {
  const lower = Math.max(min, Math.min(max, value?.[0] ?? min))
  const upper = Math.max(lower, Math.min(max, value?.[1] ?? max))
  const [range, setRange] = useState<[number, number]>([lower, upper])
  const percentage = (amount: number) => (amount - min) / (max - min || 1) * 100
  return <fieldset className="price-filter">
    <legend>Faixa de preço</legend>
    <div className="price-range">
      <div className="price-range-track" aria-hidden="true"><span style={{ left: `${percentage(range[0])}%`, right: `${100 - percentage(range[1])}%` }}/></div>
      <input aria-label="Preço mínimo" aria-valuetext={`${format(range[0])} ETH`} type="range" min={min} max={max} step="0.01"
        style={{ zIndex: range[0] > (min + max) / 2 ? 3 : 1 }} value={range[0]} disabled={max <= min} onChange={(event) => setRange([Math.min(Number(event.target.value), range[1]), range[1]])}/>
      <input aria-label="Preço máximo" aria-valuetext={`${format(range[1])} ETH`} type="range" min={min} max={max} step="0.01"
        style={{ zIndex: 2 }} value={range[1]} disabled={max <= min} onChange={(event) => setRange([range[0], Math.max(Number(event.target.value), range[0])])}/>
    </div>
    <p>Preço: {format(range[0])} – {format(range[1])} ETH</p>
    <button type="button" className="button button-light" onClick={() => onApply(range)}>Aplicar</button>
  </fieldset>
}
