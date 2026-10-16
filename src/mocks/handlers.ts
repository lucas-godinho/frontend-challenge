import { http, HttpResponse } from 'msw'
import { catalogFixture } from './fixtures'
import type { CatalogQuery } from '@/types/marketplace'

export const handlers = [
  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').toLocaleLowerCase()
    const category = url.searchParams.get('category')
    const sort = url.searchParams.get('sort') as CatalogQuery['sort']
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
    const pageSize = 12
    const filtered = catalogFixture.filter((nft) =>
      (!q || `${nft.name} ${nft.collection} ${nft.creator}`.toLocaleLowerCase().includes(q)) &&
      (!category || nft.category === category),
    )
    if (sort === 'price-asc') filtered.sort((a, b) => Number(a.priceEth) - Number(b.priceEth))
    if (sort === 'price-desc') filtered.sort((a, b) => Number(b.priceEth) - Number(a.priceEth))
    return HttpResponse.json({ items: filtered.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: filtered.length })
  }),
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = catalogFixture.find((item) => item.id === params.id)
    return nft ? HttpResponse.json(nft) : HttpResponse.json({ code: 'NOT_FOUND', message: 'NFT não encontrado.' }, { status: 404 })
  }),
]
