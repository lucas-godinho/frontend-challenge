import type { Meta, StoryObj } from '@storybook/react-vite'
import { Newsletter } from './Newsletter'

const meta = {
  title: 'Home/Organisms/Newsletter mobile',
  component: Newsletter,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Chamada compacta de descoberta usada no fluxo mobile da Home.' } } },
} satisfies Meta<typeof Newsletter>

export default meta
type Story = StoryObj<typeof meta>
export const Chamada: Story = { name: 'Galeria em crescimento' }
