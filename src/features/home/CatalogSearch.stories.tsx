import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CatalogQuery } from '@/types/marketplace'
import { MobileSearchRow } from './CatalogSearch'

function MobileSearchExample() {
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState<CatalogQuery>({ sort: 'recent' })
  return <div className="max-w-[390px] bg-background p-6"><MobileSearchRow search={search} draft={draft} onDraftChange={setDraft} onUpdate={(next) => setSearch((current) => ({ ...current, ...next }))}/></div>
}

const meta = {
  title: 'Home/Busca/Mobile search row',
  component: MobileSearchExample,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Busca compacta e seletor de ordenação usados no topo da Home mobile.' } } },
} satisfies Meta<typeof MobileSearchExample>

export default meta
type Story = StoryObj<typeof meta>
export const Interativa: Story = { name: 'Busca e ordenação' }
