import type { Meta, StoryObj } from '@storybook/react-vite'
import { PriceRangeFilter } from './PriceRangeFilter'

const meta = {
  title: 'Marketplace/Molecules/Faixa de preço', component: PriceRangeFilter, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Dois controles nativos acessíveis sobre uma única trilha. Os limites não se cruzam; os valores mudam durante o arraste e onApply confirma o filtro. O container usa key dos valores da URL para restaurar o intervalo ao voltar/avançar.' } } },
  args: { min: 0.02, max: 12.3, onApply: () => undefined },
  decorators: [(Story) => <div className="block w-[310px] bg-card p-5"><Story/></div>],
} satisfies Meta<typeof PriceRangeFilter>
export default meta
type Story = StoryObj<typeof meta>
export const Completo: Story = {}
export const IntervaloSelecionado: Story = { args: { value: [1.2, 8.5] } }
export const PrecoUnico: Story = { args: { min: 1, max: 1 } }
