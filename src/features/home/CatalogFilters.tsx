import { Button } from '@/components/ui/button'

const categories: Array<[string, string, number]> = [
  ['art', 'Arte digital', 33], ['photo', 'Fotografia', 12], ['music', 'Música', 65], ['3d', 'Arte 3D', 39],
  ['collectible', 'Colecionáveis', 23], ['generative', 'Generativa', 17], ['games', 'Jogos', 19], ['membership', 'Assinaturas', 13], ['utility', 'Utilidade', 18],
]
const networks: Array<[string, number]> = [['Ethereum', 119], ['Polygon', 78], ['Solana', 86]]

export function CatalogFilters({ category, onCategoryChange }: {
  category?: string
  onCategoryChange: (category?: string) => void
}) {
  return <aside className="catalog-filters" aria-label="Filtros do catálogo">
    <h3>Coleções</h3>
    <div className="filter-list">
      {categories.map(([value, label, count]) => <button key={value} type="button" aria-pressed={category === value} onClick={() => onCategoryChange(category === value ? undefined : value)}><span>{label}</span><span>({count})</span></button>)}
    </div>
    <fieldset className="price-filter">
      <legend>Faixa de preço</legend>
      <input aria-label="Preço mínimo" type="range" min="0.02" max="12.3" step="0.01" defaultValue="0.02"/>
      <input aria-label="Preço máximo" type="range" min="0.02" max="12.3" step="0.01" defaultValue="12.3"/>
      <p>Preço: 0,02 – 12,30 ETH</p>
      <Button type="button" className="button button-light">Aplicar</Button>
    </fieldset>
    <fieldset className="network-filter">
      <legend>Rede</legend>
      {networks.map(([name, count]) => <label key={name}><input type="checkbox"/><span>{name}</span><span>({count})</span></label>)}
    </fieldset>
  </aside>
}
