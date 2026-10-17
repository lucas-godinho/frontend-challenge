import { ArrowUpRight, Bell, ShieldCheck, Users } from 'lucide-react'
import type { Nft } from '@/types/marketplace'

const articles = [
  ['Como funciona a propriedade de NFTs', 'Aprenda a colecionar, negociar e acompanhar ativos digitais com segurança.', '12 de setembro', '6 min'],
  ['10 artistas digitais para acompanhar', 'Conheça criadores que moldam a próxima geração da arte digital.', '13 de setembro', '2 min'],
  ['Raridade, atributos e procedência', 'Entenda raridade, procedência e o valor de cada edição.', '15 de setembro', '3 min'],
  ['Como proteger sua carteira', 'Proteja seus ativos digitais e reconheça boas práticas de segurança.', '15 de setembro', '2 min'],
]

export function HomeEditorial({ items }: { items: Nft[] }) {
  const promos = [
    { title: 'Lançamentos gênesis de edição limitada', description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.', image: items[0]?.image },
    { title: 'Arte digital selecionada e muito mais', description: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.', image: items[2]?.image },
  ]

  return <div className="home-editorial">
    <section className="promo-grid" aria-label="Destaques Kurio">
      {promos.map((promo) => <article className="promo-card" key={promo.title}>
        {promo.image && <img src={promo.image} alt="" loading="lazy"/>}
        <div><h2>{promo.title}</h2><p>{promo.description}</p><a className="button button-light" href="#catalog">Explorar <ArrowUpRight size={16}/></a></div>
      </article>)}
    </section>

    <section className="blog-section" id="blog" aria-labelledby="blog-title">
      <header><h2 id="blog-title">Diário da Cunhagem</h2><p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p></header>
      <div className="blog-grid">
        {articles.map(([title, summary, date, reading], index) => <article className="blog-card" key={title}>
          {items[index] && <img src={items[index]!.image} alt="" loading="lazy"/>}
          <div><p className="blog-meta">{date} <span aria-hidden="true">|</span> Leitura de {reading}</p><h3>{title}</h3><p>{summary}</p><a href="#catalog" aria-label={`Ler: ${title}`}>Ler artigo <ArrowUpRight size={14}/></a></div>
        </article>)}
      </div>
    </section>

    <section className="benefits-newsletter" aria-label="Benefícios e novidades">
      <article><span><ShieldCheck size={22}/></span><h3>Segurança da carteira</h3><p>Proteja sua carteira e colecione arte digital verificada com confiança.</p></article>
      <article><span><Users size={22}/></span><h3>Criadores em destaque</h3><p>Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.</p></article>
      <article><span><Bell size={22}/></span><h3>Alertas de lançamentos</h3><p>Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.</p></article>
      <form onSubmit={(event) => event.preventDefault()}><label htmlFor="newsletter-email">Antecipe-se ao próximo lançamento</label><div><input id="newsletter-email" type="email" placeholder="digite seu e-mail..."/><button type="submit">Enviar</button></div><p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></form>
    </section>
  </div>
}
