import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './skeleton'

const meta = {
  title: 'Design System/Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Placeholder de dados no padrão shadcn/ui, com dimensões explícitas e animação suave. Use aria-busy e nome acessível no contêiner; o skeleton é decorativo. A animação respeita prefers-reduced-motion.' } } },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>
export const Artwork: Story = { render: () => <div className="w-60"><Skeleton className="aspect-square rounded-lg"/><Skeleton className="mt-3 h-4 w-40"/><Skeleton className="mt-2 h-3 w-24"/></div> }
export const Recibo: Story = { render: () => <div className="grid w-72 gap-3" aria-busy="true" aria-label="Carregando recibo"><Skeleton className="h-20"/><Skeleton className="h-10"/><Skeleton className="h-10"/></div> }
