import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Input } from './input'

const swatches = [
  ['Ink', 'var(--background)'],
  ['Superfície', 'var(--card)'],
  ['Texto', 'var(--foreground)'],
  ['Laranja', 'var(--primary)'],
  ['Acento', 'var(--accent)'],
  ['Borda', 'var(--border)'],
] as const

function ThemePreview() {
  return <main className="grid max-w-3xl gap-8 bg-background p-8 text-foreground">
    <section>
      <p className="text-xs uppercase tracking-[.15em] text-accent">GreenMint · sistema visual</p>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase">Arte para colecionar</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Paleta quente e tipografia monoespaçada extraídas do frame mobile de início no Figma.</p>
    </section>
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Cores do tema">
      {swatches.map(([name, color]) => <div key={name} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
        <span className="size-9 rounded-sm border border-border" style={{ backgroundColor: color }} aria-hidden="true" />
        <span className="text-xs">{name}</span>
      </div>)}
    </section>
    <Card>
      <CardHeader><CardTitle>Componentes base</CardTitle><CardDescription>Tokens semânticos compartilhados entre Tailwind e os primitivos shadcn/ui.</CardDescription></CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Input aria-label="Busca de exemplo" placeholder="Buscar uma obra" className="max-w-xs" />
        <Button>Explorar coleção</Button>
        <Button variant="outline">Ver detalhes</Button>
        <Button variant="ghost">Salvar</Button>
      </CardContent>
    </Card>
  </main>
}

const meta = { title: 'Design system/GreenMint theme', component: ThemePreview, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ThemePreview>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {}
