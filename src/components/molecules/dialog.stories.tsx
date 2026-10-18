import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/atoms/button'
import { Dialog } from './dialog'

function DialogExample() {
  const [open, setOpen] = useState(true)
  return <div className="grid min-h-[220px] place-items-center p-5"><Button onClick={() => setOpen(true)}>Abrir diálogo</Button>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5"><Dialog className="w-full max-w-[420px] border border-border bg-card p-6 shadow-2xl" labelledBy="dialog-story-title" onClose={() => setOpen(false)}><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-primary">Kurio</p><h2 id="dialog-story-title" className="m-0 text-lg font-bold">Confirmar ação</h2><p className="mb-5 mt-3 text-sm leading-relaxed text-muted-foreground">O foco permanece dentro do diálogo até que ele seja fechado.</p><Button onClick={() => setOpen(false)}>Entendi</Button></Dialog></div>}</div>
}

const meta = {
  title: 'Design System/Molecules/Dialog',
  component: DialogExample,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Diálogo acessível com foco inicial, navegação por Tab, fechamento por Escape e restauração do foco. Aplicado aos fluxos de autenticação no desktop.' } } },
} satisfies Meta<typeof DialogExample>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
