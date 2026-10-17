import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'

const meta = {
  title: 'Design System/Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Buscar uma obra', 'aria-label': 'Buscar uma obra' },
  parameters: { docs: { description: { component: 'Campo de texto base com foco, placeholder e estado desabilitado alinhados aos tokens Kurio. Combine-o com label e ajuda em moléculas de formulário.' } } },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true, value: 'Campo indisponível' } }
export const Email: Story = { args: { type: 'email', placeholder: 'nome@exemplo.com', 'aria-label': 'E-mail' } }
