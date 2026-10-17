import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { HomeEditorial } from './HomeEditorial'

const meta = {
  title: 'Home/Conteúdo editorial/Seção desktop',
  component: HomeEditorial,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Agrupa promoções, artigos do Diário da Cunhagem e benefícios com inscrição. Esse bloco complementa o catálogo na Home desktop.' } } },
  args: { items: catalogFixture },
} satisfies Meta<typeof HomeEditorial>

export default meta
type Story = StoryObj<typeof meta>
export const Completa: Story = { name: 'Editorial completo' }
export const SemImagens: Story = { name: 'Sem imagens de catálogo', args: { items: [] } }
