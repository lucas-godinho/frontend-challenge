import { ArrowUpRight } from 'lucide-react'
import type { Nft } from '@/types/marketplace'
import { Card } from '@/components/molecules/card'
import { homeArticles } from '../home-content'

export function BlogSection({ items = [], articles = homeArticles }: {
  items?: Nft[]
  articles?: typeof homeArticles
}) {
  return <section className="mb-16 xl:mb-24" id="blog" aria-labelledby="blog-title">
    <header className="mx-auto mb-8 max-w-2xl text-center xl:mb-10">
      <h2 id="blog-title" className="mb-3 mt-0 text-2xl font-semibold sm:text-3xl">Diário da Cunhagem</h2>
      <p className="m-0 text-sm leading-relaxed text-muted-foreground">Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
    </header>
    <div className="grid gap-5 min-[1051px]:grid-cols-2 xl:grid-cols-4 xl:gap-6">
      {articles.map((article, index) => <Card className="flex min-w-0 flex-col overflow-hidden rounded-md border-0 bg-card" key={article.title}>
        {items[index] && <img className="aspect-[1.3] w-full object-cover" src={items[index]!.image} alt="" loading="lazy"/>}
        <div className="flex flex-1 flex-col p-4">
          <p className="mb-2 mt-0 text-xs text-muted-foreground">{article.date} <span aria-hidden="true">|</span> Leitura de {article.readingTime}</p>
          <h3 className="mb-2 mt-0 text-base font-semibold leading-snug">{article.title}</h3>
          <p className="mb-4 mt-0 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
          <a className="mt-auto inline-flex min-h-9 items-center gap-1.5 self-start text-sm font-semibold text-primary hover:text-accent" href="#catalog" aria-label={`Ler: ${article.title}`}>Ler artigo <ArrowUpRight size={15}/></a>
        </div>
      </Card>)}
    </div>
  </section>
}
