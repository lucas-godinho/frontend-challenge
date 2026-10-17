import type { Meta, StoryObj } from '@storybook/react-vite'
import { catalogFixture } from '@/mocks/fixtures'
import { homeHeroSlides } from '../home-content'
import { HeroCarousel } from './HeroCarousel'

const meta = {
  title: 'Home/Organisms/Carrossel de destaque',
  component: HeroCarousel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Carrossel controlado de destaque da Home. O container adapta o copy, o artwork e os controles para mobile e desktop.' } } },
  args: { slides: homeHeroSlides, activeSlide: 0, items: catalogFixture, onSelect: () => undefined, onPauseChange: () => undefined },
} satisfies Meta<typeof HeroCarousel>

export default meta
type Story = StoryObj<typeof meta>

export const BoasVindas: Story = { name: 'Boas-vindas' }
export const Curadoria: Story = { name: 'Curadoria', args: { activeSlide: 1 } }
export const SemArtworksCarregados: Story = { name: 'Sem artworks carregados', args: { items: [] } }
