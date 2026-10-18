import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { NftCardPreview } from '@/stories/NftCardPreview'

const meta = { title: 'Marketplace/Molecules/NFT card', component: NftCardPreview, args: { nft: catalogFixture[0], index: 2 }, decorators: [(Story) => <div className="w-[300px]"><Story/></div>], tags: ['autodocs'], parameters: { docs: { description: { component: 'Prévia visual isolada com fixture local. O botão alterna aria-pressed e o ícone; a persistência por sessão é exercitada no aplicativo e nos testes E2E.' } } } } satisfies Meta<typeof NftCardPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const EdicaoComum: Story = { args: { index: 0 } }
