import { PageContainer } from '@/components/organisms/PageContainer'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CatalogQuery } from '@/types/marketplace'
import { catalogFixture } from '@/mocks/fixtures'
import { NftCardPreview } from '@/stories/NftCardPreview'
import { CatalogSection } from './CatalogSection'
import type { CatalogViewState } from './CatalogResults'
import { queryCatalog } from '@/mocks/catalog'

function CatalogSectionExample({ status = 'success' }: { status?: CatalogViewState['status'] }) {
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState<CatalogQuery>({ sort: 'recent' })
  const data = queryCatalog(search)
  const state: CatalogViewState = status === 'loading'
    ? { status }
    : status === 'error'
      ? { status, onRetry: () => undefined }
      : status === 'empty'
        ? { status }
        : data.total ? { status: 'success', items: data.items } : { status: 'empty' }

  return <PageContainer><CatalogSection
    search={search}
    draft={draft}
    onDraftChange={setDraft}
    onUpdate={(next) => setSearch((current) => ({ ...current, ...next, page: next.page ?? 1 }))}
    catalogData={data}
    featuredNft={catalogFixture[0]}
    state={state}
    renderCard={(nft, index) => <NftCardPreview nft={nft} index={index}/>}
  /></PageContainer>
}

const meta = {
  title: 'Home/Organisms/Catálogo',
  component: CatalogSectionExample,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Composição da vitrine: abas, busca, ordenação, filtros, estados de request e grade. As stories isolam cada estado para revisão visual.' } } },
  argTypes: { status: { control: 'select', options: ['success', 'loading', 'empty', 'error'] } },
} satisfies Meta<typeof CatalogSectionExample>

export default meta
type Story = StoryObj<typeof meta>
export const Resultados: Story = { name: 'Resultados carregados', args: { status: 'success' } }
export const Carregando: Story = { name: 'Carregando', args: { status: 'loading' } }
export const Vazio: Story = { name: 'Sem resultados', args: { status: 'empty' } }
export const Erro: Story = { name: 'Erro com retry', args: { status: 'error' } }
