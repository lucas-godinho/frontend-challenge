import { PageContainer } from '@/components/organisms/PageContainer'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Check, CircleAlert, ExternalLink, LoaderCircle, X } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/molecules/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { getOrder } from '@/features/cart/cart-api'
import { multiplyEth } from '@/lib/eth'
import { orderKey, useOrderRealtime } from '@/features/cart/use-order-realtime'

export function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const order = useQuery({ queryKey: orderKey(orderId), queryFn: ({ signal }) => getOrder(orderId, signal), retry: false })
  useOrderRealtime(orderId)
  if (order.isPending) return <PageContainer id="main" className="grid min-h-[78vh] place-items-center py-8 pb-20" aria-busy="true" aria-label="Carregando pedido"><Skeleton className="h-[560px] w-full max-w-[620px] animate-pulse rounded-none  "/></PageContainer>
  if (order.isError || !order.data) return <PageContainer id="main" className="my-14 grid justify-items-center gap-4 border border-border bg-card p-8 text-center"><p className="m-0 text-xs font-bold uppercase tracking-[.12em] text-accent">Pedido</p><h1 className="m-0 text-2xl font-bold">Não encontramos este pedido.</h1><p className="m-0 text-sm text-muted-foreground">Acesse sua conta para consultar suas compras.</p><Button asChild><Link to="/profile">Ir para minha conta</Link></Button></PageContainer>
  const receipt = order.data
  const confirmed = receipt.status === 'confirmed'
  const pending = receipt.status === 'pending'
  return <PageContainer id="main" className="grid min-h-[78vh] justify-items-center content-center gap-4 py-8 pb-20">
    <Card asChild className={`relative w-full max-w-[620px] rounded-none border-0 border-b-4 border-b-primary p-5 shadow-xl sm:p-8 ${confirmed ? '' : pending ? 'border-t-2 border-t-primary' : 'border-t-2 border-t-destructive'}`}><section aria-labelledby="order-title">
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 size-10 text-primary" asChild><Link to="/" aria-label="Fechar confirmação"><X size={16}/></Link></Button>
      <header className="grid justify-items-center border-b border-border px-3 pb-5 text-center" aria-live="polite"><div className="mb-3 grid size-14 place-content-center justify-items-center border border-primary text-primary">{confirmed ? <><span className="text-[9px] leading-none">THANK</span><Check size={22}/><span className="text-[9px] leading-none">YOU</span></> : pending ? <LoaderCircle className="animate-spin" size={26}/> : <CircleAlert size={24}/>}</div><h1 id="order-title" className="m-0 text-xl font-bold">{confirmed ? 'Compra confirmada' : pending ? 'Pagamento em processamento' : 'Pagamento recusado'}</h1><p className="mb-0 mt-2 text-sm text-muted-foreground">{confirmed ? 'Seus NFTs agora estão na sua carteira.' : pending ? 'Estamos aguardando a confirmação da transação.' : 'A transação não foi concluída. Seu carrinho continua salvo.'}</p></header>
      <dl className="mx-[-1.25rem] grid grid-cols-2 gap-3 border-b border-primary px-5 py-4 text-sm sm:mx-[-2rem] sm:grid-cols-4 sm:px-8"><div className="min-w-0"><dt className="text-xs text-muted-foreground">ID da transação</dt><dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap">{receipt.transactionId.slice(0, 13)}…</dd></div><div><dt className="text-xs text-muted-foreground">Data</dt><dd className="mt-1">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(receipt.createdAt))}</dd></div><div><dt className="text-xs text-muted-foreground">Total</dt><dd className="mt-1">{receipt.totalEth} ETH</dd></div><div><dt className="text-xs text-muted-foreground">Carteira</dt><dd className="mt-1">{receipt.wallet.type}</dd></div></dl>
      <section className="pt-5"><h2 className="mb-4 mt-0 text-base font-bold">Detalhes da transação</h2><p className="mb-3 mt-0 text-xs font-bold uppercase tracking-[.12em] text-accent">NFTs</p>{receipt.items.map(({ nft, quantity }) => <article className="mb-3 grid min-w-0 grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-2 sm:grid-cols-[44px_minmax(0,1fr)_auto_auto] sm:gap-3" key={nft.id}><img className="size-10 rounded object-cover sm:size-11" src={nft.image} alt=""/><div className="grid min-w-0 gap-1"><strong className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">{nft.name}</strong><small className="text-xs text-muted-foreground">ID do token: #{nft.id.slice(-4)}</small></div><span className="whitespace-nowrap text-xs text-muted-foreground">(× {quantity})</span><b className="whitespace-nowrap text-sm">{multiplyEth(nft.priceEth, quantity)} ETH</b></article>)}</section>
      <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm"><div className="flex justify-end gap-6"><span className="text-muted-foreground">Taxa de rede</span><b>{receipt.networkFeeEth} ETH</b></div><div className="flex justify-end gap-6"><span className="text-muted-foreground">Total</span><strong className="text-base text-accent">{receipt.totalEth} ETH</strong></div></div>
      <p className="my-4 text-center text-sm leading-relaxed text-muted-foreground">{confirmed ? 'Transação confirmada na rede de demonstração. A propriedade foi transferida para sua carteira e registrada na coleção.' : pending ? 'O status será atualizado automaticamente quando a transação for concluída.' : 'Nenhum valor foi cobrado. Você pode tentar novamente pelo carrinho.'}</p>
      {confirmed && <Button className="mx-auto flex min-h-11" asChild><a href={`https://sepolia.etherscan.io/tx/${receipt.transactionId}`} target="_blank" rel="noreferrer"><span>Ver no Etherscan (simulado)</span><ExternalLink size={15}/></a></Button>}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-primary">{confirmed && <Link className="underline underline-offset-4" to="/profile">Ver minha conta</Link>}{pending && <span role="status">Aguardando confirmação…</span>}{!confirmed && !pending && <Link className="underline underline-offset-4" to="/cart">Voltar ao carrinho</Link>}<Link className="underline underline-offset-4" to="/" hash="catalog">Continuar explorando</Link></div>
    </section></Card>
    <Button variant="outline" className="min-h-11" asChild><Link to="/">Voltar ao início</Link></Button>
  </PageContainer>
}
