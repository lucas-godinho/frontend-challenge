import { PageContainer } from '@/components/organisms/PageContainer'
import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { Activity, Check, CirclePlus, CreditCard, Heart, MapPin, Pencil, Trash2, WalletCards } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/atoms/skeleton'
import { Checkbox } from '@/components/atoms/checkbox'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Select } from '@/components/molecules/select'
import { Card } from '@/components/molecules/card'
import { RequireSession } from '@/features/account/components/RequireSession'
import { getWallets, removeWallet, saveWallet } from '@/features/account/account-api'
import { useSession } from '@/features/account/use-session'
import type { CollectorWallet } from '@/types/marketplace'

const walletsKey = ['wallets'] as const
const blankWallet = { displayName: '', alias: '', network: '' as CollectorWallet['network'] | '', address: '', ensName: '', type: '' as CollectorWallet['type'] | '', isPrimary: false }
const accountLayoutClass = 'grid min-h-[78vh] grid-cols-1 items-start gap-[18px] pt-5 pb-[110px] max-[760px]:px-5 min-[761px]:grid-cols-[280px_minmax(0,1fr)] min-[761px]:gap-7 min-[761px]:pt-6 min-[761px]:pb-[90px]'
const sidebarLinkClass = 'flex min-h-11 items-center gap-[11px] px-4 text-sm text-primary transition-colors hover:bg-primary/10'
const fieldClass = 'grid min-w-0 gap-2 text-sm text-foreground [&_b]:text-accent'
const inputClass = 'h-11 min-h-11 rounded-sm border-border bg-transparent px-2.5 text-sm'
const selectClass = 'h-11 min-h-11 w-full rounded-sm border-border bg-transparent px-2.5 text-sm'

function WalletsContent() {
  const session = useSession()
  const client = useQueryClient()
  const query = useQuery({ queryKey: walletsKey, queryFn: ({ signal }) => getWallets(signal) })
  const [draft, setDraft] = useState(blankWallet)
  const [editingId, setEditingId] = useState<string>()
  const [ensSuffix, setEnsSuffix] = useState('.eth')
  const [showForm, setShowForm] = useState(true)
  const [feedback, setFeedback] = useState('')
  const save = useMutation({ mutationFn: saveWallet, onSuccess: () => client.invalidateQueries({ queryKey: walletsKey }) })
  const remove = useMutation({ mutationFn: removeWallet, onSuccess: () => client.invalidateQueries({ queryKey: walletsKey }) })
  const wallets = query.data ?? []

  const startEdit = (wallet: CollectorWallet) => {
    setEditingId(wallet.id)
    setDraft({ ...wallet, ensName: wallet.ensName ?? '' })
    setShowForm(true)
    document.getElementById('wallet-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback('')
    if (!draft.network || !draft.type) { setFeedback('Selecione uma rede e uma carteira.'); return }
    try {
      const { network, type, ...fields } = draft
      await save.mutateAsync({ ...fields, network, type, id: editingId })
      setDraft(blankWallet); setEditingId(undefined); setShowForm(false); setFeedback('Carteira salva com sucesso.')
    } catch { setFeedback('Não foi possível salvar. Verifique os dados informados.') }
  }

  return <PageContainer id="main" className={accountLayoutClass}>
    <aside className="bg-card pt-2" aria-label="Navegação do perfil">
      <h1 className="mx-4 mb-2 mt-0 text-lg font-bold min-[761px]:mb-[14px]">Meu perfil</h1>
      <Link className={cn(sidebarLinkClass, 'border-l-[3px] border-transparent')} to="/profile"><CreditCard size={14} strokeWidth={1.5}/>Dados do perfil</Link>
      <a href="#wallet-list" className={cn(sidebarLinkClass, 'border-l-[3px] border-primary bg-primary/10')} aria-current="page"><MapPin size={14} strokeWidth={1.5}/>Carteiras</a>
      <span className="flex min-h-10 items-center gap-[11px] px-4 text-sm text-muted-foreground/70 max-[760px]:hidden"><Activity size={14} strokeWidth={1.5}/>Atividade</span>
      <Link className={cn(sidebarLinkClass, 'border-l-[3px] border-transparent')} to="/favorites"><Heart size={14} strokeWidth={1.5}/>Lista de interesse</Link>
      <div className="mt-2.5 border-t border-border max-[760px]:hidden"/>
      <p className="mx-4 my-3.5 text-xs leading-relaxed text-muted-foreground max-[760px]:hidden">Carteiras cadastradas podem ser usadas no pagamento e para receber seus NFTs.</p>
    </aside>
    <div className="min-w-0 pb-8">
      <section id="wallet-list" className="border-b border-border pb-6">
        <div className="flex items-start justify-between gap-2.5 min-[761px]:gap-5"><div><h2 className="mb-1.5 mt-0 text-lg font-bold">Carteira principal</h2><p className="m-0 text-xs text-muted-foreground">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p></div><Button variant="ghost" size="sm" className="shrink-0 gap-1 px-0 text-xs text-accent" type="button" onClick={() => { setDraft(blankWallet); setEditingId(undefined); setShowForm(true) }}><CirclePlus size={15}/> Adicionar</Button></div>
        {query.isPending ? <Skeleton className="mt-4 min-h-[120px] animate-pulse  "/> : query.isError ? <div className="mt-4 text-sm text-destructive" role="alert">Não foi possível carregar suas carteiras. <Button variant="ghost" className="h-auto min-h-0 p-0 text-sm underline" onClick={() => void query.refetch()}>Tentar novamente</Button></div> : wallets.length > 0 && <div className="mt-[18px] grid gap-3">{wallets.map((wallet) => <Card asChild className={cn('flex min-w-0 gap-3 rounded-none border border-border bg-card p-3 min-[761px]:p-4', wallet.isPrimary && 'border-l-[3px] border-l-primary')} key={wallet.id}><article>
          <div className="grid size-[34px] shrink-0 place-items-center rounded-full bg-secondary text-primary"><WalletCards size={18}/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="m-0 text-sm font-bold">{wallet.displayName}</h3>{wallet.isPrimary && <span className="inline-flex items-center gap-1 text-xs text-primary"><Check size={12}/> Principal</span>}</div><p className="mt-1 block text-xs text-muted-foreground">{wallet.alias} · {wallet.type}</p><code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-sm text-foreground">{wallet.address}</code><small className="mt-1 block text-xs text-muted-foreground">{wallet.network}{wallet.ensName ? ` · ${wallet.ensName}` : ''}</small></div><div className="flex items-start gap-2 max-[760px]:flex-col"><Button variant="outline" size="icon" className="size-9 min-h-9 rounded-none" type="button" aria-label={`Editar ${wallet.displayName}`} onClick={() => startEdit(wallet)}><Pencil size={15}/></Button><Button variant="outline" size="icon" className="size-9 min-h-9 rounded-none" type="button" aria-label={`Remover ${wallet.displayName}`} disabled={wallets.length === 1 || remove.isPending} onClick={() => { if (window.confirm(`Remover ${wallet.displayName}?`)) remove.mutate(wallet.id, { onError: () => setFeedback('Não foi possível remover esta carteira.') }) }}><Trash2 size={15}/></Button></div>
        </article></Card>)}</div>}
      </section>
      <section className="mt-[22px] border-b border-border pb-5"><div className="flex items-start justify-between gap-2.5 min-[761px]:gap-5"><div><h2 className="mb-1.5 mt-0 text-lg font-bold">Carteira secundária</h2><p className="m-0 text-xs text-muted-foreground">Tenha outra opção para receber seus NFTs.</p></div><Button variant="ghost" size="sm" className="shrink-0 gap-1 px-0 text-xs text-accent" type="button" onClick={() => { setDraft({ ...blankWallet, isPrimary: false }); setEditingId(undefined); setShowForm(true) }}><CirclePlus size={15}/> Adicionar</Button></div>{wallets.filter((wallet) => !wallet.isPrimary).length ? <p className="m-0 mt-2 text-sm text-muted-foreground">{wallets.filter((wallet) => !wallet.isPrimary).length} carteira(s) secundária(s) cadastrada(s).</p> : <p className="m-0 mt-2 text-sm text-muted-foreground">Você ainda não adicionou uma carteira secundária.</p>}</section>
      {showForm && <form id="wallet-form" className="mt-6 scroll-mt-5 border border-border bg-card/55 p-4" onSubmit={(event) => void submit(event)}>
        <div className="flex justify-between"><h2 className="mb-[18px] mt-0 text-lg font-bold">{editingId ? 'Editar carteira' : 'Adicionar carteira'}</h2><Button variant="ghost" size="sm" className="px-0 text-sm text-accent" type="button" onClick={() => { setShowForm(false); setEditingId(undefined) }}>Cancelar</Button></div>
        <div className="grid grid-cols-1 gap-3.5 min-[761px]:grid-cols-2 min-[761px]:gap-x-5 min-[761px]:gap-y-4">
          <Label className={fieldClass}><span>Nome de exibição <b>*</b></span><Input className={inputClass} value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} placeholder="Minha carteira" required/></Label>
          <Label className={fieldClass}><span>Apelido da carteira <b>*</b></span><Input className={inputClass} value={draft.alias} onChange={(event) => setDraft({ ...draft, alias: event.target.value })} placeholder="Carteira principal" required/></Label>
          <Label className={fieldClass}><span>Rede <b>*</b></span><Select className={selectClass} label="Rede da carteira" value={draft.network} options={[{ value: '', label: 'Selecione uma rede' }, { value: 'Ethereum', label: 'Ethereum' }, { value: 'Polygon', label: 'Polygon' }, { value: 'Solana', label: 'Solana' }]} onChange={(value) => setDraft({ ...draft, network: value as typeof draft.network })}/></Label>
          <Label className={fieldClass}><span>Nome do perfil <b>*</b></span><Input className={inputClass} value={draft.ensName} onChange={(event) => setDraft({ ...draft, ensName: event.target.value })} placeholder="colecionador.eth" required/></Label>
          <Label className={fieldClass}><span>Endereço da carteira <b>*</b></span><Input className={inputClass} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} placeholder="Endereço 0x da carteira" required minLength={8}/></Label>
          <Label className={fieldClass}><span>Tipo de carteira <b>*</b></span><Select className={selectClass} label="Tipo de carteira" value={draft.type} options={[{ value: '', label: 'Selecione uma carteira' }, { value: 'MetaMask', label: 'MetaMask' }, { value: 'WalletConnect', label: 'WalletConnect' }, { value: 'Coinbase Wallet', label: 'Coinbase Wallet' }]} onChange={(value) => setDraft({ ...draft, type: value as typeof draft.type })}/></Label>
          <Label className={fieldClass}><span>E-mail <b>*</b></span><Input className={inputClass} type="email" value={session.data?.user.email ?? ''} readOnly required/></Label>
          <Label className={fieldClass}><span>Nome ENS <b>*</b></span><div className="flex min-w-0 gap-2"><Select className="h-11 w-[76px] shrink-0 rounded-sm border-border bg-transparent px-2 text-sm" label="Extensão ENS" value={ensSuffix} options={[{ value: '.eth', label: '.eth' }, { value: '.xyz', label: '.xyz' }]} onChange={setEnsSuffix}/><Input className={cn(inputClass, 'min-w-0 flex-1')} value={draft.ensName} onChange={(event) => setDraft({ ...draft, ensName: event.target.value })} placeholder="seu-nome"/></div></Label>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Checkbox id="wallet-primary" checked={draft.isPrimary} onCheckedChange={(checked) => setDraft({ ...draft, isPrimary: checked === true })}/><Label htmlFor="wallet-primary">Definir como carteira principal</Label></div>
        <Button type="submit" className="mt-4 h-11 min-h-11 min-w-[140px] rounded-none text-sm uppercase" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Salvar carteira'}</Button>
      </form>}
      <p className="mt-3 min-h-[18px] text-xs text-accent" role="status" aria-live="polite">{feedback}</p>
    </div>
  </PageContainer>
}

export function WalletsPage() { return <RequireSession><WalletsContent/></RequireSession> }
