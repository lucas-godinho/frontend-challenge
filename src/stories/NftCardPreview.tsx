import { useState } from 'react'
import { Heart } from 'lucide-react'
import { NftCardContent } from '@/features/catalog/molecules/NftCard'
import type { Nft } from '@/types/marketplace'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/molecules/card'

export function NftCardPreview({ nft, index = 0 }: { nft: Nft; index?: number }) {
  const [favorite, setFavorite] = useState(false)
  return <Card className="group relative overflow-hidden rounded-md border-0 bg-card p-2">
    <NftCardContent nft={nft} index={index}/>
    <Button variant="ghost" size="icon" className="absolute right-3 top-3 size-10 rounded-full border border-border bg-background/90 text-primary" type="button" aria-label={favorite ? `Remover ${nft.name} dos favoritos` : `Adicionar ${nft.name} aos favoritos`}
      aria-pressed={favorite} onClick={() => setFavorite((current) => !current)}><Heart size={18} fill={favorite ? 'currentColor' : 'none'}/></Button>
  </Card>
}
