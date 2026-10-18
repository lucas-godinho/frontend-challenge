import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CatalogQuery } from '@/types/marketplace'
import { catalogFixture } from '@/mocks/fixtures'
import { NftCardPreview } from '@/stories/NftCardPreview'
import { HomeTemplate } from './HomeTemplate'
import type { CatalogViewState } from '@/features/home/organisms/CatalogResults'
import { queryCatalog } from '@/mocks/catalog'

function HomeTemplateExample() {
  const [search, setSearch] = useState<CatalogQuery>({ sort: 'recent', page: 1 })
  const [draft, setDraft] = useState('')
  const data = queryCatalog(search)
  const state: CatalogViewState = data.total ? { status: 'success', items: data.items } : { status: 'empty' }

  return <HomeTemplate
    search={search}
    draft={draft}
    catalogState={state}
    catalogData={data}
    featuredItems={catalogFixture}
    onDraftChange={setDraft}
    onUpdate={(next) => setSearch((current) => ({ ...current, ...next, page: next.page ?? 1 }))}
    renderCard={(nft, index) => <NftCardPreview nft={nft} index={index}/>}
  />
}

const meta = {
  title: 'Home/Templates/Home',
  component: HomeTemplateExample,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Template de apresentação da Home: compõe organismos e moléculas sem conhecer Router, Query ou persistência. Recebe dados, estado e callbacks por props para permitir reaproveitamento e teste visual isolado.' } } },
} satisfies Meta<typeof HomeTemplateExample>

export default meta
type Story = StoryObj<typeof meta>
export const CatalogoCarregado: Story = { name: 'Home com catálogo carregado' }
