import { ArrowUpRight } from 'lucide-react'
import type { Nft } from '@/types/marketplace'
import { homeArticles } from './home-content'

export function BlogSection({ items = [], articles = homeArticles }: {
  items?: Nft[]
  articles?: typeof homeArticles
}) {
  return <section className="blog-section" id="blog" aria-labelledby="blog-title">
    <header><h2 id="blog-title">Diário da Cunhagem</h2><p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p></header>
    <div className="blog-grid">
      {articles.map((article, index) => <article className="blog-card" key={article.title}>
        {items[index] && <img src={items[index]!.image} alt="" loading="lazy"/>}
        <div><p className="blog-meta">{article.date} <span aria-hidden="true">|</span> Leitura de {article.readingTime}</p><h3>{article.title}</h3><p>{article.summary}</p><a href="#catalog" aria-label={`Ler: ${article.title}`}>Ler artigo <ArrowUpRight size={14}/></a></div>
      </article>)}
    </div>
  </section>
}
