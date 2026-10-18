import type { Meta, StoryObj } from '@storybook/react-vite'
import { PasswordInput } from './password-input'

const meta = {
  title: 'Design System/Atoms/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  args: { placeholder: 'Senha', 'aria-label': 'Senha', autoComplete: 'current-password' },
  parameters: { docs: { description: { component: 'Campo de senha com controle de visibilidade e nome acessível para alternar entre exibir e ocultar.' } } },
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true, value: 'Senha bloqueada' } }
