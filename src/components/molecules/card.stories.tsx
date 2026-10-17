import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

function CardExample() {
  return <Card className="max-w-md">
    <CardHeader><CardTitle>Obra em destaque</CardTitle><CardDescription>Composição de superfície e conteúdo.</CardDescription></CardHeader>
    <CardContent><p className="text-sm text-muted-foreground">Use os slots para manter espaçamento previsível em painéis e módulos menores.</p></CardContent>
  </Card>
}

const meta = {
  title: 'Design System/Molecules/Card',
  component: CardExample,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Molécula de superfície composta por Card, CardHeader, CardTitle, CardDescription e CardContent. Pode ser montada com apenas os slots necessários.' } } },
} satisfies Meta<typeof CardExample>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
