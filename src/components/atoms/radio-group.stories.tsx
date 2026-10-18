import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { RadioGroup, RadioGroupItem } from './radio-group'

function WalletRadioGroup({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState('coinbase')
  const wallets = [
    { id: 'walletconnect', name: 'WalletConnect' },
    { id: 'metamask', name: 'MetaMask' },
    { id: 'coinbase', name: 'Coinbase Wallet' },
  ]

  return <fieldset className="grid w-full max-w-md gap-3 border border-border p-4">
    <legend className="px-1 text-sm font-bold">Carteira e rede</legend>
    <RadioGroup aria-label="Escolha uma carteira" value={value} onValueChange={setValue}>
      {wallets.map((wallet) => <Label className="flex min-h-11 items-center gap-3 border border-border px-3 text-sm" key={wallet.id}>
        <RadioGroupItem value={wallet.id} disabled={disabled}/><span>{wallet.name}</span><span className="ml-auto text-xs text-muted-foreground">{value === wallet.id ? 'Selecionada' : 'Selecionar'}</span>
      </Label>)}
    </RadioGroup>
  </fieldset>
}

const meta = {
  title: 'Design System/Atoms/Radio group',
  component: WalletRadioGroup,
  tags: ['autodocs'],
  args: { disabled: false },
  parameters: { docs: { description: { component: 'Grupo controlado de opções exclusivas usado na seleção de carteira do checkout. Aceita teclado, expõe um nome acessível e mantém o estado selecionado ligado ao texto.' } } },
} satisfies Meta<typeof WalletRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const SelecaoDeCarteira: Story = {}
export const OpcoesDesabilitadas: Story = { args: { disabled: true } }
