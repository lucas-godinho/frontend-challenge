import type { Nft, CatalogQuery, CatalogResponse } from '@/types/marketplace'
import type { CatalogViewState } from '@/features/home/organisms/CatalogResults'
import { CatalogSection } from '@/features/home/organisms/CatalogSection'
import { MobileSearchRow } from '@/features/catalog/molecules/CatalogSearch'
import { HeroCarousel } from '@/features/home/organisms/HeroCarousel'
import { HomeEditorial } from '@/features/home/organisms/HomeEditorial'
import { Newsletter } from '@/features/home/organisms/Newsletter'
import { homeHeroSlides } from '../home-content'

export function HomeTemplate({
  search,
  draft,
  activeSlide,
  catalogState,
  catalogData,
  isFetching,
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
  catalogData?: CatalogResponse
  isFetching?: boolean
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
    <CatalogSection search={search} draft={draft} onDraftChange={onDraftChange} onUpdate={onUpdate} state={catalogState} renderCard={renderCard}
      catalogData={catalogData} isFetching={isFetching} featuredNft={featuredItems.find((nft) => nft.featured)}/>
    <Newsletter/>
    <HomeEditorial items={featuredItems}/>
  </main>
}
