import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, KeyRound, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { PasswordInput } from '@/components/atoms/password-input'
import { Dialog } from '@/components/molecules/dialog'
import { useSessionActions } from '@/features/account/use-session'

const desktopQuery = '(min-width: 761px)'

type AuthMode = 'login' | 'register'

function safeReturnPath() {
  const requested = new URLSearchParams(window.location.search).get('returnTo')
  return requested?.startsWith('/') && !requested.startsWith('//') ? requested : null
}

function apiMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string; fields?: Record<string, string> } } }).response?.data
    if (data) return { message: data.message ?? 'Não foi possível concluir sua solicitação.', fields: data.fields ?? {} }
  }
  return { message: 'Falha de conexão. Tente novamente.', fields: {} as Record<string, string> }
}

export function AuthPage({ mode, presentation = 'page', returnTo: returnToProp, onClose, onModeChange }: {
  mode: AuthMode
  presentation?: 'page' | 'dialog'
  returnTo?: string | null
  onClose?: () => void
  onModeChange?: (mode: AuthMode) => void
}) {
  const actions = useSessionActions()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const isRegister = mode === 'register'
  const pending = isRegister ? actions.register.isPending : actions.login.isPending
  const returnTo = returnToProp ?? safeReturnPath()
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia(desktopQuery).matches)
  const isDialog = presentation === 'dialog'
  const closeDialog = useCallback(() => {
    if (onClose) { onClose(); return }
    void navigate({ to: returnTo ?? '/', replace: true })
  }, [navigate, onClose, returnTo])

  useEffect(() => {
    const media = window.matchMedia(desktopQuery)
    const update = () => setIsDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isDialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [isDialog])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setFieldErrors({})
    if (isRegister && password !== confirmation) {
      setFieldErrors({ confirmation: 'As senhas não coincidem.' })
      return
    }
    try {
      if (isRegister) await actions.register.mutateAsync({ name, email, password })
      else await actions.login.mutateAsync({ email, password })
      if (isDialog && onClose) onClose()
      void navigate({ to: returnTo ?? '/profile', replace: true })
    } catch (error) {
      const result = apiMessage(error)
      setMessage(result.message)
      setFieldErrors(result.fields)
    }
  }

  if (presentation === 'page' && isDesktop) return <main id="main" className="min-h-px" aria-live="polite" />

  const content = <main id="main" className={cn(
    'grid min-h-svh place-items-center bg-background px-6 py-11',
    isDialog && 'fixed inset-0 z-[10000] min-h-dvh bg-transparent p-6 max-[760px]:hidden',
  )}>
    {isDialog && <button className="absolute inset-0 size-full cursor-default border-0 bg-black/75 backdrop-blur-[2px]" type="button" aria-label="Fechar autenticação" onClick={closeDialog}/>}
    <Dialog className={cn(
      'relative w-full max-w-[420px] bg-transparent p-0 shadow-none',
      isDialog && 'z-[1] max-h-[calc(100dvh-48px)] overflow-y-auto border border-border bg-card px-6 py-7 shadow-[0_20px_60px_rgb(0_0_0_/_48%)] min-[761px]:px-10',
    )} labelledBy="auth-title" onClose={closeDialog} modal={isDialog}>
      {isDialog && <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 size-9 text-primary" type="button" aria-label="Fechar janela de autenticação" onClick={closeDialog}><X size={17}/></Button>}
      <div className={cn('mb-16 text-center text-2xl font-bold tracking-[.14em] text-foreground', isDialog && 'mb-6 text-xl') } aria-hidden="true">KURIO</div>
      <h1 id="auth-title" className={cn('mb-7 flex items-center justify-center gap-1.5 text-base font-bold', isDialog && 'mb-4 text-base font-normal')}>
        <Button variant="ghost" className={cn('h-auto min-h-0 rounded-none px-0 py-0 text-base font-bold', isDialog && 'text-sm font-normal', !isRegister && 'text-primary')} type="button" aria-pressed={!isRegister} onClick={() => { if (isRegister) { if (onModeChange) onModeChange('login'); else void navigate({ to: '/login', search: returnTo ? { returnTo } : {} }) } }}>Entrar</Button>
        {isDialog && <span className="text-muted-foreground">|</span>}
        {isDialog && <Button variant="ghost" className={cn('h-auto min-h-0 rounded-none px-0 py-0 text-sm font-normal', isRegister && 'text-primary')} type="button" aria-pressed={isRegister} onClick={() => { if (!isRegister) { if (onModeChange) onModeChange('register'); else void navigate({ to: '/register', search: returnTo ? { returnTo } : {} }) } }}>Criar conta</Button>}
      </h1>
      {isDialog && <p className="mx-auto mb-5 mt-0 max-w-[300px] text-center text-sm leading-relaxed text-muted-foreground">{isRegister ? 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.' : 'Entre para gerenciar sua carteira, coleção e perfil de criador.'}</p>}
      {message && <p className="mb-4 border border-destructive/45 bg-destructive/10 px-3 py-2.5 text-sm text-[#ffb4a4]" role="alert">{message}</p>}
      <form className="grid gap-2.5" onSubmit={(event) => void submit(event)} noValidate>
        {isRegister && <Label className="grid gap-0 text-foreground [&_b]:text-accent [&_small]:mt-1 [&_small]:text-xs [&_small]:font-normal [&_small]:text-destructive" htmlFor="account-name"><span className="sr-only">Nome de usuário</span><Input className="h-11 rounded-md border-[#472a1f] bg-transparent px-3 text-sm placeholder:text-muted-foreground" id="account-name" name="name" autoComplete="name" placeholder="Nome de usuário" value={name} onInput={(event) => setName(event.currentTarget.value)} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'name-error' : undefined} required minLength={2}/>{fieldErrors.name && <small id="name-error">{fieldErrors.name}</small>}</Label>}
        <Label className="grid gap-0 text-foreground [&_b]:text-accent [&_small]:mt-1 [&_small]:text-xs [&_small]:font-normal [&_small]:text-destructive" htmlFor="account-email"><span className="sr-only">E-mail</span><Input className="h-11 rounded-md border-[#472a1f] bg-transparent px-3 text-sm placeholder:text-muted-foreground" id="account-email" name="email" type="email" autoComplete="email" placeholder="Digite seu e-mail" value={email} onInput={(event) => setEmail(event.currentTarget.value)} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} required/>{fieldErrors.email && <small id="email-error">{fieldErrors.email}</small>}</Label>
        <Label className="grid gap-0 text-foreground [&_b]:text-accent [&_small]:mt-1 [&_small]:text-xs [&_small]:font-normal [&_small]:text-destructive" htmlFor="account-password"><span className="sr-only">Senha</span><PasswordInput className="[&_input]:h-11 [&_input]:rounded-md [&_input]:border-[#472a1f] [&_input]:bg-transparent [&_input]:px-3 [&_input]:text-sm [&_input]:placeholder:text-muted-foreground" id="account-password" name="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Senha" value={password} onInput={(event) => setPassword(event.currentTarget.value)} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'} required minLength={8}/>{fieldErrors.password ? <small id="password-error">{fieldErrors.password}</small> : isRegister && <small id="password-hint">Use pelo menos 8 caracteres.</small>}</Label>
        {isRegister && <Label className="grid gap-0 text-foreground [&_b]:text-accent [&_small]:mt-1 [&_small]:text-xs [&_small]:font-normal [&_small]:text-destructive" htmlFor="account-confirmation"><span className="sr-only">Confirmar senha</span><PasswordInput className="[&_input]:h-11 [&_input]:rounded-md [&_input]:border-[#472a1f] [&_input]:bg-transparent [&_input]:px-3 [&_input]:text-sm [&_input]:placeholder:text-muted-foreground" id="account-confirmation" name="confirmation" autoComplete="new-password" placeholder="Confirmar senha" value={confirmation} onInput={(event) => setConfirmation(event.currentTarget.value)} aria-invalid={Boolean(fieldErrors.confirmation)} aria-describedby={fieldErrors.confirmation ? 'confirmation-error' : undefined} required/>{fieldErrors.confirmation && <small id="confirmation-error">{fieldErrors.confirmation}</small>}</Label>}
        {!isRegister && <Button variant="ghost" className="-mt-1 ml-auto h-auto min-h-0 px-0 py-0 text-right text-xs font-normal text-primary" type="button" onClick={() => setMessage('Para redefinir a senha, entre em contato com o suporte da Kurio.')}>Esqueceu a senha?</Button>}
        <Button className="mt-5 h-12 w-full justify-center rounded-none text-sm uppercase" type="submit" disabled={pending}>{pending ? 'Aguarde…' : isRegister ? 'Criar minha conta' : 'Entrar'}<ArrowRight size={16}/></Button>
      </form>
      {!isRegister && !isDialog && <aside className="mt-5 flex items-start gap-2.5 border border-border p-3 text-xs leading-relaxed text-muted-foreground" aria-label="Credenciais de demonstração"><KeyRound size={14} className="shrink-0 text-primary"/><span><strong className="text-foreground">ana@kurio.test</strong> · <strong className="text-foreground">Kurio123!</strong></span></aside>}
      <div className="my-7 flex items-center gap-2.5 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">Ou continue com</div>
      <div className="grid gap-2"><Button variant="outline" className="h-11 rounded border-border text-sm text-muted-foreground hover:bg-primary/10" type="button" onClick={() => setMessage('A autenticação social estará disponível na integração final.')}><b className="font-sans text-base text-[#4285f4]">G</b>Continuar com Google</Button><Button variant="outline" className="h-11 rounded border-border text-sm text-muted-foreground hover:bg-primary/10" type="button" onClick={() => setMessage('A autenticação social estará disponível na integração final.')}><b className="font-sans text-base text-[#1877f2]">f</b>Continuar com Facebook</Button></div>
      <p className="mt-9 text-center text-sm text-muted-foreground">{isRegister ? 'Já tem uma conta?' : 'Novo na Kurio?'}{' '}{isRegister
        ? onModeChange ? <Button variant="ghost" className="ml-1 h-auto min-h-0 px-0 py-0 text-sm text-primary underline underline-offset-[3px]" type="button" onClick={() => onModeChange('login')}>Entre</Button> : <Link className="ml-1 text-primary underline underline-offset-[3px]" to="/login" search={returnTo ? { returnTo } : {}}>Entre</Link>
        : onModeChange ? <Button variant="ghost" className="ml-1 h-auto min-h-0 px-0 py-0 text-sm text-primary underline underline-offset-[3px]" type="button" onClick={() => onModeChange('register')}>Crie uma conta</Button> : <Link className="ml-1 text-primary underline underline-offset-[3px]" to="/register" search={returnTo ? { returnTo } : {}}>Crie uma conta</Link>}</p>
    </Dialog>
  </main>
  return isDialog ? createPortal(content, document.body) : content
}
