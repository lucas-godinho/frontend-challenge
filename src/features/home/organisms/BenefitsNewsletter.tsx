import { Bell, ShieldCheck, Users } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'

export function BenefitsNewsletter({ onSubscribe }: { onSubscribe?: (email: string) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    if (typeof email === 'string') onSubscribe?.(email)
  }

  return <section className="my-0 grid gap-6 bg-card p-5 sm:p-7 min-[1051px]:-mx-[5.56%] min-[1051px]:grid-cols-2 min-[1051px]:gap-5 min-[1200px]:-mx-[120px] min-[1200px]:grid-cols-[repeat(3,minmax(0,1fr))_minmax(280px,1.4fr)] min-[1200px]:p-8" aria-label="Benefícios e novidades">
    {[{ icon: ShieldCheck, title: 'Segurança da carteira', copy: 'Proteja sua carteira e colecione arte digital verificada com confiança.' }, { icon: Users, title: 'Criadores em destaque', copy: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' }, { icon: Bell, title: 'Alertas de lançamentos', copy: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' }].map(({ icon: Icon, title, copy }) => <article className="min-w-0 border-border min-[1051px]:border-r min-[1051px]:pr-4 min-[1200px]:px-4 min-[1200px]:first:pl-0" key={title}>
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground min-[1200px]:size-14"><Icon size={22}/></span><h3 className="mb-2 mt-0 text-sm font-semibold min-[1200px]:text-base">{title}</h3><p className="m-0 text-xs leading-relaxed text-muted-foreground">{copy}</p>
    </article>)}
    <form className="min-w-0" onSubmit={submit}><Label className="mb-3 block text-sm font-semibold min-[1200px]:text-base" htmlFor="newsletter-email">Antecipe-se ao próximo lançamento</Label><div className="flex h-11 min-w-0 bg-secondary">
      <Input className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm" id="newsletter-email" name="email" type="email" placeholder="digite seu e-mail..."/><Button className="h-full rounded-none px-4" size="sm" type="submit">Enviar</Button>
    </div><p className="mb-0 mt-3 text-xs leading-relaxed text-muted-foreground">Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></form>
  </section>
}
