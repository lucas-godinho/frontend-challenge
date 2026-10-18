import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { Nft } from '@/types/marketplace'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/molecules/card'
import { homePromos } from '../home-content'
import type { PromoItem } from '../home-types'

export function PromoHighlights({ items = [], promos = homePromos }: { items?: Nft[]; promos?: PromoItem[] }) {
  return <section className="mb-16 grid gap-6 min-[1051px]:grid-cols-2 xl:mb-24 xl:gap-8" id="creators" aria-label="Destaques Kurio">
    {promos.map((promo, index) => {
      const image = promo.image ?? items[index === 0 ? 0 : 2]?.image
      return <Card asChild className="grid min-h-[250px] grid-cols-1 overflow-hidden rounded-none border-0 bg-card min-[1051px]:grid-cols-2" key={promo.title}>
        <article>
          {image && <img className="aspect-[1.15] size-full object-cover min-[1051px]:min-h-[250px]" src={image} alt="" loading="lazy"/>}
          <div className="flex flex-col items-center justify-center px-6 py-8 text-center min-[1051px]:px-5 xl:px-7">
            <h2 className="mb-3 mt-0 text-lg font-semibold leading-snug xl:text-xl">{promo.title}</h2>
            <p className="mb-5 mt-0 max-w-sm text-sm leading-relaxed text-muted-foreground">{promo.description}</p>
            <Button className="h-10 rounded-sm px-5 text-sm normal-case" asChild><Link to="/" hash="catalog">Explorar <ArrowRight size={16}/></Link></Button>
          </div>
        </article>
      </Card>
    })}
  </section>
}
