import { memo } from 'react'
import { Link } from '@tanstack/react-router'

const linkClass = 'text-sm text-foreground transition-colors hover:text-accent'

export const SiteFooter = memo(function SiteFooter() {
  return <footer className="mx-auto mt-12 hidden w-[90%] border-0 p-0 text-xs text-foreground min-[761px]:block min-[1051px]:w-[min(calc(100%-200px),960px)]">
    <div className="grid min-h-[76px] grid-cols-4 items-center gap-5 bg-[#3b2415] p-6">
      <Link className="font-display text-base font-bold" to="/">Kurio</Link>
      <p className="m-0 text-sm leading-relaxed">Feito para colecionadores,<br/>criadores e cultura</p>
      <a className={linkClass} href="mailto:contato@email.com">contato@email.com</a>
      <a className={linkClass} href="tel:+551140028922">+55 11 4002 8922</a>
    </div>
    <div className="grid grid-cols-4 gap-5 bg-card px-6 pb-7 pt-8">
      <section className="flex flex-col items-start gap-2.5">
        <h2 className="mb-0.5 mt-0 text-sm font-semibold">Meu perfil</h2><a className={linkClass} href="#profile">Meu perfil</a><a className={linkClass} href="#collection">Minha coleção</a><a className={linkClass} href="#activity">Atividade</a><a className={linkClass} href="#creator">Estúdio do criador</a><a className={linkClass} href="#wishlist">Lista de interesse</a>
      </section>
      <section className="flex flex-col items-start gap-2.5">
        <h2 className="mb-0.5 mt-0 text-sm font-semibold">Central de ajuda</h2><a className={linkClass} href="#help">Central de ajuda</a><a className={linkClass} href="#buying">Como comprar NFTs</a><a className={linkClass} href="#wallet">Carteira e segurança</a><a className={linkClass} href="#policy">Política do mercado</a><a className={linkClass} href="#report">Denunciar item</a>
      </section>
      <section className="flex flex-col items-start gap-2.5">
        <h2 className="mb-0.5 mt-0 text-sm font-semibold">Coleções</h2><Link className={linkClass} to="/" search={{ category: 'art' }} hash="catalog" resetScroll={false}>Arte digital</Link><Link className={linkClass} to="/" search={{ category: 'photo' }} hash="catalog" resetScroll={false}>Fotografia</Link><Link className={linkClass} to="/" search={{ category: 'music' }} hash="catalog" resetScroll={false}>Música</Link><Link className={linkClass} to="/" search={{ category: '3d' }} hash="catalog" resetScroll={false}>Arte 3D</Link><Link className={linkClass} to="/" search={{ category: 'utility' }} hash="catalog" resetScroll={false}>Utilidade</Link>
      </section>
      <section className="flex flex-col items-start gap-2.5">
        <h2 className="mb-0.5 mt-0 text-sm font-semibold">Redes sociais</h2><div className="mb-3 flex gap-2"><a className="grid size-[30px] place-items-center rounded border border-primary text-sm font-bold text-primary hover:bg-primary/10" href="#facebook" aria-label="Facebook">f</a><a className="grid size-[30px] place-items-center rounded border border-primary text-sm font-bold text-primary hover:bg-primary/10" href="#instagram" aria-label="Instagram">◎</a><a className="grid size-[30px] place-items-center rounded border border-primary text-sm font-bold text-primary hover:bg-primary/10" href="#twitter" aria-label="Twitter">t</a><a className="grid size-[30px] place-items-center rounded border border-primary text-sm font-bold text-primary hover:bg-primary/10" href="#linkedin" aria-label="LinkedIn">in</a></div>
        <h2 className="mb-0.5 mt-0 text-sm font-semibold">Carteiras compatíveis</h2><p className="m-0 whitespace-nowrap bg-secondary p-1.5 text-[10px] uppercase text-primary">METAMASK · WALLETCONNECT · COINBASE</p>
      </section>
    </div>
    <p className="my-0 px-4 py-5 text-center text-primary">© 2026 Kurio. Propriedade digital para todos.</p>
  </footer>
})
