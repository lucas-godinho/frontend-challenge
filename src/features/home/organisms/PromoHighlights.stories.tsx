import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { PromoHighlights } from './PromoHighlights'

const meta = {
  title: 'Home/Organisms/Promoções',
  component: PromoHighlights,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Dois destaques promocionais com artwork, texto e chamada para explorar o catálogo.' } } },
  args: { items: catalogFixture },
} satisfies Meta<typeof PromoHighlights>

export default meta
type Story = StoryObj<typeof meta>
export const Dupla: Story = { name: 'Duas promoções' }
export const SemImagens: Story = { name: 'Fallback sem artwork', args: { items: [] } }
