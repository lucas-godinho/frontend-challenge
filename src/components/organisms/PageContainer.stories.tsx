import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageContainer } from './PageContainer'

const meta = {
  title: 'Design System/Organisms/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Área principal responsiva usada nas rotas de início, detalhe, carrinho, pagamento, pedido, perfil, carteiras e favoritos. Os espaçamentos seguem os frames Kurio e ficam nas classes Tailwind do componente.' } } },
} satisfies Meta<typeof PageContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <PageContainer className="min-h-64 border-x border-border py-10"><p className="text-xs text-accent">Estrutura responsiva</p><h1 className="mt-3 text-3xl font-bold">Conteúdo da página</h1><p className="mt-3 text-muted-foreground">A largura e os recuos mudam entre desktop, tablet e mobile.</p></PageContainer>,
}
