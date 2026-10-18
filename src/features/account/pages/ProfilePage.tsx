import { PageContainer } from '@/components/organisms/PageContainer'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Activity, Bell, CircleHelp, Download, Heart, LogOut, MapPin, UserRound } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/cn'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { PasswordInput } from '@/components/atoms/password-input'
import { Select } from '@/components/molecules/select'
import { RequireSession } from '@/features/account/components/RequireSession'
import { useCollectorProfile, useSessionActions } from '@/features/account/use-session'
import type { CollectorProfile } from '@/types/marketplace'

const emptyProfile: CollectorProfile = { displayName: '', username: '', email: '', walletAlias: '', ensName: '' }

const accountLayoutClass = 'grid min-h-[78vh] grid-cols-1 items-start gap-[18px] pt-5 pb-[110px] max-[760px]:px-5 min-[761px]:grid-cols-[280px_minmax(0,1fr)] min-[761px]:gap-7 min-[761px]:pt-6 min-[761px]:pb-[90px]'
const sidebarLinkClass = 'flex min-h-11 items-center gap-[11px] px-4 text-sm text-primary transition-colors hover:bg-primary/10'
const fieldClass = 'grid min-w-0 gap-2 text-sm text-foreground [&_b]:text-accent'
const inputClass = 'h-11 min-h-11 rounded-sm border-border bg-transparent px-2.5 text-sm'
const buttonClass = 'h-11 min-h-11 min-w-[120px] rounded-none text-sm uppercase'

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return 'Não foi possível salvar. Revise os campos e tente novamente.'
}

function ProfileContent() {
  const query = useCollectorProfile()
  const actions = useSessionActions()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(emptyProfile)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [ensSuffix, setEnsSuffix] = useState('.eth')
  const [feedback, setFeedback] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => { if (query.data) setProfile(query.data) }, [query.data])
  if (query.isPending) return <PageContainer id="main" className={accountLayoutClass}><div className="min-h-[340px] animate-pulse rounded  "/></PageContainer>
  if (query.isError) return <PageContainer id="main" className="my-[55px] border border-border bg-card p-9 text-center"><h1>Não foi possível carregar seu perfil.</h1><Button className={buttonClass} onClick={() => void query.refetch()}>Tentar novamente</Button></PageContainer>

  const change = (field: keyof CollectorProfile, value: string) => setProfile((current) => ({ ...current, [field]: value }))
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback(''); setIsError(false)
    try { await actions.profile.mutateAsync(profile); setFeedback('Seus dados foram salvos.') }
    catch (error) { setIsError(true); setFeedback(errorMessage(error)) }
  }
  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback(''); setIsError(false)
    if (newPassword !== confirmPassword) { setIsError(true); setFeedback('A nova senha e a confirmação precisam ser iguais.'); return }
    try {
      await actions.password.mutateAsync({ currentPassword, password: newPassword })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setFeedback('Sua senha foi alterada.')
    } catch (error) { setIsError(true); setFeedback(errorMessage(error)) }
  }
  const pickAvatar = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setIsError(true); setFeedback('Escolha um arquivo de imagem.'); return }
    if (file.size > 2_000_000) { setIsError(true); setFeedback('A imagem deve ter no máximo 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => setProfile((current) => ({ ...current, avatarUrl: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  const navItems = [
    { label: 'Dados do perfil', icon: <UserRound size={14} strokeWidth={1.5}/>, to: '/profile', active: true },
    { label: 'Carteiras', icon: <MapPin size={14} strokeWidth={1.5}/>, to: '/wallets' },
    { label: 'Lista de interesse', icon: <Heart size={14} strokeWidth={1.5}/>, to: '/favorites' },
  ]

  return <PageContainer id="main" className={accountLayoutClass}>
    <aside className="bg-card pt-2" aria-label="Navegação do perfil">
      <h1 className="mx-4 mb-2 mt-0 text-lg font-bold min-[761px]:mb-[14px]">Meu perfil</h1>
      {navItems.map((item) => item.active
        ? <a key={item.label} href="#profile-data" className={cn(sidebarLinkClass, 'border-l-[3px] border-primary bg-primary/10')} aria-current="page">{item.icon}{item.label}</a>
        : <Link key={item.label} to={item.to} className={cn(sidebarLinkClass, 'border-l-[3px] border-transparent')}>{item.icon}{item.label}</Link>)}
      <span className="flex min-h-10 items-center gap-[11px] px-4 text-sm text-muted-foreground/70 max-[760px]:hidden"><Activity size={14} strokeWidth={1.5}/>Atividade</span>
      <span className="flex min-h-10 items-center gap-[11px] px-4 text-sm text-muted-foreground/70 max-[760px]:hidden"><Bell size={14} strokeWidth={1.5}/>Ofertas</span>
      <span className="flex min-h-10 items-center gap-[11px] px-4 text-sm text-muted-foreground/70 max-[760px]:hidden"><Download size={14} strokeWidth={1.5}/>Arquivos baixados</span>
      <span className="flex min-h-10 items-center gap-[11px] px-4 text-sm text-muted-foreground/70 max-[760px]:hidden"><CircleHelp size={14} strokeWidth={1.5}/>Suporte</span>
      <Button variant="ghost" className="h-11 w-full justify-start rounded-none border-t border-border px-4 text-sm text-primary" type="button" disabled={actions.logout.isPending} onClick={() => actions.logout.mutate(undefined, { onSuccess: () => void navigate({ to: '/' }) })}><LogOut size={14} strokeWidth={1.5}/>Sair</Button>
    </aside>
    <div className="min-w-0 pb-8">
      <form id="profile-data" className="" onSubmit={(event) => void saveProfile(event)}>
        <h2 className="mb-5 mt-0 text-lg font-bold">Perfil do colecionador</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 min-[761px]:grid-cols-2 min-[761px]:gap-y-5">
          <Label className={fieldClass}><span>Nome de exibição <b>*</b></span><Input className={inputClass} value={profile.displayName} onChange={(event) => change('displayName', event.target.value)} autoComplete="name" required minLength={2}/></Label>
          <Label className={fieldClass}><span>Nome de usuário <b>*</b></span><Input className={inputClass} value={profile.username} onChange={(event) => change('username', event.target.value)} autoComplete="nickname" required minLength={2}/></Label>
          <Label className={fieldClass}><span>E-mail <b>*</b></span><Input className={inputClass} type="email" value={profile.email} onChange={(event) => change('email', event.target.value)} autoComplete="email" required/></Label>
          <Label className={fieldClass}><span>Nome ENS <b>*</b></span><div className="flex min-w-0 gap-2"><Select className="h-11 w-[76px] shrink-0 rounded-sm border-border bg-transparent px-2 text-sm" label="Extensão ENS" value={ensSuffix} options={[{ value: '.eth', label: '.eth' }, { value: '.xyz', label: '.xyz' }, { value: '.art', label: '.art' }]} onChange={setEnsSuffix}/><Input className={cn(inputClass, 'min-w-0 flex-1')} value={profile.ensName} onChange={(event) => change('ensName', event.target.value)} placeholder="seu-nome"/></div></Label>
          <Label className={fieldClass}><span>Apelido da carteira <b>*</b></span><Input className={inputClass} value={profile.walletAlias} onChange={(event) => change('walletAlias', event.target.value)} placeholder="Minha carteira principal"/></Label>
          <fieldset className="m-0 min-w-0 border-0 p-0"><legend className="mb-2 text-sm">Avatar</legend><div className="flex items-center gap-3"><span className="grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-full bg-card text-primary">{profile.avatarUrl ? <img className="size-full object-cover" src={profile.avatarUrl} alt="Prévia do avatar"/> : <UserRound size={20}/>}</span><Label className="relative grid h-10 min-h-10 min-w-[66px] cursor-pointer place-items-center bg-primary px-3 text-xs font-bold uppercase text-primary-foreground">Alterar<input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" accept="image/*" onChange={(event) => pickAvatar(event.target.files?.[0])}/></Label><Button variant="ghost" size="sm" className="px-0 text-primary hover:text-accent" type="button" onClick={() => change('avatarUrl', '')}>Remover</Button></div></fieldset>
        </div>
        <Button type="submit" className={cn(buttonClass, 'mt-5')} disabled={actions.profile.isPending}>{actions.profile.isPending ? 'Salvando…' : 'Salvar dados'}</Button>
      </form>
      <form className="mt-7 max-w-[480px]" onSubmit={(event) => void savePassword(event)}>
        <h2 className="mb-5 mt-0 text-lg font-bold">Alterar senha</h2>
        <Label className={cn(fieldClass, 'mb-3.5')}>Senha atual<PasswordInput className="[&_input]:h-11 [&_input]:text-sm" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required/></Label>
        <Label className={cn(fieldClass, 'mb-3.5')}>Nova senha<PasswordInput className="[&_input]:h-11 [&_input]:text-sm" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required/></Label>
        <Label className={cn(fieldClass, 'mb-3.5')}>Confirmar nova senha<PasswordInput className="[&_input]:h-11 [&_input]:text-sm" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required/></Label>
        <Button type="submit" className={cn(buttonClass, 'mt-1')} disabled={actions.password.isPending}>{actions.password.isPending ? 'Salvando…' : 'Salvar senha'}</Button>
      </form>
      <p className={cn('mt-3 min-h-[18px] text-xs text-accent', isError && 'text-destructive')} role={isError ? 'alert' : 'status'} aria-live="polite">{feedback}</p>
    </div>
  </PageContainer>
}

export function ProfilePage() { return <RequireSession><ProfileContent/></RequireSession> }
