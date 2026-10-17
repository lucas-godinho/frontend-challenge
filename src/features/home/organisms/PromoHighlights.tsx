import { ArrowRight } from 'lucide-react'
import type { Nft } from '@/types/marketplace'
import { homePromos } from '../home-content'
import type { PromoItem } from '../home-types'

export function PromoHighlights({ items = [], promos = homePromos }: { items?: Nft[]; promos?: PromoItem[] }) {
  return <section className="promo-grid" id="creators" aria-label="Destaques Kurio">
    {promos.map((promo, index) => {
      const image = promo.image ?? items[index === 0 ? 0 : 2]?.image
      return <article className="promo-card" key={promo.title}>
        {image && <img src={image} alt="" loading="lazy"/>}
        <div><h2>{promo.title}</h2><p>{promo.description}</p><a className="button button-light" href="#catalog">Explorar <ArrowRight size={16}/></a></div>
      </article>
    })}
  </section>
}
