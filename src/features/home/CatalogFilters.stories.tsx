import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CatalogFilters } from './CatalogFilters'

function CatalogFiltersExample() {
  const [category, setCategory] = useState<string | undefined>('art')
  return <div className="max-w-[310px] bg-background p-6"><CatalogFilters category={category} onCategoryChange={setCategory}/></div>
}

const meta = {
  title: 'Home/Catálogo/Filtros',
  component: CatalogFiltersExample,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Painel de coleções, faixa de preço e redes, exibido ao lado dos resultados no layout desktop.' } } },
} satisfies Meta<typeof CatalogFiltersExample>

export default meta
type Story = StoryObj<typeof meta>
export const Desktop: Story = { name: 'Filtros desktop' }
