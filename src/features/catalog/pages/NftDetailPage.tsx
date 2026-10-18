import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, Star } from 'lucide-react'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Card, CardDescription, CardTitle } from '@/components/molecules/card'
import { PageContainer } from '@/components/organisms/PageContainer'
import { useCartActions } from '@/features/cart/use-cart'
import { FavoriteButton, NftCard } from '@/features/catalog/molecules/NftCard'
import { useCatalog } from '@/features/catalog/use-catalog'
import { useNft } from '@/features/catalog/use-nft'
import { FavoritesProvider } from '@/features/favorites/FavoritesProvider'
import { cn } from '@/lib/cn'

function NftDetailSkeleton() {
  return <PageContainer id="main" className="min-h-[55vh] pb-24 pt-10" aria-busy="true">
    <Skeleton className="mb-7 h-4 w-36"/>
    <div className="grid gap-8 min-[761px]:grid-cols-[minmax(0,1.05fr)_minmax(320px,.85fr)] min-[761px]:gap-12 xl:gap-20">
      <div className="grid gap-3 min-[761px]:grid-cols-[72px_minmax(0,1fr)]">
        <div className="order-2 flex gap-2 min-[761px]:order-1 min-[761px]:flex-col">{Array.from({ length: 4 }, (_, index) => <Skeleton className="aspect-square w-16 rounded-md" key={index}/>)}</div>
        <Skeleton className="order-1 aspect-square w-full rounded-xl min-[761px]:order-2"/>
      </div>
      <div className="grid content-start gap-4">
        <Skeleton className="h-3 w-28"/><Skeleton className="h-10 w-4/5"/><Skeleton className="h-5 w-1/2"/>
        <Skeleton className="my-3 h-20 w-full"/><Skeleton className="h-24 w-full"/><Skeleton className="h-72 w-full"/>
      </div>
    </div>
    <div className="mt-12 grid gap-3 border-y border-border py-5">
      <Skeleton className="h-8 w-64"/>{Array.from({ length: 4 }, (_, index) => <Skeleton className="h-3 w-full" key={index}/>)}
    </div>
    <section className="mt-14" aria-label="Carregando obras da coleção" aria-busy="true">
      <Skeleton className="mb-5 h-6 w-48"/><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Skeleton className="aspect-[.82] rounded-md" key={index}/>)}</div>
    </section>
  </PageContainer>
}

function DetailState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <PageContainer id="main" className="grid min-h-[55vh] place-items-center py-14">
    <Card className="grid max-w-xl justify-items-center gap-3 p-8 text-center">
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      {action}
    </Card>
  </PageContainer>
}

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const nft = useNft(nftId)
  const cart = useCartActions()
  const related = useCatalog({ sort: 'recent', page: 1 }, Boolean(nft.data))
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'reviews'>('details')

  if (nft.isPending) return <NftDetailSkeleton/>
  if (nft.isError && nft.error && 'response' in nft.error && (nft.error as { response?: { status?: number } }).response?.status === 404) {
    return <DetailState title="Este NFT não está disponível." description="O link pode estar incorreto ou a obra foi removida." action={<Button asChild><Link to="/" hash="catalog">Voltar ao catálogo</Link></Button>}/>
  }
  if (nft.isError || !nft.data) {
    return <DetailState title="Não foi possível carregar esta obra." description="Confira sua conexão e tente novamente." action={<Button onClick={() => void nft.refetch()}>Tentar novamente</Button>}/>
  }

  const item = nft.data
  const addToCart = async (buyNow = false) => {
    setFeedback('')
    try {
      await cart.add.mutateAsync({ nftId: item.id, quantity })
      setFeedback(`${quantity} ${quantity === 1 ? 'unidade adicionada' : 'unidades adicionadas'} ao carrinho.`)
      if (buyNow) void navigate({ to: '/checkout' })
    } catch {
      setFeedback('Não foi possível adicionar. Confira a disponibilidade e tente novamente.')
    }
  }

  return <PageContainer id="main" className="min-h-[55vh] pb-24 pt-10">
    <Button className="mb-7 h-auto min-h-0 justify-start gap-2 px-0 py-1 text-sm text-muted-foreground hover:text-accent" variant="ghost" asChild>
      <Link to="/" hash="catalog"><ArrowLeft size={16}/> Voltar ao catálogo</Link>
    </Button>

    <div className="grid gap-8 min-[761px]:grid-cols-[minmax(0,1.05fr)_minmax(320px,.85fr)] min-[761px]:gap-12 xl:gap-20">
      <section className="grid content-start gap-3 min-[761px]:grid-cols-[72px_minmax(0,1fr)]" aria-label={`Galeria de ${item.name}`}>
        <div className="order-2 flex gap-2 min-[761px]:order-1 min-[761px]:flex-col" aria-label="Imagens da obra">
          {['Imagem principal', 'Detalhe da obra', 'Obra em contexto', 'Obra em detalhe'].map((label, index) => <button className="size-16 shrink-0 overflow-hidden rounded-md border border-primary bg-card p-1 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" key={label} type="button" aria-label={label} aria-current={index === 0 ? 'true' : undefined}>
            <img className="size-full rounded-sm object-cover" src={item.image} alt=""/>
          </button>)}
        </div>
        <div className="relative order-1 aspect-square overflow-hidden rounded-xl bg-card p-2 min-[761px]:order-2">
          <img className="size-full rounded-lg object-cover" src={item.image} alt={`${item.name}, arte digital de ${item.creator}`} onError={(event) => { event.currentTarget.src = '/images/artwork-fallback.svg' }}/>
          <Badge variant="secondary" className="absolute bottom-5 right-5 rounded-full border border-border bg-background/85 px-3 py-1 text-xs backdrop-blur">{item.network}</Badge>
        </div>
      </section>

      <section className="grid content-start" aria-labelledby="detail-title">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.14em] text-primary">{item.collection}</p>
        <h1 id="detail-title" className="mb-2 mt-0 text-2xl font-semibold leading-tight tracking-tight min-[761px]:text-4xl">{item.name}</h1>
        <p className="mb-1 mt-0 flex flex-wrap items-center gap-2 text-base font-bold text-accent">{item.priceEth} ETH <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground"><Star size={13} fill="currentColor" className="text-primary"/> 4.9 (19 avaliações)</span></p>
        <p className="mb-5 mt-0 text-sm text-muted-foreground">por <strong className="font-semibold text-foreground">{item.creator}</strong> · coleção verificada</p>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground min-[761px]:text-base">Uma peça digital colecionável da coleção {item.collection}, criada por {item.creator} e registrada na rede {item.network}.</p>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-border py-5 sm:gap-x-8">
          {[['Edição', `${item.edition} unidades`], ['Disponíveis', `${item.available} unidades`], ['Categoria', item.category], ['Rede', item.network]].map(([label, value]) => <div className="grid gap-1.5" key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt><dd className="m-0 text-sm font-medium capitalize">{value}</dd>
          </div>)}
        </dl>

        <Card className="relative mt-6 rounded-md border-border bg-gradient-to-b from-primary/10 to-card p-5 sm:p-6">
          <p className="mb-1 mt-0 text-xs uppercase tracking-wide text-muted-foreground">Preço do NFT</p>
          <strong className="text-3xl font-bold text-accent">{item.priceEth} ETH</strong>
          <div className="mt-3 flex justify-between gap-3 text-xs text-muted-foreground"><span>{item.edition} edição · {item.available} disponíveis</span><span>ID #{item.id.slice(-4)}</span></div>
          <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-3">
            <span className="text-sm font-medium">Quantidade</span>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="size-9" type="button" aria-label="Diminuir quantidade" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus size={16}/></Button>
              <output className="min-w-5 text-center text-sm font-semibold" aria-live="polite">{quantity}</output>
              <Button variant="outline" size="icon" className="size-9" type="button" aria-label="Aumentar quantidade" disabled={quantity >= item.available} onClick={() => setQuantity((current) => Math.min(item.available, current + 1))}><Plus size={16}/></Button>
            </div>
            <small className="col-span-2 text-xs text-muted-foreground">Máximo de {item.available} por edição</small>
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_44px] gap-2">
            <Button className="h-12 w-full" disabled={item.available < 1 || cart.add.isPending} onClick={() => void addToCart(true)}><ShoppingCart size={17}/>{cart.add.isPending ? 'Adicionando…' : 'Comprar'}</Button>
            <FavoriteButton nft={item}/>
          </div>
          <Button className="mt-2 w-full" variant="secondary" disabled={item.available < 1 || cart.add.isPending} onClick={() => void addToCart()}>Adicionar ao carrinho</Button>
          <p className="mt-3 flex min-h-5 items-center justify-center gap-1.5 text-center text-xs text-accent" role="status" aria-live="polite">{feedback}{feedback.includes('adicionad') && <Check size={14}/>}</p>
          <Link className="block text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-accent" to="/cart">Ver carrinho</Link>
        </Card>
      </section>
    </div>

    <section className="mt-12 border-y border-border" aria-label="Informações da obra">
      <div className="flex gap-5 overflow-x-auto border-b border-border" role="tablist">
        <Button variant="ghost" className={cn('min-h-11 shrink-0 rounded-none border-b-2 border-transparent px-1 text-sm text-muted-foreground', activeDetailTab === 'details' && 'border-primary text-primary')} type="button" role="tab" aria-selected={activeDetailTab === 'details'} onClick={() => setActiveDetailTab('details')}>Detalhes do NFT</Button>
        <Button variant="ghost" className={cn('min-h-11 shrink-0 rounded-none border-b-2 border-transparent px-1 text-sm text-muted-foreground', activeDetailTab === 'reviews' && 'border-primary text-primary')} type="button" role="tab" aria-selected={activeDetailTab === 'reviews'} onClick={() => setActiveDetailTab('reviews')}>Avaliações de colecionadores (19)</Button>
      </div>
      {activeDetailTab === 'details' ? <div className="grid gap-3 py-5 text-sm leading-relaxed text-muted-foreground">
        <p className="m-0">{item.name} é uma obra digital 1/1 finalizada à mão na coleção {item.collection}. Cada atributo fica armazenado nos metadados do token e verificado na rede {item.network}. A obra explora identidade, movimento e luz em uma linguagem visual contemporânea.</p>
        <p className="m-0"><strong className="text-foreground">Rede:</strong> Cunhada na rede {item.network} com procedência imutável e metadados armazenados no IPFS.</p>
        <p className="m-0"><strong className="text-foreground">Contrato:</strong> Direitos autorais do criador. Direitos secundários, pagos automaticamente pelos mercados compatíveis.</p>
        <p className="m-0"><strong className="text-foreground">Direitos autorais:</strong> Verificados na coleção {item.collection}.</p>
      </div> : <div className="grid gap-2 py-5 text-sm text-muted-foreground"><strong className="inline-flex items-center gap-2 text-base text-foreground"><Star size={16} fill="currentColor" className="text-primary"/> 4.9 de 5</strong><p className="m-0">19 colecionadores avaliaram esta obra. As avaliações ficam disponíveis após uma compra confirmada.</p></div>}
    </section>

    <section className="mt-14" aria-label="Mais desta coleção">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
        <h2 className="m-0 text-lg font-semibold sm:text-xl">Mais desta coleção</h2>
        <Link className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-accent" to="/" hash="catalog">Ver coleção <ArrowLeft size={14}/></Link>
      </div>
      {related.isPending ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => <Skeleton className="aspect-[.82] rounded-md" key={index}/>)}
      </div> : related.data?.items && <FavoritesProvider><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{related.data.items.filter((relatedNft) => relatedNft.id !== item.id).slice(0, 5).map((relatedNft, index) => <NftCard key={relatedNft.id} nft={relatedNft} index={index}/>)}</div></FavoritesProvider>}
    </section>
  </PageContainer>
}
