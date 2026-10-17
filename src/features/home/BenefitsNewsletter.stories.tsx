import type { Meta, StoryObj } from '@storybook/react-vite'
import { BenefitsNewsletter } from './BenefitsNewsletter'

const meta = {
  title: 'Home/Rodapé/Benefícios e newsletter',
  component: BenefitsNewsletter,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Faixa desktop com benefícios da plataforma e formulário de inscrição. O callback onSubscribe deixa a integração desacoplada.' } } },
  args: { onSubscribe: () => undefined },
} satisfies Meta<typeof BenefitsNewsletter>

export default meta
type Story = StoryObj<typeof meta>
export const Completa: Story = { name: 'Benefícios e inscrição' }
