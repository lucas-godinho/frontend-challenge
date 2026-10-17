import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from './pagination'

const meta = {
  title: 'Home/Catálogo/Paginação', component: Pagination, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Paginação controlada. Recebe o total da API, página atual e tamanho da página. Usa reticências em listas longas, desabilita os limites e não renderiza com apenas uma página. onPageChange atualiza a URL sem reiniciar a rolagem.' } } },
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
