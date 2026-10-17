import { ArrowUpRight } from 'lucide-react'
import type { ReactNode, SyntheticEvent } from 'react'
import type { Nft } from '@/types/marketplace'

export type HeroSlide = {
  eyebrow: string
  title: ReactNode
  description: string
  action: string
}

function handleArtworkError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied) return
  image.dataset.fallbackApplied = 'true'
  image.src = '/images/artwork-fallback.svg'
}

export function HeroCarousel({
  slides,
  activeSlide,
  items,
  onSelect,
  onPauseChange,
}: {
  slides: HeroSlide[]
  activeSlide: number
  items: Nft[]
  onSelect: (index: number) => void
  onPauseChange: (paused: boolean) => void
}) {
  const currentSlide = slides[activeSlide]!
  const firstArtwork = items.length ? items[(activeSlide * 2) % items.length] : undefined
  const secondArtwork = items.length > 1 ? items[(activeSlide * 2 + 1) % items.length] : firstArtwork

  return <section
    className="hero"
    aria-roledescription="carousel"
    aria-label="Destaques da Kurio"
    onMouseEnter={() => onPauseChange(true)}
    onMouseLeave={() => onPauseChange(false)}
    onFocusCapture={() => onPauseChange(true)}
    onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onPauseChange(false)
    }}
  >
    <img className="hero-background" src="/images/hero-background.svg" alt="" aria-hidden="true"/>
    <div className="hero-copy" key={`copy-${activeSlide}`}>
      <p className="eyebrow">{currentSlide.eyebrow}</p>
      <h1>{currentSlide.title}</h1>
      <p className="hero-description">{currentSlide.description}</p>
      <a className="button button-light" href="#catalog">{currentSlide.action} <ArrowUpRight size={16}/></a>
    </div>
    <div className="hero-art" role="group" aria-label={`Obras em destaque, slide ${activeSlide + 1} de ${slides.length}`}>
      {firstArtwork && <img key={`${activeSlide}-main`} className="hero-art-main" src={firstArtwork.image} alt={firstArtwork.name} onError={handleArtworkError}/>}
      {secondArtwork && <img key={`${activeSlide}-secondary`} className="hero-art-secondary" src={secondArtwork.image} alt={secondArtwork.name} onError={handleArtworkError}/>}
      <div className="art-circle"/><span className="art-index">{String(activeSlide + 1).padStart(2, '0')} — {String(slides.length).padStart(2, '0')}</span>
    </div>
    <div className="hero-dots" aria-label="Escolher destaque">
      {slides.map((slide, index) => <button
        key={slide.eyebrow}
        type="button"
        aria-label={`Mostrar slide ${index + 1}: ${slide.eyebrow}`}
        aria-current={activeSlide === index ? 'true' : undefined}
        onClick={() => onSelect(index)}
      ><span/></button>)}
    </div>
  </section>
}
