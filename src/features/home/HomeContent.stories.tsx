import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CatalogQuery } from '@/types/marketplace'
import { catalogFixture } from '@/mocks/fixtures'
import { FavoriteButton, NftCardContent } from '@/features/catalog/NftCard'
import { HomeContent } from './HomeContent'
import type { CatalogViewState } from './CatalogResults'
import { queryCatalog } from '@/mocks/catalog'

function HomeContentExample() {
  const [search, setSearch] = useState<CatalogQuery>({ sort: 'recent', page: 1 })
  const [draft, setDraft] = useState('')
  const [activeSlide, setActiveSlide] = useState(0)
  const data = queryCatalog(search)
  const state: CatalogViewState = data.total ? { status: 'success', items: data.items } : { status: 'empty' }

  return <HomeContent
    search={search}
    draft={draft}
    activeSlide={activeSlide}
    catalogState={state}
    catalogData={data}
    featuredItems={catalogFixture}
    onDraftChange={setDraft}
    onUpdate={(next) => setSearch((current) => ({ ...current, ...next, page: next.page ?? 1 }))}
    onSelectSlide={setActiveSlide}
    onPauseChange={() => undefined}
    renderCard={(nft, index) => <article className="nft-card"><NftCardContent nft={nft} index={index}/><FavoriteButton nft={nft}/></article>}
  />
}

const meta = {
  title: 'Home/Visão geral',
  component: HomeContentExample,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Composição visual completa da Home, alimentada por fixtures e isolada do Router e da API. Use as stories específicas para revisar estados e componentes individualmente.' } } },
} satisfies Meta<typeof HomeContentExample>

export default meta
type Story = StoryObj<typeof meta>
export const CatalogoCarregado: Story = { name: 'Home com catálogo carregado' }
