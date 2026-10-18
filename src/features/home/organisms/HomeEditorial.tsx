import type { Nft } from '@/types/marketplace'
import { BenefitsNewsletter } from './BenefitsNewsletter'
import { BlogSection } from './BlogSection'
import { PromoHighlights } from './PromoHighlights'

export function HomeEditorial({ items }: { items: Nft[] }) {
  return <div className="hidden min-[1051px]:grid min-[1051px]:gap-8">
    <PromoHighlights items={items}/>
    <BlogSection items={items}/>
    <BenefitsNewsletter/>
  </div>
}
