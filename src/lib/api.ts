import axios from 'axios'
import { waitForMocks } from './mock-startup'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
)

api.interceptors.request.use(async (config) => {
  await waitForMocks()
  return config
})
