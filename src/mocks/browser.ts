import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

let realtimeStartup: Promise<void> | undefined

export function startRealtimeMocks(): Promise<void> {
  realtimeStartup ??= import('./realtime').then(({ realtimeHandlers }) => {
    worker.use(...realtimeHandlers)
  })
  return realtimeStartup
}
