import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppRouteStory } from './AppRouteStory'

const meta = {
  title: 'Kurio/Telas e fluxos',
  component: AppRouteStory,
  tags: ['autodocs'],
  args: { pathname: '/' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Rotas reais da aplicação montadas com TanStack Router, TanStack Query e os handlers MSW. Cada story inicia com estado local determinístico e mostra a interface da aplicação, não uma cópia estática.' } },
  },
} satisfies Meta<typeof AppRouteStory>

export default meta
type Story = StoryObj<typeof meta>

export const Inicio: Story = { name: '01 · Início e catálogo', args: { pathname: '/?sort=recent&page=1' } }
export const DetalheDoNft: Story = { name: '02 · Detalhe de NFT', args: { pathname: '/nft/orbital-01' } }
export const CarrinhoComItens: Story = { name: '03 · Carrinho', args: { pathname: '/cart', data: 'cart' } }
export const CarrinhoVazio: Story = { name: 'Carrinho vazio', args: { pathname: '/cart' } }
export const Checkout: Story = { name: '04 · Pagamento', args: { pathname: '/checkout', account: true, data: 'cart' } }
export const ConfirmacaoDeCompra: Story = { name: '05 · Pedido confirmado', args: { pathname: '/orders/storybook-order', account: true, data: 'order' } }
export const PagamentoPendente: Story = { name: 'Pedido pendente', args: { pathname: '/orders/storybook-order', account: true, data: 'order', orderStatus: 'pending' } }
export const PagamentoRecusado: Story = { name: 'Pedido recusado', args: { pathname: '/orders/storybook-order', account: true, data: 'order', orderStatus: 'rejected' } }
export const Favoritos: Story = { name: '06 · Favoritos', args: { pathname: '/favorites', account: true, data: 'favorites' } }
export const Perfil: Story = { name: '07 · Perfil', args: { pathname: '/profile', account: true } }
export const Carteiras: Story = { name: '08 · Carteiras', args: { pathname: '/wallets', account: true, data: 'wallets' } }
export const LoginDesktopModal: Story = { name: 'Login · modal desktop', args: { pathname: '/', authMode: 'login' } }
export const CadastroDesktopModal: Story = { name: 'Cadastro · modal desktop', args: { pathname: '/', authMode: 'register' } }
