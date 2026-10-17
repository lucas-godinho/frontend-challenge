import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { FeaturedNft } from './FeaturedNft'

const meta = {
  title: 'Home/Catálogo/NFT em destaque', component: FeaturedNft, tags: ['autodocs'],
  args: { nft: catalogFixture[0]! },
  parameters: { docs: { description: { component: 'Vitrine editorial abaixo dos filtros desktop. Mantém o NFT em destaque estável durante a busca, filtragem e paginação do catálogo.' } } },
  decorators: [(Story) => <div style={{ width: 310 }}><Story/></div>],
} satisfies Meta<typeof FeaturedNft>
export default meta
type Story = StoryObj<typeof meta>
export const OfertaLimitada: Story = {}
