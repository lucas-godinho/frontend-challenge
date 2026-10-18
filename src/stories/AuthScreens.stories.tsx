import type { Meta, StoryObj } from '@storybook/react-vite'
import { AuthScreenStory } from './AuthScreenStory'

const meta = {
  title: 'Conta/Telas mobile de autenticação',
  component: AuthScreenStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Login e cadastro mobile renderizam como páginas completas. As stories montam os formulários reais, com React Router, Query e MSW, em um frame de 390 px.' } },
  },
} satisfies Meta<typeof AuthScreenStory>

export default meta
type Story = StoryObj<typeof meta>

export const Entrar: Story = { args: { mode: 'login' } }
export const CriarConta: Story = { args: { mode: 'register' } }
