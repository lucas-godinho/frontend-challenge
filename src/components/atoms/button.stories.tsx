import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'Design System/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: ['default', 'secondary', 'outline', 'ghost', 'destructive'] }, size: { control: 'select', options: ['default', 'sm', 'icon'] } },
  args: { children: 'Explorar coleção', variant: 'default', size: 'default' },
  parameters: { docs: { description: { component: 'Átomo de ação reutilizável. Use variantes semânticas para manter contraste e estados consistentes; passe ícones como children quando necessário.' } } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>
export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancelar' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Ver detalhes' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Mais opções' } }
export const Disabled: Story = { args: { disabled: true } }
