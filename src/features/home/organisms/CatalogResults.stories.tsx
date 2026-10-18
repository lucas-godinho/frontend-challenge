import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { NftCardPreview } from '@/stories/NftCardPreview'
import { CatalogResults } from './CatalogResults'

const meta = {
  title: 'Home/Organisms/Resultados do catálogo',
  component: CatalogResults,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Grade da Home com os quatro estados de consulta. Enquanto a API responde, as obras locais dão feedback visual imediato e os metadados continuam em shimmer, sem bloquear a navegação.' } } },
} satisfies Meta<typeof CatalogResults>

export default meta
type Story = StoryObj<typeof meta>

export const CarregandoObras: Story = { args: { state: { status: 'loading' } } }
export const ObrasDisponiveis: Story = {
  args: {
    state: { status: 'success', items: catalogFixture.slice(0, 4) },
    renderCard: (nft, index) => <NftCardPreview nft={nft} index={index}/>,
  },
}
export const SemResultados: Story = { args: { state: { status: 'empty' } } }
export const FalhaNaConsulta: Story = { args: { state: { status: 'error', onRetry: () => undefined } } }
