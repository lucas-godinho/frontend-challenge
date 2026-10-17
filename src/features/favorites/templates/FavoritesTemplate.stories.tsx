import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { FavoriteButton, NftCardContent } from '@/features/catalog/molecules/NftCard'
import { FavoritesTemplate } from './FavoritesTemplate'

const meta = {
  title: 'Favorites/Templates/Favorites',
  component: FavoritesTemplate,
  tags: ['autodocs'],
  args: { hasFavorites: true, items: catalogFixture.slice(0, 3), state: 'ready', onRetry: () => undefined, onExplore: () => undefined,
    renderCard: (nft, index) => <article className="nft-card"><NftCardContent nft={nft} index={index}/><FavoriteButton nft={nft}/></article> },
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Template visual da coleção salva. A page fornece as obras resolvidas e o estado da query; as stories não precisam do Router de produção ou de chamadas REST.' } } },
} satisfies Meta<typeof FavoritesTemplate>

export default meta
type Story = StoryObj<typeof meta>
export const ObrasSalvas: Story = {}
export const Vazio: Story = { args: { hasFavorites: false, items: [], state: 'ready' } }
export const Carregando: Story = { args: { hasFavorites: true, items: [], state: 'loading' } }
export const Erro: Story = { args: { hasFavorites: true, items: [], state: 'error' } }
