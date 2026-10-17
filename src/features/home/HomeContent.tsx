import type { Nft, CatalogQuery } from '@/types/marketplace'
import type { CatalogViewState } from './CatalogResults'
import { CatalogSection } from './CatalogSection'
import { MobileSearchRow } from './CatalogSearch'
import { HeroCarousel } from './HeroCarousel'
import { HomeEditorial } from './HomeEditorial'
import { Newsletter } from './Newsletter'
import { homeHeroSlides } from './home-content'

export function HomeContent({
  search,
  draft,
  activeSlide,
  catalogState,
  featuredItems,
  onDraftChange,
  onUpdate,
  onSelectSlide,
  onPauseChange,
  renderCard,
}: {
  search: CatalogQuery
  draft: string
  activeSlide: number
  catalogState: CatalogViewState
  featuredItems: Nft[]
  onDraftChange: (value: string) => void
  onUpdate: (query: Partial<CatalogQuery>) => void
  onSelectSlide: (index: number) => void
  onPauseChange: (paused: boolean) => void
  renderCard?: Parameters<typeof CatalogSection>[0]['renderCard']
}) {
  return <main id="main" className="page-wrap">
    <MobileSearchRow search={search} draft={draft} onDraftChange={onDraftChange} onUpdate={onUpdate}/>
    <HeroCarousel slides={homeHeroSlides} activeSlide={activeSlide} items={featuredItems} onSelect={onSelectSlide} onPauseChange={onPauseChange}/>
    <CatalogSection search={search} draft={draft} onDraftChange={onDraftChange} onUpdate={onUpdate} state={catalogState} renderCard={renderCard}/>
    <Newsletter/>
    <HomeEditorial items={featuredItems}/>
  </main>
}
