import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CatalogSection, MobileSearchRow } from './CatalogSection'
import { HeroCarousel, type HeroSlide } from './HeroCarousel'
import { Newsletter } from './Newsletter'
import { useCatalog } from '@/features/catalog/use-catalog'
import type { CatalogQuery } from '@/types/marketplace'

const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'Bem-vindo à Kurio',
    title: <>Seja dono da<br/><em>cultura digital</em></>,
    description: 'Descubra NFTs selecionados de criadores do mundo todo.',
    action: 'Explorar',
  },
  {
    eyebrow: 'Curadoria da semana',
    title: <>Encontre sua<br/><em>próxima obra</em></>,
    description: 'Edições especiais de artistas independentes para sua coleção.',
    action: 'Ver coleção',
  },
  {
    eyebrow: 'Arte que conecta',
    title: <>Colecione o<br/><em>extraordinário</em></>,
    description: 'Explore obras digitais únicas e descubra novos criadores.',
    action: 'Descobrir',
  },
]

export function HomePage() {
  const search = useSearch({ from: '/' }) as CatalogQuery
  const navigate = useNavigate({ from: '/' })
  const [draft, setDraft] = useState(search.q ?? '')
  const [activeSlide, setActiveSlide] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const catalog = useCatalog(search)
  const featuredCatalog = useCatalog({ sort: 'recent', page: 1 })

  useEffect(() => setDraft(search.q ?? ''), [search.q])

  useEffect(() => {
    if (isCarouselPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % heroSlides.length), 5000)
    return () => window.clearInterval(timer)
  }, [isCarouselPaused])

  const update = (next: Partial<CatalogQuery>) => void navigate({
    search: (current: CatalogQuery) => ({ ...current, ...next, page: 1 }),
    replace: false,
  })

  return <main id="main" className="page-wrap">
    <MobileSearchRow search={search} draft={draft} onDraftChange={setDraft} onUpdate={update}/>
    <HeroCarousel
      slides={heroSlides}
      activeSlide={activeSlide}
      items={featuredCatalog.data?.items ?? []}
      onSelect={setActiveSlide}
      onPauseChange={setIsCarouselPaused}
    />
    <CatalogSection search={search} draft={draft} onDraftChange={setDraft} onUpdate={update} catalog={catalog}/>
    <Newsletter/>
  </main>
}
