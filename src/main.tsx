import { setMocksStartup } from './lib/mock-startup'
import './styles.css'

const mocksEnabled = import.meta.env.VITE_MOCKS === 'true'
  || ((import.meta.env.DEV || import.meta.env.MODE === 'demo') && import.meta.env.VITE_MOCKS !== 'false')

if (mocksEnabled) {
  const mocksStartup = import('./mocks/browser')
    .then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass', quiet: !import.meta.env.DEV }))
    .catch((error: unknown) => {
      console.error('[MSW] Could not start browser mocks.', error)
    })
  setMocksStartup(mocksStartup, async () => {
    const { startRealtimeMocks } = await import('./mocks/browser')
    await startRealtimeMocks()
  })
}

// Fetch the UI and the network mock runtime concurrently. REST requests still
// wait for the worker, while the shell can render without waiting for MSW.
void import('./app').then(({ mountApp }) => mountApp())
