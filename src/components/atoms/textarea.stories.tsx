import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'

const meta = {
  title: 'Design System/Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { placeholder: 'Escreva uma observação', rows: 4, 'aria-label': 'Observação' },
  parameters: { docs: { description: { component: 'Campo multilinha baseado no visual shadcn/ui e nos tokens Kurio. Use com label explícito em formulários.' } } },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true, value: 'Campo indisponível' } }
export const Invalid: Story = { args: { 'aria-invalid': true, defaultValue: 'Observação a revisar' } }
