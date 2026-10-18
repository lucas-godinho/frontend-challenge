import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { getProfile, getSession, login, logout, register, updatePassword, updateProfile } from './account-api'
import type { CollectorProfile, SessionResponse } from '@/types/marketplace'

export const sessionKey = ['session'] as const
export const profileKey = ['profile'] as const

function clearPrivateCache(queryClient: QueryClient) {
  queryClient.removeQueries({ predicate: (query) => ['favorites', 'profile', 'wallets', 'orders'].includes(String(query.queryKey[0])) })
}

export function useSession() {
  return useQuery({ queryKey: sessionKey, queryFn: ({ signal }) => getSession(signal), retry: false, staleTime: 60_000, refetchOnWindowFocus: false })
}

export function useSessionActions() {
  const queryClient = useQueryClient()
  const acceptSession = (session: SessionResponse) => {
    const previous = queryClient.getQueryData<SessionResponse>(sessionKey)
    if (previous?.user.id !== session.user.id) clearPrivateCache(queryClient)
    queryClient.setQueryData(sessionKey, session)
    void queryClient.invalidateQueries({ queryKey: ['cart'] })
    window.dispatchEvent(new CustomEvent('kurio:session-change'))
  }
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: acceptSession,
  })
  const registerMutation = useMutation({ mutationFn: register, onSuccess: acceptSession })
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearPrivateCache(queryClient)
      queryClient.removeQueries({ queryKey: sessionKey })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      window.dispatchEvent(new CustomEvent('kurio:session-change'))
    },
  })
  const profile = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey, data)
      const session = queryClient.getQueryData<SessionResponse>(sessionKey)
      if (session) queryClient.setQueryData(sessionKey, { ...session, user: { ...session.user, name: data.displayName, email: data.email } })
    },
  })
  const password = useMutation({ mutationFn: updatePassword })
  return { login: loginMutation, register: registerMutation, logout: logoutMutation, profile, password }
}

export function useCollectorProfile() {
  return useQuery({ queryKey: profileKey, queryFn: ({ signal }) => getProfile(signal), retry: false })
}

export type { CollectorProfile }
