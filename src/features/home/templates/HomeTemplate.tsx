import { PageContainer } from '@/components/organisms/PageContainer'
import { lazy, Suspense } from 'react'
import type { Nft, CatalogQuery, CatalogResponse } from '@/types/marketplace'
import type { CatalogViewState } from '@/features/home/organisms/CatalogResults'
import { CatalogSection } from '@/features/home/organisms/CatalogSection'
import { MobileSearchRow } from '@/features/catalog/molecules/CatalogSearch'
import { HeroCarousel } from '@/features/home/organisms/HeroCarousel'
import { Newsletter } from '@/features/home/organisms/Newsletter'
import { homeHeroSlides } from '../home-content'
import { useMediaQuery } from '@/lib/use-media-query'

const HomeEditorial = lazy(() => import('@/features/home/organisms/HomeEditorial').then((module) => ({ default: module.HomeEditorial })))

export function HomeTemplate({
  search,
  draft,
  catalogState,
  catalogData,
  isFetching,
  featuredItems,
  onDraftChange,
  onUpdate,
  renderCard,
}: {
  search: CatalogQuery
  draft: string
  catalogState: CatalogViewState
  catalogData?: CatalogResponse
  isFetching?: boolean
  featuredItems: Nft[]
  onDraftChange: (value: string) => void
  onUpdate: (query: Partial<CatalogQuery>) => void
  renderCard?: Parameters<typeof CatalogSection>[0]['renderCard']
}) {
  const showEditorial = useMediaQuery('(min-width: 1051px)')
  return <PageContainer id="main">
    <MobileSearchRow search={search} draft={draft} onDraftChange={onDraftChange} onUpdate={onUpdate}/>
    <HeroCarousel slides={homeHeroSlides} items={featuredItems}/>
    <CatalogSection search={search} draft={draft} onDraftChange={onDraftChange} onUpdate={onUpdate} state={catalogState} renderCard={renderCard}
      catalogData={catalogData} isFetching={isFetching} featuredNft={featuredItems.find((nft) => nft.featured)}/>
    <Newsletter/>
    {showEditorial && <Suspense fallback={null}><HomeEditorial items={featuredItems}/></Suspense>}
  </PageContainer>
}
