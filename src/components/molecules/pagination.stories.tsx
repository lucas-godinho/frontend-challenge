import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from './pagination'

const meta = {
  title: 'Design System/Molecules/Pagination', component: Pagination, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Molécula controlada que recebe total, página atual, tamanho e callback. Usa reticências em listas longas, desabilita os limites e não renderiza com página única. A page/template decide se a mudança também altera a URL.' } } },
  args: { page: 1, pageSize: 9, total: 54, onPageChange: () => undefined },
  render: function Example(args) {
    const [page, setPage] = useState(args.page)
    return <Pagination {...args} page={page} onPageChange={setPage}/>
  },
} satisfies Meta<typeof Pagination>
export default meta
type Story = StoryObj<typeof meta>
export const PrimeiraPagina: Story = {}
export const MuitasPaginas: Story = { args: { page: 8, total: 180 } }
export const UltimaPagina: Story = { args: { page: 6 } }
export const Carregando: Story = { args: { disabled: true } }
export const PaginaUnica: Story = { args: { total: 5 } }
