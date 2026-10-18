import { PageContainer } from '@/components/organisms/PageContainer'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Skeleton } from '@/components/atoms/skeleton'
import { Card } from '@/components/molecules/card'
import { useCart, useCartActions } from '@/features/cart/use-cart'
import { multiplyEth } from '@/lib/eth'

function formatApiError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return 'Não foi possível atualizar o carrinho. Tente novamente.'
}

export function CartPage() {
  const cart = useCart()
  const actions = useCartActions()
  const [feedback, setFeedback] = useState('')
  const [couponCode, setCouponCode] = useState('')

  if (cart.isPending) return <PageContainer id="main" className="min-h-[55vh] py-8 pb-24"><header className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-accent">Sua seleção</p><h1 className="m-0 text-3xl font-bold">Carrinho</h1></header><section className="grid gap-4" aria-label="Carregando carrinho"><Skeleton className="h-32 animate-pulse rounded  "/><Skeleton className="h-32 animate-pulse rounded  "/></section></PageContainer>
  if (cart.isError) return <PageContainer id="main" className="my-14 grid justify-items-center gap-4 border border-border bg-card p-8 text-center" role="alert"><h1 className="m-0 text-2xl font-bold">Não foi possível carregar o carrinho.</h1><p className="m-0 text-sm text-muted-foreground">Confira sua conexão e tente novamente.</p><Button onClick={() => void cart.refetch()}>Tentar novamente</Button></PageContainer>

  const items = cart.data.items
  const applyCoupon = () => {
    setFeedback('')
    actions.coupon.mutate(couponCode, { onSuccess: () => setFeedback('Cupom aplicado.'), onError: (error) => setFeedback(formatApiError(error)) })
  }
  return <PageContainer id="main" className="min-h-[55vh] py-8 pb-24">
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Você está aqui"><Link className="hover:text-accent" to="/">Início</Link><span>/</span><Link className="hover:text-accent" to="/" hash="catalog">Mercado</Link><span>/</span><strong className="text-foreground">Carrinho de NFTs</strong></nav>
    <header className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-accent">Sua seleção</p><h1 className="m-0 text-3xl font-bold">Carrinho</h1><p className="mb-0 mt-3 text-sm text-muted-foreground">{cart.data.itemCount} {cart.data.itemCount === 1 ? 'item' : 'itens'} reservados para você.</p></header>
    {items.length === 0 ? <Card className="mx-auto my-12 grid max-w-[560px] justify-items-center gap-4 rounded-none p-8 text-center"><ShoppingBag size={36} className="text-primary"/><h2 className="m-0 text-xl font-bold">Seu carrinho está vazio</h2><p className="m-0 text-sm leading-relaxed text-muted-foreground">Encontre uma obra e adicione ao carrinho para continuar.</p><Button asChild><Link to="/" hash="catalog">Explorar NFTs</Link></Button></Card> : <div className="grid items-start gap-6 min-[1051px]:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Itens do carrinho" className="min-w-0">
        {items.map(({ nft, quantity }) => <article className="grid min-h-[136px] grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-4 first:border-t min-[761px]:grid-cols-[100px_minmax(0,1fr)_auto] min-[761px]:gap-5" key={nft.id}>
          <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="block aspect-square rounded-lg bg-card p-1.5"><img className="size-full rounded object-cover" src={nft.image} alt={`${nft.name}, arte digital de ${nft.creator}`} onError={(event) => { event.currentTarget.src = '/images/artwork-fallback.svg' }}/></Link>
          <div className="min-w-0"><p className="mb-1 text-xs uppercase text-muted-foreground">{nft.collection}</p><h2 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold"><Link to="/nft/$nftId" params={{ nftId: nft.id }}>{nft.name}</Link></h2><p className="mb-3 mt-1 text-sm text-muted-foreground">por {nft.creator} · {nft.network}</p><div className="flex items-center gap-2"><Button variant="outline" size="icon" className="size-9 min-h-9" type="button" aria-label={`Diminuir quantidade de ${nft.name}`} disabled={quantity <= 1 || actions.update.isPending} onClick={() => { setFeedback(''); actions.update.mutate({ nftId: nft.id, quantity: quantity - 1 }, { onError: (error) => setFeedback(formatApiError(error)) }) }}><Minus size={15}/></Button><output className="min-w-5 text-center text-sm" aria-label={`Quantidade de ${nft.name}`}>{quantity}</output><Button variant="outline" size="icon" className="size-9 min-h-9" type="button" aria-label={`Aumentar quantidade de ${nft.name}`} disabled={quantity >= nft.available || actions.update.isPending} onClick={() => { setFeedback(''); actions.update.mutate({ nftId: nft.id, quantity: quantity + 1 }, { onError: (error) => setFeedback(formatApiError(error)) }) }}><Plus size={15}/></Button><span className="ml-1 text-xs text-muted-foreground max-[500px]:hidden">{nft.priceEth} ETH cada</span></div></div>
          <div className="grid justify-items-end gap-3"><strong className="whitespace-nowrap text-sm text-accent">{multiplyEth(nft.priceEth, quantity)} ETH</strong><Button variant="ghost" className="h-auto min-h-0 gap-1 px-0 py-0 text-xs text-muted-foreground hover:text-destructive" type="button" aria-label={`Remover ${nft.name} do carrinho`} disabled={actions.remove.isPending} onClick={() => { setFeedback(''); actions.remove.mutate(nft.id, { onError: (error) => setFeedback(formatApiError(error)) }) }}><Trash2 size={15}/><span className="max-[500px]:hidden">Remover</span></Button></div>
        </article>)}
        <p className="min-h-6 text-sm text-destructive" role="alert" aria-live="polite">{feedback}</p>
        <Link to="/" hash="catalog" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-accent">Continuar explorando</Link>
      </section>
      <Card asChild className="rounded-none p-5 min-[761px]:p-6 min-[1051px]:sticky min-[1051px]:top-6"><aside aria-labelledby="cart-summary-title"><h2 id="cart-summary-title" className="mb-5 mt-0 text-xl font-bold">Resumo da carteira</h2>
        <form className="mb-5 grid gap-2" onSubmit={(event) => { event.preventDefault(); applyCoupon() }}><Label className="text-sm" htmlFor="cart-coupon">Código promocional</Label><div className="flex gap-2"><Input className="h-10 min-h-10 min-w-0 text-sm" id="cart-coupon" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Digite seu código" disabled={Boolean(cart.data.coupon)}/>{cart.data.coupon ? <Button variant="outline" size="sm" className="h-10" type="button" onClick={() => actions.clearCoupon.mutate(undefined, { onSuccess: () => setFeedback('Cupom removido.') })}>Remover</Button> : <Button size="sm" className="h-10" type="submit" disabled={!couponCode.trim() || actions.coupon.isPending}>Aplicar</Button>}</div>{cart.data.coupon && <small className="text-xs text-primary">Cupom {cart.data.coupon} aplicado</small>}</form>
        <div className="my-3 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Subtotal</span><strong>{cart.data.subtotalEth} ETH</strong></div>{Number(cart.data.discountEth) > 0 && <div className="my-3 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Desconto do lançamento</span><strong>{'− '}{cart.data.discountEth} ETH</strong></div>}<div className="my-3 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Taxa de rede</span><span>{cart.data.networkFeeEth ?? '0.00'} ETH</span></div><div className="mt-4 flex justify-between gap-3 border-t border-border pt-4 text-base font-bold"><span>Total</span><strong className="text-accent">{cart.data.totalEth ?? cart.data.subtotalEth} ETH</strong></div><p className="min-h-6 text-sm text-destructive" role="status" aria-live="polite">{feedback}</p><Button className="w-full" asChild><Link to="/checkout">Conectar e finalizar</Link></Button><Link className="mt-3 block text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-accent" to="/" hash="catalog">Continuar explorando</Link></aside></Card>
    </div>}
  </PageContainer>
}
