import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'
import { Label } from './label'

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
export const Invalid: Story = { render: () => <Label className="grid gap-2 text-sm" htmlFor="email-invalid-story">E-mail<Input id="email-invalid-story" type="email" aria-invalid="true" aria-describedby="email-error-story" defaultValue="invalido"/><span id="email-error-story" className="text-destructive">Digite um e-mail válido.</span></Label> }
export const ReadOnly: Story = { args: { readOnly: true, value: 'ana@kurio.test', 'aria-label': 'E-mail da conta' } }
