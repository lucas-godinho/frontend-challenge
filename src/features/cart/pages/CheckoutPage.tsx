import { PageContainer } from '@/components/organisms/PageContainer'
import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from '@tanstack/react-router'
import { Check, ChevronLeft, CircleHelp, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/cn'
import { Checkbox } from '@/components/atoms/checkbox'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group'
import { Skeleton } from '@/components/atoms/skeleton'
import { Textarea } from '@/components/atoms/textarea'
import { Select } from '@/components/molecules/select'
import { Card } from '@/components/molecules/card'
import { useCollectorProfile, useSession } from '@/features/account/use-session'
import { getWallets } from '@/features/account/account-api'
import { useCart } from '@/features/cart/use-cart'
import { connectWallet, createOrder, disconnectWallet, getWalletConnection, toCheckoutQuote } from '@/features/cart/cart-api'
import { multiplyEth } from '@/lib/eth'
import { useCatalogRealtime } from '@/features/catalog/use-catalog-realtime'
import { RequireSession } from '@/features/account/components/RequireSession'
import type { CollectorWallet } from '@/types/marketplace'

const walletTypes: CollectorWallet['type'][] = ['WalletConnect', 'MetaMask', 'Coinbase Wallet']
const checkoutFieldClass = 'grid min-w-0 gap-2 text-sm text-foreground [&_b]:text-accent'
const checkoutInputClass = 'h-11 min-h-11 rounded-sm border-border bg-transparent px-2.5 text-sm'

function CheckoutContent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useSession()
  const cart = useCart()
  const profile = useCollectorProfile()
  const wallets = useQuery({ queryKey: ['wallets'], queryFn: ({ signal }) => getWallets(signal) })
  const connectionQuery = useQuery({ queryKey: ['wallet-connection'], queryFn: ({ signal }) => getWalletConnection(signal) })
  useCatalogRealtime(cart.data?.items.map(({ nft }) => nft.id) ?? [])
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState<CollectorWallet['network']>('Ethereum')
  const [walletType, setWalletType] = useState<CollectorWallet['type']>('Coinbase Wallet')
  const [walletId, setWalletId] = useState('')
  const [ens, setEns] = useState('')
  const [referral, setReferral] = useState('')
  const [note, setNote] = useState('')
  const [feedback, setFeedback] = useState('')
  const [attemptKey, setAttemptKey] = useState(() => sessionStorage.getItem('kurio:checkout-attempt') ?? crypto.randomUUID())
  const order = useMutation({ mutationFn: () => {
    const saved = wallets.data?.find((item) => item.id === walletId)
    const chosenWallet: CollectorWallet = saved ?? {
      id: `checkout-${walletType.toLowerCase().replaceAll(' ', '-')}`,
      displayName: `${walletType} conectado`, alias: 'Carteira do pagamento', network,
      address: address.trim(), ensName: ens.trim(), type: walletType, isPrimary: false,
    }
    if (!cart.data) throw new Error('A cotação do carrinho ainda não está disponível.')
    return createOrder({ wallet: chosenWallet, buyer: { displayName, email, address: address.trim(), network }, quote: toCheckoutQuote(cart.data) }, attemptKey)
  }, onSuccess: (result) => {
    sessionStorage.removeItem('kurio:checkout-attempt')
    void navigate({ to: '/orders/$orderId', params: { orderId: result.id } })
  }, onError: (error: unknown) => {
    if (axios.isAxiosError<{ code?: string }>(error) && ['QUOTE_CHANGED', 'INVENTORY_CHANGED'].includes(error.response?.data.code ?? '')) {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      setFeedback(error.response?.data.code === 'QUOTE_CHANGED'
        ? 'Preço, desconto ou taxa mudou. O resumo foi atualizado; revise os novos valores e confirme novamente.'
        : 'A disponibilidade mudou. O resumo foi atualizado; ajuste os itens antes de confirmar novamente.')
      return
    }
    setFeedback('Não foi possível confirmar o pagamento. O carrinho foi preservado; confira sua conexão e tente novamente.')
  } })
  const walletConnection = useMutation({
    mutationFn: () => connectWallet({ type: walletType, network }),
    onSuccess: (result) => {
      queryClient.setQueryData(['wallet-connection'], result)
      setWalletId('')
      setAddress(result.address)
      setWalletType(result.type)
      setNetwork(result.network)
      setFeedback('Carteira conectada com sucesso.')
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError<{ message?: string }>(error) ? error.response?.data.message : undefined
      setFeedback(message ?? 'Não foi possível conectar a carteira. Tente novamente.')
    },
  })
  const walletDisconnection = useMutation({
    mutationFn: disconnectWallet,
    onSuccess: () => {
      queryClient.setQueryData(['wallet-connection'], null)
      setAddress('')
      setWalletId('')
      setFeedback('Carteira desconectada.')
    },
    onError: () => setFeedback('Não foi possível desconectar a carteira. Tente novamente.'),
  })

  useEffect(() => {
    if (profile.data) {
      setDisplayName(profile.data.displayName)
      setEmail(profile.data.email)
      setEns(profile.data.ensName)
    } else if (session.data) {
      setDisplayName(session.data.user.name)
      setEmail(session.data.user.email)
    }
  }, [profile.data, session.data])
  useEffect(() => {
    if (wallets.data?.length && !walletId) {
      const primary = wallets.data.find((item) => item.isPrimary) ?? wallets.data[0]
      if (!primary) return
      setWalletId(primary.id); setWalletType(primary.type); setNetwork(primary.network); setAddress(primary.address)
    }
  }, [wallets.data, walletId])
  useEffect(() => {
    if (!connectionQuery.data) return
    setWalletId('')
    setAddress(connectionQuery.data.address)
    setWalletType(connectionQuery.data.type)
    setNetwork(connectionQuery.data.network)
  }, [connectionQuery.data])

  const resetAttempt = () => {
    const key = crypto.randomUUID()
    sessionStorage.setItem('kurio:checkout-attempt', key)
    setAttemptKey(key)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback('')
    const savedKey = sessionStorage.getItem('kurio:checkout-attempt')
    if (savedKey && savedKey !== attemptKey) setAttemptKey(savedKey)
    else sessionStorage.setItem('kurio:checkout-attempt', attemptKey)
    order.mutate()
  }
  const selectWallet = (wallet: CollectorWallet) => {
    resetAttempt()
    setWalletId(wallet.id); setWalletType(wallet.type); setNetwork(wallet.network); setAddress(wallet.address)
  }
  const update = (callback: () => void) => { resetAttempt(); callback() }

  if (cart.isPending || profile.isPending || wallets.isPending) return <PageContainer id="main" className="min-h-[55vh] py-8 pb-24"><h1 className="mb-6 text-3xl font-bold">Pagamento</h1><Skeleton className="h-72 animate-pulse rounded  "/></PageContainer>
  if (cart.isError || !cart.data) return <PageContainer id="main" className="my-14 grid justify-items-center gap-4 border border-border bg-card p-8 text-center"><h1 className="m-0 text-2xl font-bold">Não foi possível preparar o pagamento.</h1><Button asChild><Link to="/cart">Voltar ao carrinho</Link></Button></PageContainer>
  if (!cart.data.items.length) return <PageContainer id="main" className="my-14 grid justify-items-center gap-4 border border-border bg-card p-8 text-center"><p className="m-0 text-xs font-bold uppercase tracking-[.12em] text-accent">Pagamento</p><h1 className="m-0 text-2xl font-bold">Seu carrinho está vazio.</h1><p className="m-0 text-sm text-muted-foreground">Adicione uma obra antes de iniciar o pagamento.</p><Button asChild><Link to="/" hash="catalog">Explorar NFTs</Link></Button></PageContainer>

  return <PageContainer id="main" className="min-h-[55vh] py-8 pb-24">
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Você está aqui"><Link className="hover:text-accent" to="/">Início</Link><span>/</span><Link className="hover:text-accent" to="/" hash="catalog">Mercado</Link><span>/</span><Link className="hover:text-accent" to="/cart">Carrinho</Link><span>/</span><strong className="text-foreground">Pagamento</strong></nav>
    <Button variant="ghost" className="mb-2 h-auto min-h-0 gap-1 px-0 py-0 text-xs text-muted-foreground hover:text-accent" type="button" onClick={() => void navigate({ to: '/cart' })}><ChevronLeft size={15}/> Voltar ao carrinho</Button>
    <h1 className="mb-6 mt-2 text-3xl font-bold">Pagamento</h1>
    <form className="grid items-start gap-6 min-[1051px]:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]" onSubmit={submit}>
      <Card asChild className="rounded-none border-border bg-card/50 p-5 min-[761px]:p-6"><section aria-labelledby="buyer-heading">
        <div className="mb-5 flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-primary text-sm text-primary">1</span><div><h2 id="buyer-heading" className="m-0 text-lg font-bold">Perfil do colecionador</h2><p className="mb-0 mt-1 text-sm text-muted-foreground">Preencha os dados para receber suas obras.</p></div></div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 min-[761px]:grid-cols-2">
          <Label className={checkoutFieldClass}><span>Nome de exibição <b>*</b></span><Input className={checkoutInputClass} value={displayName} onChange={(event) => update(() => setDisplayName(event.target.value))} required minLength={2}/></Label>
          <Label className={checkoutFieldClass}><span>Nome de usuário <b>*</b></span><Input className={checkoutInputClass} defaultValue={profile.data?.username ?? ''} required minLength={2}/></Label>
          <Label className={checkoutFieldClass}><span>Rede <b>*</b></span><Select className="h-11 w-full rounded-sm border-border bg-transparent px-2.5 text-sm" label="Rede para recebimento" value={network} options={[{ value: 'Ethereum', label: 'Ethereum' }, { value: 'Polygon', label: 'Polygon' }, { value: 'Solana', label: 'Solana' }]} onChange={(value) => update(() => setNetwork(value as CollectorWallet['network']))}/></Label>
          <Label className={checkoutFieldClass}><span>Nome do perfil <b>*</b></span><Input className={checkoutInputClass} value={ens} onChange={(event) => update(() => setEns(event.target.value))} required placeholder="colecionador.eth"/></Label>
          <Label className={checkoutFieldClass}><span>Endereço da carteira <b>*</b></span><Input className={checkoutInputClass} value={address} onChange={(event) => update(() => setAddress(event.target.value))} required minLength={8} placeholder="Endereço 0x da carteira"/></Label>
          <Label className={checkoutFieldClass}><span>ENS ou carteira secundária</span><Input className={checkoutInputClass} placeholder="Opcional"/></Label>
          <Label className={checkoutFieldClass}><span>Tipo de carteira <b>*</b></span><Select className="h-11 w-full rounded-sm border-border bg-transparent px-2.5 text-sm" label="Tipo de carteira" value={walletType} options={[{ value: 'WalletConnect', label: 'WalletConnect' }, { value: 'MetaMask', label: 'MetaMask' }, { value: 'Coinbase Wallet', label: 'Coinbase Wallet' }]} onChange={(value) => update(() => { setWalletType(value as CollectorWallet['type']); setWalletId('') })}/></Label>
          <Label className={checkoutFieldClass}><span>Código de indicação <b>*</b></span><Input className={checkoutInputClass} value={referral} onChange={(event) => update(() => setReferral(event.target.value))} placeholder="Código promocional aplicado aqui" required/></Label>
          <Label className={checkoutFieldClass}><span>E-mail <b>*</b></span><Input className={checkoutInputClass} type="email" value={email} onChange={(event) => update(() => setEmail(event.target.value))} required/></Label>
          <Label className={checkoutFieldClass}><span>Nome ENS <b>*</b></span><div className="flex min-w-0 gap-2"><Select className="h-11 w-[76px] shrink-0 rounded-sm border-border bg-transparent px-2 text-sm" label="Extensão ENS" value=".eth" options={[{ value: '.eth', label: '.eth' }, { value: '.xyz', label: '.xyz' }]} onChange={() => undefined}/><Input className={checkoutInputClass} value={ens} onChange={(event) => update(() => setEns(event.target.value))} required/></div></Label>
        </div>
        <div className="mt-5 flex items-center gap-2 text-sm"><Checkbox id="use-other-wallet"/><Label htmlFor="use-other-wallet">Usar outra carteira?</Label></div>
        <Label className="mt-5 grid gap-2 text-sm">Observação do colecionador (opcional)<Textarea className="min-h-28 border-border bg-transparent text-sm" value={note} onChange={(event) => setNote(event.target.value)} rows={3}/></Label>
        {wallets.data && wallets.data.length > 0 && <fieldset className="mt-5 grid gap-3 border border-border p-4"><legend className="px-1 text-sm font-bold">Carteiras cadastradas</legend><RadioGroup aria-label="Selecionar carteira cadastrada" value={walletId} onValueChange={(id) => { const wallet = wallets.data?.find((item) => item.id === id); if (wallet) selectWallet(wallet) }}>{wallets.data.map((wallet) => <Label className="flex items-center gap-3 text-sm" key={wallet.id}><RadioGroupItem value={wallet.id}/><span className="grid gap-1"><strong>{wallet.alias}</strong><small className="text-xs text-muted-foreground">{wallet.network} · {wallet.address}</small></span></Label>)}</RadioGroup></fieldset>}
      </section></Card>
      <Card asChild className="rounded-none border-border bg-card p-5 min-[761px]:p-6 min-[1051px]:sticky min-[1051px]:top-6"><aside aria-labelledby="checkout-summary-title">
        <div className="mb-5 flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-primary text-sm text-primary">2</span><div><h2 id="checkout-summary-title" className="m-0 text-lg font-bold">Seus NFTs</h2><p className="mb-0 mt-1 text-sm text-muted-foreground">Revise sua seleção e carteira.</p></div></div>
        <div className="grid gap-3">{cart.data.items.map(({ nft, quantity }) => <article className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2.5" key={nft.id}><img className="size-11 rounded object-cover" src={nft.image} alt=""/><div className="grid min-w-0 gap-1"><strong className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">{nft.name}</strong><small className="text-xs text-muted-foreground">ID do token: #{nft.id.slice(-4)}</small>{nft.available < quantity && <p className="m-0 text-xs text-destructive" role="status">Esta edição ficou indisponível. <Link className="underline" to="/cart">Ajuste seu carrinho.</Link></p>}</div><div className="grid justify-items-end gap-1 text-sm"><span className="text-muted-foreground">({quantity} ×)</span><b>{multiplyEth(nft.priceEth, quantity)} ETH</b></div></article>)}</div>
        {cart.data.coupon && <p className="mt-4 flex items-center gap-2 text-sm text-primary"><Check size={15}/> Cupom {cart.data.coupon} aplicado: − {cart.data.discountEth} ETH</p>}
        <div className="my-4 grid gap-3 border-y border-border py-4 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Subtotal</span><b>{cart.data.subtotalEth} ETH</b></div>{Number(cart.data.discountEth) > 0 && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Desconto do lançamento</span><b>− {cart.data.discountEth} ETH</b></div>}<div className="flex justify-between gap-3"><span className="text-muted-foreground">Taxa de rede</span><b>{cart.data.networkFeeEth} ETH</b></div><div className="flex justify-between gap-3 text-base font-bold"><span>Total</span><strong className="text-accent">{cart.data.totalEth} ETH</strong></div></div>
        <fieldset className="grid gap-2 border border-border p-3"><legend className="px-1 text-sm font-bold">Carteira e rede</legend><RadioGroup aria-label="Selecionar tipo de carteira" value={walletType} onValueChange={(value) => update(() => { if (connectionQuery.data) walletDisconnection.mutate(); setWalletType(value as CollectorWallet['type']); setWalletId('') })}>{walletTypes.map((type) => <Label className={cn('flex min-h-11 items-center gap-2 border border-transparent px-2 text-sm', walletType === type && 'border-primary bg-primary/5')} key={type}><RadioGroupItem value={type}/><span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{type === 'MetaMask' ? 'M' : type === 'WalletConnect' ? 'W' : 'C'}</span><span>{type}</span><small className="ml-auto text-xs text-muted-foreground">{walletType === type ? 'Selecionada' : 'Selecionar'}</small></Label>)}</RadioGroup></fieldset>
        <div className="mt-4 grid justify-items-start gap-2" aria-live="polite">
          {connectionQuery.data ? <><p className="m-0 flex items-center gap-2 text-sm text-primary"><Check size={15}/> {connectionQuery.data.type} conectado · {connectionQuery.data.network}</p><code className="max-w-full break-all text-xs text-muted-foreground">{connectionQuery.data.address}</code><Button variant="outline" type="button" disabled={walletDisconnection.isPending} onClick={() => walletDisconnection.mutate()}>{walletDisconnection.isPending ? 'Desconectando…' : 'Desconectar carteira'}</Button></> : <Button variant="outline" type="button" disabled={walletConnection.isPending || connectionQuery.isPending} onClick={() => { resetAttempt(); setFeedback(''); walletConnection.mutate() }}>{walletConnection.isPending ? <><LoaderCircle size={14} className="animate-spin"/> Conectando…</> : `Conectar ${walletType}`}</Button>}
        </div>
        <p className="my-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15}/> Seus dados são protegidos e a compra é simulada.</p>
        {feedback && <p className="text-sm leading-relaxed text-destructive" role="alert">{feedback}</p>}
        <Button type="submit" className="h-12 w-full justify-between rounded-none px-4 text-sm uppercase" disabled={order.isPending || cart.data.items.some(({ nft, quantity }) => nft.available < quantity)}>{order.isPending ? <><LoaderCircle size={15} className="animate-spin"/> Confirmando…</> : <>Confirmar compra <span>{cart.data.totalEth} ETH</span></>}</Button>
        <p className="mb-0 mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground"><CircleHelp size={14}/> Ao confirmar, você aceita os termos da Kurio.</p>
      </aside></Card>
    </form>
  </PageContainer>
}

export function CheckoutPage() { return <RequireSession><CheckoutContent/></RequireSession> }

