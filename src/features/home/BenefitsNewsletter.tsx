import { Bell, ShieldCheck, Users } from 'lucide-react'
import type { FormEvent } from 'react'

export function BenefitsNewsletter({ onSubscribe }: { onSubscribe?: (email: string) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    if (typeof email === 'string') onSubscribe?.(email)
  }

  return <section className="benefits-newsletter" aria-label="Benefícios e novidades">
    <article><span><ShieldCheck size={22}/></span><h3>Segurança da carteira</h3><p>Proteja sua carteira e colecione arte digital verificada com confiança.</p></article>
    <article><span><Users size={22}/></span><h3>Criadores em destaque</h3><p>Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.</p></article>
    <article><span><Bell size={22}/></span><h3>Alertas de lançamentos</h3><p>Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.</p></article>
    <form onSubmit={submit}><label htmlFor="newsletter-email">Antecipe-se ao próximo lançamento</label><div><input id="newsletter-email" name="email" type="email" placeholder="digite seu e-mail..."/><button type="submit">Enviar</button></div><p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></form>
  </section>
}
