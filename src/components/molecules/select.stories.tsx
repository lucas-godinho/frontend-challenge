import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlidersHorizontal } from 'lucide-react'
import { Select } from './select'

const meta = {
  title: 'Design System/Molecules/Select', component: Select, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Select controlado construído sobre Radix UI no padrão shadcn/ui e adaptado ao tema Kurio. Demonstra opções, seleção, teclado, foco e a variante compacta usada no mobile.' } } },
  args: { value: 'recent', label: 'Ordenar NFTs', options: [{ value: 'recent', label: 'Listados recentemente' }, { value: 'asc', label: 'Menor preço' }, { value: 'desc', label: 'Maior preço' }], onChange: () => undefined },
  render: function Example(args) {
    const [value, setValue] = useState(args.value)
    return <div style={{ minHeight: 220, padding: 24, display: 'flex', justifyContent: 'center' }}><Select {...args} value={value} onChange={setValue}/></div>
  },
} satisfies Meta<typeof Select>
export default meta
type Story = StoryObj<typeof meta>
export const Ordenacao: Story = {}
export const Compacto: Story = { args: { compact: true, icon: <SlidersHorizontal size={19}/> } }
