import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThreeNftLoadingScene } from '../features/loading/ThreeNftLoadingScene'

const meta = {
  title: 'Kurio/Experiência de carregamento',
  component: ThreeNftLoadingScene,
  parameters: { layout: 'fullscreen' },
  args: { onReady: () => undefined },
  tags: ['autodocs'],
  argTypes: { onReady: { table: { disable: true } } },
} satisfies Meta<typeof ThreeNftLoadingScene>

export default meta
type Story = StoryObj<typeof meta>

export const CenaThreeDimensional: Story = {
  name: 'Splash cinematográfico com NFTs',
  parameters: {
    docs: {
      description: {
        story: 'Cena de abertura em Three.js com artworks locais, cartões em profundidade, órbitas e partículas discretas. A animação muda para composição estática com `prefers-reduced-motion` e usa uma composição CSS se WebGL não estiver disponível.',
      },
    },
  },
}
