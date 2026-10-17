import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { BlogSection } from './BlogSection'

const meta = {
  title: 'Home/Organisms/Diário da Cunhagem',
  component: BlogSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Grade editorial com quatro artigos, datas, tempo estimado e acesso ao conteúdo.' } } },
  args: { items: catalogFixture },
} satisfies Meta<typeof BlogSection>

export default meta
type Story = StoryObj<typeof meta>
export const QuatroArtigos: Story = { name: 'Quatro artigos' }
export const SemImagens: Story = { name: 'Sem artworks', args: { items: [] } }
