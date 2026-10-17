export type CatalogTab = 'all' | 'new' | 'trending'

const tabs: Array<[CatalogTab, string]> = [['all', 'Todos os NFTs'], ['new', 'Novos lançamentos'], ['trending', 'Em alta']]

export function CatalogTabs({ activeTab, onSelect }: {
  activeTab: CatalogTab
  onSelect: (tab: CatalogTab) => void
}) {
  return <div className="catalog-tabs" role="group" aria-label="Filtrar NFTs">
    {tabs.map(([key, label]) => <button
      key={key}
      type="button"
      aria-pressed={activeTab === key}
      className={activeTab === key ? 'active' : ''}
      onClick={() => onSelect(key)}
    >{label}</button>)}
  </div>
}
