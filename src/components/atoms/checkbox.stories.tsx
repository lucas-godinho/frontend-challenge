import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './checkbox'
import { Label } from './label'

function CheckboxExample({ initialChecked = false, disabled = false }: { initialChecked?: boolean; disabled?: boolean }) {
  const [checked, setChecked] = useState(initialChecked)
  return <div className="flex items-center gap-3">
    <Checkbox id="newsletter-checkbox" checked={checked} disabled={disabled} onCheckedChange={(value) => setChecked(value === true)}/>
    <Label htmlFor="newsletter-checkbox">Receber novidades da coleção</Label>
  </div>
}

const meta = {
  title: 'Design System/Atoms/Checkbox',
  component: CheckboxExample,
  tags: ['autodocs'],
  args: { initialChecked: false, disabled: false },
  parameters: { docs: { description: { component: 'Controle Radix usado em filtros de rede, checkout e cadastro de carteira. O label associado amplia o alvo de clique e descreve o estado sem depender apenas da cor.' } } },
} satisfies Meta<typeof CheckboxExample>

export default meta
type Story = StoryObj<typeof meta>

export const Desmarcado: Story = {}
export const Marcado: Story = { args: { initialChecked: true } }
export const Desabilitado: Story = { args: { disabled: true } }
