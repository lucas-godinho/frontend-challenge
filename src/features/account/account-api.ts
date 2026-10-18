import { api } from '@/lib/api'
import { isAxiosError } from 'axios'
import type { Collector, CollectorProfile, CollectorWallet, SessionResponse } from '@/types/marketplace'

export async function getSession(signal?: AbortSignal): Promise<SessionResponse | null> {
  try {
    const response = await api.get<SessionResponse>('/session', { signal })
    return response.data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null
    throw error
  }
}

export async function login(email: string, password: string): Promise<SessionResponse> {
  const response = await api.post<SessionResponse>('/session', { email, password })
  return response.data
}

export async function register(input: { name: string; email: string; password: string }): Promise<SessionResponse> {
  const response = await api.post<SessionResponse>('/accounts', input)
  return response.data
}

export async function logout(): Promise<void> {
  await api.delete('/session')
}

export async function getProfile(signal?: AbortSignal): Promise<CollectorProfile> {
  const response = await api.get<CollectorProfile>('/profile', { signal })
  return response.data
}

export async function updateProfile(profile: CollectorProfile): Promise<CollectorProfile> {
  const response = await api.put<CollectorProfile>('/profile', profile)
  return response.data
}

export async function updatePassword(input: { currentPassword: string; password: string }): Promise<void> {
  await api.put('/profile/password', input)
}

export async function getWallets(signal?: AbortSignal): Promise<CollectorWallet[]> {
  const response = await api.get<CollectorWallet[]>('/wallets', { signal })
  return response.data
}

export async function saveWallet(wallet: Omit<CollectorWallet, 'id'> & { id?: string }): Promise<CollectorWallet> {
  const response = await api.post<CollectorWallet>('/wallets', wallet)
  return response.data
}

export async function removeWallet(walletId: string): Promise<void> {
  await api.delete(`/wallets/${encodeURIComponent(walletId)}`)
}

export type { Collector }
