import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CatalogQuery } from '@/types/marketplace'
import { catalogFixture } from '@/mocks/fixtures'
import { NftCardContent } from '@/features/catalog/NftCard'
import { HomeContent } from './HomeContent'
import type { CatalogViewState } from './CatalogResults'

function HomeContentExample() {
  const [search, setSearch] = useState<CatalogQuery>({ sort: 'recent', page: 1 })
  const [draft, setDraft] = useState('')
  const [activeSlide, setActiveSlide] = useState(0)
  const state: CatalogViewState = { status: 'success', items: catalogFixture }

  return <HomeContent
    search={search}
    draft={draft}
    activeSlide={activeSlide}
    catalogState={state}
    featuredItems={catalogFixture}
    onDraftChange={setDraft}
    onUpdate={(next) => setSearch((current) => ({ ...current, ...next }))}
    onSelectSlide={setActiveSlide}
    onPauseChange={() => undefined}
    renderCard={(nft, index) => <article className="nft-card"><NftCardContent nft={nft} index={index}/></article>}
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
