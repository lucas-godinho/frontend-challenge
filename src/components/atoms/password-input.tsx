import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from './input'
import { cn } from '@/lib/cn'

export function PasswordInput({ className, ...props }: Omit<InputProps, 'type'>) {
  const [visible, setVisible] = useState(false)
  return <span className={cn('password-input-wrap relative block', className)}>
    <Input {...props} className="pr-9" type={visible ? 'text' : 'password'}/>
    <button className="absolute right-0 top-0 grid h-full min-h-9 w-[34px] place-items-center border-0 bg-transparent text-muted-foreground" type="button" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setVisible((current) => !current)}>{visible ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
  </span>
}
