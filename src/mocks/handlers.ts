import { http, HttpResponse } from 'msw'
import { catalogFixture } from './fixtures'
import type { CatalogQuery } from '@/types/marketplace'
import { queryCatalog } from './catalog'

export const handlers = [
  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').toLocaleLowerCase()
    const category = url.searchParams.get('category')
    const sort = url.searchParams.get('sort') as CatalogQuery['sort']
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
    const price = (key: string) => {
      const value = url.searchParams.get(key)
      return value !== null && Number.isFinite(Number(value)) ? Number(value) : undefined
    }
    return HttpResponse.json(queryCatalog({ q, category: category ?? undefined, sort, page,
      minPrice: price('minPrice'), maxPrice: price('maxPrice'), network: url.searchParams.get('network') ?? undefined,
    }))
  }),
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = catalogFixture.find((item) => item.id === params.id)
    return nft ? HttpResponse.json(nft) : HttpResponse.json({ code: 'NOT_FOUND', message: 'NFT não encontrado.' }, { status: 404 })
  }),
]
