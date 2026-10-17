import type { Meta, StoryObj } from '@storybook/react-vite'
import { BenefitsNewsletter } from './BenefitsNewsletter'

const meta = {
  title: 'Home/Organisms/Benefícios e newsletter',
  component: BenefitsNewsletter,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Organismo do footer desktop: benefícios da plataforma e formulário de inscrição. O callback onSubscribe deixa a integração desacoplada.' } } },
  args: { onSubscribe: () => undefined },
} satisfies Meta<typeof BenefitsNewsletter>

export default meta
type Story = StoryObj<typeof meta>
export const Completa: Story = { name: 'Benefícios e inscrição' }
