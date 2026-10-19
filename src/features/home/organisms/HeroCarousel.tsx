import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react'
import { Button } from '@/components/atoms/button'
import type { Nft } from '@/types/marketplace'

export type HeroSlide = {
  eyebrow: string
  title: ReactNode
  desktopTitle?: ReactNode
  description: string
  desktopDescription?: string
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
  items,
  initialSlide = 0,
}: {
  slides: HeroSlide[]
  items: Nft[]
  initialSlide?: number
}) {
  const [activeSlide, setActiveSlide] = useState(initialSlide)
  const [isPaused, setIsPaused] = useState(false)
  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % slides.length), 5000)
    return () => window.clearInterval(timer)
  }, [isPaused, slides.length])
  const currentSlide = slides[activeSlide]!
  const firstArtwork = items.length ? items[(activeSlide * 2) % items.length] : undefined
  const secondArtwork = items.length > 1 ? items[(activeSlide * 2 + 1) % items.length] : firstArtwork

  return <section
    className="relative isolate grid min-h-[470px] overflow-clip grid-cols-[minmax(300px,.86fr)_minmax(0,1.14fr)] items-center gap-[clamp(36px,7.5vw,112px)] py-[clamp(60px,7vw,104px)] before:absolute before:-z-10 before:right-[-8%] before:top-[12%] before:aspect-square before:w-[min(60vw,780px)] before:rounded-full before:bg-[radial-gradient(circle,rgb(210_138_76_/_10%),transparent_68%)] before:content-[''] max-[760px]:-mx-2.5 max-[760px]:mt-3 max-[760px]:block max-[760px]:h-[190px] max-[760px]:min-h-0 max-[760px]:overflow-hidden max-[760px]:rounded-[30px] max-[760px]:px-[26px] max-[760px]:py-4 max-[760px]:before:hidden min-[1051px]:min-h-[527px] min-[1051px]:grid-cols-[minmax(0,1fr)_450px] min-[1051px]:gap-16 min-[1051px]:py-8"
    aria-roledescription="carousel"
    aria-label="Destaques da Kurio"
    onMouseEnter={() => setIsPaused(true)}
    onMouseLeave={() => setIsPaused(false)}
    onFocusCapture={() => setIsPaused(true)}
    onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false)
    }}
  >
    <div className="relative z-20 max-w-[620px] animate-[hero-copy-enter_200ms_cubic-bezier(0.22,0.8,0.25,1)_both] max-[760px]:w-[56.3%] min-[1051px]:mt-10" key={`copy-${activeSlide}`}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.12em] text-accent max-[760px]:mb-1 max-[760px]:normal-case max-[760px]:tracking-normal max-[760px]:text-foreground min-[1051px]:mb-5 min-[1051px]:font-medium min-[1051px]:normal-case">{currentSlide.eyebrow}</p>
      <h1 className="m-0 max-w-[640px] text-[clamp(38px,4.5vw,72px)] font-bold uppercase leading-[1.12] tracking-[-.04em] max-[760px]:text-base max-[760px]:leading-[1.4] max-[760px]:tracking-normal min-[1051px]:text-[clamp(40px,3.3vw,48px)] min-[1051px]:leading-[1.45] min-[1051px]:tracking-normal [&_em]:not-italic [&_em]:text-primary max-[760px]:[&_em]:text-foreground min-[1051px]:[&_em]:text-foreground"><span className="inline min-[1051px]:hidden">{currentSlide.title}</span><span className="hidden min-[1051px]:inline">{currentSlide.desktopTitle ?? currentSlide.title}</span></h1>
      <p className="mb-7 mt-6 max-w-[420px] text-sm leading-relaxed text-muted-foreground max-[760px]:mb-1 max-[760px]:mt-1.5 max-[760px]:max-w-[150px] max-[760px]:text-xs max-[760px]:leading-snug min-[1051px]:mb-[30px] min-[1051px]:mt-1 min-[1051px]:max-w-[560px] min-[1051px]:text-[13px]"><span className="inline min-[1051px]:hidden">{currentSlide.description}</span><span className="hidden min-[1051px]:inline">{currentSlide.desktopDescription ?? currentSlide.description}</span></p>
      <Button className="h-11 px-5 text-xs uppercase min-[1051px]:h-10 min-[1051px]:rounded-sm min-[1051px]:px-6 min-[1051px]:text-[13px] max-[760px]:h-auto max-[760px]:min-h-0 max-[760px]:gap-1.5 max-[760px]:bg-transparent max-[760px]:px-0 max-[760px]:py-0 max-[760px]:text-xs max-[760px]:text-primary max-[760px]:hover:bg-transparent" variant="default" asChild><a href="#catalog">{currentSlide.action} <ArrowUpRight size={16}/></a></Button>
    </div>
    <div className="absolute inset-y-0 right-0 z-0 h-full w-full overflow-hidden rounded-[clamp(24px,3vw,38px)] bg-[linear-gradient(145deg,#39251b,#241612_58%,#53301e)] max-[760px]:rounded-[30px] max-[760px]:bg-[radial-gradient(ellipse_124px_124px_at_12%_49%,rgb(221_154_95_/_43%),rgb(210_138_76_/_4%)_100%,transparent),radial-gradient(ellipse_124px_124px_at_54%_60%,rgb(221_154_95_/_37%),transparent_100%),linear-gradient(153deg,rgb(210_138_76_/_20%),rgb(210_138_76_/_10%))] min-[761px]:relative min-[761px]:h-[clamp(360px,35vw,520px)] min-[761px]:w-auto min-[761px]:min-w-0 min-[761px]:justify-self-stretch min-[1051px]:h-[450px] min-[1051px]:w-[450px] min-[1051px]:justify-self-end" role="group" aria-label={`Obras em destaque, slide ${activeSlide + 1} de ${slides.length}`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#39251b_0_32%,transparent_32%_63%,#8f4d2a_63%_100%)] max-[760px]:hidden min-[1051px]:hidden" aria-hidden="true"/>
      {firstArtwork
        ? <img key={`${activeSlide}-main`} className="absolute right-[8%] top-[8%] z-[1] block h-[82%] w-[65%] rounded-[22px] border border-foreground/15 object-cover animate-[hero-art-enter_240ms_cubic-bezier(0.22,0.8,0.25,1)_both] max-[760px]:left-[53.6%] max-[760px]:right-auto max-[760px]:top-[2.6%] max-[760px]:h-auto max-[760px]:aspect-square max-[760px]:w-[37.7%] max-[760px]:rounded-[14px] min-[1051px]:inset-0 min-[1051px]:h-full min-[1051px]:w-full min-[1051px]:rounded-[26px] min-[1051px]:border-0" src={firstArtwork.image} alt={firstArtwork.name} onError={handleArtworkError}/>
        : <picture className="absolute right-[8%] top-[8%] z-[1] block h-[82%] w-[65%] animate-[hero-art-enter_240ms_cubic-bezier(0.22,0.8,0.25,1)_both] max-[760px]:left-[53.6%] max-[760px]:right-auto max-[760px]:top-[2.6%] max-[760px]:h-auto max-[760px]:aspect-square max-[760px]:w-[37.7%] min-[1051px]:inset-0 min-[1051px]:h-full min-[1051px]:w-full" aria-hidden="true">
          <source media="(max-width: 760px)" srcSet="/images/nft-3.jpg"/>
          <img className="size-full rounded-[22px] border border-foreground/15 object-cover max-[760px]:rounded-[14px] min-[1051px]:rounded-[26px] min-[1051px]:border-0" src="/images/nft-2.jpg" alt="" fetchPriority="high" decoding="async"/>
        </picture>}
      {secondArtwork && <img key={`${activeSlide}-secondary`} className="absolute bottom-[7%] left-[7%] z-[2] block aspect-square w-[33%] rounded-[22px] border-[8px] border-card object-cover shadow-[0_10px_28px_rgb(10_6_4_/_30%)] animate-[hero-art-enter_240ms_cubic-bezier(0.22,0.8,0.25,1)_both] max-[760px]:left-[57.4%] max-[760px]:top-[49%] max-[760px]:bottom-auto max-[760px]:w-[15.8%] max-[760px]:rounded-[14px] max-[760px]:border-2 max-[760px]:border-[#241612] min-[1051px]:hidden" src={secondArtwork.image} alt={secondArtwork.name} onError={handleArtworkError}/>}
      <div className="absolute left-[35%] top-[14%] aspect-square w-[43%] rounded-full bg-primary mix-blend-screen max-[760px]:hidden min-[1051px]:hidden" aria-hidden="true"/><span className="absolute right-[22px] top-5 z-[1] text-[9px] tracking-[.7px] text-foreground max-[760px]:hidden min-[1051px]:hidden">{String(activeSlide + 1).padStart(2, '0')} — {String(slides.length).padStart(2, '0')}</span>
    </div>
    <div className="absolute bottom-[30px] right-[4%] z-[3] flex items-center gap-1 max-[760px]:bottom-4 max-[760px]:right-1/2 max-[760px]:translate-x-1/2 min-[1051px]:bottom-20 min-[1051px]:left-1/2 min-[1051px]:right-auto min-[1051px]:-translate-x-1/2" aria-label="Escolher destaque">
      {slides.map((slide, index) => <button
        key={slide.eyebrow}
        type="button"
        className="grid size-6 place-items-center border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Mostrar slide ${index + 1}: ${slide.eyebrow}`}
        aria-current={activeSlide === index ? 'true' : undefined}
        onClick={() => setActiveSlide(index)}
      ><span className="size-1.5 rounded-full bg-primary opacity-55 transition-[opacity,transform] duration-300 aria-current:opacity-100" style={{ opacity: activeSlide === index ? 1 : undefined, transform: activeSlide === index ? 'scale(1.18)' : undefined }}/></button>)}
    </div>
  </section>
}
