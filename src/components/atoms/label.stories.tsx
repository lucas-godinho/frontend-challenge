import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'Design System/Atoms/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Componente Label instalado pelo registro oficial do shadcn/ui e ligado ao controle por htmlFor. A forma local usa os tokens Tailwind da Kurio.' } } },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const FormField: Story = {
  render: () => <div className="grid max-w-sm gap-2"><Label htmlFor="storybook-email">E-mail</Label><Input id="storybook-email" type="email" placeholder="nome@exemplo.com" /></div>,
}

export const Required: Story = {
  render: () => <div className="grid max-w-sm gap-2"><Label htmlFor="storybook-name">Nome de usuário <span className="text-accent" aria-hidden="true">*</span></Label><Input id="storybook-name" required /></div>,
}

export const Disabled: Story = {
  render: () => <div className="grid max-w-sm gap-2"><Label htmlFor="storybook-disabled">Identificador</Label><Input id="storybook-disabled" disabled value="Indisponível" readOnly /></div>,
}
