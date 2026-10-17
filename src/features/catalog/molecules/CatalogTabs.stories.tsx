import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CatalogTabs, type CatalogTab } from './CatalogTabs'

function CatalogTabsExample() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('all')
  return <div className="max-w-3xl bg-background p-6"><CatalogTabs activeTab={activeTab} onSelect={setActiveTab}/></div>
}

const meta = {
  title: 'Marketplace/Molecules/Abas do catálogo',
  component: CatalogTabsExample,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Abas controladas da vitrine. A Home sincroniza a aba selecionada com o critério de ordenação.' } } },
} satisfies Meta<typeof CatalogTabsExample>

export default meta
type Story = StoryObj<typeof meta>
export const TodasAsObras: Story = { name: 'Todas as obras' }
