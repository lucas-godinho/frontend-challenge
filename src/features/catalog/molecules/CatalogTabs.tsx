import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/cn'

export type CatalogTab = 'all' | 'new' | 'trending'

const tabs: Array<[CatalogTab, string]> = [['all', 'Todos os NFTs'], ['new', 'Novos lançamentos'], ['trending', 'Em alta']]

export function CatalogTabs({ activeTab, onSelect }: {
  activeTab: CatalogTab
  onSelect: (tab: CatalogTab) => void
}) {
  return <div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filtrar NFTs">
    {tabs.map(([key, label]) => <Button
      key={key}
      type="button"
      aria-pressed={activeTab === key}
      variant="ghost"
      className={cn('relative h-12 shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 text-sm font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', activeTab === key && 'border-primary text-primary')}
      onClick={() => onSelect(key)}
    >{label}</Button>)}
  </div>
}
