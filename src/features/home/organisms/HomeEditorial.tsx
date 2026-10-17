import type { Nft } from '@/types/marketplace'
import { BenefitsNewsletter } from './BenefitsNewsletter'
import { BlogSection } from './BlogSection'
import { PromoHighlights } from './PromoHighlights'

export function HomeEditorial({ items }: { items: Nft[] }) {
  return <div className="home-editorial">
    <PromoHighlights items={items}/>
    <BlogSection items={items}/>
    <BenefitsNewsletter/>
  </div>
}
